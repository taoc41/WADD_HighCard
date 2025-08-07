/**
 * 
 * this script stores the main game functions and code
 * witness insanity and a lot of ramblings
 * 
 */

//#region generateDeck()
function generateDeck() {
    deck = [];
    for (let s of suits) {
        for (let r of ranks) {
            deck.push(new Card(r, s));
        }
    }
    shuffle(deck, true);
}

//#region generateRandomCard()
function generateRandomCard(suit = null) {
    let chosenSuit = suit || random(suits);
    let rank = random(ranks); // uses string values like '7' or 'K'
    return new Card(rank, chosenSuit);
}

//#region drawHand()
function drawHand() {
    // if hand has more than allowed size
    if (hand.length > handSize) {
        let excess = hand.splice(handSize); // remove extra cards at the end
        deck = deck.concat(excess); // put back into deck
        shuffle(deck); // shuffle the deck
    }

    // if hand has fewer than allowed size, draw the difference
    let needed = handSize - hand.length;
    if (needed > 0) {
        let drawn = deck.splice(0, needed);
        hand = hand.concat(drawn);
    }
}

//#region mousePressed()
function mousePressed() {

    // Check if a card is being clicked (drag start)
    for (let i = 0; i < hand.length; i++) {
        let card = hand[i];
        if (card && card.contains(mouseX, mouseY)) {
            heldCard = card;
            holdingCardIndex = i;
            holdStartTime = millis();
            dragOffsetX = mouseX - card.x;
            dragOffsetY = mouseY - card.y;
            break;
        }
    }

    if (gameState === "playing") {
        // Handle play button click
        if (playBtn && playBtn.contains(mouseX, mouseY)) {
            playBtn.onClick();
            return;
        }

        // Handle shuffle button click
        if (shuffleBtn && shuffleBtn.contains(mouseX, mouseY)) {
            shuffleBtn.onClick();
            return;
        }
    }


    // upgrade phase - handle upgrade selection
    if (gameState === "upgrade") {
        for (let i = 0; i < upgradeChoices.length; i++) {
            if (upgradeChoices[i].contains(mouseX, mouseY)) {
                // select and deselect the current upgrade. 
                selectedUpgradeIndex !== i
                    ? selectedUpgradeIndex = i
                    : selectedUpgradeIndex = null;
            }
        }

        if (confirmBtn && confirmBtn.contains(mouseX, mouseY)) {
            confirmBtn.onClick();
        }

        if (skipBtn && skipBtn.contains(mouseX, mouseY)) {
            skipBtn.onClick();
        }

        if (burnBtn && burnBtn.contains(mouseX, mouseY)) {
            burnBtn.onClick();
        }

        if (freezeBtn && freezeBtn.contains(mouseX, mouseY)) {
            freezeBtn.onClick();
        }

    }
}

//#region mouseDragged()
function mouseDragged() {
    if (heldCard && !isDragging && millis() - holdStartTime > 200) {
        isDragging = true;
    }

    if (isDragging && heldCard) {
        heldCard.x = mouseX - dragOffsetX;
        heldCard.y = mouseY - dragOffsetY;
    }
}

//#region mouseReleased()

function mouseReleased() {
    if (isDragging && heldCard) {

        // calculate insertion index using midpoints of between current slots

        // find the closest index
        let minDist = Infinity;
        let targetIndex = holdingCardIndex;

        for (let i = 0; i < hand.length; i++) {
            if (i === holdingCardIndex) continue;
            const card = hand[i];
            const d = dist(heldCard.x, heldCard.y, card.x, card.y);
            if (d < minDist) {
                minDist = d;
                targetIndex = i;
            }
        }

        if (minDist <= 150 && targetIndex !== holdingCardIndex) {
            // remove held card
            const movedCard = hand.splice(holdingCardIndex, 1)[0];

            // if removed before target, target index shifts left by 1
            const insertAt = (targetIndex > holdingCardIndex) ? targetIndex - 1 : targetIndex;

            // insert currently held card in new spot
            hand.splice(insertAt, 0, movedCard);

            // reindex `selected` array to reflect the move
            selected = selected.map(idx => {
                if (idx === holdingCardIndex) return insertAt;

                // moved foward: shift indices in (oldIdx, new Idx] left by 1
                if (holdingCardIndex < insertAt && idx > holdingCardIndex && idx <= insertAt) return idx - 1;
                if (insertAt < holdingCardIndex && idx >= insertAt && idx < holdingCardIndex) return idx + 1;

                return idx;
            });

            // dedupe, clamp, sort
            selected = Array.from(new Set(selected))
                .filter(i => i >= 0 && i < hand.length)
                .sort((a, b) => a - b);
        }

    } else if (heldCard) {
        // click based selection toggle (no drag)
        const idx = holdingCardIndex;
        if (heldCard.selected) {
            selected = selected.filter(n => n !== idx);
            heldCard.selected = false;
        } else if (selected.length < 5) {
            selected.push(idx);
            heldCard.selected = true;
        }
    }

    // resync `selected` from card flags to avoid ghosting
    selected = hand.reduce((arr, c, i) => {
        if (c && c.selected) arr.push(i);
        return arr;
    }, []);

    if (gameState === "playing" && selected.length >= 1) {
        const chosenCards = selected.map(i => hand[i]).filter(Boolean);
        previewHandInfo = evaluateHand(chosenCards);
        previewHandInfo.cards = chosenCards;
        previewHandInfo.baseScore = previewHandInfo.score;
    } else {
        previewHandInfo = null;
    }

    // reset drag state
    isDragging = false;
    heldCard = null;
    holdingCardIndex = -1;
}

//#region keyTyped()
function keyTyped() {
    if (gameState === "gameover") {
        if (playerName.length < 12 && key.match(/^[a-zA-Z0-9 ]$/)) {
            playerName += key;
        }
    }
}

//#region keyPressed()
function keyPressed() {
    if (gameState === "gameover") {
        if (keyCode === BACKSPACE) {
            playerName = playerName.slice(0, -1);
        }
        if (keyCode === ENTER && playerName.trim() !== "") {
            saveScore(playerName.trim(), totalScore);
            window.location.href = "leaderboard.html"; // redirect to leaderboard
        }
    }
}

//#region saveScore()
function saveScore(name, score) {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

//#region playHand()
function playHand() {
    selected = selected.filter(i => hand[i] !== null && hand[i] !== undefined);
    let chosenCards = selected.map(i => hand[i]);

    currentHandInfo = evaluateHand(chosenCards);

    let baseScore = currentHandInfo.score;
    let passiveAddScore = 0;
    let passiveAddMult = 1;
    let passiveXMult = 1;

    const allForOne = passivePerks.some(p => p.name === "All for One")
    let rankMult = allForOne
        ? calculateRankMultiplier(chosenCards)
        : calculateRankMultiplier(currentHandInfo.usedCards);

    // activate all current perks
    passivePerks.forEach(perk => {
        if (disabledPerk.includes(perk)) return;

        if (perk.trigger === "playHand" && perk.condition(chosenCards)) {
            const result = perk.effect(chosenCards); // playedCards inputs 

            switch (perk.result) {
                case "addScore": passiveAddScore += result; break;
                case "addMult": passiveAddMult += result; break;
                case "xMult": passiveXMult *= result; break;
                default: perk.effect(); break; // if not specified, then effect is not score related.
            }

            sendEventText(`${perk.name} activated!`);
        }
    });

    // math for how scoring should be calculated
    // should be simple enough to understand
    let finalScore = Math.floor
        ((baseScore + passiveAddScore) * ((rankMult + passiveAddMult) * passiveXMult));

    // for "silenced" debuff - clears previous round's locks
    disabledPerk = [];

    activeDebuffs.forEach(debuff => {
        if (debuff.type === "perRound" && typeof debuff.effect === "function") {
            debuff.effect();
        }
    });

    updatePassivePerkDisplay();
    updateDebuffDisplay();

    score += finalScore
    lastHandInfo = currentHandInfo;
    currentHandInfo = null;
    previewHandInfo = null;
    round++;

    // Replace only the selected card indices
    for (let i = 0; i < selected.length; i++) {
        let handIndex = selected[i];
        hand[handIndex] = deck.length > 0 ? deck.shift() : null;
    }

    selected = [];
    gameStateLogic();
}


//#region gameStateLogic()
// main function that handles everything
// below funtions are helper functions (to refactor so it all isn't a bunch of if statements)
function gameStateLogic() {
    if (isGameOver()) {
        gameState = "gameover";
        return;
    }

    if (isAnteOver()) {
        handleAnteEnd();
    } else {
        drawHand(); // new hand if it's not a new ante
    }
}

// checks if the game is over
function isGameOver() {
    return deck.length === 0 && hand.every(card => card === null);
}

// checks if the ante is over
function isAnteOver() {
    return round > maxRounds;
}

// handles what to do when the ante is over
function handleAnteEnd() {
    const baseThreshold = getUpgradeThreshold();

    if (score >= baseThreshold) {
        handleSuccessfulAnte(baseThreshold);
    } else {
        handleFailedAnte();
    }
}

// handles a sucessful ante - if the player meets the score requirement
function handleSuccessfulAnte(baseThreshold) {
    upgradePoints = Math.floor(score / baseThreshold) + storedUpgradePoints;
    storedUpgradePoints = 0;
    totalScore += score;
    score = 0;

    if (upgradePoints > 0) {
        const oblivious = activeDebuffs.find(d => d.name === "Oblivious");
        if (oblivious) {
            oblivious.effect();
            nextAnte();
        } else {
            gameState = "upgrade";
            generateUpgradeChoice();
        }
    } else {
        nextAnte();
    }
}

// handles a failed ante - if the played didn't meet the score requirement
function handleFailedAnte() {
    if (storedUpgradePoints > 0) {
        sendEventText(`Failed to reach score requirement, ${storedUpgradePoints} stored upgrades lost!`);
    } else if (round === maxRounds + 1) {
        sendEventText(`You must meet the score requirement to progress!`);
    }

    storedUpgradePoints = 0;
    drawHand();
}

/* -------------------------------------------- */

//#region reshuffleHand()
function reshuffleHand() {
    selected = selected.filter(i => hand[i] !== null && hand[i] !== undefined);

    if (selected.length === 0 || reshuffleUses <= 0) return;

    let chosenCards = selected.map(i => hand[i]);
    chosenCards.forEach(c => c.selected = false);
    deck.push(...chosenCards);
    shuffle(deck, true);

    for (let i = 0; i < selected.length; i++) {
        let handIndex = selected[i];
        if (deck.length > 0) {
            hand[handIndex] = deck.shift();
            hand[handIndex].selected = false;
        } else {
            hand[handIndex] = null;
        }
    }

    selected = [];
    currentHandInfo = null;
    previewHandInfo = null;
    reshuffleUses--;

    for (let perk of passivePerks) {
        if (perk.trigger === "onShuffle" && !disabledPerk.includes(perk)) {
            if (!perk.condition || perk.condition(chosenCards)) {
                perk.effect(chosenCards);
                sendEventText(`${perk.name} activated!`);
            }
        }
    }

}

//#region returnHand()
function returnHand() {
    for (let card of hand) {
        card.selected = false; // unmark all cards as selected
    }
    selected = []; // clear selected cards
    deck = deck.concat(hand); // move hand back into the deck
    hand = []; // clear the hand
    shuffle(deck, true); // shuffle the deck
}

function getUpgradeThreshold() {
    const growthRate = 1.5; // Adjust to make the growth faster or slower

    const threshold = baseUpgradeThreshold * Math.pow(growthRate, ante - 1);
    return Math.round(threshold / 100) * 100; // Round to the nearest 100
}

//#region weightedRandomRarity()
function weightedRandomRarity() {
    let r = random();
    let cumulative = 0;
    for (let rarity in RARITY_WEIGHTS) {
        cumulative += RARITY_WEIGHTS[rarity];
        if (r < cumulative) return rarity;
    }
    return "Common";
}

//#region generateUpgradeChoice()

// this has genuinely caused me the most headaches
// i wish death upon javascript
// chatGPT was used here for debugging -> ended up being typos & generation returns null as a choice for some reason
function generateUpgradeChoice() {
    selectedUpgradeIndex = null;
    burnUsed = false;
    returnHand();
    drawHand();

    const frozenNames = new Set(
        [...frozenUpgrades.values()]
            .map(choice => choice?.data?.name)
            .filter(Boolean)
    );

    // filters -> no duplicate choices with already owned passives + burned upgrades
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
        if (
            slotIdx < upgradeChoiceAmount &&
            choice &&
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
            && !usedNames.has(p.name)
        );
        if (!candidates.length) return null;
        const pick = random(candidates);
        usedNames.add(pick.name);
        return pick;
    };

    const tryPickAny = (pool) => {
        const pick = pool.find(p => !usedNames.has(p.name));
        if (!pick) return null;
        usedNames.add(pick.name);
        return pick;
    };

    // fill empty slots.
    for (let i = 0; i < slots.length; i++) {
        if (slots[i]) continue;

        const roll = random();
        let rarity = weightedRandomRarity();

        if (forcedCursedCount > 0) {
            rarity = "Cursed";
            forcedCursedCount--
            sendEventText(`An upgrade had become cursed!`);
        }

        const typePools = [
            { chance: 0.55, type: "pack", pool: availablePacks }, // 55% chance
            { chance: 0.75, type: "edit", pool: availableEdits }, // 25% chance
            { chance: 0.9, type: "passive", pool: availablePassives }, // 10% chance
            { change: 1.0, type: "perk", pool: availablePerks } // 10% chance
        ];

        for (let { chance, type, pool } of typePools) {
            if (roll < chance && pool.length > 0) {
                const filteredPool = rarity === "Cursed"
                    ? pool.filter(p => p.rarity === "Cursed")
                    : pool;

                const pick = tryPickByRarity(filteredPool, rarity) || tryPickAny(filteredPool);
                if (pick) {
                    slots[i] = new UpgradeChoice(type, pick);
                    break;
                }
            }
        }
    }

    // fall back to prevent "nulls" from being generated
    // i hate this so much
    const classifyType = (item) => {
        if (availablePacks.some(p => p.name === item.name)) return "pack";
        if (availableEdits.some(p => p.name === item.name)) return "edit";
        if (availablePassives.some(p => p.name === item.name)) return "passive";
        if (availablePerks.some(p => p.name === item.name)) return "perk";
    };

    let fallbackPool = [
        ...availablePacks,
        ...availableEdits,
        ...availablePassives,
        ...availablePerks
    ].filter(u => !usedNames.has(u.name)); // no dupes

    if (forcedCursedCount > 0) {
        fallbackPool = fallbackPool.filter(u => u.rarity === "Cursed");
    }

    for (let i = 0; i < slots.length; i++) {
        if (slots[i]) continue; // already filled

        if (fallbackPool.length === 0) break;

        //pick one at random, classify and place
        const pick = random(fallbackPool);
        const type = classifyType(pick);

        slots[i] = new UpgradeChoice(type, pick);
        usedNames.add(pick.name);

        fallbackPool = fallbackPool.filter(u => u.name !== pick.name);
    }

    upgradeChoices = slots.filter(Boolean); // last fallback to not return any nulls
    upgradeChoices = slots;
}

function confirmUpgrade() {
    if (selectedUpgradeIndex === null) return;

    const choice = upgradeChoices[selectedUpgradeIndex];
    const ok = choice.apply();
    if (!ok) return;

    if (ok) {
        frozenUpgrades.delete(selectedUpgradeIndex);
        upgradePoints--;
        upgradePoints > 0 ? generateUpgradeChoice() : nextAnte();
    }
}

//#region burnUpgrade()
function burnUpgrade() {
    if (burnUsed) {
        sendEventText("You can only burn once per upgrade!")
        return;
    }

    if (selectedUpgradeIndex == null) return;

    const selectedUpgrade = upgradeChoices[selectedUpgradeIndex];

    if (!selectedUpgrade.isBurnable()) {
        sendEventText("Cannot burn a Cursed upgrade!")
        return;
    }

    if (burnsRemaining <= 0) {
        sendEventText("No burns remaining!!")
        return;
    }

    // handles burning the upgrade
    const burned = upgradeChoices[selectedUpgradeIndex]; // get the selected upgrade
    burnedUpgrades.push(burned.name); // push it into the list of burned upgrades
    frozenUpgrades.delete(selectedUpgradeIndex); // get rid of the freeze if there is one.
    sendEventText(`${burned.name} has been burned!`)
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

    if (frozenUpgrades.has(idx)) {
        frozenUpgrades.delete(idx);
        this.label = `Freeze (${freezesRemaining})`
        return;
    }

    if (freezesRemaining <= 0) {
        sendEventText(`No more freezes remaining!`);
        return;
    }

    const choice = upgradeChoices[idx];
    if (!choice) return;
    frozenUpgrades.set(idx, choice);
    this.label = "Unfreeze"
    freezesRemaining--;

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

//#region nextAnte()
// literally so i dont have to keep repeating this code over and over
function nextAnte() {
    addDebuffAnte(); // adds a debuff every 5 antes
    gameState = "playing"; // sets game state
    ante++; // next ante
    round = 1; // reset back to round 1
    upgradePoints = 0; // reset upgrade points
    selectedUpgradeIndex = null // resets upgrade selection
    returnHand(); // return the hand from upgrade screen back into deck
    drawHand(); // redraw a new hand
}


//#region evaluateHand()
/**
    * Evaluates the hand for scoring/typing
    * @param {*} cards The hand to evaluate, often always used with the hand variable.
    * @returns The type of hand the player has selected, the score, and what cards make up the hand.
*/
function evaluateHand(cards) {
    let ranksOnly = cards.map(c => c.rank);
    let suitsOnly = cards.map(c => c.suit);
    let rankCounts = {};
    let rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    for (let r of ranksOnly) {
        rankCounts[r] = (rankCounts[r] || 0) + 1;
    }

    // hand type checks.
    let counts = Object.values(rankCounts).sort((a, b) => b - a);                                                          // Tells how much of each rank is present. Identifies pairs, Three -> Five of a Kind, Etc.
    let isFlush = suitsOnly.every(s => s === suitsOnly[0]);                                                                // Checks if all cards are the same rank.
    let sortedIndices = ranksOnly.map(r => rankOrder.indexOf(r)).sort((a, b) => a - b);                                    // Creates a numerically sorted list of ranks.
    let isStraight = sortedIndices.length >= 2 && sortedIndices.every((val, i, arr) => i === 0 || val - arr[i - 1] === 1); // Checks if sortedIndices form a consecutive sequence. Confirms if hand is a straight.

    // arrow functions to check what cards make up the hand type (pair, straight, etc)
    const getCardsByRank = (rank) => cards.filter(c => c.rank === rank);        // return all cards from `cards` that match a specific rank
    const getUsedCards = (rankCountMap, count) =>                               // return all cards that appears `count` times in the hand.
        Object.entries(rankCountMap)                                            // rankCountMap is an object, e.g. { 'A': 2, '10, 'J': 2 }, this line converts it to [['A', 2], ['10', 1], ['J', 2]].
            .filter(([_, cnt]) => cnt === count)                                // keeps entries where the count matches the value that we are interested in
            .flatMap(([rank]) => getCardsByRank(rank));                         // for each matching rank, pull all cards with that rank using `getCardByRank`. flatMap flattens the array into single card objects.

    // checks for how many cards are selected and returns the appropriate object depending on the type of hand selected using the hand type checks
    // genuinely going to kms this looks ugly
    switch (cards.length) {
        case 1: // 1 card selected ————————————————————————————————————————————————————————

            // High Card
            return {
                name: "High Card",
                score: 5,
                usedCards: [cards[0]]
            };

        case 2: // 2 cards selected ——————————————————————————————————————————————————————

            // Pair
            if (counts[0] === 2) {
                let used = getUsedCards(rankCounts, 2);
                return { name: "Pair", score: 10, usedCards: used };
            }

            // High Card
            return { name: "High Card", score: 5, usedCards: [cards[0]] };

        case 3: // Three cards selected —————————————————————————————————————————————————

            // Three of a Kind
            if (counts[0] === 3) {
                let used = getUsedCards(rankCounts, 3);
                return { name: "Three of a Kind", score: 30, usedCards: used };
            }

            // Pair
            if (counts[0] === 2) {
                let used = getUsedCards(rankCounts, 2);
                return { name: "Pair", score: 10, usedCards: used };
            }

            // High Card
            return { name: "High Card", score: 5, usedCards: [cards[0]] };

        case 4: // 4 Cards selected ———————

            // Four of a Kind
            if (counts[0] === 4) {
                let used = getUsedCards(rankCounts, 4);
                return { name: "Four of a Kind", score: 60, usedCards: used };
            }

            // Three of a Kind
            if (counts[0] === 3) {
                let used = getUsedCards(rankCounts, 3);
                return { name: "Three of a Kind", score: 30, usedCards: used };
            }

            // Two Pair
            if (counts[0] === 2 && counts[1] === 2) {
                let pairs = getUsedCards(rankCounts, 2);
                return { name: "Two Pair", score: 20, usedCards: pairs };
            }

            // Pair
            if (counts[0] === 2) {
                let used = getUsedCards(rankCounts, 2);
                return { name: "Pair", score: 10, usedCards: used };
            }

            // High Card
            return { name: "High Card", score: 5, usedCards: [cards[0]] };

        case 5: // 5 Cards selected —————————————————————————————————————————————————

            // Flush Five
            if (isFlush && counts[0] === 5) {
                return { name: "Flush Five", score: 160, usedCards: cards };
            }

            // Flush House
            if (isFlush && counts[0] === 3 && counts[1] === 2) {
                let usedThree = getUsedCards(rankCounts, 3);
                let usedPair = getUsedCards(rankCounts, 2);
                let used = [...usedThree, ...usedPair];
                return { name: "Flush House", score: 140, usedCards: used };
            }

            // Five of a Kind
            if (counts[0] === 5) {
                let used = getUsedCards(rankCounts, 5);
                return { name: "Five of a Kind", score: 120, usedCards: used };
            }

            // Royal Flush and Straight Flush
            if (isFlush && isStraight && sortedIndices[4] === 12) return { name: "Royal Flush", score: 100, usedCards: cards };
            if (isFlush && isStraight) return { name: "Straight Flush", score: 75, usedCards: cards };

            // Four of a Kind
            if (counts[0] === 4) {
                let used = getUsedCards(rankCounts, 4);
                return { name: "Four of a Kind", score: 70, usedCards: used };
            }

            // Full House
            if (counts[0] === 3 && counts[1] === 2) {
                let usedThree = getUsedCards(rankCounts, 3);
                let usedPair = getUsedCards(rankCounts, 2);
                let used = [...usedThree, ...usedPair];
                return { name: "Full House", score: 50, usedCards: used };
            }

            // Flush and Straight
            if (isFlush) return { name: "Flush", score: 40, usedCards: cards };
            if (isStraight) return { name: "Straight", score: 35, usedCards: cards };

            // Three of a Kind
            if (counts[0] === 3) {
                let used = getUsedCards(rankCounts, 3);
                return { name: "Three of a Kind", score: 30, usedCards: used };
            }

            // Two Pair
            if (counts[0] === 2 && counts[1] === 2) {
                let pairs = getUsedCards(rankCounts, 2);
                return { name: "Two Pair", score: 20, usedCards: pairs };
            }

            // Pair
            if (counts[0] === 2) {
                let used = getUsedCards(rankCounts, 2);
                return { name: "Pair", score: 10, usedCards: used };
            }

            // High Card
            return { name: "High Card", score: 5, usedCards: [cards[0]] };
    }
}

//#region calculateRankMultiplier()
function calculateRankMultiplier(cards) {
    const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let total = 0;

    for (let card of cards) {
        let value = rankOrder.indexOf(card.rank) + 2;
        total += value;
    }

    return Math.max(1, total); // Ensure multiplier is at least 1
}
