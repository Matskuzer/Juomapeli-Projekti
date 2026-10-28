export type CasePlayer={id:string;name:string};
export type Rarity='standard'|'rare'|'epic'|'legendary'|'mythic';
export type CaseSkin={player:CasePlayer;rarity:Rarity};
export type CaseRoll={items:CaseSkin[];winner:CaseSkin};

export const ROLL_STOP_INDEX=34;
const ROLL_LENGTH=40;
const RARITIES:readonly Rarity[]=['standard','rare','epic','legendary','mythic'];
export const RARITY_ODDS:Record<Rarity,number>={
 standard:55,
 rare:25,
 epic:13,
 legendary:4,
 mythic:3,
};

function randomValue(random:()=>number):number{
 const value=random();
 if(!Number.isFinite(value)||value<0||value>=1)throw new RangeError('Random value must be between 0 and 1.');
 return value;
}

function randomRarity(random:()=>number):Rarity{
 const value=randomValue(random)*100;
 let threshold=0;
 for(const rarity of RARITIES){
  threshold+=RARITY_ODDS[rarity];
  if(value<threshold)return rarity;
 }
 return 'mythic';
}

export function createCaseRoll(players:CasePlayer[],random:()=>number=Math.random):CaseRoll{
 if(players.length<2)throw new RangeError('Add at least two players before opening the case.');
 const winnerPlayer=players[Math.floor(randomValue(random)*players.length)];
 const items=Array.from({length:ROLL_LENGTH},(_,index)=>({
  player:index===ROLL_STOP_INDEX?winnerPlayer:players[Math.floor(randomValue(random)*players.length)],
  rarity:randomRarity(random),
 }));
 return {items,winner:items[ROLL_STOP_INDEX]};
}

export const RARITY_STYLES:Record<Rarity,{label:string;frame:string;glow:string;text:string}>={
 standard:{label:'STANDARD',frame:'border-sky-300/80 bg-gradient-to-br from-sky-900 via-slate-900 to-slate-950',glow:'shadow-[0_0_24px_-8px_#7dd3fc]',text:'text-sky-300'},
 rare:{label:'RARE',frame:'border-blue-600/80 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950',glow:'shadow-[0_0_24px_-8px_#2563eb]',text:'text-blue-400'},
 epic:{label:'EPIC',frame:'border-pink-400/80 bg-gradient-to-br from-pink-950 via-slate-900 to-slate-950',glow:'shadow-[0_0_24px_-8px_#f472b6]',text:'text-pink-300'},
 legendary:{label:'LEGENDARY',frame:'border-red-500/80 bg-gradient-to-br from-red-950 via-slate-900 to-slate-950',glow:'shadow-[0_0_24px_-8px_#ef4444]',text:'text-red-400'},
 mythic:{label:'MYTHIC',frame:'border-yellow-300 bg-gradient-to-br from-yellow-500/40 via-yellow-950 to-slate-950',glow:'shadow-[0_0_38px_-4px_#facc15]',text:'text-yellow-300'},
};

export const CASE_RARITIES=RARITIES;
