
document.getElementById("y").textContent=new Date().getFullYear();
var SUB_SAMPLES = {"business": {"label": "Üzleti megbeszélés", "cap": "Quarter-end product review, two speakers, Hungarian — names, numbers, decisions.", "dur": 20.09, "lang": "hu", "langProb": 1, "lines": [[0.0, 2.7, "Öt perccel a tervezett idő előtt kezdenénk."], [3.68, 9.32, "A negyedik-negyedév árbevétele emelkedett 9%-kal, de a beszerzési költségek is nőtt."], [10.38, 14.36, "A logisztikusról szóló döntést a jövő hétfőig szeretnénk lezárni,"], [14.38, 19.08, "és a fejlesztési csapatnak három új pozíciót kell betölteni október derekára."]]}, "interview": {"label": "Interjú — kutató", "cap": "Researcher interview, single speaker, longer pauses, domain terms.", "dur": 18.14, "lang": "hu", "langProb": 1, "lines": [[0.0, 8.06, "A kutatásunk fő kérdése, hogy a mesterséges intelligencia mennyiben segítette a mezőgazdasági termelők döntéshozatalát a tavalyi asszály alatt."], [8.84, 17.1, "Összesen 350 kérdőívet gyűjtöttünk be 8 megyében, és a válaszok mintegy 70%-ában említik a előrejelző modellek használatát."]]}, "call": {"label": "Ügyfélszolgálati hívás", "cap": "Customer service call, informal register, order details, Hungarian numbers.", "dur": 18.55, "lang": "hu", "langProb": 1, "lines": [[0.0, 4.1, "Köszönöm a türelmet, pontosan két hétre szeretnénk a szállítást."], [5.22, 11.74, "A megrendés száma a 32.440, a termék a kétfeszív tárház, szürke színben."], [12.06, 17.58, "A fizetést utalással szeretném, a számlát kérlek a szokásos címre küldjék."]]}};

var alx=document.getElementById("alx"),av=null,actx=null,analys=null,srcNode=null,
    playingKey=null,animId=null,curCap=null;
function pad(n){return (n<10?"0":"")+n}
function fmtT(t){var m=Math.floor(t/60),s=t-m*60;return m+":"+pad(Math.floor(s))+"."+Math.floor((s%1)*10)}
function pick(lines,t){
  for(var i=0;i<lines.length;i++){if(t>=lines[i][0]&&t<=lines[i][1])return lines[i][2]}
  return null
}
function sizeCanvas(cv){
  var r=cv.getBoundingClientRect();if(r.width<2)return null;
  var dpr=window.devicePixelRatio||1;
  cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);
  var c=cv.getContext("2d");c.scale(dpr,dpr);return c
}
var WAVE_SEED={};
function drawWave(cv,key,progress){
  var c=cv.getContext("2d"),W=cv.clientWidth,H=cv.clientHeight;
  c.clearRect(0,0,W,H);
  var n=64,barW=W/n,bh;
  for(var i=0;i<n;i++){
    var h=18+ (Math.sin(i*0.7+ (WAVE_SEED[key]||0))*0.5+0.5)*(H*0.72);
    h=Math.max(10,h);
    var x=i*barW+barW*0.18, yy=(H-h)/2, w=barW*0.64;
    var played=(i/n)<=progress;
    c.fillStyle=played?"#35d0a5":"#24344a";
    c.beginPath();
    if(c.roundRect)c.roundRect(x,yy,w,h,3);else c.rect(x,yy,w,h);
    c.fill();
  }
}
function analyser(){
  var AC=window.AudioContext||window.webkitAudioContext;
  actx=actx||new AC();
  if(!analys){analys=actx.createAnalyser();analys.fftSize=256}
  return analys
}
function drawAlyx(playing){
  var cv=document.getElementById("alx_wave"),c=cv.getContext("2d"),W=cv.clientWidth,H=cv.clientHeight;
  c.clearRect(0,0,W,H);
  var n=72,barW=W/n, data=analys&&playing?analys.getByteFrequencyData(new Uint8Array(analys.frequencyBinCount)):null;
  for(var i=0;i<n;i++){
    var h;
    if(data){var v=data[i]/255; h=12+v*(H*0.85)}
    else{h=18+(Math.sin(i*0.6)*0.5+0.5)*(H*0.6)}
    h=Math.max(8,h);
    var x=i*barW+barW*0.2, yy=(H-h)/2;
    c.fillStyle=playing?"#35d0a5":"#2a3b52";
    c.beginPath();
    if(c.roundRect)c.roundRect(x,yy,barW*0.6,h,3);else c.rect(x,yy,barW*0.6,h);
    c.fill();
  }
  return data
}
function setSub(text){
  var e=document.getElementById("alx_sub");
  if(text){e.classList.remove("idle");if(e.textContent!==text)e.textContent=text}
}
function loop(){
  var t=av?av.currentTime:0, lines=curCap;
  var d=av?av.duration:0;
  document.getElementById("alx_time").textContent=fmtT(t)+" / "+(d?fmtT(d):"—");
  var txt=pick(lines,t);
  if(txt)setSub(txt);
  var playing=av&&!av.paused;
  drawAlyx(playing);
  animId=requestAnimationFrame(loop);
}
function openLx(key,src){
  var s=SUB_SAMPLES[key];curCap=s.lines;
  document.getElementById("alx_t").textContent=s.label;
  document.getElementById("alx_lang").textContent=(s.lang||"").toUpperCase();
  var alx=document.getElementById("alx");alx.classList.add("open");
  drawWave(document.getElementById("alx_wave"),key,0);
  av=av||new Audio();
  av.loop=true;av.src=src;
  var A=analyser();
  if(!srcNode){
    srcNode=actx.createMediaElementSource(av);
    srcNode.connect(A);A.connect(actx.destination);
  }
  av.play().then(function(){actx.resume()}).catch(function(){});
  if(animId)cancelAnimationFrame(animId);
  animId=requestAnimationFrame(loop);
}
function closeLx(){
  alx.classList.remove("open");
  if(av){try{av.pause()}catch(e){}av.removeAttribute("src");av.load&&av.load()}
  if(animId)cancelAnimationFrame(animId);
  setSub(null);
}
document.querySelectorAll(".sample[data-key]").forEach(function(el){
  function fire(){openLx(el.dataset.key,el.dataset.src)}
  el.addEventListener("click",fire);
  el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();fire()}});
});
document.getElementById("alx_play").addEventListener("click",function(){
  if(!av)return;
  if(av.paused){actx.resume();av.play()}else{av.pause()}
});
document.getElementById("alc").addEventListener("click",closeLx);
alx.addEventListener("click",function(e){if(e.target===alx)closeLx()});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&alx.classList.contains("open"))closeLx()});
window.addEventListener("resize",function(){
  document.querySelectorAll(".sample .wave canvas").forEach(function(cv){WAVE_SEED[cv.dataset.key]=cv.dataset.key.length;drawWave(cv,cv.dataset.key,0)});
  if(alx.classList.contains("open"))drawWave(document.getElementById("alx_wave"),playingKey,0);
});
// init sample thumbnails
document.querySelectorAll(".sample .wave canvas").forEach(function(cv){WAVE_SEED[cv.dataset.key]=(cv.dataset.key.length*7)%10;drawWave(cv,cv.dataset.key,0)});

