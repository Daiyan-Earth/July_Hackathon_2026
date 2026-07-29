const Render = {
    root: null,

    clear() {
        if (this.root) this.root.innerHTML = '';
    },

    titleScreen(onStart) {
        this.clear();
        this.root.innerHTML = `
            <div class="screen title-screen">
                <div class="title-screen-bg"></div>
                <div class="content-wrapper">
                    <h1 class="main-title">JULY REVOLUTION</h1>
                    <p class="subtitle">An Interactive Historical Fiction Experience</p>
                    <button id="start-btn" class="btn-primary">Begin Journey</button>
                </div>
            </div>
        `;
        document.getElementById('start-btn').onclick = onStart;
    },

    introScreen(node, onNext) {
        this.clear();
        const text = node ? node.text : 'Error loading intro.';
        this.root.innerHTML = `
            <div class="screen">
                <div class="scene-image-container">
                    <div class="image-fallback">Introduction</div>
                </div>
                <div class="dialogue-panel">
                    <h2 class="character-name-display">PROLOGUE</h2>
                    <div class="metadata-display">📍 Dhaka • 🗓 July 2024</div>
                    <div class="narration-content">${text}</div>
                </div>
                <div class="choices-panel text-center">
                    <button id="next-btn" class="btn-primary">Continue</button>
                </div>
            </div>
        `;
        document.getElementById('next-btn').onclick = onNext;
    },

    characterSelectScreen(onSelect) {
        this.clear();
        this.root.innerHTML = `
            <div class="screen">
                <h2 class="character-select-title">SELECT YOUR PATH</h2>
                <div class="character-grid">
                    <div class="save-slot-card" data-char="doctor">
                        <div class="portrait-placeholder">🩺</div>
                        <h3 class="save-slot-title">DOCTOR</h3>
                        <div class="save-slot-desc">Emergency Physician</div>
                    </div>
                    <div class="save-slot-card" data-char="student">
                        <div class="portrait-placeholder">🎓</div>
                        <h3 class="save-slot-title">STUDENT</h3>
                        <div class="save-slot-desc">Undergraduate Protestor</div>
                    </div>
                    <div class="save-slot-card" data-char="rickshaw">
                        <div class="portrait-placeholder">🚲</div>
                        <h3 class="save-slot-title">RICKSHAW PULLER</h3>
                        <div class="save-slot-desc">Navigating the Streets</div>
                    </div>
                </div>
            </div>
        `;
        document.querySelectorAll('.save-slot-card').forEach(el => {
            el.onclick = () => onSelect(el.dataset.char);
        });
    },

    characterIntroScreen(node, onNext) {
        this.clear();
        const char = (node && node.character) ? node.character : 'character';
        const charName = char.toUpperCase();
        
        let locationStr = "Dhaka";
        if (char === 'doctor') locationStr = "Dhaka Medical College";
        if (char === 'student') locationStr = "Dhaka University Campus";
        if (char === 'rickshaw') locationStr = "Mirpur Road";

        this.root.innerHTML = `
            <div class="screen">
                <div class="scene-image-container">
                    <div class="image-fallback">${charName}</div>
                </div>
                <div class="dialogue-panel">
                    <h2 class="character-name-display">${charName}</h2>
                    <div class="metadata-display">📍 ${locationStr} • 🗓 15 July 2024</div>
                    <div class="narration-content">${node ? node.text : 'Error loading.'}</div>
                </div>
                <div class="choices-panel text-center">
                    <button id="next-btn" class="btn-primary">Begin Phase 1</button>
                </div>
            </div>
        `;
        document.getElementById('next-btn').onclick = onNext;
    },

    phaseScreen(node, onChoice) {
        this.clear();
        
        const imgHtml = (node && node.image) 
            ? `<img src="${node.image}" class="scene-image" alt="Phase Image" onerror="this.outerHTML='<div class=\\'image-fallback\\'>Scene Illustration Missing</div>'">` 
            : `<div class="image-fallback">Scene Illustration Missing</div>`;
            
        const choicesHtml = (node && node.choices) ? node.choices.map((c, idx) => `
            <button class="choice-btn" data-idx="${idx}">
                <span class="choice-label">${c.label}</span>
            </button>
        `).join('') : '';

        const char = typeof AppState !== 'undefined' && AppState.character ? AppState.character : 'character';
        const charName = char.toUpperCase();
        const phase = typeof AppState !== 'undefined' && AppState.phase ? AppState.phase : 1;
        const dateStr = (14 + phase) + " July 2024";
        let locationStr = "Dhaka";
        if (char === 'doctor') locationStr = "Dhaka Medical College";
        if (char === 'student') locationStr = "Dhaka University Campus";
        if (char === 'rickshaw') locationStr = "Mirpur Road";

        this.root.innerHTML = `
            <div class="screen">
                <div class="scene-image-container">
                    ${imgHtml}
                </div>
                <div class="dialogue-panel">
                    <h2 class="character-name-display">${charName}</h2>
                    <div class="metadata-display">📍 ${locationStr} • 🗓 ${dateStr}</div>
                    <div class="narration-content">${node ? node.text : 'Error loading phase.'}</div>
                </div>
                <div class="choices-panel">
                    ${choicesHtml}
                </div>
            </div>
        `;
        
        document.querySelectorAll('.choices-panel button').forEach(btn => {
            btn.onclick = () => {
                const choice = node.choices[btn.dataset.idx];
                onChoice(choice);
            };
        });
    },

    consequenceScreen(consequence, onContinue) {
        this.clear();
        
        const imgHtml = (consequence && consequence.image) 
            ? `<img src="${consequence.image}" class="scene-image consequence-image" alt="Consequence Image" onerror="this.outerHTML='<div class=\\'image-fallback\\'>Scene Illustration Missing</div>'">` 
            : `<div class="image-fallback">Scene Illustration Missing</div>`;
            
        const textHtml = (consequence && consequence.text) ? consequence.text : 'Error loading consequence.';

        this.root.innerHTML = `
            <div class="screen">
                <div class="scene-image-container">
                    ${imgHtml}
                </div>
                <div class="dialogue-panel consequence-overlay">
                    <h2 class="character-name-display" style="color: #ccc;">CONSEQUENCE</h2>
                    <div class="narration-content">${textHtml}</div>
                </div>
                <div class="choices-panel text-center">
                    <button id="continue-btn" class="btn-primary">Continue</button>
                </div>
            </div>
        `;
        
        document.getElementById('continue-btn').onclick = onContinue;
    },

    endingScreen(node, onNext) {
        this.clear();
        
        const imgHtml = (node && node.image) 
            ? `<img src="${node.image}" class="scene-image" alt="Ending Image" onerror="this.outerHTML='<div class=\\'image-fallback\\'>Ending Illustration Missing</div>'">` 
            : `<div class="image-fallback">Ending Illustration Missing</div>`;

        this.root.innerHTML = `
            <div class="screen">
                <div class="scene-image-container">
                    ${imgHtml}
                </div>
                <div class="dialogue-panel text-center">
                    <h1 class="ending-title-display">${node ? node.title || 'THE END' : 'THE END'}</h1>
                    <div class="narration-content" style="margin: 0 auto;">${node ? node.text : 'Error loading ending.'}</div>
                    ${node && node.outcome ? `<div class="ending-stats">${node.outcome}</div>` : ''}
                </div>
                <div class="choices-panel text-center">
                    <button id="next-btn" class="btn-primary">View Epilogue</button>
                </div>
            </div>
        `;
        document.getElementById('next-btn').onclick = onNext;
    },

    epilogueScreen(node, onRestart) {
        this.clear();
        const factsHtml = (node && node.facts) ? node.facts.map(f => `<li>${f}</li>`).join('') : '';
        const sourcesHtml = (node && node.sources) ? node.sources.map(s => `<li>${s}</li>`).join('') : '';
        
        this.root.innerHTML = `
            <div class="screen">
                <div class="epilogue-card">
                    <h1 class="main-title text-center" style="color:#2c2c2c; text-shadow: none; margin-bottom: 2rem;">EPILOGUE</h1>
                    
                    <h2>Historical Notes</h2>
                    <ul>${factsHtml}</ul>
                    
                    <h2>Sources</h2>
                    <ul>${sourcesHtml}</ul>
                    
                    ${node && node.dedication ? `
                    <div class="dedication">${node.dedication}</div>` : ''}
                </div>
                
                <div class="choices-panel text-center" style="margin-top: 2rem;">
                    <button id="restart-btn" class="btn-primary">Play Again</button>
                </div>
            </div>
        `;
        document.getElementById('restart-btn').onclick = onRestart;
    }
};
