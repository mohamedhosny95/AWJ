/* today screen composition; calculations and persistence stay in domain modules. */
export function createTodayScreen(ui){
  const {enter,heading,readinessMarkup,saveStatus,bindSaveStatus,route,checkin,sheet}=ui;
  
function today(){
    enter('home-overview','home');const resume=REP_TRAINING_SESSION.isResumableWorkout(state,sessions),plan=window.REP_ENHANCEMENTS_UI.adaptiveTodayPlan(),id=resume?state.session:plan.targetSession,s=sessions[id]||{name:"Recovery day",meta:"No scheduled workout",description:plan.detail,exercises:[]},ls=sessionText(id,s),duration=id?(s.duration||ls.meta.match(/\d+[–-]\d+ min|\d+ min/)?.[0]||''):'';
    const sessionDetail=id?[duration||null,`${s.exercises.length} exercises`,resume?`Exercise ${state.index+1}`:null].filter(Boolean).map(esc).join(' · '):'A lighter day for rest, gentle movement, and your daily practices.';
    app.innerHTML=REP_SAFE_DOM.sanitize(`${heading('Today',new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}))}<section class="today-session" data-today-session><div><span class="muted">${resume?'In progress':id?"Today's workout":"Today’s focus"}</span><h2>${esc(ls.name)}</h2><p>${sessionDetail}</p></div><button class="primary-action" data-today-start>${resume?'Resume workout':id?'Start workout':'Review recovery'}</button><button class="quiet-action" data-today-preview>${id?'Review exercises':'View routines'}</button></section>${readinessMarkup()}<nav class="quick-actions" aria-label="Quick actions"><button data-adjust-today>Adjust today</button><button data-today-activity>Log activity</button><button data-today-food>Meal / water</button><button data-today-checkin>Check-in</button></nav>${saveStatus()}<section data-daily-routines></section>`);
    document.querySelector('[data-today-start]').onclick=()=>{if(!id){route("health-vitals");return;}if(!resume)REP_ADAPTIVE_COACH.applyPlan(state,plan,sessions);startSession(id);};
    document.querySelector('[data-today-preview]').onclick=()=>id?showSessionPreview(id):route('training-program');
    document.querySelector('[data-adjust-today]').onclick=()=>sheet('Adjust today',`<p>Choose a lighter option using your existing plan.</p><button class="primary-action" data-adjust-light>Short workout</button><button data-adjust-schedule>Move this workout</button>`,(root,close)=>{root.querySelector('[data-adjust-light]').onclick=()=>{close();renderBadDay();};root.querySelector('[data-adjust-schedule]').onclick=()=>{close();route('settings-schedule');};});
    document.querySelector('[data-today-activity]').onclick=()=>showLogActivity();document.querySelector('[data-today-food]').onclick=()=>route('nutrition-log');document.querySelector('[data-today-checkin]').onclick=checkin;
    window.REP_HABITS.mount();bindSaveStatus();
    const totals=foodTotals(),water=Number(state.water?.[isoDay()]||0),overview=document.createElement('nav');
    overview.className='daily-overview';overview.setAttribute('aria-label','Daily overview');
    overview.innerHTML=REP_SAFE_DOM.sanitize(`<a href="#/nutrition/today"><strong>${Math.round(totals.calories||0)}</strong><span>Calories logged</span></a><a href="#/nutrition/today"><strong>${esc(window.waterDisplay(water))}</strong><span>Water today</span></a><a href="#/wellbeing/recovery"><strong>Check in</strong><span>Recovery & sleep</span></a>`);
    app.querySelector('.quick-actions')?.before(overview);
  }
  return {today};
}
