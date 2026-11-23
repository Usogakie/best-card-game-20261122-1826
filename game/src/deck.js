// Deck building and drawing. A deck is a shuffled list of card ids;
// drawing pops from its end. Hands hold at most five cards.

import { cardById, deckCardIds } from './cards.js';
import { shuffleInPlace } from './rng.js';

export const MAX_HAND = 5;

export function buildDeck(rand) {
  return shuffleInPlace(deckCardIds(), rand);
}

export function drawOne(deck) {
  const id = deck.pop();
  if (id === undefined) return null;
  return makeHandCard(cardById(id));
}

let nextUid = 1;

export function makeHandCard(def) {
  return { uid: nextUid++, ...def };
}

export function makeCreature(def) {
  return {
    uid: nextUid++,
    cardId: def.id,
    kind: 'creature',
    name: def.name,
    element: def.element,
    cost: def.cost,
    atk: def.atk,
    hp: def.hp,
    maxHp: def.hp,
    canAttack: false,
    text: def.text,
  };
}
