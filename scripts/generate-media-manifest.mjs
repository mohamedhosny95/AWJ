import fs from 'node:fs';import crypto from 'node:crypto';
const source=JSON.parse(fs.readFileSync('data/exercise-media.json','utf8'));const names=new Set();
for(const entry of source.entries){if(names.has(entry.exercise))throw Error(`Duplicate exercise: ${entry.exercise}`);names.add(entry.exercise);if(!entry.status||!entry.review)throw Error('Unreviewed exercise');
 for(const view of entry.views){for(const asset of [view.poster,...view.videos]){const bytes=fs.readFileSync('src/client/'+asset.src),hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,16);if(hash!==asset.version||bytes.length!==asset.bytes)throw Error(`Media drift: ${asset.src}`);if(!entry.source.license)throw Error('Missing media licence');}}
}
const content='window.REP_MEDIA_MANIFEST='+JSON.stringify(source)+';\n',path='src/client/media-manifest.js';
if(process.argv.includes('--check')){if(fs.readFileSync(path,'utf8')!==content)throw Error('Media manifest is stale. Run npm run sync.');}else fs.writeFileSync(path,content);
console.log(`Media catalogue verified: ${source.entries.length} exercises`);
