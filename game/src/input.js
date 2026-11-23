// Mouse and keyboard input, wired once with event delegation.
// Click a hand card to play it; click one of your creatures, then an
// enemy creature or Mira, to attack; Space ends the turn, Esc cancels.

import { castSpell, playCreature, attackCreature, attackHero } from './state.js';

export function bindInput(game, actions) {
  const app = document.getElementById('app');

  app.addEventListener('click', (event) => {
    const state = game.state;
    const ui = game.ui;
    if (!state) return;

    if (event.target.id === 'play-button' || event.target.id === 'again-button') {
      actions.newGame();
      return;
    }
    if (event.target.id === 'end-turn') {
      if (state.phase === 'play' && state.turn === 'player') actions.endTurn();
      return;
    }

    if (state.phase !== 'play' || state.turn !== 'player') return;

    // Enemy hero: a target for a selected attacker or Spark Burst.
    const heroHit = event.target.closest('#ai-area');
    if (heroHit && !event.target.closest('.card')) {
      if (ui.selection?.type === 'attacker') {
        actions.attackHero(ui.selection.uid);
        ui.selection = null;
      } else if (ui.selection?.type === 'spell') {
        actions.castSpell(ui.selection.handIndex, { type: 'hero', side: 'ai' });
        ui.selection = null;
      }
      actions.render();
      return;
    }

    const cardEl = event.target.closest('.card');
    if (!cardEl) {
      ui.selection = null;
      actions.render();
      return;
    }
    const uid = Number(cardEl.dataset.uid);

    // A card in the player's hand.
    if (cardEl.closest('#player-hand')) {
      const handIndex = Number(cardEl.dataset.hand);
      const card = state.player.hand[handIndex];
      if (!card) return;
      if (card.kind === 'creature') {
        if (actions.playCreature(handIndex)) ui.selection = null;
      } else if (card.id === 'spark-burst') {
        ui.selection = { type: 'spell', handIndex };
      } else {
        // Healing Spring and Thorn Snare need no target.
        if (actions.castSpell(handIndex, null)) ui.selection = null;
      }
      actions.render();
      return;
    }

    // One of the player's creatures on the table: select it to attack.
    if (cardEl.closest('#player-board')) {
      const creature = state.player.board.find((c) => c.uid === uid);
      if (!creature || !creature.canAttack) return;
      ui.selection = ui.selection?.uid === uid ? null : { type: 'attacker', uid };
      actions.render();
      return;
    }

    // An enemy creature: a target for an attacker or Spark Burst.
    if (cardEl.closest('#ai-board')) {
      if (ui.selection?.type === 'attacker') {
        actions.attackCreature(ui.selection.uid, uid);
        ui.selection = null;
      } else if (ui.selection?.type === 'spell') {
        actions.castSpell(ui.selection.handIndex, { type: 'creature', uid });
        ui.selection = null;
      }
      actions.render();
      return;
    }
  });

  document.addEventListener('keydown', (event) => {
    const state = game.state;
    if (!state) return;
    if (event.key === 'Escape') {
      game.ui.selection = null;
      actions.render();
    }
    if ((event.key === ' ' || event.key === 'Enter') && state.phase === 'play' && state.turn === 'player') {
      event.preventDefault();
      actions.endTurn();
    }
  });
}

// Thin wrappers so main.js passes one actions object.
export function makeActions(game) {
  return {
    playCreature: (handIndex) => playCreature(game.state, 'player', handIndex),
    castSpell: (handIndex, target) => castSpell(game.state, 'player', handIndex, target),
    attackCreature: (attackerUid, targetUid) => attackCreature(game.state, 'player', attackerUid, targetUid),
    attackHero: (attackerUid) => attackHero(game.state, 'player', attackerUid),
    render: () => game.render(),
  };
}
