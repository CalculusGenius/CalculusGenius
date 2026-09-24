/* CALCULUS LABORATORY — interactive mathematical workbench */
const root=document.getElementById("laboratory");
if(root){
const $=id=>document.getElementById(id);
const canvas=$("plot"),ctx=canvas.getContext("2d");
const state=JSON.parse(localStorage.getItem("calculusLaboratory")||"null")||{experiments:0,session:1,log:[]};
let mode="function";

function safeExpr(s){
  s=String(s).trim().replace(/\^/g,"**");
  if(!/^[0-9a-zA-Z_+\-*\/().,\s**]+$/.test(s) && !/^[0-9a-zA-Z_+\-*\/().,\s**]+$/.test(s)) throw Error("Unsupported expression.");
  const names=["sin","cos","tan","asin","acos","atan","sqrt","exp","log","abs","floor","ceil","PI","E","pow","min","max"];
  const bad=s.match(/[a-zA-Z_][a-zA-Z_0-9]*/g)||[];
  const allowed=["x","Math",...names];
  for(const n of bad) if(!allowed.includes(n)) throw Error("Unknown symbol: "+n);
  s=s.replace(/\b(sin|cos|tan|asin|acos|atan|sqrt|exp|log|abs|floor|ceil|pow|min|max|PI|E)\b/g,"Math.$1");
  return Function("x",""use strict";return ("+s+");");
}
function value(fn,x){try{const y=Number(fn(x));return Number.isFinite(y)?y:NaN}catch{return NaN}}
function derivative(fn,x){const h=Math.max(1e-5,Math.abs(x)*1e-5);return (value(fn,x+h)-value(fn,x-h))/(2*h)}
function resize(){const r=canvas.getBoundingClientRect(),d=Math.max(1,devicePixelRatio||1);canvas.width=r.width*d;canvas.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);draw()}
window.addEventListener("resize",resize);

function axes(xmin,xmax,ymin,ymax){
 const w=canvas.clientWidth,h=canvas.clientHeight;
 const X=x=>((x-xmin)/(xmax-xmin))*w, Y=y=>h-((y-ymin)/(ymax-ymin))*h;
 ctx.clearRect(0,0,w,h);ctx.fillStyle="#08080a";ctx.fillRect(0,0,w,h);
 ctx.strokeStyle="rgba(255,255,255,.055)";ctx.lineWidth=1;
 const gx=10,gy=8;
 for(let i=0;i<=gx;i++){const x=i*w/gx;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
 for(let i=0;i<=gy;i++){const y=i*h/gy;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
 if(xmin<0&&xmax>0){ctx.strokeStyle="rgba(255,255,255,.24)";ctx.beginPath();ctx.moveTo(X(0),0);ctx.lineTo(X(0),h);ctx.stroke()}
 if(ymin<0&&ymax>0){ctx.strokeStyle="rgba(255,255,255,.24)";ctx.beginPath();ctx.moveTo(0,Y(0));ctx.lineTo(w,Y(0));ctx.stroke()}
 return {X,Y,w,h}
}
function drawFunction(){
 const fn=safeExpr($("expr").value),xmin=+$("xmin").value,xmax=+$("xmax").value;
 let ys=[];for(let i=0;i<900;i++){const x=xmin+(xmax-xmin)*i/899,y=value(fn,x);if(Number.isFinite(y)&&Math.abs(y)<1e5)ys.push(y)}
 let ymin=ys.length?Math.min(...ys): -1,ymax=ys.length?Math.max(...ys):1;if(ymin===ymax){ymin-=1;ymax+=1}
 const pad=(ymax-ymin)*.12;ymin-=pad;ymax+=pad;const g=axes(xmin,xmax,ymin,ymax);
 ctx.strokeStyle="#fff";ctx.lineWidth=1.8;ctx.beginPath();let pen=false;
 for(let i=0;i<1000;i++){const x=xmin+(xmax-xmin)*i/999,y=value(fn,x);if(!Number.isFinite(y)||Math.abs(y)>1e5){pen=false;continue}const px=g.X(x),py=g.Y(y);if(!pen)ctx.moveTo(px,py);else ctx.lineTo(px,py);pen=true}ctx.stroke();
 const cx=(xmin+xmax)/2,cy=value(fn,cx),d=derivative(fn,cx);
 $("readoutLabel").textContent="Local observation";$("readout").textContent="f("+cx.toFixed(2)+") = "+(Number.isFinite(cy)?cy.toFixed(5):"undefined")+" · f′ ≈ "+(Number.isFinite(d)?d.toFixed(5):"undefined");
 return "Function sampled on ["+xmin+", "+xmax+"]. At x="+cx.toFixed(2)+", f(x)≈"+(Number.isFinite(cy)?cy.toFixed(5):"undefined")+" and f′(x)≈"+(Number.isFinite(d)?d.toFixed(5):"undefined")+".";
}
function drawRiemann(){
 const fn=safeExpr($("rExpr").value),a=+$("a").value,b=+$("b").value,n=Math.max(2,Math.min(1000,+$("n").value));
 const dx=(b-a)/n;let sum=0;for(let i=0;i<n;i++)sum+=value(fn,a+(i+.5)*dx)*dx;
 const samples=600;let ys=[];for(let i=0;i<samples;i++){const x=a+(b-a)*i/(samples-1),y=value(fn,x);if(Number.isFinite(y))ys.push(y)}
 let ymin=Math.min(0,...ys),ymax=Math.max(0,...ys);if(ymin===ymax)ymax=ymin+1;const pad=(ymax-ymin)*.1;const g=axes(a,b,ymin-pad,ymax+pad);
 ctx.fillStyle="rgba(255,255,255,.10)";for(let i=0;i<n;i++){const x0=a+i*dx,x1=x0+dx,y=value(fn,(x0+x1)/2);if(!Number.isFinite(y))continue;const top=g.Y(Math.max(0,y)),bot=g.Y(Math.min(0,y));ctx.fillRect(g.X(x0),top,Math.max(1,g.X(x1)-g.X(x0)),bot-top)}
 ctx.strokeStyle="#fff";ctx.lineWidth=1.7;ctx.beginPath();for(let i=0;i<samples;i++){const x=a+(b-a)*i/(samples-1),y=value(fn,x);if(!Number.isFinite(y))continue;i?ctx.lineTo(g.X(x),g.Y(y)):ctx.moveTo(g.X(x),g.Y(y))}ctx.stroke();
 $("readoutLabel").textContent="Midpoint sum";$("readout").textContent="∫ ≈ "+sum.toFixed(8)+" · n = "+n;
 return "Midpoint Riemann approximation: "+sum.toFixed(8)+" using "+n+" subintervals of width "+dx.toFixed(6)+".";
}
function drawNewton(){
 const fn=safeExpr($("nExpr").value);let x=+$("guess").value;const its=Math.max(1,Math.min(30,+$("iterations").value));let seq=[x];
 for(let i=0;i<its;i++){const fx=value(fn,x),d=derivative(fn,x);if(!Number.isFinite(fx)||!Number.isFinite(d)||Math.abs(d)<1e-10)break;x=x-fx/d;if(!Number.isFinite(x)||Math.abs(x)>1e8)break;seq.push(x)}
 const lo=Math.min(...seq)-2,hi=Math.max(...seq)+2;let ys=[];for(let i=0;i<500;i++){const q=lo+(hi-lo)*i/499,y=value(fn,q);if(Number.isFinite(y))ys.push(y)}let ymin=Math.min(0,...ys),ymax=Math.max(0,...ys);if(ymin===ymax)ymax=ymin+1;const g=axes(lo,hi,ymin-(ymax-ymin)*.1,ymax+(ymax-ymin)*.1);
 ctx.strokeStyle="#fff";ctx.lineWidth=1.6;ctx.beginPath();for(let i=0;i<500;i++){const q=lo+(hi-lo)*i/499,y=value(fn,q);if(!Number.isFinite(y))continue;i?ctx.lineTo(g.X(q),g.Y(y)):ctx.moveTo(g.X(q),g.Y(y))}ctx.stroke();
 ctx.fillStyle="#fff";seq.forEach(q=>{const y=value(fn,q);if(Number.isFinite(y)){ctx.beginPath();ctx.arc(g.X(q),g.Y(y),3.5,0,Math.PI*2);ctx.fill()}});
 const last=seq[seq.length-1];$("readoutLabel").textContent="Newton sequence";$("readout").textContent="x₀ → x"+(seq.length-1)+" = "+last.toFixed(10);
 return "Newton iteration produced "+seq.length+" points; final iterate x≈"+last.toFixed(10)+" with f(x)≈"+value(fn,last).toExponential(3)+".";
}
function drawTaylor(){
 const fn=safeExpr($("tExpr").value),a=+$("center").value,k=Math.max(1,Math.min(12,+$("order").value));
 function fact(n){let z=1;for(let i=2;i<=n;i++)z*=i;return z}
 const coeff=[value(fn,a)];let gvals=[a];
 function nth(x,n){if(n===0)return value(fn,x);let h=Math.max(2e-3,Math.abs(x-a)*2e-2);let prev=x;for(let j=0;j<n;j++){} if(n===1)return derivative(fn,x);return (nth(x+h,n-1)-nth(x-h,n-1))/(2*h)}
 for(let n=1;n<=k;n++)coeff.push(nth(a,n)/fact(n));
 let xmin=a-5,xmax=a+5;const orig=[],tay=[];for(let i=0;i<700;i++){const x=xmin+(xmax-xmin)*i/699,y=value(fn,x);orig.push(y);let s=0,p=1;for(let j=0;j<coeff.length;j++){if(j)p*=x-a;s+=coeff[j]*p}tay.push(s)}
 const all=orig.concat(tay).filter(Number.isFinite),ymin=Math.min(...all),ymax=Math.max(...all),pad=(ymax-ymin||1)*.12,g=axes(xmin,xmax,ymin-pad,ymax+pad);
 [[orig,"rgba(255,255,255,.9)",1.8],[tay,"rgba(255,255,255,.35)",1.2]].forEach(([arr,st,lw])=>{ctx.strokeStyle=st;ctx.lineWidth=lw;ctx.beginPath();arr.forEach((y,i)=>{if(!Number.isFinite(y))return;const x=xmin+(xmax-xmin)*i/699;i?ctx.lineTo(g.X(x),g.Y(y)):ctx.moveTo(g.X(x),g.Y(y))});ctx.stroke()});
 $("readoutLabel").textContent="Taylor approximation";$("readout").textContent="Order "+k+" about a = "+a;
 return "Taylor polynomial of order "+k+" about x="+a+" was sampled against the original function. Higher order does not automatically imply uniform accuracy.";
}
function draw(){try{let text=mode==="function"?drawFunction():mode==="riemann"?drawRiemann():mode==="newton"?drawNewton():drawTaylor();$("result").textContent=text;return text}catch(e){$("result").textContent="Experiment could not be evaluated: "+e.message;ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);return null}}
function save(){localStorage.setItem("calculusLaboratory",JSON.stringify({...state,log:state.log.slice(0,12)}))}
function addLog(text){if(!text)return;state.experiments++;state.log.unshift({mode,text,time:new Date().toLocaleTimeString()});state.log=state.log.slice(0,12);save();renderLog()}
function renderLog(){$("expCount").textContent=state.experiments;$("sessionCount").textContent=String(state.session).padStart(3,"0");$("sessionNo").textContent=String(state.session).padStart(3,"0");$("modeCount").textContent=mode[0].toUpperCase()+mode.slice(1);$("log").innerHTML=state.log.length?state.log.map(x=>'<div class="lab-log-entry"><b>'+x.mode.toUpperCase()+' · '+x.time+'</b><span>'+x.text+'</span></div>').join(""):'<div class="lab-log-entry"><b>Laboratory initialized</b><span>No observations recorded yet.</span></div>'}
document.querySelectorAll(".lab-tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".lab-tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".lab-section").forEach(x=>x.classList.remove("active"));b.classList.add("active");mode=b.dataset.mode;$("instrumentName").textContent={function:"Function Observatory",riemann:"Integral Approximation Bench",newton:"Root-Finding Bench",taylor:"Approximation Studio"}[mode];$(mode==="function"?"functionControls":mode==="riemann"?"riemannControls":mode==="newton"?"newtonControls":"taylorControls").classList.add("active");renderLog();draw()});
$("run").onclick=()=>{const t=draw();addLog(t)};
$("reset").onclick=()=>{state.session++;state.experiments=0;state.log=[];save();renderLog();draw();$("result").textContent="Session reset. The instruments are ready."};
["expr","xmin","xmax","rExpr","a","b","n","nExpr","guess","iterations","tExpr","center","order"].forEach(id=>$(id)?.addEventListener("change",()=>draw()));
renderLog();resize();draw();
}