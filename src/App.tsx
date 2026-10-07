import {useState} from 'react';
import type {Player,KingMode} from './games/hitler/hitlerTypes';
import HitlerGame from './games/hitler/HitlerGame';
import Home from './pages/Home';
import Setup from './pages/Setup';
type Screen='home'|'setup'|'game';
export default function App(){
 const [screen,setScreen]=useState<Screen>('home');
 const [players,setPlayers]=useState<Player[]>([]);
 const [kingMode,setKingMode]=useState<KingMode>('cup');
 const [run,setRun]=useState(0);
 if(screen==='home')return <Home onStart={()=>setScreen('setup')}/>;
 if(screen==='setup')return <Setup players={players} setPlayers={setPlayers} kingMode={kingMode} setKingMode={setKingMode} onBack={()=>setScreen('home')} onPlay={()=>{setRun(r=>r+1);setScreen('game');}}/>;
 return <HitlerGame key={run} players={players} kingMode={kingMode} onExit={()=>setScreen('setup')} onRestart={()=>setRun(r=>r+1)}/>;
}
