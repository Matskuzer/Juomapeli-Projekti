import {useEffect,useState} from 'react';
import type {GameState,GameEvent,Drink} from '../hitlerTypes';
import {currentPlayerId,addRule,setPartner,orderedFrom} from '../hitlerGameLogic';
import {withPartners} from '../hitlerRules';
import {Btn} from '../../../components/ui';
type Set=(f:(s:GameState)=>GameState)=>void;
interface P{s:GameState;set:Set;done:()=>void;nm:(id:string)=>string}
type Ev<T extends GameEvent['type']>=Extract<GameEvent,{type:T}>;
const show=(s:GameState,title:string,drinks:Drink[],note?:string):GameState=>({...s,event:{type:'result',title,note,drinks:withPartners(drinks,s.activePartners)}});
const Title=({children}:{children:React.ReactNode})=><h2 className="pop text-center text-3xl font-black">{children}</h2>;
const sips=(n:number)=>`${n} sip${n>1?'s':''}`;
function Result({e,nm,done}:{e:Ev<'result'>;nm:P['nm'];done:()=>void}){
 return <div className="pop space-y-3"><Title>{e.title}</Title>{e.note&&<p className="text-center text-zinc-400">{e.note}</p>}
 {e.drinks.map(d=><div key={d.id} className="flex items-center justify-between rounded-2xl bg-white/5 p-4 text-xl font-bold"><span>{nm(d.id)}</span><span className="text-fuchsia-400">{sips(d.sips)}</span></div>)}
 <Btn onClick={done}>Continue</Btn></div>;
}
function Pick({s,set,e}:P&{e:Ev<'pick'>}){
 const me=currentPlayerId(s);
 const title={two:'Choose someone to drink 2 sips',partner:'Choose a partner',king:'KING 4 / 4 — choose someone to drink 3'}[e.purpose];
 const continueRound=()=>set(x=>x.event?.type==='pick'?{
  ...x,
  event:{type:'result',title:e.purpose==='partner'?'Partners!':'Choice made',note:e.purpose==='partner'?'Remember your partner and drink together whenever either of you drinks.':e.purpose==='two'?'The chosen player drinks 2 sips.':'The chosen player drinks 3 sips.',drinks:[]}
 }:x);
 const choosePartner=(id:string)=>set(x=>({...setPartner(x,me,id),event:{type:'result',title:'Partners!',note:`${s.players.find(player=>player.id===me)?.name} and ${s.players.find(player=>player.id===id)?.name} are partners. Whenever either drinks, both drink the same amount.`,drinks:[]}}));
 return <div className="space-y-3"><Title>{title}</Title>
 {e.purpose==='partner'?<><p className="text-center text-zinc-400">Choose a player. You and your partner both drink the same amount whenever either of you has to drink.</p><div className="grid grid-cols-2 gap-3">{s.players.filter(player=>player.id!==me).map(player=><button key={player.id} onClick={()=>choosePartner(player.id)} className="min-h-14 rounded-2xl bg-white/10 p-3 font-bold">{player.name}</button>)}</div></>:<Btn onClick={continueRound}>Done — continue</Btn>}
 {e.purpose==='king'&&<Btn tone="ghost" onClick={()=>set(x=>show(x,'You drink',[{id:me,sips:3}]))}>I drink 3 myself</Btn>}</div>;
}
function Waterfall({s,nm,done}:P&{e:Ev<'waterfall'>}){
 return <div className="space-y-3"><Title>WATERFALL</Title><p className="text-center text-zinc-400">{nm(currentPlayerId(s))} starts. Drink around the room, one at a time. Stop whenever you want.</p>
 <Btn onClick={done}>Everyone finished — continue</Btn></div>;
}
function Hitler({set,done,e}:P&{e:Ev<'hitler'>}){
 const [c,setC]=useState(3);
 useEffect(()=>{if(e.phase!=='countdown')return;
  if(c===0){const t=setTimeout(()=>set(x=>({...x,event:{type:'hitler',phase:'go',startedAt:performance.now()}})),600+Math.random()*1800);return()=>clearTimeout(t);}
  const t=setTimeout(()=>setC(c-1),700);return()=>clearTimeout(t);},[c,e.phase]);
 if(e.phase==='countdown')return <div className="py-10 text-center"><p className="text-zinc-400">Everyone get ready — call it out when it appears!</p><div key={c} className="pop text-9xl font-black text-fuchsia-400">{c>0?c:'…'}</div></div>;
 if(e.phase==='go')return <div className="space-y-3"><div className="glow rounded-3xl bg-red-600 py-6 text-center text-5xl font-black">HITLER!</div><p className="text-center text-zinc-300">Call “HITLER!” aloud! The slowest person drinks 3 sips.</p>
  <Btn onClick={()=>set(x=>x.event?.type==='hitler'?{...x,event:{...x.event,phase:'results'}}:x)}>Round finished — continue</Btn></div>;
 return <div className="pop space-y-3"><Title>HITLER!</Title><p className="text-center text-xl font-black text-fuchsia-400">The slowest person drinks 3 sips.</p><Btn onClick={done}>Continue</Btn></div>;
}
function Counting({s,set,nm,e,done}:P&{e:Ev<'counting'>}){
 const order=orderedFrom(s);const last=e.i>=order.length-1;
 return <div className="space-y-3"><Title>COUNTING</Title>
 {order.map((id,i)=><div key={id} className={`flex justify-between rounded-2xl p-4 text-lg font-bold transition ${i===e.i?'scale-105 bg-fuchsia-600':i<e.i?'bg-white/5 opacity-50':'bg-white/5'}`}><span>{nm(id)}</span><span>{sips(i+1)}</span></div>)}
 <p className="text-center text-zinc-400">{nm(order[e.i])} drinks {sips(e.i+1)}{withPartners([{id:order[e.i],sips:1}],s.activePartners).length>1?' (partner too)':''}</p>
 {last?<Btn onClick={done}>Finish counting</Btn>:<Btn onClick={()=>set(x=>({...x,event:{...e,i:e.i+1}}))}>Next player</Btn>}</div>;
}
function Category({s,set,done}:P&{e:Ev<'category'>}){
 const e=s.event;
 if(!e||e.type!=='category')return null;
 const begin=()=>set(x=>x.event?.type==='category'?{...x,event:{...x.event,category:'Spoken aloud',phase:'play'}}:x);
 const eliminate=()=>set(x=>x.event?.type==='category'&&x.event.phase==='play'?{...x,event:{...x.event,phase:'penalty',penalty:x.event.remaining}}:x);
 const stopNormal=()=>set(x=>x.event?.type==='category'?{...x,event:{type:'result',title:'Category round over',note:'The person who got stuck or answered incorrectly drinks 3 sips.',drinks:[]}}:x);
 if(e.phase==='choose')return <div className="space-y-3"><Title>{e.mode==='normal'?'CATEGORY':'ELIMINATION CATEGORY'}</Title><p className="text-center text-zinc-300">Say a category aloud, then take turns naming things in it.</p>{e.mode==='elimination'&&<p className="text-center text-zinc-400">First wrong answer drinks {e.remaining} sips. Each next person drinks one less, down to 1 sip.</p>}<Btn onClick={begin}>Start category</Btn></div>;
 if(e.phase==='penalty')return <div className="space-y-3"><Title>{e.mode==='normal'?'CATEGORY ROUND OVER':'ELIMINATED'}</Title><p className="text-center text-xl font-bold text-fuchsia-400">Whoever got that one wrong drinks {e.penalty} {e.penalty===1?'sip':'sips'}.</p>{e.mode==='elimination'&&<p className="text-center text-zinc-400">{e.remaining-1} {e.remaining-1===1?'player':'players'} left.</p>}
  {e.mode==='normal'?<Btn onClick={done}>Continue</Btn>:
  <Btn onClick={()=>e.remaining===1?done():set(x=>x.event?.type==='category'?{...x,event:{...x.event,remaining:x.event.remaining-1,penalty:0,phase:'play'}}:x)}>{e.remaining===1?'Finish category':'Continue'}</Btn>
  }
 </div>;
 return <div className="space-y-3"><Title>{e.mode==='normal'?'CATEGORY':'ELIMINATION CATEGORY'}</Title><p className="text-center text-zinc-300">Keep naming things aloud. The first wrong answer or person who gets stuck {e.mode==='normal'?'drinks 3 sips.':'is eliminated.'}</p>
  {e.mode==='normal'?<Btn tone="danger" onClick={stopNormal}>Someone got one wrong — finish</Btn>:<><p className="text-center font-bold text-fuchsia-300">{e.remaining} {e.remaining===1?'player':'players'} left · next elimination drinks {e.remaining} {e.remaining===1?'sip':'sips'}</p><Btn tone="danger" onClick={eliminate}>Someone got one wrong — eliminate</Btn></>}</div>;
}
function DJ({s,set,e,done,nm}:P&{e:Ev<'dj'>}){
 const [seconds,setSeconds]=useState(60);
 useEffect(()=>{
  if(e.phase!=='playing')return;
  const tick=()=>{const left=Math.max(0,60-Math.floor((Date.now()-e.startedAt)/1000));setSeconds(left);if(left===0)set(x=>x.event?.type==='dj'&&x.event.phase==='playing'?{...x,event:{...x.event,phase:'results',timedOut:true}}:x);};
  tick();const timer=setInterval(tick,250);return()=>clearInterval(timer);
 },[e.phase,e.startedAt,set]);
 const start=()=>set(x=>x.event?.type==='dj'?{...x,event:{...x.event,phase:'playing',startedAt:Date.now()}}:x);
 const select=(kind:'songGuesser'|'artistGuesser',id:string)=>set(x=>x.event?.type==='dj'&&x.event.phase==='playing'?{...x,event:{...x.event,[kind]:id,...(kind==='songGuesser'&&x.event.artistGuesser||kind==='artistGuesser'&&x.event.songGuesser?{phase:'results' as const}:{})}}:x);
 const finish=()=>set(x=>x.event?.type==='dj'&&x.event.phase==='playing'?{...x,event:{...x.event,phase:'results'}}:x);
 if(e.phase==='ready')return <div className="space-y-3"><Title>DJ</Title><p className="text-center text-zinc-300">{nm(e.playerId)} is the DJ. Play a song; everyone has one minute to guess the song and artist.</p><Btn onClick={start}>Start song and timer</Btn></div>;
 if(e.phase==='playing')return <div className="space-y-3"><Title>DJ</Title><p className="text-center text-6xl font-black text-fuchsia-400">{seconds}s</p><p className="text-center text-zinc-300">Tap the name of whoever correctly guesses the song or artist. The same player can get both.</p>
  <section className="space-y-2"><h3 className="text-center font-bold">Song title guessed</h3><div className="grid grid-cols-2 gap-2">{s.players.filter(player=>player.id!==e.playerId).map(player=><button key={player.id} disabled={!!e.songGuesser} onClick={()=>select('songGuesser',player.id)} className="min-h-12 rounded-xl bg-white/10 p-2 font-bold disabled:opacity-40">{player.name}</button>)}</div></section>
  <section className="space-y-2"><h3 className="text-center font-bold">Artist guessed</h3><div className="grid grid-cols-2 gap-2">{s.players.filter(player=>player.id!==e.playerId).map(player=><button key={player.id} disabled={!!e.artistGuesser} onClick={()=>select('artistGuesser',player.id)} className="min-h-12 rounded-xl bg-white/10 p-2 font-bold disabled:opacity-40">{player.name}</button>)}</div></section>
  <Btn tone="ghost" onClick={finish}>Finish round</Btn></div>;
 const titlePlayer=e.songGuesser?nm(e.songGuesser):null;const artistPlayer=e.artistGuesser?nm(e.artistGuesser):null;
 return <div className="space-y-3"><Title>DJ ROUND RESULTS</Title>
  {e.timedOut&&!e.songGuesser&&!e.artistGuesser?<p className="text-center text-xl font-bold text-fuchsia-400">{nm(e.playerId)} got no guesses in one minute and drinks 6 sips.</p>:<>
     {titlePlayer&&artistPlayer&&e.songGuesser===e.artistGuesser?<p className="text-center font-bold text-fuchsia-400">{titlePlayer} guessed both and gets to give out 6 sips total.</p>:<>
      {titlePlayer&&<p className="text-center text-xl">{titlePlayer} guessed the song and gets to give out 3 sips.</p>}
      {artistPlayer&&<p className="text-center text-xl">{artistPlayer} guessed the artist and gets to give out 3 sips.</p>}
     </>}
   {!titlePlayer&&!artistPlayer&&<p className="text-center text-zinc-300">The DJ round ended before anyone guessed correctly.</p>}
  </>}
  <Btn onClick={done}>Continue</Btn></div>;
}
function Rule({set,done}:P){
 const [text,setText]=useState('');
 return <div className="space-y-3"><Title>MAKE A RULE</Title><p className="text-center text-zinc-300">Write the rule you agreed on. It will stay visible in the rules panel.</p>
 <input value={text} onChange={event=>setText(event.target.value)} onKeyDown={event=>event.key==='Enter'&&text.trim()&&(set(x=>addRule(x,text)),done())} placeholder="Write the rule" maxLength={120} className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-lg outline-none focus:border-fuchsia-500"/>
 <Btn disabled={!text.trim()} onClick={()=>{set(x=>addRule(x,text));done();}}>Add rule</Btn></div>;
}
export default function Events(p:P){
 const e=p.s.event;if(!e)return null;
 switch(e.type){
  case 'result':return <Result e={e} nm={p.nm} done={p.done}/>;
  case 'pick':return <Pick {...p} e={e}/>;
  case 'waterfall':return <Waterfall {...p} e={e}/>;
  case 'hitler':return <Hitler {...p} e={e}/>;
  case 'counting':return <Counting {...p} e={e}/>;
  case 'category':return <Category {...p} e={e}/>;
  case 'dj':return <DJ {...p} e={e}/>;
  case 'rule':return <Rule {...p}/>;
  case 'questionMaster':return <div className="space-y-3"><Title>QUESTION MASTER</Title><p className="text-center text-zinc-300">{p.nm(e.masterId)} is the question master. Anyone who answers their questions drinks 3 sips.</p><p className="text-center text-zinc-400">The role stays until another Jack is drawn.</p><Btn onClick={p.done}>Continue</Btn></div>;
  case 'kingPour':return <div className="space-y-3"><Title>KING {p.s.kingCount} / 4</Title><p className="text-center text-zinc-300">{p.nm(e.playerId)} adds a little drink to the shared King's Cup.</p><Btn onClick={p.done}>Done — continue</Btn></div>;
  case 'kingsCup':return <div className="space-y-3"><Title>KING'S CUP</Title><p className="text-center text-xl font-bold text-fuchsia-400">{p.nm(e.playerId)} drew the 4th King and drinks the shared cup.</p><Btn onClick={p.done}>Done — continue</Btn></div>;
 }
}
