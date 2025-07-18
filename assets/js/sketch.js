let suits = ['♠', '♥', '♦', '♣'];
let ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
let playBtn, shuffleBtn;

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

// #endregion

let cardSpriteSheet;
let cardWidth = 71;
let cardHeight = 95;

let deck = [];
let hand = [];
let selected = [];
let score = 0;
let round = 1;
let maxRounds = 5;
let currentHandInfo = null;

let gameState = "playing"; // "playing", "upgrade", or "end"
let upgradeOptions = [];

// add cards to deck
let pickedCards = 0;
let pickedIndices = [];

let reshuffleUses = 99;
let bgColours;
let blobs = [];

const gameDiv = document.getElementById("gameDiv")

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

function drawHand() {
  let needed = 5  - hand.length;
  let drawn = deck.splice (0, needed);
  hand = hand.concat(drawn);
}

function drawUI() {
  if (gameState === "playing") {
    fill(255);
    text(`Score: ${score}`, width / 2, 30);
    text(`Round ${round}/${maxRounds}`, width / 2, 60);
    text(`Deck: ${deck.length} cards left`, width / 2, 90);

    if (currentHandInfo) {
      text(`Selected Hand: ${currentHandInfo.name} (${currentHandInfo.score} pts)`, width / 2, 130);
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

  console.log(selected.map(c => c.rank + c.suit)) // Debug.

  // -------------------------------------------------------------

  // Update preview of hand type (1–3 cards)
  if (selected.length >= 1) {
    let chosenCards = selected.map(i => hand[i]);
    currentHandInfo = evaluateHand(chosenCards);
  } else {
    currentHandInfo = null;
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
    for (let i = 0; i < upgradeOptions.length; i++) {
      let x = 150 + i * 120;
      let y = height / 2;
      if (
        mouseX > x &&
        mouseX < x + 100 &&
        mouseY > y &&
        mouseY < y + 150 &&
        !pickedIndices.includes(i) &&
        pickedCards < cardsToAdd
      ) {
        deck.push(upgradeOptions[i]);
        pickedCards++;
        pickedIndices.push(i);
  
        if (pickedCards >= cardsToAdd) {
          setTimeout(() => {
            round = 1;
            gameState = "playing";
            drawHand();
          }, 500);
        }
        break;
      }
    }
    return;
  }
}

function playHand(){
  selected = selected.filter(i => hand[i] !== null && hand[i] !== undefined);

  let chosenCards = selected.map(i => hand[i]);
  let handInfo = evaluateHand(chosenCards);

  // perk handling here

  score += handInfo.score;
  currentHandInfo = null;
  round++;

  // Replace only the selected card indices
  for (let i = 0; i < selected.length; i++) {
    let handIndex = selected[i];
    if (deck.length > 0) {
      hand[handIndex] = deck.shift(); // replace from deck
    } else {
      hand[handIndex] = null // no card left, leave empty
    }
  }

  selected = [];

  if (round > maxRounds) {
    gameState = "upgrade";
    generateUpgradeOptions();
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

// need to update (proper shop with perks, etc)
function generateUpgradeOptions() {
  // Determine how many cards the player can add
  cardsToAdd = Math.min(3, Math.floor(score / 500) || 1);
  
  upgradeOptions = [];
  for (let i = 0; i < 5; i++) { // Offer 5 options regardless of how many can be chosen
    let r = random(ranks);
    let s = random(suits);
    upgradeOptions.push({ rank: r, suit: s });
  }
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

