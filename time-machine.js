/* =========================================================
   CALCULUS — TIME MACHINE : TEMPORAL LAB ENGINE
   New experience: exploration + quick decisions + collection
   + procedural anomalies + persistent progress.
========================================================= */
const page=document.getElementById("timeMachine");

if(page){
const eras=[
 {year:-250,name:"Archimedes",short:"ARCH",symbol:"△",fact:"Archimedes used exhaustion to reason about areas and volumes long before modern calculus notation existed.",event:"A METHOD WITHOUT CALCULUS",color:"ancient"},
 {year:1635,name:"Cavalieri",short:"CAV",symbol:"▱",fact:"Cavalieri's principle compares figures through corresponding cross-sectional measurements.",event:"INFINITESIMALS ARE APPROACHING",color:"classic"},
 {year:1665,name:"Newton",short:"NEW",symbol:"ẋ",fact:"Newton developed fluxional methods in the 1660s while investigating motion and changing quantities.",event:"FLUXION SIGNAL DETECTED",color:"classic"},
 {year:1684,name:"Leibniz",short:"LEI",symbol:"∂",fact:"Leibniz published his differential calculus in 1684, with notation that became enormously influential.",event:"A NEW LANGUAGE FOR CHANGE",color:"classic"},
 {year:1748,name:"Euler",short:"EUL",symbol:"Σ",fact:"Euler's work pushed infinite series and symbolic analysis into remarkably powerful territory.",event:"THE SYMBOL ENGINE IS OVERHEATING",color:"classic"},
 {year:1821,name:"Cauchy",short:"CAU",symbol:"ε",fact:"Cauchy helped turn limits, continuity and convergence into explicit objects of rigorous analysis.",event:"RIGOR HAS ENTERED THE MACHINE",color:"rigor"},
 {year:1872,name:"Weierstrass",short:"WEI",symbol:"∀",fact:"Weierstrass became central to the precise epsilon-based style of nineteenth-century analysis.",event:"THE ε-ENGINE IS FULLY ONLINE",color:"rigor"},
 {year:1902,name:"Lebesgue",short:"LEB",symbol:"∫",fact:"Lebesgue's theory changed how mathematicians measure sets and integrate complicated functions.",event:"THE INTEGRAL HAS EVOLVED",color:"modern"},
 {year:1948,name:"Shannon",short:"SHA",symbol:"H",fact:"Information theory introduced a mathematical language for quantifying information and communication.",event:"INFORMATION DETECTED",color:"modern"},
 {year:1965,name:"Kalman",short:"KAL",symbol:"K",fact:"Kalman filtering brought state estimation into a powerful mathematical framework used in engineering and beyond.",event:"THE FUTURE IS ESTIMATING",color:"modern"},
 {year:1993,name:"Fractals",short:"FRA",symbol:"∞",fact:"Fractal geometry made self-similarity and irregular structures central mathematical objects.",event:"THE SHAPE HAS NO END",color:"modern"},
 {year:2026,name:"Now",short:"NOW",symbol:"∫",fact:"You are here. The machine is not showing history anymore — it is turning your choices into the next experiment.",event:"PRESENT MOMENT LOCKED",color:"now"}
];

const anomalies=[
 {q:"Which event could NOT belong at the selected coordinate?",answers:[
  ["A","Archimedes studies geometry","ancient"],
  ["B","A modern computer runs a simulation","future"],
  ["C","A theorem is proved","timeless"],
  ["D","Someone writes a mathematical argument","timeless"]
 ],correct:1},
 {q:"Which notation would be suspiciously out of place in the Ancient Greece coordinate?",answers:[
  ["A","Area ratios","old"],
  ["B","Geometric diagrams","old"],
  ["C","A formal epsilon-delta definition","future"],
  ["D","Proportions","old"]
 ],correct:2},
 {q:"Which claim is the temporal anomaly?",answers:[
  ["A","Newton investigated changing quantities","valid"],
  ["B","Leibniz published differential calculus in 1684","valid"],
  ["C","Euler worked with infinite series","valid"],
  ["D","Cauchy wrote a 21st-century web application","future"]
 ],correct:3},
 {q:"A mathematical object appears before its historical setting. Which is the intruder?",answers:[
  ["A","Method of exhaustion","early"],
  ["B","Cross-sectional reasoning","early"],
  ["C","Measure-theoretic integration","later"],
  ["D","Geometric proof","early"]
 ],correct:2},
 {q:"The machine detects one statement that is deliberately too modern.",answers:[
  ["A","Studying limits","analysis"],
  ["B","Comparing areas","geometry"],
  ["C","Defining a neural-network optimizer","future"],
  ["D","Manipulating a series","analysis"]
 ],correct:2}
];

const artifacts=[
 ["△","THE EXHAUSTION SEAL"],["▱","THE INDIVISIBLE"],["ẋ","THE FLUXION"],["∂","THE DIFFERENTIAL"],["Σ","THE SERIES"],["ε","THE RIGOR KEY"],["∀","THE QUANTIFIER"],["∫","THE MEASURE KEY"],["H","THE INFORMATION KEY"],["K","THE STATE KEY"],["∞","THE FRACTAL KEY"],["NOW","THE PRESENT KEY"]
];

const $=id=>document.getElementById(id);
let eraIndex=2,score=0,streak=0,jumps=0,energy=100,artifactSet=new Set(),gameSolved=0,game=null;
let session=JSON.parse(localStorage.getItem("tmLabSession")||"null");
if(session){
 score=session.score||0;streak=session.streak||0;jumps=session.jumps||0;
 energy=typeof session.energy==="number"?session.energy:100;
 artifactSet=new Set(session.artifacts||[]);
 gameSolved=session.gameSolved||0;
}

function year(y){return y<0?Math.abs(y)+" BCE":y+" CE";}
function rand(n){return Math.floor(Math.random()*n);}
function save(){
 localStorage.setItem("tmLabSession",JSON.stringify({score,streak,jumps,energy,artifacts:[...artifactSet],gameSolved}));
}
function toast(message){
 const t=$("toast");t.textContent=message;t.classList.add("show");
 clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),1700);
}
function flash(){
 const f=$("flash");f.classList.remove("on");void f.offsetWidth;f.classList.add("on");
}
function renderHUD(){
 const e=eras[eraIndex];
 $("eraName").textContent=e.year<0?year(e.year)+" · "+e.name:year(e.year)+" · "+e.name;
 $("score").textContent=String(score).padStart(4,"0");
 $("streak").textContent=streak;
 $("jumps").textContent=jumps;
 $("artifacts").textContent=artifactSet.size+"/"+artifacts.length;
 $("energy").style.width=energy+"%";
 $("status").textContent="TEMPORAL LOCK · "+year(e.year);
 $("core").textContent=e.symbol;
 $("eraFact").textContent=e.fact;
 $("eventTitle").textContent=e.event;
}
function renderSymbols(){
 const box=$("symbols");box.innerHTML="";
 const symbols=["∫","∑","∂","ε","∞","dx","f(x)","Rⁿ","∇","∀","λ","lim"];
 for(let i=0;i<12;i++){
  const s=document.createElement("span");s.className="tm-symbol";s.textContent=symbols[i];
  s.style.left=(8+rand(84))+"%";s.style.top=(8+rand(84))+"%";
  s.style.animationDelay=(-Math.random()*6)+"s";
  s.style.animationDuration=(4+Math.random()*5)+"s";
  box.appendChild(s);
 }
}
function renderTimeline(){
 const box=$("timeline");box.innerHTML="";
 eras.forEach((e,i)=>{
  const n=document.createElement("button");n.className="tm-node"+(i===eraIndex?" active":"");
  n.style.left=(4+(i/(eras.length-1))*92)+"%";
  n.innerHTML="<em>"+e.short+"</em><label>"+year(e.year)+"</label>";
  n.title=e.name+" · "+year(e.year);
  n.onclick=()=>jumpTo(i,true);
  box.appendChild(n);
 });
}
function renderCollection(){
 const box=$("collection");box.innerHTML="";
 artifacts.forEach((a,i)=>{
  const d=document.createElement("div");d.className="tm-chip"+(artifactSet.has(i)?" unlocked":"");
  d.title=a[1];
  d.innerHTML="<b>"+a[0]+"</b>"+(artifactSet.has(i)?"FOUND":"LOCKED");
  box.appendChild(d);
 });
}
function logJump(){
 const row=document.createElement("div");row.className="tm-log-row";
 row.innerHTML="<span>"+eras[eraIndex].name+"</span><b>"+(streak?"STREAK "+streak:"JUMP")+"</b>";
 $("log").prepend(row);
 while($("log").children.length>6)$("log").lastChild.remove();
}
function unlockArtifact(){
 const candidates=eras.map((_,i)=>i).filter(i=>!artifactSet.has(i));
 if(!candidates.length)return;
 const i=candidates[rand(candidates.length)];
 artifactSet.add(i);
 renderCollection();
 toast("Artifact recovered: "+artifacts[i][1]);
}
function jumpTo(index,manual=false){
 eraIndex=(index+eras.length)%eras.length;
 jumps++;
 energy=Math.max(0,energy-2);
 if(manual)score+=5;
 page.classList.remove("jumping");$("machine").classList.remove("warping");void page.offsetWidth;
 page.classList.add("jumping");$("machine").classList.add("warping");flash();
 setTimeout(()=>{$("machine").classList.remove("warping");page.classList.remove("jumping")},900);
 if(jumps%4===0)unlockArtifact();
 renderHUD();renderTimeline();logJump();newAnomaly();save();
}
function randomJump(){
 let next=rand(eras.length);
 while(next===eraIndex)next=rand(eras.length);
 jumpTo(next,false);
 toast("Coordinates acquired: "+year(eras[next].year));
}
function makeAnomaly(){
 const source=anomalies[rand(anomalies.length)];
 game={...source,answers:source.answers.map(x=>x.slice())};
 const options=game.answers.map((a,i)=>({a,i})).sort(()=>Math.random()-.5);
 $("gameTitle").textContent="Catch the Impossible";
 $("gamePrompt").textContent=game.q;
 const box=$("choices");box.innerHTML="";
 options.forEach(({a,i})=>{
  const b=document.createElement("button");b.className="tm-choice";
  b.innerHTML="<b>"+a[0]+" · "+a[1]+"</b><span>"+a[2]+"</span>";
  b.onclick=()=>answerAnomaly(i,b);
  box.appendChild(b);
 });
 $("result").textContent="";$("result").className="tm-result";
}
function answerAnomaly(index,button){
 if(!game)return;
 const buttons=[...$("choices").children];buttons.forEach(b=>b.disabled=true);
 if(index===game.correct){
  const points=40+streak*10+Math.min(50,gameSolved*2);
  score+=points;streak++;gameSolved++;energy=Math.min(100,energy+4);
  $("result").textContent="ANOMALY CONTAINED · +"+points;
  $("result").className="tm-result good";
  page.classList.add("success");setTimeout(()=>page.classList.remove("success"),650);
  if(streak%3===0)unlockArtifact();
  toast("Temporal accuracy increased");
 }else{
  score=Math.max(0,score-10);streak=0;energy=Math.max(0,energy-12);
  $("result").textContent="MISSED · the timeline keeps moving.";
  $("result").className="tm-result bad";
  toast("The anomaly escaped.");
 }
 renderHUD();renderCollection();save();
}
function newAnomaly(){makeAnomaly();}
$("jump").onclick=randomJump;
$("newGame").onclick=newAnomaly;
$("rewind").onclick=()=>{
 score=0;streak=0;jumps=0;energy=100;artifactSet.clear();gameSolved=0;$("log").innerHTML="";
 eraIndex=0;renderHUD();renderTimeline();renderCollection();newAnomaly();save();toast("Timeline rewound. Fresh run.");
};
document.addEventListener("keydown",e=>{
 if(e.target.matches("input,textarea,select"))return;
 if(e.key.toLowerCase()==="r")randomJump();
 if(e.key.toLowerCase()==="n")newAnomaly();
 if(e.key==="ArrowLeft")jumpTo(eraIndex-1,true);
 if(e.key==="ArrowRight")jumpTo(eraIndex+1,true);
});
renderSymbols();renderHUD();renderTimeline();renderCollection();newAnomaly();
}