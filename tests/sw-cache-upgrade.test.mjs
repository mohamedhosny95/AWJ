import {compatibilitySource} from './compat-context.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/client/sw.js',import.meta.url),'utf8');

function workerContext(currentHit){
  const handlers=new Map();
  const context={URL,Request,Response,Headers,importScripts(){},self:{addEventListener:(type,callback)=>handlers.set(type,callback)},AWJ_MEDIA_CONTRACT:{CACHE_NAME:AWJ_COMPAT.mediaCache},caches:{open:async()=>({match:async()=>currentHit?new Response('AWJ current build'):undefined}),match:async()=>new Response('previous build')},fetch:async()=>{throw Error('Offline');}};
  vm.createContext(context);vm.runInContext(compatibilitySource+'\n'+source,context);
  return async request=>{let response;handlers.get('fetch')({request,respondWith(value){response=value;},waitUntil(){}});return (await response).text();};
}
test('an AWJ upgrade prefers its current manifest over a retained old cache',async()=>{
  assert.equal(await workerContext(true)(new Request('https://awj.example/manifest.webmanifest')),'AWJ current build');
});
test('a retained tab can still resolve assets from the previous version',async()=>{
  assert.equal(await workerContext(false)(new Request('https://awj.example/app.js?v=previous')),'previous build');
});
