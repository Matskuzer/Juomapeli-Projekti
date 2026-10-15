import {useState} from 'react';
import type {Player,KingMode} from './games/hitler/hitlerTypes';
import HitlerGame from './games/hitler/HitlerGame';
import HigherLowerGame from './games/higher-lower/HigherLowerGame';
import Home from './pages/Home';
import Setup from './pages/Setup';
type Screen='home'|'setup'|'game';
export type Game='hitler'|'higher-lower';
export default function App(){
 const [screen,setScreen]=useState<Screen>('home');
 const [game,setGame]=useState<Game>('hitler');
 const [players,setPlayers]=useState<Player[]>([]);
 const [kingMode,setKingMode]=useState<KingMode>('cup');
 const [run,setRun]=useState(0);
 if(screen==='home')return <Home onStart={selectedGame=>{setGame(selectedGame);setScreen('setup');}}/>;
 if(screen==='setup')return <Setup game={game} players={players} setPlayers={setPlayers} kingMode={kingMode} setKingMode={setKingMode} onBack={()=>setScreen('home')} onPlay={()=>{setRun(r=>r+1);setScreen('game');}}/>;
 if(game==='higher-lower')return <HigherLowerGame key={run} players={players} onExit={()=>setScreen('setup')} onRestart={()=>setRun(r=>r+1)}/>;
 return <HitlerGame key={run} players={players} kingMode={kingMode} onExit={()=>setScreen('setup')} onRestart={()=>setRun(r=>r+1)}/>;
}
