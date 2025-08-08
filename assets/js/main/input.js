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
    }
}