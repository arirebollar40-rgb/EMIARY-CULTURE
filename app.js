const $=id=>document.getElementById(id);
const KEY="emiary_culture_data_v1", PINKEY="emiary_culture_pin_v1";
let data=JSON.parse(localStorage.getItem(KEY)||'{"products":[],"sales":[]}');
const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
async function hash(s){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
$("enter").onclick=async()=>{let p=$("pin").value;if(!/^\d{4}$/.test(p)){$("lockmsg").textContent="Escribe exactamente 4 números.";return}let h=await hash(p),old=localStorage.getItem(PINKEY);if(old&&old!==h){$("lockmsg").textContent="PIN incorrecto.";return}if(!old)localStorage.setItem(PINKEY,h);$("lock").hidden=true;$("app").hidden=false;render()};
function render(){ $("products").innerHTML=data.products.map((p,i)=>`<div class="item"><b>${esc(p.name)}</b><br>Existencia: ${p.stock} · Menudeo: $${p.retail.toFixed(2)} · Mayoreo: $${p.wholesale.toFixed(2)} ${p.stock<=2?'<span class="low"> · Pocas existencias</span>':''}<br><button onclick="removeProduct(${i})">Eliminar</button></div>`).join("")||"<p class=muted>Aún no hay productos.</p>";
$("saleProduct").innerHTML=data.products.map((p,i)=>`<option value="${i}">${esc(p.name)} (existencia: ${p.stock})</option>`).join("");
$("salesList").innerHTML=data.sales.slice().reverse().map(s=>`<div class=item>${esc(s.name)} · ${s.qty} pza(s) · $${s.total.toFixed(2)} · ${s.pay}<br><small>${s.date}</small></div>`).join("")||"<p class=muted>Aún no hay ventas.</p>"}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
window.removeProduct=i=>{if(confirm("¿Eliminar este producto?")){data.products.splice(i,1);save();render()}};
$("productForm").onsubmit=e=>{e.preventDefault();data.products.push({name:$("pname").value.trim(),stock:+$("pstock").value,retail:+$("pretail").value,wholesale:+$("pwholesale").value||0,min:+$("pmin").value||1});save();e.target.reset();$("pmin").value=1;render()};
$("saleForm").onsubmit=e=>{e.preventDefault();let p=data.products[+$("saleProduct").value];if(!p)return alert("Agrega primero un producto.");let q=+$("saleQty").value;if(q<1||q>p.stock)return alert("No hay existencia suficiente.");let wholesale=$("saleType").value==="wholesale";if(wholesale&&q<p.min)return alert("No alcanza el mínimo de mayoreo de este producto.");let price=wholesale&&p.wholesale>0?p.wholesale:p.retail;p.stock-=q;data.sales.push({name:p.name,qty:q,total:q*price,pay:$("salePay").value,date:new Date().toLocaleString("es-MX")});save();render();alert("Venta guardada.")};
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.hidden=true);$(b.dataset.tab).hidden=false});
$("export").onclick=()=>{let blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="respaldo-emiary-culture.json";a.click();URL.revokeObjectURL(a.href)};
$("importFile").onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let d=JSON.parse(await f.text());if(!Array.isArray(d.products)||!Array.isArray(d.sales))throw 0;data=d;save();render();alert("Respaldo restaurado.")}catch{alert("El archivo no parece ser un respaldo válido.")}};
$("logout").onclick=()=>location.reload();
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
