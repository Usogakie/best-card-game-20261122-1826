// Card pool and elements for Rune Clash.
// Every card is plain data: id, name, kind, element, cost, and stats.
// Elements form a cycle: Ember beats Thorn, Thorn beats Tide, Tide beats Ember.
// An attacker whose element beats its target's deals +1 damage.

export const ELEMENTS = {
  ember: { key: 'ember', name: 'Ember', color: '#c0392b', soft: '#f5b7b1', beats: 'thorn' },
  tide: { key: 'tide', name: 'Tide', color: '#2471a3', soft: '#aed6f1', beats: 'ember' },
  thorn: { key: 'thorn', name: 'Thorn', color: '#1e8449', soft: '#a9dfbf', beats: 'tide' },
};

export function elementBeats(attacker, defender) {
  return ELEMENTS[attacker].beats === defender;
}

// Creatures stay on the table and attack once a turn. Spells resolve at once.
export const CARD_POOL = [
  { id: 'ember-imp', name: 'Ember Imp', kind: 'creature', element: 'ember', cost: 1, atk: 2, hp: 1, text: 'Quick spark, quick to fade.' },
  { id: 'tide-sprite', name: 'Tide Sprite', kind: 'creature', element: 'tide', cost: 1, atk: 1, hp: 2, text: 'It slips between the waves.' },
  { id: 'thorn-sprout', name: 'Thorn Sprout', kind: 'creature', element: 'thorn', cost: 1, atk: 1, hp: 3, text: 'Small roots, stubborn grip.' },
  { id: 'ember-hound', name: 'Ember Hound', kind: 'creature', element: 'ember', cost: 2, atk: 3, hp: 2, text: 'Bark of sparks.' },
  { id: 'tide-serpent', name: 'Tide Serpent', kind: 'creature', element: 'tide', cost: 2, atk: 2, hp: 3, text: 'It coils through the deep.' },
  { id: 'thorn-bramble', name: 'Thorn Bramble', kind: 'creature', element: 'thorn', cost: 2, atk: 2, hp: 4, text: 'A wall that bites.' },
  { id: 'ember-phoenix', name: 'Ember Phoenix', kind: 'creature', element: 'ember', cost: 3, atk: 4, hp: 3, text: 'Born again from ash.' },
  { id: 'tide-leviathan', name: 'Tide Leviathan', kind: 'creature', element: 'tide', cost: 3, atk: 3, hp: 5, text: 'The tide, given teeth.' },
  { id: 'thorn-ancient', name: 'Thorn Ancient', kind: 'creature', element: 'thorn', cost: 3, atk: 5, hp: 4, text: 'Older than the forest.' },
  { id: 'spark-burst', name: 'Spark Burst', kind: 'spell', element: 'ember', cost: 1, text: 'Deal 2 damage to any target.', damage: 2, target: 'any' },
  { id: 'healing-spring', name: 'Healing Spring', kind: 'spell', element: 'tide', cost: 2, text: 'Restore 4 health to your hero.', heal: 4, target: 'self' },
  { id: 'thorn-snare', name: 'Thorn Snare', kind: 'spell', element: 'thorn', cost: 1, text: 'Deal 1 damage to all enemy creatures.', damage: 1, target: 'all-enemies' },
];

export function cardById(id) {
  return CARD_POOL.find((c) => c.id === id);
}

export function deckCardIds() {
  // Two copies of every card: a 24-card deck.
  const ids = [];
  for (const card of CARD_POOL) ids.push(card.id, card.id);
  return ids;
}
