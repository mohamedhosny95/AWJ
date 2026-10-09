import {compatibilitySource} from './compat-context.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function motionContext(reduced=false){
  const updates=[],ctx={document:{body:{},querySelector:()=>null,addEventListener:()=>{},startViewTransition:update=>{updates.push(update);return {skipTransition(){},finished:new Promise(()=>{})};}},matchMedia:()=>({matches:reduced}),MutationObserver:class{observe(){}}};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(compatibilitySource+"\n"+(readFileSync('src/client/motion.js','utf8')),ctx);return {ctx,updates};
}

test('rapid navigation commits only the most recent queued view transition',()=>{
  const {ctx,updates}=motionContext(),seen=[];
  ctx.AWJ_MOTION.transition(()=>seen.push('old'));
  ctx.AWJ_MOTION.transition(()=>seen.push('latest'));
  updates[1]();updates[0]();
  assert.deepEqual(seen,['latest']);
});
test('returning to the rendered route cancels a queued transition',()=>{const {ctx,updates}=motionContext();let stale=false;ctx.AWJ_MOTION.transition(()=>{stale=true;});ctx.AWJ_MOTION.cancel();updates[0]();assert.equal(stale,false);});
test('a skipped browser snapshot does not create an unhandled rejection',async()=>{const {ctx}=motionContext();ctx.document.startViewTransition=()=>({ready:Promise.reject(new Error('Transition was skipped')),finished:Promise.resolve(),skipTransition(){}});ctx.AWJ_MOTION.transition(()=>{});await new Promise(resolve=>setImmediate(resolve));});

test('poster and set animations do not cancel each other or a pending route update',()=>{
  const {ctx,updates}=motionContext();let committed=false;
  ctx.AWJ_MOTION.transition(()=>{committed=true;});
  const create=()=>({cancelled:false,animate(){const owner=this;return {cancel(){owner.cancelled=true;},finished:new Promise(()=>{})};}}),poster=create(),set=create();
  ctx.AWJ_MOTION.animate(poster,'media');ctx.AWJ_MOTION.animate(set,'set');updates[0]();
  assert.equal(poster.cancelled,false);assert.equal(set.cancelled,false);assert.equal(committed,true);
  ctx.AWJ_MOTION.animate(poster,'media');assert.equal(poster.cancelled,true);
});

test('reduced motion commits immediately without snapshots or animation',()=>{
  const {ctx,updates}=motionContext(true);let changed=false,animated=false;
  ctx.AWJ_MOTION.transition(()=>{changed=true;});ctx.AWJ_MOTION.animate({animate(){animated=true;}},'exercise');
  assert.equal(changed,true);assert.equal(animated,false);assert.equal(updates.length,0);
});

test('navigation restores focus after the winning route is actually rendered',()=>{
  const queued=[],frames=[],seen=[],ctx={location:{pathname:'/',search:'',hash:''},history:{state:{},pushState(state,_,url){this.state=state;ctx.location.hash=url.split('#')[1];},replaceState(state,_,url){this.state=state;ctx.location.hash=url.split('#')[1];}},document:{documentElement:{dataset:{}}},scrollY:0,scrollTo(){},requestAnimationFrame:callback=>frames.push(callback),addEventListener(){},dispatchEvent(){},CustomEvent:class{},focusViewHeading(options){assert.equal(options.scroll,false,'heading focus must not reset restored scroll');seen.push('focus');},AWJ_MOTION:{transition:update=>queued.push(update)}};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(compatibilitySource+"\n"+(readFileSync('src/client/navigation.js','utf8')),ctx);
  ctx.AWJ_NAVIGATION.register([{id:'a',title:'A',activate:()=>seen.push('a')},{id:'b',title:'B',activate:()=>seen.push('b')}]);
  ctx.AWJ_NAVIGATION.start({fallback:'a'});assert.deepEqual(seen,['a']);assert.equal(queued.length,0,'first render is immediate');seen.length=0;
  ctx.AWJ_NAVIGATION.navigate('b');queued[0]();frames.forEach(callback=>callback());
  assert.deepEqual(seen,['b','focus']);assert.equal(ctx.document.title,'B · AWJ / أوج');assert.equal(ctx.AWJ_NAVIGATION.current(),'b');
});

test('returning to a tab restores its scroll position',()=>{
  const positions=[],ctx={location:{pathname:'/',search:'',hash:''},history:{state:{},pushState(state,_,url){this.state=state;ctx.location.hash=url.split('#')[1];},replaceState(state,_,url){this.state=state;ctx.location.hash=url.split('#')[1];}},document:{documentElement:{dataset:{}}},scrollY:0,scrollTo({top}){this.scrollY=top;positions.push(top);},requestAnimationFrame:callback=>callback(),addEventListener(){},dispatchEvent(){},CustomEvent:class{},focusViewHeading(){}};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(compatibilitySource+"\n"+(readFileSync('src/client/navigation.js','utf8')),ctx);
  ctx.AWJ_NAVIGATION.register([{id:'today',activate(){}},{id:'train',activate(){}}]);
  ctx.AWJ_NAVIGATION.start({fallback:'today'});
  ctx.scrollY=380;ctx.AWJ_NAVIGATION.navigate('train');
  ctx.scrollY=125;ctx.AWJ_NAVIGATION.navigate('today');
  assert.equal(ctx.scrollY,380);
  assert.equal(positions.at(-1),380);
});
