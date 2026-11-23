// Mira, Tidecaller — the rival. Her choices are simple enough to read:
// she plays her biggest affordable creature, heals when hurt, clears a
// crowded table, snipes a creature she can kill, and otherwise goes face.
// aiNextAction returns one action at a time so each choice sees fresh state.

import { elementBeats } from './cards.js';
import { MAX_BOARD } from './state.js';

export function aiNextAction(state) {
  const ai = state.ai;
  const player = state.player;

  // 1. Play the biggest creature she can afford, while her table has room.
  let best = null;
  ai.hand.forEach((card, index) => {
    if (card.kind !== 'creature') return;
    if (card.cost > ai.mana) return;
    if (ai.board.length >= MAX_BOARD) return;
    if (!best || card.cost > best.card.cost || (card.cost === best.card.cost && card.atk > best.card.atk)) {
      best = { card, index };
    }
  });
  if (best) return { type: 'play', handIndex: best.index };

  // 2. Heal when hurt.
  const healIndex = ai.hand.findIndex((c) => c.id === 'healing-spring');
  if (healIndex >= 0 && ai.hand[healIndex].cost <= ai.mana && ai.hp <= 12) {
    return { type: 'spell', handIndex: healIndex, target: null };
  }

  // 3. Clear a crowded table.
  const snareIndex = ai.hand.findIndex((c) => c.id === 'thorn-snare');
  if (snareIndex >= 0 && ai.hand[snareIndex].cost <= ai.mana && player.board.length >= 2) {
    return { type: 'spell', handIndex: snareIndex, target: null };
  }

  // 4. Snipe a creature she can kill, otherwise hit the hero.
  const burstIndex = ai.hand.findIndex((c) => c.id === 'spark-burst');
  if (burstIndex >= 0 && ai.hand[burstIndex].cost <= ai.mana) {
    const killable = player.board
      .filter((c) => c.hp <= 2)
      .sort((a, b) => a.hp - b.hp)[0];
    if (killable) return { type: 'spell', handIndex: burstIndex, target: { type: 'creature', uid: killable.uid } };
    return { type: 'spell', handIndex: burstIndex, target: { type: 'hero', side: 'player' } };
  }

  // 5. Attack: kill a creature she can finish, otherwise go face.
  for (const attacker of ai.board) {
    if (!attacker.canAttack) continue;
    const killable = player.board
      .filter((c) => attacker.atk + (elementBeats(attacker.element, c.element) ? 1 : 0) >= c.hp)
      .sort((a, b) => a.hp - b.hp)[0];
    if (killable) return { type: 'attack-creature', attackerUid: attacker.uid, targetUid: killable.uid };
    return { type: 'attack-hero', attackerUid: attacker.uid };
  }

  return null;
}
