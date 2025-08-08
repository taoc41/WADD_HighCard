// this script stores the UI code

//#region drawGlowingBlob()
// draws the glowing pulsing blobs in the backgrounds
function drawGlowingBlob(x, y, r) {
    let layers = 4; // amount of circles to stack
    let c = lerpColor(bgColours[0], bgColours[1], 0.5); // pick a color halfway between the defined background colors

    for (let i = layers; i >= 1; i--) {
        let radius = r * (i / layers); // shrink diameter for inner layers
        let alpha = 15 * i; // outer layers become more transparent

        // fade out edges near canvas border
        let d = dist(x, y, width / 2, height / 2); // distance of blob from canvas center
        let edgeFade = map(d, 0, width * 0.75, 1, 0); // linearly reduce intensity farther away from center
        edgeFade = constrain(edgeFade, 0, 1); // clamp to [0, 1]
        fill(red(c), green(c), blue(c), alpha * edgeFade); // same RBG for all layers, alpha scaled by edge fade

        ellipse(x, y, radius); // draw each circle layer to mimick soft glow effect
    }
}

//#region drawGradientBackground()
// draws and shifts the gradient background colours.
function drawGradientBackground() {
    noStroke();

    let t = millis() * 0.0005; // slow time
    let colorShift = sin(t) * 0.5 + 0.5; // oscillate between 0 to 1 range

    // swap between these two colors back and forth to create breathing effect
    let topColour = lerpColor(bgColours[0], bgColours[1], colorShift);
    let bottomColour = lerpColor(bgColours[1], bgColours[0], colorShift);

    // create scanline gradient
    for (let y = 0; y < height; y++) { // for each pixel row
        let inter = map(y, 0, height, 0, 1); // normalized vertical position
        let c = lerpColor(topColour, bottomColour, inter); // row color

        // draw 1 pixel tall rectangle across whole width
        fill(c);
        rect(0, y, width, 1);
    }

}

//#region drawUI()
// draws the whole game ui
function drawUI() {
    if (gameState === "playing") {

        // draws the ui text
        textSize(20);
        fill(255);
        text(`[ Score: ${score} / ${getUpgradeThreshold()} ] [ Total Score: ${totalScore} ]`, width / 2, 90);
        text(`[ Round: ${round}/${maxRounds} ] [ Ante: ${ante} ]`, width / 2, 120);

        let deckTextHeight;
        if (storedUpgradePoints > 0) {
            text(`[ Stored upgrades: ${storedUpgradePoints} ]`, width / 2, 150);
            deckTextHeight = 180;
        } else {
            deckTextHeight = 150
        }

        text(`Deck: ${deck.length} cards left`, width / 2, deckTextHeight);

        if (previewHandInfo && previewHandInfo.usedCards) {
            let baseScore = previewHandInfo.score; // defines the base score.
            let chosenCards = selected.map(i => hand[i]); // defines the selected hand.

            // if all for one is active -> use all ranks in selected cards
            let allForOne = passivePerks.some(p => p.name === "All for One")
            let multiplier = allForOne ? calculateRankMultiplier(chosenCards) : calculateRankMultiplier(previewHandInfo.usedCards);

            // display text information
            text(`Selected Hand: ${previewHandInfo.name} (${baseScore} x ${multiplier})`, width / 2, height - 100);
        }

        // Reshuffle button
        if (gameState === "playing" && reshuffleUses > 0 && selected.length >= 1 && selected.length <= 5) {
            shuffleBtn.draw();
        }

        // Play Hand button
        if (gameState === "playing" && selected.length >= 1 && selected.length <= 5) {
            playBtn.draw();
        }
    }

    // logic of what screen to render based on game state
    if (gameState === "playing" || gameState === "upgrade") {
        drawHandUI();
    }

    if (gameState === "upgrade") {
        drawUpgradeScreen();
    }

    if (gameState === "gameover") {
        drawGameOver();
    }

    // Event Text
    for (let i = eventTextAnimations.length - 1; i >= 0; i--) {
        let anim = eventTextAnimations[i];

        push(); // isolate text styles.
        fill(255, anim.opacity);
        textAlign(CENTER);
        textSize(24);
        text(anim.text, anim.x, anim.y);
        pop(); // restore previous text styles

        anim.opacity -= 4;
        anim.y -= 0.5;
        anim.timer--; // probably shouldn't be tied to frame rate but im lazy

        if (anim.timer <= 0 || 0) {
            eventTextAnimations.splice(i, 1); // remove the text from the array when timer expires.
        }
    }
}

//#region sendEventText()
// sends the event text because i realise writing this exact same code everywhere is a pain.
function sendEventText(text) {
    const areaWidth = 400;
    const areaHeight = 200;

    const x = random((width - areaWidth) / 2, (width + areaWidth) / 2);
    const y = random((height - areaHeight) / 4, (height + areaHeight) / 4);

    eventTextAnimations.push({
        text: text,
        x,
        y,
        opacity: 255,
        timer: 60
    });
}

//#region drawHandUI()
function drawHandUI() {
    let size = hand.length;
    const pad = 15;
    const stepMax = cardWidth + 20;

    let spacing;

    // calculate the spacing of the card if handsize is more than 1
    if (size > 1) {
        spacing = Math.min((width - 2 * pad - cardWidth) / (size - 1), stepMax);
    } else {
        spacing = 0;
    }

    let totalWidth = spacing * (size - 1) + cardWidth; // calculates the width of the whole hand together
    let startX = (width - totalWidth) / 2; // calculates the X of where the card should be drawn

    for (let i = 0; i < hand.length; i++) { // iterate through each card in hand
        let card = hand[i]; // define each card.
        if (!card) continue; // continue if there's no more cards left to draw
        if (isDragging && card === heldCard) continue; // do not render the card if it is being dragged

        let x = startX + i * spacing; // where should the card be drawn on the X axis
        let y; // initalize y position

        if (gameState === "playing") {
            y = height / 2; // center screen if playing
        } else if (gameState === "upgrade") {
            y = height / 2 + 75; // just below upgrades if upgrade phase
        }

        card.draw(x, y); // draw the card
    }

    // Draw the dragged card last so it appears on top
    if (heldCard && isDragging) {
        heldCard.draw(mouseX - dragOffsetX, mouseY - dragOffsetY);
    }
}

//#region drawUpgradeScreen()
function drawUpgradeScreen() {
    textAlign(CENTER, CENTER);
    textSize(24);
    fill(255);
    text("Choose an Upgrade", width / 2, 90);
    text(`Upgrades remaining: ${upgradePoints}`, width / 2, 120);

    for (let i = 0; i < upgradeChoices.length; i++) {
        upgradeChoices[i].draw(i);
    }

    confirmBtn.draw();
    skipBtn.draw();
    burnBtn.draw();
    freezeBtn.draw();
    endUpgradeBtn.draw();
}

//#region getRarityColor()
// just a switch statement that returns colors lol
function getRarityColor(rarity) {
    switch (rarity) {
        case "Common": return color(200);                   // light gray
        case "Uncommon": return color(100, 200, 255);       // blue
        case "Rare": return color(255, 100, 200);           // pinkish purple
        case "Mythical": return color(255, 215, 0);         // gold (bright)
        case "Legendary": return color(255, 140, 0);        // orange (burnished gold)
        case "Cursed": return color(150, 0, 255);           // vivid purple
        default: return color(255);                         // fallback to white if no rarity found
    }
}

//#region drawGameOver()
function drawGameOver() {
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text("Game Over", width / 2, height / 2 - 100);
    textSize(20);
    text(`Final Score: ${totalScore}`, width / 2, height / 2 - 60);

    textSize(16);
    text("Enter your name (max 12 characters):", width / 2, height / 2);

    // text input for name
    nameInput.position(width / 2 - 100, height / 2 + 30);
    nameInput.show();

    // draw the buttons
    playAgainBtn.draw();
    saveScoreBtn.draw();
}

//#region updatePassivePerkDisplay()
function updatePassivePerkDisplay() {
  const display = document.getElementById("perk-display");
  const header  = document.getElementById("perk-header");
  if (!display || !header) return;

  // Clear current list efficiently
  display.replaceChildren();

  // Build each perk item
  passivePerks.forEach((perk, index) => {
    const item = document.createElement("div");
    item.className = "perk-item";

    const title = document.createElement("div");
    title.className = "perk-title";
    title.innerHTML = `<strong>${perk.name}</strong>`;

    const desc = document.createElement("div");
    desc.className = "perk-desc";
    desc.innerHTML = `
      <p>${perk.description}</p>
      <button class="removePerk" onclick="removePassivePerk(${index})">Remove</button>
    `;

    // Disabled styling
    if (disabledPerk && disabledPerk.includes(perk)) {
      item.style.opacity = "0.5";
      item.style.textDecoration = "line-through";
      desc.style.textDecoration = "line-through";
      item.title = "Locked this round";
    }

    item.appendChild(title);
    item.appendChild(desc);
    display.appendChild(item);
  });

  // Update the header count while preserving the arrow element
  // <h3 id="perkCount"><span class="arrow">▶</span> Abilities [ 0 / 5 ]:</h3>
  let countSpan = header.querySelector(".count-label");
  if (!countSpan) {
    // Create a dedicated span to hold the dynamic text so we never overwrite the arrow
    countSpan = document.createElement("span");
    countSpan.className = "count-label";
    header.appendChild(countSpan);
  }
  countSpan.textContent = ` Abilities [ ${passivePerks.length} / ${maxPassivePerks} ]:`;
}

//#region removePassivePerk();
function removePassivePerk(index) {
    passivePerks.splice(index, 1);
    updatePassivePerkDisplay();
}

//#region updateDebuffDisplay()
function updateDebuffDisplay() {
    if (!debuffDisplayDiv) return;
    debuffDisplayDiv.innerHTML = '';

    const debuffMap = new Map();

    // checks if the buff exists already, +1 to the counter for the first instance.
    activeDebuffs.forEach(debuff => {
        if (!debuffMap.has(debuff.name)) {
            debuffMap.set(debuff.name, { count: 1, description: debuff.description });
        } else {
            debuffMap.get(debuff.name).count++;
        }
    });

    // Display each unique debuff with count
    debuffMap.forEach((value, name) => {
        const debuffDiv = document.createElement('div');
        const debuffDescDiv = document.createElement('div');

        debuffDiv.className = 'debuff-item';
        debuffDescDiv.className = 'debuff-desc';

        const displayName = value.count > 1 ? `${name} (x${value.count})` : name;

        debuffDiv.innerHTML = `<strong>${displayName}</strong>`;
        debuffDescDiv.innerHTML = `<p>${value.description}</p>`;

        debuffDisplayDiv.appendChild(debuffDiv);
        debuffDiv.appendChild(debuffDescDiv);
    });
}

