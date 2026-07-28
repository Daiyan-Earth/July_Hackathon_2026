class StoryEngine {
    constructor() {
        this.cache = {};
    }

    async loadData(file) {
        if (this.cache[file]) return this.cache[file];
        try {
            const res = await fetch(`data/${file}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            this.cache[file] = data;
            return data;
        } catch (e) {
            console.error("Failed to load", file, e);
            return null;
        }
    }

    async getGlobalIntro() {
        return this.loadData('intro.json');
    }

    async getEpilogue() {
        return this.loadData('epilogue.json');
    }

    async getCharacterData(character) {
        return this.loadData(`${character}.json`);
    }

    async getNode(character, type, phaseOrCondition) {
        const data = await this.getCharacterData(character);
        if (!data) return null;
        
        if (type === 'intro') {
            return data.find(n => n.type === 'intro');
        }
        if (type === 'phase') {
            return data.find(n => n.type === 'phase' && n.phase === phaseOrCondition);
        }
        return null;
    }

    async resolveEnding(character, stateObj) {
        const data = await this.getCharacterData(character);
        if (!data) return null;
        
        const endings = data.filter(n => n.type === 'ending');
        
        // Very basic ending resolution based on condition string (e.g. "risk>=2")
        let matchingEnding = null;

        for (const ending of endings) {
            if (ending.condition === 'default') {
                if (!matchingEnding) matchingEnding = ending; // fallback
                continue;
            }

            // simple parser for "key>=val"
            const match = ending.condition.match(/(\w+)>=(\d+)/);
            if (match) {
                const key = match[1];
                const val = parseInt(match[2], 10);
                if (stateObj[key] >= val) {
                    matchingEnding = ending;
                    // if we want strict precedence, could sort/prioritize
                }
            }
        }

        return matchingEnding || endings[0];
    }
}
