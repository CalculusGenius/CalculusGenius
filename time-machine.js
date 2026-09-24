/* CALCULUS TIME MACHINE — interactive temporal arcade */
const root=document.getElementById("tm");
if(root){
const eras=[
{y:-250,n:"Archimedes",s:"△",f:"Archimedes used the method of exhaustion to reason about areas and volumes.",t:"GEOMETRY BEFORE CALCULUS",desc:"A world of geometric arguments is about to become a world of changing quantities."},
{y:1635,n:"Cavalieri",s:"▱",f:"Cavalieri's principle compares figures through corresponding cross-sections.",t:"THE INDIVISIBLES ARRIVE",desc:"Geometry is beginning to flirt with infinitely thin pieces."},
{y:1665,n:"Newton",s:"ẋ",f:"Newton developed fluxional methods in the 1660s while investigating motion and changing quantities.",t:"THE FLUXION ERA",desc:"Changing quantities are becoming a new mathematical language."},
{y:1684,n:"Leibniz",s:"∂",f:"Leibniz published his differential calculus in 1684 and introduced influential notation.",t:"A LANGUAGE FOR CHANGE",desc:"A few symbols are about to become part of mathematics forever."},
{y:1748,n:"Euler",s:"Σ",f:"Euler's work made infinite series and symbolic analysis extraordinarily powerful.",t:"THE SYMBOL EXPLOSION",desc:"Equations are becoming compact enough to hide entire theories inside them."},
{y:1821,n:"Cauchy",s:"ε",f:"Cauchy helped make limits, continuity and convergence explicit objects of analysis.",t:"RIGOR DETECTED",desc:"The machine is demanding precision. Intuition alone is no longer enough."},
{y:1872,n:"Weierstrass",s:"∀",f:"Weierstrass became central to the precise epsilon-based style of nineteenth-century analysis.",t:"THE ε-ENGINE",desc:"Every vague phrase is being replaced by a precise statement."},
{y:1902,n:"Lebesgue",s:"∫",f:"Lebesgue's theory transformed the treatment of measure and integration.",t:"THE INTEGRAL EVOLVES",desc:"The machine can now integrate objects classical calculus struggled to handle."},
{y:1948,n:"Shannon",s:"H",f:"Information theory gave a mathematical framework for quantifying information.",t:"INFORMATION DETECTED",desc:"Mathematics is no longer only describing shapes and motion."},
{y:1965,n:"Kalman",s:"K",f:"Kalman filtering created a powerful framework for estimating hidden states from noisy data.",t:"THE STATE ESTIMATOR",desc:"The machine learns to infer what it cannot directly see."},
{y:1993,n:"Fractals",s:"∞",f:"Fractal geometry made self-similarity and irregular structures central mathematical objects.",t:"NO ENDPOINT FOUND",desc:"The shape keeps revealing structure at smaller scales."},
{y:2026,n:"Now",s:"∫",f:"You are here. The machine turns your choices into the next experiment.",t:"PRESENT MOMENT",desc:"The next mathematical idea has not happened yet. You are standing before it."}
];
const missions=[
{q:"Which object is the intruder in an Ancient Greece setting?",a:[["A","Method of exhaustion","geometry"],["B","Geometric proof","geometry"],["C","Measure-theoretic integration","anachronism"],["D","Area comparison","geometry"]],c:2},
{q:"Which item is suspiciously early for the Newton coordinate?",a:[["A","Fluxional methods","period"],["B","Study of motion","period"],["C","Differential notation","period"],["D","A modern neural-network optimizer","future"]],c:3},
{q:"Find the statement that does not belong in the Cauchy era.",a:[["A","Limits","analysis"],["B","Continuity","analysis"],["C","Convergence","analysis"],["D","A 21st-century web browser","future"]],c:3},
{q:"The machine detects one deliberate historical glitch.",a:[["A","Infinite series near Euler","plausible"],["B","Epsilon language near Weierstrass","plausible"],["C","Lebesgue integration in Ancient Greece","glitch"],["D","Geometric arguments near Archimedes","plausible"]],c:2},
{q:"Which idea is too modern for the Leibniz coordinate?",a:[["A","Differentials","period"],["B","Calculus notation","period"],["C","State-space estimation","future"],["D","Infinite sums","mathematical"]],c:2}
];
const relics=["△","▱","ẋ","∂","Σ","ε","∀","∫","H","K","∞","NOW"];
const bridges={
"0-2":"Geometry → changing quantities: exhaustion supplies an early path toward thinking about area and limiting processes; Newton turns change itself into a central object.",
"2-3":"Newton ↔ Leibniz: fluxions and differentials became two historically distinct languages for calculus.",
"3-4":"Leibniz → Euler: compact calculus notation feeds a rapidly expanding symbolic culture.",
"4-5":"Euler → Cauchy: powerful symbolic manipulation is followed by a stronger demand for limits and convergence.",
"5-6":"Cauchy → Weierstrass: the language of limits becomes increasingly precise and systematic.",
"6-7":"Weierstrass → Lebesgue: rigorous analysis prepares the ground for more flexible theories of measure and integration.",
"7-8":"Lebesgue → Shannon: mathematical abstraction moves from integration and measure toward quantifying information.",
"8-9":"Shannon → Kalman: probability, linear systems and computation meet in state estimation.",
"9-10":"Kalman → Fractals: mathematical models increasingly interact with complex, irregular and multiscale phenomena.",
"10-11":"Fractals → Now: the machine leaves the museum and becomes an experimental playground."
};
const $=id=>document.getElementById(id);
const fmt=y=>y<0?Math.abs(y)+" BCE":y+" CE";
let state=JSON.parse(localStorage.getItem("tmArcade")||"null")||{era:2,xp:0,streak:0,best:0,jumps:0,energy:100,found:[],bridges:0,run:1};
state.found=new Set(state.found||[]);
let mission=null;

function save(){localStorage.setItem("tmArcade",JSON.stringify({...state,found:[...state.found]}))}
function toast(x){const t=$("toast");t.textContent=x;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),1600)}
function flash(){const f=$("flash");f.classList.remove("on");void f.offsetWidth;f.classList.add("on")}
function renderFloaters(){
 const box=$("floaters");box.innerHTML="";
 ["∫","∑","∂","ε","∞","dx","f(x)","Rⁿ","∇","∀","λ","lim"].forEach((x,i)=>{
  const s=document.createElement("span");s.textContent=x;s.style.left=(8+(i*37)%84)+"%";s.style.top=(9+(i*61)%82)+"%";s.style.animationDelay=(-i*.43)+"s";s.style.animationDuration=(4.5+(i%4))+"s";box.appendChild(s)
 })
}
function render(){
 const e=eras[state.era];
 $("destination").textContent=fmt(e.y)+" · "+e.n.toUpperCase();
 $("coordinate").textContent="TEMPORAL LOCK · "+fmt(e.y);
 $("symbol").textContent=e.s;$("eraTitle").textContent=e.t;$("eraText").textContent=e.desc;$("fact").textContent=e.f;
 $("xp").textContent=String(state.xp).padStart(4,"0");$("streak").textContent=state.streak;$("jumps").textContent=state.jumps;
 $("relicCount").textContent=state.found.size+" / 12";$("energy").style.width=state.energy+"%";
 $("runNo").textContent=String(state.run).padStart(3,"0");$("runStat").textContent=state.run;$("bestStat").textContent=state.best;$("bridgeStat").textContent=state.bridges;
 document.querySelectorAll(".tm-era").forEach((b,i)=>b.classList.toggle("active",i===state.era));
 document.querySelectorAll(".tm-relic").forEach((b,i)=>{b.classList.toggle("found",state.found.has(i));b.textContent=state.found.has(i)?relics[i]:"?";});
}
function timeline(){
 const box=$("timeline");box.innerHTML="";
 eras.forEach((e,i)=>{
  const b=document.createElement("button");b.className="tm-era"+(i===state.era?" active":"");b.innerHTML='<div class="tm-era-dot"></div><strong>'+e.n+'</strong><small>'+fmt(e.y)+'</small>';b.onclick=()=>jump(i,true);box.appendChild(b)
 })
}
function selects(){
 ["fromEra","toEra"].forEach(id=>{
  const s=$(id);s.innerHTML="";
  eras.forEach((e,i)=>{const o=document.createElement("option");o.value=i;o.textContent=e.n+" · "+fmt(e.y);s.appendChild(o)})
 });
 $("fromEra").value=state.era;$("toEra").value=(state.era+1)%eras.length;
}
function relic(i){
 if(state.found.has(i))return;
 state.found.add(i);render();save();toast("RELIC RECOVERED · "+relics[i])
}
function maybeRelic(){
 if(state.jumps%3===0 && state.found.size<12)relic([...Array(12).keys()].filter(i=>!state.found.has(i))[Math.floor(Math.random()*[...Array(12).keys()].filter(i=>!state.found.has(i)).length)])
}
function jump(i,manual){
 state.era=(i+eras.length)%eras.length;state.jumps++;state.energy=Math.max(0,state.energy-3);
 if(manual)state.xp+=8;
 if(state.jumps%3===0)maybeRelic();
 root.classList.remove("tm-jumpfx");void root.offsetWidth;root.classList.add("tm-jumpfx");flash();
 render();timeline();save();toast("COORDINATES LOCKED · "+eras[state.era].n.toUpperCase());
 setTimeout(()=>root.classList.remove("tm-jumpfx"),850);
}
function randomJump(){
 let i=Math.floor(Math.random()*eras.length);while(i===state.era)i=Math.floor(Math.random()*eras.length);jump(i,false)
}
function newMission(){
 const base=missions[Math.floor(Math.random()*missions.length)];
 mission={...base};
 $("missionPrompt").textContent=mission.q;$("feedback").textContent="";
 const box=$("choices");box.innerHTML="";
 mission.a.map((x,i)=>({x,i})).sort(()=>Math.random()-.5).forEach(({x,i})=>{
  const b=document.createElement("button");b.className="tm-choice";b.innerHTML="<b>"+x[0]+" · "+x[1]+"</b><span>"+x[2]+"</span>";b.onclick=()=>answer(i,b);box.appendChild(b)
 })
}
function answer(i,b){
 [...$("choices").children].forEach(x=>x.disabled=true);
 if(i===mission.c){
  const gain=35+state.streak*8;state.xp+=gain;state.streak++;state.best=Math.max(state.best,state.streak);state.energy=Math.min(100,state.energy+5);
  $("feedback").textContent="ANOMALY CONTAINED · +"+gain+" XP";$("feedback").className="tm-feedback good";toast("TIMELINE STABILIZED");
  if(state.streak%3===0)maybeRelic();
 }else{
  state.xp=Math.max(0,state.xp-12);state.streak=0;state.energy=Math.max(0,state.energy-15);$("feedback").textContent="MISSED · the timeline changed.";toast("ANOMALY ESCAPED")
 }
 render();save()
}
function bridge(){
 const a=+$("fromEra").value,b=+$("toEra").value;
 if(a===b){$("bridgeResult").textContent="A bridge needs two different destinations.";return}
 const key=a<b?a+"-"+b:b+"-"+a;
 const text=bridges[key]||("No single historical bridge is encoded for "+eras[a].n+" → "+eras[b].n+". Try another pair and let the machine find a more direct connection.");
 $("bridgeResult").textContent=text;
 state.bridges++;state.xp+=15;state.energy=Math.max(0,state.energy-4);render();save();toast("CAUSALITY BRIDGE ACTIVATED · +15 XP")
}
function renderRelics(){
 const box=$("relics");box.innerHTML="";
 relics.forEach((x,i)=>{const b=document.createElement("div");b.className="tm-relic"+(state.found.has(i)?" found":"");b.textContent=state.found.has(i)?x:"?";b.title=state.found.has(i)?"Recovered relic":"Locked relic";box.appendChild(b)})
}
$("randomJump").onclick=randomJump;$("newMission").onclick=newMission;$("bridgeBtn").onclick=bridge;
$("fromEra").onchange=()=>{};$("toEra").onchange=()=>{};
document.addEventListener("keydown",e=>{
 if(e.target.matches("input,textarea,select"))return;
 if(e.key==="ArrowLeft")jump(state.era-1,true);
 if(e.key==="ArrowRight")jump(state.era+1,true);
 if(e.key.toLowerCase()==="r")randomJump();
 if(e.key.toLowerCase()==="m")newMission();
});
$("rewind")?.remove();
renderFloaters();timeline();selects();renderRelics();render();newMission();save();
}