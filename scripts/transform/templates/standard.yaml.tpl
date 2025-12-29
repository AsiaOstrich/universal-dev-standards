# AI-Optimized Standard Template
# Generated from: {{source}}

id: {{id}}
meta:
  version: "{{version}}"
  updated: "{{updated}}"
  source: {{source}}
  description: {{description}}

{{#if decision}}
decision:
  question: "{{decision.question}}"
  matrix:
{{#each decision.matrix}}
    - answer: "{{answer}}"
      select: {{select}}
{{/each}}
{{/if}}

{{#if options}}
options:
{{#each options}}
  {{@key}}:
    default: {{default}}
    choices:
{{#each choices}}
      - id: {{id}}
        file: {{file}}
{{/each}}
{{/each}}
{{/if}}

rules:
{{#each rules}}
  - id: {{id}}
    trigger: {{trigger}}
    instruction: {{instruction}}
    priority: {{priority}}
{{#if examples}}
    examples:
{{#if examples.good}}
      good:
{{#each examples.good}}
        - "{{.}}"
{{/each}}
{{/if}}
{{#if examples.bad}}
      bad:
{{#each examples.bad}}
        - "{{.}}"
{{/each}}
{{/if}}
{{/if}}
{{/each}}

{{#if quick_reference}}
quick_reference:
{{#each quick_reference}}
  {{@key}}:
    columns: [{{#each columns}}"{{.}}"{{#unless @last}}, {{/unless}}{{/each}}]
    rows:
{{#each rows}}
      - [{{#each .}}"{{.}}"{{#unless @last}}, {{/unless}}{{/each}}]
{{/each}}
{{/each}}
{{/if}}
