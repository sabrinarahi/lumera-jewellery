const cinematicScenes=[
{img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=90',a:'#765cff',b:'#b77a56',type:'LUMÉRA',ry:-12,rz:-8,s:1,r:'50%'},
{img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=90',a:'#3457ff',b:'#934f7c',type:'RING',ry:28,rz:14,s:1.16,r:'50%'},
{img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=90',a:'#d19270',b:'#3c3175',type:'GOLD',ry:-34,rz:-19,s:.94,r:'38%'},
{img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=90',a:'#6e56ff',b:'#18527f',type:'FORM',ry:42,rz:25,s:1.1,r:'44%'}
];

const cObj=document.querySelector('#cinematicObject');
const cImg=document.querySelector('#cinematicImage');
const giant=document.querySelector('#giantType');
const a1=document.querySelector('.a1');
const a2=document.querySelector('.a2');
const counter=document.querySelector('#sceneCounter');
const progress=document.querySelector('#scrollProgress');
const face=document.querySelector('.object-face');
let cCurrent=-1, motion=true;

document.querySelector('#motionBtn').addEventListener('click',()=>{
  motion=!motion;
  document.querySelector('#motionBtn').textContent=motion?'Pause motion':'Resume motion';
});

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function updateCinematic(){
  const total=document.documentElement.scrollHeight-innerHeight;
  progress.style.width=`${total?scrollY/total*100:0}%`;

  const cinematic=document.querySelector('.cinematic');
  const rect=cinematic.getBoundingClientRect();
  document.querySelector('.cinematic-stage').style.visibility=rect.bottom>0?'visible':'hidden';

  const els=[...document.querySelectorAll('.cinematic-scene')];
  let active=0,local=0;
  els.forEach((el,i)=>{
    const r=el.getBoundingClientRect();
    if(r.top<=innerHeight*.55 && r.bottom>=innerHeight*.15){
      active=i;
      local=clamp((innerHeight*.55-r.top)/(r.height-innerHeight*.05),0,1);
    }
  });

  const s=cinematicScenes[active];
  if(cCurrent!==active){
    cCurrent=active;
    cImg.src=s.img;
    giant.textContent=s.type;
    a1.style.background=s.a;
    a2.style.background=s.b;
    face.style.borderRadius=s.r;
  }

  const drift=motion?Math.sin(performance.now()/1500+active)*4:0;
  const ry=s.ry+(local-.5)*55+drift;
  const rz=s.rz+(local-.5)*18;
  const scale=s.s+Math.sin(local*Math.PI)*.1;
  const lift=(local-.5)*-70;
  cObj.style.transform=`translate3d(0,${lift}px,${Math.sin(local*Math.PI)*70}px) rotateY(${ry}deg) rotateX(${(local-.5)*-18}deg) rotateZ(${rz}deg) scale(${scale})`;
  giant.style.transform=`translate(-50%,-50%) translateX(${(local-.5)*-110}px)`;
  counter.textContent=`SCENE ${String(active+1).padStart(2,'0')} · ${Math.round(local*100)}%`;
  requestAnimationFrame(updateCinematic);
}
requestAnimationFrame(updateCinematic);

// Original multipage 3D collection logic
const collectionData=[
{id:'rings',name:'Rings',image:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=88'},
{id:'necklaces',name:'Necklaces',image:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=88'},
{id:'bracelets',name:'Bracelets',image:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=88'}
];

const inventory=JSON.parse(localStorage.getItem('lumeraInventory')||'null')||DEFAULT_PRODUCTS;
let orbitCurrent=0,orbitAngle=0,dragStart=null,dragBase=0;
const orbitStage=document.querySelector('#orbitStage');

function availableCount(c){
  return inventory.filter(p=>p.collection===c&&p.stock>0).length;
}

function orbitRadius(){
  if(innerWidth<620)return 200;
  if(innerWidth<850)return 280;
  return 390;
}

function buildOrbit(){
  orbitStage.innerHTML=collectionData.map((c,i)=>`
    <button class="orbit-card" type="button" data-i="${i}" aria-label="Open ${c.name}">
      <img src="${c.image}" alt="${c.name}">
      <span><strong>${c.name}</strong><small>${availableCount(c.id)} available pieces</small></span>
    </button>`).join('');

  orbitStage.querySelectorAll('.orbit-card').forEach(card=>{
    card.addEventListener('click',()=>{
      const c=collectionData[Number(card.dataset.i)];
      location.href=`category.html?cat=${c.id}`;
    });
  });
  renderOrbit();
}

function renderOrbit(){
  const r=orbitRadius();
  const step=360/collectionData.length;
  [...orbitStage.children].forEach((card,i)=>{
    const a=orbitAngle+i*step;
    const rad=a*Math.PI/180;
    const x=Math.sin(rad)*r;
    const z=Math.cos(rad)*r;
    const d=(z+r)/(2*r);
    card.style.transform=`translate3d(${x}px,0,${z}px) rotateY(${-a}deg) scale(${.72+d*.28})`;
    card.style.opacity=.35+d*.65;
    card.style.zIndex=Math.round(z+r);
    card.style.filter=`blur(${Math.max(0,(1-(.35+d*.65))*2.5)}px)`;
  });
  orbitCurrent=((Math.round(-orbitAngle/step)%collectionData.length)+collectionData.length)%collectionData.length;
  const c=collectionData[orbitCurrent];
  document.querySelector('#collectionName').textContent=c.name;
  document.querySelector('#collectionCount').textContent=`${availableCount(c.id)} available pieces`;
}

function moveOrbit(dir){
  orbitCurrent=(orbitCurrent+dir+collectionData.length)%collectionData.length;
  orbitAngle=-orbitCurrent*(360/collectionData.length);
  renderOrbit();
}

document.querySelector('#prev').addEventListener('click',()=>moveOrbit(-1));
document.querySelector('#next').addEventListener('click',()=>moveOrbit(1));

const orbitWrap=document.querySelector('#orbitWrap');
orbitWrap.addEventListener('pointerdown',e=>{
  dragStart=e.clientX;
  dragBase=orbitAngle;
  orbitWrap.setPointerCapture(e.pointerId);
});
orbitWrap.addEventListener('pointermove',e=>{
  if(dragStart===null)return;
  orbitAngle=dragBase+(e.clientX-dragStart)*.35;
  renderOrbit();
});
orbitWrap.addEventListener('pointerup',()=>{
  if(dragStart===null)return;
  const step=360/collectionData.length;
  orbitAngle=Math.round(orbitAngle/step)*step;
  dragStart=null;
  renderOrbit();
});
orbitWrap.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft')moveOrbit(-1);
  if(e.key==='ArrowRight')moveOrbit(1);
});
buildOrbit();
