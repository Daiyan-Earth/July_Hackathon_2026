const engine = new StoryEngine();

const AppState = {
    screen: "TITLE",
    character: null,
    phase: 1,
    state: { risk: 0, helped: 0 }
};

function initializeQuoteCards() {
    const quotes = [
        '"By lantern light, we learned which doors opened quietly and which streets remembered our footsteps."',
        '"When the city held its breath, even a cup of water passed hand to hand felt like a promise."'
    ];

    document.querySelectorAll('.quote-card p').forEach((quoteEl, index) => {
        if (quotes[index]) quoteEl.textContent = quotes[index];
    });
}

async function renderCurrentScreen() {
    console.log("Current state:", AppState);
    
    // Update the dashboard UI elements (if they exist in the DOM)
    const riskEl = document.querySelector('.risk-val');
    const helpedEl = document.querySelector('.helped-val');
    const phaseTextEl = document.querySelector('.phase-text');
    const dots = document.querySelectorAll('.dot-indicators .dot');

    const hasCharacterStarted = Boolean(AppState.character);
    if (riskEl) riskEl.textContent = hasCharacterStarted ? AppState.state.risk : '--';
    if (helpedEl) helpedEl.textContent = hasCharacterStarted ? AppState.state.helped : '--';
    
    if (phaseTextEl) phaseTextEl.textContent = `Phase ${Math.min(AppState.phase, 4)} of 4`;

    if (dots.length > 0) {
        dots.forEach((dot, index) => {
            // Activate dots up to the current phase
            if (index < AppState.phase) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    switch (AppState.screen) {
        case "TITLE":
            Render.titleScreen(() => {
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
    initializeQuoteCards();
    Render.root = document.getElementById('app');
    renderCurrentScreen();
});
