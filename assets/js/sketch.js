let suits = ['♠', '♥', '♦', '♣'];
let ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
let playBtn, shuffleBtn;

// Perks List, seperated for ease of access.
// USE CTRL + F TO FIND PERKS, PASSIVE_PERKS.

const PERKS = [
  {
    name: "Bonus Draw",
    description: "Add 2 random cards to your deck.",
    apply: () => {
      for (let i = 0; i < 2; i++) deck.push(generateRandomCard());
    }
  },
  {
    name: "Flush Finder",
    description: "Add 3 cards of the same suit.",
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
    name: "Suit Stack",
    description: "Pick a suit and gain 4 cards of it.",
    apply: () => {
      let suit = prompt("Choose a suit: ♠, ♥, ♦, ♣") || "♠";
      if (!suits.includes(suit)) suit = "♠";
      for (let i = 0; i < 4; i++) deck.push(generateRandomCard(suit));
    }
  },
  {
    name: "Balanced Hand",
    description: "Add 1 card of each suit.",
    apply: () => {
      suits.forEach(suit => {
        deck.push(generateRandomCard(suit));
      });
    }
  },
  {
    name: "High Stakes",
    description: "Add 2 random face cards.",
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
    apply: () => {
      if (deck.length === 0) return;
      let c = random(deck);
      for (let i = 0; i < 2; i++) {
        deck.push(new Card(c.rank, c.suit));
      }
    }
  }
];

const PASSIVE_PERKS = [
  {
    name: "Lucky Clover",
    description: "Multiply score by 1.5 if hand contains at least one ♣.",
    condition: (playedCards) => playedCards.some(card => card.suit === '♣'),
    effect: (score) => score * 1.5
  },
  {
    name: "Flush Bonus",
    description: "Gain 50 bonus points if all cards are the same suit.",
    condition: (playedCards) => new Set(playedCards.map(c => c.suit)).size === 1,
    effect: (score) => score + 50
  },
  {
    name: "Face Card Fan",
    description: "Double score if hand contains only J, Q, K.",
    condition: (playedCards) => playedCards.every(c => ['J', 'Q', 'K'].includes(c.rank)),
    effect: (score) => score * 2
  },
  {
    name: "Low Roll",
    description: "Add 1 random card to your deck if all ranks are 6 or lower.",
    condition: (playedCards) => playedCards.every(c => ranks.indexOf(c.rank) <= 4),
    effect: (score) => {
      deck.push(generateRandomCard())
      return score;
    }
  },
  {
    name: "Repeated Rhythm",
    description: "Multiply score by 2 if you played the same hand type as last round.",
    condition: (playedCards) => currentHandInfo.name && lastHandInfo.name === currentHandInfo.name,
    effect: (baseScore) => baseScore * 2
  },
  {
    name: "Thick Stack",
    description: "At the start of every ante, gain 3 random cards to your deck.",
    condition: () => round === 1,
    effect: (score) => {
      for (let i = 0; i < 3; i++) deck.push(generateRandomCard());
      return score;
    }
  },
  {
    name: "Backup Plan",
    description: "If score is below 30, add a random card to your deck.",
    condition: (_, baseScore) => baseScore < 30,
    effect: (score) => {
      deck.push(generateRandomCard());
      return score;
    }
  }
];


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

let suitMap = {
  '♥': 0, // Hearts
  '♣': 1, // Clubs
  '♦': 2, // Diamonds
  '♠': 3  // Spades
};

let rankMap = {
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

class Card {
  constructor (rank, suit) {
      this.rank = rank;
      this.suit = suit;
      this.selected = false;
      this.x = 0;
      this.y = 0;
      this.width = cardWidth;
      this.height = cardHeight;
      this.animationOffset = random(TWO_PI);
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
let cardWidth = 71;
let cardHeight = 95;

let deck = [];
let hand = [];
let selected = [];
let perkTextAnimations = [];
let score = 0;
let round = 1;
let ante = 1;
let maxRounds = 5;


let gameState = "playing"; // "playing", "upgrade", or "end"
let passivePerks = [];

let previewHandInfo = null; // Preview and Current hand info are seperated as to not cause issues with overwriting.
let currentHandInfo = null;
let lastHandInfo = null;

// add cards to deck
let pickedCards = 0;
let pickedIndices = [];

let reshuffleUses = 99;
let bgColours;
let blobs = [];

const gameDiv = document.getElementById("gameDiv")

// #endregion

function preload() {
  cardSpriteSheet = loadImage("assets/deck.png");
}

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.id("gameCanvas");
  canvas.parent("gameDiv");

  playBtn = new PlayHandButton(width / 2 - 60, height - 100,);
  shuffleBtn = new ShuffleButton(width - 100, height - 100);

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
  let needed = 5  - hand.length;
  let drawn = deck.splice (0, needed);
  hand = hand.concat(drawn);
}

function drawUI() {
  if (gameState === "playing") {
    fill(255);
    text(`[ Chips: ${score} ] [ Total Chips: NaN ]`, width / 2, 30);
    text(`[ Round: ${round}/${maxRounds} ] [ Ante: ${ante} ]`, width/2, 60);
    text(`Deck: ${deck.length} cards left`, width / 2, 90);

    if (previewHandInfo) {
      text(`Selected Hand: ${previewHandInfo.name} (${previewHandInfo.score} pts)`, width / 2, 130);
    }

    for (let i = 0; i < hand.length; i++) {
      let x = 100 + i * 130;
      let y = height / 2;
      hand[i].draw(x, y);
    }

    // Reshuffle button
    if (gameState === "playing" && reshuffleUses > 0 && selected.length >= 1 && selected.length <= 3) {
      shuffleBtn.draw();
    }

    // Play Hand button
    if (gameState === "playing" && selected.length >= 1 && selected.length <= 3) {
      playBtn.draw();
    }
  }
  
  if (gameState === "upgrade") {
    fill(255);
    text("Choose a card to add to your deck", width / 2, 40);
    let totalWidth = upgradeOptions.length * 110 + (upgradeOptions.length - 1) * 20;
    let startX = (width - totalWidth) / 2;

    for (let i = 0; i < upgradeOptions.length; i++) {
    let x = startX + i * (110 + 20); // 110 is card width, 20 is spacing
    drawCard(upgradeOptions[i], x, height / 2, pickedIndices.includes(i));
    }
  }

  for (let i = perkTextAnimations.length - 1; i >= 0; i--) {
    let anim = perkTextAnimations[i];
    
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
      perkTextAnimations.splice(i, 1);
    }
  }
}

function mousePressed() {

  /** CARD SELECTION HANDLER
   * Probably should be put in the card class. */
  for (let i = 0; i < hand.length; i++) { // Checks through every card in the current hand.
    let card = hand[i];

    if (card.contains(mouseX, mouseY)) {
      if (card.selected) {
        selected = selected.filter(n => n !== i);
        card.selected = false;
      } else if (selected.length < 3) {
        selected.push(i);
        card.selected = true;
      }
    }
  }

  // Updates the preview hand info 
  if (selected.length >= 1) {
    let chosenCards = selected.map(i => hand[i]);
    previewHandInfo = evaluateHand(chosenCards);
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

}

function playHand(){
  selected = selected.filter(i => hand[i] !== null && hand[i] !== undefined);
  let chosenCards = selected.map(i => hand[i]);
  currentHandInfo = evaluateHand(chosenCards);

  // Apply passive perks
  let finalScore = currentHandInfo.score;
  passivePerks.forEach(perk => {
    if (perk.condition(chosenCards)) {
      finalScore = perk.effect(finalScore);
      let activeCount = perkTextAnimations.length;

      // Trigger text animations
      perkTextAnimations.push({
        text: perk.name + " activated!",
        x: width / 2,
        y: height / 2 - 100 + (activeCount * 30),
        opacity: 255,
        timer: 60
      })
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

  if (round > maxRounds) {
    gameState = "upgrade";
    choosePassivePerk();
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
  reshuffleUses--;
}


function choosePassivePerk() {
  // Filter: only show perks not already owned
  let availablePerks = PASSIVE_PERKS.filter(
    perk => !passivePerks.some(p => p.name === perk.name)
  );

  // Randomly pick 3 options
  let choices = shuffle([...availablePerks]).slice(0, 3);

  // Prompt user to choose
  let choice = prompt(
    "Choose a passive perk:\n" +
    choices.map((p, i) => `${i + 1}. ${p.name}: ${p.description}`).join("\n")
  ) || "1";

  let selectedPerk = choices[parseInt(choice) - 1];

  // Add it if it's valid and not already owned
  if (selectedPerk && !passivePerks.some(p => p.name === selectedPerk.name)) {
    passivePerks.push(selectedPerk);
  }

  gameState = "playing";
  ante++;
  round = 1;
  drawHand();
}

function evaluateHand(cards) {
  let ranksOnly = cards.map(c => c.rank);
  let suitsOnly = cards.map(c => c.suit);
  let rankCounts = {};
  let rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let faceCards = ['J', 'Q', 'K'];

  for (let r of ranksOnly) {
    rankCounts[r] = (rankCounts[r] || 0) + 1;
  }

  let counts = Object.values(rankCounts).sort((a, b) => b - a);
  let isFlush = suitsOnly.every(s => s === suitsOnly[0]);
  let sortedIndices = ranksOnly.map(r => rankOrder.indexOf(r)).sort((a, b) => a - b);
  let isStraight = sortedIndices[2] - sortedIndices[0] === 2 && sortedIndices[1] - sortedIndices[0] === 1;

  let allFace = ranksOnly.every(r => faceCards.includes(r));
  let allDifferentSuits = new Set(suitsOnly).size === 3;
  let allDifferentRanks = new Set(ranksOnly).size === 3;

  if (cards.length === 1) { // Is the current selection only 1?
    return { name: "High Card", score: 69 };
  }

  if (cards.length === 2) { // Only 2 cards selected?
    if (cards[0].rank === cards[1].rank) 
      return { name: "Pair", score: 100 };
      return { name: "High Card", score: 20 };
  }

  // 3 Cards selected

  if (allFace && isFlush) return {name: "Royal Flush", score: 500}
  if (isFlush && isStraight) return { name: "Straight Flush", score: 300}
  if (counts[0] === 3) return { name: "Three of a Kind", score: 300 }; // Three Of A Kind.
  if (isFlush) return { name: "Flush", score: 250 }; // Flush
  if (isStraight) return { name: "Straight", score: 400 }; // Straight
  if (counts[0] === 2 && counts[1] === 1) return { name: "Full House", score: 500 }; // Full House (maybe get rid off if sticking to 3 selected cards)
  if (allFace) return { name: "All Face Cards", score: 350 }; // All Face cards (get rid of if 5 selection)
  if (allDifferentSuits && allDifferentRanks) return { name: "Rainbow", score: 200 }; // Rainbow
  if (counts[0] === 2) return { name: "Pair", score: 100 }; // Pair
  return { name: "High Card", score: 50 }; // High card
}

class ShopItem {
  constructor(name, description, price, type, applyFunc) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.type = type;
    this.apply = applyFunc;
  }

  draw(x, y, w, h) {
    // UI Block
  }

  contains(mx, my) {
    return 
      mx >= this.x && mx <= this.x + this.w &&
      my >= this.y && my <= this.y + this.h;
  }
}

function openShop() {
  gameState = "shop";
  shopOptions = [];

  let cardPacks = shuffle([...PERKS]).slice(0, 2).map(perk => {
    return new ShopItem(perk.name, perk.description, 25, 'cardPack', perk.apply);
  })

  let passiveOptions = shuffle([...PASSIVE_PERKS]).slice(0, 2).map(perk => {
    return new ShopItem(perk.name, perk.description, 40, 'passivePerk', () => {
      passivePerks.push(perk);
    })
  })

  shopOptions.push
}

// Debug function
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