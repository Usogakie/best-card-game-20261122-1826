// Renders the whole table from state: heroes, boards, hands, log and screens.
// Cards are DOM nodes with data attributes; input.js listens for clicks.
// Suits are told apart by colour AND shape: each element has its own icon.

import { ELEMENTS } from './cards.js';

const ICONS = {
  ember: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 C13 6 17 8 17 13 a5 5 0 0 1 -10 0 C7 9 9 7 10 5 C10.5 6.5 11 7 12 7 C11.5 5 11.5 3.5 12 2 Z" fill="currentColor"/></svg>',
  tide: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14 c3 -3 5 3 8 0 s5 3 8 0 s4 -2 4 -2 v4 H2 Z M2 19 c3 -3 5 3 8 0 s5 3 8 0 s4 -2 4 -2 v3 H2 Z" fill="currentColor"/></svg>',
  thorn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 C17 6 19 10 19 14 a7 7 0 0 1 -14 0 C5 10 7 6 12 2 Z M12 22 V10" fill="currentColor"/></svg>',
};

export function elementIcon(element) {
  return `<span class="el-icon el-${element}">${ICONS[element]}</span>`;
}

function hpBar(side) {
  const pct = Math.max(0, Math.round((side.hp / side.maxHp) * 100));
  return `<div class="hp-bar"><div class="hp-fill" style="width:${pct}%"></div><span class="hp-text">${Math.max(0, side.hp)} / ${side.maxHp}</span></div>`;
}

function manaPips(side) {
  let pips = '';
  for (let i = 0; i < side.maxMana; i++) {
    pips += `<span class="pip${i < side.mana ? ' on' : ''}"></span>`;
  }
  return `<div class="mana" title="Mana">${pips}<span class="mana-text">${side.mana}/${side.maxMana}</span></div>`;
}

function cardFace(card, opts) {
  const el = ELEMENTS[card.element];
  const classes = ['card', `el-${card.element}`];
  if (opts.selected) classes.push('selected');
  if (opts.playable) classes.push('playable');
  if (opts.canAttack) classes.push('can-attack');
  if (opts.targetable) classes.push('targetable');
  const stats =
    card.kind === 'creature'
      ? `<div class="card-stats"><span class="atk" title="Attack">${card.atk}</span><span class="hp" title="Health">${card.hp}</span></div>`
      : `<div class="card-stats"><span class="spell-tag">Spell</span></div>`;
  return `<div class="${classes.join(' ')}" data-uid="${card.uid}" data-kind="${card.kind}" data-hand="${opts.handIndex ?? ''}">
    <div class="card-cost" title="Mana cost">${card.cost}</div>
    <div class="card-art" style="background:${el.soft}">${elementIcon(card.element)}</div>
    <div class="card-name">${card.name}</div>
    <div class="card-text">${card.text}</div>
    ${stats}
  </div>`;
}

function boardRow(creatures, side, ui) {
  let html = '';
  for (let i = 0; i < 3; i++) {
    const creature = creatures[i];
    if (!creature) {
      html += '<div class="board-slot empty"></div>';
      continue;
    }
    const selected = ui.selection?.type === 'attacker' && ui.selection.uid === creature.uid;
    const targetable = ui.selection?.type === 'spell' && side === 'ai';
    html += cardFace(creature, {
      selected,
      canAttack: creature.canAttack && side === 'player' && ui.turn === 'player',
      targetable,
      handIndex: '',
    });
  }
  return html;
}

function handRow(hand, state, ui) {
  return hand
    .map((card, index) => {
      const playable = state.turn === 'player' && card.cost <= state.player.mana;
      const selected = ui.selection?.type === 'spell' && ui.selection.handIndex === index;
      return cardFace(card, { playable, selected, handIndex: index });
    })
    .join('');
}

function showScreen(id) {
  for (const section of document.querySelectorAll('.screen')) {
    section.classList.toggle('hidden', section.id !== id);
  }
}

export function renderAll(state, ui) {
  const $ = (id) => document.getElementById(id);

  if (state.phase === 'title') {
    showScreen('title-screen');
    return;
  }
  if (state.phase === 'won' || state.phase === 'lost') {
    showScreen('end-screen');
    $('end-title').textContent = state.phase === 'won' ? 'VICTORY' : 'DEFEAT';
    $('end-title').className = state.phase === 'won' ? 'win' : 'loss';
    $('end-stats').textContent =
      `Rounds played: ${state.round} · Cards played: ${state.stats.cardsPlayed} · ` +
      `Damage dealt: ${state.stats.damageDealt} · Your health: ${Math.max(0, state.player.hp)} · Mira's health: ${Math.max(0, state.ai.hp)}`;
    return;
  }

  showScreen('game-screen');
  $('ai-name').textContent = state.ai.name;
  $('ai-hp').innerHTML = hpBar(state.ai);
  $('ai-mana').innerHTML = manaPips(state.ai);
  $('player-hp').innerHTML = hpBar(state.player);
  $('player-mana').innerHTML = manaPips(state.player);
  $('round-label').textContent = `Round ${state.round}`;
  $('ai-board').innerHTML = boardRow(state.ai.board, 'ai', ui);
  $('player-board').innerHTML = boardRow(state.player.board, 'player', ui);
  $('player-hand').innerHTML = handRow(state.player.hand, state, ui);
  $('ai-hand-count').textContent = `Mira holds ${state.ai.hand.length} card${state.ai.hand.length === 1 ? '' : 's'}`;
  $('log').innerHTML = state.log.map((line) => `<div>${line}</div>`).join('');
  $('end-turn').disabled = state.turn !== 'player';

  let hint = '';
  if (state.turn !== 'player') {
    hint = 'Mira is thinking…';
  } else if (ui.selection?.type === 'spell') {
    hint = 'Choose a target — click an enemy creature or Mira herself. Esc to cancel.';
  } else if (ui.selection?.type === 'attacker') {
    hint = 'Attacker chosen — click an enemy creature, or Mira, to strike. Esc to cancel.';
  } else {
    hint = 'Your turn — click a card to play it, click one of your creatures to attack, or End Turn.';
  }
  $('status-line').textContent = hint;
}
