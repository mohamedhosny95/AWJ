import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const exceptions=new Set(['src/client/compatibility.js','src/server/compatibility.ts','src/server/worker-configuration.d.ts','ios/AWJHealthCompanion/AWJCompatibility.swift']);
const failures=[];
async function inspect(relative){
  const filename=path.join(root,relative),stat=await fs.stat(filename);
  if(stat.isDirectory()){for(const entry of await fs.readdir(filename))await inspect(path.posix.join(relative,entry));return;}
  if(exceptions.has(relative)||!(/\.(js|ts|html|css|swift|plist|md|webmanifest)$/.test(relative)))return;
  const text=(await fs.readFile(filename,'utf8')).replaceAll('REP_SYNC_KEY','');
  if(/Health OS|HealthOS|healthos|health-os|Rep Gym Companion|\bREP_[A-Z]|\bRep(?:Health|Watch|Workout)[A-Z]/.test(text))failures.push(relative);
}
for(const directory of ['src','ios','docs'])await inspect(directory);
await inspect('README.md');
if(failures.length)throw Error('Old product branding remains outside the compatibility boundary: '+failures.join(', '));
console.log('AWJ naming is consistent across active source, native targets, and documentation.');
