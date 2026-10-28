import {describe,expect,it} from 'vitest';
import {CASE_RARITIES,createCaseRoll,RARITY_ODDS,ROLL_STOP_INDEX} from './caseOpeningLogic';
import type {CasePlayer} from './caseOpeningLogic';

const players:CasePlayer[]=[{id:'a',name:'Ari'},{id:'b',name:'Bea'},{id:'c',name:'Casey'}];

describe('case opening logic',()=>{
 it('creates a long reel with the selected player at the stopping position',()=>{
  const roll=createCaseRoll(players,()=>0);
  expect(roll.items).toHaveLength(40);
  expect(roll.items[ROLL_STOP_INDEX]).toEqual(roll.winner);
  expect(roll.winner.player).toEqual(players[0]);
 });

 it('selects each player using the random value and assigns a rarity to every skin',()=>{
  const values=[0.7,...Array(80).fill(0.995)];
  const roll=createCaseRoll(players,()=>values.shift()??0);
  expect(roll.winner.player).toEqual(players[2]);
  expect(roll.items.every(item=>CASE_RARITIES.includes(item.rarity))).toBe(true);
  expect(roll.winner.rarity).toBe('mythic');
 });

 it('shows rarity odds that total 100% and gives Mythic exactly a 3% chance',()=>{
  expect(RARITY_ODDS).toEqual({standard:55,rare:25,epic:13,legendary:4,mythic:3});
  expect(Object.values(RARITY_ODDS).reduce((total,odds)=>total+odds,0)).toBe(100);
 });

 it('uses the published rarity odds at every threshold',()=>{
  const rollAt=(value:number)=>{
   let call=0;
   return createCaseRoll(players,()=>call++===69?value:0);
  };
  expect(rollAt(0.5499).winner.rarity).toBe('standard');
  expect(rollAt(0.55).winner.rarity).toBe('rare');
  expect(rollAt(0.8).winner.rarity).toBe('epic');
  expect(rollAt(0.93).winner.rarity).toBe('legendary');
  expect(rollAt(0.97).winner.rarity).toBe('mythic');
 });

 it('requires at least two players',()=>{
  expect(()=>createCaseRoll([players[0]])).toThrow('at least two players');
 });

 it('rejects values outside the random source range',()=>{
  expect(()=>createCaseRoll(players,()=>1)).toThrow('between 0 and 1');
  expect(()=>createCaseRoll(players,()=>Number.NaN)).toThrow('between 0 and 1');
 });
});
