/* Shared exercise definitions for programmes, custom routines and substitutions. */
(function(){
  const definitions=new Map(),aliases=new Map();
  const key=value=>String(value||"").trim().toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g," ").trim();
  const rows=[
  [
    "Incline Dumbbell Press",
    "incline-dumbbell-press",
    "inclinedbpress",
    "Chest \u00b7 Front delts \u00b7 Triceps",
    "Set the bench to a modest incline; feet flat, shoulder blades supported.",
    "Press the dumbbells above the upper chest; lower with control.",
    "Keep wrists stacked over elbows.",
    "Flaring elbows or lifting hips off the bench."
  ],
  [
    "Dumbbell Bench Press",
    "dumbbell-bench-press",
    "dbpress",
    "Chest \u00b7 Front delts \u00b7 Triceps",
    "Lie on a flat bench with feet supported and dumbbells beside the chest.",
    "Press upward, then lower until the upper arms are comfortable beside the torso.",
    "Keep the shoulder blades supported.",
    "Bouncing or losing wrist control."
  ],
  [
    "Cable Fly",
    null,
    "fly",
    "Chest",
    "Set cables around chest height and stand in a staggered stance.",
    "Bring the hands together in front of the chest; open with a small, fixed elbow bend.",
    "Move from the shoulder while keeping the torso still.",
    "Turning the movement into a press."
  ],
  [
    "Machine Chest Fly",
    "machine-chest-fly",
    "fly",
    "Chest",
    "Adjust the seat so handles or pads are around chest height.",
    "Bring the arms together in front; return slowly to a comfortable stretch.",
    "Keep the back against the pad.",
    "Forcing the shoulders backward."
  ],
  [
    "Neutral Grip Lat Pulldown",
    null,
    "neutralpulldown",
    "Lats \u00b7 Biceps",
    "Secure the thighs; hold parallel handles with palms facing one another.",
    "Pull the handles toward the upper chest; extend the elbows on the return.",
    "Lead with the elbows; keep the neck neutral.",
    "Swinging or pulling behind the head."
  ],
  [
    "Chest-Supported Row",
    "chest-supported-row",
    "supportedrow",
    "Lats \u00b7 Rhomboids \u00b7 Biceps",
    "Place the chest against a supported bench or machine pad.",
    "Pull toward the ribs; lower until the arms extend comfortably.",
    "Keep the chest on the pad.",
    "Lifting off the pad to move the weight."
  ],
  [
    "Bulgarian Split Squat",
    "bulgarian-split-squat",
    "splitsquat",
    "Quads \u00b7 Glutes",
    "Stand with the rear foot on a low bench and the front foot stable.",
    "Lower the hips by bending the front knee; push through the front foot to stand.",
    "Keep the pelvis facing forward.",
    "Letting the knee collapse inward or using a stance that pulls the back."
  ],
  [
    "Hip Thrust Machine",
    "hip-thrust-machine",
    "machinehipthrust",
    "Glutes \u00b7 Hamstrings",
    "Secure the machine belt or pad over the hips; feet flat.",
    "Lift the hips to a straight torso line; lower slowly.",
    "Finish with the glutes and keep ribs down.",
    "Arching the low back to lift higher."
  ],
  [
    "Lying Leg Curl",
    null,
    "legcurl",
    "Hamstrings",
    "Lie face down on the machine; align knees with its pivot and pad above the heels.",
    "Bend the knees to bring the heels toward the glutes; straighten slowly.",
    "Keep the hips against the pad.",
    "Lifting the hips or jerking the weight."
  ],
  [
    "Dumbbell Lateral Raise",
    null,
    "lateralraise",
    "Side delts",
    "Stand tall with dumbbells beside the thighs and a soft elbow bend.",
    "Lift the arms out to the sides toward shoulder height; lower slowly.",
    "Use a comfortable range with relaxed neck.",
    "Shrugging or swinging the torso."
  ],
  [
    "Cable Lateral Raise",
    null,
    "cablelateralraise",
    "Side delts",
    "Stand beside a low cable, holding the handle in the far hand.",
    "Raise the arm out to the side toward shoulder height; lower with control.",
    "Keep the torso steady.",
    "Leaning or shrugging to move the load."
  ],
  [
    "Face Pull",
    null,
    "facepull",
    "Rear delts \u00b7 Upper back",
    "Set a rope cable around face height and take a stable stance.",
    "Pull the rope toward the face, separating the hands; return slowly.",
    "Keep elbows comfortable and ribs down.",
    "Jerking backward or pulling the neck forward."
  ],
  [
    "Incline Dumbbell Curl",
    null,
    "curl",
    "Biceps",
    "Sit against an incline bench with arms hanging at the sides.",
    "Bend the elbows to lift the dumbbells; lower without swinging.",
    "Keep upper arms still.",
    "Moving shoulders forward to finish the curl."
  ],
  [
    "Cable Tricep Pushdown",
    null,
    "pushdown",
    "Triceps",
    "Stand at a high cable with elbows beside the torso.",
    "Straighten the elbows to press the handle down; bend them on the return.",
    "Keep the shoulders still.",
    "Swinging the torso or flaring the elbows."
  ],
  [
    "Tricep Rope Extension",
    null,
    "overheadextension",
    "Triceps",
    "Face away from a cable with a rope overhead; take a stable split stance.",
    "Extend the elbows overhead; return to a comfortable bend.",
    "Keep the upper arms steady and ribs down.",
    "Arching the back or forcing elbow range."
  ],
  [
    "Hanging Knee Raise",
    null,
    "kneeraise",
    "Abdominals \u00b7 Hip flexors",
    "Hang from a secure bar with straight arms and a still torso.",
    "Lift bent knees toward the torso; lower slowly without swinging.",
    "Move the pelvis with control and breathe normally.",
    "Kipping or throwing the legs."
  ],
  [
    "Push-ups",
    "push-ups",
    "pushup",
    "Chest \u00b7 Front delts \u00b7 Triceps",
    "Hands a little wider than shoulders; body in a straight line.",
    "Bend the elbows to lower the torso, then push the floor away.",
    "Keep hips and shoulders moving together.",
    "Sagging hips or jutting the head."
  ],
  [
    "Romanian Deadlift (RDL)",
    "romanian-deadlift",
    "rdl",
    "Hamstrings \u00b7 Glutes",
    "Stand with a bar or dumbbells in front of the thighs and soft knees.",
    "Push the hips back, keeping the weight close; stand by extending the hips.",
    "Keep the spine neutral and stop at a comfortable hamstring stretch.",
    "Rounding the back or turning it into a squat."
  ],
  [
    "Single-Arm Dumbbell Row",
    "single-arm-dumbbell-row",
    "dbrow",
    "Lats \u00b7 Rhomboids \u00b7 Biceps",
    "Support one hand on a bench; hinge with a neutral spine.",
    "Pull the dumbbell toward the hip; extend the arm on the return.",
    "Keep the torso facing the floor.",
    "Twisting or yanking the weight."
  ],
  [
    "Dumbbell Floor Press",
    null,
    "floorpress",
    "Chest \u00b7 Triceps",
    "Lie on the floor with knees bent and dumbbells beside the chest.",
    "Press the dumbbells up; lower until upper arms gently meet the floor.",
    "Keep wrists over elbows.",
    "Bouncing the elbows on the floor."
  ],
  [
    "Banded Chest Press",
    null,
    "bandpress",
    "Chest \u00b7 Triceps",
    "Secure a band behind you at chest height; stand with staggered feet.",
    "Press forward from chest level; return slowly.",
    "Check the anchor and keep ribs down.",
    "Using an unsecured anchor or shrugging."
  ],
  [
    "Banded Row",
    null,
    "bandrow",
    "Lats \u00b7 Rhomboids \u00b7 Biceps",
    "Secure a band in front at torso height; take a stable stance.",
    "Pull the handles toward the ribs; extend arms slowly.",
    "Keep shoulders away from the ears.",
    "Leaning back or using an unsecured anchor."
  ],
  [
    "Prone Bodyweight Row",
    null,
    "pronerow",
    "Upper back \u00b7 Rear delts",
    "Lie face down with forehead comfortably supported and arms extended.",
    "Draw the elbows toward the ribs; reach forward again without lifting the low back.",
    "Use a small controlled range.",
    "Arching the back or straining the neck."
  ],
  [
    "Resistance Band Pulldown",
    "resistance-band-pulldown",
    "bandpulldown",
    "Lats \u00b7 Biceps",
    "Kneel below a securely anchored overhead band.",
    "Pull elbows toward the ribs; return overhead with control.",
    "Check the anchor and stay tall.",
    "Swinging or using an unsecured band."
  ],
  [
    "Dumbbell Pullover",
    null,
    "pullover",
    "Lats \u00b7 Chest",
    "Lie on a bench, holding one dumbbell above the chest with both hands.",
    "Lower the arms overhead to a comfortable range; return above the chest.",
    "Keep a slight elbow bend and ribs down.",
    "Forcing shoulder range or arching the back."
  ],
  [
    "Kneeling Lat Prayer",
    null,
    "latprayer",
    "Lats",
    "Kneel with elbows on a stable bench and palms together.",
    "Ease the hips backward until a gentle lat stretch is felt; return slightly.",
    "Keep the spine comfortable and breathe.",
    "Forcing the shoulder stretch."
  ],
  [
    "Good Mornings",
    "good-mornings",
    "goodmorning",
    "Hamstrings \u00b7 Glutes \u00b7 Spinal erectors",
    "Stand with a light bar secure on the upper back and knees soft.",
    "Hinge the hips back; return to standing with a neutral spine.",
    "Start light and keep balance over the feet.",
    "Rounding the back or descending beyond control."
  ],
  [
    "Banded Good Morning",
    null,
    "bandhinge",
    "Hamstrings \u00b7 Glutes",
    "Stand securely on a band with it supported across the upper back, away from the neck.",
    "Push the hips back, then stand tall.",
    "Check the band and keep the spine neutral.",
    "Placing the band across the throat or snapping upright."
  ],
  [
    "Dumbbell Hip Thrust",
    null,
    "dbhipthrust",
    "Glutes \u00b7 Hamstrings",
    "Upper back on a stable bench, feet flat; cushion a dumbbell over the hips.",
    "Lift the hips to align the torso; lower slowly.",
    "Keep ribs down and chin neutral.",
    "Arching the back or letting the weight roll."
  ],
  [
    "Banded Hip Thrust",
    null,
    "bandhipthrust",
    "Glutes \u00b7 Hamstrings",
    "Upper back on a stable bench; secure the band across the hips and feet flat.",
    "Drive through the feet to lift the hips; lower under control.",
    "Secure the band and finish with the glutes.",
    "Overarching or using an unstable bench."
  ],
  [
    "Goblet Squat",
    "goblet-squat",
    "gobletsquat",
    "Quads \u00b7 Glutes",
    "Hold a dumbbell at the chest and stand with a comfortable stance.",
    "Bend knees and hips to squat; press through the whole foot to stand.",
    "Keep knees tracking with toes.",
    "Lifting heels or collapsing inward."
  ],
  [
    "Barbell Back Squat",
    "barbell-back-squat",
    "squat",
    "Quads \u00b7 Glutes",
    "Set a rack with safeties and place the bar securely on the upper back.",
    "Squat to a controlled depth, then stand.",
    "Brace and keep pressure through the whole foot.",
    "Losing balance or forcing depth."
  ],
  [
    "Barbell Bent-Over Row",
    "barbell-bent-over-row",
    "barbellrow",
    "Lats \u00b7 Upper back \u00b7 Biceps",
    "Hinge with a neutral spine and hold a bar below the shoulders.",
    "Pull toward the lower ribs; extend the arms slowly.",
    "Keep the torso still.",
    "Jerking the back upright."
  ],
  [
    "Single-Leg RDL",
    "single-leg-rdl",
    "singlerdl",
    "Hamstrings \u00b7 Glutes",
    "Stand on one leg with the knee soft and a support within reach.",
    "Hinge forward as the free leg reaches back; return to standing.",
    "Keep hips level.",
    "Rotating the pelvis or losing balance."
  ],
  [
    "Leg Extension",
    "leg-extension",
    "legextension",
    "Quads",
    "Align the knee with the machine pivot and pad above the ankle.",
    "Extend the knees to a comfortable straight position; lower slowly.",
    "Keep the hips against the seat.",
    "Kicking or locking hard."
  ],
  [
    "Barbell Hip Thrust",
    "barbell-hip-thrust",
    "barbellhipthrust",
    "Glutes \u00b7 Hamstrings",
    "Upper back on a stable bench, feet flat, bar padded over the hips.",
    "Lift the hips to a straight torso line; lower with control.",
    "Keep ribs down.",
    "Arching the low back."
  ],
  [
    "Cable Pull-Through",
    "cable-pull-through",
    "cablehinge",
    "Glutes \u00b7 Hamstrings",
    "Face away from a low cable, rope between the legs; take a stable stance.",
    "Hinge the hips back; extend them to stand tall.",
    "Let the hips drive the movement.",
    "Squatting the weight or pulling with the arms."
  ],
  [
    "Single-Leg Glute Bridge",
    "single-leg-glute-bridge",
    "singlebridge",
    "Glutes \u00b7 Hamstrings",
    "Lie on the back with one foot flat and the other knee drawn up.",
    "Lift the hips while keeping the pelvis level; lower slowly.",
    "Drive through the grounded heel.",
    "Rotating the pelvis or arching."
  ],
  [
    "Step-ups",
    "step-ups",
    "stepup",
    "Quads \u00b7 Glutes",
    "Stand before a stable low platform with one whole foot on it.",
    "Press through the lead foot to step up; return under control.",
    "Keep the knee tracking with the toes.",
    "Pushing hard off the trailing leg or dropping down."
  ],
  [
    "Deadbug",
    "deadbug",
    "deadbug",
    "Abdominals",
    "Lie on the back with arms up and hips and knees bent.",
    "Lower one arm and the opposite leg, then return; alternate sides.",
    "Keep ribs down and the low back comfortable.",
    "Arching as the limbs extend."
  ],
  [
    "Pallof Press",
    "pallof-press",
    "pallof",
    "Core",
    "Stand side-on to a chest-height band or cable with hands at the chest.",
    "Press the hands forward; resist rotation; return to the chest.",
    "Keep hips and shoulders facing forward.",
    "Twisting toward the anchor."
  ],
  [
    "Ab Wheel Rollout",
    "ab-wheel-rollout",
    "rollout",
    "Abdominals \u00b7 Lats",
    "Kneel with hands on an ab wheel beneath the shoulders.",
    "Roll forward only as far as you can keep control; pull back to the start.",
    "Brace before moving.",
    "Letting the low back sag."
  ],
  [
    "Hollow Body Hold",
    "hollow-body-hold",
    null,
    "Abdominals",
    "Lie on the back, ribs down and limbs extended only as far as comfortable.",
    "Hold the position while breathing normally; bend the knees if needed.",
    "Keep the low back supported.",
    "Holding the breath or arching."
  ],
  [
    "Wrist Curls",
    "wrist-curls",
    "wristcurl",
    "Forearm flexors",
    "Sit with forearms supported and palms up, wrists just beyond the edge.",
    "Curl the wrists through a comfortable range; lower slowly.",
    "Keep forearms still.",
    "Jerking or forcing range."
  ],
  [
    "Dead Hang",
    "dead-hang",
    null,
    "Forearms \u00b7 Lats",
    "Grip a secure overhead bar; feet clear of the floor, elbows straight.",
    "Hold with a long torso and straight arms; breathe normally.",
    "Keep the head below the bar and stop for discomfort.",
    "Holding a bent-arm pull-up position."
  ],
  [
    "Pull-ups",
    "pull-ups",
    "pullup",
    "Lats \u00b7 Biceps",
    "Grip a secure overhead bar and begin with long arms.",
    "Pull the chest toward the bar; lower with control to the starting position.",
    "Keep the torso controlled.",
    "Kipping or craning the neck."
  ],
  [
    "Dips",
    "dips",
    "dip",
    "Chest \u00b7 Triceps",
    "Support the body on stable parallel bars.",
    "Bend the elbows to a comfortable depth; press back up.",
    "Keep shoulders controlled.",
    "Dropping too deep or shrugging."
  ]
];
  rows.push(
    ["Dumbbell Romanian Deadlift",null,"dbrdl","Hamstrings · Glutes","Stand holding dumbbells in front of the thighs with soft knees.","Hinge the hips back, keeping the dumbbells close to the legs; stand with control.","Keep the spine neutral and stop at a comfortable stretch.","Rounding the back or turning it into a squat."],
    ["Bodyweight Box Squat",null,"boxsquat","Quads · Glutes","Stand in front of a stable box or chair with feet at a comfortable width.","Sit back to gently touch the box; stand through the whole foot.","Keep knees tracking with toes.","Dropping onto the box or rocking to stand."],
    ["Banded Squat",null,"bandsquat","Quads · Glutes","Stand securely on a band with handles beside the shoulders.","Squat to a controlled depth and return to standing.","Keep the band secure and knees tracking with toes.","Losing balance or using a damaged band."],
    ["Inverted Row","inverted-row","invertedrow","Lats · Upper back · Biceps","Set a secure low bar; lie underneath with heels grounded and body in a straight line.","Pull the chest toward the bar; lower until the arms straighten.","Keep hips and shoulders moving together.","Letting hips sag or using an unsecured bar."],
    ["Farmer's Walk","farmers-walk",null,"Forearms · Traps · Core","Stand holding a manageable weight in each hand at the sides.","Walk with short controlled steps, keeping shoulders level and torso upright.","Keep the path clear and breathe normally.","Leaning sideways or losing grip."]
  );
  const extraAliases={"Flat Dumbbell Bench":"Dumbbell Bench Press","Push-Up":"Push-ups","Push-up":"Push-ups","Glute Bridge":"Glute Bridges","One-Arm Dumbbell Row":"Single-Arm Dumbbell Row","Banded Pulldown":"Resistance Band Pulldown","Dead Bug":"Deadbug","RDL":"Romanian Deadlift (RDL)"};
  const loaded=new Set(["Leg Press","Back Extension","Chest Press","Seated Cable Row","Lat Pulldown"]);
  const bodyweight=new Set(["Push-ups","Pull-ups","Dips","Prone Bodyweight Row","Hanging Knee Raise","Deadbug","Ab Wheel Rollout","Single-Leg Glute Bridge","Bodyweight Box Squat"]);
  const atlasByName={"Brisk Marching in Place":"march","Cat-Cow":"catcow","Hip Flexor Stretch":"kneel","Glute Bridges":"floor","Bird-Dog":"birddog","Plank":"plank","Stomach Vacuum":"breathe","Pelvic Floor (Kegel)":"kegel","Hand Grip":"grip","Stationary Bike":"bike","Leg Press":"legpress","Back Extension":"hinge","Chest Press":"chestpress","Seated Cable Row":"row","Lat Pulldown":"pulldown","Cooldown Stretches":"stretch","Easy Warm-up Walk":"walk","Incline Treadmill Walk":"inclinewalk","Easy Cooldown + Stretch":"stretch"};
  const holdNames=new Set(["Plank","Hip Flexor Stretch","Stomach Vacuum","Pelvic Floor (Kegel)","Cooldown Stretches","Football Static Stretches","Padel Static Stretches","Full-Body Static Stretch","Hollow Body Hold","Dead Hang","Hydrate & Refuel","Football Match","Padel Match","Log Your Activity"]);
  function register(item){const id=key(item.name);definitions.set(id,{...definitions.get(id),...item});aliases.set(id,id);}
  function configure(sessions,media){
    for(const session of Object.values(sessions))for(const item of session.exercises||[]){
      if(definitions.has(key(item.name)))continue;
      register({...item,logMode:loaded.has(item.name)?"weighted":"none",targetMuscles:null,atlas:atlasByName[item.name]||null,pose:null,mediaPresentation:"male",photo:media.side[item.name]||null,photoFront:media.front[item.name]||null,frames:media.frames[item.name]||[],framesFront:media.framesFront[item.name]||[],isHold:holdNames.has(item.name)});
    }
    for(const [name,stem,pose,targetMuscles,setup,execution,cues,avoid] of rows)register({name,motion:atlasByName[name]||pose||"hold",pose,atlas:atlasByName[name]||null,targetMuscles,setup,execution,cues,avoid,logMode:bodyweight.has(name)?"bodyweight":holdNames.has(name)||["Kneeling Lat Prayer"].includes(name)?"none":"weighted",mediaPresentation:"male",photo:stem?`assets/cinematic/${stem}.webp`:null,photoFront:stem?`assets/cinematic/${stem}-front.webp`:null,frames:media.frames[name]||[],framesFront:media.framesFront[name]||[],isHold:holdNames.has(name)});
    for(const [alias,name] of Object.entries(extraAliases))aliases.set(key(alias),key(name));
  }
  function get(name){const definition=definitions.get(aliases.get(key(name))||key(name))||null;if(definition&&window.REP_MEDIA_MANIFEST)definition.media=window.REP_MEDIA_MANIFEST.entries.find(x=>x.exercise===definition.name)||null;return definition;}
  function resolve(base,name=base?.name){
    const definition=get(name),same=get(base?.name)===definition;
    if(!definition)return {...base,name,atlas:null,pose:null,photo:null,photoFront:null,frames:[],framesFront:[],logMode:"none",targetMuscles:base?.category||"Exercise",setup:"No technique guide is available for this exercise.",execution:"Use an exercise-specific guide before starting.",cues:"Choose an exercise with a complete technique guide.",avoid:"Copying the demonstration of a different exercise."};
    const prescription={};for(const field of ["sets","prescription","intensity","rest","optional"])if(base?.[field]!==undefined)prescription[field]=base[field];
    return {...base,...definition,...(same?{setup:base.setup||definition.setup,execution:base.execution||definition.execution,cues:base.cues||definition.cues,avoid:base.avoid||definition.avoid}:{}),...prescription,name:definition.name,baseName:definition.name,exerciseKey:key(definition.name)};
  }
  function normalizeRoutines(value){
    if(!Array.isArray(value))return [];
    const seen=new Set();return value.slice(0,40).flatMap(row=>{
      if(!row||typeof row!=="object"||!/^custom-[a-zA-Z0-9_-]{1,100}$/.test(row.id)||seen.has(row.id)||!Array.isArray(row.exercises))return [];
      seen.add(row.id);return [{id:row.id,title:String(row.title||"Custom routine").trim().slice(0,100),emoji:String(row.emoji||"💪").slice(0,12),description:String(row.description||"").slice(0,400),exercises:row.exercises.slice(0,30).flatMap(ex=>{
        const definition=get(ex?.name);if(!definition)return [];
        return [{name:definition.name,sets:Math.max(1,Math.min(10,Math.round(Number(ex.sets)||3))),prescription:String(ex.prescription||"3 × 10–12").slice(0,80),intensity:String(ex.intensity||"RPE 7–8").slice(0,60),rest:Math.max(0,Math.min(600,Math.round(Number(ex.rest)||0))),motion:definition.motion,category:ex.category||definition.category||definition.targetMuscles}];
      })}];
    });
  }
  function registerRoutines(routines,sessions){
    for(const id of Object.keys(sessions))if(id.startsWith("custom-"))delete sessions[id];
    for(const routine of normalizeRoutines(routines))sessions[routine.id]={name:routine.title,short:"CUSTOM",meta:`${routine.exercises.length} exercises`,accent:"#ff8b3d",icon:"dumbbell",description:routine.description,exercises:routine.exercises.map(ex=>resolve(ex))};
  }
  const api={configure,get,resolve,normalizeRoutines,registerRoutines,list:()=>[...definitions.values()]};
  window.REP_EXERCISES=Object.freeze(api);
})();
