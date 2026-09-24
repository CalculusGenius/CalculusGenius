/* =========================================================
   CALCULUS — TIME MACHINE / SUM VAULT ENGINE
========================================================= */
const page=document.getElementById("timeMachine");
if(page){
const eras=[
 {key:"archimedes",year:-250,name:"Archimedes",era:"Ancient Greece",symbol:"△",fact:"Archimedes used the method of exhaustion to obtain increasingly accurate areas and volumes.",base:1},
 {key:"cavalieri",year:1635,name:"Cavalieri",era:"Indivisibles",symbol:"▱",fact:"Cavalieri's principle compares solids by their corresponding cross-sectional areas.",base:2},
 {key:"newton",year:1665,name:"Newton",era:"Fluxions",symbol:"ẋ",fact:"Newton developed fluxional methods in the 1660s while studying changing quantities and motion.",base:3},
 {key:"leibniz",year:1684,name:"Leibniz",era:"Differentials",symbol:"∂",fact:"Leibniz published his differential calculus in 1684 and introduced influential notation.",base:4},
 {key:"euler",year:1748,name:"Euler",era:"18th-century analysis",symbol:"Σ",fact:"Euler's work made infinite series and symbolic analysis central tools of mathematics.",base:5},
 {key:"cauchy",year:1821,name:"Cauchy",era:"Rigorous analysis",symbol:"ε",fact:"Cauchy helped make limits, continuity and convergence explicit parts of analysis.",base:6},
 {key:"weierstrass",year:1872,name:"Weierstrass",era:"Arithmetization",symbol:"∀",fact:"Weierstrass became central to the precise epsilon-based style of nineteenth-century analysis.",base:7},
 {key:"modern",year:2026,name:"Modern Analysis",era:"Present day",symbol:"∫",fact:"Modern analysis combines many frameworks, including real analysis, measure theory and functional analysis.",base:8}
];
const modes=[
 {key:"mental",name:"Mental Sprint",desc:"Fast arithmetic",weight:1},
 {key:"series",name:"Series Vault",desc:"Summation puzzles",weight:2},
 {key:"derivative",name:"Derivative Run",desc:"Rates of change",weight:2},
 {key:"boss",name:"Boss Sum",desc:"Hard mixed challenge",weight:4}
];
const $=id=>document.getElementById(id);
const eraList=$("eraList"),modeList=$("modeList"),question=$("question"),answer=$("answerInput"),feedback=$("feedback"),history=$("history");
let currentEra=2,currentMode=0,currentChallenge=null,score=0,streak=0,combo=0,stability=100,xp=0,level=1,answered=false;
const discoveries=new Set(JSON.parse(localStorage.getItem("tmDiscoveries")||"[]"));
const saved=JSON.parse(localStorage.getItem("tmSession")||"null");
if(saved){score=saved.score||0;streak=saved.streak||0;combo=saved.combo||0;stability=typeof saved.stability==="number"?saved.stability:100;xp=saved.xp||0;level=saved.level||1;}

function save(){localStorage.setItem("tmSession",JSON.stringify({score,streak,combo,stability,xp,level}));localStorage.setItem("tmDiscoveries",JSON.stringify([...discoveries]));}
function fmtYear(y){return y<0?Math.abs(y)+" BCE":y+" CE";}
function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function gcd(a,b){while(b){[a,b]=[b,a%b]}return Math.abs(a)}
function frac(n,d){const g=gcd(n,d);return [n/g,d/g]}
function makeSeries(){
 const n=rand(3,8),a=rand(1,6),d=rand(1,5),sum=n*(2*a+(n-1)*d)/2;
 return {text:"Find the sum: "+Array.from({length:n},(_,i)=>a+i*d).join(" + ")+" .",answer:String(sum),type:"SERIES"};
}
function makeGeometric(){
 const a=rand(1,5),r=rand(2,4),n=rand(3,5),sum=a*(Math.pow(r,n)-1)/(r-1);
 return {text:"Find the finite geometric sum: "+a+" + "+a*r+" + … + "+a*Math.pow(r,n-1)+" .",answer:String(sum),type:"SERIES"};
}
function makeMental(){
 const a=rand(8,45),b=rand(3,18),c=rand(2,9),ans=a*b+c;
 return {text:"Calculate: ("+a+" × "+b+") + "+c+" .",answer:String(ans),type:"MENTAL"};
}
function makeDerivative(){
 const a=rand(2,9),n=rand(2,5),x=rand(1,4),ans=a*n*Math.pow(x,n-1);
 return {text:"If f(x) = "+a+"x^"+n+", find f'("+x+").",answer:String(ans),type:"DERIVATIVE"};
}
function makeLimit(){
 const a=rand(2,9),b=rand(1,7);
 return {text:"Evaluate lim(x→"+b+") (x² − "+(b*b)+")/(x − "+b+").",answer:String(2*b),type:"LIMIT"};
}
function makeIntegral(){
 const n=rand(1,4),x=rand(1,4),ans=frac(Math.pow(x,n+1),n+1);
 const val=ans[1]===1?String(ans[0]):ans[0]+"/"+ans[1];
 return {text:"Evaluate ∫₀^"+x+" t^"+n+" dt.",answer:val,type:"INTEGRAL"};
}
function makeBoss(){
 const a=rand(2,6),n=rand(2,4),x=rand(2,4),sum=Array.from({length:n},(_,i)=>a+i).reduce((s,v)=>s+v*v,0);
 return {text:"BOSS: Compute (1² + 2² + … + "+n+"²) × "+a+" − "+x+" .",answer:String(sum*a-x),type:"BOSS"};
}
function makeChallenge(){
 const mode=modes[currentMode].key;
 let c;
 if(mode==="mental")c=makeMental();
 else if(mode==="series")c=Math.random()<.5?makeSeries():makeGeometric();
 else if(mode==="derivative")c=Math.random()<.65?makeDerivative():makeLimit();
 else c=Math.random()<.5?makeBoss():makeIntegral();
 const difficulty=Math.min(5,1+Math.floor((level-1)/2)+Math.floor(streak/4));
 c.difficulty=difficulty;
 return c;
}
function renderLists(){
 eraList.innerHTML="";
 eras.forEach((e,i)=>{const b=document.createElement("button");b.className="tm-era-btn"+(i===currentEra?" active":"");b.innerHTML=e.name+" <span style='float:right;opacity:.4'>"+fmtYear(e.year)+"</span>";b.onclick=()=>jumpTo(i);eraList.appendChild(b)});
 modeList.innerHTML="";
 modes.forEach((m,i)=>{const b=document.createElement("button");b.className="tm-mode-btn"+(i===currentMode?" active":"");b.textContent=m.name;b.title=m.desc;b.onclick=()=>{currentMode=i;renderLists();newChallenge()};modeList.appendChild(b)});
}
function updateStats(){
 $("score").textContent=String(score).padStart(4,"0");
 $("streak").textContent=streak+" ×";
 $("level").textContent=level;
 $("combo").childNodes[0].nodeValue=combo+" ";
 $("missionStat").textContent=eras[currentEra].name+" · "+fmtYear(eras[currentEra].year);
 $("stabilityValue").textContent=stability+"%";$("stabilityFill").style.width=stability+"%";
 const needed=level*100,p=Math.min(100,Math.round(xp/needed*100));
 $("xpValue").textContent=p+"%";$("xpFill").style.width=p+"%";$("xpSideFill").style.width=p+"%";
 $("coordinateStatus").textContent="TEMPORAL LOCK • "+fmtYear(eras[currentEra].year);
}
function discovery(){
 const e=eras[currentEra];
 if(!discoveries.has(e.key)){discoveries.add(e.key);$("discovery").innerHTML="<strong>Discovery unlocked:</strong> "+e.fact;save()}
 else $("discovery").innerHTML="<strong>Era fact:</strong> "+e.fact;
}
function newChallenge(){
 answered=false;currentChallenge=makeChallenge();
 $("challengeEra").textContent=eras[currentEra].name+" • "+eras[currentEra].era;
 $("challengeTitle").textContent=currentMode===3?"BOSS SUM":"The Sum Vault";
 $("difficulty").textContent=["WARM-UP","STEADY","SHARP","HARD","BOSS"][Math.min(4,currentChallenge.difficulty-1)];
 $("promptLabel").textContent=currentChallenge.type+" • CHALLENGE";
 question.textContent=currentChallenge.text;
 answer.value="";feedback.textContent="";feedback.className="tm-feedback";
 $("coreSymbol").textContent=eras[currentEra].symbol;
 updateStats();discovery();
}
function addHistory(ok,points){
 const item=document.createElement("div");item.className="tm-history-item";item.innerHTML="<span>"+eras[currentEra].name+" · "+currentChallenge.type+"</span><b>"+(ok?"+"+points:"MISS")+"</b>";history.prepend(item);while(history.children.length>7)history.lastChild.remove()
}
function submit(){
 if(answered)return;
 const raw=answer.value.trim().replace(/−/g,"-");
 if(!raw){feedback.textContent="The console is waiting for an answer.";feedback.className="tm-feedback bad";return}
 const correct=raw.toLowerCase()===currentChallenge.answer.toLowerCase();
 answered=true;
 if(correct){
   streak++;combo++;stability=Math.min(100,stability+3);
   const points=25*currentChallenge.difficulty+Math.min(100,combo*5);
   score+=points;xp+=points;
   while(xp>=level*100){xp-=level*100;level++;stability=Math.min(100,stability+5)}
   feedback.textContent="LOCK STABLE. +"+points+" points — next jump is ready.";
   feedback.className="tm-feedback good";page.classList.add("correct");setTimeout(()=>page.classList.remove("correct"),600);
   addHistory(true,points);
 }else{
   streak=0;combo=0;stability=Math.max(0,stability-10);
   feedback.textContent="Temporal mismatch. Correct answer: "+currentChallenge.answer;
   feedback.className="tm-feedback bad";addHistory(false,0);
 }
 save();updateStats();
}
function jumpTo(i){
 currentEra=Math.max(0,Math.min(eras.length-1,i));page.classList.remove("traveling");void page.offsetWidth;page.classList.add("traveling");
 setTimeout(()=>{renderLists();newChallenge();page.classList.remove("traveling")},500);
}
function randomJump(){jumpTo(rand(0,eras.length-1))}
$("checkAnswer").onclick=submit;$("nextButton").onclick=newChallenge;$("jumpButton").onclick=randomJump;
answer.addEventListener("keydown",e=>{if(e.key==="Enter")submit()});
document.addEventListener("keydown",e=>{
 if(e.target.matches("input,textarea,select"))return;
 const k=e.key.toLowerCase();
 if(k==="n")newChallenge();if(k==="r")randomJump();
 if(e.key==="ArrowLeft")jumpTo(currentEra-1);if(e.key==="ArrowRight")jumpTo(currentEra+1);
});
for(let i=0;i<65;i++){const s=document.createElement("span");s.className="tm-star";s.style.left=Math.random()*100+"%";s.style.top=Math.random()*100+"%";s.style.setProperty("--dx",(Math.random()*140-70)+"px");s.style.setProperty("--dy",(Math.random()*140-70)+"px");s.style.animationDuration=(5+Math.random()*12)+"s";s.style.animationDelay=(-Math.random()*12)+"s";$("stars").appendChild(s)}
renderLists();newChallenge();updateStats();
}