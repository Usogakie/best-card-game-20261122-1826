// Game rules for Rune Clash: turns, mana, playing cards, combat, winning.
// Both heroes start at 20 health. Reduce the rival hero to 0 to win.
// Mana refills each turn and grows with the round (3, then +1 up to 6).
// A creature cannot attack on the turn it is played.

import { cardById, elementBeats } from './cards.js';
import { MAX_HAND, buildDeck, drawOne, makeCreature } from './deck.js';

export const START_HP = 20;
export const MAX_BOARD = 3;

export function newSide(name, rand) {
  const deck = buildDeck(rand);
  const hand = [];
  for (let i = 0; i < 3; i++) {
    const card = drawOne(deck);
    if (card) hand.push(card);
  }
  return { name, hp: START_HP, maxHp: START_HP, mana: 3, maxMana: 3, deck, hand, board: [] };
}

export function newGame(rand) {
  const state = {
    phase: 'play',
    round: 1,
    turn: 'player',
    player: newSide('You', rand),
    ai: newSide('Mira, Tidecaller', rand),
    log: ['The duel begins. Your move — play a card or attack.'],
    stats: { damageDealt: 0, cardsPlayed: 0, turnsPlayed: 0 },
  };
  return state;
}

export function sideOf(state, side) {
  return side === 'player' ? state.player : state.ai;
}

export function otherSide(state, side) {
  return side === 'player' ? state.ai : state.player;
}

export function log(state, message) {
  state.log.unshift(message);
  if (state.log.length > 6) state.log.length = 6;
}

export function startTurn(state, side) {
  const me = sideOf(state, side);
  me.maxMana = Math.min(3 + (state.round - 1), 6);
  me.mana = me.maxMana;
  for (const creature of me.board) creature.canAttack = true;
  if (me.hand.length < MAX_HAND) {
    const card = drawOne(me.deck);
    if (card) {
      me.hand.push(card);
      log(state, `${me.name} drew a card.`);
    }
  }
}

function manaCost(state, side, cost) {
  return sideOf(state, side).mana >= cost;
}

export function playCreature(state, side, handIndex) {
  const me = sideOf(state, side);
  const card = me.hand[handIndex];
  if (!card || card.kind !== 'creature') return false;
  if (!manaCost(state, side, card.cost)) return false;
  if (me.board.length >= MAX_BOARD) return false;
  me.mana -= card.cost;
  me.hand.splice(handIndex, 1);
  me.board.push(makeCreature(card));
  state.stats.cardsPlayed += 1;
  log(state, `${me.name} played ${card.name} (${card.cost} mana).`);
  return true;
}

// target: { type: 'creature', uid } | { type: 'hero', side } | null
export function castSpell(state, side, handIndex, target) {
  const me = sideOf(state, side);
  const foe = otherSide(state, side);
  const card = me.hand[handIndex];
  if (!card || card.kind !== 'spell') return false;
  if (!manaCost(state, side, card.cost)) return false;

  if (card.id === 'healing-spring') {
    me.mana -= card.cost;
    me.hand.splice(handIndex, 1);
    me.hp = Math.min(me.maxHp, me.hp + card.heal);
    state.stats.cardsPlayed += 1;
    log(state, `${me.name} cast Healing Spring (+${card.heal} health).`);
  } else if (card.id === 'thorn-snare') {
    me.mana -= card.cost;
    me.hand.splice(handIndex, 1);
    state.stats.cardsPlayed += 1;
    for (const creature of [...foe.board]) hurtCreature(state, foe, creature, card.damage, card.element);
    log(state, `${me.name} cast Thorn Snare (${card.damage} to all enemy creatures).`);
  } else if (card.id === 'spark-burst') {
    if (!target) return false;
    me.mana -= card.cost;
    me.hand.splice(handIndex, 1);
    state.stats.cardsPlayed += 1;
    if (target.type === 'hero') {
      const victim = sideOf(state, target.side);
      hurtHero(state, side, victim, card.damage);
      log(state, `${me.name} cast Spark Burst at ${victim.name} (${card.damage} damage).`);
    } else {
      const victim = foe.board.find((c) => c.uid === target.uid);
      if (!victim) return false;
      hurtCreature(state, foe, victim, card.damage, card.element);
      log(state, `${me.name} cast Spark Burst at ${victim.name} (${card.damage} damage).`);
    }
  } else {
    return false;
  }
  checkEnd(state);
  return true;
}

export function hurtCreature(state, owner, creature, amount, attackerElement) {
  let dealt = amount;
  if (attackerElement && elementBeats(attackerElement, creature.element)) dealt += 1;
  creature.hp -= dealt;
  if (creature.hp <= 0) {
    owner.board = owner.board.filter((c) => c.uid !== creature.uid);
    log(state, `${creature.name} was destroyed.`);
  }
  return dealt;
}

export function hurtHero(state, attackerSide, victim, amount) {
  victim.hp -= amount;
  if (attackerSide === 'player') state.stats.damageDealt += amount;
}

export function attackCreature(state, side, attackerUid, targetUid) {
  const me = sideOf(state, side);
  const foe = otherSide(state, side);
  const attacker = me.board.find((c) => c.uid === attackerUid);
  const target = foe.board.find((c) => c.uid === targetUid);
  if (!attacker || !target || !attacker.canAttack) return false;
  attacker.canAttack = false;
  const dealt = hurtCreature(state, foe, target, attacker.atk, attacker.element);
  log(state, `${attacker.name} hit ${target.name} for ${dealt}.`);
  if (foe.board.some((c) => c.uid === targetUid)) {
    const back = hurtCreature(state, me, attacker, target.atk, target.element);
    log(state, `${target.name} struck back for ${back}.`);
  }
  checkEnd(state);
  return true;
}

export function attackHero(state, side, attackerUid) {
  const me = sideOf(state, side);
  const foe = otherSide(state, side);
  const attacker = me.board.find((c) => c.uid === attackerUid);
  if (!attacker || !attacker.canAttack) return false;
  attacker.canAttack = false;
  hurtHero(state, side, foe, attacker.atk);
  log(state, `${attacker.name} hit ${foe.name} for ${attacker.atk}.`);
  checkEnd(state);
  return true;
}

export function endTurn(state) {
  if (state.phase !== 'play') return;
  state.turn = state.turn === 'player' ? 'ai' : 'player';
  if (state.turn === 'player') {
    state.round += 1;
    state.stats.turnsPlayed += 1;
  }
  startTurn(state, state.turn);
}

export function checkEnd(state) {
  if (state.phase !== 'play') return;
  if (state.ai.hp <= 0) {
    state.phase = 'won';
    log(state, 'Victory! Mira, Tidecaller falls.');
  } else if (state.player.hp <= 0) {
    state.phase = 'lost';
    log(state, 'Defeat. Mira, Tidecaller wins the duel.');
  }
}

export function cardDef(id) {
  return cardById(id);
}
