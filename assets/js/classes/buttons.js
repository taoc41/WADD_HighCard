// this script stores button classes
// all buttons are located in this script

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
        confirmUpgrade();
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
        skipUpgrade();
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
        burnUpgrade();
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
        freezeUpgrade()
    }
}

//#region Play Again Button
class PlayAgainButton extends GameButton {
    constructor() {
        super(0, 0, 120, 40, `Play Again`);
    }

    draw() {
        this.updatePosition(width / 2 - 270, height / 1.3 + 20)
        super.draw();
    }

    onClick() {
        saveScore();
    }
}

//#region Save Score BUtton
class SaveScoreButton extends GameButton {
    constructor() {
        super(0, 0, 120, 40, `Submit Score`);
    }

    draw() {
        this.updatePosition(width / 2 - 270, height / 1.3 + 20)
        super.draw();
    }

    onClick() {
        resetGame();
    }
}