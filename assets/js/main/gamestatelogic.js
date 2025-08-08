// this script stores the game state logic


//#region gameStateLogic()
// main function that handles everything
// below funtions are helper functions to refactor everything and make it all cleaner and not a bunch of if statements
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
// in seperate functions to make everything modular and cleaner
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
    upgradePoints = Math.floor(score / baseThreshold) + storedUpgradePoints; // adds upgrade points
    storedUpgradePoints = 0; // resets stored upgrade points if there were any
    totalScore += score; // add score to the total for leaderboard
    score = 0; // reset score for ante

    if (skipLock > 0) {
        skipLock--;
    } 

    // check if there are any upgrade points.
    if (upgradePoints > 0) {

        // skip upgrade phase if oblivous debuff exists
        const oblivious = activeDebuffs.find(d => d.name === "Oblivious"); // checks for oblivious debuff
        if (oblivious) {
            oblivious.effect();
            nextAnte(); 

        } else {
            // confirmUpgrade() handles this as well - this only initalizes upgrade phase.
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
        sendEventText(`Failed to reach score requirement, -1 stored upgrade!`);
    } else if (round === maxRounds + 1) {
        sendEventText(`You must meet the score requirement to progress!`);
    }

    storedUpgradePoints--;
    drawHand();
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
