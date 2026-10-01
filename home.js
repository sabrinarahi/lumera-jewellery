const collections=[
{id:'rings',name:'Rings',image:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=88'},
{id:'necklaces',name:'Necklaces',image:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=88'},
{id:'bracelets',name:'Bracelets',image:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=88'}
];
const inventory=JSON.parse(localStorage.getItem('lumeraInventory')||'null')||DEFAULT_PRODUCTS;
let current=0,angle=0,dragStart=null,dragBase=0;
const stage=document.querySelector('#orbitStage');
function count(c){return inventory.filter(p=>p.collection===c&&p.stock>0).length}
function build(){stage.innerHTML=collections.map((c,i)=>`<button class="orbit-card" data-i="${i}"><img src="${c.image}" alt="${c.name}"><span><strong>${c.name}</strong><small>${count(c.id)} available pieces</small></span></button>`).join('');stage.querySelectorAll('.orbit-card').forEach(b=>b.onclick=()=>location.href=`category.html?cat=${collections[+b.dataset.i].id}`);render()}
function radius(){return innerWidth<620?200:innerWidth<900?280:390}
function render(){const r=radius(),step=360/collections.length;[...stage.children].forEach((card,i)=>{const a=angle+i*step,rad=a*Math.PI/180,x=Math.sin(rad)*r,z=Math.cos(rad)*r,d=(z+r)/(2*r);card.style.transform=`translate3d(${x}px,0,${z}px) rotateY(${-a}deg) scale(${.72+d*.28})`;card.style.opacity=.35+d*.65;card.style.zIndex=Math.round(z+r);card.style.filter=`blur(${Math.max(0,(1-(.35+d*.65))*2.5)}px)`});current=((Math.round(-angle/step)%collections.length)+collections.length)%collections.length;document.querySelector('#name').textContent=collections[current].name;document.querySelector('#count').textContent=`${count(collections[current].id)} available pieces`}
function move(d){current=(current+d+collections.length)%collections.length;angle=-current*(360/collections.length);render()}
document.querySelector('#prev').onclick=()=>move(-1);document.querySelector('#next').onclick=()=>move(1);
const wrap=document.querySelector('#orbitWrap');wrap.addEventListener('pointerdown',e=>{dragStart=e.clientX;dragBase=angle;wrap.setPointerCapture(e.pointerId)});wrap.addEventListener('pointermove',e=>{if(dragStart===null)return;angle=dragBase+(e.clientX-dragStart)*.35;render()});wrap.addEventListener('pointerup',()=>{if(dragStart===null)return;const s=360/collections.length;angle=Math.round(angle/s)*s;dragStart=null;render()});wrap.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')move(-1);if(e.key==='ArrowRight')move(1)});build();