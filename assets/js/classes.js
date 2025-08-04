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

/**
 * 
 */
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
    // Layout derived from position in array
    this.x = width / 2 - 250 + i * 250;
    this.y = height / 2 - 175;

    // card
    fill(60);
    rect(this.x - 100, this.y - 100, this.w, this.h, 20);

    // text
    const rarityColour = getRarityColor(this.rarity);

    fill(rarityColour);
    textAlign(CENTER, CENTER);
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

  apply() {
    if (this.type === "passive") {
      if (passivePerkDisplayDiv.length >= MAX_PASSIVE_PERKS) {
        alert("You already have 5 passive perks. Remove one before adding another.");
        return false;
      }
      passivePerks.push(this.data);
      updatePassivePerkDisplay?.();
      return true;
    }

    if (this.type === "pack" || this.type === "edit") {
      this.data.apply?.();
      updatePassivePerkDisplay?.();
      return true;
    }

    return false;
  }
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

/**
* The play button object, should trigger "playHand()" when clicked.
*/
class PlayHandButton extends GameButton {

  constructor(x, y) {
    super(x, y, 120, 40, "Play Hand");
  }

  onClick() {
    playHand();
  }
}

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