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
        
        const imgHtml = (node && node.image) ? `<img src="${node.image}" class="scene-image" alt="Phase Image">` : '';
        const choicesHtml = (node && node.choices) ? node.choices.map((c, idx) => `
            <button data-idx="${idx}">${c.label}</button>
        `).join('') : '';

        const char = typeof AppState !== 'undefined' && AppState.character ? AppState.character : 'character';
        const charName = char.charAt(0).toUpperCase() + char.slice(1);
        const phase = typeof AppState !== 'undefined' && AppState.phase ? AppState.phase : 1;
        const dateStr = (14 + phase) + " July 2024";
        let locationStr = "Dhaka, Bangladesh";
        if (char === 'doctor') locationStr = "Dhaka Medical College";
        if (char === 'student') locationStr = "Dhaka University Campus";
        if (char === 'rickshaw') locationStr = "Mirpur Road";

        this.root.innerHTML = `
            <div class="screen scene-layout">
                ${imgHtml}
                <div class="scene-header">
                    <h2 class="character-name">${charName}</h2>
                    <div class="scene-meta">📍 ${locationStr} • ${dateStr}</div>
                </div>
                <div class="narration">${node ? node.text : 'Error loading phase.'}</div>
                <hr class="scene-divider">
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

    consequenceScreen(consequence, onContinue) {
        this.clear();
        
        const imgHtml = (consequence && consequence.image) ? `<img src="${consequence.image}" class="scene-image" alt="Consequence Image">` : '';
        const textHtml = (consequence && consequence.text) ? consequence.text : 'Error loading consequence.';

        const char = typeof AppState !== 'undefined' && AppState.character ? AppState.character : 'character';
        const charName = char.charAt(0).toUpperCase() + char.slice(1);
        const phase = typeof AppState !== 'undefined' && AppState.phase ? AppState.phase : 1;
        const dateStr = (14 + phase) + " July 2024";
        let locationStr = "Dhaka, Bangladesh";
        if (char === 'doctor') locationStr = "Dhaka Medical College";
        if (char === 'student') locationStr = "Dhaka University Campus";
        if (char === 'rickshaw') locationStr = "Mirpur Road";

        this.root.innerHTML = `
            <div class="screen scene-layout consequence-layout">
                ${imgHtml}
                <div class="scene-header">
                    <h2 class="character-name">${charName}</h2>
                    <div class="scene-meta">📍 ${locationStr} • ${dateStr}</div>
                </div>
                <div class="narration">${textHtml}</div>
                <hr class="scene-divider">
                <div class="choices-container">
                    <button id="continue-btn">Continue</button>
                </div>
            </div>
        `;
        
        document.getElementById('continue-btn').onclick = onContinue;
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
