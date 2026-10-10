import './compat-context.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createScreenRegistry} from '../src/client/screens/registry.ts';

test('screen changes clean up the previous feature exactly once and update the mounted feature',()=>{
  const calls=[],feature=id=>({mount:()=>calls.push(id+':mount'),update:()=>calls.push(id+':update'),destroy:()=>calls.push(id+':destroy')});
  const registry=createScreenRegistry(Object.fromEntries(['today','train','nutrition','wellbeing','recovery','routines','progress','settings'].map(id=>[id,feature(id)])));
  registry.show('today');registry.show('train');registry.update();registry.destroy();registry.destroy();
  assert.deepEqual(calls,['today:mount','today:destroy','train:mount','train:update','train:destroy']);
  assert.equal(registry.current(),null);
});
