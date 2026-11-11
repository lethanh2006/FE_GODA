import { test } from 'node:test';
import assert from 'node:assert/strict';
import { japaneseSpeechText, japaneseSentenceText, deckFrontFurigana, listeningOptions, sameMeaning, shuffled } from '../src/lib/deck-games.ts';

const cards = [
  { id: 'a', meaning: 'thất bại' },
  { id: 'b', meaning: 'thành công' },
  { id: 'c', meaning: 'thất bại' },
  { id: 'd', meaning: 'vui' },
  { id: 'e', meaning: 'buồn' },
  { id: 'f', meaning: 'ăn' },
];

test('speech reads ruby readings without announcing braces or pipes', () => {
  assert.equal(japaneseSpeechText('ダイエットは{多分|たぶん}{失敗|しっぱい}するだろう。'), 'ダイエットはたぶんしっぱいするだろう。');
  assert.equal(japaneseSpeechText('こんにちは。'), 'こんにちは。');
});
test('options include the answer once, with at most four distinct meanings', () => {
  for (const card of cards) {
    const options = listeningOptions(cards, card);
    assert.equal(options.length, 4);
    assert.equal(options.filter((option) => sameMeaning(option, card)).length, 1);
    assert.equal(new Set(options.map((option) => option.meaning)).size, 4);
    assert.ok(options.some((option) => option.id === card.id));
  }
});
test('small and duplicate-only decks do not create bogus distractors', () => {
  assert.equal(listeningOptions([cards[0]], cards[0]).length, 1);
  assert.equal(listeningOptions([cards[0], cards[2]], cards[0]).length, 1);
  assert.ok(sameMeaning(cards[0], { meaning: ' thất bại ' }));
});
test('shuffling preserves every card and leaves input untouched', () => {
  const copy = [...cards];
  assert.deepEqual(shuffled(cards).map((card) => card.id).sort(), cards.map((card) => card.id).sort());
  assert.deepEqual(cards, copy);
  assert.deepEqual(shuffled([]), []);
});


test('sentence preparation keeps kanji context and removes ruby notation only', () => {
  assert.equal(japaneseSentenceText('ダイエットは{多分|たぶん}{失敗|しっぱい}するだろう。'), 'ダイエットは多分失敗するだろう。');
  assert.equal(japaneseSpeechText('しっぱい（する）'), 'しっぱいする');
});
test('front ruby prefers supplied markup and falls back to the known full-word reading', () => {
  assert.equal(deckFrontFurigana({term:'洗濯物',reading:'せんたくもの',furigana:null}), '{洗濯物|せんたくもの}');
  assert.equal(deckFrontFurigana({term:'忘れる',reading:'わすれる',furigana:'{忘|わす}れる'}), '{忘|わす}れる');
  assert.equal(deckFrontFurigana({term:'きっと',reading:'きっと',furigana:null}), 'きっと');
  assert.equal(deckFrontFurigana({term:'洗濯物',reading:'',furigana:null}), '洗濯物');
});
