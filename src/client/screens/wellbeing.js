/* wellbeing screen composition; calculations and persistence stay in domain modules. */
export function createWellbeingScreens(ui){
  const {enter,heading,readinessMarkup,saveStatus,bindSaveStatus,route,checkin,core}=ui;
  
function wellbeing(){
    enter('wellbeing','wellbeing');
    app.innerHTML=REP_SAFE_DOM.sanitize(`${heading('Wellbeing','Daily practices and recovery in one place.')}<section class="more-menu">${[['Daily practices','Habits, hygiene and journal','health-wellness'],['Recovery & health','Sleep, check-ins and measurements','health-vitals']].map(([title,detail,id])=>`<button data-more-route="${id}"><strong>${title}</strong><span>${detail}</span><b aria-hidden="true">→</b></button>`).join('')}</section><section data-daily-routines></section>${readinessMarkup()}${saveStatus()}`);
    app.querySelectorAll('[data-more-route]').forEach(b=>b.onclick=()=>route(b.dataset.moreRoute));
    window.REP_HABITS.mount();bindSaveStatus();
  }

function recovery(){
    enter('vitals','vitals');core.vitals();
    const old=document.createElement('div');while(app.firstChild)old.append(app.firstChild);
    const sleep=old.querySelector('.sleep-card');
    app.innerHTML=REP_SAFE_DOM.sanitize(`${heading('Recovery','Sleep and recovery inputs support your training.')}<button data-more-back>← Wellbeing</button>${readinessMarkup()}<nav class="quick-actions"><button data-recovery-checkin>Quick check-in</button><button data-recovery-measurements>Measurements</button></nav><details class="recovery-sleep"><summary>Log sleep</summary></details><details class="supporting-details recovery-data"><summary>Health data, baselines and setup</summary>${window.REP_HEALTH_UI.trendMarkup()}</details>`);
    if(sleep)app.querySelector('.recovery-sleep').append(sleep);
    old.querySelectorAll('.hero,.strain-recovery-card,.recovery-head').forEach(x=>x.remove());app.querySelector('.recovery-data').append(old);
    app.querySelector('[data-more-back]').onclick=()=>route('wellbeing');app.querySelector('[data-recovery-checkin]').onclick=checkin;app.querySelector('[data-recovery-measurements]').onclick=()=>{app.querySelector('.recovery-data').open=true;app.querySelector('[data-body-measurement]')?.scrollIntoView({block:'center'});};window.REP_HEALTH_UI.bind({onMeasurementSaved:()=>{recovery();app.querySelector('.recovery-data').open=true;showToast('Measurements saved on device.');}});
    window.REP_PRODUCT_UI.mount();updatePrimaryTabs();
  }

function routines(){enter('care','care');core.wellness();const oldHead=app.querySelector('.module-head,.recovery-head');if(oldHead)oldHead.innerHTML=REP_SAFE_DOM.sanitize(heading('Daily routines','Your existing hygiene, wellness and journal routines.'));const back=document.createElement('button');back.dataset.moreBack='true';back.textContent='← Wellbeing';back.onclick=()=>route('wellbeing');app.prepend(back);window.REP_HABITS.mount();window.REP_PRODUCT_UI.mount();updatePrimaryTabs();}
  return {wellbeing,recovery,routines};
}
