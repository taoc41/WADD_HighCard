// this script stores all the perk upgrade info and code for the game

//#region PERKS
// stuff that effects things outside of cards
const PERKS = [
    // COMMON
    { // Quick Palm
      name: "Quick Palm",
      description: "Increase your reshuffles by 1.",
      rarity: "Common",
      apply: () => {
        reshuffleUses++
        sendEventText("+1 Reshuffle");
      }
    },
    { // Frost
      name: "Frost",
      description: "Increase your Freezes by 1.",
      rarity: "Common",
      apply: () => {
        freezesRemaining++;
        sendEventText("+1 Freeze");
      }
    },
    { // Flicker
      name: "Flicker",
      description: "Increase your Burns by 1.",
      rarity: "Common",
      apply: () => {
        burnsRemaining++
        sendEventText("+1 Burn");
      }
    },
  
    // UNCOMMON
    { // Loaded Sleeve
      name: "Loaded Sleeve",
      description: "Increase your reshuffles by 3.",
      rarity: "Uncommon",
      apply: () => {
        reshuffleUses += 3
        sendEventText("+3 Reshuffles");
      }
    },
    { // Wildfire
      name: "Wildfire",
      description: "Increase your Burns by 3.",
      rarity: "Uncommon",
      apply: () => {
        burnsRemaining += 3
        sendEventText("+3 Burns");
      }
    },
    { // Blizzard
      name: "Blizzard",
      description: "Increase your Freezes by 3.",
      rarity: "Uncommon",
      apply: () => {
        freezesRemaining++
        sendEventText("+3 Freezes");
      }
    },
  
    // RARE
    { // Phantom Thief
      name: "Phantom Thief",
      description: "Increase your reshuffles by 5.",
      rarity: "Rare",
      apply: () => {
        reshuffleUses += 5;
        sendEventText("+5 Reshuffles");
      }
    },
    { // Arsonist
      name: "Arsonist",
      description: "Increase your Burns by 5.",
      rarity: "Rare",
      apply: () => {
        burnsRemaining += 5;
        sendEventText("+5 Burns");
      }
    },
    { // Perfrigerist
      name: "Perfrigerist",
      description: "Increase your Freezes by 5.",
      rarity: "Rare",
      apply: () => {
        freezesRemaining += 5;
        sendEventText("+5 Freezes");
      }
    },
    { // Open Mind
      name: "Open Mind",
      description: "Increase the amount of knowable Abilities by 1.",
      rarity: "Rare",
      apply: () => {
        maxPassivePerks++;
        sendEventText(`Increased max abilities by 1`)
      }
    },
    { // Elixir
      name: "Elixir",
      description: "Remove a random debuff.",
      rarity: "Rare",
      apply: () => {
        if (activeDebuffs.length === 0) return;
        let toRemove = random(activeDebuffs);
        if (toRemove.type === "once" && typeof toRemove.revert === "function") {
          toRemove.revert();
        }
        activeDebuffs.splice(activeDebuffs.indexOf(toRemove), 1);
        updateDebuffDisplay();
        sendEventText(`${toRemove.name} removed!`);
      }
    },
    { // Bonus Draw
      name: "Bonus Draw",
      description: "Your hand size increases by 1. (Max 10.)",
      rarity: "Rare",
      apply: () => {
        if (handSize < 10) handSize++;
        sendEventText(`Hand Size increased by 1.`)
      }
    },
  
    // MYTHICAL
    { // Cautious
      name: "Cautious",
      description: "Decrease the current ante by 1.",
      rarity: "Mythical",
      apply: () => {
        ante = max(1, ante - 1);
        sendEventText(`-1 Ante. You are now on Ante ${ante}`);
      }
    },
    { // Librarian
      name: "Librarian",
      description: "Increase the amount of knowable Abilities by 2.",
      rarity: "Mythical",
      apply: () => {
        maxPassivePerks += 2;
        sendEventText("Increased knowable abilities by 2.")
      }
    },
    { // Scholar
      name: "Scholar",
      description: "Increase upgrade choice by 1 (Max 5)",
      rarity: "Mythical",
      apply: () => {
        upgradeChoiceAmount = min(5, upgradeChoiceAmount + 1);
        sendEventText("+1 Upgrade Choice");
      }
    },
    { // Kleptomaniac
      name: "Kleptomaniac",
      description: "Increase your reshuffles by 10.",
      rarity: "Mythical",
      apply: () => {
        reshuffleUses += 10;
        sendEventText("+10 Reshuffles");
      }
    },
    { // Pyromaniac
      name: "Pyromaniac",
      description: "Increase your Burns amount by 10.",
      rarity: "Mythical",
      apply: () => {
        burnsRemaining += 10;
        sendEventText("+10 Burns");
      }
    },
    { // Cryomaniac
      name: "Cryomaniac",
      description: "Increase your Freezes amount by 10.",
      rarity: "Mythical",
      apply: () => {
        burnsRemaining += 10;
        sendEventText("+10 Freezes");
      }
    },
  
    // LEGENDARY
    { // Elementalist
      name: "Elementalist",
      description: "Increase your Reshuffles, Burns, and Freezes by 10.",
      rarity: "Legendary",
      apply: () => {
        reshuffleUses += 10;
        burnsRemaining += 10;
        freezesRemaining += 10;
        sendEventText("+10 Reshuffles, Burns, and Freezes");
      }
    },
    { // Panacea
      name: "Panacea",
      description: "Remove all debuffs.",
      rarity: "Legendary",
      apply: () => {
        activeDebuffs.forEach(d => {
          if (d.type === "once" && typeof d.revert === "function") d.revert();
        });
        activeDebuffs = [];
        updateDebuffDisplay();
        sendEventText("All debuffs removed!");
      }
    },
    { // Safety First
      name: "Safety First",
      description: "Decrease the current ante by 3.",
      rarity: "Legendary",
      apply: () => {
        ante = max(1, ante - 3);
        sendEventText(`-3 Ante. You are now on Ante ${ante}`);
      }
    },
  
    // CURSED
    { // Devil's Deal (A)
      name: "Devil's Deal (A)",
      description: "Increase your knowable Abilities by 1, decrease your upgrade choices by 1.",
      rarity: "Cursed",
      apply: () => {
        maxPassivePerks++;
        upgradeChoiceAmount = max(1, upgradeChoiceAmount - 1);
        sendEventText(`+1 Knowable Ability, -1 Upgrade Choice.`);
      }
    },
    { // Devil's Deal (B)
      name: "Devil's Deal (B)",
      description: "Increase your upgrade choices by 1, decrease your knowable Abilities by 1.",
      rarity: "Cursed",
      apply: () => {
        upgradeChoiceAmount++;
        maxPassivePerks = max(1, maxPassivePerks - 1);
        sendEventText(`+1 Upgrade Choice, -1 Knowable Ability.`);
      }
    },
    { // Elemental Mishap
      name: "Elemental Mishap",
      description: "Swap the amounts of your Burns and Freezes around.",
      rarity: "Cursed",
      apply: () => {
        const temp = burnsRemaining;
        burnsRemaining = freezesRemaining;
        freezesRemaining = temp;
        sendEventText(`Burns and Freezes were swapped.`);
      }
    },
    { // Ice Age
      name: "Ice Age",
      description: "Your amount of Burns is merged into your Freezes.",
      rarity: "Cursed",
      apply: () => {
        freezesRemaining += burnsRemaining;
        sendEventText(`+ ${burnsRemaining} Freezes. Burns are now 0.`);
        burnsRemaining = 0;
      }
    },
    { // Hellscape
      name: "Hellscape",
      description: "Your amount of Freezes is merged into your Burns.",
      rarity: "Cursed",
      apply: () => {
        burnsRemaining += freezesRemaining;
        sendEventText(`+ ${freezesRemaining} Burns. Freezes are now 0.`)
        freezesRemaining = 0;
      }
    },
    { // Time Dilation
      name: "Time Dilation",
      description: "Increase the amount of rounds needed to progress by 1.",
      rarity: "Cursed",
      apply: () => {
        maxRounds++
        sendEventText(`Rounds required to progess are now ${maxRounds}`)
      }
    },
    { // Luck Rot
      name: "Luck Rot",
      description: "Gain +10 upgrade points. Your next 3 upgrade choices become Cursed.",
      rarity: "Cursed",
      apply: () => {
        upgradePoints += 10;
        nextUpgradeCursed = 9;
        sendEventText(`+10 Upgrade Points. I hope it was worth it...`);
      }
    },
    { // Time Tax
      name: "Time Tax",
      description: "Gain +5 Upgrade Points. Ante increases by 1.",
      rarity: "Cursed",
      apply: () => {
        upgradePoints += 5;
        ante++;
        sendEventText(`+5 upgrade points. Ante was increased by 1.`);
      }
    },
    { // Short Fuse
      name: "Short Fuse",
      description: "Gain +10 upgrade points. Gain the 'Oblivious' debuff (The next upgrade phase is skipped).",
      rarity: "Cursed",
      apply: () => {
        upgradePoints += 10;
        const oblivious = activeDebuffs.find(d => d.name === "Oblivious");
        activeDebuffs.push(oblivious);
        sendEventText(`+10 Upgrade Points. "Oblivious" debuff gained.`);
      }
    }
  
  ]
  