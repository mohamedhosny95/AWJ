import {compatibilitySource} from './compat-context.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,existsSync} from 'node:fs';
const read=path=>readFileSync(`src/client/${path}`,'utf8');
function context(){
  const ctx={window:{},console,Date,Math};vm.createContext(ctx);vm.runInContext(compatibilitySource+"\n"+(read('exercise-catalog.js')),ctx);
  const app=read('app.js');vm.runInContext(compatibilitySource+"\n"+(app.match(/function ex\([^]*?\n\}/)[0]),ctx);
  vm.runInContext(compatibilitySource+"\n"+(app.match(/const sessions = \{[^]*?\n\};/)[0]),ctx);
  for(const name of ['cinematicMedia','cinematicMediaFront','cinematicMotionFrames','cinematicMotionFramesFront'])vm.runInContext(compatibilitySource+"\n"+(app.match(new RegExp(`const ${name} = \\{[^]*?\\n\\};`))[0]),ctx);
  vm.runInContext(compatibilitySource+"\n"+('window.AWJ_EXERCISES.configure(sessions,{side:cinematicMedia,front:cinematicMediaFront,frames:cinematicMotionFrames,framesFront:cinematicMotionFramesFront});'),ctx);
  return ctx;
}
test('custom movements and equipment variants have exact exercise definitions, not unrelated media',()=>{
  const ctx=context(),catalog=ctx.window.AWJ_EXERCISES;
  for(const [name,pose] of [['Dumbbell Lateral Raise','lateralraise'],['Incline Dumbbell Curl','curl'],['Lying Leg Curl','legcurl'],['Hanging Knee Raise','kneeraise']]){
    const resolved=catalog.resolve({name,motion:'inclinedbpress',sets:3});assert.equal(resolved.pose,pose);assert.equal(resolved.logMode,name==='Hanging Knee Raise'?'bodyweight':'weighted');assert.equal(resolved.photo,null);assert.ok(resolved.setup.length>30);
  }
  assert.equal(catalog.get('Push-Up').name,'Push-ups');assert.equal(catalog.get('Flat Dumbbell Bench').name,'Dumbbell Bench Press');assert.equal(catalog.get('Dumbbell Romanian Deadlift').photo,null);
});
test('substitutions replace instructions and preserve the programme prescription',()=>{
  const catalog=context().window.AWJ_EXERCISES;
  const swap=catalog.resolve({name:'Chest Press',motion:'chestpress',setup:'Sit at a machine',sets:2,prescription:'2 × 10',rest:90},'Push-Up');
  assert.equal(swap.name,'Push-ups');assert.equal(swap.pose,'pushup');assert.equal(swap.logMode,'bodyweight');assert.doesNotMatch(swap.setup,/machine/);assert.equal(swap.sets,2);assert.equal(swap.rest,90);assert.match(swap.photo,/push-ups.webp/);
  const unknown=catalog.resolve({name:'Chest Press'},'Unknown move');assert.equal(unknown.photo,null);assert.equal(unknown.atlas,null);assert.match(unknown.execution,/exercise-specific/);
});
test('all built-in, builder and substitution options resolve to available male media or their own guide',()=>{
  const ctx=context(),catalog=ctx.window.AWJ_EXERCISES;vm.runInContext(compatibilitySource+"\n"+(read('technique-guides.js')),ctx);
  vm.runInContext(compatibilitySource+"\n"+(read('product-suite.js')),ctx);vm.runInContext(compatibilitySource+"\n"+(read('performance-insights.js')),ctx);
  const names=ctx.window.AWJ_EXERCISES.list().filter(ex=>['weighted','bodyweight'].includes(ex.logMode)).map(ex=>ex.name);
  for(const list of Object.values(ctx.AWJ_PERFORMANCE_INSIGHTS.EXERCISE_SUBSTITUTIONS))names.push(...list);
  for(const original of ['Leg Press','Back Extension','Hip Thrust Machine','Chest Press','Seated Cable Row','Lat Pulldown'])names.push(...ctx.AWJ_PRODUCT_SUITE.availableSubstitutions(original,['dumbbells','bodyweight','bands','machines']).map(x=>x.name));
  for(const name of names){const item=catalog.get(name);assert.ok(item,`definition missing: ${name}`);assert.equal(item.mediaPresentation,'male');assert.ok(item.photo||item.atlas||ctx.window.AWJ_TECHNIQUE.guideFor(item)||item.isHold,`own guide missing: ${name}`);}
  for(const item of catalog.list())for(const src of [item.photo,item.photoFront,...item.frames,...item.framesFront].filter(Boolean))assert.ok(existsSync(`src/client/${src}`),src);
});
test('custom routines survive serialization, hydration and registration without losing active session data',()=>{
  const ctx=context(),catalog=ctx.window.AWJ_EXERCISES;
  ctx.APP_SCHEMA=22;ctx.AWJ_HEALTH_GUIDE={version:'audit'};ctx.saved={};ctx.state={customRoutines:catalog.normalizeRoutines([{id:'custom-test',title:'My saved workout',exercises:[{name:'Flat Dumbbell Bench',sets:4,prescription:'4 × 8',rest:120}]}]),session:'custom-test',index:0,completed:{'custom-test-0':[0]},logs:{'Dumbbell Bench Press':{sets:[{weight:20,reps:8}]}},timer:null};
  const serializer=read('enhancements.js').match(/function statePayload\(\)\{[^]*?\n  \}/)[0];vm.runInContext(compatibilitySource+"\n"+(serializer),ctx);
  const payload=vm.runInContext(compatibilitySource+"\n"+('statePayload()'),ctx),restored=JSON.parse(JSON.stringify(payload));assert.equal(restored.customRoutines[0].title,'My saved workout');assert.equal(restored.logs['Dumbbell Bench Press'].sets[0].reps,8);
  const sessions={};catalog.registerRoutines(restored.customRoutines,sessions);assert.equal(sessions[restored.session].exercises[0].name,'Dumbbell Bench Press');assert.equal(sessions[restored.session].exercises[0].sets,4);
  ctx.state.customRoutines=null;assert.equal(vm.runInContext(compatibilitySource+"\n"+("Array.isArray(statePayload().customRoutines)"),ctx),true);
  assert.deepEqual(catalog.normalizeRoutines(null).length,0);assert.equal(catalog.normalizeRoutines([{id:'__proto__',exercises:[]}]).length,0);
});
test('custom sessions get weight/reps entry and completed substitutions keep the actual exercise name',()=>{
  const ctx=context();ctx.state={session:'custom-upper'};
  vm.runInContext(compatibilitySource+"\n"+(read('app.js').match(/function isLoadExercise\(item\)\{[^\n]+/)[0]),ctx);
  assert.equal(vm.runInContext(compatibilitySource+"\n"+('isLoadExercise({name:"Leg Press"})'),ctx),true);assert.equal(vm.runInContext(compatibilitySource+"\n"+('isLoadExercise({name:"Dumbbell Lateral Raise"})'),ctx),true);assert.equal(vm.runInContext(compatibilitySource+"\n"+('isLoadExercise({name:"Plank"})'),ctx),false);
  ctx.AWJ_EXERCISES=ctx.window.AWJ_EXERCISES;vm.runInContext(compatibilitySource+"\n"+(read('training-session.js')),ctx);
  const state={session:'gym',sessionStartedAt:1000,completed:{'gym-0':[0]},history:[],swaps:{},exerciseSubstitutions:{'Chest Press':'Push-Up'},logs:{'Push-ups':{sets:[{reps:10,rpe:7}]}}};
  const record=ctx.AWJ_TRAINING_SESSION.completeWorkout(state,{gym:{exercises:[{name:'Chest Press',sets:1,motion:'chestpress'}]}},{now:5000}).record;
  assert.equal(record.entries[0].exercise,'Push-ups');assert.equal(record.entries[0].reps,10);
});
