const engine = new StoryEngine();

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
                // Apply state effect
                if (choice.state_effect) {
                    if (choice.state_effect.risk) AppState.state.risk += choice.state_effect.risk;
                    if (choice.state_effect.helped) AppState.state.helped += choice.state_effect.helped;
                }
                
                // For a robust system, you'd probably rely on next_id, 
                // but for our simple 4-phase loop, incrementing phase works as per spec.
                AppState.phase += 1;
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
    renderCurrentScreen();
});
