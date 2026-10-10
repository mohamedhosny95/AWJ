/* Small preferences and active-session choices in the existing durable state. */
(function(root){
  function normalize(state){
    state.routineFavourites=Array.isArray(state.routineFavourites)?[...new Set(state.routineFavourites.filter(x=>typeof x==='string'&&x.length<=100))].slice(0,100):[];
    state.displayPreferences={expandedDemo:false,...(state.displayPreferences&&typeof state.displayPreferences==='object'?state.displayPreferences:{})};
    state.displayPreferences.expandedDemo=state.displayPreferences.expandedDemo===true;
    const swaps=state.sessionSubstitutions;
    state.sessionSubstitutions=state.sessionStartedAt&&swaps&&typeof swaps==='object'&&swaps.session===state.session&&swaps.startedAt===state.sessionStartedAt&&swaps.choices&&typeof swaps.choices==='object'?swaps:null;
    return state;
  }
  function selectedExercise(state,base,sessionId=state.session){
    const current=state.sessionSubstitutions;
    const active=current&&current.session===sessionId&&current.session===state.session&&current.startedAt===state.sessionStartedAt;
    if(active&&Object.hasOwn(current.choices,base.name))return current.choices[base.name]||base.name;
    return state.exerciseSubstitutions?.[base.name]||(base.name==='Back Extension'&&state.swaps?.backExtension?'Hip Thrust Machine':base.name);
  }
  function choose(state,baseName,exerciseName){
    if(!state.sessionStartedAt)return false;
    if(state.sessionSubstitutions?.session!==state.session||state.sessionSubstitutions?.startedAt!==state.sessionStartedAt)state.sessionSubstitutions={session:state.session,startedAt:state.sessionStartedAt,choices:{}};
    if(['__proto__','constructor','prototype'].includes(baseName))return false;
    state.sessionSubstitutions.choices[baseName]=exerciseName||baseName;
    return true;
  }
  function performedExercise(state,base,setIndex){
    const current=state.sessionSubstitutions;
    return current?.session===state.session&&current.startedAt===state.sessionStartedAt
      ? current.performed?.[base.name]?.[setIndex]||selectedExercise(state,base)
      : selectedExercise(state,base);
  }
  function toggleFavourite(state,id){normalize(state);const found=state.routineFavourites.includes(id);state.routineFavourites=found?state.routineFavourites.filter(x=>x!==id):[...state.routineFavourites,id];return !found;}
  function recordSet(state,baseName,setIndex,exerciseName,completed=true){
    if(!state.sessionStartedAt||['__proto__','constructor','prototype'].includes(baseName))return;
    if(state.sessionSubstitutions?.session!==state.session||state.sessionSubstitutions?.startedAt!==state.sessionStartedAt)state.sessionSubstitutions={session:state.session,startedAt:state.sessionStartedAt,choices:{}};
    const active=state.sessionSubstitutions;active.performed=active.performed||{};active.performed[baseName]=active.performed[baseName]||{};
    if(completed)active.performed[baseName][setIndex]=exerciseName;else delete active.performed[baseName][setIndex];
  }
  function suggestions(state,name,setIndex){
    const target=state.trainingTargets?.[name],prior=state.logs?.[name]?.previousSets?.[setIndex]||state.logs?.[name]?.previousSets?.[0];
    return target?.acceptedAt?{weight:target.targetWeight,reps:target.repsLow,source:'Accepted target'}:prior?{weight:prior.weight,reps:prior.reps,source:'Last session'}:null;
  }
  root.AWJ_TRAINING_PREFERENCES=Object.freeze({normalize,selectedExercise,performedExercise,choose,recordSet,toggleFavourite,suggestions});
})(typeof window==='undefined'?globalThis:window);
