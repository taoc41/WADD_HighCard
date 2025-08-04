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

    updatePosition(x, y){
        this.x = x;
        this.y = y;
    }

    contains(mx, my){
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
        super (x, y, 120, 40, "Play Hand");
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

    draw(){
        this.label = `Reshuffle (${reshuffleUses})`; // update label each frame.
        super.draw();
    }

    onClick() {
        reshuffleHand();
    }
}