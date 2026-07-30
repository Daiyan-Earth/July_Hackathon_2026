// scripts/apply-images.js
// After you've generated all images and saved them into assets/images/
// with the exact filenames from image-manifest.json, run this to wire
// the "image" and "consequence_image" fields automatically.
// Run from project root: node scripts/apply-images.js

const fs = require('fs');
const path = require('path');

const CHARACTERS = ['doctor', 'student', 'rickshaw'];
const DATA_DIR = path.join(__dirname, '..', 'data');
const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'images');

let found = 0;
let missing = [];

for (const character of CHARACTERS) {
    const filePath = path.join(DATA_DIR, `${character}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const node of data) {
        if (node.type !== 'phase') continue;

        const phaseFile = `${character}_phase${node.phase}.png`;
        const phasePath = path.join(ASSETS_DIR, phaseFile);
        if (fs.existsSync(phasePath)) {
            node.image = `assets/images/${phaseFile}`;
            found++;
        } else {
            missing.push(phaseFile);
        }

        node.choices.forEach((choice, idx) => {
            const cFile = `${character}_phase${node.phase}_choice${idx + 1}.png`;
            const cPath = path.join(ASSETS_DIR, cFile);
            if (fs.existsSync(cPath)) {
                choice.consequence_image = `assets/images/${cFile}`;
                found++;
            } else {
                missing.push(cFile);
            }
        });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

console.log(`Wired ${found} image paths into data/*.json.`);
if (missing.length) {
    console.log(`\n${missing.length} images NOT found in assets/images/ (still showing fallback):`);
    missing.forEach(m => console.log(`  - ${m}`));
} else {
    console.log(`All expected images found. Nothing missing.`);
}
