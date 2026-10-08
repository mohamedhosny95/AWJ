/* One persistent media controller per visible exercise surface. Real videos or honest stills. */
(function(){
  const entries=new Map((window.REP_MEDIA_MANIFEST?.entries||[]).map(x=>[x.exercise,x])),controllers=new Map();
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intersection=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(items=>{for(const item of items)if(!item.isIntersecting)for(const c of controllers.values())if(c.host===item.target)c.pause();});
  const preference=()=>window.state?.mediaQuality||'auto';
  function media(item){return entries.get(window.REP_EXERCISES?.get(item?.name)?.name||item?.name)||{exercise:item?.name||'Exercise',views:[],cueOnly:true,status:'replacement-needed',source:{}};}
  function pickVideo(view,{quality=preference(),fullscreen=false,width=innerWidth}={}){const list=view?.videos||[];const target=quality==='auto'?(fullscreen||width>=768?1080:720):Number(quality);return list.find(v=>v.quality===target)||list.filter(v=>v.quality<=target).at(-1)||list[0]||null;}
  function assets(item,{allQualities=false}={}){const result=[];for(const view of media(item).views){if(view.poster)result.push(view.poster);const videos=allQualities?view.videos:[pickVideo(view)];for(const video of videos)if(video)result.push(video);}return result;}
  function markup(item,{preview=false,context=preview?'preview':'main'}={}){const m=media(item),key=`${context}:${m.exercise}`;return `<div class="exercise-media" data-exercise-media="${esc(m.exercise)}" data-media-context="${esc(context)}" data-player-key="${esc(key)}" data-media-category="${esc(item.category||'')}" data-media-cue="${esc(item.cues||'')}" data-media-move="${esc(item.execution||'')}"></div>`;}
  function create(host){
    const m=entries.get(host.dataset.exerciseMedia)||media({name:host.dataset.exerciseMedia});
    const ctx=host.dataset.mediaContext,still=ctx==='rest',controller={host,m,ctx,view:0,video:null,playing:false,error:false,token:0,position:0,disposed:false};
    host.classList.toggle('is-reference',m.source?.kind==='generated-reference');
    const sourceUrl=m.source?.url?.startsWith('https://')?m.source.url:null;
    host.innerHTML=REP_SAFE_DOM.sanitize(`<div class="exercise-media-stage">${m.views.length?'<img class="exercise-media-poster" alt="Male exercise reference" decoding="async">':`<div class="exercise-media-empty"><strong>Technique cues</strong><p>${esc(host.dataset.mediaMove)}</p></div>`}<div class="exercise-media-video-host"></div><div class="exercise-media-message" role="status"></div></div><div class="exercise-media-controls" ${still?'hidden':''}><button type="button" data-media-play>Play</button><button type="button" data-media-replay>Replay</button><label data-media-speed-label>Speed<select data-media-rate aria-label="Demonstration speed"><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1" selected>1×</option></select></label><label data-media-quality-label>Quality<select data-media-quality aria-label="Video quality"><option value="auto">Auto</option><option value="720">720p</option><option value="1080">1080p</option></select></label><button type="button" data-media-fullscreen>Fullscreen</button></div>${m.views.length>1&&!still?`<div class="exercise-media-positions" role="group" aria-label="Reference positions">${m.views.map((v,i)=>`<button type="button" data-media-view="${i}" aria-pressed="${i===0}">${esc(v.label)}</button>`).join('')}</div>`:''}<div class="exercise-media-caption">${m.source?.kind==='generated-reference'?'Illustrated reference':m.views[0]?.videos?.length?'Male movement demonstration':m.views.length?'Male reference photo':'No approved photo · technique cues'}${sourceUrl&&!still?` · <a href="${esc(sourceUrl)}" target="_blank" rel="noopener">Source</a>`:''}</div>`);
    const poster=host.querySelector('img'),message=host.querySelector('.exercise-media-message');
    const showMessage=text=>{message.textContent=text;message.hidden=!text;};
    const visible=()=>host.isConnected&&host.getClientRects().length&&(!host.closest('details')||host.closest('details').open)&&!document.hidden;
    const updateButton=()=>{host.querySelector('[data-media-play]').textContent=controller.playing?'Pause':'Play';host.querySelector('[data-media-play]').setAttribute('aria-pressed',String(controller.playing));};
    controller.pause=()=>{controller.video?.pause();controller.playing=false;updateButton();};
    controller.play=async()=>{if(!controller.video||!visible()||still)return;for(const other of controllers.values())if(other!==controller)other.pause?.();controller.error=false;const token=controller.token;try{await controller.video.play();if(token!==controller.token||controller.disposed)return;if(!visible()){controller.pause();return;}controller.playing=true;showMessage('');updateButton();}catch{if(token!==controller.token||controller.disposed)return;controller.playing=false;if(!controller.error)showMessage('Tap Play to start the demonstration.');updateButton();}};
    function reveal(video,token){if(token!==controller.token||video!==controller.video)return;host.classList.add('video-ready');showMessage('');}
    function setView(i,{resume=false,fullscreen=false}={}){
      const view=m.views[i];if(!view)return;const previousView=controller.view;controller.view=i;controller.error=false;const token=++controller.token;host.classList.remove('video-ready');showMessage('');
      if(poster){
        if(!poster.getAttribute('src')){poster.alt=`Male ${m.exercise} · ${view.label}`;poster.width=view.poster.width;poster.height=view.poster.height;poster.src=view.poster.src;}
        const nextPoster=new Image(),started=performance.now();nextPoster.decoding='async';
        nextPoster.onload=async()=>{const decodeStarted=performance.now();try{await nextPoster.decode();}catch{}if(token!==controller.token||controller.disposed)return;poster.alt=`Male ${m.exercise} · ${view.label}`;poster.width=view.poster.width;poster.height=view.poster.height;poster.src=view.poster.src;poster.hidden=false;window.REP_MOTION?.animate(poster,'media');const resource=performance.getEntriesByName(nextPoster.src).at(-1);window.REP_TELEMETRY?.recordMedia({stage:ctx==='rest'?'rest':'current',loadMs:resource?.duration||decodeStarted-started,decodeMs:performance.now()-decodeStarted,bytes:resource?.transferSize||0,ok:true});};
        nextPoster.onerror=()=>{if(token!==controller.token)return;if(poster.complete&&poster.naturalWidth){controller.view=previousView;host.querySelectorAll('[data-media-view]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.mediaView)===previousView)));showMessage('Selected photo unavailable · previous reference position remains visible.');}else{poster.hidden=true;showMessage('Reference photo unavailable. Follow the technique cues below.');}window.REP_TELEMETRY?.recordMedia({stage:'current',loadMs:performance.now()-started,ok:false});};nextPoster.src=view.poster.src;
      }
      const source=still?null:pickVideo(view,{fullscreen});
      for(const selector of ['[data-media-play]','[data-media-replay]','[data-media-speed-label]','[data-media-quality-label]'])host.querySelector(selector).hidden=!source;
      const quality=host.querySelector('[data-media-quality]');quality.value=preference();for(const option of quality.options)option.disabled=option.value!=='auto'&&!view.videos.some(v=>String(v.quality)===option.value);
      host.querySelectorAll('[data-media-view]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.mediaView)===i)));
      const old=controller.video,position=old?.currentTime||0,wasPlaying=resume||controller.playing;old?.pause();
      if(!source){old?.remove();controller.video=null;controller.playing=false;updateButton();return;}
      const video=old||document.createElement('video');controller.video=video;video.muted=true;video.defaultMuted=true;video.playsInline=true;video.preload=ctx==='main'?'auto':'metadata';video.loop=Boolean(view.loop);video.setAttribute('aria-label',`Male demonstration of ${m.exercise}`);video.poster=view.poster.src;
      if(!old){host.querySelector('.exercise-media-video-host').append(video);video.addEventListener('playing',()=>{controller.playing=true;updateButton();const frameToken=controller.token;if(video.requestVideoFrameCallback)video.requestVideoFrameCallback(()=>reveal(video,frameToken));else requestAnimationFrame(()=>reveal(video,frameToken));});video.addEventListener('pause',()=>{controller.playing=false;updateButton();});video.addEventListener('ended',()=>{controller.playing=false;updateButton();showMessage('Demonstration complete · Replay when ready.');});video.addEventListener('error',()=>{controller.error=true;controller.playing=false;host.classList.remove('video-ready');showMessage('Video unavailable · reference photo and cues remain available.');window.REP_TELEMETRY?.recordMedia({stage:'video',ok:false});updateButton();});}
      if(video.getAttribute('src')!==source.src){video.src=source.src;video.load();video.onloadedmetadata=()=>{if(token!==controller.token)return;video.currentTime=Math.min(position,Math.max(0,video.duration-.05));video.playbackRate=Number(host.querySelector('[data-media-rate]').value)||1;if(wasPlaying&&visible())controller.play();};}
      else if(wasPlaying&&visible())controller.play();
      if(ctx==='main'&&!reduced()&&visible())controller.play();
    }
    host.querySelector('[data-media-play]').onclick=()=>controller.playing?controller.pause():controller.play();
    host.querySelector('[data-media-replay]').onclick=()=>{if(controller.video){controller.video.currentTime=0;controller.play();}};
    host.querySelector('[data-media-rate]').onchange=event=>{if(controller.video)controller.video.playbackRate=Number(event.target.value);};
    host.querySelector('[data-media-quality]').onchange=event=>{if(window.state){state.mediaQuality=event.target.value;window.persist?.();}setView(controller.view,{resume:controller.playing});};
    host.querySelectorAll('[data-media-view]').forEach(button=>button.onclick=()=>setView(Number(button.dataset.mediaView)));
    host.querySelector('[data-media-fullscreen]').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(host.requestFullscreen)await host.requestFullscreen();else if(controller.video?.webkitEnterFullscreen)controller.video.webkitEnterFullscreen();else showMessage('Fullscreen is unavailable here.');}catch{if(controller.video?.webkitEnterFullscreen)controller.video.webkitEnterFullscreen();else showMessage('Fullscreen is unavailable here.');}};
    host.addEventListener('fullscreenchange',()=>{host.querySelector('[data-media-fullscreen]').textContent=document.fullscreenElement?'Exit fullscreen':'Fullscreen';if(preference()==='auto')setView(controller.view,{resume:controller.playing,fullscreen:Boolean(document.fullscreenElement)});});
    controller.restore=()=>{if(controller.playing&&visible())controller.play();};controller.dispose=()=>{intersection?.unobserve(host);controller.pause();controller.video?.removeAttribute('src');controller.video?.load();controller.disposed=true;};
    if(m.views.length)setView(0);else{for(const button of host.querySelectorAll('button,label'))button.hidden=true;}
    intersection?.observe(host);return controller;
  }
  function mount(){
    for(const host of document.querySelectorAll('[data-player-key]')){
      const key=host.dataset.playerKey,old=controllers.get(key);
      if(old&&!old.disposed){if(old.host!==host){host.replaceWith(old.host);old.restore();}continue;}
      if(!host.getClientRects().length)continue;
      const controller=create(host);controllers.set(key,controller);
    }
    for(const [key,c] of controllers)if(!c.host.isConnected){c.dispose();controllers.delete(key);}
  }
  let scheduled=false;
  new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&(n.matches?.('[data-player-key]')||n.querySelector?.('[data-player-key]'))))&&!scheduled){scheduled=true;queueMicrotask(()=>{scheduled=false;mount();});}}).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const c of controllers.values())c.pause();});
  window.addEventListener?.('rep:dialog-open',()=>{for(const c of controllers.values())if(c.ctx==='main')c.pause();});
  if(typeof matchMedia==='function')matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',event=>{if(event.matches)for(const c of controllers.values())c.pause();});
  document.addEventListener('toggle',()=>{mount();for(const c of controllers.values())if(c.host.closest('details')&&!c.host.closest('details').open)c.pause();},true);
  let nextSignature='',nextVideo=null;
  function preloadNext(item){
    const view=media(item).views[0],video=pickVideo(view),signature=[view?.poster?.src,video?.src].join('|');if(signature===nextSignature)return;nextSignature=signature;
    document.querySelectorAll('[data-rep-media-preload]').forEach(el=>el.remove());if(nextVideo){nextVideo.removeAttribute('src');nextVideo.load();nextVideo=null;}if(!view)return;
    const link=document.createElement('link');link.rel='preload';link.as='image';link.href=view.poster.src;link.dataset.repMediaPreload='next';document.head.append(link);window.REP_TELEMETRY?.recordMedia({stage:'next-preload',ok:true});
    // Native preload handles video better than unsupported link[as=video]. Only one next clip exists.
    if(video){nextVideo=document.createElement('video');nextVideo.muted=true;nextVideo.preload='auto';nextVideo.src=video.src;nextVideo.load();}
  }
  window.REP_MEDIA_PLAYER=Object.freeze({media,pickVideo,assets,markup,mount,preloadNext});
})();
