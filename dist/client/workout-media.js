/* Content-addressed workout downloads: complete videos + matching posters, no partial-cache flags. */
(function(){
  const contract=window.AWJ_MEDIA_CONTRACT,inflight=new Map();
  const cacheName=()=>contract.CACHE_NAME;
  const supported=()=>typeof caches!=='undefined'&&location.protocol.startsWith('http');
  function assetsFor(session,resolve,{allQualities=false}={}){const map=new Map();for(const base of session?.exercises||[])for(const asset of window.AWJ_MEDIA_PLAYER.assets(resolve(base),{allQualities}))map.set(asset.src,asset);return [...map.values()];}
  const normalize=assets=>assets.map(a=>typeof a==='string'?{src:a,type:'image',bytes:0}:a);
  async function inspect(assets){const rows=normalize(assets),totalBytes=rows.reduce((n,a)=>n+a.bytes,0);if(!supported())return {supported:false,total:rows.length,ready:0,totalBytes,readyBytes:0,complete:false};
    const cache=await caches.open(cacheName());let ready=0,readyBytes=0;for(const asset of rows){const hit=await cache.match(new URL(asset.src,location.href).href);if(contract.complete(hit,asset.type,asset.bytes)){ready++;readyBytes+=asset.bytes;}}
    return {supported:true,total:rows.length,ready,totalBytes,readyBytes,complete:ready===rows.length};
  }
  async function download(assets,onProgress=()=>{},{signal}={}){if(!supported())throw Error('Downloads are unavailable in this browser.');const rows=normalize(assets),cache=await caches.open(cacheName());let ready=0,readyBytes=0;const failures=[],totalBytes=rows.reduce((n,a)=>n+a.bytes,0);
    let missingBytes=0;for(const asset of rows){const hit=await cache.match(new URL(asset.src,location.href).href);if(!contract.complete(hit,asset.type,asset.bytes))missingBytes+=asset.bytes;}
    const estimate=await navigator.storage?.estimate?.().catch(()=>null);if(estimate?.quota&&missingBytes>estimate.quota-(estimate.usage||0))throw Error('Not enough device storage. Choose 720p or free storage, then retry.');
    for(const asset of rows){if(signal?.aborted)break;const url=new URL(asset.src,location.href).href;
      try{const hit=await cache.match(url);if(!contract.complete(hit,asset.type,asset.bytes)){let pending=inflight.get(url);if(!pending){pending=fetch(url,{cache:'reload',signal}).then(async response=>{if(!contract.complete(response,asset.type))throw Error('Complete media file unavailable.');const bytes=await response.arrayBuffer();if(asset.bytes&&bytes.byteLength!==asset.bytes)throw Error('Incomplete media download.');const stored=new Response(bytes,{status:200,headers:response.headers});await cache.put(url,stored);}).finally(()=>inflight.delete(url));inflight.set(url,pending);}await pending;}ready++;readyBytes+=asset.bytes;}catch(error){if(signal?.aborted)break;failures.push({src:asset.src,error:error.name==='QuotaExceededError'?'Device storage full':error.message});}
      onProgress({ready,total:rows.length,readyBytes,totalBytes,failures:failures.length});
    }
    return {ready,total:rows.length,readyBytes,totalBytes,complete:!signal?.aborted&&ready===rows.length,aborted:Boolean(signal?.aborted),failures};
  }
  function card(){return '<section class="workout-download"><div><strong>Workout media</strong><p data-media-status role="status">Checking downloaded photos and videos…</p></div><button type="button" data-download-workout>Download workout</button></section>';}
  const size=bytes=>`${(bytes/1048576).toFixed(1)} MB`;
  async function bind(root,session,resolve){const button=root?.querySelector('[data-download-workout]'),status=root?.querySelector('[data-media-status]');if(!button||!status)return;let control=null;
    const gaps=(session?.exercises||[]).filter(base=>window.AWJ_MEDIA_PLAYER.media(resolve(base)).status==='replacement-needed').length;
    const show=result=>{if(!button.isConnected)return;status.textContent=!result.supported&&result.supported!==undefined?'Downloads unavailable here. Reference photos and cues remain available with the app.':result.complete?`Workout downloaded · ${result.total} files · ${size(result.totalBytes)}`:`${result.ready}/${result.total} files ready · download size ${size(result.totalBytes)}. Includes selected video quality and posters.`;if(gaps)status.textContent+=` ${gaps} exercise${gaps===1?'':'s'} still need approved media; interim references or cues remain available.`;button.textContent=result.complete?'Check download':'Download workout';button.disabled=result.supported===false;};
    let assets=assetsFor(session,resolve);try{show(await inspect(assets));}catch{status.textContent='Could not check downloads. Retry when connected.';}
    button.onclick=async()=>{if(control){control.abort();return;}control=new AbortController();button.textContent='Cancel download';assets=assetsFor(session,resolve);try{const result=await download(assets,p=>{if(button.isConnected)status.textContent=`Downloading ${p.ready}/${p.total} · ${size(p.readyBytes)} / ${size(p.totalBytes)}${p.failures?' · retry needed':''}`;},{signal:control.signal});show(await inspect(assets));if(!result.complete)status.textContent=result.aborted?'Download stopped. Completed files are saved; tap Download workout to continue.':`Some media could not download. Completed files are saved; retry when connected.`;}catch(error){status.textContent=error.message;button.textContent='Retry download';}finally{control=null;button.disabled=false;}};
  }
  window.AWJ_WORKOUT_MEDIA=Object.freeze({assetsFor,inspect,download,bind,card,cacheName});
})();
