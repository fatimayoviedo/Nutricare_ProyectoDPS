import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, getDocs, collection, query, where, updateDoc, deleteDoc, deleteField } from 'firebase/firestore';

let env;
let owner, patient, stranger, unverified, guest;
const base = {id:'p1',kind:'patients',ownerId:'nutritionist',authorId:'nutritionist',patientId:'p1',patientEmail:'patient@example.com',payload:'{"name":"Paciente de prueba"}',createdAt:'2026-11-04T12:00:00.000Z',updatedAt:'2026-11-04T12:00:00.000Z',archived:false,feedback:'',approved:false};
const record = (db,id='p1') => doc(db,'records',id);
before(async()=>{
  env=await initializeTestEnvironment({projectId:'demo-nutricare',firestore:{host:'127.0.0.1',port:8180,rules:await readFile('firestore.rules','utf8')}});
  await env.clearFirestore();
  owner=env.authenticatedContext('nutritionist',{email:'nutritionist@example.com',email_verified:true}).firestore();
  patient=env.authenticatedContext('patient',{email:'patient@example.com',email_verified:true}).firestore();
  stranger=env.authenticatedContext('stranger',{email:'other@example.com',email_verified:true}).firestore();
  unverified=env.authenticatedContext('unverified',{email:'patient@example.com',email_verified:false}).firestore();
  guest=env.unauthenticatedContext().firestore();
  await assertSucceeds(setDoc(record(owner),base));
});
after(async()=>{await env?.cleanup();});
test('owner can read its scoped query',async()=>{await assertSucceeds(getDocs(query(collection(owner,'records'),where('ownerId','==','nutritionist'))));});
test('verified patient can query received records',async()=>{await assertSucceeds(getDocs(query(collection(patient,'records'),where('patientEmail','==','patient@example.com'))));});
test('unverified email cannot read clinical records',async()=>{await assertFails(getDoc(record(unverified)));});
test('stranger cannot read or list another workspace',async()=>{await assertFails(getDoc(record(stranger)));await assertFails(getDocs(collection(stranger,'records')));});
test('anonymous access is denied',async()=>{await assertFails(getDoc(record(guest)));await assertFails(getDocs(collection(guest,'records')));});
test('owner cannot be forged on creation',async()=>{await assertFails(setDoc(record(stranger,'forged'),{...base,id:'forged',patientId:'forged',authorId:'stranger'}));});
test('record schema validated on update',async()=>{await assertFails(updateDoc(record(owner),{payload:123}));await assertFails(updateDoc(record(owner),{extra:'unexpected'}));await assertFails(updateDoc(record(owner),{payload:deleteField()}));});
test('oversized payload rejected on create and update',async()=>{await assertFails(setDoc(record(owner,'large'),{...base,id:'large',patientId:'large',payload:'x'.repeat(750001)}));await assertFails(updateDoc(record(owner),{feedback:'x'.repeat(4001)}));});
test('identity and creation fields cannot change',async()=>{for(const key of ['ownerId','authorId','patientEmail','createdAt','kind','patientId']) await assertFails(updateDoc(record(owner),{[key]:'changed'}));});
test('patient cannot edit professional records',async()=>{await assertFails(updateDoc(record(patient),{payload:'{}'}));});
test('clinical children require a valid owned parent',async()=>{
  await assertSucceeds(setDoc(record(owner,'measurement'),{...base,id:'measurement',kind:'measurements'}));
  await assertFails(setDoc(record(stranger,'child-forged'),{...base,id:'child-forged',kind:'plans',authorId:'stranger',ownerId:'stranger'}));
  await assertFails(setDoc(record(owner,'orphan'),{...base,id:'orphan',kind:'measurements',patientId:'missing'}));
});
test('photo patient upload and professional feedback are separated',async()=>{
  await assertSucceeds(setDoc(record(patient,'photo'),{...base,id:'photo',kind:'photos',authorId:'patient'}));
  await assertSucceeds(updateDoc(record(owner,'photo'),{feedback:'Revisión de prueba',approved:true}));
  await assertFails(updateDoc(record(patient,'photo'),{approved:false}));
  await assertFails(updateDoc(record(patient,'photo'),{feedback:'Autorevisión'}));
  await assertFails(updateDoc(record(owner,'photo'),{payload:'{"comment":"Alterado"}'}));
  await assertSucceeds(updateDoc(record(patient,'photo'),{payload:'{"comment":"Comentario del paciente"}'}));
});
test('profiles are private and roles immutable',async()=>{
  const ref=doc(owner,'users','nutritionist');
  await assertSucceeds(setDoc(ref,{id:'nutritionist',name:'Prueba',email:'nutritionist@example.com',role:'nutritionist'}));
  await assertFails(getDoc(doc(patient,'users','nutritionist')));
  await assertFails(updateDoc(ref,{role:'patient'}));
  await assertFails(updateDoc(ref,{isAdmin:true}));
});
test('preferences belong to their user and reject schema pollution',async()=>{
  await assertSucceeds(setDoc(doc(patient,'settings','patient'),{readNotifications:'[]'}));
  await assertFails(getDoc(doc(stranger,'settings','patient')));
  await assertFails(updateDoc(doc(patient,'settings','patient'),{isAdmin:true}));
});
test('archive retains history and prevents later changes',async()=>{
  await assertSucceeds(updateDoc(record(owner,'measurement'),{archived:true}));
  await assertSucceeds(getDoc(record(patient,'measurement')));
  await assertFails(updateDoc(record(owner,'measurement'),{payload:'{}'}));
  await assertFails(deleteDoc(record(owner,'measurement')));
});
