/* Exercise-specific male diagrams. Joint positions interpolate through a controlled cycle.
   These are position guides, not a measurement of the user's form or repetition count. */
(function(){
  const stand=[150,65,150,100,150,205,120,153,118,203,180,153,182,203,133,260,130,315,166,260,170,315];
  const pose=(changes,base=stand)=>{const next=[...base];for(const [index,value] of Object.entries(changes))next[Number(index)]=value;return next;};
  const guides={};
  const add=(ids,a,b,equipment="",camera="Side",seconds=4)=>ids.split(" ").forEach(id=>guides[id]={a,b,equipment,camera,seconds});
  add("cablelateralraise",stand,pose({10:205,11:108,12:250,13:112}),"lowCable","Front");
  add("lateralraise",stand,pose({6:95,7:108,8:50,9:112,10:205,11:108,12:250,13:112}),"dumbbells","Front");
  const side=[150,65,150,100,150,205,155,153,155,205,145,153,145,205,145,260,145,315,160,260,160,315];
  add("curl",side,pose({8:172,9:112,12:162,13:112},side),"dumbbells");
  add("pushdown",pose({8:182,9:135,12:172,13:135},side),side,"highCable");
  add("facepull",pose({6:172,7:130,8:205,9:130,10:162,11:130,12:195,13:130},side),pose({6:180,7:112,8:160,9:75,10:170,11:112,12:150,13:75},side),"faceCable");
  add("overheadextension",pose({6:150,7:55,8:120,9:80,10:160,11:55,12:130,13:80},side),pose({6:150,7:55,8:150,9:15,10:160,11:55,12:160,13:15},side),"rope");
  const prone=[65,155,95,165,185,165,110,200,85,215,110,193,85,208,235,165,280,165,230,170,275,170];
  add("legcurl",prone,pose({16:240,17:105,20:235,21:110},prone),"proneBench");
  const hang=[150,90,150,122,150,215,126,80,105,35,174,80,195,35,140,267,138,317,165,267,168,317];
  add("kneeraise",hang,pose({14:205,15:208,16:210,17:255,18:215,19:213,20:220,21:260},hang),"bar");
  add("pullup",hang,pose({1:18,3:48,5:142,6:98,7:62,10:202,11:62,15:197,17:247,19:197,21:247},hang),"bar");
  const bent=[214,153,190,180,125,210,185,225,185,270,195,225,195,270,134,263,139,315,122,263,127,315];
  add("rdl goodmorning",side,bent,"barbell");
  add("bandhinge",side,bent,"squatBand");
  add("cablehinge",side,bent,"rearBand");
  add("dbrdl",side,bent,"dumbbells");
  add("barbellrow",bent,pose({6:167,7:210,8:145,9:217,10:177,11:210,12:155,13:217},bent),"barbell");
  add("dbrow",bent,pose({6:157,7:190,8:143,9:216,10:167,11:190,12:153,13:216},bent),"rowBench");
  add("supportedrow",bent,pose({6:157,7:190,8:143,9:216,10:167,11:190,12:153,13:216},bent),"supportedBench");
  const floorTop=[65,180,90,198,185,220,105,230,108,260,100,225,103,255,242,247,275,287,237,252,270,292];
  const floorLow=pose({1:228,3:245,5:265,6:102,7:270,8:108,9:287,10:98,11:270,12:103,13:287},floorTop);
  add("pushup",floorTop,floorLow,"floor");
  const supine=[65,268,90,280,180,280,120,280,160,280,120,285,160,285,220,235,255,305,225,240,260,305];
  add("singlebridge",pose({18:220,19:228,20:258,21:210},supine),pose({4:176,5:240,18:208,19:187,20:241,21:150},supine),"floor");
  add("machinehipthrust",supine,pose({4:176,5:240},supine),"hipMachine");
  add("dbhipthrust",supine,pose({4:176,5:240},supine),"hipDumbbell");
  add("bandhipthrust",supine,pose({4:176,5:240},supine),"hipBand");
  add("barbellhipthrust",supine,pose({4:176,5:240},supine),"hipBarbell");
  const squat=pose({0:178,1:150,2:172,3:182,4:124,5:245,6:158,7:190,8:165,9:150,10:168,11:190,12:175,13:150,14:187,15:253,16:145,17:315,18:197,19:258,20:160,21:315},side);
  add("gobletsquat squat",pose({6:157,7:140,8:157,9:110,10:167,11:140,12:167,13:110},side),squat,"goblet");
  add("boxsquat",pose({6:157,7:140,8:180,9:120,10:167,11:140,12:190,13:120},side),squat,"box");
  add("bandsquat",pose({6:157,7:140,8:157,9:110,10:167,11:140,12:167,13:110},side),squat,"squatBand");
  add("splitsquat",pose({14:180,15:260,16:185,17:315,18:110,19:245,20:65,21:245},side),pose({1:125,3:160,5:255,14:192,15:265,18:105,19:275},side),"splitBench");
  add("singlerdl",side,pose({0:223,1:170,2:196,3:185,4:142,5:210,6:203,7:227,8:205,9:267,10:198,11:225,12:200,13:265,18:90,19:198,20:40,21:182},side),"dumbbells");
  const seat=[112,98,112,130,125,225,132,168,156,188,126,168,150,188,198,224,210,283,188,229,200,288];
  add("legextension",seat,pose({16:265,17:224,20:255,21:229},seat),"seat");
  add("stepup",pose({14:205,15:220,16:205,17:270},side),pose({1:20,3:55,5:158,14:155,15:215,16:155,17:270,18:162,19:217,20:165,21:275},side),"step");
  const bench=[68,230,94,244,187,244,126,206,105,177,131,211,110,182,229,266,240,315,239,268,250,315];
  add("dbpress floorpress",bench,pose({6:96,7:184,8:96,9:125,10:106,11:189,12:106,13:130},bench),"pressBench");
  const incline=[92,155,112,181,186,240,139,198,144,150,149,203,154,155,231,265,239,315,241,270,249,320];
  add("inclinedbpress",incline,pose({6:126,7:133,8:125,9:83,10:136,11:138,12:135,13:88},incline),"inclineBench");
  add("pullover",pose({6:96,7:184,8:96,9:125,10:106,11:189,12:106,13:130},bench),pose({6:54,7:209,8:12,9:187,10:64,11:214,12:22,13:192},bench),"pressBench");
  add("invertedrow",pose({0:88,1:215,2:110,3:230,4:188,5:255,6:125,7:182,8:140,9:130,10:135,11:187,12:150,13:130,14:234,15:285,16:277,17:315,18:224,19:290,20:267,21:320},side),pose({0:135,1:128,2:155,3:150,4:218,5:210,6:192,7:157,8:140,9:130,10:202,11:162,12:150,13:130,14:247,15:265,16:277,17:315,18:237,19:270,20:267,21:320},side),"lowBar");
  add("bandpress",pose({6:175,7:122,8:157,9:105,10:165,11:127,12:147,13:110},side),pose({6:200,7:104,8:250,9:104,10:190,11:109,12:240,13:109},side),"rearBand");
  add("fly",pose({6:95,7:105,8:55,9:119,10:205,11:105,12:245,13:119}),pose({6:115,7:120,8:145,9:140,10:185,11:120,12:155,13:140}),"dumbbells","Front");
  add("pallof",pose({6:172,7:155,8:155,9:125,10:162,11:155,12:145,13:125},side),pose({6:200,7:117,8:245,9:117,10:190,11:122,12:235,13:122},side),"sideBand");
  add("bandrow",pose({6:190,7:130,8:235,9:130,10:180,11:135,12:225,13:135},side),pose({6:175,7:152,8:148,9:162,10:165,11:157,12:138,13:167},side),"frontBand");
  const neutral=[150,75,150,108,150,200,134,65,130,20,166,65,170,20,115,242,112,302,185,242,188,302];
  add("neutralpulldown",neutral,pose({6:129,7:143,8:130,9:114,10:171,11:143,12:170,13:114},neutral),"neutralMachine","Front");
  const bandKneel=pose({14:125,15:292,16:113,17:327,18:175,19:292,20:187,21:327});
  add("bandpulldown",pose({6:136,7:65,8:110,9:25,10:164,11:65,12:190,13:25},bandKneel),pose({6:115,7:140,8:135,9:107,10:185,11:140,12:165,13:107},bandKneel),"overheadBand","Front");
  add("pulldown",pose({6:136,7:65,8:110,9:25,10:164,11:65,12:190,13:25}),pose({6:98,7:121,8:115,9:87,10:202,11:121,12:185,13:87}),"bar","Front");
  add("dip",pose({6:135,7:160,8:130,9:220,10:165,11:160,12:170,13:220}),pose({1:115,3:150,5:253,6:106,7:197,10:194,11:197,15:292,17:330,19:292,21:330}),"dipBars","Front");
  const deadbug=[65,272,92,280,188,280,104,220,104,165,114,225,114,170,187,220,240,220,197,225,250,225];
  add("deadbug",deadbug,pose({6:50,7:236,8:12,9:209,14:235,15:265,16:280,17:300},deadbug),"floor");
  add("pronerow",pose({6:70,7:162,8:30,9:162,10:65,11:172,12:25,13:172},prone),pose({6:130,7:190,8:100,9:198,10:125,11:200,12:95,13:208},prone),"floor");
  const kneel=[144,103,150,132,170,240,157,188,200,232,147,188,190,232,205,290,168,314,195,295,158,319];
  add("latprayer",kneel,pose({0:115,1:177,2:132,3:204,4:200,5:257,6:100,7:196,8:85,9:156,10:90,11:201,12:75,13:161},kneel),"prayerBench");
  add("rollout",pose({6:175,7:191,8:200,9:255,10:165,11:196,12:190,13:260},kneel),pose({0:98,1:223,2:130,3:243,4:200,5:270,6:91,7:272,8:52,9:301,10:101,11:272,12:62,13:301,14:233,15:301,16:188,17:318,18:223,19:306,20:178,21:323},kneel),"wheel");
  add("wristcurl",seat,pose({8:163,9:174,12:157,13:174},seat),"seat");
  function guideFor(item){return guides[item.pose]||null;}
  function render(item,options={}){
    const guide=guideFor(item);if(!guide)return "";
    const speed=Math.max(.5,Number(options.speed)||1);
    return `<div class="technique-diagram ${options.paused?"is-paused":""} ${options.muscles===false?"muscles-off":""}" data-technique-pose="${item.pose}" data-technique-speed="${speed}" data-technique-paused="${Boolean(options.paused)}"><svg viewBox="0 0 300 350" role="img" aria-label="Male ${guide.camera.toLowerCase()} position guide for ${String(item.name).replace(/[&<>"']/g,"")}"><path class="diagram-floor" d="M12 333H288"/><g data-equipment></g><g data-figure></g></svg><span class="diagram-caption">${guide.camera} position guide · controlled movement</span></div>`;
  }
  const line=(a,b,cls="limb",width=12)=>`<path class="${cls}" d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke-width="${width}"/>`;
  function figure(v,camera){
    const points=Array.from({length:11},(_,i)=>v.slice(i*2,i*2+2)),[head,shoulder,hip,e1,w1,e2,w2,k1,a1,k2,a2]=points;
    const spread=camera==="Front"?23:12,hips=camera==="Front"?16:10;
    const torso=`<path class="diagram-shirt" d="M${shoulder[0]-spread} ${shoulder[1]}Q${shoulder[0]} ${shoulder[1]-9} ${shoulder[0]+spread} ${shoulder[1]}L${hip[0]+hips} ${hip[1]}L${hip[0]-hips} ${hip[1]}Z"/>`;
    const leftShoulder=[shoulder[0]-(camera==="Front"?21:4),shoulder[1]],rightShoulder=[shoulder[0]+(camera==="Front"?21:4),shoulder[1]],leftHip=[hip[0]-(camera==="Front"?8:3),hip[1]],rightHip=[hip[0]+(camera==="Front"?8:3),hip[1]];
    return line(rightHip,k2,"far-limb",17)+line(k2,a2,"far-limb",13)+line(rightShoulder,e2,"far-limb",14)+line(e2,w2,"far-limb",11)+torso+line(leftHip,k1,"diagram-short",19)+line(k1,a1,"limb",14)+line(leftShoulder,e1,"limb",14)+line(e1,w1,"limb",11)+line(a1,[a1[0]+17,a1[1]+3],"diagram-shoe",10)+line(a2,[a2[0]+17,a2[1]+3],"diagram-shoe",10)+line(head,shoulder,"limb",10)+`<circle class="diagram-skin" cx="${head[0]}" cy="${head[1]}" r="15"/><path class="diagram-hair" d="M${head[0]-14} ${head[1]-3}Q${head[0]-11} ${head[1]-23} ${head[0]+14} ${head[1]-5}L${head[0]+12} ${head[1]-9}Q${head[0]} ${head[1]-13} ${head[0]-14} ${head[1]-3}Z"/><path class="diagram-beard" d="M${head[0]-10} ${head[1]+6}Q${head[0]} ${head[1]+22} ${head[0]+10} ${head[1]+6}"/>`;
  }
  function equipment(type,v,poseId){
    const w1=v.slice(8,10),w2=v.slice(12,14),stroke='class="diagram-equipment"';
    const dumbbell=p=>`<path ${stroke} d="M${p[0]-10} ${p[1]}H${p[0]+10}"/><rect class="diagram-weight" x="${p[0]-15}" y="${p[1]-7}" width="7" height="14" rx="2"/><rect class="diagram-weight" x="${p[0]+8}" y="${p[1]-7}" width="7" height="14" rx="2"/>`;
    const bench=(x,y,w)=>`<path ${stroke} d="M${x} ${y}h${w}M${x+12} ${y}v${330-y}M${x+w-12} ${y}v${330-y}"/>`;
    if(type==="bar")return `<path ${stroke} d="M50 35H250M55 35V332M245 35V332"/>`;
    if(type==="lowBar")return `<path ${stroke} d="M85 130H205M85 130V333M205 130V333"/>`;
    if(type==="box")return bench(60,255,82);
    if(type==="squatBand")return `<path class="diagram-band" d="M145 315L${w1[0]} ${w1[1]}M160 315L${w2[0]} ${w2[1]}"/>`;
    if(type==="dumbbells"||type==="goblet")return dumbbell(w1)+(type==="goblet"?"":dumbbell(w2));
    if(type==="barbell")return poseId==="goodmorning"?dumbbell(v.slice(2,4)):dumbbell(w1);
    if(type==="lowCable")return `<path class="diagram-band" d="M25 310L${w2[0]} ${w2[1]}"/><path ${stroke} d="M25 310V40"/>`;
    if(type==="overheadBand")return `<path class="diagram-band" d="M110 15L${w1[0]} ${w1[1]}M190 15L${w2[0]} ${w2[1]}"/><path ${stroke} d="M80 15H220"/>`;
    if(type==="neutralMachine")return `<path ${stroke} d="M80 20H220M80 20V328M220 20V328"/><path class="diagram-band" d="M130 20L${w1[0]} ${w1[1]}M170 20L${w2[0]} ${w2[1]}"/>${bench(112,217,76)}`;
    if(type==="inclineBench")return `<path ${stroke} d="M75 166L179 266H212M130 221V329M197 266V329"/>`+dumbbell(w1)+dumbbell(w2);
    if(type==="supportedBench")return `<path ${stroke} d="M117 231L202 188M153 218V329"/>`+dumbbell(w1);
    if(type.startsWith("hip")&&type!=="hipBench"){const hip=v.slice(4,6),base=bench(50,294,66);if(type==="hipBand")return base+`<path class="diagram-band" d="M130 320L${hip[0]} ${hip[1]}L245 320"/>`;if(type==="hipMachine")return base+`<path ${stroke} d="M245 329V250L${hip[0]} ${hip[1]}"/><rect class="diagram-weight" x="${hip[0]-18}" y="${hip[1]-5}" width="36" height="10" rx="4"/>`;return base+dumbbell(hip);}
    if(type==="rowBench")return bench(95,245,100)+dumbbell(w1);
    if(type==="proneBench")return bench(60,181,192)+`<circle class="diagram-weight" cx="${v[16]}" cy="${v[17]}" r="9"/>`;
    if(type==="hipBench")return poseId==="singlebridge"?"":bench(50,294,66);
    if(type==="pressBench")return (poseId==="floorpress"?"":bench(58,267,150))+dumbbell(w1)+dumbbell(w2);
    if(type==="seat")return bench(90,239,60)+`<path ${stroke} d="M95 235V135"/>`;
    if(type==="step")return `<path ${stroke} d="M190 280H235V333H190Z"/>`;
    if(type==="splitBench")return bench(28,255,48);
    if(type==="prayerBench")return bench(30,216,86);
    if(type==="wheel")return `<circle ${stroke} cx="${w1[0]}" cy="${w1[1]+10}" r="14"/>`;
    if(type==="dipBars")return `<path ${stroke} d="M75 220H133M169 220H230M85 220V333M220 220V333"/>`;
    const anchor=type==="rearBand"?[35,110]:type==="highCable"||type==="rope"?[270,15]:type==="sideBand"?[25,150]:[270,130];
    if(type==="floor")return "";
    return `<path class="diagram-band" d="M${anchor[0]} ${anchor[1]}L${w1[0]} ${w1[1]}M${anchor[0]} ${anchor[1]}L${w2[0]} ${w2[1]}"/><circle class="diagram-weight" cx="${anchor[0]}" cy="${anchor[1]}" r="6"/>`;
  }
  const shapeAttributes=new Set(["class","d","stroke-width","cx","cy","r","x","y","width","height","rx"]);
  function updateSvg(element,markup){
    // Sanitize the initial shape tree once. Later frames update only the drawing
    // attributes emitted by our fixed geometry functions, without reparsing DOM.
    const shapes=[...markup.matchAll(/<(path|circle|rect)\b([^>]*?)\/>/g)];
    if(element.children.length!==shapes.length){
      const template=document.createElement("div");
      template.innerHTML=REP_SAFE_DOM.sanitize(`<svg xmlns="http://www.w3.org/2000/svg">${markup}</svg>`);
      element.replaceChildren(...template.querySelector("svg").children);return;
    }
    shapes.forEach((shape,i)=>{for(const attribute of shape[2].matchAll(/([\w-]+)="([^"]*)"/g))if(shapeAttributes.has(attribute[1])&&element.children[i].getAttribute(attribute[1])!==attribute[2])element.children[i].setAttribute(attribute[1],attribute[2]);});
  }
  let animation=null;
  function attach(){
    if(animation!==null)cancelAnimationFrame(animation);
    const nodes=[...document.querySelectorAll("[data-technique-pose]")],started=performance.now(),reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    function draw(now){let running=false;
      for(const node of nodes){if(!node.isConnected||!node.getClientRects().length)continue;const guide=guides[node.dataset.techniquePose];if(!guide)continue;
        const paused=node.dataset.techniquePaused==="true"||reduced;
        const elapsed=(now-started)/1000*(Number(node.dataset.techniqueSpeed)||1),t=paused?0:(1-Math.cos(elapsed/guide.seconds*Math.PI*2))/2;
        const v=guide.a.map((value,i)=>value+(guide.b[i]-value)*t);
        updateSvg(node.querySelector("[data-figure]"),figure(v,guide.camera));
        updateSvg(node.querySelector("[data-equipment]"),equipment(guide.equipment,v,node.dataset.techniquePose));
        if(!paused&&!document.hidden)running=true;
      }
      animation=running?requestAnimationFrame(draw):null;
    }
    draw(started);
  }
  window.REP_TECHNIQUE=Object.freeze({guideFor,render,attach,guides});
  if(typeof document!=="undefined"){
    const observer=new MutationObserver(records=>{if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.("[data-technique-pose]")||node.querySelector?.("[data-technique-pose]")))))attach();});
    const mount=()=>{observer.observe(document.body,{childList:true,subtree:true});attach();};
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
    document.addEventListener("visibilitychange",attach);
  }
})();
