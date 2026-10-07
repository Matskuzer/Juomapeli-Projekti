import type {Rank,Drink,GameState,GameEvent} from './hitlerTypes';
export const RULE_INFO:Record<Rank,{name:string;text:string}>={
 A:{name:'Waterfall',text:'Everyone drinks together, one at a time.'},
 '2':{name:'You choose',text:'Pick someone to drink 2 sips.'},
 '3':{name:'You drink',text:'Take 3 sips.'},
 '4':{name:'HITLER',text:'Everyone shouts “HITLER!” Slowest drinks 3.'},
 '5':{name:'Counting',text:'1 sip, 2 sips, 3 sips... around the circle.'},
 '6':{name:'Women',text:'Players marked Female drink 3 sips.'},
 '7':{name:'Category',text:'Take turns naming things in a category. First person who gets stuck drinks 3 sips.'},
 '8':{name:'Make a rule',text:'Invent a rule. Breaking it = 3 sips.'},
 '9':{name:'Elimination category',text:'First person who gets one wrong drinks the most; each next elimination drinks one less.'},
 '10':{name:'DJ',text:'Play a song. Correctly guess the song and artist to give out 3 sips for each; if nobody guesses within a minute, the DJ drinks 6.'},
 J:{name:'Question master',text:'Ask questions. Anyone who answers drinks 3 sips. You stay question master until another Jack is drawn.'},
 Q:{name:'Partner',text:'Choose a partner. Whenever either of you drinks, you both drink the same amount.'},
 K:{name:'King',text:'Follow the King rule chosen before the game.'}};
/** Adds each drinker's partner (same sips) once. */
export function withPartners(drinks:Drink[],partners:[string,string][]):Drink[]{
 const out=new Map<string,number>();
 drinks.forEach(d=>out.set(d.id,(out.get(d.id)||0)+d.sips));
 drinks.forEach(d=>partners.forEach(([a,b])=>{const o=a===d.id?b:b===d.id?a:null;if(o&&!out.has(o))out.set(o,d.sips);}));
 return [...out].map(([id,sips])=>({id,sips}));
}
export function eventFor(s:GameState,cur:string):GameEvent{
 const r=s.currentCard!.rank;
 const res=(title:string,ids:string[],note?:string):GameEvent=>({type:'result',title,note,drinks:withPartners(ids.map(id=>({id,sips:3})),s.activePartners)});
 switch(r){
  case 'A':return {type:'waterfall',done:[]};
  case '2':return {type:'pick',purpose:'two'};
  case '3':return res('You drink',[cur]);
  case '4':return {type:'hitler',phase:'countdown',startedAt:0};
  case '5':return {type:'counting',i:0};
  case '6':{const ids=s.players.filter(p=>p.gender==='female').map(p=>p.id);return res('Women drink',ids,ids.length?undefined:'Nobody is marked Female.');}
  case '7':return {type:'category',mode:'normal',category:null,remaining:s.players.length,phase:'choose',penalty:0};
  case '8':return {type:'rule'};
  case '9':return {type:'category',mode:'elimination',category:null,remaining:s.players.length,phase:'choose',penalty:0};
  case '10':return {type:'dj',phase:'ready',playerId:cur,startedAt:0,songGuesser:null,artistGuesser:null,timedOut:false};
  case 'J':return {type:'questionMaster',masterId:cur};
  case 'Q':return {type:'pick',purpose:'partner'};
  default:
   if(s.kingMode==='bigSip')return {type:'result',title:`King ${s.kingCount} / 4`,note:`${s.players.find(player=>player.id===cur)?.name} takes a big sip.`,drinks:[]};
   return s.kingCount>=4?{type:'kingsCup',playerId:cur}:{type:'kingPour',playerId:cur};
 }
}
