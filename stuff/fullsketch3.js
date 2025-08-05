/**
 * This stores all the global variables needed by the game.
*/

let suits = ['♠', '♥', '♦', '♣'];                                                   // Defines all card suits.
let ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];     // Defines all card ranks.

let playBtn, shuffleBtn, confirmBtn, skipBtn, burnBtn, freezeBtn, playAgainBtn, saveScoreBtn;  // Defines all game buttons

// Game States
const PLAYING = "playing";
const UPGRADE = "upgrade";
const GAMEOVER = "gameover";

let gameState = PLAYING;  // "playing", "upgrade", or "gameover"

// Rank Value Map, used for multiplier calculations
const rankValueMap = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
}; // This is like this because I don't want to keep scrolling down a massive list of numbers

// Card Sprite Variables.
let cardSpriteSheet;
const cardWidth = 71;
const cardHeight = 95;

let deck = [];                  // Array to hold all cards within the deck.
let hand = [];                  // Array to hold all cards drawn into the hand.
let selected = [];              // Array to hold all cards currently selected by the player.
let handSize = 7;               // Amount of cards drawn into the hand.

let reshuffleUses = 10;         // Amount of reshuffles the player can use.
let burnsRemaining = 3;         // Amount of "burns" the player can use.
let burnUsed = false;
let freezesRemaining = 3;       // Amount of "freezes" the player can use.

let eventTextAnimations = [];   // Array to hold currently playing event text.

let totalScore = 0;                 // Total score across the game
let score = 0;                      // Score earned in the current ante
let upgradePoints = 0;              // Number of upgrades allowed in this ante
let storedUpgradePoints = 0;        // Amount of upgrades that were skipped and stored.
let baseUpgradeThreshold = 300;     // Base threshold score for one upgrade

let round = 1;                  // Current round number.
let ante = 1;                   // Current ante number.
let maxRounds = 5;              // Maximum amount of rounds needed to play before proceeding onto the next ante.
let lastAction = "none"         // "none", "playhand", "reshuffle"

let passivePerks = [];          // Array to hold all acquired passive perks
let activeDebuffs = [];         // Array to hold all acquired debuff effects.
let burnedUpgrades = [];        // Array to record all "burned" upgrades
let frozenUpgrades = new Map();

let selectedUpgradeIndex = null;  // To record which upgrade choice is currently selected.
let upgradeChoices = [];          // Array to hold all upgrade choices that the player can select, used for upgrade phase
let upgradeChoiceAmount = 3;

// Globals for effects;
let disabledPerk = [];        // Array to hold all currently disabled perks. For the "Perk Lockout" debuff

// Preview and Current hand info are seperated as to not cause issues with overwriting.
let previewHandInfo = null;
let currentHandInfo = null;
let lastHandInfo = null; // for repeated rhythm perk

// Card sorting globals
let heldCard = null;
let holdStartTime = 0;
let holdingCardIndex = -1;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

// add cards to deck
let pickedCards = 0;
let pickedIndices = [];

// Background stuff
let bgColours;
let blobs = [];

let playerName = ""; // leaderboard

const MAX_PASSIVE_PERKS = 5; // change to 
let passivePerkDisplayDiv;
let debuffDisplayDiv;

/**
 * this script holds all of the passive perks, packs, and debuffs
 * none of this is sorted
 * 
 */

/* —————————————————————————————— EFFECT LIST —————————————————————————————— */

// USE CTRL + F TO FIND PERKS, PASSIVE_PERKS, AND DEBUFFS

//#region PACKS
// PERKS —————————————— //
const PACKS = [
    {
        name: "Booster Pack",
        description: "Add 2 random cards to your deck.",
        rarity: "Common",
        apply: () => {
            for (let i = 0; i < 2; i++) deck.push(generateRandomCard());
        }
    },
    {
        name: "Booster Box",
        description: "Add 5 random cards to your deck.",
        rarity: "Rare",
        apply: () => {
            for (let i = 0; i < 5; i++) deck.push(generateRandomCard());
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
        name: "Card Mechanic",
        description: "Add +3 reshuffle.",
        rarity: "Rare",
        apply: () => {
            reshuffleUses += 3;
        }
    },
    {
        name: "Flush Pack",
        description: "Add 3 cards of the same suit.",
        rarity: "Common",
        apply: () => {
            let suit = random(suits);
            for (let i = 0; i < 3; i++) deck.push(generateRandomCard(suit));
        }
    },
    {
        name: "Straight Pack",
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
        name: "Balanced Pack",
        description: "Add 1 card of each suit.",
        rarity: "Uncommon",
        apply: () => {
            suits.forEach(suit => {
                deck.push(generateRandomCard(suit));
            });
        }
    },
    {
        name: "Royal Pack",
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
        name: "Mirror Pack",
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
        name: "Mytosis Pack",
        description: "Add 5 copies of a random card from your deck.",
        rarity: "Rare",
        apply: () => {
            if (deck.length === 0) return;
            let c = random(deck);
            for (let i = 0; i < 5; i++) {
                deck.push(new Card(c.rank, c.suit));
            }
        }
    },
    {
        name: "Extra Card",
        description: "Add 1 card to the total amount displayed in your hand. (10 Max)",
        rarity: "Rare",
        apply: () => {
            if (handSize > 10) return;
            handSize++
        }
    },
    {
        name: "Elixir",
        description: "Remove a random debuff.",
        rarity: "Mythical",
        apply: () => {
            if (activeDebuffs.length === 0) return;

            // filter out debuffs already removed or inactive
            let toRemove = random(activeDebuffs);

            // revert "once" debuff effects if applicable
            if (toRemove.type === "once" && typeof toRemove.revert === "function") {
                toRemove.revert();
            }

            // Remove from active list
            activeDebuffs.splice(activeDebuffs.indexOf(toRemove), 1);

            eventTextAnimations.push({
                text: `${toRemove.name} removed!`,
                x: width / 2,
                y: height / 2 - 50,
                opacity: 255,
                timer: 60
            });

            updateDebuffDisplay();
        }
    },
    {
        name: "Panacea",
        description: "Remove all debuffs.",
        rarity: "Legendary",
        apply: () => {
            activeDebuffs.forEach(d => {
                if (d.type === "once" && typeof d.revert === "function") {
                    d.revert();
                }
            });

            activeDebuffs = [];

            eventTextAnimations.push({
                text: `All debuffs removed!`,
                x: width / 2,
                y: height / 2 - 50,
                opacity: 255,
                timer: 60
            });

            updateDebuffDisplay();
        }
    }
];

//#region PERKS
// stuff that effects things outside of cards
const PERKS = [

]

//#region PASSIVE_PERKS
const PASSIVE_PERKS = [
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
        condition: (_, __) => currentHandInfo.name && lastHandInfo.name === currentHandInfo.name,
        effect: (score) => score * 2
    },
    {
        name: "Thick Stack",
        description: "At the start of every ante, gain 3 random cards to your deck.",
        rarity: "Uncommon",
        condition: () => round === 1,
        effect: (score) => {
            for (let i = 0; i < 3; i++) deck.push(generateRandomCard());
            return score;
        }
    },

    // "EFFECT per X card in deck"
    // uses getters for the description to count how many specified suits are in the deck
    {
        name: "Heart's Embrace",
        suit: '♥',
        rarity: "Rare",
        get description() {
            const count = deck ? deck.filter(c => c.suit === this.suit).length : 0;
            return `Gain 50 points per ${this.suit} card in deck. (${count} currently)`;
        },
        condition: () => true,
        effect: (score) => {
            const count = deck.filter(c => c.suit === '♥').length;
            return score + (count * 50);
        }
    },
    {
        name: "Spade's Contract",
        suit: '♠',
        rarity: "Rare",
        get description() {
            const count = deck ? deck.filter(c => c.suit === this.suit).length : 0;
            return `Gain 50 points per ${this.suit} card in deck. (${count} currently)`;
        },
        condition: () => true,
        effect: (score) => {
            const count = deck.filter(c => c.suit === this.suit).length;
            return score + (count * 50);
        }
    },
    {
        name: "Diamond's Ambition",
        suit: '♦',
        rarity: "Rare",
        get description() {
            const count = deck ? deck.filter(c => c.suit === this.suit).length : 0;
            return `Gain 50 points per ${this.suit} card in deck. (${count} currently)`;
        },
        condition: () => true,
        effect: (score) => {
            const count = deck.filter(c => c.suit === this.suit).length;
            return score + (count * 50);
        }
    },
    {
        name: "Clover's Favor",
        suit: '♣',
        rarity: "Rare",
        get description() {
            const count = deck ? deck.filter(c => c.suit === this.suit).length : 0;
            return `Gain 50 points per ${this.suit} card in deck. (${count} currently)`;
        },
        condition: () => true,
        effect: (score) => {
            const count = deck.filter(c => c.suit === this.suit).length;
            return score + (count * 50);
        }
    },

    // "Multiply score by 1.5 if hand contains at least one X Card" - PASSIVES
    {
        name: "Lucky Clover",
        description: "Multiply score by 1.5 if hand contains at least one ♣.",
        rarity: "Rare",
        condition: (playedCards, _) => playedCards.some(card => card.suit === '♣'),
        effect: (score) => score * 1.5
    },

];

//#region EDIT_PERKS
const EDIT_PERKS = [
    {
        name: "Rank Up",
        description: "Increases the rank of up to 2 selected cards by 1",
        minReq: 1,
        maxReq: 2,
        apply: (selectedCards) => {
            for (let card of selectedCards) {
                let index = ranks.indexOf(card.rank);
                if (index === -1) continue;

                let nextIndex = index + 1

                if (card.rank === 'A' || nextIndex >= ranks.length) {
                    // loop back to rank 2
                    card.rank = '2';
                } else {
                    card.rank = ranks[nextIndex];
                }
            }
        }
    },

]

const DEBUFFS = [
    {
        name: "Score Leak",
        description: "Lose 10% of your total score after every hand.",
        type: "perRound",
        effect: () => {
            score = floor(score * 0.9);
        },
    },
    {
        name: "Card Rot",
        description: "Removes 1 random card from your deck each round.",
        type: "perRound",
        effect: () => {
            if (deck.length > 0) {
                deck.splice(floor(random(deck.length)), 1)
            }
        },
    },
    {
        name: "Perk Lockout",
        description: "A random passive perk is disabled this round.",
        type: "perRound",
        effect: () => {
            if (passivePerks.length === 0) {
                disabledPerk = [];
                return;
            }

            // Find perks not already locked
            const availableToDisable = passivePerks.filter(p => !disabledPerk.includes(p));

            // All already locked? don't do anything.
            if (availableToDisable.length === 0) return;

            // Mark the perk as disabled.
            const newDisabled = random(availableToDisable);
            disabledPerk.push(newDisabled);
        },
    },

    {
        name: "Prolonged Rounds",
        description: "You need 1 extra round to progress.",
        type: "once",
        effect: () => {
            maxRounds += 1;
        },
        revert: () => {
            maxRounds = max(maxRounds - 1, 1)
        }
    },
    {
        name: "Cramped Hand",
        description: "Draw 2 fewer cards per hand (min 3).",
        type: "once",
        effect: () => {
            handSize = max(handSize - 2, 3);
        },
        revert: () => {
            handSize = min(handSize + 2, 10);
        }
    }
]


//#region RARITY_WEIGHTS
// Rarity weights, to handle what's more common
const RARITY_WEIGHTS = {
    Common: 0.70,
    Uncommon: 0.15,
    Rare: 0.06,
    Mythical: 0.025,
    Legendary: 0.005,
    Cursed: 0.015
};

/**
 * 
 * This script handles the rendering and UI elements of the game.
 *
*/

console.error(`%cfuck off`, 'color: red; font-size: 50px; background-color: white;')


function preload() {
    cardSpriteSheet = loadImage("assets/deck.png");
}

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
    // positions are set within the class because i am lazy and
    // having it out here is pretty redundant imo
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

    // debug stuff here
    // upgradePoints = 500
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
            let baseScore = previewHandInfo.score;
            let multiplier = calculateRankMultiplier(previewHandInfo.usedCards);
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
    eventTextAnimations.push({
        text: text,
        x: width / 2,
        y: height / 2 - 100,
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

/**
 * 
 * THIS FILE STORES ALL THE CLASSES WITHIN THE GAME
 * 
 * The following classes in game are:
 * Card - Playing card object for both drawing, and also storing rank/suit information
 * Upgrade Choice - Object for the upgrade phase that stores upgrade choice info. handles applying them, etc.
 * Game Button - the main button class, extends into multiple children
 * 
 */


//#region Suit & Rank Maps
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


//#region Card
/**
 * 
 */
class Card {
    constructor(rank, suit) {
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
        image(cardSpriteSheet, x, y, this.width, this.height, sx, sy, this.width, this.height);;
    }

    contains(mx, my) {
        return mx > this.x && mx < this.x + this.width &&
            my > this.y && my < this.y + this.height;
    }
}

// ------ UPGRADE ------------------------------------------------------------------------------------------------

//#region Upgrade Choice
class UpgradeChoice {
    constructor(type, data) {
        this.type = type;
        this.data = data;
        this.x = 0;
        this.y = 0;
        this.w = 200;
        this.h = 200;
    }

    get name() { return this.data.name; }
    get description() { return this.data.description; }
    get rarity() { return this.data.rarity || "Common" }

    draw(i) {
        const count = upgradeChoices.length;
        const pad = 15;
        const stepMax = this.w + 20;

        const spacing = (count > 1)
            ? Math.min((width - 2 * pad - this.w) / (count - 1), stepMax)
            : 0;

        const totalWidth = spacing * (count - 1) + this.w;
        const startX = (width - totalWidth) / 2;

        // Center position for this upgrade choice
        this.x = startX + (this.w / 2) + i * spacing;
        this.y = height / 3 + 50;

        // card
        fill(selectedUpgradeIndex === i ? 40 : 60); // if logic encapsulated within fill method.
        rect(this.x - 100, this.y - 100, this.w, this.h, 20);

        // if frozen
        if (frozenUpgrades.has(i)) {
            noFill();
            stroke(0, 200, 255);
            strokeWeight(3);
            rect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h, 20);
            noStroke();
        }

        // text
        const rarityColour = getRarityColor(this.rarity);
        const typeText = () => {
            switch (this.type) {
                case "passive": return "Passive Ability";
                case "pack": return "Booster"
                case "edit": return "Refinement"
                case "perk": return "Perk"
                default: throw Error("Type not correctly defined.");
            }
        }

        fill(rarityColour);
        textAlign(CENTER, CENTER);

        textSize(10);
        text(`${typeText()}`, this.x, this.y - 60)

        textSize(16);
        text(this.name, this.x, this.y - 40);

        textSize(12);
        text(`[${this.rarity}]`, this.x, this.y - 20);

        fill(255);
        textSize(12);
        text(this.description, this.x - 90, this.y + 10, 180, 100);
    }

    contains(mx, my) {
        return (
            mx >= this.x - 100 && mx <= this.x - 100 + this.w &&
            my >= this.y - 100 && my <= this.y - 100 + this.h
        );
    }

    isBurnable() {
        return this.rarity !== "Cursed";
    }

    apply() {

        // if perk type is "passive"
        if (this.type === "passive") {
            if (passivePerks.length >= MAX_PASSIVE_PERKS) {
                alert("You already have 5 passive perks. Remove one before adding another.");
                return false;
            }
            passivePerks.push(this.data);
            updatePassivePerkDisplay?.();
            return true;
        }

        // if perk type is "pack"
        if (this.type === "pack") {
            this.data.apply?.();
            updatePassivePerkDisplay?.();
            return true;
        }

        // if the perk type is "edit"
        if (this.type === "edit") {
            const selectedCards = selected.map(i => hand[i]);
            const req = this.data;

            if (selectedCards.length < req.minReq) {
                eventTextAnimations.push({
                    text: `You need to select at least ${req.minReq} first!`,
                    x: width / 2,
                    y: height / 2 - 100 + (eventTextAnimations.length * 30),
                    opacity: 255,
                    timer: 60
                });
                return;
            } else if (selectedCards.length > req.maxReq) {
                eventTextAnimations.push({
                    text: `You can only selected a max of ${req.maxReq} cards!`,
                    x: width / 2,
                    y: height / 2 - 100 + (eventTextAnimations.length * 30),
                    opacity: 255,
                    timer: 60
                });
                return;
            }

            this.data.apply?.(selectedCards);
            updatePassivePerkDisplay?.();
            return true;
        }

        return false;
    }
}

//#region Game Button
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

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
    }

    contains(mx, my) {
        return (
            mx >= this.x && mx <= this.x + this.w &&
            my >= this.y && my <= this.y + this.h
        );
    }

    onClick() {
        // To be overridden in subclass.
        throw new Error("onClick () must be overriden by subclass");
    }
}

//#region Play Hand Button
/**
* The play button object, should trigger "playHand()" when clicked.
*/
class PlayHandButton extends GameButton {

    constructor() {
        super(width / 2 - 65, height - 75, 120, 40, "Play Hand");
    }

    draw() {
        this.updatePosition(width / 2 - 65, height - 75)
        super.draw();
    }

    onClick() {
        playHand();
    }
}

//#region Shuffle Button
/**
* The play button object, should trigger "reshuffleHand()" when clicked.
*/
class ShuffleButton extends GameButton {
    constructor(x, y) {
        super(x, y, 140, 40, `Reshuffle (${reshuffleUses})`);
    }

    draw() {
        this.label = `Reshuffle (${reshuffleUses})`; // update label each frame.
        super.draw();
    }

    onClick() {
        reshuffleHand();
    }
}

//#region Upgrade Confirm Button
class ConfirmButton extends GameButton {
    constructor() {
        super(0, 0, 120, 40, "Confirm");
    }

    draw() {
        this.updatePosition(width / 2 - 130, height / 1.3 + 20)
        super.draw();
    }

    onClick() {
        if (selectedUpgradeIndex === null) return;

        const choice = upgradeChoices[selectedUpgradeIndex];
        const ok = choice.apply();
        if (!ok) return;

        if (ok) {
            frozenUpgrades.delete(selectedUpgradeIndex);
            upgradePoints--;
            upgradePoints > 0 ? generateUpgradeChoice() : nextAnte();
        }
    }
}

//#region Skip / Store Button
class SkipButton extends GameButton {
    constructor() {
        super(0, 0, 120, 40, `Skip and Store`);
    }

    draw() {
        this.updatePosition(width / 2 + 10, height / 1.3 + 20)
        super.draw();
    }

    onClick() {
        storedUpgradePoints++;
        upgradePoints--;
        generateUpgradeChoice();

        if (upgradePoints <= 0) nextAnte();
    }
}

//#region Burn Button
class BurnButton extends GameButton {
    constructor() {
        super(0, 0, 120, 40, `Burn (${burnsRemaining})`);
    }

    draw() {
        this.updatePosition(width / 2 + 150, height / 1.3 + 20)
        this.label = `Burn (${burnsRemaining})`
        super.draw();
    }


    onClick() {
        if (burnUsed) {
            eventTextAnimations.push({
                text: "You can only burn once per upgrade point!",
                x: width / 2,
                y: height / 2 - 80,
                opacity: 255,
                timer: 60
            });
            return;
        }

        if (selectedUpgradeIndex == null) return;

        const selectedUpgrade = upgradeChoices[selectedUpgradeIndex];

        if (!selectedUpgrade.isBurnable()) {
            eventTextAnimations.push({
                text: `Cannot burn a Cursed upgrade!`,
                x: width / 2,
                y: height / 2 - 80,
                opacity: 255,
                timer: 60
            });
            return;
        }

        if (burnsRemaining <= 0) {
            eventTextAnimations.push({
                text: `No burns remaining!!`,
                x: width / 2,
                y: height / 2 - 80,
                opacity: 255,
                timer: 60
            });
            return;
        }

        // i hate how ugly this looks
        const burned = upgradeChoices[selectedUpgradeIndex]; // get the selected upgrade
        burnedUpgrades.push(burned.name); // push it into the list of burned upgrades
        sendEventText(`${burned.name} has been burned!`)
        upgradeChoices.splice(selectedUpgradeIndex, 1); // remove from selectable list
        selectedUpgradeIndex = null; // reset burned index back to null
        burnsRemaining--; // decrease amount of burns by 1
        burnUsed = true // cannot use burn again until another upgrade is chosen, or the upgrade is skipped.
    }
}

//#region Freeze Button
class FreezeButton extends GameButton {
    constructor() {
        super(0, 0, 120, 40, `Freeze (${freezesRemaining})`);
    }

    draw() {
        this.updatePosition(width / 2 - 270, height / 1.3 + 20)

        const hasSelection = selectedUpgradeIndex !== null && upgradeChoices[selectedUpgradeIndex];
        const isFrozen = hasSelection && frozenUpgrades.has(selectedUpgradeIndex)

        this.label = (hasSelection && isFrozen)
            ? "Unfreeze"
            : `Freeze (${freezesRemaining})`;

        super.draw();
    }

    onClick() {
        if (selectedUpgradeIndex == null) return;

        const idx = selectedUpgradeIndex;

        if (frozenUpgrades.has(idx)) {
            frozenUpgrades.delete(idx);
            this.label = `Freeze (${freezesRemaining})`
            return;
        }

        if (freezesRemaining <= 0) {
            sendEventText(`No more freezes remaining!`);
            return;
        }

        const choice = upgradeChoices[idx];
        if (!choice) return;
        frozenUpgrades.set(idx, choice);
        this.label = "Unfreeze"
        freezesRemaining--;
    }
}

/**
* 
* This script handles the rendering and UI elements of the game.
*
*/

console.error(`%cfuck off`, 'color: red; font-size: 50px; background-color: white;')


function preload() {
    cardSpriteSheet = loadImage("assets/deck.png");
}

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
    // positions are set within the class because i am lazy and
    // having it out here is pretty redundant imo
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

    // debug stuff here
    // upgradePoints = 500
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
            let baseScore = previewHandInfo.score;
            let multiplier = calculateRankMultiplier(previewHandInfo.usedCards);
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
    eventTextAnimations.push({
        text: text,
        x: width / 2,
        y: height / 2 - 100,
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

/**
 * 
 * this script stores the main game functions and code
 * witness insanity and a lot of ramblings
 * 
 */

//#region generateDeck()
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

// function mouseReleased() {
//     if (isDragging && heldCard) {
//         // Determine closest index
//         let minDist = Infinity;
//         let targetIndex = holdingCardIndex;

//         for (let i = 0; i < hand.length; i++) {
//             if (i === holdingCardIndex) continue;
//             let card = hand[i];
//             let distToSlot = dist(heldCard.x, heldCard.y, card.x, card.y);
//             if (distToSlot < minDist) {
//                 minDist = distToSlot;
//                 targetIndex = i;
//             }
//         }

//         if (minDist > 150) {
//             // basically do nothing: too far - snap back
//         } else {
//             let movedCard = hand.splice(holdingCardIndex, 1)[0];
//             hand.splice(targetIndex, 0, movedCard);
//         }
//     } else if (heldCard) {
//         // click based selection fallback if drag is never triggered. 
//         // previously in mousePressed (before 30/07/25)
//         let idx = holdingCardIndex;
//         if (heldCard.selected) {
//             selected = selected.filter(n => n !== idx);
//             heldCard.selected = false;
//         } else if (selected.length < 5) {
//             selected.push(idx);
//             heldCard.selected = true;
//         }
//     }

//     // Updates the preview hand info 
//     // gameState === "playing" because exiting upgrade phase causes visual bug
//     if (selected.length >= 1 && gameState === "playing") {
//         let chosenCards = selected.map(i => hand[i]);
//         previewHandInfo = evaluateHand(chosenCards);
//         previewHandInfo.cards = chosenCards;
//         previewHandInfo.baseScore = previewHandInfo.score;
//     } else {
//         previewHandInfo = null;
//     }

//     // Reset drag state
//     isDragging = false;
//     heldCard = null;
//     holdingCardIndex = -1;
// }

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
        if (keyCode === ENTER && playerName.trim() !== "") {
            saveScore(playerName.trim(), totalScore);
            window.location.href = "leaderboard.html"; // redirect to leaderboard
        }
    }
}

//#region saveScore()
function saveScore(name, score) {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

//#region playHand()
function playHand() {
    selected = selected.filter(i => hand[i] !== null && hand[i] !== undefined);
    let chosenCards = selected.map(i => hand[i]);

    currentHandInfo = evaluateHand(chosenCards);

    let baseScore = currentHandInfo.score;
    let multiplier = calculateRankMultiplier(currentHandInfo.usedCards);
    let finalScore = baseScore * multiplier;

    // Apply passive perks
    passivePerks.forEach(perk => {
        if (disabledPerk.includes(perk)) return; // Perk Lockout

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

    // for Perk Lockout - clears previous round's locks
    disabledPerk = [];

    activeDebuffs.forEach(debuff => {
        if (debuff.type === "perRound" && typeof debuff.effect === "function") {
            debuff.effect();
        }
    });

    updatePassivePerkDisplay();
    updateDebuffDisplay();

    score += finalScore
    lastHandInfo = currentHandInfo;
    currentHandInfo = null;
    previewHandInfo = null;
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
        let baseThreshold = getUpgradeThreshold();

        if (score >= baseThreshold) {

            // Convert ante score into upgrades
            let gainedUpgrades = Math.floor(score / baseThreshold);
            upgradePoints = gainedUpgrades + storedUpgradePoints;
            storedUpgradePoints = 0;

            // Transfer score to totalScore
            totalScore += score;
            score = 0;

            // If there's more than 0 upgrade points, then choose another upgrade.
            if (upgradePoints > 0) {
                gameState = "upgrade";
                generateUpgradeChoice();
            } else {
                nextAnte();
            }
        } else {
            // reset stored points if player didn't meet the threshold.
            if (storedUpgradePoints > 0) {
                eventTextAnimations.push({
                    text: `Failed to reach score requirement, ${storedUpgradePoints} stored upgrades lost!`,
                    x: width / 2,
                    y: height / 2 - 100,
                    opacity: 255,
                    timer: 60
                });
            }
            storedUpgradePoints = 0;
            drawHand();
        }
    } else {
        drawHand(); // new hand if its not a new ante.
    }
}

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

//#region returnHand()
function returnHand() {
    for (let card of hand) {
        card.selected = false; // unmark all cards as selected
    }
    selected = []; // clear selected cards
    deck = deck.concat(hand); // move hand back into the deck
    hand = []; // clear the hand
    shuffle(deck); // shuffle the deck
}

function getUpgradeThreshold() {
    const growthRate = 1.5; // Adjust to make the growth faster or slower

    const threshold = baseUpgradeThreshold * Math.pow(growthRate, ante - 1);
    return Math.round(threshold / 100) * 100; // Round to the nearest 100
}

//#region weightedRandomRarity()
function weightedRandomRarity() {
    let r = random();
    let cumulative = 0;
    for (let rarity in RARITY_WEIGHTS) {
        cumulative += RARITY_WEIGHTS[rarity];
        if (r < cumulative) return rarity;
    }
    return "Common";
}

//#region generateUpgradeChoice()

// this has genuinely caused me the most headaches
// i wish death upon javascript
// chatGPT was used here for debugging -> ended up being typos & generation returns null as a choice for some reason
function generateUpgradeChoice() {
    selectedUpgradeIndex = null;
    burnUsed = false;
    returnHand();
    drawHand();

    const frozenNames = new Set(
        [...frozenUpgrades.values()]
            .map(choice => choice?.data?.name)
            .filter(Boolean)
    );

    // filters -> no duplicate choices with already owned passives + burned upgrades
    const availablePassives = PASSIVE_PERKS.filter(p =>
        !passivePerks.some(pp => pp.name === p.name) &&
        !burnedUpgrades.includes(p.name) &&
        !frozenNames.has(p.name)
    );
    const availablePacks = PACKS.filter(p =>
        !burnedUpgrades.includes(p.name) &&
        !frozenNames.has(p.name)
    );
    const availableEdits = EDIT_PERKS.filter(p =>
        !burnedUpgrades.includes(p.name) &&
        !frozenNames.has(p.name)
    );

    const slots = new Array(upgradeChoiceAmount).fill(null); // prepare output array & keep frozen upgrades
    const usedNames = new Set(frozenNames); // already appeared in this roll

    // place frozen upgrades back into their respective slots
    // burned upgrade? get rid of it
    // frozen upgrade is overflowing? get rid of it
    for (const [slotIdx, choice] of [...frozenUpgrades.entries()]) {
        if (
            slotIdx < upgradeChoiceAmount &&
            choice &&
            !burnedUpgrades.includes(choice.data?.name)
        ) {
            slots[slotIdx] = choice;
            usedNames.add(choice.data.name);
        } else {
            // invalid/overflowed frozen – drop it
            frozenUpgrades.delete(slotIdx);
        }
    }

    // helper - pick from a pool by rarity while avoiding duplicates
    const tryPickByRarity = (pool, rarity) => {
        const candidates = pool.filter(p => p.rarity === rarity
            && !usedNames.has(p.name)
        );
        if (!candidates.length) return null;
        const pick = random(candidates);
        usedNames.add(pick.name);
        return pick;
    };

    const tryPickAny = (pool) => {
        const pick = pool.find(p => !usedNames.has(p.name));
        if (!pick) return null;
        usedNames.add(pick.name);
        return pick;
    };

    // fill empty slots.
    for (let i = 0; i < slots.length; i++) {
        if (slots[i]) continue;

        const roll = random();
        const rarity = weightedRandomRarity();

        if (roll < 0.25 && availablePassives.length > 0) {
            const perk = tryPickByRarity(availablePassives, rarity) || tryPickAny(availablePassives);
            if (perk) {
                slots[i] = new UpgradeChoice("passive", perk);
                continue;
            }
        } else if (roll < 0.75 && availablePacks.length > 0) {
            const pack = tryPickByRarity(availablePacks, rarity) || tryPickAny(availablePacks);
            if (pack) {
                slots[i] = new UpgradeChoice("pack", pack);
                continue;
            }
        } else if (availableEdits.length > 0) {
            const edit = tryPickByRarity(availableEdits, rarity) || tryPickAny(availableEdits);
            if (edit) {
                slots[i] = new UpgradeChoice("edit", edit);
                continue;
            }
        }
    }

    // fall back to prevent "nulls" from being generated
    // i hate this so much
    const classifyType = (item) => {
        if (availablePassives.some(p => p.name === item.name)) return "passive";
        if (availablePacks.some(p => p.name === item.name)) return "pack";
        return "edit";
    };

    let fallbackPool = [
        ...availablePassives,
        ...availablePacks,
        ...availableEdits
    ].filter(u => !usedNames.has(u.name)); // no dupes

    for (let i = 0; i < slots.length; i++) {
        if (slots[i]) continue; // already filled

        if (fallbackPool.length === 0) break;

        //pick one at random, classify and place
        const pick = random(fallbackPool);
        const type = classifyType(pick);

        slots[i] = new UpgradeChoice(type, pick);
        usedNames.add(pick.name);

        fallbackPool = fallbackPool.filter(u => u.name !== pick.name);
    }

    upgradeChoices = slots.filter(Boolean); // last fallback to not return any nulls
    upgradeChoices = slots;
}

//#region addDebuff()
function addDebuff() {

    // Add a debuff every 5 antes
    if (ante % 5 === 0) {
        let debuff = random(DEBUFFS);
        activeDebuffs.push(debuff);

        if (debuff.type === "once" && typeof debuff.effect === "function") {
            debuff.effect();
        }

        // Optional animation or UI alert
        eventTextAnimations.push({
            text: `Debuff Gained: ${debuff.name}`,
            x: width / 2,
            y: height / 2 - 50,
            opacity: 255,
            timer: 60
        });
    }

    updateDebuffDisplay();
}

//#region nextAnte()
// literally so i dont have to keep repeating this code over and over
function nextAnte() {
    addDebuff();
    gameState = "playing";
    ante++;
    round = 1;
    upgradePoints = 0;
    selectedUpgradeIndex = null
    returnHand();
    drawHand();
}


//#region evaluateHand()
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
    const getCardsByRank = (rank) => cards.filter(c => c.rank === rank);        // return all cards from `cards` that match a specific rank
    const getUsedCards = (rankCountMap, count) =>                               // return all cards that appears `count` times in the hand.
        Object.entries(rankCountMap)                                            // rankCountMap is an object, e.g. { 'A': 2, '10, 'J': 2 }, this line converts it to [['A', 2], ['10', 1], ['J', 2]].
            .filter(([_, cnt]) => cnt === count)                                // keeps entries where the count matches the value that we are interested in
            .flatMap(([rank]) => getCardsByRank(rank));                         // for each matching rank, pull all cards with that rank using `getCardByRank`. flatMap flattens the array into single card objects.

    // checks for how many cards are selected and returns the appropriate object depending on the type of hand selected using the hand type checks
    // genuinely going to kms this looks ugly
    switch (cards.length) {
        case 1: // 1 card selected ————————————————————————————————————————————————————————

            // High Card
            return {
                name: "High Card",
                score: 5,
                usedCards: [cards[0]]
            };

        case 2: // 2 cards selected ——————————————————————————————————————————————————————

            // Pair
            if (counts[0] === 2) {
                let used = getUsedCards(rankCounts, 2);
                return { name: "Pair", score: 10, usedCards: used };
            }

            // High Card
            return { name: "High Card", score: 5, usedCards: [cards[0]] };

        case 3: // Three cards selected —————————————————————————————————————————————————

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

        case 4: // 4 Cards selected ———————

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

        case 5: // 5 Cards selected —————————————————————————————————————————————————

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
                return { name: "Four of a Kind", score: 70, usedCards: used };
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

