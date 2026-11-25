import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../src/lib/data/japanese-audio.json', import.meta.url), 'utf8'));

test('shared recordings include known N4 reading and sentence, with every MP3 packaged for deployment', () => {
  assert.ok(manifest['ほんもの']);
  assert.ok(manifest['本物は、写真よりもっときれいですよ。']);
  for (const [text, src] of Object.entries(manifest)) {
    const digest = createHash('sha256').update(text).digest('hex').slice(0, 24);
    assert.equal(src, `/audio/ja-nanami-v1/${digest}.mp3`);
    const path = new URL(`../public${src}`, import.meta.url);
    assert.ok(statSync(path).size > 512, `Missing or empty recording: ${text}`);
    const bytes = readFileSync(path);
    assert.ok(bytes.subarray(0, 3).toString() === 'ID3' || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0), `Invalid MP3 header: ${text}`);
  }
});

test('new kanji word cards have recordings without installed device voices', () => {
  for (const reading of ['きょうりょく', 'うんどうします', 'じどう', 'ふります', 'おります']) {
    assert.ok(manifest[reading], `Missing N4 kanji reading: ${reading}`);
  }
});
