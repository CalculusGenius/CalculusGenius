(() => {
  const experiments = [
    ["LIMITS","Approach without touching","Study how y=sin(x)/x behaves as x approaches 0. Then change the numerator and denominator and look for a pattern.","f(x)=sin(x)/x"],
    ["DERIVATIVES","Tangent factory","Create f(x)=x^3-3x and use GeoGebra's tangent tools at several points. Compare tangent slopes with f'(x).","f(x)=x^3-3x"],
    ["INTEGRATION","Area that changes shape","Explore the signed area under f(x)=sin(x) on several intervals. Change the endpoints and compare geometry with the exact integral.","f(x)=sin(x)"],
    ["SERIES","Infinite staircase","Plot partial sums of a geometric series and keep increasing the number of terms. Ask when a finite picture starts behaving like an infinite object.","s(n)=sum(1/2^k,k,1,n)"],
    ["CONICS","One equation, many geometries","Try x^2/9+y^2/4=1, then alter the coefficients. Watch ellipse, circle, hyperbola and parabola families emerge.","x^2/9+y^2/4=1"],
    ["POLAR","Curves without y=f(x)","Explore r=1+cos(t) and alter the coefficient. Investigate loops, cusps and symmetry.","Curve((1+cos(t))*cos(t),(1+cos(t))*sin(t),t,0,2*pi)"],
    ["PARAMETRIC","Time becomes geometry","Use a parametric curve and change its parameter interval. Look at motion, not just the final trace.","Curve(t,t^2,t,-3,3)"],
    ["OPTIMIZATION","Chase an extremum","Plot f(x)=x^4-4x^2 and locate its critical points. Change the coefficients and see bifurcations.","f(x)=x^4-4x^2"],
    ["DIFFERENTIAL EQUATIONS","Slope field intuition","Use the GeoGebra tools to explore direction fields and solution curves. Change parameters and look for families of trajectories.","y'=x-y"],
    ["3D","Surface laboratory","Move into the 3D instrument and explore z=x^2+y^2, z=sin(sqrt(x^2+y^2)), planes and intersections.","z=x^2+y^2"],
    ["SYMMETRY","Invariant under transformation","Compare f(x), f(-x), and -f(x). Then deliberately break the symmetry with one term.","f(x)=x^4-2x^2"],
    ["SINGULARITIES","Where formulas fail","Investigate 1/x, tan(x), log(x), and 1/(x^2-1). Zoom aggressively and distinguish holes, poles and asymptotic behaviour.","f(x)=1/(x^2-1)"],
    ["FOURIER","Build a shape from waves","Use sums of sine waves to approximate a square-like periodic signal. Change frequencies and amplitudes.","f(x)=sin(x)+sin(3x)/3+sin(5x)/5"],
    ["FRACTAL","Infinite detail","Explore a complex-looking iterative construction in GeoGebra, then zoom and ask whether the same geometry repeats.","f(x)=sin(x^2)"],
    ["VECTOR","Geometry of direction","Create vectors and inspect their magnitudes, angles, sums and scalar multiples. Then move to the 3D instrument.","v=(3,2)"],
    ["NEWTON","Convergence is not guaranteed","Try Newton's method from different starting points for a polynomial with several roots. Compare the resulting basins.","f(x)=x^3-2x-5"],
    ["CALCULUS + GEOMETRY","Change creates shape","Use sliders to vary a parameter in a family of curves. Observe how roots, extrema and intersections move.","f(x)=x^3+a*x"],
    ["PROBABILITY","Geometry meets randomness","Use GeoGebra's probability and random tools to explore distributions, expectation and sampling.","Normal(0,1,x)"],
    ["CAS","Exact before decimal","Open the CAS instrument and experiment with Factor, Derivative, Integral, Solve and exact radicals.","Factor(x^2-5*x+6)"],
    ["TOPOLOGY","Stretch without tearing","Construct shapes and continuously deform them. Ask which properties remain unchanged under deformation.","Circle((0,0),2)"],
    ["LINEAR ALGEBRA","Transform the plane","Use vectors and transformations to see how matrices act geometrically. Change entries one at a time.","v=(3,2)"],
    ["CURVATURE","Bend a curve","Plot a family of curves and investigate where bending becomes large or small. Compare geometry with derivatives.","f(x)=sin(x)"],
    ["RESONANCE","When oscillations cooperate","Return to the Phase Space instrument and vary damping and restoring strength. Look for qualitative changes.",""],
    ["RIEMANN SUMS","Approximation becoming exact","Increase the number of rectangles and watch the approximation converge. Compare left, right and midpoint ideas.","f(x)=x^2"]
  ];

  function renderExperiments() {
    const grid=document.getElementById("experimentGrid");
    if(!grid) return;
    grid.innerHTML=experiments.map((e,i)=>'<article class="experiment-card"><span class="tag">'+String(i+1).padStart(2,"0")+' · '+e[0]+'</span><h3>'+e[1]+'</h3><p>'+e[2]+'</p><button type="button" data-command="'+encodeURIComponent(e[3])+'">SEND TO GRAPHING UNIVERSE</button></article>').join("");
    grid.querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>{
      const cmd=decodeURIComponent(btn.dataset.command||"");
      if(cmd) loadIntoGraph(cmd);
      document.getElementById("ggb-graphing")?.scrollIntoView({behavior:"smooth",block:"center"});
    }));
  }

  let graphingApi=null;

  function makeApplet(id, appName, height=520, extra={}) {
    const target=document.getElementById(id);
    if(!target || typeof window.GGBApplet!=="function") return;
    const params={appName,width:900,height,showToolBar:true,showAlgebraInput:true,showMenuBar:false,showResetIcon:true,showZoomButtons:true,enableRightClick:true,allowStyleBar:true,autoHeight:false,...extra};
    params.appletOnLoad=(api)=>{ if(appName==="graphing") graphingApi=api; };
    new GGBApplet(params,true).inject(target);
  }

  function loadIntoGraph(command) {
    if(!graphingApi) return;
    try {
      graphingApi.evalCommand("DeleteAll()");
      if(command.startsWith("f(x)=")) graphingApi.evalCommand(command);
      else if(command.startsWith("Curve(")) graphingApi.evalCommand(command);
      else if(command.startsWith("z=")) graphingApi.evalCommand(command);
      else if(command.startsWith("x^") || command.includes("=")) graphingApi.evalCommand(command);
      else if(command.startsWith("v=")) graphingApi.evalCommand(command);
      else graphingApi.evalCommand(command);
    } catch {}
  }

  function init() {
    renderExperiments();
    makeApplet("ggb-graphing","graphing",560,{showToolBar:true,showAlgebraInput:true});
    makeApplet("ggb-geometry","geometry",520,{showToolBar:true,showAlgebraInput:true});
    makeApplet("ggb-3d","3d",560,{showToolBar:true,showAlgebraInput:true});
    makeApplet("ggb-cas","classic",560,{showToolBar:true,showAlgebraInput:true,enableCAS:true,enable3D:true});
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();