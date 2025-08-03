/**
 * 
 * This script handles the rendering and UI elements of the game.
 * 
 * 
 * 
*/

console.error(`%cOI GET OUT OF THE CONSOLE GET THE FUCK OUT GET OUT GET OUT GET OUT`, 'color: red; font-size: 50px; background-color: white;')


function preload() {
  cardSpriteSheet = loadImage("assets/deck.png");
}

function setup() {
  let canvasWidth = max(windowWidth, 1200);
  let canvasHeight = max(windowHeight, 800);

  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.position(0, 0)
  canvas.style('z-index', '-1')
  canvas.id("gameCanvas");

  passivePerkDisplayDiv = document.getElementById('perkDisplay');
  debuffDisplayDiv = document.getElementById('debuffDisplay')
  updatePassivePerkDisplay();

  playBtn = new PlayHandButton(width / 2 - 65, height - 75);
  shuffleBtn = new ShuffleButton(width - 200, height - 75);

  noSmooth();
  textAlign(CENTER, CENTER);
  textSize(20);
  generateDeck();
  drawHand();

  // background stuff
  bgColours = [
    color(128, 15, 60),  // deep purple
    color(50, 5, 25)    // dark blue
  ];

  for (let i = 0; i < 15; i++) {
    blobs.push({
      x: random(width),
      y: random(height),
      baseR: random(100, 250),          // used for pulsing radius
      speed: random(0.0001, 0.0010),    // used for motion
      pulseSpeed: random(0.005, 0.001), // used for pulsing animation
      offset: random(TWO_PI)
    });
  }
}

function draw() {
  drawGradientBackground();

  blendMode(SOFT_LIGHT);
  for (let b of blobs) {
    let t = millis() * b.speed + b.offset;
    let pulse = sin(millis() * b.pulseSpeed + b.offset) * 20;

    let x = b.x + sin(t) * 30;
    let y = b.y + cos(t * 1.1) * 30;
    let r = b.baseR + pulse;

    drawGlowingBlob(x, y, r);
  }
  blendMode(BLEND);
  drawUI();
}

function windowResized() {
  let newWidth = max(windowWidth, 1200);
  let newHeight = max(windowHeight, 800);
  resizeCanvas(newWidth, newHeight);
}

function drawGlowingBlob(x, y, r) {
  let layers = 4;
  let c = lerpColor(bgColours[0], bgColours[1], 0.5);

  for (let i = layers; i >= 1; i--) {
    let radius = r * (i / layers);
    let alpha = 15 * i;

    // Optional: fade out edges near canvas border
    let d = dist(x, y, width / 2, height / 2);
    let edgeFade = map(d, 0, width * 0.75, 1, 0);
    edgeFade = constrain(edgeFade, 0, 1);
    fill(red(c), green(c), blue(c), alpha * edgeFade);

    ellipse(x, y, radius);
  }
}

function drawGradientBackground() {
  noStroke();

  let t = millis() * 0.0005; // slow time
  let colorShift = sin(t) * 0.5 + 0.5; // 0 to 1 range

  let topColour = lerpColor(bgColours[0], bgColours[1], colorShift);
  let bottomColour = lerpColor(bgColours[1], bgColours[0], colorShift);

  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(topColour, bottomColour, inter);
    fill(c);
    rect(0, y, width, 1);
  }
}

function drawUI() {
  if (gameState === "playing") {
    textSize(20);
    fill(255);
    text(`[ Score: ${score} ] [ Total Score: ${totalScore} ]`, width / 2, 90);
    text(`[ Upgrade Threshold: ${getUpgradeThreshold()} ]`, width / 2, 120);
    text(`[ Round: ${round}/${maxRounds} ] [ Ante: ${ante} ]`, width / 2, 150);
    text(`Deck: ${deck.length} cards left`, width / 2, 180);

    if (previewHandInfo && previewHandInfo.usedCards) {
      let baseScore = previewHandInfo.score;
      let multiplier = calculateRankMultiplier(previewHandInfo.usedCards);
      text(`Selected Hand: ${previewHandInfo.name} (${baseScore} x ${multiplier})`, width / 2, height - 100);
    }

    //
    drawHandUI();

    // Reshuffle button
    if (gameState === "playing" && reshuffleUses > 0 && selected.length >= 1 && selected.length <= 5) {
      shuffleBtn.updatePosition(width - 200, height - 75);
      shuffleBtn.draw();
    }

    // Play Hand button
    if (gameState === "playing" && selected.length >= 1 && selected.length <= 5) {
      playBtn.updatePosition(width / 2 - 65, height - 75);
      playBtn.draw();
    }
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
    anim.timer--;

    if (anim.timer <= 0 || 0) {
      eventTextAnimations.splice(i, 1);
    }
  }
}

function drawHandUI() {
  let size = hand.length;
  let spacing;

  if (size > 1) {
    spacing = Math.min((width - 2 * 15 - cardWidth) / (size - 1), cardWidth + 20);
  } else {
    spacing = 0;
  }

  let totalWidth = spacing * (size - 1) + cardWidth;
  let startX = (width - totalWidth) / 2;

  for (let i = 0; i < hand.length; i++) {
    let card = hand[i];
    if (!card ) continue; // stops the game from crashing if there's no more cards to draw
    if (isDragging && card === heldCard) continue; // do not render the card if it is being dragged

    let x = startX + i * spacing;
    let y = height / 2;
    card.draw(x, y);
  }

  // Draw the dragged card last so it appears on top
  if (heldCard && isDragging) {
    heldCard.draw(mouseX - dragOffsetX, mouseY - dragOffsetY);
  }
}

function getRarityColor(rarity) {
  switch (rarity) {
    case "Common": return color(200);
    case "Uncommon": return color(100, 200, 255); // blue
    case "Rare": return color(255, 100, 200); // pinkish purple
    default: return color(255);
  }
}

function drawUpgradeScreen() {
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(255);
  text("Choose an Upgrade", width / 2, 110);
  text(`Upgrades remaining: ${upgradePoints}`, width / 2, 140);

  for (let i = 0; i < upgradeChoices.length; i++) {
    let x = width / 2 - 250 + i * 250;
    let y = height / 2;

    fill(60);
    rect(x - 100, y - 100, 200, 200, 20);

    let choice = upgradeChoices[i];
    let rarityColor = getRarityColor(choice.data.rarity);

    // Draw name
    fill(rarityColor);
    textSize(16);
    text(choice.data.name, x, y - 40);

    // Draw rarity label
    textSize(12);
    text(`[${choice.data.rarity}]`, x, y - 20);

    // Draw description
    fill(255);
    textSize(12);
    text(choice.data.description, x - 90, y + 10, 180, 100);
  }
}

function drawGameOver() {
  fill(255);
  textAlign(CENTER);
  textSize(32);
  text("Game Over", width / 2, height / 2 - 100);
  textSize(20);
  text(`Final Score: ${totalScore}`, width / 2, height / 2 - 60);

  textSize(16);
  text("Enter your name (max 12 characters):", width / 2, height / 2);
  text(playerName, width / 2, height / 2 + 30);
}

function updatePassivePerkDisplay() {
  if (!passivePerkDisplayDiv) return;
  passivePerkDisplayDiv.innerHTML = '';

  passivePerks.forEach((perk, index) => {

    // defines the divs for the perks.
    const perkDiv = document.createElement('div');
    const perkDescDiv = document.createElement('div');

    // defines and sets 'perk-item' entries
    perkDiv.className = 'perk-item';
    perkDiv.innerHTML = `<strong>${perk.name}</strong>`;

    // defines and sets 'perk-desc' entries
    perkDescDiv.className = 'perk-desc';
    perkDescDiv.innerHTML = `<p>${perk.description}</p>
    <button id="removePerk" onclick="removePassivePerk(${index})">Remove</button>`;

    if (disabledPerk.includes(perk)) {
      perkDiv.style.opacity = "0.5";
      perkDiv.style.textDecoration = "line-through";
      perkDescDiv.style.textDecoration = "line-through";
      perkDiv.title = "Locked this round";
    }

    // sets the divs into the perk display.
    passivePerkDisplayDiv.appendChild(perkDiv);
    perkDiv.appendChild(perkDescDiv);
  })
}

function removePassivePerk(index) {
  passivePerks.splice(index, 1);
  updatePassivePerkDisplay();
}

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

