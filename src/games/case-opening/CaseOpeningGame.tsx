import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,PackageOpen,Plus,Trash2} from 'lucide-react';
import {Btn,Reminder} from '../../components/ui';
import {CASE_RARITIES,createCaseRoll,RARITY_ODDS,RARITY_STYLES,ROLL_STOP_INDEX} from './caseOpeningLogic';
import type {CasePlayer,CaseRoll} from './caseOpeningLogic';

const REEL_TIME_MS=10000;
const DEFAULT_SIPS:Record<(typeof CASE_RARITIES)[number],number>={standard:1,rare:2,epic:3,legendary:4,mythic:5};
const MAX_SIPS=20;

export default function CaseOpeningGame({onExit}:{onExit:()=>void}){
 const [players,setPlayers]=useState<CasePlayer[]>([]);
 const [nameDraft,setNameDraft]=useState('');
 const [notice,setNotice]=useState('');
 const [roll,setRoll]=useState<CaseRoll|null>(null);
 const [winner,setWinner]=useState<CaseRoll['winner']|null>(null);
 const [isSpinning,setIsSpinning]=useState(false);
 const [showRoll,setShowRoll]=useState(false);
 const [sipAmounts,setSipAmounts]=useState(DEFAULT_SIPS);
 const nextPlayerId=useRef(0);
 const viewportRef=useRef<HTMLDivElement>(null);
 const trackRef=useRef<HTMLDivElement>(null);
 const winnerCardRef=useRef<HTMLDivElement>(null);
 const pendingWinnerRef=useRef<CaseRoll['winner']|null>(null);
 const animationRef=useRef<Animation|null>(null);

 const addPlayers=()=>{
  const names=nameDraft.split(/[,\n]+/).map(name=>name.trim()).filter(Boolean);
  if(!names.length){setNotice('Enter at least one username.');return;}
  if(names.some(name=>name.length>24)){setNotice('Each username must be 24 characters or fewer.');return;}
  const existing=new Set(players.map(player=>player.name.toLocaleLowerCase()));
  const additions:CasePlayer[]=[];
  let duplicates=0;
  for(const name of names){
   const key=name.toLocaleLowerCase();
   if(existing.has(key)){duplicates++;continue;}
   existing.add(key);
   additions.push({id:String(nextPlayerId.current++),name});
  }
  setPlayers([...players,...additions]);
  setNameDraft('');
  setNotice(duplicates?'Duplicate usernames were skipped.':'');
 }

 const openCase=()=>{
  if(isSpinning||players.length<2)return;
  const nextRoll=createCaseRoll(players);
  pendingWinnerRef.current=nextRoll.winner;
  setWinner(null);
  setRoll(nextRoll);
  setShowRoll(true);
  setIsSpinning(true);
 };

 function finishSpin(){
  setIsSpinning(false);
  setWinner(pendingWinnerRef.current);
  pendingWinnerRef.current=null;
 }

 useEffect(()=>{
  if(!isSpinning||!roll)return;
  const viewport=viewportRef.current;
  const track=trackRef.current;
  const card=winnerCardRef.current;
  if(!viewport||!track||!card)return;

  const target=viewport.clientWidth/2-card.offsetLeft-card.offsetWidth/2;
  const duration=Math.max(7000,REEL_TIME_MS);
  track.style.transform='translateX(0px)';
  const animation=track.animate(
   [{transform:'translateX(0px)'},{transform:`translateX(${target}px)`}],
   {duration,easing:'cubic-bezier(.08,.72,.08,1)',fill:'forwards'},
  );
  animationRef.current=animation;
  animation.onfinish=()=>{
   if(animationRef.current!==animation)return;
   track.style.transform=`translateX(${target}px)`;
   animation.cancel();
   animationRef.current=null;
   finishSpin();
  };

  return ()=>{
   animation.onfinish=null;
   if(animationRef.current===animation){
    animation.cancel();
    animationRef.current=null;
   }
  };
 },[isSpinning,roll]);

 const removePlayer=(id:string)=>{
  if(isSpinning)return;
  setPlayers(current=>current.filter(player=>player.id!==id));
  setWinner(null);
  setShowRoll(false);
 };

 return <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-5 sm:p-8">
  <header>
   <button onClick={onExit} className="mb-5 flex items-center gap-2 rounded-xl p-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft size={18}/>Back to games</button>
   <div className="flex items-center gap-3"><PackageOpen className="case-icon text-violet-300" size={32}/><div><h1 className="bg-gradient-to-r from-white via-violet-100 to-fuchsia-300 bg-clip-text text-3xl font-black tracking-tight text-transparent">CASE OPENING</h1><p className="text-sm text-zinc-400">Your friends. Your skins. One spin.</p></div></div>
  </header>

  <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
  <div className="flex min-w-0 flex-col gap-6">
  <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5 sm:p-6">
   <h2 className="mb-2 text-lg font-black">Add usernames</h2>
   <p className="mb-4 text-sm text-zinc-400">Enter names separated by commas or put each name on a new line.</p>
   <div className="flex flex-col gap-3 sm:flex-row">
    <textarea aria-label="Player usernames" rows={2} maxLength={300} value={nameDraft} disabled={isSpinning} onChange={event=>setNameDraft(event.target.value)} placeholder={'e.g. Alex, Sam, Jordan'} className="min-h-14 flex-1 resize-y rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-violet-400 disabled:opacity-50"/>
    <button onClick={addPlayers} disabled={isSpinning} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-violet-400/30 bg-violet-500/15 px-5 font-bold text-violet-100 hover:bg-violet-500/25 disabled:opacity-40"><Plus size={18}/>Add players</button>
   </div>
   {notice&&<p role="status" className="mt-3 text-sm text-amber-200">{notice}</p>}
   <div className="mt-4 flex flex-wrap gap-2">
    {players.map(player=><span key={player.id} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-3 pr-2 text-sm">
     {player.name}<button aria-label={`Remove ${player.name}`} disabled={isSpinning} onClick={()=>removePlayer(player.id)} className="rounded-full p-1 text-zinc-500 hover:bg-white/10 hover:text-white disabled:opacity-30"><Trash2 size={14}/></button>
    </span>)}
    {!players.length&&<p className="text-sm text-zinc-500">No usernames added yet.</p>}
   </div>
  </section>

  <section className={`case-stage overflow-hidden rounded-3xl border border-violet-400/25 bg-gradient-to-b from-violet-950/60 to-zinc-950 p-4 sm:p-6 ${isSpinning?'case-stage-spinning':''}`}>
   <div className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-[.2em] text-violet-200/70"><span>Player collection</span><span>{players.length} {players.length===1?'skin':'skins'}</span></div>
   <div className="relative">
    <div className={`case-marker pointer-events-none absolute -top-2 left-1/2 z-10 h-0 w-0 -translate-x-1/2 border-x-[11px] border-t-[16px] border-x-transparent border-t-amber-300 drop-shadow-[0_0_8px_#fcd34d] ${isSpinning?'case-marker-pulsing':''}`}/>
    <div className={`case-marker pointer-events-none absolute -bottom-2 left-1/2 z-10 h-0 w-0 -translate-x-1/2 border-x-[11px] border-b-[16px] border-x-transparent border-b-amber-300 drop-shadow-[0_0_8px_#fcd34d] ${isSpinning?'case-marker-pulsing':''}`}/>
    <div ref={viewportRef} aria-label="Case opening reel" className={`case-reel-viewport overflow-hidden rounded-2xl border-y border-amber-300/50 bg-black/60 py-3 ${isSpinning?'case-reel-spinning':''}`}>
     {showRoll&&roll?<div ref={trackRef} className="case-roll-track flex w-max gap-3">
      {roll.items.map((skin,index)=>{
       const style=RARITY_STYLES[skin.rarity];
       const isSelected=index===ROLL_STOP_INDEX;
       return <div ref={isSelected?winnerCardRef:undefined} key={index} className={`case-skin relative flex h-32 w-40 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border ${style.frame} ${style.glow} ${isSpinning?'case-skin-spinning':''} ${winner&&isSelected?'case-skin-selected':''}`} style={isSpinning?{animationDelay:`${index%5*35}ms`}:undefined}>
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{backgroundImage:'repeating-linear-gradient(135deg,transparent 0 12px,rgba(255,255,255,.18) 12px 14px)'}}/>
        <div className={`case-skin-shine ${isSpinning?'case-skin-shine-active':''}`}/>
        <span className="relative mb-2 grid size-12 place-items-center rounded-full border border-white/30 bg-black/30 text-xl font-black text-white/90">{skin.player.name.slice(0,2).toUpperCase()}</span>
        <span className="relative max-w-[9rem] truncate px-2 text-center font-black text-white">{skin.player.name}</span>
        <span className="relative mt-1 text-[9px] font-bold tracking-[.2em] text-white/60">{style.label}</span>
       </div>;
      })}
     </div>:<div className="flex h-40 items-center justify-center text-center text-sm text-zinc-500">{players.length<2?'Add at least two usernames to load the case.':'The case is ready. Spin to see who gets picked.'}</div>}
    </div>
   </div>
   <p className="mt-4 text-center text-xs text-zinc-500">The center marker picks one username at random.</p>
  </section>

  {winner?<section aria-live="polite" className={`case-result case-result-${winner.rarity} pop relative overflow-hidden rounded-3xl border p-6 text-center`}>
   <div className="case-confetti" aria-hidden="true">{Array.from({length:12},(_,index)=><span key={index}/>)}</div>
   <p className="case-drop-label relative text-xs font-black uppercase tracking-[.25em]">{RARITY_STYLES[winner.rarity].label} DROP</p>
   <h2 className="case-winner-name relative mt-2 break-words text-4xl font-black">{winner.player.name}</h2>
   <p className="relative mt-3 text-lg text-zinc-100">{sipAmounts[winner.rarity]===0?'No sips this time — skip if you like.':`You landed on the case! Take ${sipAmounts[winner.rarity]} ${sipAmounts[winner.rarity]===1?'sip':'sips'}.`}</p>
  </section>:null}

  <Btn disabled={players.length<2||isSpinning} onClick={openCase} className="bg-gradient-to-r from-violet-700 to-fuchsia-700 shadow-[0_0_30px_-5px_rgba(167,139,250,.5)]">
   {isSpinning?'Opening...':winner?'Open again':'Open case'}
  </Btn>
  </div>
  <aside aria-label="Case odds and sip settings" className="rounded-3xl border border-violet-400/25 bg-zinc-950/80 p-5 shadow-[0_0_35px_-22px_#c084fc] lg:sticky lg:top-6">
   <h2 className="text-lg font-black">DROP ODDS</h2>
   <p className="mb-4 mt-1 text-xs text-zinc-400">Chance per opening</p>
   <div className="space-y-2">
    {CASE_RARITIES.map(rarity=>{
     const style=RARITY_STYLES[rarity];
     return <div key={rarity} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[.03] px-3 py-2">
      <span className={`text-xs font-black tracking-wider ${rarity==='standard'?'text-sky-300':rarity==='rare'?'text-violet-300':rarity==='epic'?'text-fuchsia-300':rarity==='legendary'?'text-rose-300':'text-amber-300'}`}>{style.label}</span>
      <span className="font-mono text-sm font-bold text-white">{RARITY_ODDS[rarity]}%</span>
     </div>;
    })}
   </div>
   <div className="my-5 border-t border-white/10"/>
   <h3 className="text-sm font-black">SIPS BY RARITY</h3>
   <p className="mb-3 mt-1 text-xs text-zinc-400">Choose the sip count for each drop. 0 means no sips.</p>
   <div className="space-y-2">
    {CASE_RARITIES.map(rarity=><label key={rarity} className="flex items-center justify-between gap-3 text-sm">
     <span className="text-zinc-300">{RARITY_STYLES[rarity].label}</span>
     <span className="flex items-center gap-2">
      <input aria-label={`${RARITY_STYLES[rarity].label} sips`} type="number" min={0} max={MAX_SIPS} step={1} value={sipAmounts[rarity]} disabled={isSpinning} onChange={event=>{
       const amount=Number(event.currentTarget.value);
       setSipAmounts(current=>({...current,[rarity]:Number.isFinite(amount)?Math.min(MAX_SIPS,Math.max(0,Math.floor(amount))):0}));
      }} className="w-16 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-center font-mono text-white outline-none focus:border-violet-400 disabled:opacity-50"/>
      <span className="w-8 text-xs text-zinc-500">{sipAmounts[rarity]===1?'sip':'sips'}</span>
     </span>
    </label>)}
   </div>
  </aside>
  </div>
  <Reminder/>
 </main>;
}
