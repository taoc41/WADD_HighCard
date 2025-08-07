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
    if (this.type === "pack" || this.type === "perk") {
      this.data.apply?.(); // apply pack
      this.type === "pack" ? shuffle(deck, true) : null; // shuffle the deck if pack
      updatePassivePerkDisplay?.(); // update perk display
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
      shuffle(deck, true);
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
    frozenUpgrades.delete(selectedUpgradeIndex); // get rid of the freeze if there is one.
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