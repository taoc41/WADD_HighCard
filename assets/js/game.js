function generateDeck() {
    deck = [];
    for (let s of suits) {
        for (let r of ranks) {
            deck.push(new Card(r, s));
        }
    }
    shuffle(deck, true);
}

function generateRandomCard(suit = null) {
    let chosenSuit = suit || random(suits);
    let rank = random(ranks); // uses string values like '7' or 'K'
    return new Card(rank, chosenSuit);
}

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

    // Handle play button click
    if (playBtn && playBtn.visible && playBtn.contains(mouseX, mouseY)) {
        playBtn.onClick();
        return;
    }

    // Handle shuffle button click
    if (shuffleBtn && shuffleBtn.visible && shuffleBtn.contains(mouseX, mouseY)) {
        shuffleBtn.onClick();
        return;
    }

    if (gameState === "upgrade") {
        for (let i = 0; i < upgradeChoices.length; i++) {
            let x = width / 2 - 250 + i * 250;
            let y = height / 2;
            if (mouseX > x - 100 && mouseX < x + 100 && mouseY > y - 100 && mouseY < y + 100) {
                chooseUpgrade(i);
                return;
            }
        }
    }
}

function mouseDragged() {
    if (heldCard && !isDragging && millis() - holdStartTime > 200) {
        isDragging = true;
    }

    if (isDragging && heldCard) {
        heldCard.x = mouseX - dragOffsetX;
        heldCard.y = mouseY - dragOffsetY;
    }
}

function mouseReleased() {
    if (isDragging && heldCard) {
        // Determine closest index
        let minDist = Infinity;
        let targetIndex = holdingCardIndex;

        for (let i = 0; i < hand.length; i++) {
            if (i === holdingCardIndex) continue;
            let card = hand[i];
            let distToSlot = dist(heldCard.x, heldCard.y, card.x, card.y);
            if (distToSlot < minDist) {
                minDist = distToSlot;
                targetIndex = i;
            }
        }

        if (minDist > 150) {
            // basically do nothing: too far - snap back
        } else {
            let movedCard = hand.splice(holdingCardIndex, 1)[0];
            hand.splice(targetIndex, 0, movedCard);
        }
    } else if (heldCard) {
        // click based selection fallback if drag is never triggered. 
        // previously in mousePressed (before 30/07/25)
        let idx = holdingCardIndex;
        if (heldCard.selected) {
            selected = selected.filter(n => n !== idx);
            heldCard.selected = false;
        } else if (selected.length < 5) {
            selected.push(idx);
            heldCard.selected = true;
        }
    }

    // Updates the preview hand info 
    if (selected.length >= 1) {
        let chosenCards = selected.map(i => hand[i]);
        previewHandInfo = evaluateHand(chosenCards);
        previewHandInfo.cards = chosenCards;
        previewHandInfo.baseScore = previewHandInfo.score;
    } else {
        previewHandInfo = null;
    }

    // Reset drag state
    isDragging = false;
    heldCard = null;
    holdingCardIndex = -1;
}

function keyTyped() {
    if (gameState === "gameover") {
        if (playerName.length < 12 && key.match(/^[a-zA-Z0-9 ]$/)) {
            playerName += key;
        }
    }
}

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

function saveScore(name, score) {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function playHand() {
    selected = selected.filter(i => hand[i] !== null && hand[i] !== undefined);
    let chosenCards = selected.map(i => hand[i]);

    currentHandInfo = evaluateHand(chosenCards);

    let baseScore = currentHandInfo.score;
    let multiplier = calculateRankMultiplier(currentHandInfo.usedCards);
    let finalScore = baseScore * multiplier;


    // Apply passive perks
    passivePerks.forEach(perk => {
        if (disabledPerk.includes(perk)) return; // Perk Lockout

        if (perk.condition(chosenCards, finalScore)) {
            finalScore = Math.floor(perk.effect(finalScore));
            let activeCount = eventTextAnimations.length;

            // Trigger text animations
            eventTextAnimations.push({
                text: perk.name + " activated!",
                x: width / 2,
                y: height / 2 - 100 + (activeCount * 30),
                opacity: 255,
                timer: 60
            });
        }
    });

    // for Perk Lockout - clears previous round's locks
    disabledPerk = [];

    activeDebuffs.forEach(debuff => {
        if (debuff.type === "perRound" && typeof debuff.effect === "function") {
            debuff.effect();
        }
    });

    updatePassivePerkDisplay();
    updateDebuffDisplay();

    score += finalScore
    previewHandInfo = null;
    lastHandInfo = currentHandInfo;
    round++;

    // Replace only the selected card indices
    for (let i = 0; i < selected.length; i++) {
        let handIndex = selected[i];
        hand[handIndex] = deck.length > 0 ? deck.shift() : null;
    }

    selected = [];

    if (deck.length === 0 && hand.every(card => card === null)) {
        gameState = "gameover";
    }

    if (round > maxRounds) {
        let baseThreshold = getUpgradeThreshold();

        if (score >= baseThreshold) {

            // Convert ante score into upgrades
            upgradePoints = Math.floor(score / baseThreshold);

            // Transfer score to totalScore
            totalScore += score;
            score = 0;

            // If there's more than 0 upgrade points, then choose another upgrade.
            if (upgradePoints > 0) {
                gameState = "upgrade";
                generateUpgradeChoice();
            } else {
                addDebuff();
                gameState = "playing";
                ante++
                round = 1;
                drawHand();
            }
        } else {
            drawHand();

        }
    } else {

        // New hand if its not a new ante.
        drawHand();
    }
}

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

    // For shuffle based perks (Card Crawler for now)
    passivePerks.forEach(perk => {
        if (perk.name === "Card Crawler") {
            perk.effect(0); // score doesn't matter here
            eventTextAnimations.push({
                text: `${perk.name} activated!`,
                x: width / 2,
                y: height / 2 - 100 + (eventTextAnimations.length * 30),
                opacity: 255,
                timer: 60
            });
        }
    });
}


function chooseUpgrade(index) {
    let choice = upgradeChoices[index];
    if (!choice) return;

    if (choice.type === "passive") {
        if (choice.type === "passive") {
            if (passivePerks.length >= MAX_PASSIVE_PERKS) {
                alert("You already have 5 passive perks. Remove one before adding another.");
                return; // Prevents overflow
            }

            passivePerks.push(choice.data);
            updatePassivePerkDisplay();
        }
    } else if (choice.type === "pack") {
        choice.data.apply();
        updatePassivePerkDisplay();
    } else if (choice.type === "")

    upgradePoints--;

    // If there are more upgrade points, generate the more upgrades.
    if (upgradePoints > 0) {
        generateUpgradeChoice();
    } else {
        addDebuff();
        gameState = "playing";
        ante++
        round = 1;
        drawHand();
    }
}

function addDebuff() {

    // Add a debuff every 5 antes
    if (ante % 5 === 0) {
        let debuff = random(DEBUFFS);
        activeDebuffs.push(debuff);

        if (debuff.type === "once" && typeof debuff.effect === "function") {
            debuff.effect();
        }

        // Optional animation or UI alert
        eventTextAnimations.push({
            text: `Debuff Gained: ${debuff.name}`,
            x: width / 2,
            y: height / 2 - 50,
            opacity: 255,
            timer: 60
        });
    }

    updateDebuffDisplay();
}

function generateUpgradeChoice() {
    const availablePerks = PASSIVE_PERKS.filter(p => !passivePerks.some(pp => pp.name === p.name));
    const availablePacks = [...PERKS];
    const availableEdits = [...EDIT_PERKS];

    const mixedChoices = [];

    while (mixedChoices.length < 3) {
        let categoryRoll = random();
        let rarity = weightedRandomRarity();

        if (categoryRoll < 0.25 && availablePerks.length > 0) {
            let filtered = availablePassives.filter(p => p.rarity === rarity);
            if (filtered.length > 0) {
                let perk = random(filtered);
                mixedChoices.push({type: "passive", data: perk});
                availablePassives.splice(availablePassives.indexOf(perk), 1);
                continue;
            }
        } else if (categoryRoll < 0.75 && availablePacks.length > 0) {
            if (filtered.length > 0) {
                let pack = random(filtered);
                mixedChoices.push({type: "pack", data: pack});
                availablePacks.splice(availablePacks.indexOf(pack), 1);
                continue;
            }
        } else if (availableEdits.length > 0) {
            let filtered = availableEdits.filter (p => p.rarity === rarity);
            if (filtered.length > 0) {
                let edit = random(filtered);
                mixedChoices.push({ type: "edit", data: edit });
                availableEdits.splice(availableEdits.indexOf(edit), 1);
                continue;
            }
        }
    }

    upgradeChoices = mixedChoices;
}

function getUpgradeThreshold() {
    const growthRate = 1.5; // Adjust to make the growth faster or slower

    const threshold = baseUpgradeThreshold * Math.pow(growthRate, ante - 1);
    return Math.round(threshold / 100) * 100; // Round to the nearest 100
}


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

    // Checks for how many cards are selected and returns the appropriate object depending on the type of hand selected using the hand type checks
    // genuinely going to kms this looks ugly
    switch (cards.length) {
        case 1: // 1 card selected ———————

            // High Card
            return {
                name: "High Card",
                score: 5,
                usedCards: [cards[0]]
            };

        case 2: // 2 cards selected ———————

            // Pair
            if (counts[0] === 2) {
                let used = getUsedCards(rankCounts, 2);
                return { name: "Pair", score: 10, usedCards: used };
            }

            // High Card
            return { name: "High Card", score: 5, usedCards: [cards[0]] };

        case 3: // Three cards selected ———————

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

        case 5: // 5 Cards selected ———————

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


function calculateRankMultiplier(cards) {
    const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let total = 0;

    for (let card of cards) {
        let value = rankOrder.indexOf(card.rank) + 2;
        total += value;
    }

    return Math.max(1, total); // Ensure multiplier is at least 1
}

