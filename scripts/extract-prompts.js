// scripts/extract-prompts.js
// Reads data/{character}.json files and prints a manifest of every image
// that needs generating, with the exact filename it must be saved as.
// Run from project root: node scripts/extract-prompts.js

const fs = require('fs');
const path = require('path');

const CHARACTERS = ['doctor', 'student', 'rickshaw'];
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUT_FILE = path.join(__dirname, '..', 'image-manifest.json');

let manifest = [];

for (const character of CHARACTERS) {
    const filePath = path.join(DATA_DIR, `${character}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const node of data) {
        if (node.type !== 'phase') continue;

        // Phase base image
        if (node.image_prompt) {
            manifest.push({
                character,
                phase: node.phase,
                kind: 'phase',
                filename: `${character}_phase${node.phase}.png`,
                prompt: node.image_prompt
            });
        }

        // Consequence images (one per choice)
        node.choices.forEach((choice, idx) => {
            if (choice.consequence_image_prompt) {
                manifest.push({
                    character,
                    phase: node.phase,
                    kind: 'consequence',
                    choiceIndex: idx,
                    filename: `${character}_phase${node.phase}_choice${idx + 1}.png`,
                    prompt: choice.consequence_image_prompt
                });
            }
        });
    }
}

fs.writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2));

console.log(`Extracted ${manifest.length} image prompts.`);
console.log(`Manifest written to: ${OUT_FILE}`);
console.log(`\nGenerate each image in Gemini/Nano Banana using its "prompt" field,`);
console.log(`then save it as exactly its "filename" into assets/images/\n`);

// Also print a quick human-readable checklist
manifest.forEach(m => console.log(`[ ] ${m.filename}`));
