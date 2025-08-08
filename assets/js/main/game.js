// this script stores backend game code, mostly for main gameplay loop
//

//#region generateDeck()
// generates a new 52 card deck.
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
// generates a random card
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

//#region playHand()
function playHand() {
    selected = selected.filter(i => hand[i] !== null && hand[i] !== undefined);
    let chosenCards = selected.map(i => hand[i]);

    // evaluate the cards and set the current hand info with evaluateHand function
    currentHandInfo = evaluateHand(chosenCards);

    // define all the score information
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

            // determines what the passive should do based on their "result" property
            switch (perk.result) {
                case "addScore": passiveAddScore += result; break;
                case "addMult": passiveAddMult += result; break;
                case "xMult": passiveXMult *= result; break;
                default: perk.effect(); break; // if not any of the specified above, then effect is not score related.
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

    // activate all debuffs
    activeDebuffs.forEach(debuff => {
        if (debuff.type === "perRound" && typeof debuff.effect === "function") {
            debuff.effect();
        }
    });

    // update html displays
    updatePassivePerkDisplay();
    updateDebuffDisplay();

    // apply score, reset appropriate variables for next round
    score += finalScore
    lastHandInfo = currentHandInfo;

    currentHandInfo = null;
    previewHandInfo = null;
    round++;

    // replace only the selected cards indicies
    for (let i = 0; i < selected.length; i++) {
        let handIndex = selected[i];
        hand[handIndex] = deck.length > 0 ? deck.shift() : null;
    }

    // reset selected, then move onto game logic
    selected = [];
    gameStateLogic();
}

//#region evaluateHand()
/**
    * Evaluates the hand for scoring/typing
    * @param {*} cards The hand to evaluate, often always used with the hand variable.
    * @returns The type of hand the player has selected, the score, and what cards make up the hand.
*/
function evaluateHand(cards) {

    // create rank only and suits only arrays by mapping over selected `cards`
    let ranksOnly = cards.map(c => c.rank); // holds only ranks e.g. ['K', 'A', '2']
    let suitsOnly = cards.map(c => c.suit); // holds only suits e.g. ['♠', '♠', '♥']
    let rankCounts = {}; // initalize the object first
    const rankOrder = ranks; // gets the ranks global array, should already be in order

    // loop over rankOnly to build rankCounts -> stores how many each rank appears
    for (let r of ranksOnly) {
        rankCounts[r] = (rankCounts[r] || 0) + 1;
    }

    /* hand type checks. */
    // Tells how much of each rank is present. Identifies pairs, Three -> Five of a Kind, Etc.
    let counts = Object.values(rankCounts).sort((a, b) => b - a); 

    // checks if all cards are the same suit.
    let isFlush = suitsOnly.every(s => s === suitsOnly[0]);  

    // creates a numerically sorted list of ranks.
    let sortedIndices = ranksOnly.map(r => rankOrder.indexOf(r)).sort((a, b) => a - b);     

    // checks if sortedIndices form a consecutive sequence. confirms if hand is a straight.
    let isStraight = sortedIndices.length >= 2 && sortedIndices.every((val, i, arr) => i === 0 || val - arr[i - 1] === 1); 

    /* helper functions to check what cards make up the hand type (pair, straight, etc) 
    used for rank multiplier -> only use the cards that make up the poker hand for multiplier */

    // getCardByRank: return all cards from `cards` that match a specific rank
    // getUsedCards: retuns all cards that appear a specific amount of times
    const getCardsByRank = (rank) => cards.filter(c => c.rank === rank);        
    const getUsedCards = (rankCountMap, count) =>          // return all cards that appears `count` times in the hand.
        Object.entries(rankCountMap)                       // rankCountMap is an object, e.g. { 'A': 2, '10, 'J': 2 }, this line converts it to [['A', 2], ['10', 1], ['J', 2]].
            .filter(([_, cnt]) => cnt === count)           // keeps entries where the count matches the value that we are interested in
            .flatMap(([rank]) => getCardsByRank(rank));    // for each matching rank, pull all cards with that rank using `getCardByRank`. flatMap flattens the array into single card objects.

    // checks for how many cards are selected and returns the appropriate object depending on the type of hand selected using the hand type checks
    // this looks awful i know i hate it too
    switch (cards.length) {
        case 1: // 1 card selected

            // High Card
            return {
                name: "High Card",
                score: 5,
                usedCards: [cards[0]]
            };

        case 2: // 2 cards selected

            // Pair
            if (counts[0] === 2) {
                let used = getUsedCards(rankCounts, 2);
                return { name: "Pair", score: 10, usedCards: used };
            }

            // High Card
            return { name: "High Card", score: 5, usedCards: [cards[0]] };

        case 3: // Three cards selected

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

        case 4: // 4 Cards selected

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

        case 5: // 5 Cards selected

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
                return { name: "Four of a Kind", score: 60, usedCards: used };
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
        if (!card) continue
        card.selected = false; // unmark all cards as selected
    }
    selected = []; // clear selected cards
    deck = deck.concat(hand); // move hand back into the deck
    hand = []; // clear the hand
    shuffle(deck, true); // shuffle the deck
}

// sets the upgrade threshold based on amount of antes.
function getUpgradeThreshold() {
    const growthRate = 1.5; // Adjust to make the growth faster or slower

    const threshold = baseUpgradeThreshold * Math.pow(growthRate, ante - 1); // math to increase ante
    return Math.round(threshold / 100) * 100; // Round to the nearest 100
}