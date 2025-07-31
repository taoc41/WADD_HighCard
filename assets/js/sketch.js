let suits = ['♠', '♥', '♦', '♣'];
let ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
let playBtn, shuffleBtn;

// Perks List, seperated for ease of access.
// USE CTRL + F TO FIND PERKS, PASSIVE_PERKS.

const PERKS = [
  {
    name: "Bonus Draw",
    description: "Add 2 random cards to your deck.",
    rarity: "Common",
    apply: () => {
      for (let i = 0; i < 2; i++) deck.push(generateRandomCard());
    }
  },
  {
    name: "Extra Shuffle",
    description: "Add +1 reshuffle.",
    rarity: "Common",
    apply: () => {
      reshuffleUses++;
    }
  },
  {
    name: "Flush Finder",
    description: "Add 3 cards of the same suit.",
    rarity: "Common",
    apply: () => {
      let suit = random(suits);
      for (let i = 0; i < 3; i++) deck.push(generateRandomCard(suit));
    }
  },
  {
    name: "Straight Edge",
    description: "Add 3 sequential cards.",
    apply: () => {
      let start = floor(random(0, ranks.length - 2)); // avoid overflow
      let suit = random(suits);
      for (let i = 0; i < 3; i++) {
        deck.push(new Card(ranks[start + i], suit));
      }
    }
  },
  {
    name: "Balanced Hand",
    description: "Add 1 card of each suit.",
    rarity: "Uncommon",
    apply: () => {
      suits.forEach(suit => {
        deck.push(generateRandomCard(suit));
      });
    }
  },
  {
    name: "High Stakes",
    description: "Add 2 random face cards.",
    rarity: "Uncommon",
    apply: () => {
      let faceRanks = ['J', 'Q', 'K'];
      for (let i = 0; i < 2; i++) {
        let suit = random(suits);
        let rank = random(faceRanks);
        deck.push(new Card(rank, suit));
      }
    }
  },
  {
    name: "Duplicate",
    description: "Add 2 copies of a random card from your deck.",
    rarity: "Common",
    apply: () => {
      if (deck.length === 0) return;
      let c = random(deck);
      for (let i = 0; i < 2; i++) {
        deck.push(new Card(c.rank, c.suit));
      }
    }
  },
  {
    name: "Extra Card",
    description: "Add 1 card to the total amount displayed in your hand. (10 Max)",
    rarity: "Rare",
    apply: () => {
      if (deck.length < 10) return;
      handSize++
    }
  }
];

const PASSIVE_PERKS = [
  {
    name: "Lucky Clover",
    description: "Multiply score by 1.5 if hand contains at least one ♣.",
    rarity: "Rare",
    condition: (playedCards, _) => playedCards.some(card => card.suit === '♣'),
    effect: (score) => score * 1.5
  },
  {
    name: "Flush Bonus",
    description: "Gain 50 bonus points if all cards are the same suit.",
    rarity: "Common",
    condition: (playedCards, _) => new Set(playedCards.map(c => c.suit)).size === 1,
    effect: (score) => score + 50
  },
  {
    name: "Face Card Fan",
    description: "Double score if hand contains only J, Q, K.",
    rarity: "Uncommon",
    condition: (playedCards, _) => playedCards.every(c => ['J', 'Q', 'K'].includes(c.rank)),
    effect: (score) => score * 2
  },
  {
    name: "Low Roll",
    description: "Add 1 random card to your deck if all ranks are 6 or lower.",
    rarity: "Uncommon",
    condition: (playedCards, _) => playedCards.every(c => ranks.indexOf(c.rank) <= 4),
    effect: (score) => {
      deck.push(generateRandomCard());
      return score;
    }
  },
  {
    name: "Repeated Rhythm",
    description: "Multiply score by 2 if you played the same hand type as last round.",
    rarity: "Common",
    condition: (playedCards, _) => currentHandInfo.name && lastHandInfo.name === currentHandInfo.name,
    effect: (score) => score * 2
  },
  {
    name: "Thick Stack",
    description: "At the start of every ante, gain 3 random cards to your deck.",
    rarity: "Uncommon",
    condition: (_, __) => round === 1,
    effect: (score) => {
      for (let i = 0; i < 3; i++) deck.push(generateRandomCard());
      return score;
    }
  }
];

const RARITY_WEIGHTS = {
  Common: 0.6,
  Uncommon: 0.3,
  Rare: 0.1
}

/**
* Base class for the game UI buttons.
* @param {*} x The X position of the Button.
* @param {*} y The Y position of the Button.
* @param {*} w The width of the button
* @param {*} h 
* @param {*} label 
*/
class GameButton {

  constructor(x, y, w, h, label) {
      this.x = x;
      this.y = y;
      this.h = h;
      this.w = w;
      this.label = label;
      this.visible = true;
  }

  draw() {
      if (!this.visible) return; // If "visible" is false, stop the function here.
      fill(0, 200, 0);
      rect(this.x, this.y, this.w, this.h, 10);
      fill(255);
      text(this.label, this.x + this.w / 2, this.y + this.h / 2);
  }

  contains(mx, my){
      return (
          mx >= this.x &&
          mx <= this.x + this.w &&
          my >= this.y &&
          my <= this.y + this.h
      );
  }

  onClick() {
      // To be overridden in subclass.
      throw new Error("onClick () must be overriden by subclass");
  }
}

class PlayHandButton extends GameButton {
  
  constructor(x, y) {
      super (x, y, 120, 40, "Play Hand");
  }

  onClick() {
      playHand();
  }
}

class ShuffleButton extends GameButton {
  constructor(x, y) {
      super(x, y, 140, 40, `Reshuffle (${reshuffleUses})`);
  }

  draw(){
      this.label = `Reshuffle (${reshuffleUses})`; // update label each frame.
      super.draw();
  }

  onClick() {
      reshuffleHand()
      console.log("After drawHand:", selected.map(c => c.rank + c.suit));
  }
}

// #region Suit and Card Maps

const suitMap = {
  '♥': 0, // Hearts
  '♣': 1, // Clubs
  '♦': 2, // Diamonds
  '♠': 3  // Spades
};

const rankMap = {
  '2': 0,
  '3': 1,
  '4': 2,
  '5': 3,
  '6': 4,
  '7': 5,
  '8': 6,
  '9': 7,
  '10': 8,
  'J': 9,
  'Q': 10,
  'K': 11,
  'A': 12
};

// Rank Value Map (different from rankMap because thats used for sprites)
const rankValueMap = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
}; // This is like this because I don't want to keep scrolling down a massive list of numbers


class Card {
  constructor (rank, suit) {
      this.rank = rank;
      this.suit = suit;
      this.selected = false;
      this.x = 0;
      this.y = 0;
      this.width = cardWidth;
      this.height = cardHeight;
  }

  /** 
   * Draws the playing card into the UI.
   * @param {*} x The X position of the card.
   * @param {*} y The Y position of the card. */
  draw(x, y) {

      // Sets the origin X and Y of each card.
      this.x = x;
      this.y = y;

      // Sets the origin X and Y positions of the specific sprite within the sprite sheet.
      let sx = rankMap[this.rank] * this.width;
      let sy = suitMap[this.suit] * this.height;

      /** 
       * Is the card selected? (Shortened If statement for clarity.)
       * Change the color of the card to gold if YES.
       * Otherwise default to white if NO. */
      fill(this.selected ? 'gold' : 'white');
      rect(x, y, cardWidth, cardHeight, 5);

      // Draws the sprite over the rect.
      image (cardSpriteSheet, x, y, this.width, this.height, sx, sy, this.width, this.height);
  }

  contains(mx, my) {
      return mx > this.x && mx < this.x + this.width &&
      my > this.y && my < this.y + this.height;
  }
}

// #endregion

// #region Globals
let cardSpriteSheet;
const cardWidth = 71;
const cardHeight = 95;

let deck = [];                // Array to hold all cards within the deck.
let hand = [];                // Array to hold all cards drawn into the hand.
let selected = [];            // Array to hold all cards currently selected by the player.
let handSize = 7;             // Amount of cards drawn into the hand.
let reshuffleUses = 10;       // Amount of reshuffles the player can use.

let eventTextAnimations = [];  // Array to hold currently playing event text.

let totalScore = 0;           // Total score across the game
let score = 0;                // Score earned in the current ante
let upgradePoints = 0;        // Number of upgrades allowed in this ante
let upgradeThreshold = 300;   // Base threshold score for one upgrade

let round = 1;                // Current round number.
let ante = 1;                 // Current ante number.
let maxRounds = 5;            // Maximum amount of rounds needed to play before proceeding onto the next ante.

let gameState = "playing";    // "playing", "upgrade", or "gameover"
let lastAction = "none"       // "none", "playhand", "reshuffle"

let passivePerks = [];        // Array to hold all acquired passive perks
let upgradeChoices = [];      // Array to hold all upgrade choices that the player can select, used for upgrade phase

let previewHandInfo = null;   // Preview and Current hand info are seperated as to not cause issues with overwriting.
let currentHandInfo = null;   
let lastHandInfo = null;

// add cards to deck
let pickedCards = 0;
let pickedIndices = [];

// Background stuff
let bgColours;
let blobs = [];

let playerName = ""; // for final score;

const MAX_PASSIVE_PERKS = 5;
let passivePerkDisplayDiv;

const gameDiv = document.getElementById("gameDiv")

// #endregion

function preload() {
  cardSpriteSheet = loadImage("assets/deck.png");
}

function setup() {
  let canvas = createCanvas(800, 500);
  canvas.id("gameCanvas");
  canvas.parent("gameDiv");

  passivePerkDisplayDiv = document.getElementById('perkDisplay');
  updatePassivePerkDisplay();

  playBtn = new PlayHandButton(width / 2 - 65, height - 75);
  shuffleBtn = new ShuffleButton(width - 200, height - 75);

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
  let needed = handSize - hand.length;
  let drawn = deck.splice (0, needed);
  hand = hand.concat(drawn);
}

function drawUI() {
  if (gameState === "playing") {
    textSize(20);
    fill(255);
    text(`[ Score: ${score} ] [ Total Score: ${totalScore} ]`, width / 2, 30);
    text(`[ Upgrade Threshold: ${upgradeThreshold * Math.pow(1.5, ante - 1)} ]`, width / 2, 60);
    text(`[ Round: ${round}/${maxRounds} ] [ Ante: ${ante} ]`, width/2, 90);
    text(`Deck: ${deck.length} cards left`, width / 2, 120);

    if (previewHandInfo && previewHandInfo.usedCards) {
      let baseScore = previewHandInfo.score;
      let multiplier = calculateRankMultiplier(previewHandInfo.usedCards);
      text(`Selected Hand: ${previewHandInfo.name} (${baseScore} x ${multiplier})`, width / 2, height - 100);
    }

    //
    drawHandUI();

    // Reshuffle button
    if (gameState === "playing" && reshuffleUses > 0 && selected.length >= 1 && selected.length <= 5) {
      shuffleBtn.draw();
    }

    // Play Hand button
    if (gameState === "playing" && selected.length >= 1 && selected.length <= 5) {
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
    fill (255, anim.opacity);
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
  let handSize = hand.length;
  let spacing;

  if (handSize > 1) {
    spacing = Math.min ((width - 2 * 15 - cardWidth) / (handSize - 1), cardWidth + 20);
  } else {
    spacing = 0;
  }

  let totalWidth = spacing * (handSize - 1) + cardWidth;
  let startX = (width - totalWidth) / 2;

  for (let i = 0; i < hand.length; i++) {
    let card = hand[i];
    if (!card) continue; // stops the game from crashing if there's no more cards to draw

    let x = startX + i * spacing;
    let y = height / 2;
    card.draw(x, y);
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
  text("Choose an Upgrade", width / 2, 50);

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

function drawGameOver(){
  fill(255);
  textAlign(CENTER);
  textSize(32);
  text("Game Over", width / 2, height / 2 - 100);
  textSize(20);
  text(`Final Score: ${totalScore}`, width / 2, height / 2 - 60);

  textSize(16);
  text("Enter your name (max 12 characters):", width / 2 , height / 2);
  text(playerName, width / 2, height / 2 + 30);
}

function mousePressed() {

  /** CARD SELECTION HANDLER
   * Probably should be put in the card class. */
  for (let i = 0; i < hand.length; i++) { // Checks through every card in the current hand.
    let card = hand[i];

    if (card && card.contains(mouseX, mouseY)) {
      if (card.selected) {
        selected = selected.filter(n => n !== i);
        card.selected = false;
      } else if (selected.length < 5) {
        selected.push(i);
        card.selected = true;
      }
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

function keyTyped() {
  if (gameState === "gameover") {
    if (playerName.length < 12 && key.match(/^[a-zA-Z0-9 ]$/)) {
      playerName += key;
    }
  }
}

function keyPressed(){
  if (gameState === "gameover") {
    if (keyCode === BACKSPACE) {
      playerName = playerName.slice(0, -1);
    }
    if (keyCode === ENTER && playerName.trim () !== "") {
      saveScore(playerName.trim(), totalScore);
      window.location.href = "leaderboard.html"; // redirect to leaderboard
    }
  }
}

function saveScore(name, score) {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.push({name, score});
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function playHand(){
  selected = selected.filter(i => hand[i] !== null && hand[i] !== undefined);
  let chosenCards = selected.map(i => hand[i]);

  currentHandInfo = evaluateHand(chosenCards);

  let baseScore = currentHandInfo.score;
  let multiplier = calculateRankMultiplier(currentHandInfo.usedCards);
  let finalScore = baseScore * multiplier;


  // Apply passive perks
  passivePerks.forEach(perk => {
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
    // Convert ante score into upgrades
    let baseThreshold = upgradeThreshold * Math.pow(1.5, ante - 1);
    upgradePoints = Math.floor(score / baseThreshold);

    // Transfer score to totalScore
    totalScore += score;
    score = 0;

    if (upgradePoints > 0) {
      gameState = "upgrade";
      generateUpgradeChoice();
    } else {
      ante++
      round = 1;
      drawHand();
    }
  } else {
    drawHand();
  }
}

function reshuffleHand(){
  selected = selected.filter(i => hand[i] !== null && hand[i] !== undefined);

  if (selected.length === 0 || reshuffleUses <= 0) return;

  let chosenCards = selected.map(i => hand[i]);
  chosenCards.forEach(c => c.selected = false);
  deck.push (...chosenCards);
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

function weightedRandomRarity() {
  let r = random();
  let cumulative = 0;
  for (let rarity in RARITY_WEIGHTS) {
    cumulative += RARITY_WEIGHTS[rarity];
    if (r < cumulative) return rarity;
  }
  return "Common";
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
  }

  upgradePoints--;

  if (upgradePoints > 0) {
    generateUpgradeChoice();
  } else {
    gameState = "playing";
    ante++
    round = 1;
    drawHand();
  }
}

function generateUpgradeChoice() {
  const availablePerks = PASSIVE_PERKS.filter(p => !passivePerks.some(pp => pp.name === p.name));
  const availablePacks = [...PERKS];

  const mixedChoices = [];

  while (mixedChoices.length < 3) {
    let isPerk = random() < 0.25;
    let rarity = weightedRandomRarity();

    if (isPerk && availablePerks.length > 0) {
      let filtered = availablePerks.filter(p => p.rarity === rarity);
      if (filtered.length > 0) {
        let perk = random(filtered);
        mixedChoices.push({ type: "passive", data: perk });
        availablePerks.splice(availablePerks.indexOf(perk), 1);
        continue;
      }
    }

    if (!isPerk && availablePacks.length > 0) {
      let filtered = availablePacks.filter(p => p.rarity === rarity);
      if (filtered.length > 0) {
        let pack = random(filtered);
        mixedChoices.push({ type: "pack", data: pack });
        availablePacks.splice(availablePacks.indexOf(pack), 1);
        continue;
      }
    }
  }

  upgradeChoices = mixedChoices;
}

function updatePassivePerkDisplay() {
  if (!passivePerkDisplayDiv) return;
  passivePerkDisplayDiv.innerHTML = '';
  
  passivePerks.forEach((perk, index) => {
    const perkDiv = document.createElement('div');
    perkDiv.className = 'perk-item';
    perkDiv.innerHTML = `
    <strong>${perk.name}</strong> - ${perk.description}
    <button id="removePerk" onclick="removePassivePerk(${index})">Remove</button>
    `;
    passivePerkDisplayDiv.appendChild(perkDiv)
  })
}

function removePassivePerk(index) {
  passivePerks.splice(index, 1);
  updatePassivePerkDisplay();
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
  const getCardsByRank = (rank) => cards.filter(c => c.rank === rank); // return all cards from `cards` that match a specific rank
  const getUsedCards = (rankCountMap, count) =>                        // return all cards that appears `count` times in the hand.
    Object.entries(rankCountMap)                                       // rankCountMap is an object, e.g. { 'A': 2, '10, 'J': 2 }, this line converts it to [['A', 2], ['10', 1], ['J', 2]].
      .filter(([_, cnt]) => cnt === count)                             // keeps entries where the count matches the value that we are interested in
      .flatMap(([rank]) => getCardsByRank(rank));                      // for each matching rank, pull all cards with that rank using `getCardByRank`. flatMap flattens the array into single card objects.

  // Checks for how many cards are selected and returns the appropriate object depending on the type of hand selected using the hand type checks
  switch (cards.length) {
    case 1: // One card selected

      // High Card
      return {
        name: "High Card", 
        score: 5, 
        usedCards: [cards[0]]
      };

    case 2: // Two cards selected
      
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

    case 4:

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
        return { name: "Flush Five", score: 120, usedCards: cards };
      }

      // Five of a Kind
      if (counts[0] === 5) {
        let used = getUsedCards(rankCounts, 5);
        return { name: "Five of a Kind", score: 110, usedCards: used };
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
        // Full House = Three of a Kind + Pair
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

// Debug functions

function debugUpgrade(){
  gameState = "upgrade";
  generateUpgradeChoice();
}

function debugSetHand(cardDataArray) {
  if (!Array.isArray(cardDataArray)) {
    console.error("Expected an array of card objects.");
    return;
  }

  hand = cardDataArray.map(data => {
    let { rank, suit } = data;
    return new Card(rank, suit);
  });

  drawHand();
}