import {readFileSync} from 'node:fs';
import '../src/client/compatibility.js';
export const compatibilitySource=readFileSync(new URL('../src/client/compatibility.js',import.meta.url),'utf8');
