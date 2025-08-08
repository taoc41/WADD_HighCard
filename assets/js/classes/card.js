// this script stores card class

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
// class for storing card
// handles drawing the card + stores rank + suit information
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
     * draws the playing card into the UI.
     * @param {*} x The X position of the card.
     * @param {*} y The Y position of the card. */
    draw(x, y) {

        // Sets the origin X and Y of each card.
        this.x = x;
        this.y = y;

        // sets the origin X and Y positions of the specific sprite within the sprite sheet.
        let sx = rankMap[this.rank] * this.width;
        let sy = suitMap[this.suit] * this.height;

        /** 
         * is the card selected?
         * change the color of the card to gold if YES.
         * otherwise default to white if NO. */
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