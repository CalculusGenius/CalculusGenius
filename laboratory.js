/* CALCULUS LABORATORY — living mathematical universe */
const root = document.getElementById("laboratory");

if (root) {
    const $ = id => document.getElementById(id);
    const canvas = $("plot");
    const ctx = canvas?.getContext("2d");

    const modes = {
        function: {name:"Function Observatory"},
        derivative: {name:"Derivative Microscope"},
        integral: {name:"Integral Observatory"},
        limit: {name:"Limit Telescope"},
        newton: {name:"Newton Basin"},
        taylor: {name:"Taylor Studio"},
        phase: {name:"Phase Space"}
    };

    const presets = [
        ["sin(x)", "sin(x)"], ["cos(x)", "cos(x)"], ["x^2", "x^2"],
        ["x^3-4*x", "x^3-4*x"], ["exp(-x^2)", "exp(-x^2)"],
        ["sin(x)/x", "sin(x)/x"], ["log(abs(x))", "log(abs(x))"],
        ["x*sin(x)", "x*sin(x)"], ["cos(x^2)", "cos(x^2)"]
    ];

    const challenges = [
        ["Symmetry Hunt","Find a function whose graph reveals a symmetry, then change its parameters without destroying it."],
        ["Near the Singularity","Explore sin(x)/x near zero. Shrink the window repeatedly and decide what the picture suggests."],
        ["Derivative Detective","Find a function with several turning points and use the derivative instrument to locate them."],
        ["Integral Duel","Choose an interval and change the number of rectangles until the approximation stabilizes."],
        ["Newton Escape","Choose an initial guess that makes Newton's method behave unexpectedly. Investigate why."],
        ["Taylor Stretch","Increase Taylor order and move the centre. Find where the approximation becomes convincing—and where it fails."],
        ["Phase Portrait","Change the initial position and velocity. Look for trajectories with qualitatively different behaviour."],
        ["Parameter Mutation","Start with a simple function and repeatedly alter one coefficient. Record what changes and what survives."],
        ["Conjecture Machine","Generate three experiments that look unrelated, then search for one structural property they share."]
    ];

    if (!ctx) {
        console.error("Laboratory: canvas missing.");
    } else {
        const stored = (() => {
            try { return JSON.parse(localStorage.getItem("calculusLaboratoryV2") || "null"); }
            catch { return null; }
        })();

        const state = {
            experiments: Number.isFinite(stored?.experiments) ? stored.experiments : 0,
            session: Number.isFinite(stored?.session) ? stored.session : 1,
            streak: Number.isFinite(stored?.streak) ? stored.streak : 0,
            log: Array.isArray(stored?.log) ? stored.log : [],
            mode: "function"
        };

        const defaults = {
            function:{expr:"sin(x) * exp(-x^2/8)",xmin:-8,xmax:8},
            derivative:{expr:"x^3 - 4*x",xmin:-4,xmax:4},
            integral:{expr:"sin(x)+x^2/8",a:-2,b:5,n:40},
            limit:{expr:"sin(x)/x",point:0,side:"two",scale:2},
            newton:{expr:"x^3-2*x-5",guess:2,iterations:8},
            taylor:{expr:"exp(x)",center:0,order:6,span:5},
            phase:{alpha:0.25,beta:1.2,x0:1.5,v0:0,steps:700}
        };

        function save() {
            try {
                localStorage.setItem("calculusLaboratoryV2", JSON.stringify({
                    experiments:state.experiments,session:state.session,streak:state.streak,log:state.log.slice(0,18)
                }));
            } catch {}
        }

        function finite(v,label) {
            const n=Number(v);
            if(!Number.isFinite(n)) throw new Error("Enter a valid "+label+".");
            return n;
        }

        const allowedFns = new Set(["sin","cos","tan","asin","acos","atan","sqrt","exp","log","abs","floor","ceil","sinh","cosh","tanh","pow","min","max"]);
        const allowedConstants = new Set(["PI","E"]);

        function compile(source) {
            let s=String(source??"").trim();
            if(!s) throw new Error("Enter a function of x.");
            if(s.length>220) throw new Error("Expression is too long.");
            if(/[;{}\[\]=<>:&|!?'"\\]/.test(s)) throw new Error("Unsupported character in expression.");
            s=s.replace(/\^/g,"**");
            const ids=s.match(/[A-Za-z_][A-Za-z0-9_]*/g)||[];
            for(const name of ids) {
                if(name!=="x"&&!allowedFns.has(name)&&!allowedConstants.has(name)) throw new Error("Unknown symbol: "+name);
            }
            s=s.replace(/\b(sin|cos|tan|asin|acos|atan|sqrt|exp|log|abs|floor|ceil|sinh|cosh|tanh|pow|min|max)\b/g,"Math.$1");
            s=s.replace(/\bPI\b/g,"Math.PI").replace(/\bE\b/g,"Math.E");
            try { return Function("x",'"use strict"; return ('+s+');'); }
            catch { throw new Error("Invalid expression. Try sin(x), x^2, exp(-x^2), or log(abs(x))."); }
        }

        function val(fn,x){ try { const y=Number(fn(x)); return Number.isFinite(y)?y:NaN; } catch{return NaN;} }
        function deriv(fn,x){ const h=Math.max(1e-5,Math.abs(x)*1e-5); const a=val(fn,x-h),b=val(fn,x+h); return Number.isFinite(a)&&Number.isFinite(b)?(b-a)/(2*h):NaN; }

        function sample(fn,a,b,count=900,limit=1e8) {
            const p=[];
            for(let i=0;i<count;i++){const x=a+(b-a)*i/(count-1),y=val(fn,x);p.push({x,y:Number.isFinite(y)&&Math.abs(y)<=limit?y:NaN});}
            return p;
        }

        function resize(){
            const r=canvas.getBoundingClientRect(),d=Math.max(1,devicePixelRatio||1);
            canvas.width=Math.round(Math.max(1,r.width)*d); canvas.height=Math.round(Math.max(1,r.height)*d);
            ctx.setTransform(d,0,0,d,0,0); drawCurrent();
        }

        function axes(a,b,c,d){
            const w=canvas.clientWidth||1,h=canvas.clientHeight||1,dx=b-a||1,dy=d-c||1;
            const X=x=>(x-a)/dx*w,Y=y=>h-(y-c)/dy*h;
            ctx.clearRect(0,0,w,h);ctx.fillStyle="#070709";ctx.fillRect(0,0,w,h);
            ctx.strokeStyle="rgba(255,255,255,.045)";ctx.lineWidth=1;
            for(let i=0;i<=12;i++){const x=i*w/12;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
            for(let i=0;i<=8;i++){const y=i*h/8;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
            if(a<0&&b>0){ctx.strokeStyle="rgba(255,255,255,.25)";ctx.beginPath();ctx.moveTo(X(0),0);ctx.lineTo(X(0),h);ctx.stroke();}
            if(c<0&&d>0){ctx.strokeStyle="rgba(255,255,255,.25)";ctx.beginPath();ctx.moveTo(0,Y(0));ctx.lineTo(w,Y(0));ctx.stroke();}
            return {X,Y,w,h};
        }

        function rangeFor(points,includeZero=false){
            const ys=points.map(p=>p.y).filter(Number.isFinite);
            if(!ys.length) throw new Error("No finite values exist in this window.");
            let lo=includeZero?Math.min(0,...ys):Math.min(...ys),hi=includeZero?Math.max(0,...ys):Math.max(...ys);
            if(lo===hi){lo-=1;hi+=1} const pad=(hi-lo)*.12||1; return [lo-pad,hi+pad];
        }

        function line(points,g,style="rgba(255,255,255,.92)",width=1.8){
            ctx.strokeStyle=style;ctx.lineWidth=width;ctx.beginPath();let pen=false;
            for(const p of points){if(!Number.isFinite(p.y)){pen=false;continue}const x=g.X(p.x),y=g.Y(p.y);if(!pen)ctx.moveTo(x,y);else ctx.lineTo(x,y);pen=true}ctx.stroke();
        }

        function dot(x,y,g,r=4){if(!Number.isFinite(y))return;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(g.X(x),g.Y(y),r,0,Math.PI*2);ctx.fill();}
        function setReadout(label,text){$("readoutLabel").textContent=label;$("readout").textContent=text;}

        function controls(){
            const d=defaults[state.mode], p=presets.map(x=>'<button class="preset" data-expr="'+x[1].replace(/"/g,"&quot;")+'">'+x[0]+"</button>").join("");
            const common=(expr,fields,hint)=>'<div class="lab-field"><label>Function f(x)</label><input class="lab-input" id="expr" value="'+expr+'" spellcheck="false"></div>'+fields+'<div class="lab-presets">'+p+"</div><p class="lab-hint">"+hint+"</p>";
            let html="";
            if(state.mode==="function") html=common(d.expr,'<div class="lab-row"><div class="lab-field"><label>x minimum</label><input class="lab-input" id="xmin" type="number" value="'+d.xmin+'" step=".5"></div><div class="lab-field"><label>x maximum</label><input class="lab-input" id="xmax" type="number" value="'+d.xmax+'" step=".5"></div></div>','Move the window to reveal different scales. Try discontinuities, oscillations, growth, decay and symmetry.');
            if(state.mode==="derivative") html=common(d.expr,'<div class="lab-row"><div class="lab-field"><label>x minimum</label><input class="lab-input" id="xmin" type="number" value="'+d.xmin+'"></div><div class="lab-field"><label>x maximum</label><input class="lab-input" id="xmax" type="number" value="'+d.xmax+'"></div></div>','The bright curve is f. Its derivative is traced with a second curve. Compare zeros of f′ with turning points of f.');
            if(state.mode==="integral") html=common(d.expr,'<div class="lab-row"><div class="lab-field"><label>Lower bound a</label><input class="lab-input" id="a" type="number" value="'+d.a+'"></div><div class="lab-field"><label>Upper bound b</label><input class="lab-input" id="b" type="number" value="'+d.b+'"></div></div><div class="lab-field"><label>Subintervals n</label><input class="lab-input" id="n" type="number" min="2" max="1500" value="'+d.n+'"></div>','Change n continuously. Signed area, not just geometric area, is what the midpoint rule approximates.');
            if(state.mode==="limit") html=common(d.expr,'<div class="lab-row"><div class="lab-field"><label>Approach point</label><input class="lab-input" id="point" type="number" value="'+d.point+'"></div><div class="lab-field"><label>Window scale</label><input class="lab-input" id="scale" type="number" min=".00001" value="'+d.scale+'"></div></div><div class="lab-field"><label>Approach</label><select class="lab-select" id="side"><option value="two">Two-sided</option><option value="left">From left</option><option value="right">From right</option></select></div>','Shrink the scale by factors of 2, 10 or 100. The telescope is meant to expose what happens arbitrarily close to a point.');
            if(state.mode==="newton") html=common(d.expr,'<div class="lab-row"><div class="lab-field"><label>Initial guess</label><input class="lab-input" id="guess" type="number" value="'+d.guess+'"></div><div class="lab-field"><label>Iterations</label><input class="lab-input" id="iterations" type="number" min="1" max="40" value="'+d.iterations+'"></div></div>','Every dot is an iterate. Change the starting point and see that Newton’s method is a dynamical process, not merely a formula.');
            if(state.mode==="taylor") html=common(d.expr,'<div class="lab-row"><div class="lab-field"><label>Centre a</label><input class="lab-input" id="center" type="number" value="'+d.center+'"></div><div class="lab-field"><label>Order</label><input class="lab-input" id="order" type="number" min="1" max="14" value="'+d.order+'"></div></div><div class="lab-field"><label>Visible half-width</label><input class="lab-input" id="span" type="number" min=".1" value="'+d.span+'"></div>','Compare the original curve with a local polynomial. Increase order and move a to investigate local versus global approximation.');
            if(state.mode==="phase") html='<div class="lab-field"><label>Damping α</label><input class="lab-input" id="alpha" type="number" step=".05" value="'+d.alpha+'"></div><div class="lab-field"><label>Restoring strength β</label><input class="lab-input" id="beta" type="number" step=".1" value="'+d.beta+'"></div><div class="lab-row"><div class="lab-field"><label>x₀</label><input class="lab-input" id="x0" type="number" value="'+d.x0+'"></div><div class="lab-field"><label>v₀</label><input class="lab-input" id="v0" type="number" value="'+d.v0+'"></div></div><div class="lab-field"><label>Simulation steps</label><input class="lab-input" id="steps" type="number" min="50" max="2500" value="'+d.steps+'"></div><p class="lab-hint">A simple damped oscillator x″ + αx′ + βx = 0 is drawn in phase space. Change damping and initial conditions to reveal different trajectories.</p>';
            $("controls").innerHTML=html;
            if($("side"))$("side").value=d.side;
            $("controls").querySelectorAll(".preset").forEach(b=>b.addEventListener("click",()=>{const e=$("expr");if(e){e.value=b.dataset.expr;drawCurrent()}}));
            $("controls").querySelectorAll("input,select").forEach(el=>el.addEventListener("input",drawCurrent));
        }

        function functionDraw(){
            const fn=compile($("expr").value),a=finite($("xmin").value,"x minimum"),b=finite($("xmax").value,"x maximum");if(!(b>a))throw new Error("x maximum must exceed x minimum.");
            const pts=sample(fn,a,b),[lo,hi]=rangeFor(pts),g=axes(a,b,lo,hi);line(pts,g);
            const x=(a+b)/2,y=val(fn,x);dot(x,y,g,3.5);setReadout("Local observation","f("+x.toFixed(2)+") = "+(Number.isFinite(y)?y.toFixed(6):"undefined"));
            return "Function sampled on ["+a+", "+b+"]. Midpoint observation f("+x.toFixed(2)+")≈"+(Number.isFinite(y)?y.toFixed(6):"undefined")+".";
        }

        function derivativeDraw(){
            const fn=compile($("expr").value),a=finite($("xmin").value,"x minimum"),b=finite($("xmax").value,"x maximum");if(!(b>a))throw new Error("x maximum must exceed x minimum.");
            const f=sample(fn,a,b),d=f.map(p=>({x:p.x,y:deriv(fn,p.x)})),all=f.concat(d),[lo,hi]=rangeFor(all,true),g=axes(a,b,lo,hi);
            line(f,g,"rgba(255,255,255,.9)",1.8);line(d,g,"rgba(255,255,255,.35)",1.3);
            const mid=deriv(fn,(a+b)/2);setReadout("Derivative microscope","f′(mid) ≈ "+(Number.isFinite(mid)?mid.toFixed(6):"undefined"));
            return "The bright curve is f and the dim curve is the numerical derivative f′. Compare their zeros and sign changes.";
        }

        function integralDraw(){
            const fn=compile($("expr").value),a=finite($("a").value,"lower bound"),b=finite($("b").value,"upper bound"),n=Math.max(2,Math.min(1500,Math.floor(finite($("n").value,"subinterval count"))));if(!(b>a))throw new Error("Upper bound must exceed lower bound.");
            const dx=(b-a)/n;let sum=0;for(let i=0;i<n;i++){const y=val(fn,a+(i+.5)*dx);if(!Number.isFinite(y))throw new Error("The integrand is undefined inside the interval.");sum+=y*dx}
            const pts=sample(fn,a,b),[lo,hi]=rangeFor(pts,true),g=axes(a,b,lo,hi);ctx.fillStyle="rgba(255,255,255,.11)";
            for(let i=0;i<n;i++){const x0=a+i*dx,x1=x0+dx,y=val(fn,(x0+x1)/2);const top=g.Y(Math.max(0,y)),bot=g.Y(Math.min(0,y));ctx.fillRect(g.X(x0),top,Math.max(.5,g.X(x1)-g.X(x0)),bot-top)}line(pts,g);
            setReadout("Midpoint integral","∫ ≈ "+sum.toFixed(8)+"  ·  n = "+n);
            return "Midpoint approximation ≈ "+sum.toFixed(8)+" with "+n+" subintervals (Δx="+dx.toFixed(6)+").";
        }

        function limitDraw(){
            const fn=compile($("expr").value),p=finite($("point").value,"approach point"),s=Math.max(1e-6,Math.abs(finite($("scale").value,"window scale"))),side=$("side").value;
            const a=p-s,b=p+s,pts=sample(fn,a,b,900),[lo,hi]=rangeFor(pts),g=axes(a,b,lo,hi);line(pts,g);
            const eps=Math.max(s*1e-5,1e-7),left=val(fn,p-eps),right=val(fn,p+eps),target=side==="left"?left:side==="right"?right:(left+right)/2;dot(p,target,g,4);
            setReadout("Limit telescope","near x="+p+"  →  "+(Number.isFinite(target)?target.toFixed(8):"undefined"));
            return "At distance ε≈"+eps.toExponential(2)+" from "+p+", the numerical observation is "+(Number.isFinite(target)?target.toFixed(8):"undefined")+". Shrink the window and compare.";
        }

        function newtonDraw(){
            const fn=compile($("expr").value);let x=finite($("guess").value,"initial guess");const it=Math.max(1,Math.min(40,Math.floor(finite($("iterations").value,"iterations"))));const seq=[x];
            for(let i=0;i<it;i++){const y=val(fn,x),d=deriv(fn,x);if(!Number.isFinite(y)||!Number.isFinite(d))break;if(Math.abs(d)<1e-10)throw new Error("Derivative became too small.");const nx=x-y/d;if(!Number.isFinite(nx)||Math.abs(nx)>1e7)break;seq.push(nx);x=nx}
            const lo=Math.min(...seq)-2,hi=Math.max(...seq)+2,pts=sample(fn,lo,hi),[yl,yh]=rangeFor(pts,true),g=axes(lo,hi,yl,yh);line(pts,g);
            ctx.strokeStyle="rgba(255,255,255,.22)";ctx.lineWidth=1;
            for(let i=0;i<seq.length-1;i++){const x0=seq[i],y0=val(fn,x0),x1=seq[i+1];ctx.beginPath();ctx.moveTo(g.X(x0),g.Y(y0));ctx.lineTo(g.X(x1),g.Y(0));ctx.stroke()}
            seq.forEach(q=>dot(q,val(fn,q),g,3.8));const last=seq[seq.length-1];
            setReadout("Newton basin","x"+(seq.length-1)+" ≈ "+last.toFixed(9));
            return "Newton produced "+seq.length+" iterates. Final x≈"+last.toFixed(10)+" and f(x)≈"+val(fn,last).toExponential(3)+".";
        }

        function taylorDraw(){
            const fn=compile($("expr").value),a=finite($("center").value,"centre"),order=Math.max(1,Math.min(14,Math.floor(finite($("order").value,"order")))),span=Math.max(.05,finite($("span").value,"visible half-width"));
            const coeff=[];const factorial=n=>{let r=1;for(let i=2;i<=n;i++)r*=i;return r};
            function nth(x,n){if(n===0)return val(fn,x);if(n===1)return deriv(fn,x);const h=Math.max(1e-3,Math.min(.03,Math.abs(x-a)*.01||.01));return (nth(x+h,n-1)-nth(x-h,n-1))/(2*h)}
            for(let n=0;n<=order;n++){const q=nth(a,n);if(!Number.isFinite(q))throw new Error("Could not estimate Taylor coefficients.");coeff.push(q/factorial(n))}
            const xmin=a-span,xmax=a+span,orig=sample(fn,xmin,xmax,900),tay=orig.map(p=>{let sum=0,pow=1;for(let j=0;j<coeff.length;j++){if(j)pow*=p.x-a;sum+=coeff[j]*pow}return {x:p.x,y:Math.abs(sum)<1e12?sum:NaN}}),[lo,hi]=rangeFor(orig.concat(tay),true),g=axes(xmin,xmax,lo,hi);
            line(orig,g,"rgba(255,255,255,.9)",1.8);line(tay,g,"rgba(255,255,255,.32)",1.3);dot(a,val(fn,a),g,4);
            setReadout("Taylor studio","Order "+order+" about a = "+a);
            return "Taylor polynomial of order "+order+" was compared with f around x="+a+". Increase order or move the centre to probe locality.";
        }

        function phaseDraw(){
            const alpha=finite($("alpha").value,"damping"),beta=finite($("beta").value,"restoring strength"),x0=finite($("x0").value,"initial position"),v0=finite($("v0").value,"initial velocity"),steps=Math.max(50,Math.min(2500,Math.floor(finite($("steps").value,"steps"))));
            let x=x0,v=v0;const path=[];const dt=.025;for(let i=0;i<steps;i++){path.push({x,y:v});const acc=-alpha*v-beta*x;v+=acc*dt;x+=v*dt}
            const xs=path.map(p=>p.x),ys=path.map(p=>p.y);let xa=Math.min(...xs),xb=Math.max(...xs),ya=Math.min(...ys),yb=Math.max(...ys);if(xa===xb){xa-=1;xb+=1}if(ya===yb){ya-=1;yb+=1}
            const g=axes(xa-.15*(xb-xa),xb+.15*(xb-xa),ya-.15*(yb-ya),yb+.15*(yb-ya));
            ctx.strokeStyle="rgba(255,255,255,.9)";ctx.lineWidth=1.7;ctx.beginPath();path.forEach((p,i)=>{const X=g.X(p.x),Y=g.Y(p.y);if(i)ctx.lineTo(X,Y);else ctx.moveTo(X,Y)});ctx.stroke();dot(x0,v0,g,4);
            setReadout("Phase space","α="+alpha+"  β="+beta);
            return "Phase trajectory generated from x₀="+x0+", v₀="+v0+" with damping α="+alpha+" and restoring strength β="+beta+".";
        }

        const drawMap={function:functionDraw,derivative:derivativeDraw,integral:integralDraw,limit:limitDraw,newton:newtonDraw,taylor:taylorDraw,phase:phaseDraw};

        function drawCurrent(){
            try { const text=drawMap[state.mode]();$("result").textContent=text;return text; }
            catch(e){const m=e instanceof Error?e.message:"Unknown error.";$("result").textContent="Experiment unavailable: "+m;ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);ctx.fillStyle="rgba(255,255,255,.35)";ctx.font="12px Inter,sans-serif";ctx.fillText("Adjust the instrument parameters.",18,30);return null;}
        }

        function renderLog(){
            $("expCount").textContent=state.experiments;$("sessionCount").textContent=String(state.session).padStart(3,"0");$("sessionNo").textContent=String(state.session).padStart(3,"0");$("streak").textContent=state.streak;$("modeCount").textContent=state.mode.charAt(0).toUpperCase()+state.mode.slice(1);
            const log=$("log");log.textContent="";
            if(!state.log.length){log.innerHTML='<div class="lab-log-entry"><b>LABORATORY INITIALIZED</b><span>No observations yet. The universe is waiting.</span></div>';return}
            state.log.forEach(item=>{const e=document.createElement("div"),b=document.createElement("b"),s=document.createElement("span");e.className="lab-log-entry";b.textContent=item.mode.toUpperCase()+" · "+item.time;s.textContent=item.text;e.append(b,s);log.append(e)});
        }

        function switchMode(mode){
            state.mode=mode;document.querySelectorAll(".instrument").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));$("instrumentName").textContent=modes[mode].name;controls();renderLog();drawCurrent();
        }

        function randomize(){
            const sets={
                function:["sin(2*x)+x/5","cos(x^2)","exp(-x^2/4)*cos(3*x)","x^3-3*x+1","sin(x)/(1+x^2)"],
                derivative:["x^4-4*x^2","sin(x)+cos(2*x)","exp(-x^2/3)","x*sin(x)"],
                integral:["x^3-2*x+1","sin(x)*exp(-x/4)","cos(x^2)","1/(1+x^2)"],
                limit:["sin(x)/x","(1-cos(x))/x^2","exp(x)","log(1+x)"],
                newton:["x^3-2*x-5","x^3-x-1","cos(x)-x","x^5-3*x+1"],
                taylor:["exp(x)","sin(x)","cos(x)","log(1+x)"]
            };
            if(state.mode!=="phase"){
                const arr=sets[state.mode]||sets.function,e=$("expr");e.value=arr[Math.floor(Math.random()*arr.length)];
                if($("xmin"))$("xmin").value=-6;if($("xmax"))$("xmax").value=6;if($("a"))$("a").value=-2;if($("b"))$("b").value=4;
                if($("n"))$("n").value=20+Math.floor(Math.random()*100);if($("guess"))$("guess").value=(Math.random()*4-2).toFixed(2);
                if($("center"))$("center").value=(Math.random()*2-1).toFixed(2);if($("order"))$("order").value=2+Math.floor(Math.random()*10);
            }else{$("alpha").value=(Math.random()*.9).toFixed(2);$("beta").value=(.4+Math.random()*2).toFixed(2);$("x0").value=(Math.random()*4-2).toFixed(2);$("v0").value=(Math.random()*3-1.5).toFixed(2)}
            drawCurrent();
        }

        function generateChallenge(){
            const c=challenges[Math.floor(Math.random()*challenges.length)];$("challengeTitle").textContent=c[0];$("challengeText").textContent=c[1];state.streak++;save();renderLog();
        }

        document.querySelectorAll(".instrument").forEach(b=>b.addEventListener("click",()=>switchMode(b.dataset.mode)));
        $("run").addEventListener("click",()=>{const text=drawCurrent();if(text){state.experiments++;state.log.unshift({mode:state.mode,text,time:new Date().toLocaleTimeString()});state.log=state.log.slice(0,18);save();renderLog()}});
        $("randomize").addEventListener("click",randomize);
        $("challenge").addEventListener("click",generateChallenge);
        $("reset").addEventListener("click",()=>{state.session++;state.experiments=0;state.streak=0;state.log=[];save();renderLog();controls();drawCurrent()});
        window.addEventListener("resize",resize);

        controls();renderLog();resize();drawCurrent();
    }
}
