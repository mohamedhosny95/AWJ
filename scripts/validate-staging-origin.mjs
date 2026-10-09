const value=process.env.REP_STAGING_URL;
let origin;
try{origin=new URL(value);}catch{throw Error('Configure REP_STAGING_URL in the GitHub staging environment before promotion.');}
if(origin.protocol!=='https:'||!origin.hostname.includes('staging')||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash)throw Error('REP_STAGING_URL must be an isolated HTTPS staging origin.');
console.log('Isolated staging origin configured.');
