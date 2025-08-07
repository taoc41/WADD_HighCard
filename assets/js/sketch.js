/**
 * 
 * This script handles the rendering and UI elements of the game.
 *
*/

//#region preload()
function preload() {
  cardSpriteSheet = loadImage("assets/deck.png");
}

//#region setup()
function setup() {

  // canvas setup;
  let canvasWidth = max(windowWidth, 1200);
  let canvasHeight = max(windowHeight, 800);
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.position(0, 0)
  canvas.style('z-index', '-1')
  canvas.id("gameCanvas");

  // HTML perk/debuff display setup.
  passivePerkDisplayDiv = document.getElementById('perkDisplay');
  debuffDisplayDiv = document.getElementById('debuffDisplay')
  updatePassivePerkDisplay();

  // button setup
  // positions are set within the class because i am lazy and having it out here is pretty redundant imo
  playBtn = new PlayHandButton();
  shuffleBtn = new ShuffleButton();
  confirmBtn = new ConfirmButton();
  skipBtn = new SkipButton();
  burnBtn = new BurnButton();
  freezeBtn = new FreezeButton();

  // ui setup.
  noSmooth();
  textAlign(CENTER, CENTER);
  textSize(20);

  // game setup
  generateDeck();
  drawHand();

  // debug stuff goes here for testing
  // upgradePoints = 999999
  // debugUpgrade(); // temp

  // background setup
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

  // draws the background
  drawGradientBackground();

  // makes it look nicer
  blendMode(SOFT_LIGHT);

  // go thru all blobs in bg
  for (let b of blobs) {
    let t = millis() * b.speed + b.offset; // define the time
    let pulse = sin(millis() * b.pulseSpeed + b.offset) * 20; // pulsing


    let x = b.x + sin(t) * 30;
    let y = b.y + cos(t * 1.1) * 30;
    let r = b.baseR + pulse;

    drawGlowingBlob(x, y, r); // draws the blob
  }
  blendMode(BLEND);

  // draws the game ui
  drawUI();

}

// resizes the canvas + limits it to a minimum size of 1200 x 800
// the html displays would overlap onto the actual play area.
function windowResized() {
  let newWidth = max(windowWidth, 1200);
  let newHeight = max(windowHeight, 800);
  resizeCanvas(newWidth, newHeight);
}

// draws the glowing pulsing blobs in the backgrounds
function drawGlowingBlob(x, y, r) {
  let layers = 4;
  let c = lerpColor(bgColours[0], bgColours[1], 0.5);

  for (let i = layers; i >= 1; i--) {
    let radius = r * (i / layers);
    let alpha = 15 * i;

    // fade out edges near canvas border
    let d = dist(x, y, width / 2, height / 2);
    let edgeFade = map(d, 0, width * 0.75, 1, 0);
    edgeFade = constrain(edgeFade, 0, 1);
    fill(red(c), green(c), blue(c), alpha * edgeFade);

    ellipse(x, y, radius);
  }
}

// draws and shifts the gradient background colours.
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

// draws the whole game ui
function drawUI() {
  if (gameState === "playing") {
    textSize(20);
    fill(255);
    text(`[ Score: ${score} / ${getUpgradeThreshold()} ] [ Total Score: ${totalScore} ]`, width / 2, 90);
    text(`[ Round: ${round}/${maxRounds} ] [ Ante: ${ante} ]`, width / 2, 120);
    text(`Deck: ${deck.length} cards left`, width / 2, 150);

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
      shuffleBtn.updatePosition(width - 200, height - 75);
      shuffleBtn.draw();
    }

    // Play Hand button
    if (gameState === "playing" && selected.length >= 1 && selected.length <= 5) {
      // playBtn.updatePosition(width / 2 - 65, height - 75);
      playBtn.draw();
    }
  }

  drawHandUI(); // draw the hand UI

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

function drawHandUI() {
  let size = hand.length;
  const pad = 15;
  const stepMax = cardWidth + 20;

  let spacing;


  if (size > 1) {
    spacing = Math.min((width - 2 * pad - cardWidth) / (size - 1), stepMax);
  } else {
    spacing = 0;
  }

  let totalWidth = spacing * (size - 1) + cardWidth;
  let startX = (width - totalWidth) / 2;

  for (let i = 0; i < hand.length; i++) {
    let card = hand[i];
    if (!card) continue; // stops the game from crashing if there's no more cards to draw
    if (isDragging && card === heldCard) continue; // do not render the card if it is being dragged

    // calcuate the start
    let x = startX + i * spacing;
    let y = height / 2;

    if (gameState === "playing") {
      y = height / 2;
    } else if (gameState === "upgrade") {
      y = height / 2 + 75;
    }

    card.draw(x, y);
  }

  // Draw the dragged card last so it appears on top
  if (heldCard && isDragging) {
    heldCard.draw(mouseX - dragOffsetX, mouseY - dragOffsetY);
  }
}

// just a switch statement that returns colors lol
function getRarityColor(rarity) {
  switch (rarity) {
    case "Common": return color(200);                     // light gray
    case "Uncommon": return color(100, 200, 255);           // blue
    case "Rare": return color(255, 100, 200);           // pinkish purple
    case "Mythical": return color(255, 215, 0);             // gold (bright)
    case "Legendary": return color(255, 140, 0);             // orange (burnished gold)
    case "Cursed": return color(150, 0, 255);             // vivid purple
    default: return color(255);                     // fallback white
  }
}

function drawUpgradeScreen() {
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(255);
  text("Choose an Upgrade", width / 2, 110);
  text(`Upgrades remaining: ${upgradePoints}`, width / 2, 140);

  for (let i = 0; i < upgradeChoices.length; i++) {
    upgradeChoices[i].draw(i);
  }

  confirmBtn.draw();
  skipBtn.draw();
  burnBtn.draw();
  freezeBtn.draw();
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

    // changes style to reflect disabled state
    if (disabledPerk.includes(perk)) {
      perkDiv.style.opacity = "0.5";
      perkDiv.style.textDecoration = "line-through";
      perkDescDiv.style.textDecoration = "line-through";
      perkDiv.title = "Locked this round";
    }

    // sets the divs into the perk display.
    passivePerkDisplayDiv.appendChild(perkDiv);
    perkDiv.appendChild(perkDescDiv);
    document.getElementById("perkCount").textContent =
      `Abilities [ ${passivePerks.length} / ${MAX_PASSIVE_PERKS} ]:`
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

