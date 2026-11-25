import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createJapaneseAudioSpeaker } from '../src/lib/japanese-audio.ts';

function setup(play = () => Promise.resolve()) {
  const audios = [];
  const speaker = createJapaneseAudioSpeaker((src) => {
    const audio = { src, playbackRate: 1, paused: false, onerror: null, onended: null,
      play, pause() { this.paused = true; }, removeAttribute() { this.src = ''; }, load() {} };
    audios.push(audio);
    return audio;
  });
  return { speaker, audios };
}

test('plays shared MP3 without any speech synthesis or installed voices and applies speed', async () => {
  const ctx = setup();
  assert.equal(await ctx.speaker.speak('/audio/japanese.mp3', { rate: 0.85 }), true);
  assert.equal(ctx.audios[0].src, '/audio/japanese.mp3');
  assert.equal(ctx.audios[0].playbackRate, 0.85);
});
test('navigation cancels pending playback and reports no error', async () => {
  const ctx = setup(() => new Promise(() => {}));
  const owner = new AbortController();
  let errors = 0;
  const pending = ctx.speaker.speak('/one.mp3', { signal: owner.signal, onError: () => errors++ });
  owner.abort();
  assert.equal(await pending, false);
  assert.equal(ctx.audios[0].paused, true);
  assert.equal(ctx.audios[0].src, '');
  assert.equal(errors, 0);
});
test('new request stops old audio; aborting old owner never stops newest request', async () => {
  const ctx = setup(), owner = new AbortController();
  await ctx.speaker.speak('/one.mp3', { signal: owner.signal });
  await ctx.speaker.speak('/two.mp3');
  owner.abort();
  assert.equal(ctx.audios[0].paused, true);
  assert.equal(ctx.audios[1].paused, false);
  ctx.speaker.stop();
  assert.equal(ctx.audios[1].paused, true);
});
test('autoplay restrictions and network errors report failure exactly once', async () => {
  const ctx = setup(() => Promise.reject(new Error('NotAllowedError')));
  let errors = 0;
  assert.equal(await ctx.speaker.speak('/one.mp3', { onError: () => errors++ }), false);
  assert.equal(errors, 1);
  const network = setup();
  await network.speaker.speak('/two.mp3', { onError: () => errors++ });
  const fail = network.audios[0].onerror;
  fail(); fail();
  assert.equal(errors, 2);
});
test('already-aborted and empty requests never create audio', async () => {
  const ctx = setup(), owner = new AbortController(); owner.abort();
  assert.equal(await ctx.speaker.speak('/one.mp3', { signal: owner.signal }), false);
  assert.equal(await ctx.speaker.speak(''), false);
  assert.equal(ctx.audios.length, 0);
});
