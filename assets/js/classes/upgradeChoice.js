// this script stores the upgrade choice class

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

        // calculate the spacing for the upgrade choices.
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

        // if frozen, draw blue outline over the box
        if (frozenUpgrades.has(i)) {
            noFill();
            stroke(0, 200, 255);
            strokeWeight(3);
            rect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h, 20);
            noStroke();
        }

        // text
        const rarityColour = getRarityColor(this.rarity);
        
        // get the type of upgrade for the text
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

    // returns true or false depending on the outcome/some requirements
    apply() {

        // if perk type is "passive" & player has reached the max ability limit
        if (this.type === "passive") {
            if (passivePerks.length >= maxPassivePerks) {
                alert("You already have 5 passive perks. Remove one before adding another.");
                return false; // stop here.
            }
            passivePerks.push(this.data); // add the ability
            updatePassivePerkDisplay(); // update the HTML display
            return true; // continue onto next ante or upgrade
        }

        // if upgrade type is "pack" or "perk"
        if (this.type === "pack" || this.type === "perk") {
            this.data.apply?.(); // apply pack/perk
            this.type === "pack" ? shuffle(deck, true) : null; // shuffle the deck if pack
            updatePassivePerkDisplay(); // update HTML display (for some abilities that dynamically update description)
            return true; // continue onto next ante or upgrade
        }

        // if the perk type is "edit"
        if (this.type === "edit") {
            const selectedCards = selected.map(i => hand[i]);
            const req = this.data;

            if (selectedCards.length < req.minReq) { // under minimum selection?
                sendEventText(`You need to select at least ${req.minReq} first!`)
                return false; // stop here.
            } else if (selectedCards.length > req.maxReq) { // over minimum selection?
                sendEventText(`You can only selected a max of ${req.maxReq} cards!`)
                return false; // stop here.
            }

            this.data.apply(selectedCards); // apply the edit to the selected cards.
            updatePassivePerkDisplay(); // update HTML display
            return true; // continue onto next ante or upgrade
        }

        return false;
    }
}