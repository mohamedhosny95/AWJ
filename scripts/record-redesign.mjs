// Capture a controlled local walkthrough. It never reads a user's browser profile.
// REP_RECORD_CLIENT_ROOT can point at an extracted Git baseline's dist/client.
import {chromium} from 'playwright';
import http from 'node:http';
import {createReadStream,existsSync,statSync,mkdirSync,copyFileSync,writeFileSync} from 'node:fs';
import {join,normalize,extname,resolve} from 'node:path';

const variant=process.env.REP_RECORD_VARIANT||'after';
const root=resolve(process.env.REP_RECORD_CLIENT_ROOT||'dist/client');
const output=resolve(process.env.REP_RECORD_OUTPUT||`work/certification/redesign-${variant}`);
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.mp4':'video/mp4'};
mkdirSync(output,{recursive:true});
const server=http.createServer((request,response)=>{
  const file=normalize(join(root,decodeURIComponent(request.url.split('?')[0])==='/'?'index.html':request.url.split('?')[0]));
  if(!file.startsWith(root)||!existsSync(file)||statSync(file).isDirectory()){response.writeHead(404);response.end();return;}
  const length=statSync(file).size,headers={'content-type':mime[extname(file)]||'application/octet-stream','accept-ranges':'bytes'};
  const range=/^bytes=(\d+)-(\d*)$/.exec(request.headers.range||'');
  if(range){const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),length-1):length-1;if(start>=length||end<start){response.writeHead(416,{...headers,'content-range':`bytes */${length}`});response.end();return;}response.writeHead(206,{...headers,'content-range':`bytes ${start}-${end}/${length}`,'content-length':end-start+1});createReadStream(file,{start,end}).pipe(response);return;}
  response.writeHead(200,{...headers,'content-length':length});if(request.method==='HEAD')response.end();else createReadStream(file).pipe(response);
});
await new Promise(resolve=>server.listen(8937,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:existsSync('/Applications/Google Chrome.app')?'chrome':undefined,args:['--no-sandbox']});
try{
  const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:output,size:{width:390,height:844}}});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:8937',{waitUntil:'load'});await page.waitForSelector('html[data-app-ready="true"]');
  if(await page.locator('[data-onboarding-skip]').count())await page.click('[data-onboarding-skip]');
  await page.waitForSelector('.onboarding-backdrop',{state:'detached'});
  await page.evaluate(()=>{window.__recordFrames=[];window.__recordFrameActive=true;let previous=performance.now();const sample=time=>{if(!window.__recordFrameActive)return;window.__recordFrames.push(time-previous);previous=time;requestAnimationFrame(sample);};requestAnimationFrame(sample);});
  await page.evaluate(()=>{state.preferences.schedule[currentDay()]={morning:true,focus:'gym'};state.workoutChecks[isoDay()]={watch:true,workout:true};renderOverview();});
  const capture=async name=>{await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(350);await page.screenshot({path:join(output,name+'.png')});await page.waitForTimeout(1200);};
  await capture('today');
  await page.click('[data-app-tab="train"]');
  if(await page.locator('[data-training-view="program"]').count())await page.click('[data-training-view="program"]');
  await page.waitForSelector('[data-session="gym"]');await capture('train');
  await page.click('[data-session="gym"]');await page.waitForSelector('[data-start-session]');await capture('preview');
  await page.click('[data-start-session]');
  if(await page.locator('[data-workout-check]').count()){await page.check('[data-workout-check] [name="watch"]');await page.check('[data-workout-check] [name="workout"]');await page.locator('[data-workout-check] button[type="submit"]').click();}
  await page.waitForSelector('.workout-player');
  // Same exercise and same values on both versions; no completion is fabricated.
  await page.evaluate(()=>{state.index=1;renderExercise();});await capture('workout');
  await page.fill('[data-live-log][data-log="weight"]','40');await page.fill('[data-live-log][data-log="reps"]','10');await page.fill('[data-live-log][data-log="rpe"]','7');
  await page.click('[data-next]');await capture('rest');
  await page.evaluate(()=>{cancelRestTimer();state.index=3;renderExercise();});
  await page.click('[data-swap-modal]');await page.click('[data-select-swap="Push-ups"]');
  await page.waitForFunction(()=>document.querySelector('.workout-identity h1')?.textContent==='Push-ups');
  if(await page.locator('[data-media-expand]').count())await page.click('[data-media-expand]');
  await page.click('[data-media-replay]');await page.waitForFunction(()=>document.querySelector('.exercise-hero-stage video')?.currentTime>0.1);
  await capture('demonstration');await page.waitForTimeout(6000);
  const framePacing=await page.evaluate(()=>{window.__recordFrameActive=false;const intervals=window.__recordFrames.slice(1).sort((a,b)=>a-b),at=p=>Math.round((intervals[Math.floor((intervals.length-1)*p)]||0)*100)/100;return {samples:intervals.length,medianMs:at(.5),p95Ms:at(.95),maxMs:at(1),over33_4Ms:intervals.filter(x=>x>33.4).length,scope:'Desktop requestAnimationFrame intervals across this local walkthrough'};});
  const metadata={variant,framePacing,build:await page.evaluate(()=>REP_BUILD_VERSION),viewport:'390 × 844',fixture:'Fresh local profile, gym schedule, 40kg × 10 reps at RPE7; exercise index selected for comparison',scope:'Desktop Chrome recording; no physical-device certification',errors};
  await context.close();copyFileSync(await page.video().path(),join(output,'walkthrough.webm'));
  writeFileSync(join(output,'capture.json'),JSON.stringify(metadata,null,2)+'\n');
  if(errors.length)throw Error(errors.join('; '));
  console.log(`Captured ${variant} walkthrough in ${output}`);
}finally{await browser.close();server.close();}
