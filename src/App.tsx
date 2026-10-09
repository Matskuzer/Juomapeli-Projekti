import {useState} from 'react';
import type {Player,KingMode} from './games/cheers/cheersTypes';
import CheersGame from './games/cheers/CheersGame';
import RavitGame from './games/ravit/RavitGame';
import Home,{type GameId} from './pages/Home';
import Setup from './pages/Setup';
type Screen='home'|'setup'|'game';
export default function App(){
 const [screen,setScreen]=useState<Screen>('home');
 const [selectedGame,setSelectedGame]=useState<GameId>('cheers');
 const [players,setPlayers]=useState<Player[]>([]);
 const [kingMode,setKingMode]=useState<KingMode>('cup');
 const [run,setRun]=useState(0);
 if(screen==='home')return <Home onStart={game=>{setSelectedGame(game);setScreen('setup');}}/>;
 if(screen==='setup')return <Setup players={players} setPlayers={setPlayers} kingMode={kingMode} setKingMode={setKingMode} minPlayers={selectedGame==='ravit'?2:3} showGender={selectedGame==='cheers'} showKingOptions={selectedGame==='cheers'} onBack={()=>setScreen('home')} onPlay={()=>{setRun(r=>r+1);setScreen('game');}}/>;
 if(selectedGame==='ravit')return <RavitGame key={run} players={players} onExit={()=>setScreen('setup')} onRestart={()=>setRun(r=>r+1)}/>;
 return <CheersGame key={run} players={players} kingMode={kingMode} onExit={()=>setScreen('setup')} onRestart={()=>setRun(r=>r+1)}/>;
}
