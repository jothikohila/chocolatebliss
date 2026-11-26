/* CHOCO BLISS — interactions, cart persistence and motion */
const products = [
 {id:"dark",name:"Midnight Dark",desc:"Bold 72% cocoa, beautifully intense.",price:349,rating:"4.9",tag:"Bestseller",srcs:["https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=700&q=80"],local:"assets/img/dark.svg"},
 {id:"milk",name:"Velvet Milk",desc:"Silky, creamy and wonderfully smooth.",price:299,rating:"4.8",tag:"Classic",srcs:["https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=700&q=80"],local:"assets/img/milk.svg"},
 {id:"hazelnut",name:"Hazelnut Dream",desc:"Roasted hazelnut with a gentle crunch.",price:429,rating:"4.9",tag:"Fan favourite",srcs:["https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=700&q=80"],local:"assets/img/hazelnut.svg"},
 {id:"caramel",name:"Golden Caramel",desc:"Soft caramel wrapped in rich cocoa.",price:379,rating:"4.7",tag:"Sweet moment",srcs:["https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=700&q=80"],local:"assets/img/caramel.svg"},
 {id:"strawberry",name:"Berry Blush",desc:"A delicate berry note, a dreamy finish.",price:359,rating:"4.8",tag:"Limited mood",srcs:["https://images.unsplash.com/photo-1623660053975-cf75a8be0908?auto=format&fit=crop&w=700&q=80"],local:"assets/img/berry.svg"},
 {id:"white",name:"Ivory Whisper",desc:"A mellow, buttery white chocolate.",price:329,rating:"4.6",tag:"Soft & sweet",srcs:["https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=700&q=80"],local:"assets/img/white.svg"}
];
const BOX_IMG={srcs:["https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=700&q=80"],local:"assets/img/blissbox.svg"};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
// Every picture sits on a local illustrated backdrop. The live photo fades in on top only if it loads, so no broken-image icon can appear.
function imgFrame(img,alt,cls=""){return `<div class="img-frame ${cls}" style="--fallback:url(${img.local})"><img data-srcs="${img.srcs.join("|")}" alt="${esc(alt)}"></div>`}
function loadImage(img){const list=(img.dataset.srcs||"").split("|").filter(Boolean);let i=0;
 const next=()=>{if(i>=list.length){img.remove();return}img.src=list[i++]};
 img.addEventListener("load",()=>img.classList.add("loaded"));img.addEventListener("error",next);
 if(list.length)next();else img.remove()}
function loadImages(root=document){root.querySelectorAll("img[data-srcs]:not([data-init])").forEach(img=>{img.dataset.init="1";loadImage(img)})}
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const money = value => "₹" + value.toLocaleString("en-IN");
let cart = readCart();
let featuredQty = 1;
let selectedFlavour = "Classic";
let toastTimer;
function readCart(){try{const data=JSON.parse(localStorage.getItem("chocoBlissCart"));return Array.isArray(data)?data.filter(i=>i&&i.key&&i.quantity>0&&Number.isFinite(i.price)):[]}catch{return []}}
function saveCart(){try{localStorage.setItem("chocoBlissCart",JSON.stringify(cart))}catch{}}
function renderProducts(){
 $("#productGrid").innerHTML=products.map((p,index)=>`
  <article class="product-card reveal" data-card="${p.id}" style="transition-delay:${index*70}ms">
   <div class="product-image">${imgFrame(p,p.name+" chocolate")}<span class="product-tag">${p.tag}</span></div>
   <div class="product-info"><div class="product-top"><h3>${p.name}</h3><span class="product-price">${money(p.price)}</span></div>
   <p class="product-desc">${p.desc}</p><div class="product-rating">★★★★★ <span>${p.rating} · Loved by you</span></div>
   <button class="card-add" data-add="${p.id}">Add to bag <span>＋</span></button></div>
  </article>`).join("");
 // Add listeners once the dynamic product cards are in the DOM.
 $$("#productGrid [data-add]").forEach(button=>button.addEventListener("click",()=>addToCart(button.dataset.add)));
 loadImages();observeReveals();
}
function addToCart(id,quantity=1,flavour=""){
 const product=products.find(item=>item.id===id);
 if(!product)return;
 const key=flavour?`${id}-${flavour}`:id;
 const found=cart.find(item=>item.key===key);
 if(found)found.quantity+=quantity;
 else cart.push({key,id,quantity,flavour,price:id==="blissbox"?899:product.price,name:id==="blissbox"?"Bliss Box · "+flavour:product.name,srcs:product.srcs,local:product.local});
 saveCart();renderCart();showToast(`${product.name} added to your bag`);
}
function addFeatured(){
 const p={id:"blissbox",name:"Bliss Box · "+selectedFlavour,price:899};
 const key="blissbox-"+selectedFlavour,existing=cart.find(x=>x.key===key);
 if(existing)existing.quantity+=featuredQty;
 else cart.push({key,id:"blissbox",name:p.name,price:p.price,srcs:BOX_IMG.srcs,local:BOX_IMG.local,quantity:featuredQty,flavour:selectedFlavour});
 saveCart();renderCart();showToast("Your Bliss Box is in the bag");
}
function renderCart(){
 const count=cart.reduce((sum,item)=>sum+item.quantity,0);
 $("#cartCount").textContent=count;$("#drawerCount").textContent=`(${count})`;
 $("#cartTotal").textContent=money(cart.reduce((sum,item)=>sum+item.price*item.quantity,0));
 if(!cart.length){$("#cartItems").innerHTML='<div class="empty-cart">Your bag is waiting<br><small style="font:10px var(--sans)">for a little bliss.</small></div>';return}
 $("#cartItems").innerHTML=cart.map(item=>`<div class="cart-item">
  ${imgFrame({srcs:item.srcs||[],local:item.local||"assets/img/blissbox.svg"},item.name,"cart-thumb")}<div><h3>${esc(item.name)}</h3><p>${esc(item.flavour||"Handcrafted chocolate")}</p><div class="cart-item-controls"><button data-change="${item.key}" data-delta="-1" aria-label="Decrease">−</button><span>${item.quantity}</span><button data-change="${item.key}" data-delta="1" aria-label="Increase">+</button><button class="remove-item" data-remove="${item.key}">Remove</button></div></div><strong class="cart-item-price">${money(item.price*item.quantity)}</strong></div>`).join("");
 loadImages($("#cartItems"));
 $$("[data-change]").forEach(btn=>btn.addEventListener("click",()=>changeQuantity(btn.dataset.change,Number(btn.dataset.delta))));
 $$("[data-remove]").forEach(btn=>btn.addEventListener("click",()=>removeItem(btn.dataset.remove)));
}
function changeQuantity(key,delta){const item=cart.find(x=>x.key===key);if(!item)return;item.quantity+=delta;if(item.quantity<1)cart=cart.filter(x=>x.key!==key);saveCart();renderCart()}
function removeItem(key){cart=cart.filter(x=>x.key!==key);saveCart();renderCart();showToast("Item removed")}
function toggleCart(open){const active=typeof open==="boolean"?open:!$("#cartDrawer").classList.contains("active");$("#cartDrawer").classList.toggle("active",active);$("#cartOverlay").classList.toggle("active",active);$("#cartDrawer").setAttribute("aria-hidden",String(!active));$("#cartDrawer").inert=!active;if(!active)$("#checkoutMsg").textContent="";document.body.classList.toggle("cart-open",active);if(active)$("#closeCart").focus();else $("#openCart").focus()}
function showToast(message){const toast=$("#toast");toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2600)}
// Scroll reveal uses IntersectionObserver to avoid expensive scroll handlers.
let revealObserver;
function observeReveals(){if(!("IntersectionObserver"in window)){ $$(".reveal").forEach(el=>el.classList.add("visible"));return}
 if(!revealObserver)revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");revealObserver.unobserve(entry.target)}}),{threshold:.12});
 $$(".reveal:not(.visible)").forEach(el=>revealObserver.observe(el));
}
function setupCardTilt(){const cards=$$(".product-card");cards.forEach(card=>{card.addEventListener("pointermove",event=>{if(matchMedia("(pointer: coarse)").matches)return;const rect=card.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;card.style.transform=`translateY(-6px) rotateX(${y*-4}deg) rotateY(${x*5}deg)`});card.addEventListener("pointerleave",()=>card.style.transform="")})}
const reviews=[
 {quote:"The kind of chocolate that turns an ordinary evening into a little celebration.",name:"Ananya R.",meta:"Verified chocolate lover",initial:"A"},
 {quote:"Beautifully packed, ridiculously delicious. The perfect gift — including one for myself.",name:"Meera S.",meta:"A very happy customer",initial:"M"},
 {quote:"You can taste the care in every bite. The hazelnut one is officially my favourite.",name:"Rohan K.",meta:"Bliss Box enthusiast",initial:"R"}
];let reviewIndex=0,reviewInterval;
function showReview(index){reviewIndex=(index+reviews.length)%reviews.length;const r=reviews[reviewIndex];$("#reviewQuote").textContent="“"+r.quote+"”";$("#reviewName").textContent=r.name;$("#reviewMeta").textContent=r.meta;$("#reviewAvatar").textContent=r.initial;$("#reviewProgress").style.width=((reviewIndex+1)/reviews.length*100)+"%"}
function startReviews(){clearInterval(reviewInterval);reviewInterval=setInterval(()=>showReview(reviewIndex+1),6000)}
function initFlavours(){$$("#flavourOptions .flavour").forEach(btn=>btn.addEventListener("click",()=>{$$("#flavourOptions .flavour").forEach(b=>{b.classList.remove("active");b.setAttribute("aria-pressed","false")});btn.classList.add("active");btn.setAttribute("aria-pressed","true");selectedFlavour=btn.dataset.flavour}))}
function setupNavigation(){
 $("#menuToggle").addEventListener("click",()=>{const open=$("#mainNav").classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(open))});
 $$("#mainNav a").forEach(link=>link.addEventListener("click",()=>{$("#mainNav").classList.remove("open");$("#menuToggle").setAttribute("aria-expanded","false")}));
 $("#openCart").addEventListener("click",()=>toggleCart(true));$("#closeCart").addEventListener("click",()=>toggleCart(false));$("#cartOverlay").addEventListener("click",()=>toggleCart(false));
 document.addEventListener("keydown",event=>{if(event.key==="Escape")toggleCart(false)});
 window.addEventListener("scroll",()=>$("#top").classList.toggle("scrolled",window.scrollY>25),{passive:true});
}
function setupForm(){
 $("#contactForm").addEventListener("submit",event=>{event.preventDefault();const name=$("#name"),email=$("#email"),message=$("#message"),status=$("#formStatus");if(!name.checkValidity()||!email.checkValidity()||!message.checkValidity()){status.className="form-status error";status.textContent=!name.checkValidity()?"Please enter your name (at least 2 characters).":!email.checkValidity()?"Please enter a valid email address, like you@example.com.":"Your message needs at least 10 characters.";(!name.checkValidity()?name:!email.checkValidity()?email:message).focus();return}
 status.className="form-status success";status.textContent="Thank you, "+name.value.trim()+"! Your message is ready. (Demo form — no message was sent.)";event.target.reset()});
}
function createParticles(){const holder=$(".cocoa-particles");for(let i=0;i<24;i++){const dot=document.createElement("span");dot.style.left=(Math.random()*100)+"%";dot.style.bottom=(-Math.random()*120)+"px";dot.style.animationDelay=(-Math.random()*9)+"s";dot.style.animationDuration=(7+Math.random()*7)+"s";holder.appendChild(dot)}}
window.addEventListener("DOMContentLoaded",()=>{
 renderProducts();loadImages();renderCart();setupNavigation();setupCardTilt();initFlavours();setupForm();createParticles();observeReveals();showReview(0);startReviews();
 $("#qtyMinus").addEventListener("click",()=>{featuredQty=Math.max(1,featuredQty-1);$("#featuredQty").textContent=featuredQty});
 $("#qtyPlus").addEventListener("click",()=>{featuredQty=Math.min(20,featuredQty+1);$("#featuredQty").textContent=featuredQty});
 $("#featuredAdd").addEventListener("click",addFeatured);
 $("#reviewPrev").addEventListener("click",()=>{showReview(reviewIndex-1);startReviews()});$("#reviewNext").addEventListener("click",()=>{showReview(reviewIndex+1);startReviews()});
 $("#checkoutBtn").addEventListener("click",()=>{const msg=$("#checkoutMsg");if(!cart.length){msg.textContent="Your bag is empty. Add a chocolate first.";return}msg.textContent="Demo only: no payment system is connected, so no order has been placed.";showToast("Checkout is a demo — no order placed");});
 $("#year").textContent=new Date().getFullYear();
 window.addEventListener("load",()=>setTimeout(()=>$("#loader").classList.add("done"),450));
 setTimeout(()=>$("#loader").classList.add("done"),1800);
});
