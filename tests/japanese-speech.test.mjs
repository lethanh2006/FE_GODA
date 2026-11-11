import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createJapaneseSpeaker, japaneseVoices, preferredJapaneseVoice } from '../src/lib/japanese-speech.ts';

const voice = (name, lang='ja-JP', localService=true) => ({ name, lang, localService, voiceURI:name, default:false });
const japanese = voice('Google 日本語','ja-JP',false);
const local = voice('Kyoko');
const english = voice('English','en-US');
class Utterance { constructor(text) { this.text=text; } }
function setup(voices=[]) {
  const listeners=new Set(), spoken=[];
  let current=voices, canceled=0;
  const synth={
    getVoices:()=>current,
    addEventListener:(_,listener)=>listeners.add(listener),
    removeEventListener:(_,listener)=>listeners.delete(listener),
    cancel:()=>canceled++,
    speak:utterance=>spoken.push(utterance),
  };
  const speaker=createJapaneseSpeaker(synth, Utterance, 30);
  return {speaker,spoken, get canceled(){return canceled;},get listeners(){return listeners.size;}, load(next){current=next;for(const listener of [...listeners])listener();}};
}

test('only Japanese voices are eligible, preferring saved voice then remote Japanese',()=>{
 assert.deepEqual(japaneseVoices([english,japanese,local]),[japanese,local]);
 assert.equal(preferredJapaneseVoice([english,local,japanese]),japanese);
 assert.equal(preferredJapaneseVoice([japanese,local],local.voiceURI),local);
 assert.equal(preferredJapaneseVoice([english]),undefined);
});
test('waits for voices and binds explicit Japanese voice at natural rate',async()=>{
 const ctx=setup(); const result=ctx.speaker.speak('洗濯物');
 assert.equal(ctx.spoken.length,0);ctx.load([english,japanese]);
 assert.equal(await result,true);assert.equal(ctx.spoken[0].voice,japanese);assert.equal(ctx.spoken[0].rate,1);assert.equal(ctx.spoken[0].lang,'ja-JP');
 assert.equal(ctx.listeners,0);
});
test('no Japanese voice fails visibly and never falls back to another language',async()=>{
 const ctx=setup([english]);let failed=0;
 assert.equal(await ctx.speaker.speak('日本語',{onError:()=>failed++}),false);
 assert.equal(ctx.spoken.length,0);assert.equal(failed,1);assert.equal(ctx.listeners,0);
});
test('navigation cancels pending voice lookup so it cannot speak an old card later',async()=>{
 const ctx=setup();const pending=ctx.speaker.speak('古い');ctx.speaker.stop();ctx.load([japanese]);
 assert.equal(await pending,false);assert.equal(ctx.spoken.length,0);assert.equal(ctx.listeners,0);
});
test('only newest rapid request speaks after delayed voice loading',async()=>{
 const ctx=setup();const old=ctx.speaker.speak('一');const next=ctx.speaker.speak('二');ctx.load([japanese]);
 assert.equal(await old,false);assert.equal(await next,true);assert.deepEqual(ctx.spoken.map(u=>u.text),['二']);
});
test('applies selected voice and rate; canceled utterances do not report errors',async()=>{
 const ctx=setup([japanese,local]);let failed=0;
 await ctx.speaker.speak('文章',{voiceURI:local.voiceURI,rate:0.85,onError:()=>failed++});
 assert.equal(ctx.spoken[0].voice,local);assert.equal(ctx.spoken[0].rate,0.85);
 ctx.spoken[0].onerror({error:'interrupted'});assert.equal(failed,0);
 ctx.spoken[0].onerror({error:'synthesis-failed'});assert.equal(failed,1);
});
test('empty text does not speak and speech engine exceptions are reported',async()=>{
 const ctx=setup([japanese]);assert.equal(await ctx.speaker.speak('  '),false);
 const synth={getVoices:()=>[japanese],cancel(){},speak(){throw new Error('failed');}};
 let failed=0;
 assert.equal(await createJapaneseSpeaker(synth,Utterance).speak('日本語',{onError:()=>failed++}),false);
 assert.equal(failed,1);
});

test('aborting a button request cancels both pending lookup and active speech',async()=>{
 const pending=setup();const abort=new AbortController();
 const result=pending.speaker.speak('遅い',{signal:abort.signal});abort.abort();pending.load([japanese]);
 assert.equal(await result,false);assert.equal(pending.spoken.length,0);
 const active=setup([japanese]), owner=new AbortController();
 await active.speaker.speak('今',{signal:owner.signal});const before=active.canceled;owner.abort();assert.ok(active.canceled>before);
});
test('unmounting an old button does not cancel a newer button request',async()=>{
 const ctx=setup([japanese]), old=new AbortController();
 await ctx.speaker.speak('古い',{signal:old.signal});await ctx.speaker.speak('新しい');
 const before=ctx.canceled;old.abort();assert.equal(ctx.canceled,before);
});
