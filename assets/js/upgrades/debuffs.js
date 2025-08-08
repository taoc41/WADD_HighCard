// this script stores all the debuff info and code for the game

//#region DEBUFFS
const DEBUFFS = [
    { // Score Leak
      name: "Score Leak",
      max: 10,
      description: "Lose 5% of your played score after every hand.",
      type: "perRound",
      effect: () => {
        score = floor(score * 0.95); // equivilant to "* 5%""
      },
    },
    { // Card Rot
      name: "Card Rot",
      description: "Removes 1 random card from your deck each round.",
      max: 99,
      type: "perRound",
      effect: () => {
        if (deck.length > 0) {
          deck.splice(floor(random(deck.length)), 1)
        }
      },
    },
    { // Bleeding
      name: "Bleeding",
      description: "Removes 2 random cards from your deck each round.",
      max: 99,
      type: "perRound",
      effect: () => {
        if (deck.length > 0) {
          deck.splice(floor(random(deck.length)), 1)
          deck.splice(floor(random(deck.length)), 1)
        }
      },
    },
    { // Perk Lockout
      name: "Silenced",
      description: "A random ability is disabled this round.",
      max: 5,
      type: "perRound",
      effect: () => {
        
        // no passive perks? dont do anything.
        if (passivePerks.length === 0) {
          disabledPerk = [];
          return;
        }
  
        // find perks not already locked
        const availableToDisable = passivePerks.filter(p => !disabledPerk.includes(p));
  
        // all already locked? don't do anything.
        if (availableToDisable.length === 0) return;
  
        // mark the perk as disabled.
        const newDisabled = random(availableToDisable);
        disabledPerk.push(newDisabled);
      },
    },
    { // Cramped Hand
      name: "Cramped Hand",
      description: "Draw 2 fewer cards per hand (min 3).",
      max: 2,
      type: "once",
      effect: () => {
        handSize = max(handSize - 2, 3); // does not go under 3
      },
      revert: () => {
        handSize = min(handSize + 2, 10); // does not go over 10
      }
    },
    { // Oblivious
      name: "Oblivious",
      description: "Skip the next upgrade phase.",
      max: 1,
      effect: () => {
        sendEventText("Upgrade phase was skipped...");
        activeDebuffs = activeDebuffs.filter(d => d.name !== "Oblivious"); // remove immediately.
        updateDebuffDisplay(); // update HTML debuff display
      }
    }
  ]