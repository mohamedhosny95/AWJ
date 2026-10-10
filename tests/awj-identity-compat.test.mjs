import './compat-context.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {AWJ_COMPAT as serverCompat,pairingSecret} from '../src/server/compatibility.ts';
import worker from '../dist/server/index.node.js';

test('AWJ can use the existing deployment pairing secret',()=>{
  assert.equal(pairingSecret({[serverCompat.pairingSecretName]:'existing-secret'}),'existing-secret');
  assert.equal(pairingSecret({AWJ_SYNC_KEY:'new-secret',[serverCompat.pairingSecretName]:'existing-secret'}),'new-secret');
});

test('legacy device headers and credentials remain valid after AWJ issues its new cookie',async()=>{
  const values=new Map(),key='legacy-device-pairing-secret-with-ample-entropy';
  const environment={
    [serverCompat.pairingSecretName]:key,
    PAIR_RATE_LIMITER:{limit:async()=>({success:true})},
    PUSH_KV:{get:async(name,type)=>{const value=values.get(name);return type==='json'&&value?JSON.parse(value):value||null;},put:async(name,value)=>{values.set(name,String(value));},delete:async name=>{values.delete(name);}}
  };
  const response=await worker.fetch(new Request('https://awj.example/api/pair-check',{method:'POST',headers:{[serverCompat.syncHeader]:key}}),environment,{});
  assert.equal(response.status,200);
  const cookie=response.headers.get('set-cookie').split(';')[0];assert.match(cookie,/^__Host-awj_session=awj1\./);
  const previousCookie=cookie.replace('__Host-awj_session',serverCompat.sessionCookie).replace('awj1.',serverCompat.tokenVersion+'.');
  const restored=await worker.fetch(new Request('https://awj.example/api/pair-check',{method:'POST',headers:{cookie:previousCookie}}),environment,{});
  assert.equal(restored.status,200);assert.equal((await restored.json()).deviceCredential,true);
});
