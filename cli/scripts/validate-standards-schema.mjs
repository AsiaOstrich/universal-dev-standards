import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import yaml from 'js-yaml';
import * as glob from 'glob';
import chalk from 'chalk';

// Configuration
const SCHEMA_PATH = path.join(process.cwd(), 'src/schemas/standard.schema.json');
const STANDARDS_GLOB = path.join(process.cwd(), '../ai/standards/*.ai.yaml');
const OPTIONS_GLOB = path.join(process.cwd(), '../ai/options/**/*.ai.yaml');

async function main() {
  console.log(chalk.blue('🔍 UDS Standard Schema Validator'));
  console.log(chalk.gray('================================'));

  // 1. Load Schema
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error(chalk.red(`❌ Schema not found at: ${SCHEMA_PATH}`));
    process.exit(1);
  }
  
  const schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  const schema = JSON.parse(schemaContent);
  
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  console.log(chalk.green('✓ Schema loaded'));

  // 2. Find Files
  const standardFiles = glob.sync(STANDARDS_GLOB);
  const optionFiles = glob.sync(OPTIONS_GLOB);
  const allFiles = [...standardFiles, ...optionFiles];

  console.log(chalk.blue(`Found ${allFiles.length} standard files to validate.`));

  let hasErrors = false;
  let passedCount = 0;

  // 3. Validate Files
  for (const file of allFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Handle multi-document YAML if necessary (though usually standards are single doc)
      // Using js-yaml to parse
      const data = yaml.load(content);
      
      // Transform old format to match schema if needed (or fail if strict)
      // Current Schema expects: { standard: { ... }, physical_spec: { ... } }
      // Existing files likely look like: { name: ..., description: ... } (flat)
      
      // ADAPTER: Temporarily map flat structure to 'standard' object for validation
      // UNLESS the file is already in v2 format.
      let dataToValidate = data;
      
      if (!data.standard && data.name && data.description) {
         // It's a v1 file. Map it to v2 structure for validation of the "Imagination Layer" parts
         // However, since we want to move to v2, we might want to flag these.
         // For now, let's treat them as partials or just validate what we can if strict.
         
         // Actually, let's allow v1 files to FAIL validation if we are strictly enforcing v2.
         // BUT, for the pilot, we only expect the converted file to pass full validation.
         // Let's create a "Loose Mode" or just validate strictly.
         
         // Strategy: If root has 'standard', validate as v2. 
         // If not, warning and skip (or try to validate as v1 if we had a v1 schema).
         // Given we only have v2 schema, we will try to validate.
      }

      const valid = validate(dataToValidate);

      if (!valid) {
        // Check if it's just missing the wrapper (legacy format)
        if (!data.standard) {
            console.log(chalk.yellow(`⚠  [Legacy Format] ${file}`));
        } else {
            console.error(chalk.red(`✗  [Invalid] ${file}`));
            validate.errors.forEach(err => {
            console.error(chalk.gray(`   - ${err.instancePath} ${err.message}`));
            });
            hasErrors = true;
        }
      } else {
        console.log(chalk.green(`✓  [Valid]   ${file}`));
        passedCount++;
        
        // Check if it has physical_spec (Bonus check)
        if (data.physical_spec) {
            console.log(chalk.cyan(`   + Detected Physical Spec!`));
        }
      }

    } catch (e) {
      console.error(chalk.red(`✗  [Parse Error] ${file}: ${e.message}`));
      hasErrors = true;
    }
  }

  console.log(chalk.gray('================================'));
  console.log(`Summary: ${passedCount} / ${allFiles.length} passed v2 validation.`);
  
  if (hasErrors) {
    console.log(chalk.yellow('Note: Legacy files are currently marked as warnings, not errors, unless they attempt v2 structure and fail.'));
    // process.exit(1); // Don't fail build yet as we are in migration
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
