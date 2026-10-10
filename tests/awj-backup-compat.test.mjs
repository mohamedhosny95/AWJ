import './compat-context.mjs';
import test from "node:test";
import assert from "node:assert/strict";
import {webcrypto} from "node:crypto";

test("AWJ backups restore and pre-rename authenticated backups remain readable", async()=>{
  globalThis.window=globalThis;
  globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
  await import("../src/client/features.js");
  const features=globalThis.AWJ_FEATURES;
  const passphrase="example-passphrase-123";
  const current=await features.encryptExport({app:"AWJ",data:{session:"upper",sets:3}},passphrase);
  assert.equal(current.app,"AWJ");
  assert.deepEqual(await features.decryptExport(current,passphrase),{app:"AWJ",data:{session:"upper",sets:3}});

  const salt=webcrypto.getRandomValues(new Uint8Array(16)),iv=webcrypto.getRandomValues(new Uint8Array(12));
  const encoder=new TextEncoder();
  const material=await webcrypto.subtle.importKey("raw",encoder.encode(passphrase),"PBKDF2",false,["deriveKey"]);
  const key=await webcrypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:250000,hash:"SHA-256"},material,{name:"AES-GCM",length:256},false,["encrypt"]);
  const header={app:"Rep Gym Companion",schema:5,encrypted:true,cipher:"AES-256-GCM",kdf:"PBKDF2-SHA256",iterations:250000,format:"rep-health-export/v5",createdAt:"2026-10-01T00:00:00.000Z"};
  const ciphertext=await webcrypto.subtle.encrypt({name:"AES-GCM",iv,additionalData:encoder.encode(JSON.stringify(header))},key,encoder.encode(JSON.stringify({app:"Rep Gym Companion",data:{session:"legacy"}})));
  const legacy={...header,salt:Buffer.from(salt).toString("base64"),iv:Buffer.from(iv).toString("base64"),ciphertext:Buffer.from(ciphertext).toString("base64")};
  assert.deepEqual(await features.decryptExport(legacy,passphrase),{app:"Rep Gym Companion",data:{session:"legacy"}});
  await assert.rejects(()=>features.decryptExport({...legacy,app:"AWJ"},passphrase),/incorrect|damaged/);
});
