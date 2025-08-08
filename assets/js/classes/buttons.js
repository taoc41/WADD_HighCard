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

    }

    draw(fillColour) {
        fillColour ? fill(fillColour) : fill(0, 180, 0);
        rect(this.x, this.y, this.w, this.h, 10);
        fill(255)
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
        if (gameState === "playing" && selected.length >= 1 && selected.length <= 5) {
            playHand();
        }
    }
}

//#region Shuffle Button
/**
* The play button object, should trigger "reshuffleHand()" when clicked.
*/
class ShuffleButton extends GameButton {
    constructor(x, y) {
        super(width - 200, height - 75, 140, 40, `Reshuffle (${reshuffleUses})`);
    }

    draw() {
        this.updatePosition(width - 200, height - 75);
        this.label = `Reshuffle (${reshuffleUses})`; // update label each frame.
        super.draw();
    }

    onClick() {
        if (gameState === "playing" && reshuffleUses > 0 && selected.length >= 1 && selected.length <= 5) {
            reshuffleHand();
        }
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

//#region End Upgrade Button
class EndUpgradeButton extends GameButton {
    constructor() {
        super(0, 0, 140, 35, `End Upgrade Phase`);
    }

    draw() {
        this.updatePosition(width / 2 - 70, height / 1.3 + 75)
        super.draw(color(145, 130, 115)); // somewhere around gray-ish green
    }

    onClick() {
        endUpgrade();
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
        super.draw(color(215, 130, 80)); // peru orange
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

        // updates the label based on whether a frozen upgrade is selected
        const hasSelection = selectedUpgradeIndex !== null && upgradeChoices[selectedUpgradeIndex];
        const isFrozen = hasSelection && frozenUpgrades.has(selectedUpgradeIndex)

        this.label = (hasSelection && isFrozen)
        ? "Unfreeze"
        : `Freeze (${freezesRemaining})`;

        super.draw(color(60, 110, 155)); // steel blue
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
        this.updatePosition(width / 2 - 130, height / 2 + 100);
        super.draw();
    }

    onClick() {
        resetGame();
    }
}

//#region Save Score BUtton
class SaveScoreButton extends GameButton {
    constructor() {
        super(0, 0, 120, 40, `Submit Score`);
    }

    draw() {
        this.updatePosition(width / 2 + 10, height / 2 + 100);
        super.draw();
    }

    onClick() {
        saveScore(totalScore, ante);
        window.location.href = "leaderboard.html"; // redirect to leaderboard
    }
}