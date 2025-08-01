// Debug functions
  
function debugUpgrade(){
    gameState = "upgrade";
    generateUpgradeChoice();
}
  
function debugSetHand(cardDataArray) {
    if (!Array.isArray(cardDataArray)) {
        console.error("Expected an array of card objects.");
        return;
    }
  
    hand = cardDataArray.map(data => {
        let { rank, suit } = data;
        return new Card(rank, suit);
    });
  
    drawHand();
}
  
function debugAddPassive(name) {
    const perk = PASSIVE_PERKS.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (!perk) {
        console.warn(`Perk "${name} not found`);
        return;
    }
  
    if (passivePerks.some(p => p.name === perk.name)) {
        console.warn(`Perk "${name}" is already active.`);
        return;
    }
  
    if (passivePerks.length >= 5) {
        console.warn(`Cannot add more than 5 passive perks.`);
        return;
    }
  
    passivePerks.push(perk);
    console.log(`Passive perk "${name} added.`);
    updatePassivePerkDisplay();
}

function debugAddDebuff(name) {
    const debuff = DEBUFFS.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (!debuff) {
        console.warn(`Debuff "${name} not found`);
        return;
    }
 
    if (debuff.type === "once" && typeof debuff.effect === "function") {
        debuff.effect();
    }

    activeDebuffs.push(debuff);
    console.log(`Debuff "${name} added.`);
    
    updateDebuffDisplay();
    updatePassivePerkDisplay();
}