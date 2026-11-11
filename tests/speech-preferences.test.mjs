import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSpeechPreferences, DEFAULT_SPEECH_PREFERENCES } from '../src/lib/speech-preferences.ts';

test('defaults to autoplay and normal speed on first visit or corrupt storage',()=>{
 for (const value of [null,'broken','null','42']) assert.deepEqual(parseSpeechPreferences(value),DEFAULT_SPEECH_PREFERENCES);
});
test('only known speed values and valid setting types are restored',()=>{
 assert.deepEqual(parseSpeechPreferences('{"voiceURI":"Japanese voice","rate":0.85,"autoPlay":false}'),{voiceURI:'Japanese voice',rate:0.85,autoPlay:false});
 assert.deepEqual(parseSpeechPreferences('{"voiceURI":44,"rate":100,"autoPlay":"false"}'),DEFAULT_SPEECH_PREFERENCES);
});
