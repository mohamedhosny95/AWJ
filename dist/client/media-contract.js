/* Shared media cache and byte-range semantics for page and service worker. */
(function(root){
  const CACHE_NAME=AWJ_COMPAT.mediaCache;
  function parseRange(header,length){
    if(!header)return null;const m=/^bytes=(\d*)-(\d*)$/.exec(header.trim());if(!m||(!m[1]&&!m[2]))return {invalid:true};
    let start,end;
    if(!m[1]){const suffix=Number(m[2]);if(!Number.isSafeInteger(suffix)||suffix<=0)return {invalid:true};start=Math.max(0,length-suffix);end=length-1;}
    else{start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),length-1):length-1;}
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=length||end<start)return {invalid:true};
    return {start,end};
  }
  async function rangeResponse(response,header){
    if(!header)return response;const data=await response.arrayBuffer(),range=parseRange(header,data.byteLength),headers=new Headers(response.headers);headers.set('Accept-Ranges','bytes');
    if(range?.invalid){headers.set('Content-Range',`bytes */${data.byteLength}`);headers.delete('Content-Length');return new Response(null,{status:416,headers});}
    const body=data.slice(range.start,range.end+1);headers.set('Content-Range',`bytes ${range.start}-${range.end}/${data.byteLength}`);headers.set('Content-Length',String(body.byteLength));return new Response(body,{status:206,headers});
  }
  function complete(response,type,expectedBytes=0){const mime=response?.headers?.get('content-type')||'';return (!expectedBytes||!response?.headers?.get('content-length')||Number(response.headers.get('content-length'))===expectedBytes)&&response?.status===200&&!response.headers.get('content-range')&&(type==='video'?mime.startsWith('video/'):mime.startsWith('image/'));}
  root.AWJ_MEDIA_CONTRACT=Object.freeze({CACHE_NAME,parseRange,rangeResponse,complete});
})(typeof self!=='undefined'?self:globalThis);
