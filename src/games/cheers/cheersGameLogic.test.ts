import {describe,it,expect} from 'vitest';
import {createDeck} from './cheersCards';
import {createGame,drawCard,endEvent,setPartner,canPick,currentPlayerId,addRule,rankReactions} from './cheersGameLogic';
import {eventFor,withPartners} from './cheersRules';
const ps=['a','b','c'].map(n=>({id:n,name:n,gender:'unspecified' as const}));
describe('Cheers logic',()=>{
 it('deck has 52 unique cards',()=>{const d=createDeck();expect(d.length).toBe(52);expect(new Set(d.map(c=>c.id)).size).toBe(52);});
 it('drawing removes a card',()=>{const g=drawCard(createGame(ps));expect(g.deck.length).toBe(51);expect(g.deck.find(c=>c.id===g.currentCard!.id)).toBeUndefined();});
 it('turns rotate; game ends after 52 unique cards',()=>{let g=createGame(ps);const seen=new Set<string>();for(let i=0;i<52;i++){const first=currentPlayerId(g);g=drawCard(g);seen.add(g.currentCard!.id);g=endEvent(g);if(i<51)expect(currentPlayerId(g)).not.toBe(first);}expect(seen.size).toBe(52);expect(g.status).toBe('over');});
 it('counts kings',()=>{let g=createGame(ps);while(g.kingCount<4&&g.deck.length){g=endEvent(drawCard(g));}expect(g.kingCount).toBe(4);});
 it('uses the selected King rule',()=>{
  const player=currentPlayerId(createGame(ps));
  const base=createGame(ps);
  const king={id:'K♠',rank:'K' as const,suit:'♠' as const};
  expect(eventFor({...base,currentCard:king,kingCount:1,kingMode:'cup'},player)).toEqual({type:'kingPour',playerId:player});
  expect(eventFor({...base,currentCard:king,kingCount:4,kingMode:'cup'},player)).toEqual({type:'kingsCup',playerId:player});
  expect(eventFor({...base,currentCard:king,kingCount:1,kingMode:'bigSip'},player)).toMatchObject({type:'result',title:'King 1 / 4'});
 });
 it('gives 7 a normal category and 9 an elimination category',()=>{
  const g=createGame(ps);
  const player=currentPlayerId(g);
  const normalCategory={id:'7♠',rank:'7' as const,suit:'♠' as const};
  const eliminationCategory={id:'9♠',rank:'9' as const,suit:'♠' as const};
  expect(eventFor({...g,currentCard:normalCategory},player)).toEqual({type:'category',mode:'normal',category:null,remaining:ps.length,phase:'choose',penalty:0});
  expect(eventFor({...g,currentCard:eliminationCategory},player)).toEqual({type:'category',mode:'elimination',category:null,remaining:ps.length,phase:'choose',penalty:0});
 });
 it('uses Cheers for 4 and 5, and counting for 6',()=>{
  const g=createGame(ps);
  const player=currentPlayerId(g);
  const four={id:'4♠',rank:'4' as const,suit:'♠' as const};
  const five={id:'5♠',rank:'5' as const,suit:'♠' as const};
  const six={id:'6♠',rank:'6' as const,suit:'♠' as const};
  expect(eventFor({...g,currentCard:four},player)).toEqual({type:'cheers',phase:'countdown',startedAt:0});
  expect(eventFor({...g,currentCard:five},player)).toEqual({type:'cheers',phase:'countdown',startedAt:0});
  expect(eventFor({...g,currentCard:six},player)).toEqual({type:'counting',i:0});
 });
 it('starts a timed DJ round on 10',()=>{
  const g=createGame(ps);
  const player=currentPlayerId(g);
  const djCard={id:'10♠',rank:'10' as const,suit:'♠' as const};
  expect(eventFor({...g,currentCard:djCard},player)).toEqual({type:'dj',phase:'ready',playerId:player,startedAt:0,songGuesser:null,artistGuesser:null,timedOut:false});
 });
 it('keeps the question master until another Jack is drawn',()=>{let g=createGame(ps,()=>0);let jacks=0;
  while(g.deck.length&&jacks<2){const drawer=currentPlayerId(g);const previous=g.activeQuestionMaster;g=drawCard(g);
   if(g.currentCard!.rank==='J'){expect(g.activeQuestionMaster).toBe(drawer);expect(g.event).toEqual({type:'questionMaster',masterId:drawer});jacks++;}
   else expect(g.activeQuestionMaster).toBe(previous);
   g=endEvent(g);
  }
  expect(jacks).toBe(2);
 });
 it('cannot pick yourself',()=>{const g=createGame(ps);expect(canPick(g,currentPlayerId(g))).toBe(false);expect(setPartner(g,'a','a').activePartners.length).toBe(0);});
 it('partners drink together',()=>{expect(withPartners([{id:'a',sips:3}],[['a','b']]).length).toBe(2);});
 it('rules and reset',()=>{const g=addRule(createGame(ps),'No names');expect(g.activeRules.length).toBe(1);expect(createGame(ps).activeRules.length).toBe(0);});
 it('ranks reactions',()=>{expect(rankReactions({a:300,b:200},['a','b','c'])).toEqual(['b','a','c']);});
});
