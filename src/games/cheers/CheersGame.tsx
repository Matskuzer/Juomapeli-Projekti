import {useState} from 'react';
import {X,ScrollText,Link2,Trash2,ArrowRight} from 'lucide-react';
import type {Player,KingMode} from './cheersTypes';
import {createGame,drawCard,endEvent,currentPlayerId} from './cheersGameLogic';
import {RULE_INFO} from './cheersRules';
import {PlayingCard} from './components/PlayingCard';
import Events from './components/Events';
import {Btn,Reminder} from '../../components/ui';
export default function CheersGame({players,kingMode,onExit,onRestart}:{players:Player[];kingMode:KingMode;onExit:()=>void;onRestart:()=>void}){
 const [s,setS]=useState(()=>createGame(players,Math.random,kingMode));
 const nm=(id:string)=>s.players.find(p=>p.id===id)?.name??'?';
 const cur=currentPlayerId(s);
 const done=()=>setS(endEvent);
 if(s.status==='over')return <div className="pop mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6 text-center">
  <h1 className="text-5xl font-black text-fuchsia-400">CHEERS — GAME OVER</h1>
  <div className="grid grid-cols-2 gap-3">{([['Cards played',s.usedCards.length],['Players',s.players.length],['Kings drawn',s.kingCount],['Active rules',s.activeRules.length]] as const).map(([k,v])=><div key={k} className="rounded-2xl bg-white/5 p-4"><div className="text-3xl font-black">{v}</div><div className="text-xs text-zinc-400">{k}</div></div>)}</div>
  <Btn onClick={onRestart}>Play again</Btn><Btn tone="ghost" onClick={onExit}>Edit players</Btn><Reminder/></div>;
 const info=s.currentCard&&RULE_INFO[s.currentCard.rank];
 return <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 p-4 lg:flex-row lg:items-start">
  <aside className="order-2 space-y-3 rounded-2xl bg-white/5 p-4 text-sm lg:order-1 lg:sticky lg:top-4 lg:w-72 lg:shrink-0">
   <h2 className="text-lg font-black uppercase tracking-wide">Game notes</h2>
   {s.activeQuestionMaster&&<div className="flex gap-2 rounded-xl bg-fuchsia-600/10 p-3"><ScrollText size={16} className="mt-0.5 shrink-0 text-fuchsia-400"/><span><b>Question master: {nm(s.activeQuestionMaster)}</b><br/>Anyone who answers their questions drinks 3 sips. Stays until another Jack is drawn.</span></div>}
   <section className="space-y-2"><h3 className="font-bold text-fuchsia-300">Rules</h3>
    {s.activeRules.length===0?<p className="text-zinc-500">No active rules.</p>:s.activeRules.map((rule,index)=><div key={`${index}-${rule}`} className="flex items-start justify-between gap-2 rounded-xl bg-black/20 p-3"><span>{rule}</span><button aria-label={`Remove rule: ${rule}`} title="Remove rule" onClick={()=>setS(x=>({...x,activeRules:x.activeRules.filter((_,i)=>i!==index)}))} className="shrink-0 rounded-lg p-1 text-zinc-400 hover:text-red-400"><Trash2 size={16}/></button></div>)}
    {s.activeRules.length>0&&<p className="rounded-xl bg-red-600/20 p-3 text-center font-bold uppercase text-red-300">Rule broken — 3 sips</p>}
   </section>
   <section className="space-y-2"><h3 className="font-bold text-rose-300">Partners</h3>
    {s.activePartners.length===0?<p className="text-zinc-500">No partners yet.</p>:s.activePartners.map(([a,b])=><div key={`${a}-${b}`} className="flex items-center gap-2 rounded-xl bg-black/20 p-3"><Link2 size={16} className="shrink-0 text-rose-400"/><span className="flex items-center gap-2">{nm(a)} <ArrowRight aria-hidden="true" size={14} className="text-rose-400"/> {nm(b)}</span></div>)}
   </section>
  </aside>
  <main className="order-1 mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 lg:order-2 lg:mx-0 lg:flex-1">
  <div className="flex items-center justify-between text-sm text-zinc-400"><button aria-label="Quit" onClick={()=>window.confirm('Quit this game?')&&onExit()} className="p-2"><X/></button>
   <span>{s.deck.length} cards left</span><span className="rounded-full bg-fuchsia-600/30 px-3 py-1 font-bold text-fuchsia-300">KING {s.kingCount} / 4</span></div>
  <div className="text-center"><p className="text-xs uppercase tracking-widest text-zinc-500">Current player</p><h1 className="text-5xl font-black">{nm(cur)}</h1></div>
  <PlayingCard card={s.currentCard}/>
  {info&&<p className="text-center"><b className="text-2xl text-fuchsia-300">{info.name}</b><br/><span className="text-sm text-zinc-400">{info.text}</span></p>}
  {s.event?<Events s={s} set={setS} done={done} nm={nm}/>:<Btn onClick={()=>setS(drawCard)}>Draw card</Btn>}
  <div className="mt-auto"><Reminder/></div>
  </main>
 </div>;
}
