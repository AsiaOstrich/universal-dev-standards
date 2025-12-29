# AI-Optimized Option Template
# Parent: {{parent}}

id: {{id}}
meta:
  parent: {{parent}}
  version: "{{version}}"
  description: {{description}}

{{#if best_for}}
best_for:
{{#each best_for}}
  - {{.}}
{{/each}}
{{/if}}

{{#if branches}}
branches:
{{#each branches}}
  - name: "{{name}}"
    purpose: {{purpose}}
{{#if base}}
    base: {{base}}
{{/if}}
{{#if merge_to}}
    merge_to: {{merge_to}}
{{/if}}
{{#if lifetime}}
    lifetime: {{lifetime}}
{{/if}}
{{/each}}
{{/if}}

rules:
{{#each rules}}
  - id: {{id}}
    trigger: {{trigger}}
    instruction: {{instruction}}
{{#if validator}}
    validator: "{{validator}}"
{{/if}}
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

{{#if workflow}}
workflow:
{{#each workflow}}
  - step: {{step}}
{{#if commands}}
    commands:
{{#each commands}}
      - "{{.}}"
{{/each}}
{{/if}}
{{#if note}}
    note: {{note}}
{{/if}}
{{/each}}
{{/if}}
