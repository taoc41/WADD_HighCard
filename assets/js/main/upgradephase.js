// this script stores the backend upgrade phase code

//#region weightedRandomRarity()
// random rarity generation based on the rates
function weightedRandomRarity() {
    let roll = random(); // roll random number, float between 0 -> 1. defines what rarity should be returned
    let cumulative = 0; // set up the cumulative

    // keep adding the rarity number until cumulative is over the roll
    // e.g. if roll = 0.89, cumulative should reach over r.
    // Common: 0 -> 0.7, Uncommon: 0.7 -> 0.85, Rare: 0.85 -> 0.91
    // Rare is over roll, so therefore return the Rare rarity.
    for (let rarity in RARITY_WEIGHTS) {
        cumulative += RARITY_WEIGHTS[rarity];
        if (roll < cumulative) return rarity;
    }
    return "Common"; // if roll was over 0.955, just return common.
}

//#region generateUpgradeChoice()

// this has genuinely caused me the most headaches
// i wish death upon javascript
function generateUpgradeChoice() {
    
    // reset needed variables for upgrade
    selectedUpgradeIndex = null;
    burnUsed = false;
    returnHand();
    drawHand();

    // gets all frozen upgrades
    const frozenNames = new Set(
        [...frozenUpgrades.values()]
            .map(choice => choice?.data?.name)
            .filter(Boolean)
    );

    // filters -> no duplicate choices with already owned passives + burned upgrades + frozen upgrades
    const availablePassives = PASSIVE_PERKS.filter(p =>
        !passivePerks.some(pp => pp.name === p.name) && 
        !burnedUpgrades.includes(p.name) &&
        !frozenNames.has(p.name)
    );
    const availablePacks = PACKS.filter(p =>
        !burnedUpgrades.includes(p.name) &&
        !frozenNames.has(p.name)
    );
    const availableEdits = EDIT_PERKS.filter(p =>
        !burnedUpgrades.includes(p.name) &&
        !frozenNames.has(p.name)
    );
    const availablePerks = PERKS.filter(p =>
        !burnedUpgrades.includes(p.name) &&
        !frozenNames.has(p.name)
    );

    const slots = new Array(upgradeChoiceAmount).fill(null); // prepare output array & keep frozen upgrades
    const usedNames = new Set(frozenNames); // already appeared in this roll

    // place frozen upgrades back into their respective slots
    // burned upgrade? get rid of it
    // frozen upgrade is overflowing? get rid of it
    for (const [slotIdx, choice] of [...frozenUpgrades.entries()]) {
        if (slotIdx < upgradeChoiceAmount && choice &&
            !burnedUpgrades.includes(choice.data?.name)
        ) {
            slots[slotIdx] = choice;
            usedNames.add(choice.data.name);
        } else {
            // invalid/overflowed frozen – drop it
            frozenUpgrades.delete(slotIdx);
        }
    }

    // helper - pick from a pool by rarity while avoiding duplicates
    const tryPickByRarity = (pool, rarity) => {
        const candidates = pool.filter(p => p.rarity === rarity
            && !usedNames.has(p.name) // build candidates. keep candidates that have the same rarity and aren't already taken (as listed in usedNames)
        );
        if (!candidates.length) return null; // no candidates? return null.
        const pick = random(candidates); // randomly pick one candidate
        usedNames.add(pick.name); // mark as taken so won't appear again in the roll
        return pick; // return the chosen candidate (upgrade)
    };

    const tryPickAny = (pool) => {
        const pick = pool.find(p => !usedNames.has(p.name)); // find a candidate that isnt taken (as listed in usedNames)
        if (!pick) return null; // return null if none found
        usedNames.add(pick.name); // mark as taken.
        return pick; // return the chosen candidate (upgrade)
    };

    // fill empty slots.
    for (let i = 0; i < slots.length; i++) {
        if (slots[i]) continue; // if the slot already has something, continue to the next slot.

        const roll = random(); // roll a random number
        let rarity = weightedRandomRarity(); // choose a random rarity via function

        // force cursed upgrade if forcedCursedCount is above 0 (A)
        if (forcedCursedCount > 0) {
            rarity = "Cursed";
            forcedCursedCount--
            sendEventText(`An upgrade had become cursed!`);
        }

        // defines how often an upgrade type should appear + sets upgrade type, and the origin pool.
        // pack - 55% change
        // edit - 25% chance
        // passive + perk, 10% chance
        const typePools = [
            { chance: 0.55, type: "pack", pool: availablePacks }, // 55% chance
            { chance: 0.75, type: "edit", pool: availableEdits }, // 25% chance
            { chance: 0.9, type: "passive", pool: availablePassives }, // 10% chance
            { chance: 1.0, type: "perk", pool: availablePerks } // 10% chance
        ];

        // pick from the upgrade pools
        for (let { chance, type, pool } of typePools) {
            if (roll < chance && pool.length > 0) {
                const filteredPool = rarity === "Cursed" ? pool.filter(p => p.rarity === "Cursed") : pool; // if current rarity is cursed, only filter cursed items

                const pick = tryPickByRarity(filteredPool, rarity) || tryPickAny(filteredPool); // random item matching rairty and not already used.
                if (pick) { // does the upgrade exist?
                    slots[i] = new UpgradeChoice(type, pick); // send upgrade
                    break;
                }
            }
        }
    }

    // fall back to prevent "nulls" from being generated

    // needed to differentiate what type is every upgrade
    const classifyType = (item) => {
        if (availablePacks.some(p => p.name === item.name)) return "pack";
        if (availableEdits.some(p => p.name === item.name)) return "edit";
        if (availablePassives.some(p => p.name === item.name)) return "passive";
        if (availablePerks.some(p => p.name === item.name)) return "perk";
    };

    // build the fallback pool whilst filtering out "taken" upgrades
    // merges all the pools together as a fallback (if before failed to pick an upgrade)
    let fallbackPool = [
        ...availablePacks,
        ...availableEdits,
        ...availablePassives,
        ...availablePerks
    ].filter(u => !usedNames.has(u.name)); // no dupes

    // force cursed upgrades if needed yet again
    if (forcedCursedCount > 0) {
        fallbackPool = fallbackPool.filter(u => u.rarity === "Cursed");
    }

    // now fill the upgrade slots
    for (let i = 0; i < slots.length; i++) {
        if (slots[i]) continue; // already filled
        if (fallbackPool.length === 0) break; // stop early if no more upgrades in fall back pool
        const pick = random(fallbackPool); // pick a random upgrade
        const type = classifyType(pick); // get the type of the upgrade
        slots[i] = new UpgradeChoice(type, pick); // create the upgrade choice
        usedNames.add(pick.name); // mark as used
        fallbackPool = fallbackPool.filter(u => u.name !== pick.name); // remove from fallback pool so wont be picked again
    }

    upgradeChoices = slots.filter(Boolean); // last fallback to not return any nulls
    upgradeChoices = slots; // set the upgrade choices.
}

//#region confirmUpgrade()
function confirmUpgrade() {
    if (selectedUpgradeIndex == null) return;
  
    const choice = upgradeChoices[selectedUpgradeIndex];
    if (!choice) return;
  
    if (!choice.apply()) return; // if choice.apply returned false, don't do anything.
  
    frozenUpgrades.delete(selectedUpgradeIndex); // delete the frozen upgrade. wont do anything if the selected wasn't frozen
    upgradePoints--; // decrease upgrade point
    if (skipLock > 0) skipLock--; // decrease skip lock amount if there is any.
    selectedUpgradeIndex = null; // deselect for next upgrade.

    // more upgrade points? more upgrades. 
    // none? next ante.
    if (upgradePoints > 0) {
      generateUpgradeChoice();
    } else {
      nextAnte();
    }
  }

//#region burnUpgrade()
function burnUpgrade() {
    
    // stops burn if already used once
    if (burnUsed) {
        sendEventText("You can only burn once per upgrade!")
        return;
    }

    // don't do anything is nothing is selected
    if (selectedUpgradeIndex == null) return;

    // get the selected upgrade
    const selectedUpgrade = upgradeChoices[selectedUpgradeIndex];

    // stops burn if trying to burn cursed upgrade
    if (!selectedUpgrade.isBurnable()) {
        sendEventText("Cannot burn a Cursed upgrade!")
        return;
    }

    // stops burn if no burn remaining
    if (burnsRemaining <= 0) {
        sendEventText("No burns remaining!!")
        return;
    }

    // handles burning the upgrade
    const burned = upgradeChoices[selectedUpgradeIndex]; // get the selected upgrade
    burnedUpgrades.push(burned.name); // push it into the list of burned upgrades
    frozenUpgrades.delete(selectedUpgradeIndex); // get rid of the freeze if there is one.
    sendEventText(`${burned.name} has been burned!`) // event text for display
    upgradeChoices.splice(selectedUpgradeIndex, 1); // remove from selectable list
    selectedUpgradeIndex = null; // reset burned index back to null
    burnsRemaining--; // decrease amount of burns by 1
    burnUsed = true // cannot use burn again until another upgrade is chosen, or the upgrade is skipped.

    for (let perk of passivePerks) {
        if (perk.trigger === "onBurn" && (!disabledPerk.includes(perk))) {
            perk.effect(burned);
            sendEventText(`${perk.name} activated!`)
        }
    }
}

//#region freezeUpgrade();
function freezeUpgrade() {
    if (selectedUpgradeIndex == null) return;

    const idx = selectedUpgradeIndex;

    // unfreeze if selected upgrade was already frozen
    if (frozenUpgrades.has(idx)) {
        frozenUpgrades.delete(idx);
        return;
    }

    // no more freezes? nah can't do anything m8
    if (freezesRemaining <= 0) {
        sendEventText(`No more freezes remaining!`);
        return;
    }

    // freeze logic
    const choice = upgradeChoices[idx]; // get the upgrade data
    if (!choice) return; // if that choice doesn't exist, don't do anything
    frozenUpgrades.set(idx, choice); // set the upgrade as frozen
    freezesRemaining--; // decrease freeze amount
}

//#region addDebuffPer5Ante()
function addDebuffAnte() {
    if (ante % 5 !== 0) return; // do nothing if ante is not a multiple of 5

    // filter debuffs that haven't hit the max count
    const validDebuffs = DEBUFFS.filter(d => {
        const count = activeDebuffs.filter(ad => ad.name === d.name).length;
        return !d.max || count < d.max;
    });

    // do nothing if there's no debuffs available to add / all debuffs hit max limit.
    if (validDebuffs.length === 0) return;

    // add the debuff (push into activeDebuff array)
    const debuff = random(validDebuffs);
    activeDebuffs.push(debuff);

    // activate the debuff effect now if the type is defined as "once"
    if (debuff.type === "once" && typeof debuff.effect === "function") {
        debuff.effect();
    }

    // event text for visual clarity
    sendEventText(`Difficulty increase... the "${debuff.name}" debuff was added.`)

    // update the HTMl display
    updateDebuffDisplay();
}

//#region skipUpgrade()
// for skip/store upgrade
// 
function skipUpgrade() {
    if (skipLock > 0) {
        sendEventText(`You are forced to pick an upgrade for ${skipLock} choices...`)
        return;
    }

    storedUpgradePoints++;
    upgradePoints--;
    sendEventText(`Skip and stored upgrade! You have ${storedUpgradePoints} stored upgrades!`)
    upgradePoints <= 0 ? nextAnte() : generateUpgradeChoice(); // no more upgrade points, then next ante. otherwise continue upgrade phase
}

function endUpgrade() {
    storedUpgradePoints += upgradePoints;
    upgradePoints = 0;
    sendEventText(`Upgrade Phase skipped! Your current upgrade points will be stored!`)
    nextAnte();
}



