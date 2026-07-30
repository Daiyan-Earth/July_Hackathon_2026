const engine = new StoryEngine();

const AudioController = {
    ambient: new Audio('assets/audio/ambient.mp3'),
    click: new Audio('assets/audio/choice-click.mp3'),
    isMuted: false,

    init() {
        this.ambient.loop = true;
        this.ambient.volume = 0.3;
        this.click.volume = 0.3;
        this.setupGlobalClickListener();
    },

    playAmbient() {
        if (!this.isMuted) {
            const playPromise = this.ambient.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.warn("Ambient audio play failed:", e));
            }
        }
    },

    playClick() {
        if (!this.isMuted) {
            this.click.currentTime = 0;
            const playPromise = this.click.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.warn("Click audio play failed:", e));
            }
        }
    },

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.ambient.pause();
        } else {
            if (AppState.screen !== 'TITLE') {
                this.playAmbient();
            }
        }
        const btn = document.getElementById('mute-btn');
        if (btn) {
            btn.innerHTML = this.isMuted ? '🔇' : '🔊';
        }
    },
    
    setupMuteButton() {
        if (!document.getElementById('mute-btn')) {
            const btn = document.createElement('button');
            btn.id = 'mute-btn';
            btn.className = 'mute-btn';
            btn.innerHTML = this.isMuted ? '🔇' : '🔊';
            btn.onclick = () => this.toggleMute();
            document.body.appendChild(btn);
        }
    },

    setupGlobalClickListener() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.choices-panel button')) {
                this.playClick();
            }
        });
    }
};

AudioController.init();

const AppState = {
    screen: "TITLE",
    character: null,
    phase: 1,
    state: { risk: 0, helped: 0 }
};

async function renderCurrentScreen() {
    console.log("Current state:", AppState);
    
    switch (AppState.screen) {
        case "TITLE":
            Render.titleScreen(() => {
                AudioController.playAmbient();
                AppState.screen = "INTRO";
                renderCurrentScreen();
            });
            break;
            
        case "INTRO":
            const introNode = await engine.getGlobalIntro();
            Render.introScreen(introNode, () => {
                AppState.screen = "SELECT";
                renderCurrentScreen();
            });
            break;
            
        case "SELECT":
            Render.characterSelectScreen((char) => {
                AppState.character = char;
                AppState.screen = "CHAR_INTRO";
                renderCurrentScreen();
            });
            break;
            
        case "CHAR_INTRO":
            const charIntroNode = await engine.getNode(AppState.character, "intro");
            Render.characterIntroScreen(charIntroNode, () => {
                AppState.screen = "PHASE";
                AppState.phase = 1;
                renderCurrentScreen();
            });
            break;
            
        case "PHASE":
            const phaseNode = await engine.getNode(AppState.character, "phase", AppState.phase);
            if (!phaseNode) {
                // If phase not found (e.g. after Phase 1 finishes in our stub),
                // assume game over and evaluate ending
                AppState.screen = "ENDING";
                renderCurrentScreen();
                break;
            }
            
            Render.phaseScreen(phaseNode, (choice) => {
                engine.selectChoice(choice, AppState.state);
                AppState.screen = "CONSEQUENCE";
                renderCurrentScreen();
            });
            break;

        case "CONSEQUENCE":
            Render.consequenceScreen(engine.currentConsequence, () => {
                AppState.phase += 1;
                AppState.screen = "PHASE";
                renderCurrentScreen();
            });
            break;
            
        case "ENDING":
            const endingNode = await engine.resolveEnding(AppState.character, AppState.state);
            Render.endingScreen(endingNode, () => {
                AppState.screen = "EPILOGUE";
                renderCurrentScreen();
            });
            break;
            
        case "EPILOGUE":
            const epilogueNode = await engine.getEpilogue();
            Render.epilogueScreen(epilogueNode, () => {
                // Reset state
                AppState.screen = "TITLE";
                AppState.character = null;
                AppState.phase = 1;
                AppState.state = { risk: 0, helped: 0 };
                renderCurrentScreen();
            });
            break;
    }
}

// Start app
window.addEventListener('DOMContentLoaded', () => {
    Render.root = document.getElementById('app');
    AudioController.setupMuteButton();
    renderCurrentScreen();
});
