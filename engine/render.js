const Render = {
    root: null,

    clear() {
        if (this.root) this.root.innerHTML = '';
    },

    titleScreen(onStart) {
        this.clear();
        this.root.innerHTML = `
            <div class="screen">
                <h1>July Revolution</h1>
                <p class="text-content" style="text-align: center;">An interactive fiction exploring the micro-histories of the July Revolution.</p>
                <button id="start-btn">Begin Journey</button>
            </div>
        `;
        document.getElementById('start-btn').onclick = onStart;
    },

    introScreen(node, onNext) {
        this.clear();
        this.root.innerHTML = `
            <div class="screen">
                <h2>Introduction</h2>
                <div class="text-content">${node ? node.text : 'Error loading intro.'}</div>
                <button id="next-btn">Continue</button>
            </div>
        `;
        document.getElementById('next-btn').onclick = onNext;
    },

    characterSelectScreen(onSelect) {
        this.clear();
        this.root.innerHTML = `
            <div class="screen">
                <h2>Select Character</h2>
                <div class="character-grid">
                    <div class="character-card" data-char="doctor">Doctor</div>
                    <div class="character-card" data-char="student">Student</div>
                    <div class="character-card" data-char="rickshaw">Rickshaw Puller</div>
                </div>
            </div>
        `;
        document.querySelectorAll('.character-card').forEach(el => {
            el.onclick = () => onSelect(el.dataset.char);
        });
    },

    characterIntroScreen(node, onNext) {
        this.clear();
        this.root.innerHTML = `
            <div class="screen">
                <h2>${(node && node.character) ? node.character.toUpperCase() : 'CHARACTER'}</h2>
                <div class="text-content">${node ? node.text : 'Error loading character intro.'}</div>
                <button id="next-btn">Begin Phase 1</button>
            </div>
        `;
        document.getElementById('next-btn').onclick = onNext;
    },

    phaseScreen(node, onChoice) {
        this.clear();
        
        const imgHtml = (node && node.image) ? `<img src="${node.image}" class="phase-image" alt="Phase Image">` : '';
        const choicesHtml = (node && node.choices) ? node.choices.map((c, idx) => `
            <button data-idx="${idx}">${c.label}</button>
        `).join('') : '';

        this.root.innerHTML = `
            <div class="screen">
                <h2>Phase ${node ? node.phase : '?'}</h2>
                ${imgHtml}
                <div class="text-content">${node ? node.text : 'Error loading phase.'}</div>
                <div class="choices-container">
                    ${choicesHtml}
                </div>
            </div>
        `;
        
        document.querySelectorAll('.choices-container button').forEach(btn => {
            btn.onclick = () => {
                const choice = node.choices[btn.dataset.idx];
                onChoice(choice);
            };
        });
    },

    endingScreen(node, onNext) {
        this.clear();
        this.root.innerHTML = `
            <div class="screen">
                <h2>Ending</h2>
                <div class="text-content">${node ? node.text : 'Error loading ending.'}</div>
                <button id="next-btn">View Epilogue</button>
            </div>
        `;
        document.getElementById('next-btn').onclick = onNext;
    },

    epilogueScreen(node, onRestart) {
        this.clear();
        const factsHtml = (node && node.facts) ? node.facts.map(f => `<li>${f}</li>`).join('') : '';
        const sourcesHtml = (node && node.sources) ? node.sources.map(s => `<li>${s}</li>`).join('') : '';
        const dedicationHtml = (node && node.dedication) ? `<p><em>${node.dedication}</em></p>` : '';
        
        this.root.innerHTML = `
            <div class="screen">
                <h2>Epilogue</h2>
                <div class="text-content">
                    <h3>Historical Notes</h3>
                    <ul>${factsHtml}</ul>
                    <br>
                    <h3>Sources</h3>
                    <ul>${sourcesHtml}</ul>
                    <br>
                    ${dedicationHtml}
                </div>
                <button id="restart-btn">Play Again</button>
            </div>
        `;
        document.getElementById('restart-btn').onclick = onRestart;
    }
};
