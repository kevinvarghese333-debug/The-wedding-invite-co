/* The script inside every builder invitation: the opening, music, countdown, scroll reveals, falling petals,
   the RSVP form, and (in the editor) live updates sent from the parent page with postMessage.
   Plain ES2017 in a string, because it runs inside the invitation page, not in React. Avoid backticks here. */
export const RUNTIME = String.raw`(function(){
var W=window,D=document;
var S=W.__wic||(W.__wic={opened:false,timers:[],audio:null,playing:false,src:"",fxKey:"",io:null,replay:false,c:{}});
function $(s,r){return (r||D).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||D).querySelectorAll(s))}
function cfg(){try{return JSON.parse($("#wic-config").textContent)}catch(e){return {}}}
function play(){if(!S.audio||!S.src)return;var p=S.audio.play();S.playing=true;if(p&&p.catch)p.catch(function(){S.playing=false;sync()});sync()}
function pause(){if(S.audio)S.audio.pause();S.playing=false;sync()}
function sync(){var b=$("#wic-music");if(!b)return;b.classList.toggle("on",S.playing);b.setAttribute("aria-pressed",S.playing?"true":"false")}
function music(c){
  if(!S.audio){S.audio=new Audio();S.audio.loop=true;S.audio.preload="none"}
  if(c.music!==S.src){var was=S.playing;S.src=c.music||"";if(S.src){S.audio.src=S.src;if(was)play()}else{pause();S.audio.removeAttribute("src")}}
  var b=$("#wic-music");if(!b)return;
  b.hidden=!S.src;b.onclick=function(){S.playing?pause():play()};sync();
}
function reveal(c,instant){
  var els=$$(".rv");if(S.io){S.io.disconnect();S.io=null}
  if(instant||!("IntersectionObserver" in W)){D.body.classList.add("instant");els.forEach(function(e){e.classList.add("in")});requestAnimationFrame(function(){requestAnimationFrame(function(){D.body.classList.remove("instant")})});return}
  S.io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");S.io&&S.io.unobserve(e.target)}})},{rootMargin:"0px 0px -6% 0px"});
  els.forEach(function(e,i){if(e.classList.contains("in"))return;e.style.transitionDelay=(e.closest(".hero")?Math.min(i,8)*0.12:0)+"s";S.io.observe(e)});
}
function opened(c,instant){
  var el=$("#cover");S.opened=true;D.body.classList.remove("locked");
  if(!el){reveal(c,instant);return}
  if(instant){el.classList.add("gone");reveal(c,true);return}
  el.classList.add("opening");
  setTimeout(function(){el.classList.add("gone");reveal(c,false)},c.coverMs||1600);
}
function cover(c){
  var el=$("#cover");
  if(!el){D.body.classList.remove("locked");S.opened=true;reveal(c,c.mode==="editor"&&S.inited);return}
  if(S.opened||(c.mode==="editor"&&!S.replay)){opened(c,true);return}
  D.body.classList.add("locked");W.scrollTo(0,0);
  var go=function(e){if(e.type==="keydown"&&e.key!=="Enter"&&e.key!==" ")return;if(e.preventDefault)e.preventDefault();el.onclick=el.onkeydown=null;if(c.mode!=="editor")play();opened(c,false)};
  el.onclick=go;el.onkeydown=go;
  if(c.mode!=="editor")setTimeout(function(){try{el.focus({preventScroll:true})}catch(e){}},50);
}
function countdown(c){
  var el=$("#wic-count");if(!el||!c.target)return;
  var t=new Date(c.target).getTime();var b=$$("b",el);
  function tick(){var s=Math.max(0,Math.floor((t-Date.now())/1000));var v=[Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60),s%60];b.forEach(function(x,i){x.textContent=i?String(v[i]).padStart(2,"0"):String(v[i])});el.classList.toggle("done",s===0)}
  tick();S.timers.push(setInterval(tick,1000));
}
function rsvp(c){
  var f=$("#wic-rsvp");if(!f)return;
  var msg=$("#wic-rsvp-msg");
  function attending(){var r=$("input[name=attending]:checked",f);return r?r.value:"yes"}
  function toggle(){var yes=attending()==="yes";$$("[data-yes]",f).forEach(function(x){x.style.display=yes?"":"none"})}
  $$("input[name=attending]",f).forEach(function(r){r.onchange=toggle});toggle();
  f.onsubmit=function(e){
    e.preventDefault();
    var data={events:[]};
    $$("input,select,textarea",f).forEach(function(x){if(!x.name)return;if(x.type==="radio"||x.type==="checkbox"){if(!x.checked)return;if(x.name==="events"){data.events.push(x.value);return}}data[x.name]=x.value});
    if(!String(data.name||"").trim()){msg.textContent="Please add your name.";$("input[name=name]",f).focus();return}
    if(c.mode!=="live"){msg.textContent=c.mode==="editor"?"This is how your guests will reply. Replies are collected once your invitation is live.":"Preview only. Replies are collected once the invitation is live.";return}
    var btn=$("button[type=submit]",f);btn.disabled=true;msg.textContent="Sending…";
    fetch(c.rsvpUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}).then(function(r){return r.json()}).then(function(j){
      if(j&&j.ok){var p=D.createElement("p");p.className="thanks";p.textContent=data.attending==="no"?"Thank you for letting us know. You will be missed.":"Thank you! We can't wait to celebrate with you.";f.innerHTML="";f.appendChild(p)}
      else{msg.textContent=(j&&j.error)||"Something went wrong. Please try again.";btn.disabled=false}
    }).catch(function(){msg.textContent="Couldn't send. Please check your connection and try again.";btn.disabled=false});
  };
}
function fx(c){
  var layer=$("#fx");if(!layer)return;
  var key=c.effect+(c.effects?"1":"0");if(S.fxKey===key)return;S.fxKey=key;layer.innerHTML="";
  if(!c.effects||!c.effect||c.effect==="none")return;
  if(W.matchMedia&&W.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  var n=c.effect==="stars"?3:15;
  for(var i=0;i<n;i++){
    var p=D.createElement("i");p.className="p p-"+c.effect+" v"+(i%3);
    if(c.effect==="stars"){p.style.left=(40+Math.random()*60)+"%";p.style.top=(Math.random()*40)+"%";p.style.animationDuration=(9+Math.random()*8)+"s";p.style.animationDelay=(i*4+Math.random()*3)+"s"}
    else{p.style.left=(Math.random()*100)+"%";p.style.animationDuration=(10+Math.random()*10)+"s";p.style.animationDelay=(-Math.random()*20)+"s";p.style.setProperty("--drift",(Math.random()*120-60).toFixed(0)+"px");p.style.setProperty("--s",(0.6+Math.random()*0.7).toFixed(2))}
    layer.appendChild(p);
  }
}
function init(){
  S.timers.forEach(clearInterval);S.timers=[];
  var c=cfg();S.c=c;
  music(c);countdown(c);rsvp(c);fx(c);cover(c);
  S.inited=true;
}
W.addEventListener("message",function(e){
  var m=e.data;if(!m||typeof m!=="object"||typeof m.type!=="string")return;
  if(e.source!==W.parent)return;
  if(m.type==="wic:update"){
    var y=W.scrollY;
    if(typeof m.css==="string")$("#wic-css").textContent=m.css;
    var fl=$("#wic-fonts");if(m.fonts&&fl&&fl.getAttribute("href")!==m.fonts)fl.setAttribute("href",m.fonts);
    if(typeof m.html==="string")$("#wic-root").innerHTML=m.html;
    init();
    var g=S.goto&&Date.now()-S.goto.at<1500?D.getElementById("sec-"+S.goto.id):null;
    if(g)g.scrollIntoView({block:"start"});else W.scrollTo(0,y);
  }
  if(m.type==="wic:goto"){S.goto={id:m.id,at:Date.now()};var t=D.getElementById("sec-"+m.id);if(t)t.scrollIntoView({behavior:"smooth",block:"start"})}
  if(m.type==="wic:replay"){var el=$("#cover");if(!el)return;el.classList.remove("gone","opening");S.opened=false;S.replay=true;cover(S.c);S.replay=false}
});
if(D.readyState==="loading")D.addEventListener("DOMContentLoaded",init);else init();
})();`;
