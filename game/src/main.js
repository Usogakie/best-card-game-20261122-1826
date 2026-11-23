// Boot and turn loop for Rune Clash, plus deterministic demo states
// (?demo=table|win|loss) used to take the entry's screenshots.

import { cardById } from './cards.js';
import { mulberry32 } from './rng.js';
import { makeCreature, makeHandCard } from './deck.js';
import { newGame, startTurn, endTurn, playCreature, castSpell, attackCreature, attackHero, checkEnd } from './state.js';
import { aiNextAction } from './ai.js';
import { renderAll } from './render.js';
import { bindInput, makeActions } from './input.js';

const game = { state: { phase: 'title' }, ui: { selection: null } };
game.render = () => renderAll(game.state, game.ui);

function applyAiAction(action) {
  const state = game.state;
  if (action.type === 'play') playCreature(state, 'ai', action.handIndex);
  if (action.type === 'spell') castSpell(state, 'ai', action.handIndex, action.target);
  if (action.type === 'attack-creature') attackCreature(state, 'ai', action.attackerUid, action.targetUid);
  if (action.type === 'attack-hero') attackHero(state, 'ai', action.attackerUid);
}

function runAiTurn() {
  const state = game.state;
  if (state.phase !== 'play' || state.turn !== 'ai') return;
  const action = aiNextAction(state);
  if (!action) {
    endTurn(state);
    game.render();
    return;
  }
  applyAiAction(action);
  game.render();
  setTimeout(runAiTurn, 500);
}

function startNewGame() {
  game.state = newGame(mulberry32((Date.now() % 2147483647) + 1));
  game.ui.selection = null;
  game.render();
}

// A fixed mid-game table for the cover screenshot: both sides bloodied,
// creatures on the table, a full hand, mana to spend.
function demoTableState() {
  const state = newGame(mulberry32(20261123));
  state.round = 4;
  state.player.hp = 14;
  state.ai.hp = 11;
  state.player.maxMana = 5;
  state.player.mana = 4;
  state.ai.maxMana = 5;
  state.ai.mana = 2;
  state.player.hand = ['ember-phoenix', 'spark-burst', 'tide-serpent', 'healing-spring'].map((id) =>
    makeHandCard(cardById(id)),
  );
  state.ai.hand = ['thorn-ancient', 'ember-hound'].map((id) => makeHandCard(cardById(id)));
  const emberHound = makeCreature(cardById('ember-hound'));
  emberHound.canAttack = true;
  const tideSerpent = makeCreature(cardById('tide-serpent'));
  tideSerpent.canAttack = true;
  state.player.board = [emberHound, tideSerpent];
  const bramble = makeCreature(cardById('thorn-bramble'));
  bramble.hp = 2;
  const leviathan = makeCreature(cardById('tide-leviathan'));
  leviathan.canAttack = true;
  const imp = makeCreature(cardById('ember-imp'));
  imp.canAttack = true;
  state.ai.board = [bramble, leviathan, imp];
  state.log = [
    'Mira played Tide Leviathan (3 mana).',
    'Your Ember Hound hit Thorn Bramble for 2.',
    'You played Tide Serpent (2 mana).',
    'Mira drew a card.',
  ];
  return state;
}

function demoEndState(won) {
  const state = newGame(mulberry32(7));
  state.round = 7;
  state.stats = { damageDealt: won ? 22 : 9, cardsPlayed: 11, turnsPlayed: 6 };
  if (won) {
    state.ai.hp = 0;
    state.phase = 'won';
    state.log = ['Victory! Mira, Tidecaller falls.'];
  } else {
    state.player.hp = 0;
    state.phase = 'lost';
    state.log = ['Defeat. Mira, Tidecaller wins the duel.'];
  }
  return state;
}

function boot() {
  const params = new URLSearchParams(window.location.search);
  const demo = params.get('demo');

  const actions = makeActions(game);
  actions.newGame = startNewGame;
  actions.endTurn = () => {
    const state = game.state;
    if (state.phase !== 'play' || state.turn !== 'player') return;
    game.ui.selection = null;
    endTurn(state);
    game.render();
    if (state.phase === 'play' && state.turn === 'ai') setTimeout(runAiTurn, 600);
  };
  bindInput(game, actions);

  if (demo === 'table') {
    game.state = demoTableState();
  } else if (demo === 'win') {
    game.state = demoEndState(true);
  } else if (demo === 'loss') {
    game.state = demoEndState(false);
  } else {
    game.state = { phase: 'title' };
  }
  game.render();
}

document.addEventListener('DOMContentLoaded', boot);
