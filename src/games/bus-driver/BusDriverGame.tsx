import {useEffect, useMemo, useState} from 'react';
import {ArrowLeft, BusFront, CircleHelp, Volume2, VolumeX} from 'lucide-react';
import {Btn} from '../../components/ui';
import type {Player as SetupPlayer} from '../cheers/cheersTypes';
import {
 advanceAutoPyramid,createRoom,finishChallenge,publicState,respondToPyramid,restartRoom,setReady,startGame,
 submitChallengeGuess,submitGuess,updateSettings as updateRoomSettings,
} from '../../../shared/busGame.mjs';
import type {Room} from '../../../shared/busGame.mjs';

type Language='en'|'fi';
type Card={id:string;rank:string;suit:string};
type Guess={guess:string;card:Card;correct:boolean};
type Player={id:string;name:string;penalties:number;cardsRemaining:number;hand?:Card[];guesses?:Guess[]};
type Settings={tieRule:'incorrect'|'retry';rowPoints:number[];challengeLength:number;guessPenalty:number;responseMode:'sequential'|'simultaneous';turnOrder:'forward'|'reverse';matchingRule:'one'|'all'};
type Reveal={playerId:string;round:number;guess:string;card:Card;correct:boolean|null;retry:boolean};
type State={
 code:string;hostId:string;status:'lobby'|'guessing'|'pyramid'|'challenge'|'over';players:Player[];
 settings:Settings;round:number;currentPlayerId?:string;pyramid:(Card|null)[];pyramidIndex:number;
 currentResponsePlayerId?:string;canRespond:boolean;autoAdvancing:boolean;playedCards:{card:Card;playerId:string;targetId:string;row:number;points:number}[];
 lastReveal:Reveal|null;busDriverId:string|null;challengeStep:number;challengeCards:Card[];challengeLength:number;
 challengeOutcome:'complete'|'ended'|null;event:Record<string,unknown>|null;deckNumber:number;
};
type Action=
 |{type:'settings';settings:Settings}
 |{type:'start'}
 |{type:'guess';guess:string}
 |{type:'pyramid';action:{type:'pass'}|{type:'play';cardId:string;targetId:string}}
 |{type:'challenge';guess:string}
 |{type:'end'|'restart'};

const copy={
 en:{
  title:'BUS DRIVER',subtitle:'Ride the Bus',lobby:'Game setup',players:'Players',
  settings:'Game settings',settingsHint:'Keep the defaults for a quick game, or change the points below.',
  simpleSettings:'Quick settings',guessPenalty:'Points for a wrong guess',challengeLength:'Bus Driver challenge',
  challengeHelp:'Each correct guess moves on. One mistake sends the driver back to the start.',
  pointsUnit:'points',challengeUnit:'guesses in a row',decrease:'Decrease {setting}',increase:'Increase {setting}',
  advancedSettings:'More game rules',tieRule:'If two cards have the same value',tieIncorrect:'Count as wrong',tieRetry:'Let the player guess again',
  matchingRule:'When a player has matching cards',one:'Play one card',all:'Play all matching cards',
  responseMode:'How players answer the pyramid',sequential:'One player at a time',simultaneous:'Everyone at once',turnOrder:'Who answers first',forward:'In player order',reverse:'In reverse player order',
  rowPoints:'Pyramid points (bottom to top)',rowPointsHelp:'Points given when a matching card is played. Defaults are 1, 2, 3, 4, 5.',
  alcoholMode:'Penalties are points only. No alcohol is required; everyone may skip a penalty.',start:'Start game',
  soloAllowed:'Play with 1–6 players. Pass the device to the active player for their turn. Cards are visible to everyone.',
  round:'Round',redBlack:'Red or black?',higherLower:'Higher or lower?',insideOutside:'Inside or outside?',suit:'Guess the suit',
  red:'Red',black:'Black',higher:'Higher',lower:'Lower',inside:'Inside',outside:'Outside',
  yourTurn:"{name}'s turn",waitingTurn:'Waiting for',yourHand:"Players' cards",scoreboard:'Scoreboard',penalties:'Points',
  correct:'Correct!',retry:'Same value! Guess again.',challengeMiss:'Wrong guess — the challenge restarts.',guess:'Guess',
  pyramid:'The pyramid',row:'Row',rowPenalty:'points',yourResponse:'{name} responds',matching:'Matching card in your hand',
  chooseCard:'Choose a matching card',target:'Give the points to',playCard:'Play card',pass:'Pass',
  soloTarget:'Myself (solo game)',
  played:'Played cards',busDriver:'Bus Driver',challenge:'Bus Driver challenge',progress:'Progress',noMatches:'No matching cards — revealing the next card…',
  restart:'Return to game setup',endChallenge:'End challenge',gameOver:'Game complete',challengeWon:'Challenge completed!',
  challengeEnded:'The challenge was ended early.',tiebreak:'Tiebreaker cards',rules:'Rules',close:'Close',leave:'Leave game',
  confirmLeave:'Leave this game?',
  language:'Language',sound:'Sound effects',soundOn:'Sound on',soundOff:'Sound muted',
  responsibility:'Play safely and keep it optional. No one has to drink, and nobody should drive after drinking.',
  error:'Something went wrong',
  revealed:'Latest reveal',waitingPyramid:'Waiting for matching cards…',yourGuess:'Your guess',
  newDeckNote:'A fresh deck ({number}) was created after the previous deck ran out.',
  guessed:'guessed',rowLabel:['Bottom','Row 2','Row 3','Row 4','Top'],
  stages:['Color','Higher / lower','Inside / outside','Suit'],privateHand:'All players’ cards are shown.',
  gameRules:['Each player guesses four successive cards; a wrong guess adds one point.',
   'Aces are high. Equal higher/lower cards follow the selected retry rule; exact inside/outside boundaries count as outside.',
   'The pyramid is revealed bottom to top. Play a matching-rank card to assign that row’s points to another player.',
   'In a solo game, matching cards can be played on yourself. The player with the most cards left drives the bus; penalty points break ties.',
   'The challenge restarts after a wrong guess. A fresh deck is explicitly shuffled if needed.',
   'Points and harmless forfeits are the default. No one is required to drink.'],
 },
 fi:{
  title:'BUSSIKUSKI',subtitle:'Ride the Bus',lobby:'Pelin asetukset',players:'Pelaajat',
  settings:'Pelin asetukset',settingsHint:'Aloita oletusasetuksilla tai muuta pisteitä alta.',
  simpleSettings:'Pika-asetukset',guessPenalty:'Pisteet väärästä arvauksesta',challengeLength:'Bussikuskin haaste',
  challengeHelp:'Oikea arvaus vie eteenpäin. Yksi väärä arvaus aloittaa haasteen alusta.',
  pointsUnit:'pistettä',challengeUnit:'oikein peräkkäin',decrease:'Vähennä asetusta: {setting}',increase:'Lisää asetusta: {setting}',
  advancedSettings:'Muut pelisäännöt',tieRule:'Jos kahdella kortilla on sama arvo',tieIncorrect:'Lasketaan vääräksi',tieRetry:'Pelaaja saa arvata uudelleen',
  matchingRule:'Kun pelaajalla on samanarvoisia kortteja',one:'Pelaa yksi kortti',all:'Pelaa kaikki samanarvoiset kortit',
  responseMode:'Miten pyramidiin vastataan',sequential:'Yksi pelaaja kerrallaan',simultaneous:'Kaikki yhtä aikaa',turnOrder:'Kuka vastaa ensin',forward:'Pelaajajärjestyksessä',reverse:'Käänteisessä järjestyksessä',
  rowPoints:'Pyramidin pisteet (alhaalta ylös)',rowPointsHelp:'Pisteet, jotka saa samanarvoisen kortin pelaamisesta. Oletus: 1, 2, 3, 4, 5.',
  alcoholMode:'Rangaistukset ovat vain pisteitä. Alkoholia ei tarvita, ja rangaistuksen voi aina ohittaa.',start:'Aloita peli',
  soloAllowed:'Pelaa 1–6 pelaajalla. Anna laite vuorossa olevalle. Kaikkien kortit näkyvät.',
  round:'Kierros',redBlack:'Punainen vai musta?',higherLower:'Suurempi vai pienempi?',insideOutside:'Väliin vai ohi?',suit:'Arvaa maa',
  red:'Punainen',black:'Musta',higher:'Suurempi',lower:'Pienempi',inside:'Väliin',outside:'Ohi',
  yourTurn:'{name} pelaa',waitingTurn:'Odotetaan pelaajaa',yourHand:'Pelaajien kortit',scoreboard:'Pistetilanne',penalties:'Pisteet',
  correct:'Oikein!',retry:'Sama arvo! Haaste alkaa alusta.',challengeMiss:'Väärä arvaus — haaste alkaa alusta.',guess:'Arvaa',
  pyramid:'Pyramidi',row:'Rivi',rowPenalty:'pistettä',yourResponse:'{name} vastaa',matching:'Kädessäsi on samaa numeroa oleva kortti',
  chooseCard:'Valitse samaa numeroa oleva kortti',target:'Kenelle annat pisteet?',playCard:'Pelaa kortti',pass:'Ohita',
  soloTarget:'Itselleni (yksinpeli)',
  played:'Pelatut kortit',busDriver:'Bussikuski',challenge:'Bussikuskin haaste',progress:'Eteneminen',noMatches:'Ei samanarvoisia kortteja — paljastetaan seuraava kortti…',
  restart:'Takaisin pelin asetuksiin',endChallenge:'Lopeta haaste',gameOver:'Peli päättyi',challengeWon:'Haaste läpäisty!',
  challengeEnded:'Haaste lopetettiin.',tiebreak:'Tasatilanteen ratkaisukortit',rules:'Säännöt',close:'Sulje',leave:'Poistu pelistä',
  confirmLeave:'Poistutaanko pelistä?',
  language:'Kieli',sound:'Äänitehosteet',soundOn:'Äänet päällä',soundOff:'Äänet mykistetty',
  responsibility:'Pelaa turvallisesti ja vapaaehtoisesti. Kenenkään ei tarvitse juoda, eikä juomisen jälkeen pidä ajaa.',
  error:'Tapahtui virhe',
  revealed:'Viimeisin paljastus',waitingPyramid:'Odotetaan samanarvoisia kortteja…',yourGuess:'Arvauksesi',
  newDeckNote:'Uusi pakka ({number}) sekoitettiin edellisen loputtua.',
  guessed:'arvasi',rowLabel:['Alin','Rivi 2','Rivi 3','Rivi 4','Ylin'],
  stages:['Väri','Suurempi / pienempi','Väliin / ohi','Maa'],privateHand:'Kaikkien pelaajien kortit näkyvät.',
  gameRules:['Jokainen arvaa neljä korttia peräkkäin; väärä arvaus lisää yhden pisteen.',
   'Ässä on suurin. Tasatut suurempi/pienempi-arvaukset noudattavat valittua sääntöä; väliin-rajat lasketaan ohi-arvaukseksi.',
   'Pyramidi käännetään alhaalta ylös. Pelaa samaa numeroa oleva kortti ja anna rivin pisteet toiselle.',
   'Yksin pelatessa samanarvoisen kortin voi pelata itselleen. Eniten kortteja käteen jättänyt joutuu bussikuskiksi; pisteet ratkaisevat tasatilanteet.',
   'Väärä bussikuskin arvaus aloittaa haasteen alusta. Pakka sekoitetaan uudelleen vain tarvittaessa.',
   'Oletuksena käytetään pisteitä ja harmittomia tehtäviä. Ketään ei pakoteta juomaan.'],
 },
};

const suitName=(suit:string,language:Language)=>({
 '♥':language==='fi'?'Hertta':'Hearts','♦':language==='fi'?'Ruutu':'Diamonds',
 '♣':language==='fi'?'Risti':'Clubs','♠':language==='fi'?'Pata':'Spades',
}[suit]??suit);
const roundTitle=(round:number,language:Language)=>copy[language][(['redBlack','higherLower','insideOutside','suit'] as const)[round]??'suit'];
const incorrectMessage=(points:number,language:Language)=>language==='fi'
 ?`Väärin — +${points} ${points===1?'piste':'pistettä'}`
 :`Not quite — +${points} ${points===1?'point':'points'}`;
const localizeError=(message:string,language:Language)=>{
 if(language==='en')return message;
 const errors:Record<string,string>={
  'Game settings can only be changed in the lobby.':'Pelin asetuksia voi muuttaa vain aulassa.',
  'Invalid tie rule.':'Tasakorttisääntö ei kelpaa.',
  'Each pyramid row must have a penalty value from 1 to 20.':'Jokaisen pyramidirivin arvon tulee olla 1–20 pistettä.',
  'Challenge length must be between 1 and 4.':'Haasteen pituuden tulee olla 1–4.',
  'Invalid response mode.':'Vastaustapa ei kelpaa.',
  'Invalid turn order.':'Vuorojärjestys ei kelpaa.',
  'Invalid matching-card rule.':'Samanarvoisten korttien sääntö ei kelpaa.',
  'At least 1 player is needed.':'Peliin tarvitaan vähintään yksi pelaaja.',
  'Not enough cards for these settings. Reduce players or challenge length.':'Kortit eivät riitä näillä asetuksilla. Vähennä pelaajia tai haasteen pituutta.',
  'Guess penalties must be from 1 to 20 points.':'Arvausrangaistuksen tulee olla 1–20 pistettä.',
  'Only the host can do that.':'Vain host voi tehdä tämän.',
  'It is not your turn.':'Nyt ei ole sinun vuorosi.',
  'It is not time to guess.':'Nyt ei ole arvausvuoro.',
  'Choose one of the available options.':'Valitse jokin tarjolla olevista vaihtoehdoista.',
  'Choose red or black.':'Valitse punainen tai musta.',
  'Choose higher or lower.':'Valitse suurempi tai pienempi.',
  'Choose inside or outside.':'Valitse väliin tai ohi.',
  'Choose a valid suit.':'Valitse kelvollinen maa.',
  'Invalid pyramid action.':'Pyramiditoiminto ei kelpaa.',
  'The pyramid is not accepting responses.':'Pyramidi ei odota vastauksia juuri nyt.',
  'You do not have a matching card.':'Sinulla ei ole samanarvoista korttia.',
  'That card is not in your hand or does not match.':'Kortti ei ole kädessäsi tai se ei täsmää.',
  'Choose another player to receive the penalty.':'Valitse toinen pelaaja pisteiden saajaksi.',
  'The Bus Driver challenge is not active.':'Bussikuskin haaste ei ole käynnissä.',
  'The challenge cannot be ended now.':'Haastetta ei voi lopettaa nyt.',
  'The game must be complete before returning to the lobby.':'Pelin täytyy päättyä ennen asetuksiin palaamista.',
  'Unknown game action.':'Tuntematon pelitoiminto.',
 };
 return errors[message]??message;
};

function CardFace({card,small=false}:{card:Card;small?:boolean}){
 const red=card.suit==='♥'||card.suit==='♦';
 return <div className={`flip relative flex aspect-[5/7] ${small?'w-14 sm:w-16':'w-24 sm:w-32'} flex-col justify-between rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-100 p-2 text-left font-black shadow-xl ${red?'text-rose-600':'text-zinc-900'}`}>
  <div className="leading-none"><span className={small?'text-sm':'text-xl'}>{card.rank}</span><br/><span className={small?'text-xs':'text-base'}>{card.suit}</span></div>
  <span className={`self-center ${small?'text-xl':'text-4xl'}`}>{card.suit}</span>
  <div className="rotate-180 self-end leading-none"><span className={small?'text-sm':'text-xl'}>{card.rank}</span><br/><span className={small?'text-xs':'text-base'}>{card.suit}</span></div>
 </div>;
}

function SettingStepper({label,value,unit,min=1,max=20,disabled,decreaseLabel,increaseLabel,onChange}:{label:string;value:number;unit:string;min?:number;max?:number;disabled:boolean;decreaseLabel:string;increaseLabel:string;onChange:(value:number)=>void}){
 return <div className="flex items-center justify-between gap-3 rounded-xl bg-black/20 px-3 py-2">
  <span className="text-sm text-zinc-200">{label}</span>
  <div className="flex items-center gap-2">
   <button type="button" aria-label={decreaseLabel} disabled={disabled||value<=min} onClick={()=>onChange(value-1)} className="h-11 w-11 rounded-xl border border-white/10 bg-white/10 text-xl font-black disabled:opacity-40">−</button>
   <output aria-label={`${label}: ${value} ${unit}`} className="min-w-20 text-center text-lg font-black tabular-nums">{value} <span className="text-xs font-medium text-zinc-400">{unit}</span></output>
   <button type="button" aria-label={increaseLabel} disabled={disabled||value>=max} onClick={()=>onChange(value+1)} className="h-11 w-11 rounded-xl border border-white/10 bg-white/10 text-xl font-black disabled:opacity-40">+</button>
  </div>
 </div>;
}

function CardBack({small=false}:{small?:boolean}){
 return <div className={`flip flex aspect-[5/7] ${small?'w-14 sm:w-16':'w-24 sm:w-32'} items-center justify-center rounded-xl border-2 border-cyan-200/70 bg-[repeating-linear-gradient(45deg,#083344,#083344_5px,#155e75_5px,#155e75_10px)] text-2xl text-cyan-100 shadow-xl`}>✦</div>;
}

function createLocalRoom(players:SetupPlayer[]):Room{
 const [host,...others]=players;
 const room=createRoom('LOCAL',host.id,host.name);
 room.players.push(...others.map(player=>({id:player.id,name:player.name,ready:false,penalties:0,hand:[],guesses:[]})));
 return room;
}

function activePlayerId(room:Room):string{
 if(room.status==='guessing')return room.players[room.playerIndex]?.id??room.hostId;
 if(room.status==='pyramid'){
  const card=room.pyramid[room.pyramidIndex];
  const order=room.settings.turnOrder==='reverse'?[...room.players].reverse():room.players;
  const eligible=(player:Room['players'][number])=>player.hand.some(held=>held.rank===card?.rank);
  const responder=room.settings.responseMode==='sequential'
   ?order.slice(room.responseIndex).find(eligible)
   :order.find(player=>!room.respondedPlayers.includes(player.id)&&eligible(player));
  return responder?.id??room.hostId;
 }
 return room.status==='challenge'?room.busDriverId??room.hostId:room.hostId;
}

function localState(room:Room):State{
 const state=publicState(room,activePlayerId(room),new Set(room.players.map(player=>player.id))) as State;
 return {
  ...state,
  players:room.players.map((player,index)=>({...state.players[index],hand:player.hand,guesses:player.guesses})),
 };
}

export default function BusDriverGame({players:setupPlayers,onExit}:{players:SetupPlayer[];onExit:()=>void}){
 const [language,setLanguage]=useState<Language>('en');
 const t=copy[language];
 const [room]=useState(()=>createLocalRoom(setupPlayers));
 const [state,setState]=useState(()=>localState(room));
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [showRules,setShowRules]=useState(false);
 const [sound,setSound]=useState(false);
 const [selectedCard,setSelectedCard]=useState('');
 const [targetId,setTargetId]=useState('');
 const players=state.players;
 const gamePlayers=state.players;
 const currentPlayerId=activePlayerId(room);
 const me=gamePlayers.find(player=>player.id===currentPlayerId);
 const myTurn=Boolean(
  (state.status==='guessing'&&state.currentPlayerId===currentPlayerId)||
  (state.status==='pyramid'&&state.canRespond)||
  (state.status==='challenge'&&state.busDriverId===currentPlayerId)
 );
 const title=useMemo(()=>state?.status==='guessing'?roundTitle(state.round,language):state?.status==='pyramid'?t.pyramid:state?.status==='challenge'?t.challenge:state?.status==='over'?t.gameOver:t.lobby,[state?.status,state?.round,language,t]);
 const visibleHand=me?.hand??[];
 const matchingCards=state?.status==='pyramid'&&state.pyramid[state.pyramidIndex]
  ? visibleHand.filter(card=>card.rank===state?.pyramid[state.pyramidIndex]?.rank):[];
 const options=state?.status==='challenge'
  ? state.challengeStep===0?['red','black']:state.challengeStep===1?['higher','lower']:state.challengeStep===2?['inside','outside']:['♥','♦','♣','♠']
  : state?.status==='guessing'?state.round===0?['red','black']:state.round===1?['higher','lower']:state.round===2?['inside','outside']:['♥','♦','♣','♠']:[];

 function playClick(){
  if(!sound)return;
  const Audio=window.AudioContext;
  if(!Audio)return;
  const context=new Audio();
  const oscillator=context.createOscillator();
  const gain=context.createGain();
  oscillator.frequency.value=660;gain.gain.value=0.035;
  oscillator.connect(gain);gain.connect(context.destination);
  oscillator.start();oscillator.stop(context.currentTime+0.07);
  oscillator.onended=()=>void context.close();
 }

 useEffect(()=>{
  if(!state.autoAdvancing)return;
  const timer=window.setInterval(()=>{
   if(advanceAutoPyramid(room)){setState(localState(room));setError('');}
  },100);
  return()=>window.clearInterval(timer);
 },[room,state.autoAdvancing]);

 function act(action:Action){
  setBusy(true);setError('');
  try{
   const actorId=activePlayerId(room);
   switch(action.type){
    case 'settings':updateRoomSettings(room,room.hostId,action.settings);break;
    case 'start':room.players.forEach(player=>setReady(room,player.id,true));startGame(room,room.hostId);break;
    case 'guess':submitGuess(room,actorId,action.guess);break;
    case 'pyramid':respondToPyramid(room,actorId,action.action);break;
    case 'challenge':submitChallengeGuess(room,actorId,action.guess);break;
    case 'end':finishChallenge(room,room.hostId);break;
    case 'restart':restartRoom(room,room.hostId);break;
   }
   setState(localState(room));setSelectedCard('');setTargetId('');playClick();
  }catch(reason){setError(reason instanceof Error?localizeError(reason.message,language):t.error);}
  finally{setBusy(false);}
 }

 function updateSettings(patch:Partial<Settings>){
  if(!state)return;
  void act({type:'settings',settings:{...state.settings,...patch}});
 }

 function leave(){
  if(state.status!=='lobby'&&state.status!=='over'&&!window.confirm(t.confirmLeave))return;
  onExit();
 }

 const optionLabel=(value:string)=>{
  if(value==='red')return t.red;if(value==='black')return t.black;
  if(value==='higher')return t.higher;if(value==='lower')return t.lower;
  if(value==='inside')return t.inside;if(value==='outside')return t.outside;
  return `${suitName(value,language)} ${value}`;
 };

 const activeCard=state.status==='pyramid'?state.pyramid[state.pyramidIndex]:null;
 const currentPlayer=gamePlayers.find(player=>player.id===currentPlayerId);
 const currentResponder=gamePlayers.find(player=>player.id===state.currentResponsePlayerId);
 const challengePlayer=gamePlayers.find(player=>player.id===state.busDriverId);
 const tiebreakCards=state.event?.type==='tiebreak'&&Array.isArray(state.event.cards)?state.event.cards as {playerId:string;card:Card}[]:[];
 const visibleReveal=state.lastReveal;

 return <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 p-3 sm:p-5">
  <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
   <div className="flex items-center gap-3"><button aria-label={t.leave} onClick={leave} className="rounded-xl p-2 text-zinc-300 hover:bg-white/10"><ArrowLeft/></button>
    <div><p className="text-xs uppercase tracking-widest text-cyan-300">{t.title}</p><h1 className="text-xl font-black sm:text-2xl">{title}</h1></div>
   </div>
   <div className="flex items-center gap-2">
    <button aria-label={t.rules} onClick={()=>setShowRules(value=>!value)} className="rounded-xl bg-white/10 p-2.5"><CircleHelp size={19}/></button>
    <button aria-label={sound?t.soundOn:t.soundOff} onClick={()=>setSound(value=>!value)} className="rounded-xl bg-white/10 p-2.5">{sound?<Volume2 size={19}/>:<VolumeX size={19}/>}</button>
    <button aria-label={t.language} onClick={()=>setLanguage(language==='en'?'fi':'en')} className="rounded-xl border border-white/15 px-3 py-2 text-sm font-bold">{language==='en'?'EN':'FI'}</button>
   </div>
  </header>
  {error&&<p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
  {state.deckNumber>1&&<p aria-live="polite" className="rounded-xl border border-amber-300/20 bg-amber-400/10 p-2 text-center text-xs text-amber-200">{t.newDeckNote.replace('{number}',String(state.deckNumber))}</p>}
  {showRules&&<aside className="pop rounded-2xl border border-cyan-400/20 bg-slate-950/90 p-4">
   <div className="mb-2 flex items-center justify-between"><h2 className="font-black text-cyan-200">{t.rules}</h2><button onClick={()=>setShowRules(false)} className="text-sm text-zinc-400">{t.close}</button></div>
   <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-300">{t.gameRules.map(rule=><li key={rule}>{rule}</li>)}</ol>
  </aside>}

  {state.status==='lobby'&&<main className="grid flex-1 gap-4 lg:grid-cols-[1fr_1fr]">
   <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
    <div><p className="text-xs uppercase tracking-widest text-zinc-400">{t.lobby}</p><h2 className="text-2xl font-black">{t.players} ({players.length}/6)</h2></div>
    <ul className="space-y-2">{players.map((player,index)=><li key={player.id} className="flex items-center gap-3 rounded-xl bg-black/20 p-3">
     <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cyan-400/10 text-sm font-black text-cyan-200">{index+1}</span><b>{player.name}</b>
    </li>)}</ul>
   </section>
   <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
    <div><h2 className="text-xl font-black">{t.settings}</h2><p className="mt-1 text-sm text-zinc-400">{t.settingsHint}</p></div>
     <fieldset className="space-y-3 rounded-2xl border border-cyan-300/15 bg-cyan-950/20 p-3">
      <legend className="px-1 text-sm font-bold text-cyan-100">{t.simpleSettings}</legend>
      <SettingStepper label={t.guessPenalty} value={state.settings.guessPenalty} unit={t.pointsUnit} disabled={busy} decreaseLabel={t.decrease.replace('{setting}',t.guessPenalty)} increaseLabel={t.increase.replace('{setting}',t.guessPenalty)} onChange={value=>updateSettings({guessPenalty:value})}/>
      <div className="space-y-1">
       <SettingStepper label={t.challengeLength} value={state.settings.challengeLength} unit={t.challengeUnit} max={4} disabled={busy} decreaseLabel={t.decrease.replace('{setting}',t.challengeLength)} increaseLabel={t.increase.replace('{setting}',t.challengeLength)} onChange={value=>updateSettings({challengeLength:value})}/>
       <p className="px-2 text-xs text-zinc-400">{t.challengeHelp}</p>
      </div>
     </fieldset>
     <details className="group rounded-2xl border border-white/10 bg-black/15">
      <summary className="cursor-pointer list-none rounded-2xl p-4 font-bold marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">
       <span className="flex items-center justify-between">{t.advancedSettings}<span aria-hidden="true" className="text-xl text-cyan-200 group-open:rotate-45">+</span></span>
      </summary>
      <div className="space-y-4 border-t border-white/10 p-3">
       <label className="block space-y-1 text-sm"><span className="text-zinc-300">{t.tieRule}</span>
        <select value={state.settings.tieRule} disabled={busy} onChange={event=>updateSettings({tieRule:event.target.value as Settings['tieRule']})} className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3">
         <option value="incorrect">{t.tieIncorrect}</option><option value="retry">{t.tieRetry}</option>
        </select>
       </label>
       <fieldset className="space-y-2"><legend className="mb-1 text-sm text-zinc-200">{t.rowPoints}</legend><p className="mb-2 text-xs text-zinc-400">{t.rowPointsHelp}</p>
        {state.settings.rowPoints.map((points,index)=><SettingStepper key={index} label={t.rowLabel[index]} value={points} unit={t.pointsUnit} disabled={busy} decreaseLabel={t.decrease.replace('{setting}',t.rowLabel[index])} increaseLabel={t.increase.replace('{setting}',t.rowLabel[index])} onChange={value=>{const rowPoints=[...state.settings.rowPoints];rowPoints[index]=value;updateSettings({rowPoints});}}/>)}
       </fieldset>
       <label className="block space-y-1 text-sm"><span className="text-zinc-300">{t.responseMode}</span>
        <select value={state.settings.responseMode} disabled={busy} onChange={event=>updateSettings({responseMode:event.target.value as Settings['responseMode']})} className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3">
         <option value="sequential">{t.sequential}</option><option value="simultaneous">{t.simultaneous}</option>
        </select>
       </label>
       <label className="block space-y-1 text-sm"><span className="text-zinc-300">{t.matchingRule}</span>
        <select value={state.settings.matchingRule} disabled={busy} onChange={event=>updateSettings({matchingRule:event.target.value as Settings['matchingRule']})} className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3">
         <option value="one">{t.one}</option><option value="all">{t.all}</option>
        </select>
       </label>
       <label className="block space-y-1 text-sm"><span className="text-zinc-300">{t.turnOrder}</span>
        <select value={state.settings.turnOrder} disabled={busy} onChange={event=>updateSettings({turnOrder:event.target.value as Settings['turnOrder']})} className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3">
         <option value="forward">{t.forward}</option><option value="reverse">{t.reverse}</option>
        </select>
       </label>
      </div>
     </details>
     <p className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-200">{t.alcoholMode}</p>
    <Btn disabled={busy||players.length<1} onClick={()=>act({type:'start'})}>{t.start}</Btn>
    <p className="text-center text-xs text-zinc-500">{t.soloAllowed}</p>
   </section>
  </main>}

  {state.status!=='lobby'&&<div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
   <main className="min-w-0 space-y-4">
    {state.status==='guessing'&&<section className="pop space-y-4 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-950/50 to-slate-950/80 p-4 text-center sm:p-6">
     <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">{t.round} {state.round+1}/4 · {t.stages[state.round]}</p>
     <h2 className="text-2xl font-black sm:text-3xl">{roundTitle(state.round,language)}</h2>
     {currentPlayer&&<p className={`text-sm ${myTurn?'text-emerald-300':'text-zinc-400'}`}>{t.yourTurn.replace('{name}',currentPlayer.name)}</p>}
     {state.round>0&&<div className="flex flex-wrap justify-center gap-2">{visibleHand.slice(0,state.round).map(card=><CardFace key={card.id} card={card} small/>)}</div>}
     {myTurn?<div className="mx-auto grid max-w-lg grid-cols-2 gap-3">{options.map(option=><button key={option} disabled={busy} onClick={()=>void act({type:'guess',guess:option})} className="min-h-14 rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-3 font-black transition hover:bg-cyan-500/20 active:scale-95 disabled:opacity-40">{optionLabel(option)}</button>)}</div>
      :<p className="text-zinc-400">{currentPlayer?.name??'—'}</p>}
     {visibleReveal&&<p aria-live="polite" className="rounded-xl bg-black/20 p-3 text-sm">
      <b>{players.find(player=>player.id===visibleReveal.playerId)?.name}: </b>{t.yourGuess} {optionLabel(visibleReveal.guess)} · <span className="font-bold">{visibleReveal.card.rank}{visibleReveal.card.suit}</span>
      {visibleReveal.retry?` · ${t.retry}`:visibleReveal.correct?` · ${t.correct}`:` · ${incorrectMessage(state.settings.guessPenalty,language)}`}
     </p>}
    </section>}

    {state.status==='pyramid'&&<section className="space-y-4 rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-950/40 to-slate-950/80 p-3 sm:p-5">
     <div className="text-center"><p className="text-xs font-bold uppercase tracking-widest text-amber-300">{t.pyramid}</p>
      {activeCard&&<p className="mt-1 text-sm text-zinc-300">{t.row} {Math.floor(state.pyramidIndex<5?0:state.pyramidIndex<9?1:state.pyramidIndex<12?2:state.pyramidIndex<14?3:4)+1} · {state.settings.rowPoints[state.pyramidIndex<5?0:state.pyramidIndex<9?1:state.pyramidIndex<12?2:state.pyramidIndex<14?3:4]} {t.rowPenalty}</p>}
     </div>
     <div className="flex flex-col items-center gap-1.5 overflow-x-auto pb-2">
       {[1,2,3,4,5].map((count,row)=>{
        const level=4-row;
        return <div key={level} className="flex justify-center gap-1.5 sm:gap-2">{Array.from({length:count},(_,column)=>{
         const index=[0,5,9,12,14][level]+column;const card=state.pyramid[index];
         return <div key={index} className={`rounded-xl ${index===state.pyramidIndex?'ring-2 ring-amber-300 ring-offset-2 ring-offset-zinc-950':''}`}>{card?<CardFace card={card} small/>:<CardBack small/>}</div>;
        })}</div>;
       })}
     </div>
     {activeCard&&<div className="space-y-3 rounded-2xl bg-black/25 p-3 text-center">
      <p className="font-bold">{myTurn?t.yourResponse.replace('{name}',currentPlayer?.name??'Current player'):currentResponder?`${t.waitingTurn} ${currentResponder.name}`:state.autoAdvancing?t.noMatches:t.waitingPyramid}</p>
      {myTurn&&<><p className="text-sm text-zinc-400">{t.matching}</p>
       <div className="flex justify-center gap-2">{matchingCards.map(card=><button key={card.id} onClick={()=>setSelectedCard(card.id)} className={`rounded-xl p-1 ${selectedCard===card.id?'ring-2 ring-cyan-300':''}`}><CardFace card={card} small/></button>)}</div>
       {matchingCards.length>0&&<>
        <label className="mx-auto block max-w-sm text-left text-xs text-zinc-400">{t.target}
         <select value={targetId} onChange={event=>setTargetId(event.target.value)} className="mt-1 h-11 w-full rounded-xl bg-zinc-900 px-3 text-sm text-white">
          <option value="">—</option>{players.filter(player=>player.id!==currentPlayerId||players.length===1).map(player=><option key={player.id} value={player.id}>{player.id===currentPlayerId?t.soloTarget:player.name}</option>)}
         </select>
        </label>
        <Btn disabled={busy||!selectedCard||!targetId} onClick={()=>{void act({type:'pyramid',action:{type:'play',cardId:selectedCard,targetId}});setSelectedCard('');}}>{t.playCard}</Btn>
       </>}
       <button disabled={busy} onClick={()=>void act({type:'pyramid',action:{type:'pass'}})} className="rounded-xl bg-white/10 px-6 py-2 text-sm font-bold">{t.pass}</button>
      </>}
     </div>}
     {state.playedCards.length>0&&<div className="flex flex-wrap items-center gap-2 rounded-xl bg-black/20 p-3"><span className="mr-1 text-xs font-bold text-zinc-400">{t.played}:</span>{state.playedCards.map((played,index)=><span key={`${played.card.id}-${index}`} title={`${players.find(player=>player.id===played.playerId)?.name} → ${players.find(player=>player.id===played.targetId)?.name}`} className="rounded-lg bg-white/10 px-2 py-1 text-sm"><span className={played.card.suit==='♥'||played.card.suit==='♦'?'text-rose-400':''}>{played.card.rank}{played.card.suit}</span> → {players.find(player=>player.id===played.targetId)?.name} (+{played.points})</span>)}</div>}
    </section>}

    {state.status==='challenge'&&<section className="pop space-y-4 rounded-3xl border border-rose-400/30 bg-gradient-to-br from-rose-950/50 to-slate-950/80 p-4 text-center sm:p-6">
     <BusFront className="mx-auto text-rose-300" size={34}/><h2 className="text-2xl font-black">{t.challenge}</h2>
     <p className="text-lg font-bold text-rose-200">{challengePlayer?.name} · {t.busDriver}</p>
     {tiebreakCards.length>0&&<div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-black/20 p-3"><span className="w-full text-sm font-bold">{t.tiebreak}</span>{tiebreakCards.map((entry,index)=><div key={`${entry.playerId}-${index}`} className="flex items-center gap-2 text-sm">{players.find(player=>player.id===entry.playerId)?.name}<CardFace card={entry.card} small/></div>)}</div>}
     <p className="font-mono text-cyan-200">{t.progress}: {state.challengeStep}/{state.challengeLength}</p>
     <div className="flex flex-wrap justify-center gap-2">{Array.from({length:state.challengeLength},(_,index)=>{
      const revealed=state.challengeCards[index]??(state.event?.type==='challengeReveal'&&Number(state.event.step)===index?state.event.card as Card:undefined);
      return <div key={index} className="flex flex-col items-center gap-1 rounded-xl bg-black/20 p-2"><span className="text-[10px] text-zinc-400">{t.stages[index]}</span>{revealed?<CardFace card={revealed} small/>:<CardBack small/>}</div>;
     })}</div>
     {state.event?.type==='challengeReveal'&&<p className="rounded-xl bg-black/20 p-3 text-sm">{Boolean(state.event.correct)?t.correct:t.challengeMiss}</p>}
     {myTurn?<div className="mx-auto grid max-w-lg grid-cols-2 gap-3">{options.map(option=><button key={option} disabled={busy} onClick={()=>void act({type:'challenge',guess:option})} className="min-h-14 rounded-2xl border border-rose-300/20 bg-rose-500/10 p-3 font-black hover:bg-rose-500/20 disabled:opacity-40">{optionLabel(option)}</button>)}</div>:<p className="text-zinc-400">{t.waitingTurn} {challengePlayer?.name}</p>}
     <button disabled={busy} onClick={()=>act({type:'end'})} className="rounded-xl bg-red-500/15 px-4 py-2 text-sm font-bold text-red-200">{t.endChallenge}</button>
    </section>}

    {state.status==='over'&&<section className="space-y-4 rounded-3xl border border-emerald-400/20 bg-emerald-950/30 p-6 text-center">
     <h2 className="text-3xl font-black text-emerald-200">{t.gameOver}</h2>
     <p className="text-xl">{state.challengeOutcome==='complete'?t.challengeWon:state.challengeOutcome==='ended'?t.challengeEnded:`${challengePlayer?.name} · ${t.busDriver}`}</p>
     <Btn onClick={()=>act({type:'restart'})}>{t.restart}</Btn>
    </section>}

   </main>
   <aside className="space-y-4">
    <section className="rounded-3xl border border-cyan-400/15 bg-white/5 p-4">
     <h2 className="mb-1 font-black">{t.yourHand}</h2><p className="mb-3 text-xs text-zinc-500">{t.privateHand}</p>
     <ul className="space-y-3">{players.map(player=><li key={player.id} className="space-y-1">
      <h3 className="text-sm font-bold text-zinc-200">{player.name}</h3>
      <div className="flex flex-wrap gap-2">{player.hand?.length?player.hand.map(card=><CardFace key={card.id} card={card} small/>):<span className="text-sm text-zinc-500">—</span>}</div>
     </li>)}</ul>
    </section>
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
     <h2 className="mb-3 font-black">{t.scoreboard}</h2>
     <ul className="space-y-2">{[...players].sort((a,b)=>b.penalties-a.penalties).map(player=><li key={player.id} className={`flex items-center justify-between gap-2 rounded-xl p-2.5 ${player.id===currentPlayerId?'bg-cyan-400/10':'bg-black/20'}`}>
      <div className="min-w-0"><p className="truncate font-bold">{player.name}{player.id===state.busDriverId&&state.status==='challenge'?' 🚌':''}</p><p className="text-xs text-zinc-400">{player.cardsRemaining} {language==='fi'?'korttia':'cards'}</p></div>
      <span className="shrink-0 rounded-lg bg-amber-400/10 px-2 py-1 text-sm font-black text-amber-200">{player.penalties} {t.penalties}</span>
     </li>)}</ul>
    </section>
    {state.lastReveal&&<section className="rounded-3xl border border-white/10 bg-white/5 p-4">
     <h2 className="mb-2 text-sm font-bold text-zinc-300">{t.revealed}</h2>
     <div className="flex items-center gap-3"><CardFace card={state.lastReveal.card} small/><p className="text-sm">{players.find(player=>player.id===state.lastReveal?.playerId)?.name} · {optionLabel(state.lastReveal.guess)}{state.lastReveal.correct===null?` · ${t.retry}`:state.lastReveal.correct?` · ${t.correct}`:` · ${incorrectMessage(state.settings.guessPenalty,language)}`}</p></div>
    </section>}
   </aside>
  </div>}
  <div className="mt-auto"><p className="px-6 pb-4 text-center text-xs text-zinc-500">{t.responsibility}</p></div>
 </div>;
}
