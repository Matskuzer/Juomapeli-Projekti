import {describe,expect,it} from 'vitest';
import {
 addPlayer,advanceAutoPyramid,createDeck,createRoom,publicState,RANKS,respondToPyramid,restartRoom,setReady,shuffledDeck,startGame,
 submitChallengeGuess,submitGuess,
} from '../../../shared/busGame.mjs';
import type {Card,Room} from '../../../shared/busGame.mjs';

function lobby():Room{
 const room=createRoom('ABC234','a','Ari');
 addPlayer(room,'b','Bea');
 setReady(room,'a',true);setReady(room,'b',true);
 startGame(room,'a',()=>0);
 return room;
}

function cardsWithout(...excluded:string[]):Card[]{
 return createDeck().filter(card=>!excluded.includes(card.id));
}

describe('Bus Driver game rules',()=>{
 it('creates a standard deck of 52 unique physical cards',()=>{
  const deck=createDeck();
  expect(deck).toHaveLength(52);
  expect(new Set(deck.map(card=>card.id)).size).toBe(52);
  expect(deck.find(card=>card.rank==='A'&&card.suit==='♠')).toBeDefined();
 });

 it('allows a ready host to start a solo game, but rejects an unready host',()=>{
  const room=createRoom('ABC234','a','Ari');
  expect(()=>startGame(room,'a')).toThrow('Everyone must be ready');
  setReady(room,'a',true);
  startGame(room,'a',()=>0);
  expect(room.status).toBe('guessing');
  expect(room.players).toHaveLength(1);
  expect(room.deck).toHaveLength(52);
 });

 it('validates turn order and rejects invalid guesses without drawing a card',()=>{
  const room=lobby();
  room.deck=[{id:'2♥',rank:'2',suit:'♥'},{id:'3♠',rank:'3',suit:'♠'}];
  expect(()=>submitGuess(room,'b','red')).toThrow('It is not your turn.');
  expect(()=>submitGuess(room,'a','higher')).toThrow('Choose one of the available options.');
  expect(room.deck).toHaveLength(2);
  submitGuess(room,'a','red');
  submitGuess(room,'b','red');
  expect(room.players[0].penalties).toBe(0);
  expect(room.players[1].penalties).toBe(1);
  expect(room.players[0].hand[0].id).toBe('2♥');
  expect(room.players[1].hand[0].id).toBe('3♠');
 });

 it('does not keep or score a tied higher/lower retry card',()=>{
  const room=lobby();
  room.round=1;
  room.players[0].hand=[{id:'7♥',rank:'7',suit:'♥'}];
  room.deck=[{id:'7♠',rank:'7',suit:'♠'}];
  room.settings.tieRule='retry';
  submitGuess(room,'a','higher');
  expect(room.players[0].hand.map(card=>card.id)).toEqual(['7♥']);
  expect(room.players[0].penalties).toBe(0);
  expect(room.round).toBe(1);
  expect(room.playerIndex).toBe(0);
  expect(room.lastReveal).toMatchObject({retry:true,correct:null,card:{id:'7♠'}});
  expect(room.deck).toHaveLength(0);
 });

 it('applies the host-configured penalty for an incorrect guess',()=>{
  const room=lobby();
  room.settings.guessPenalty=3;
  room.deck=[{id:'2♠',rank:'2',suit:'♠'}];
  submitGuess(room,'a','red');
  expect(room.players[0].penalties).toBe(3);
 });

 it('treats aces as high in higher/lower comparisons',()=>{
  const room=lobby();
  room.round=1;
  room.players[0].hand=[{id:'K♥',rank:'K',suit:'♥'}];
  room.deck=[{id:'A♠',rank:'A',suit:'♠'}];
  submitGuess(room,'a','higher');
  expect(room.lastReveal?.correct).toBe(true);
  expect(room.players[0].penalties).toBe(0);
 });

 it('uses strict inside bounds and treats exact boundaries as outside',()=>{
  const cases:[Card,string][]=[
   [{id:'6♦',rank:'6',suit:'♦'},'inside'],
   [{id:'2♦',rank:'2',suit:'♦'},'outside'],
   [{id:'4♦',rank:'4',suit:'♦'},'outside'],
   [{id:'9♦',rank:'9',suit:'♦'},'outside'],
   [{id:'K♦',rank:'K',suit:'♦'},'outside'],
  ];
  for(const [card,guess] of cases){
   const room=lobby();
   room.round=2;
   room.players[0].hand=[{id:'4♥',rank:'4',suit:'♥'},{id:'9♠',rank:'9',suit:'♠'}];
   room.deck=[card];
   submitGuess(room,'a',guess);
   expect(room.lastReveal?.correct).toBe(true);
  }
 });

 it('matches the selected suit exactly',()=>{
  const room=lobby();
  room.round=3;
  room.players[0].hand=[
   {id:'2♥',rank:'2',suit:'♥'},{id:'3♦',rank:'3',suit:'♦'},{id:'4♠',rank:'4',suit:'♠'},
  ];
  room.deck=[{id:'A♣',rank:'A',suit:'♣'}];
  submitGuess(room,'a','♣');
  expect(room.lastReveal?.correct).toBe(true);
 });

 it('rejects attempts to play a card not owned or without a rank match',()=>{
  const room=createRoom('ABC234','a','Ari');
  addPlayer(room,'b','Bea');
  room.status='pyramid';
  room.pyramid=[{id:'2♦',rank:'2',suit:'♦'},...cardsWithout('2♦').slice(0,14)];
  room.players[0].hand=[{id:'2♥',rank:'2',suit:'♥'}];
  room.players[1].hand=[{id:'3♥',rank:'3',suit:'♥'}];
  expect(()=>respondToPyramid(room,'a',{type:'play',cardId:'2♣',targetId:'b'})).toThrow('not in your hand');
  expect(()=>respondToPyramid(room,'a',{type:'play',cardId:'2♥',targetId:'a'})).toThrow('another player');
  expect(room.players[0].hand).toHaveLength(1);
  expect(room.players[1].penalties).toBe(0);
 });

 it('allows a solo player to play a matching card on themselves',()=>{
  const room=createRoom('ABC234','a','Ari');
  room.status='pyramid';
  room.players[0].hand=[{id:'4♥',rank:'4',suit:'♥'}];
  room.pyramid=[{id:'4♣',rank:'4',suit:'♣'},...cardsWithout('4♥','4♣').slice(0,14)];
  respondToPyramid(room,'a',{type:'play',cardId:'4♥',targetId:'a'});
  expect(room.players[0].hand).toHaveLength(0);
  expect(room.players[0].penalties).toBe(1);
  expect(room.playedCards[0]).toMatchObject({playerId:'a',targetId:'a',points:1});
 });

 it('consumes a matching card and assigns the configured bottom-row points',()=>{
  const room=createRoom('ABC234','a','Ari');
  addPlayer(room,'b','Bea');
  room.status='pyramid';
  room.players[0].hand=[{id:'2♥',rank:'2',suit:'♥'}];
  room.players[1].hand=[{id:'3♥',rank:'3',suit:'♥'}];
  room.pyramid=[{id:'2♦',rank:'2',suit:'♦'},...cardsWithout('2♥','3♥','2♦').filter(card=>Number(card.rank)||card.rank==='10').filter(card=>!['2','3'].includes(card.rank)).slice(0,14)];
  room.deck=cardsWithout('2♥','3♥','2♦',...room.pyramid.slice(1).map(card=>card.id));
  room.responseIndex=0;
  respondToPyramid(room,'a',{type:'play',cardId:'2♥',targetId:'b'});
  expect(room.players[0].hand).toHaveLength(0);
  expect(room.players[1].penalties).toBe(1);
  expect(room.playedCards).toEqual([{card:{id:'2♥',rank:'2',suit:'♥'},playerId:'a',targetId:'b',row:0,points:1}]);
 });

 it('supports reverse sequential response order and concurrent eligible responders',()=>{
  const sequential=createRoom('ABC234','a','Ari');
  addPlayer(sequential,'b','Bea');
  sequential.status='pyramid';
  sequential.settings.turnOrder='reverse';
  sequential.players[0].hand=[{id:'2♥',rank:'2',suit:'♥'}];
  sequential.players[1].hand=[{id:'2♠',rank:'2',suit:'♠'}];
  sequential.pyramid=[{id:'2♦',rank:'2',suit:'♦'},...cardsWithout('2♥','2♠','2♦').slice(0,14)];
  const reverse=publicState(sequential,'b') as {currentResponsePlayerId?:string};
  expect(reverse.currentResponsePlayerId).toBe('b');

  sequential.settings.responseMode='simultaneous';
  const first=publicState(sequential,'a') as {canRespond:boolean;eligibleResponsePlayerIds?:string[]};
  const second=publicState(sequential,'b') as {canRespond:boolean};
  expect(first.canRespond).toBe(true);
  expect(second.canRespond).toBe(true);
  expect(first.eligibleResponsePlayerIds).toBeUndefined();
  respondToPyramid(sequential,'a',{type:'pass'});
  expect((publicState(sequential,'a') as {canRespond:boolean}).canRespond).toBe(false);
  expect((publicState(sequential,'b') as {canRespond:boolean}).canRespond).toBe(true);
 });

 it('allows every matching card when the host selects the all-matching rule',()=>{
  const room=createRoom('ABC234','a','Ari');
  addPlayer(room,'b','Bea');
  room.status='pyramid';
  room.settings.matchingRule='all';
  room.players[0].hand=[{id:'2♥',rank:'2',suit:'♥'},{id:'2♠',rank:'2',suit:'♠'}];
  room.players[1].hand=[{id:'3♥',rank:'3',suit:'♥'}];
  room.pyramid=[{id:'2♦',rank:'2',suit:'♦'},...cardsWithout('2♥','2♠','3♥','2♦').filter(card=>!['2','3'].includes(card.rank)).slice(0,14)];
  room.deck=cardsWithout('2♥','2♠','3♥',...room.pyramid.map(card=>card.id));
  respondToPyramid(room,'a',{type:'play',cardId:'2♥',targetId:'b'});
  expect(room.players[0].hand).toHaveLength(1);
  expect(room.pyramidIndex).toBe(0);
  respondToPyramid(room,'a',{type:'play',cardId:'2♠',targetId:'b'});
  expect(room.players[0].hand).toHaveLength(0);
  expect(room.players[1].penalties).toBe(2);
  expect(room.playedCards).toHaveLength(2);
 });

 it('reveals unmatched pyramid cards one at a time on the server timer',()=>{
  const room=createRoom('ABC234','a','Ari');
  addPlayer(room,'b','Bea');
  room.status='pyramid';
  room.players[0].hand=[{id:'2♥',rank:'2',suit:'♥'}];
  room.players[1].hand=[{id:'3♥',rank:'3',suit:'♥'}];
  room.pyramid=cardsWithout('2♥','3♥').filter(card=>!['2','3'].includes(card.rank)).slice(0,15);
  room.pyramidAutoAdvanceAt=100;
  expect(publicState(room,'a')).toMatchObject({pyramidIndex:0,autoAdvancing:true});
  expect(advanceAutoPyramid(room,99)).toBe(false);
  expect(room.pyramidIndex).toBe(0);
  expect(advanceAutoPyramid(room,100)).toBe(true);
  expect(room.pyramidIndex).toBe(1);
  expect(room.pyramidAutoAdvanceAt).toBeGreaterThan(100);
 });

 it('draws a visible high-card tiebreak when both remaining-card and penalty scores tie',()=>{
  const room=createRoom('ABC234','a','Ari');
  addPlayer(room,'b','Bea');
  room.status='pyramid';
  room.players[0].hand=[{id:'2♥',rank:'2',suit:'♥'}];
  room.players[1].hand=[{id:'3♥',rank:'3',suit:'♥'}];
  room.players[0].penalties=2;
  room.players[1].penalties=2;
  room.pyramid=[...cardsWithout('2♥','3♥').filter(card=>!['2','3'].includes(card.rank)).slice(0,14),{id:'2♦',rank:'2',suit:'♦'}];
  room.pyramidIndex=14;
  room.responseIndex=0;
  room.deck=[{id:'A♠',rank:'A',suit:'♠'},{id:'K♠',rank:'K',suit:'♠'},...cardsWithout('2♥','3♥','A♠','K♠',...room.pyramid.map(card=>card.id))];
  respondToPyramid(room,'a',{type:'pass'});
  advanceAutoPyramid(room,room.pyramidAutoAdvanceAt!);
  expect(room.status).toBe('challenge');
  expect(room.busDriverId).toBe('a');
  expect(room.event).toMatchObject({type:'tiebreak',cards:[{playerId:'a',card:{id:'A♠'}},{playerId:'b',card:{id:'K♠'}}]});
 });

 it('selects the player with most cards remaining before using penalties as a tiebreak',()=>{
  const room=createRoom('ABC234','a','Ari');
  addPlayer(room,'b','Bea');
  room.status='pyramid';
  room.players[0].hand=[{id:'2♥',rank:'2',suit:'♥'},{id:'5♥',rank:'5',suit:'♥'}];
  room.players[1].hand=[{id:'3♥',rank:'3',suit:'♥'}];
  room.players[0].penalties=1;
  room.players[1].penalties=20;
  room.pyramid=[...cardsWithout('2♥','3♥','5♥').filter(card=>!['2','3','5'].includes(card.rank)).slice(0,14),{id:'2♦',rank:'2',suit:'♦'}];
  room.pyramidIndex=14;
  room.deck=cardsWithout('2♥','3♥','5♥',...room.pyramid.map(card=>card.id));
  respondToPyramid(room,'a',{type:'pass'});
  advanceAutoPyramid(room,room.pyramidAutoAdvanceAt!);
  expect(room.busDriverId).toBe('a');
  expect(room.event).toBeNull();
 });

 it('resets the Bus Driver challenge after a wrong guess and advances on a correct guess',()=>{
  const room=lobby();
  room.status='challenge';
  room.busDriverId='a';
  room.deck=[{id:'2♠',rank:'2',suit:'♠'},{id:'A♥',rank:'A',suit:'♥'}];
  submitChallengeGuess(room,'a','red');
  expect(room.challengeStep).toBe(0);
  expect(room.challengeCards).toHaveLength(0);
  expect(room.event).toMatchObject({type:'challengeReveal',correct:false});
  submitChallengeGuess(room,'a','red');
  expect(room.challengeStep).toBe(1);
  expect(room.challengeCards).toEqual([{id:'A♥',rank:'A',suit:'♥'}]);
 });

 it('plays through all guessing rounds, the pyramid and the full Bus Driver challenge',()=>{
  const room=lobby();
  while(room.status==='guessing'){
   const guess=['red','higher','inside','♠'][room.round];
   submitGuess(room,room.players[room.playerIndex].id,guess);
  }
  expect(room.players.every(player=>player.hand.length===4)).toBe(true);
  let pyramidSteps=0;
  while(room.status==='pyramid'&&pyramidSteps<40){
   const candidate=room.settings.responseMode==='sequential'
    ? room.players[room.settings.turnOrder==='reverse'?room.players.length-1-room.responseIndex:room.responseIndex]
    : room.players.find(player=>!room.respondedPlayers.includes(player.id)&&player.hand.some(card=>card.rank===room.pyramid[room.pyramidIndex]?.rank));
   const responder=candidate?.hand.some(card=>card.rank===room.pyramid[room.pyramidIndex]?.rank)?candidate:undefined;
   if(responder)respondToPyramid(room,responder.id,{type:'pass'});
   else advanceAutoPyramid(room,room.pyramidAutoAdvanceAt!);
   pyramidSteps+=1;
  }
  expect(room.status).toBe('challenge');
  expect(room.busDriverId).toBeTruthy();
  let attempts=0;
  while(room.status==='challenge'&&attempts<100){
   const card=room.deck[0];
   if(!card){
   room.deck=shuffledDeck();
   room.deckNumber+=1;
   }
   const upcoming=room.deck[0];
   if(!upcoming)throw new Error('Expected a card to be available for the challenge.');
   let guess:string;
   if(room.challengeStep===0)guess=['♥','♦'].includes(upcoming.suit)?'red':'black';
   else if(room.challengeStep===1){
   const previous=room.challengeCards[0];
   const value=(rank:string)=>RANKS.indexOf(rank as typeof RANKS[number]);
   guess=value(upcoming.rank)>value(previous.rank)?'higher':'lower';
   }else if(room.challengeStep===2){
   const value=(rank:string)=>RANKS.indexOf(rank as typeof RANKS[number]);
    const low=Math.min(value(room.challengeCards[0].rank),value(room.challengeCards[1].rank));
    const high=Math.max(value(room.challengeCards[0].rank),value(room.challengeCards[1].rank));
    const current=value(upcoming.rank);
    guess=current>low&&current<high?'inside':'outside';
   }else guess=upcoming.suit;
   submitChallengeGuess(room,room.busDriverId!,guess);
   attempts+=1;
  }
  expect(room.status).toBe('over');
  expect(room.challengeOutcome).toBe('complete');
 });

 it('keeps other players’ hands private in the synchronized state',()=>{
  const room=lobby();
  room.players[0].hand=[{id:'2♥',rank:'2',suit:'♥'}];
  room.players[1].hand=[{id:'3♠',rank:'3',suit:'♠'}];
  room.players[1].guesses=[{guess:'red',card:{id:'3♠',rank:'3',suit:'♠'},correct:false}];
  room.lastReveal={playerId:'b',round:0,guess:'red',card:{id:'3♠',rank:'3',suit:'♠'},correct:false,retry:false};
  const forA=publicState(room,'a',new Set(['a','b'])) as {players:{id:string;hand?:Card[];guesses?:unknown[]}[];lastReveal?:unknown};
  expect(forA.lastReveal).toBeDefined();
  expect(forA.players.find(player=>player.id==='a')?.hand?.[0].id).toBe('2♥');
  expect(forA.players.find(player=>player.id==='b')?.hand).toBeUndefined();
  expect(forA.players.find(player=>player.id==='b')?.guesses).toBeUndefined();
  room.status='pyramid';
  expect(publicState(room,'a').lastReveal).toBeNull();
 });

 it('lets the host return a completed game to a clean lobby',()=>{
  const room=lobby();
  room.status='over';
  room.challengeOutcome='complete';
  room.deckNumber=3;
  restartRoom(room,'a');
  expect(room.status).toBe('lobby');
  expect(room.deckNumber).toBe(1);
  expect(room.players.every(player=>!player.ready&&player.hand.length===0&&player.penalties===0)).toBe(true);
  expect(()=>restartRoom(room,'b')).toThrow('Only the host');
 });
});
