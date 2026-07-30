# July Revolution Interactive Fiction

## Overview
A browser-based interactive fiction web app exploring the perspectives of different individuals during the events of the July Revolution.

## Track
Track B — Spirit of July, July Hackathon 2026

## Problem & Solution
People often understand historical events as a monolith. This project allows users to explore the micro-histories and personal costs of the July Revolution through the eyes of a doctor, a student, and a rickshaw puller.

## How to Run
1. Clone the repo
2. Open index.html in a browser, or run a local server:
   `npx serve .` (or equivalent)
3. No build step required

## Project Structure
- `/engine`: Core application logic (state machine, renderer, JSON loader).
- `/data`: JSON files containing the narrative content and structure for characters, intro, and epilogue.
- `/assets`: Images and media resources.

## Content Model
The game uses a strict JSON schema for narratives. Each character has an `intro`, 4 `phase` nodes, and 3 `ending` nodes depending on accumulated state (`risk`, `helped`). This decoupled architecture allows easy addition of new characters or adaptation for other historical events simply by providing new JSON files.

## Tech Stack & AI Tools Used
- HTML/CSS/JS (Vanilla, zero-dependencies)
- Antigravity: Gemini 3.1 Pro (High) - Code architecture and generation
- AI Image Tool - Asset generation

## Sources
Historical references to be added in Epilogue.

## License
MIT

## Team
- Daiyan Khandaker