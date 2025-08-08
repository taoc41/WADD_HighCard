// this script stores all input code (p5.js functions mostly)

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
        if (playBtn && playBtn.contains(mouseX, mouseY)) playBtn.onClick();
        
        // Handle shuffle button click
        if (shuffleBtn && shuffleBtn.contains(mouseX, mouseY)) shuffleBtn.onClick();
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

        // if the mouse is over the button, then you can click
        if (confirmBtn && confirmBtn.contains(mouseX, mouseY)) confirmBtn.onClick();
        if (skipBtn && skipBtn.contains(mouseX, mouseY)) skipBtn.onClick();
        if (endUpgradeBtn && endUpgradeBtn.contains(mouseX, mouseY)) endUpgradeBtn.onClick();
        if (burnBtn && burnBtn.contains(mouseX, mouseY)) burnBtn.onClick();
        if (freezeBtn && freezeBtn.contains(mouseX, mouseY)) freezeBtn.onClick();
    }
    
    // game over, enable button selection
    if (gameState === "gameover") {
        if (saveScoreBtn && saveScoreBtn.contains(mouseX, mouseY)) saveScoreBtn.onClick();
        if (playAgainBtn && playAgainBtn.contains(mouseX, mouseY)) playAgainBtn.onClick();
    }
}

//#region mouseDragged()
function mouseDragged() {
    // timer for when the card should start moving after clicking on it
    if (heldCard && !isDragging && millis() - holdStartTime > 200) {
        isDragging = true;
    }

    // drag the card and move it around
    if (isDragging && heldCard) {
        heldCard.x = mouseX - dragOffsetX;
        heldCard.y = mouseY - dragOffsetY;
    }
}

//#region mouseReleased()

function mouseReleased() {
    if (isDragging && heldCard) { // are we dragging a card?

        // initalize variables
        let minDist = Infinity; // guarantee that first comparison is always replaced with real distance
        let targetIndex = holdingCardIndex; // does nothing if no closer card is found

        for (let i = 0; i < hand.length; i++) { // loop all hand indicies
            if (i === holdingCardIndex) continue; // skip the held card
            const card = hand[i]; // initalize each card
            const d = dist(heldCard.x, heldCard.y, card.x, card.y); // measure the distance of the held card from each card's position via dist (p5.js)
            if (d < minDist) {
                minDist = d; // find minimum distance for each card
                targetIndex = i; // target the smallest distance
            }
        }

        if (minDist <= 150 && targetIndex !== holdingCardIndex) { // all yes? consider as valid drop
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
                // move backwaords: shift indices in [new, old) right by 1
                if (holdingCardIndex < insertAt && idx > holdingCardIndex && idx <= insertAt) return idx - 1;
                if (insertAt < holdingCardIndex && idx >= insertAt && idx < holdingCardIndex) return idx + 1;

                return idx;
            });

            // clean-up and reorder selected array

            // 1. temporarily creates a set to remove duplicate values, 
            // 2. converts set back into regular array
            // 3. keeps indicies that are valid:
            //          (i >= 0) -> no negative indexes. 
            //          (i < hand.length) -> no indexes past number of cards in hand
            // 4. sorts indices in ascending order.
            
            selected = Array.from(new Set(selected)) 
                .filter(i => i >= 0 && i < hand.length) 
                .sort((a, b) => a - b); 
        }

    } else if (heldCard) {
        // click based selection toggle (no drag)
        const idx = holdingCardIndex;
        if (heldCard.selected) { // is the card clicked already selected?
            selected = selected.filter(n => n !== idx); // remove from selected array
            heldCard.selected = false; // mark it as unselected
        } else if (selected.length < 5) { // otherwise, is selected less than 5?
            selected.push(idx); // add to selected array
            heldCard.selected = true; // mark as selected
        }
    }

    // resync `selected`
    // scan hand and push indicies where card.selected is true
    // prevents mismatching/ghosting between flags and index list

    //      1. loop through each card
    //      2. check if the slot (c) has a card (not null or undefined), and card selected flag is "true"
    //      3. above conditions met? add index back into hand array
    //      4. pass updated array onto next iteration
    //      5. next iteration starts with an empty array ( [] ) and builds back up with indicies of selected cards

    selected = hand.reduce((arr, c, i) => {
        if (c && c.selected) arr.push(i);
        return arr;
    }, []);

    if (gameState === "playing" && selected.length >= 1) {
        const chosenCards = selected.map(i => hand[i]).filter(Boolean); // filter out all "null" or ghosting selected cards
        previewHandInfo = evaluateHand(chosenCards); // evaluate the hand for preview

        // set the properties for the preview hand UI
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
