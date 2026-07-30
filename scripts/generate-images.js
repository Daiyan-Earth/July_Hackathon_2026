// scripts/generate-images.js
// Reads image-manifest.json (from extract-prompts.js) and generates every
// image via the Gemini API, saving into assets/images/ with the correct
// filenames. Resumable: skips any file that already exists, so you can
// safely re-run after a failure or rate limit.
//
// Setup:
//   $env:GEMINI_API_KEY = "your-key-here"   (PowerShell)
// Run:
//   node scripts/generate-images.js

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash-image'; // base Nano Banana, cheapest tier
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const MANIFEST_PATH = path.join(__dirname, '..', 'image-manifest.json');
const OUT_DIR = path.join(__dirname, '..', 'assets', 'images');
const DELAY_MS = 3000; // pause between requests, avoid rate-limit errors

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateOne(prompt) {
    const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(p => p.inlineData);

    if (!imagePart) {
        throw new Error('No image data in response: ' + JSON.stringify(data).slice(0, 300));
    }

    return Buffer.from(imagePart.inlineData.data, 'base64');
}

async function main() {
    if (!API_KEY) {
        console.error('ERROR: GEMINI_API_KEY environment variable is not set.');
        process.exit(1);
    }

    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error('ERROR: image-manifest.json not found. Run extract-prompts.js first.');
        process.exit(1);
    }

    if (!fs.existsSync(OUT_DIR)) {
        fs.mkdirSync(OUT_DIR, { recursive: true });
    }

    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

    let done = 0, skipped = 0, failed = [];

    for (const item of manifest) {
        const outPath = path.join(OUT_DIR, item.filename);

        if (fs.existsSync(outPath)) {
            console.log(`SKIP (already exists): ${item.filename}`);
            skipped++;
            continue;
        }

        try {
            console.log(`Generating: ${item.filename} ...`);
            const imageBuffer = await generateOne(item.prompt);
            fs.writeFileSync(outPath, imageBuffer);
            console.log(`  saved.`);
            done++;
        } catch (err) {
            console.error(`  FAILED: ${item.filename} — ${err.message}`);
            failed.push(item.filename);
        }

        await sleep(DELAY_MS);
    }

    console.log(`\n--- Done ---`);
    console.log(`Generated: ${done}`);
    console.log(`Skipped (already existed): ${skipped}`);
    console.log(`Failed: ${failed.length}`);
    if (failed.length) {
        console.log(`Failed files (re-run this script to retry just these):`);
        failed.forEach(f => console.log(`  - ${f}`));
    }
    console.log(`\nNext step: node scripts/apply-images.js`);
}

main();
