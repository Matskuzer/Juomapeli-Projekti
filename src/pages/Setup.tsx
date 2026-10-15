import {useState} from 'react';
import {Plus,Trash2,ArrowLeft} from 'lucide-react';
import type {Player,Gender,KingMode} from '../games/hitler/hitlerTypes';
import {MIN_PLAYERS} from '../games/hitler/hitlerGameLogic';
import {Btn,Reminder} from '../components/ui';
import type {Game} from '../App';
const G:[Gender,string][]=[['female','Female'],['male','Male'],['unspecified','Prefer not to say']];
export default function Setup({game,players,setPlayers,kingMode,setKingMode,onBack,onPlay}:{game:Game;players:Player[];setPlayers:(p:Player[])=>void;kingMode:KingMode;setKingMode:(mode:KingMode)=>void;onBack:()=>void;onPlay:()=>void}){
 const [name,setName]=useState('');const [g,setG]=useState<Gender>('unspecified');
 const add=()=>{const n=name.trim();if(!n)return;setPlayers([...players,{id:Math.random().toString(36).slice(2),name:n,gender:g}]);setName('');};
 return <div className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-5">
  <button onClick={onBack} className="flex items-center gap-1 self-start py-2 text-zinc-400"><ArrowLeft size={18}/>Back</button>
  <h1 className="text-4xl font-black">Who's playing?</h1>
  <div className="space-y-3 rounded-3xl bg-white/5 p-4">
   <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Player name" maxLength={20} className="h-14 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-lg outline-none focus:border-fuchsia-500"/>
   <div className="grid grid-cols-3 gap-2">{G.map(([v,l])=><button key={v} onClick={()=>setG(v)} className={`min-h-12 rounded-xl px-1 text-xs font-bold ${g===v?'bg-fuchsia-600':'bg-white/10'}`}>{l}</button>)}</div>
   <Btn tone="ghost" disabled={!name.trim()} onClick={add}><Plus className="mr-1 inline" size={20}/>Add player</Btn></div>
  <ul className="space-y-2">{players.map(p=><li key={p.id} className="pop flex items-center justify-between rounded-2xl bg-white/5 p-3"><span className="font-bold">{p.name} <i className="text-xs font-normal text-zinc-500">{G.find(x=>x[0]===p.gender)![1]}</i></span><button aria-label="Remove" onClick={()=>setPlayers(players.filter(x=>x.id!==p.id))} className="p-2 text-zinc-400"><Trash2 size={20}/></button></li>)}</ul>
  <p className="text-center text-sm text-zinc-500">{players.length<MIN_PLAYERS?`Need at least ${MIN_PLAYERS} players`:'Recommended: 4–8 players'}</p>
  {game==='hitler'&&<section className="space-y-3 rounded-3xl bg-white/5 p-4"><h2 className="text-lg font-black">King card rule</h2>
   <button onClick={()=>setKingMode('cup')} className={`w-full rounded-2xl p-3 text-left ${kingMode==='cup'?'bg-fuchsia-600/30 ring-1 ring-fuchsia-400':'bg-black/20'}`}><span className="font-bold">King's Cup</span><br/><span className="text-sm text-zinc-400">Each King adds a little to the shared cup. The player who draws the 4th King drinks it.</span></button>
   <button onClick={()=>setKingMode('bigSip')} className={`w-full rounded-2xl p-3 text-left ${kingMode==='bigSip'?'bg-fuchsia-600/30 ring-1 ring-fuchsia-400':'bg-black/20'}`}><span className="font-bold">Big sip</span><br/><span className="text-sm text-zinc-400">Whoever draws a King takes one big sip.</span></button>
  </section>}
  <div className="mt-auto"><Btn disabled={players.length<MIN_PLAYERS} onClick={onPlay}>Start playing</Btn></div><Reminder/></div>;
}
