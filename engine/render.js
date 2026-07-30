const Render = {
    root: null,
    _keyHandler: null,

    clear() {
        if (this.root) this.root.innerHTML = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Remove previous keyboard listener
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
    },

    /**
     * Typewriter-style text reveal for narration blocks.
     * Inserts text word-by-word for readability.
     */
    _typewriter(element, text, speed = 18) {
        const words = text.split(' ');
        element.textContent = '';
        element.style.opacity = '1';
        let i = 0;
        const interval = setInterval(() => {
            if (i < words.length) {
                element.textContent += (i > 0 ? ' ' : '') + words[i];
                i++;
            } else {
                clearInterval(interval);
            }
        }, speed);
        // Store reference to allow skip
        element._twInterval = interval;
        element._twWords = words;
        element._twIndex = () => i;
        element._twSkip = () => {
            clearInterval(interval);
            element.textContent = text;
        };
    },

    /**
     * Bind keyboard shortcuts. Call after rendering a screen.
     * actions: { continue: fn, choices: [fn, fn, ...] }
     */
    _bindKeys(actions) {
        this._keyHandler = (e) => {
            // Skip typewriter on any key during typing
            const narration = document.querySelector('.narration-content');
            if (narration && narration._twSkip && narration._twIndex && narration._twIndex() < (narration._twWords ? narration._twWords.length : 0)) {
                narration._twSkip();
                return;
            }

            if (actions.continue && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                actions.continue();
            }
            if (actions.choices) {
                const num = parseInt(e.key);
                if (num >= 1 && num <= actions.choices.length) {
                    e.preventDefault();
                    actions.choices[num - 1]();
                }
            }
        };
        document.addEventListener('keydown', this._keyHandler);
    },

    /**
     * Generate a progress bar for story phases (4 phases total).
     */
    _progressBar(currentPhase, totalPhases = 4) {
        let dots = '';
        for (let i = 1; i <= totalPhases; i++) {
            const cls = i < currentPhase ? 'progress-dot completed' :
                        i === currentPhase ? 'progress-dot active' : 'progress-dot';
            dots += `<span class="${cls}"></span>`;
        }
        return `<div class="progress-bar">${dots}</div>`;
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
        
        const imgHtml = (node && node.image) 
            ? `<img src="${node.image}" class="scene-image" alt="Intro Image" onerror="this.outerHTML='<div class=\\'image-fallback\\'>Introduction</div>'">` 
            : `<div class="image-fallback">Introduction</div>`;

        this.root.innerHTML = `
            <div class="screen">
                <div class="scene-image-container">
                    ${imgHtml}
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
        // Typewriter for intro narration
        const narEl = document.querySelector('.narration-content');
        if (narEl) this._typewriter(narEl, text);
        // Keyboard: Enter/Space to continue
        this._bindKeys({ continue: onNext });
    },

    characterSelectScreen(onSelect) {
        this.clear();
        this.root.innerHTML = `
            <div class="screen">
                <h2 class="character-select-title">SELECT YOUR PATH</h2>
                <div class="character-grid">
                    <div class="save-slot-card" data-char="doctor">
                        <div class="portrait-placeholder"><img src="assets/images/doctor_portrait.png" style="width: 100%; height: 100%; object-fit: cover; image-rendering: pixelated;" onerror="this.outerHTML='🩺'"></div>
                        <h3 class="save-slot-title">DOCTOR</h3>
                        <div class="save-slot-desc">Emergency Physician</div>
                    </div>
                    <div class="save-slot-card" data-char="student">
                        <div class="portrait-placeholder"><img src="assets/images/student_portrait.png" style="width: 100%; height: 100%; object-fit: cover; image-rendering: pixelated;" onerror="this.outerHTML='🎓'"></div>
                        <h3 class="save-slot-title">STUDENT</h3>
                        <div class="save-slot-desc">Undergraduate Protestor</div>
                    </div>
                    <div class="save-slot-card" data-char="rickshaw">
                        <div class="portrait-placeholder"><img src="assets/images/rickshaw_portrait.png" style="width: 100%; height: 100%; object-fit: cover; image-rendering: pixelated;" onerror="this.outerHTML='🚲'"></div>
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
        const charName = char === 'rickshaw' ? 'RICKSHAW PULLER' : char.toUpperCase();
        
        const imgHtml = (node && node.image) 
            ? `<img src="${node.image}" class="scene-image" alt="${charName} Intro Image" onerror="this.outerHTML='<div class=\\'image-fallback\\'>${charName}</div>'">` 
            : `<div class="image-fallback">${charName}</div>`;

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
                    <div class="metadata-display">📍 ${locationStr} • 🗓 15 July 2024</div>
                    <div class="narration-content">${node ? node.text : 'Error loading.'}</div>
                </div>
                <div class="choices-panel text-center">
                    <button id="next-btn" class="btn-primary">Begin Phase 1</button>
                </div>
            </div>
        `;
        document.getElementById('next-btn').onclick = onNext;
        // Typewriter for character intro
        const narEl = document.querySelector('.narration-content');
        if (narEl && node) this._typewriter(narEl, node.text || '');
        // Keyboard
        this._bindKeys({ continue: onNext });
    },

    phaseScreen(node, onChoice) {
        this.clear();
        
        const imgHtml = (node && node.image) 
            ? `<img src="${node.image}" class="scene-image" alt="Phase Image" onerror="this.outerHTML='<div class=\\'image-fallback\\'>Scene Illustration Missing</div>'">` 
            : `<div class="image-fallback">Scene Illustration Missing</div>`;
            
        const choicesHtml = (node && node.choices) ? node.choices.map((c, idx) => `
            <button class="choice-btn" data-idx="${idx}">
                <span class="choice-key-hint">${idx + 1}</span>
                <span class="choice-label">${c.label}</span>
            </button>
        `).join('') : '';

        const char = typeof AppState !== 'undefined' && AppState.character ? AppState.character : 'character';
        const charName = char === 'rickshaw' ? 'RICKSHAW PULLER' : char.toUpperCase();
        const phase = typeof AppState !== 'undefined' && AppState.phase ? AppState.phase : 1;
        const dateStr = (node && node.date) ? node.date : ((14 + phase) + " July 2024");
        let locationStr = "Dhaka";
        if (char === 'doctor') locationStr = "Dhaka Medical College";
        if (char === 'student') locationStr = "Dhaka University Campus";
        if (char === 'rickshaw') locationStr = "Mirpur Road";

        this.root.innerHTML = `
            <div class="screen">
                ${this._progressBar(phase)}
                <div class="scene-image-container">
                    ${imgHtml}
                </div>
                <div class="dialogue-panel">
                    <h2 class="character-name-display">${charName}</h2>
                    <div class="metadata-display">📍 ${locationStr} • 🗓 ${dateStr}</div>
                    <div class="narration-content"></div>
                </div>
                <div class="choices-panel">
                    ${choicesHtml}
                </div>
            </div>
        `;

        // Typewriter for phase narration
        const narEl = document.querySelector('.narration-content');
        if (narEl && node) this._typewriter(narEl, node.text || '');
        
        const choiceFns = [];
        document.querySelectorAll('.choices-panel button').forEach(btn => {
            const fn = () => {
                const choice = node.choices[btn.dataset.idx];
                onChoice(choice);
            };
            btn.onclick = fn;
            choiceFns.push(fn);
        });
        // Keyboard: 1/2 for choices
        this._bindKeys({ choices: choiceFns });
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
        // Typewriter for consequence
        const narEl = document.querySelector('.narration-content');
        if (narEl) this._typewriter(narEl, textHtml);
        // Keyboard: Enter/Space to continue
        this._bindKeys({ continue: onContinue });
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
        // Typewriter for ending text
        const narEl = document.querySelector('.narration-content');
        if (narEl && node) this._typewriter(narEl, node.text || '');
        // Keyboard
        this._bindKeys({ continue: onNext });
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
        // Keyboard
        this._bindKeys({ continue: onRestart });
    }
};
