function drawCard(card, x, y, isSelected) {
  if (!cardSpriteSheet) return;

  let sx = rankMap[card.rank] * cardWidth;
  let sy = suitMap[card.suit] * cardHeight;

  if (isSelected) {
    fill(255, 255, 0, 100);
    rect(x, y, cardWidth, cardHeight, 10);
  }

  // Card background rectangle
  fill(isSelected ? 'gold' : 'white');
  rect(x, y, cardWidth, cardHeight, 5);

  // Card Sprite
  image(cardSpriteSheet, x, y, cardWidth, cardHeight, sx, sy, cardWidth, cardHeight)
}


function evaluateHand(cards) {
  let ranksOnly = cards.map(c => c.rank);
  let suitsOnly = cards.map(c => c.suit);
  let rankCounts = {};
  let rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let faceCards = ['J', 'Q', 'K']; // deprecated

  for (let r of ranksOnly) {
    rankCounts[r] = (rankCounts[r] || 0) + 1;
  }

  let counts = Object.values(rankCounts).sort((a, b) => b - a);
  let isFlush = suitsOnly.every(s => s === suitsOnly[0]);
  let sortedIndices = ranksOnly.map(r => rankOrder.indexOf(r)).sort((a, b) => a - b);
  let isStraight = sortedIndices[2] - sortedIndices[0] === 2 && sortedIndices[1] - sortedIndices[0] === 1;

  switch (cards.length) {
    case 1:
      return { name: "High Card", score: 50 };

    case 2:
      if (counts[0] === 2) return { name: "Pair", score: 100 };
      return { name: "High Card", score: 50 };

    case 3:
      if (counts[0] === 3) return { name: "Three of a Kind", score: 300 };
      if (counts[0] === 2) return { name: "Pair", score: 100 }
      return { name: "High Card", score: 50 }

    case 4:
      if (counts[0] === 4) return { name: "Four of a Kind", score: 500 };
      if (counts[0] === 3) return { name: "Three of a Kind", score: 300 };
      if (counts[0] === 2 && counts[1] === 2) return { name: "Two Pair", score: 200 }
      if (counts[0] === 2) return { name: "Pair", score: 100 }
      return { name: "High Card", score: 50 }

    case 5:
      if (isFlush && counts[0] === 5) return { name: "Flush Five", score: 1500 };
      if (counts[0] === 5) return { name: "Five of a Kind", score: 1250 };
      if (isFlush && isStraight && sortedIndices[4] === 12) return { name: "Royal Flush", score: 1000 };
      if (isFlush && isStraight) return { name: "Straight Flush", score: 700 };
      if (counts[0] === 4) return { name: "Four of a Kind", score: 600 };
      if (isFlush) return { name: "Flush", score: 500 }
      if (isStraight) return { name: "Straight", score: 450 }
      if (counts[0] === 3) return { name: "Three of a Kind", score: 300 };
      if (counts[0] === 2 && counts[1] === 2) return { name: "Two Pair", score: 200 };
      if (counts[0] === 2) return { name: "Pair", score: 100 };
      return { name: "High Card", score: 50 };
  }
}


// DEBUG
function choosePassivePerk() {
  // Filter: only show perks not already owned
  let availablePerks = PASSIVE_PERKS.filter(
    perk => !passivePerks.some(p => p.name === perk.name)
  );

  // Randomly pick 3 options
  let choices = shuffle([...availablePerks]).slice(0, 3);

  // Prompt user to choose
  let choice = prompt(
    "Choose a passive perk:\n" +
    choices.map((p, i) => `${i + 1}. ${p.name}: ${p.description}`).join("\n")
  ) || "1";

  let selectedPerk = choices[parseInt(choice) - 1];

  // Add it if it's valid and not already owned
  if (selectedPerk && !passivePerks.some(p => p.name === selectedPerk.name)) {
    passivePerks.push(selectedPerk);
  }

  gameState = "playing";
  ante++;
  round = 1;
  drawHand();
}

// activeDebuffs.forEach((debuff) => {
//   const debuffDiv = document.createElement('div');
//   const debuffDescDiv = document.createElement('div');
//   debuffDiv.className = 'debuff-item';
//   debuffDescDiv.className = 'debuff-desc';
//   debuffDiv.innerHTML = `<strong>${debuff.name}</strong>`;
//   debuffDescDiv.innerHTML = `<p>${debuff.description}</p>`;
//   debuffDisplayDiv.appendChild(debuffDiv);
//   debuffDiv.appendChild(debuffDescDiv);
// })

/** CARD SELECTION HANDLER
* Probably should be put in the card class. */
for (let i = 0; i < hand.length; i++) { // Checks through every card in the current hand.
  let card = hand[i];

  if (card && card.contains(mouseX, mouseY)) {
    if (card.selected) {
      selected = selected.filter(n => n !== i);
      card.selected = false;
    } else if (selected.length < 5) {
      selected.push(i);
      card.selected = true;
    }
  }
}


    // while (mixedChoices.length < 3) {
    //     let isPerk = random() < 0.25;
    //     let rarity = weightedRandomRarity();

    //     if (isPerk && availablePerks.length > 0) {
    //         let filtered = availablePerks.filter(p => p.rarity === rarity);
    //         if (filtered.length > 0) {
    //             let perk = random(filtered);
    //             mixedChoices.push({ type: "passive", data: perk });
    //             availablePerks.splice(availablePerks.indexOf(perk), 1);
    //             continue;
    //         }
    //     }

    //     if (!isPerk && availablePacks.length > 0) {
    //         let filtered = availablePacks.filter(p => p.rarity === rarity);
    //         if (filtered.length > 0) {
    //             let pack = random(filtered);
    //             mixedChoices.push({ type: "pack", data: pack });
    //             availablePacks.splice(availablePacks.indexOf(pack), 1);
    //             continue;
    //         }
    //     }
    // }


    // function generateUpgradeChoice() {
//     const availablePassives = PASSIVE_PERKS.filter(p => !passivePerks.some(pp => pp.name === p.name));
//     const availablePacks = [...PERKS];
//     const availableEdits = [...EDIT_PERKS];

//     const mixedChoices = [];

//     while (mixedChoices.length < 3) {
//         let categoryRoll = random();
//         let rarity = weightedRandomRarity();

//         if (categoryRoll < 0.25 && availablePassives.length > 0) {
//             let filtered = availablePassives.filter(p => p.rarity === rarity);
//             if (filtered.length > 0) {
//                 let perk = random(filtered);
//                 mixedChoices.push({type: "passive", data: perk});
//                 availablePassives.splice(availablePassives.indexOf(perk), 1);
//                 continue;
//             }
//         } else if (categoryRoll < 0.75 && availablePacks.length > 0) {
//             let filtered = availablePacks.filter(p => p.rarity === rarity);
//             if (filtered.length > 0) {
//                 let pack = random(filtered);
//                 mixedChoices.push({type: "pack", data: pack});
//                 availablePacks.splice(availablePacks.indexOf(pack), 1);
//                 continue;
//             }
//         } else if (availableEdits.length > 0) {
//             let filtered = availableEdits.filter (p => p.rarity === rarity);
//             if (filtered.length > 0) {
//                 let edit = random(filtered);
//                 mixedChoices.push({ type: "edit", data: edit });
//                 availableEdits.splice(availableEdits.indexOf(edit), 1);
//                 continue;
//             }
//         }
//     }

//     upgradeChoices = mixedChoices;
// }

function chooseUpgrade(index) {
  let choice = upgradeChoices[index];
  if (!choice) return;

  if (choice.type === "passive") {
      if (choice.type === "passive") {
          if (passivePerks.length >= MAX_PASSIVE_PERKS) {
              alert("You already have 5 passive perks. Remove one before adding another.");
              return; // Prevents overflow
          }

          passivePerks.push(choice.data);
          updatePassivePerkDisplay();
      }
  } else if (choice.type === "pack") {
      choice.data.apply();
      updatePassivePerkDisplay();
  } else if (choice.type === "")

      upgradePoints--;

  // If there are more upgrade points, generate the more upgrades.
  if (upgradePoints > 0) {
      generateUpgradeChoice();
  } else {
      addDebuff();
      gameState = "playing";
      ante++
      round = 1;
      drawHand();
  }
}

// deprecated
function chooseUpgrade(index) {
  const choice = upgradeChoices[index];
  if (!choice) return;

  const ok = choice.apply();
  if (!ok) return;

  upgradePoints--;

  if (upgradePoints > 0) {
      generateUpgradeChoice();
  } else {
      nextAnte();
  }
}

function generateUpgradeChoice() {
    
  // reset everything - hand & current selected upgrade index.
  selectedUpgradeIndex = null
  burnUsed = false;
  returnHand();
  drawHand();

  // because of how this works, upgrade names should be unique from one another.
  const availablePassives = PASSIVE_PERKS.filter(p => 
      !passivePerks.some(pp => pp.name === p.name && // Already have the passive perk?
      !burnedUpgrades.includes(p.name) // Has the passive perk been burnt?
  ));
  const availablePacks = PACKS.filter(p => !burnedUpgrades.includes(p.name));
  const availableEdits = EDIT_PERKS.filter(p => !burnedUpgrades.includes(p.name));

  const mixedChoices = [];

  while (mixedChoices.length < upgradeChoiceAmount) {
      const roll = random();
      const rarity = weightedRandomRarity();

      if (roll < 0.25 && availablePassives.length > 0) {
          const pool = availablePassives.filter(p => p.rarity === rarity);
          if (pool.length) {
              const perk = random(pool);
              mixedChoices.push(new UpgradeChoice("passive", perk));
              availablePassives.splice(availablePassives.indexOf(perk), 1);
              continue;
          }
      } else if (roll < 0.75 && availablePacks.length > 0) {
          const pool = availablePacks.filter(p => p.rarity === rarity);
          if (pool.length) {
              const pack = random(pool);
              mixedChoices.push(new UpgradeChoice("pack", pack));
              availablePacks.splice(availablePacks.indexOf(pack), 1);
              continue;
          }
      } else if (availableEdits.length > 0) {
          const pool = availableEdits.filter(p => rarity === rarity);
          if (pool.length) {
              const edit = random(pool);
              mixedChoices.push(new UpgradeChoice("edit", edit));
              availableEdits.splice(availableEdits.indexOf(edit), 1);
              continue;
          }
      }
  }

  upgradeChoices = mixedChoices;
}

// function generateUpgradeChoice() {

//     // reset everything - hand & current selected upgrade index.
//     selectedUpgradeIndex = null
//     burnUsed = false;
//     returnHand();
//     drawHand();

//     // because of how this works, upgrade names should be unique from one another.
//     const availablePassives = PASSIVE_PERKS.filter(p => 
//         !passivePerks.some(pp => pp.name === p.name && // Already have the passive perk?
//         !burnedUpgrades.includes(p.name) // Has the passive perk been burnt?
//     ));
//     const availablePacks = PACKS.filter(p => !burnedUpgrades.includes(p.name));
//     const availableEdits = EDIT_PERKS.filter(p => !burnedUpgrades.includes(p.name));

//     const mixedChoices = [];

//     while (mixedChoices.length < upgradeChoiceAmount) {
//         const roll = random();
//         const rarity = weightedRandomRarity();

//         if (roll < 0.25 && availablePassives.length > 0) {
//             const pool = availablePassives.filter(p => p.rarity === rarity);
//             if (pool.length) {
//                 const perk = random(pool);
//                 mixedChoices.push(new UpgradeChoice("passive", perk));
//                 availablePassives.splice(availablePassives.indexOf(perk), 1);
//                 continue;
//             }
//         } else if (roll < 0.75 && availablePacks.length > 0) {
//             const pool = availablePacks.filter(p => p.rarity === rarity);
//             if (pool.length) {
//                 const pack = random(pool);
//                 mixedChoices.push(new UpgradeChoice("pack", pack));
//                 availablePacks.splice(availablePacks.indexOf(pack), 1);
//                 continue;
//             }
//         } else if (availableEdits.length > 0) {
//             const pool = availableEdits.filter(p => rarity === rarity);
//             if (pool.length) {
//                 const edit = random(pool);
//                 mixedChoices.push(new UpgradeChoice("edit", edit));
//                 availableEdits.splice(availableEdits.indexOf(edit), 1);
//                 continue;
//             }
//         }
//     }

//     upgradeChoices = mixedChoices;
// }


function mouseReleased() {
  if (isDragging && heldCard) {
      // Determine closest index
      let minDist = Infinity;
      let targetIndex = holdingCardIndex;

      for (let i = 0; i < hand.length; i++) {
          if (i === holdingCardIndex) continue;
          let card = hand[i];
          let distToSlot = dist(heldCard.x, heldCard.y, card.x, card.y);
          if (distToSlot < minDist) {
              minDist = distToSlot;
              targetIndex = i;
          }
      }

      if (minDist > 150) {
          // basically do nothing: too far - snap back
      } else {
          let movedCard = hand.splice(holdingCardIndex, 1)[0];
          hand.splice(targetIndex, 0, movedCard);
      }
  } else if (heldCard) {
      // click based selection fallback if drag is never triggered. 
      // previously in mousePressed (before 30/07/25)
      let idx = holdingCardIndex;
      if (heldCard.selected) {
          selected = selected.filter(n => n !== idx);
          heldCard.selected = false;
      } else if (selected.length < 5) {
          selected.push(idx);
          heldCard.selected = true;
      }
  }

  // Updates the preview hand info 
  // gameState === "playing" because exiting upgrade phase causes visual bug
  if (selected.length >= 1 && gameState === "playing") {
      let chosenCards = selected.map(i => hand[i]);
      previewHandInfo = evaluateHand(chosenCards);
      previewHandInfo.cards = chosenCards;
      previewHandInfo.baseScore = previewHandInfo.score;
  } else {
      previewHandInfo = null;
  }

  // Reset drag state
  isDragging = false;
  heldCard = null;
  holdingCardIndex = -1;
}


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
  const availablePerks = PERKS.filter(p => 
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
      let rarity = weightedRandomRarity();


      if (forcedCursedCount > 0) {
          rarity = "Cursed";
          forcedCursedCount--
          sendEventText(`An upgrade had becom cursed!`);
      }

      if (roll < 0.55 && availablePassives.length > 0) {
          const passive = tryPickByRarity(availablePassives, rarity) || tryPickAny(availablePassives);
          if (passive) {
              slots[i] = new UpgradeChoice("passive", passive);
              continue;
          }
      } else if (roll < 0.75 && availablePacks.length > 0) {
          const pack = tryPickByRarity(availablePacks, rarity) || tryPickAny(availablePacks);
          if (pack) {
              slots[i] = new UpgradeChoice("pack", pack);
              continue;
          }
      } else if (roll < 0.9 && availableEdits.length > 0) {
          const edit = tryPickByRarity(availableEdits, rarity) || tryPickAny(availableEdits);
          if (edit) {
              slots[i] = new UpgradeChoice("edit", edit);
              continue;
          } 
      } else if (availablePerks.length > 0) {
          const perk = tryPickByRarity(availablePerks, rarity) || tryPickAny(availablePerks);
          if (perk) {
              slots[i] = new UpgradeChoice("perk", perk);
              continue;
          } 
      }
  }

  // fall back to prevent "nulls" from being generated
  // i hate this so much
  const classifyType = (item) => {
      if (availablePassives.some(p => p.name === item.name)) return "passive";
      if (availablePacks.some(p => p.name === item.name)) return "pack";
      if (availableEdits.some(p => p.name === item.name)) return "edit";
      if (availablePerks.some(p => p.name === item.name)) return "perk";
  };

  let fallbackPool = [
      ...availablePassives,
      ...availablePacks,
      ...availableEdits,
      ...availablePerks
  ].filter(u => !usedNames.has(u.name)); // no dupes

  if (forcedCursedCount > 0) {
      fallbackPool = fallbackPool.filter(u => u.rarity === "Cursed");
  }

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

// if (roll < 0.55 && availablePassives.length > 0) {
//   const passive = tryPickByRarity(availablePassives, rarity) || tryPickAny(availablePassives);
//   if (passive) {
//       slots[i] = new UpgradeChoice("passive", passive);
//       continue;
//   }
// } else if (roll < 0.75 && availablePacks.length > 0) {
//   const pack = tryPickByRarity(availablePacks, rarity) || tryPickAny(availablePacks);
//   if (pack) {
//       slots[i] = new UpgradeChoice("pack", pack);
//       continue;
//   }
// } else if (roll < 0.9 && availableEdits.length > 0) {
//   const edit = tryPickByRarity(availableEdits, rarity) || tryPickAny(availableEdits);
//   if (edit) {
//       slots[i] = new UpgradeChoice("edit", edit);
//       continue;
//   } 
// } else if (availablePerks.length > 0) {
//   const perk = tryPickByRarity(availablePerks, rarity) || tryPickAny(availablePerks);
//   if (perk) {
//       slots[i] = new UpgradeChoice("perk", perk);
//       continue;
//   } 

let baseScore = currentHandInfo.score;
let multiplier = calculateRankMultiplier(currentHandInfo.usedCards);
let finalScore = baseScore * multiplier;

// Apply passive perks
passivePerks.forEach(perk => {
    if (disabledPerk.includes(perk)) return; // Perk Lockout

    if (perk.trigger === "playHand" && perk.condition(chosenCards, finalScore)) {
        finalScore = Math.floor(perk.effect(finalScore));

        // Trigger text animations
        sendEventText(`${perk.name} activated!`)
    }
});