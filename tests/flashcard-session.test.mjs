import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFlashcardRound, rateFlashcardRound, unrememberedCards } from '../src/lib/flashcard-session.ts';

const cards = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

test('rating advances one card and retains an immutable latest result for each ID', () => {
  const first = createFlashcardRound(cards);
  const next = rateFlashcardRound(first, false);
  assert.equal(first.index, 0);
  assert.deepEqual(first.ratings, {});
  assert.equal(next.index, 1);
  assert.deepEqual(next.ratings, { a: false });
  assert.deepEqual(rateFlashcardRound(next, true).ratings, { a: false, b: true });
});

test('the final card ends the round, including a one-card round', () => {
  const round = rateFlashcardRound(createFlashcardRound([cards[0]]), false);
  assert.equal(round.index, round.cards.length);
  assert.deepEqual(round.ratings, { a: false });
  assert.equal(rateFlashcardRound(round, true), round);
  const empty = createFlashcardRound([]);
  assert.equal(rateFlashcardRound(empty, false), empty);
});

test('backtracking replaces the earlier rating without duplicate progress', () => {
  const first = rateFlashcardRound(createFlashcardRound(cards), false);
  const revised = rateFlashcardRound({ ...first, index: 0 }, true);
  assert.deepEqual(revised.ratings, { a: true });
  assert.equal(Object.keys(revised.ratings).length, 1);
  assert.equal(revised.index, 1);
});

test('repeat only difficult cards and merge each new result until every card is remembered', () => {
  let round = createFlashcardRound(cards);
  for (const remembered of [false, true, false]) round = rateFlashcardRound(round, remembered);
  let ratings = round.ratings;
  assert.deepEqual(unrememberedCards(cards, ratings), [cards[0], cards[2]]);
  let retry = createFlashcardRound(unrememberedCards(cards, ratings));
  retry = rateFlashcardRound(retry, true);
  retry = rateFlashcardRound(retry, false);
  ratings = { ...ratings, ...retry.ratings };
  assert.deepEqual(unrememberedCards(cards, ratings), [cards[2]]);
  retry = rateFlashcardRound(createFlashcardRound(unrememberedCards(cards, ratings)), true);
  assert.deepEqual(unrememberedCards(cards, { ...ratings, ...retry.ratings }), []);
});

test('all-unremembered rounds can repeat and restarting all begins with no stale ratings', () => {
  let round = createFlashcardRound(cards);
  for (let index = 0; index < cards.length; index++) round = rateFlashcardRound(round, false);
  assert.deepEqual(unrememberedCards(cards, round.ratings), cards);
  assert.deepEqual(createFlashcardRound(cards).ratings, {});
  assert.deepEqual(unrememberedCards(cards, {}), []);
  assert.deepEqual(cards, [{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
});
