// this script stores the main setup() and draw() loops and anything misc

//#region preload()
function preload() {
  cardSpriteSheet = loadImage("assets/deck.png");
}

//#region setup()
function setup() {

  // canvas setup;
  let canvasWidth = max(windowWidth, MIN_CANVAS_WIDTH);
  let canvasHeight = max(windowHeight, MIN_CANVAS_HEIGHT);
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.position(0, 0)
  canvas.style('z-index', '-2')
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
  endUpgradeBtn = new EndUpgradeButton();
  burnBtn = new BurnButton();
  freezeBtn = new FreezeButton();
  saveScoreBtn = new SaveScoreButton();
  playAgainBtn = new PlayAgainButton();

  // text input setup
  nameInput = createInput('');
  nameInput.attribute('maxlengh', '12'); // limit to 12 characters
  nameInput.position(width / 2, height / 2 + 30);
  nameInput.size(200, 30);
  nameInput.hide(); // start hidden
  
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


//#region draw()
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

//#region windowResized()
// resizes the canvas + limits it to a minimum size of 1200 x 800
// the html displays would overlap onto the actual play area.
function windowResized() {
  let newWidth = max(windowWidth, MIN_CANVAS_WIDTH);
  let newHeight = max(windowHeight, MIN_CANVAS_HEIGHT);
  resizeCanvas(newWidth, newHeight);
}

//#region resetGame()
function resetGame() {

  // resets deck and hand
  deck = [];
  hand = [];
  selected = [];
  handSize = 7;

  // resets mechanics/resources
  reshuffleUses = 10;
  burnsRemaining = 3;
  burnUsed = false;
  freezesRemaining = 3;

  // resets score + progression
  totalScore = 0;
  score = 0;
  storedUpgradePoints = 0;
  round = 1;
  ante = 1;

  // perks and debuffs
  passivePerks = [];
  activeDebuffs = [];
  burnedUpgrades = [];
  frozenUpgrades = new Map();
  disabledPerk = [];
  forcedCursedCount = 0;
  skipUpgradePhase = false;
  maxPassivePerks = 5;

  // upgrade choice ui
  selectedUpgradeIndex = null;
  upgradeChoices = [];
  upgradeChoiceAmount = 3;

  // card drag and drop
  heldCard = null;
  holdStartTime = 0;
  holdingCardIndex = 0;
  isDragging = false;
  dragOffsetX = 0;
  dragOffsetY = 0;

  // clear event text log
  eventTextAnimations = [];

  // set game state & hide name input
  gameState = "playing";
  nameInput.hide();

  // regenerate everything + start new game
  generateDeck();
  drawHand();
  updateDebuffDisplay();
  updatePassivePerkDisplay();
  sendEventText("New run started!")
}

//#region saveScore()
function saveScore(score, ante) {
  let name = nameInput.value().trim(); // get and clean player name from input field
  if (name === "") name = "Highcarder"; // fall back if empty
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || []; // retieve leaderboard from localStorage
  leaderboard.push({ name, score, ante }); // add new score
  leaderboard.sort((a, b) => b.score - a.score); // sort by highest score
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard)); // save back to localStorage
}
