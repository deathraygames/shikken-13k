!function(){function i(){return{x:B(C.world.width/2),y:B(C.world.height)}}function r(e="U"){return[e,B(9999).toString(36),Number(new Date).toString(36)].join("-")}function s(e,n,i){e.map((e,t)=>i(n[e],e,t))}function n(){return 1+C.buildingKeys.reduce((e,t)=>e+(L[C.buildings[t].type].popMax||0),0)}function l(){return C.buildingKeys.reduce((e,t)=>e+(L[C.buildings[t].type].defMax||0),0)}function c(e,t,n={}){var i=e<t;if(e={key:r("R"),from:i?e:t,to:i?t:e,...n},C.roads[e.key])throw Error("Existing building");C.roads[e.key]=e,C.roadKeys.push(e.key)}function u(e,t=0){var n=L[e.type]["rate"];n?(t=Number.isNaN(t)?0:t,e.prodHeat=1/n*6e4+t,C.godMode&&(e.prodHeat=1),e.prodCool=e.prodHeat):e.prodCool=0}function d(e={},t=null){if(u(e={key:r("B"),type:"connector",supplied:!1,prodCool:0,prodHeat:0,on:!0,inv:[],refresh:!1,...i(),...e}),C.buildings[e.key])throw Error("Existing building");return console.log("Adding building",e),C.buildings[e.key]=e,C.buildingKeys.push(e.key),t&&c(e.key,t),e}function F(e={},t){var n;if([n={}]=[e],e={key:r("M"),job:"idle",faction:"japan",hp:100,defense:.5,carry:null,weapon:null,buildingKey:null,path:[],inv:[],...i(),...n},C.meeples[e.key])throw Error("Existing meeple");return console.log("Adding meeple",e),C.meeples[e.key]=e,t.push(e.key),e}function p(e={}){return!(C.citizenKeys.length>=n())&&F(e,C.citizenKeys)}function A(){return H.reduce((e,t)=>({...e,[t]:0}),{})}function T(){return C.citizenKeys.reduce((e,t)=>(e[(t=C.meeples[t]).job]=(e[t.job]||0)+1,e),A())}function W(e){var t=L[e.type].r+4,n=0===e.prodHeat?0:1-e.prodCool/e.prodHeat,e=(e=document.getElementById(e.key)).querySelector(".b-prod-circle");if(!e)throw Error("No circle element");var i=2*t*Math.PI;n*=i,z(e,{r:t,"stroke-width":"10","stroke-dasharray":[n,i-n].join(" "),"stroke-dashoffset":40})}function D(e,t){var{shape:n,sides:i,r,offsetAngle:a=0}=xe[e],n=(t=S(n,t),function(t,n,i=0){var r=[];for(let e=0;e<t;e+=1){var a=i+e/t*E,{x:a,y:o}=N().setAngle(a,n);r.push([a,o].map(e=>Math.round(100*e)/100))}return r}(i,r,a).map(e=>e.join(",")).join(" "));return z(t,{points:n,r:r,class:"res res-"+e,"data-res":e}),t}function Y(e,n,i=10){const t=[...n.children],r=[...e];t.forEach(e=>{var t=e.dataset["res"];!t||-1===(t=r.indexOf(t))?e.remove():r.splice(t,1)}),r.forEach(e=>{e=D(e,n);var t=N(0,0).setAngle(O(2*Math.PI),O(i));e.style.cx=t.x,e.style.cy=t.y,e.style.transform=q(t)})}function P(){const a=C.world["layers"];s(C.buildingKeys,C.buildings,e=>{var t,n,i=L[e.type],r=document.getElementById(e.key);r&&e.refresh&&(r.remove(),r=null,e.refresh=!1),r||(t=L[e.type],r=S("g",a.building),z(r,{id:e.key,style:"transform: "+q(e)}),n=S("circle",r),z(n,{class:"b-prod-circle b-prod-"+e.type}),W(e),n=S("circle",r),z(n,{r:t.r,class:"building b-"+e.type}),n=S("polygon",r),z(n,{points:t.emblem||"",class:"b-emblem",style:`transform: scale(${1.2*t.r/40}) `+q({x:-20,y:-20})}),t=S("g",r),z(t,{class:"b-res-g res-g"})),r.classList.toggle("closed",!e.on),r.classList.toggle("selectedb",e.key===C.selectedBuildingKey),W(e),Y(e.inv,r.querySelector(".res-g"),i.r)})}function R(e,t){var n=document.getElementById(e.key);n||(n=S("g",t),z(n,{id:e.key,style:"transform: "+q(e),class:"meeple-g"}),t=S("circle",n),z(t,{r:9,class:"meeple mj-"+e.job}),t=S("g",n),z(t,{class:"m-res-g res-g"})),t=n.querySelector(".meeple"),z(t,{class:"meeple mj-"+e.job}),n.classList.toggle("hurt",e.hp<100),n.style.transform=q(e),Y(e.inv,n.querySelector(".res-g"),9)}function G(r){H.forEach(e=>{var t=document.querySelector("#jr-"+e),n=t.querySelector('input[type="range"]'),i=t.querySelector(".jr-num");r(e,n,t,i)})}function X(){var r,a,o;C.assigning&&(r=T(),a=C.citizenKeys.length,o=Math.min(a,l()),G((e,t,n,i)=>{n=r[e],i.innerText=n,t.max!==(e="defe"===e?o:a)&&(t.setAttribute("max",e),t.max=e),t.value!==n&&(t.setAttribute("value",n),t.value=n)}))}function U(e){var t,n,i,r;e&&(e=(t=e)?(n=L[t.type],i=`<div class="switch">
		${(i=(e,t,n,i)=>`<button id="${e}"${t?' class="active"':""}><i>${n}</i><b>${i}</b></button>`)("b-on",t.on,"🕯️","On")}
		${i("b-off",!t.on,"🚫","Off")}
	</div>`,r="",a(t)&&(r=Math.floor(100*(0===t.prodHeat?0:1-t.prodCool/t.prodHeat)),r=h(t)?r+"%":""),r=`<div>🪚 Production:
			<span class="prodin ${t.supplied?"supplied":"missing"}">
				${n.input.length?n.input.join(", "):"(No input)"}
			</span>
			➡️ ${n.output.length?n.output.join(", "):"(No output)"}
			<span>(${n.rate}/min)</span>
			<span id="b-progress">${r}</span>
		</div>`,`<div class="b-info">
			<div class="b-name">${n.classification} ${n.name||t.type}</div>
			${a(t)?r:""}
			${n.popMax?`<div>+${n.popMax} max citizens</div>`:""}
			${n.defMax?`<div>+${n.defMax} max defenders</div>`:""}
			<div>📦 Resources: ${t.inv.length?t.inv.join(", "):"None"} (${t.inv.length} / max: ${n.cap})</div>
		</div>
		<div>
			${i}
		</div>`):"",I("#binfo",e))}function J(){(t=document.querySelector("main").classList).toggle("bselected",C.selectedBuildingKey),t.toggle("looping",C.looping),t.toggle("creating",C.creating),t.toggle("moving",C.moving),t.toggle("assigning",C.assigning),t.toggle("pop",0<C.citizenKeys.length),t.toggle("intro","intro"===C.state),t.toggle("game","game"===C.state),t.toggle("flash",C.flashMessage),C.countdownEl||(C.countdownEl=document.getElementById("cd"));var e=C.countdown,t=Math.floor(1/60*e*.001),e=Math.floor(.001*(e-6e4*t));I(C.countdownEl,C.peace?"☮️":`⚔️ ${t}:`+(e<10?"0":"")+e),I("#karma",C.karma?`☸️ Karma: ${C.karma} /300`:""),document.querySelector("#kamikaze").style.display=300<=C.karma?"block":"none",C.selectedBuildingKey&&(U(t=C.buildings[C.selectedBuildingKey]),t=L[t.type]["upgrades"],t=t.length?t.map(e=>{var{name:t=e,cost:n,classification:i}=L[e];return`<li class="up-action ${V(n)?"affordable":"unaffordable"}" data-upgrade="${e}" data-building="${C.selectedBuildingKey}">
					<span class="up-name">${i} ${t}</span>
					<span class="up-cost">${n}</span>
				</li>`}).join(""):"No upgrades",I("#blist",C.upgradesOpen?t:"")),e=`${C.citizenKeys.length} / max: ${n()}, Defenders max: `+l(),I("#mcounts",e)}function g(){var i,e=C.world,t=(e.el.style.top=e.y+"px",e.el.style.left=e.x+"px",C.world.height*C.zoom);e.el.style.width=C.world.width*C.zoom+"px",e.el.style.height=t+"px",i=e.layers,P(),s(C.roadKeys,C.roads,e=>{var t,n;document.getElementById(e.key)||((t=S("line",i.road)).id=e.key,n=C.buildings[e.from],e=C.buildings[e.to],z(t,{x1:n.x,y1:n.y,x2:e.x,y2:e.y,class:"road"}))}),s(C.citizenKeys,C.meeples,e=>R(e,i.meeple)),s(C.invaderKeys,C.meeples,e=>R(e,i.meeple)),J()}function Q(e,t,n){C.flashMessage={title:e,text:t,emoji:n},I("#flash i",n),I("#flash h1",e),I("#flash p",t),g(),me()}function t(e=[]){const t=function(){const t={},e=e=>{e.inv.forEach(e=>{t[e]=(t[e]||0)+1})};return s(C.buildingKeys,C.buildings,e),s(C.citizenKeys,C.meeples,e),t}(),n=e.reduce((e,t)=>({...e,[t]:(e[t]||0)+1}),{}),i={};return Object.keys(n).forEach(e=>{i[e]=n[e]-(t[e]||0),i[e]<0&&(i[e]=0)}),i}function V(e=[]){const n=t(e);return Object.keys(n).reduce((e,t)=>e+n[t],0)<=0}function o(t){return C.buildingKeys.filter(e=>(e=C.buildings[e],t(e,L[e.type])))}function Z(n){let i=1/0,r=null;return s(C.buildingKeys,C.buildings,e=>{var t=N(e).distance(n);t>=i||(i=t,r=e)}),r}function _(e,t){var n=L[t.type];return N(t).distance(e)<=n.r}function y(e){var t,n=Z(e);return!n||(t=L[n.type],N(n).distance(e)>t.r)?null:n}function ee(e=[],n){const i="string"==typeof e?[e]:[...e];if(20<=i.length||i.includes(n))return i;var r;if(r=i[i.length-1],(e=C.roadKeys.reduce((e,t)=>((t=C.roads[t]).from===r?e.push(t.to):t.to===r&&e.push(t.from),e),[])).includes(n))return i.concat(n);let a=1/0,o=null;return e=e.map(e=>{let t=[...i];return i.includes(e)||(t.push(e),(t=ee(t,n)).includes(n)&&t.length<=a&&(o=t,a=t.length)),t}),null===o?e[0]:o}function a(e){return(e=L[e.type]).input&&e.input.length||e.output&&e.output.length}function h(e){return a(e)&&e.on}function f(e,t){var n=y(e);return n&&(!t||t.key===n.key)&&(t=h(n),n=L[n.type],t)&&("prod"===e.job&&"🪚"===n.classification||"spir"===e.job&&"☸️"===n.classification)}function te(e){if(!e.on)return[...e.inv];const i=[...L[e.type].input];return e.inv.reduce((e,t)=>{var n=i.indexOf(t);return 0<n?i.splice(n,1):e.push(t),e},[])}function m(e){return e.inv.length>=L[e.type].cap}function ne(e,t=[]){let n=1/0,i=null;const r=N(e);return t.forEach(e=>{e=C.meeples[e];var t=r.distance(e);t>=n||(n=t,i=e)}),{nearest:i,distance:n}}function ie(e){var t=C.citizenKeys.indexOf(e.key);-1!==t&&C.citizenKeys.splice(t,1),-1!==(t=C.invaderKeys.indexOf(e.key))&&C.invaderKeys.splice(t,1),delete C.meeples[e.key],document.getElementById(e.key).remove()}function re(e,t){var n=t/2;e.hp-=t+B(n)-B(n)}function v(e,t=[],n=!1){{if(t.length){if(n&&([n,o=[]]=[e.inv,t],0!==n.reduce((e,t)=>(0<=(t=e.indexOf(t))&&e.splice(t,1),e),[...o]).length))return[...t];var[i,r=[]]=[e.inv,t];if(!r.length)return[];r=[...r];for(let e=i.length;e--;e){var a=r.indexOf(i[e]);0<=a&&(r.splice(a,1),i.splice(e,1))}return r}return[]}var o}function ae(e,t){return!(!e.inv.length||!_(e,t)||(e=e.inv.shift(),t.inv.push(e),0))}function w(e){return!!(e.path.length&&(n=(t=e).path[0],i=2,N(t).distance(n)<=i))&&(e.path.shift(),!0);var t,n,i}function oe(e,t,n){var i=N(t),{x:n,y:t}=(n&&(t=N(e),i=(i=i.subtract(t)).clampLength(n),i=t.add(i)),i);e.path=[{x:n,y:t}]}function b(e,t){void 0!==(t=(t=(t="string"==typeof t?[t]:t).length?t:C.buildingKeys)[B(t.length)])&&(e.path=(t=C.buildings[t],(e=Z(e=e))?ee([e.key],t.key).map(e=>{var t=C.buildings[e];return{key:e,x:t.x,y:t.y}}):[]))}function k(e,t,n,i){i*=n,n=N(e),t=N(t).subtract(n).clampLength(i),t=n.add(t),e.x=t.x,e.y=t.y}function se(e,t){e.x+=(t*=.0225)*(2*(0|O(2))-1),e.y+=t*(2*(0|O(2))-1)}function x(e){var t;e.inv.length&&(t=y(e))&&(e=ae(e,t))}function M(e,t){return!C.invaderKeys.length&&e.hp<100&&(e.hp=Math.min(100,e.hp+.005*t),1)}function le(e,t){w(e),e.path.length?M(e,t)||k(e,e.path[0],t,.03):(x(e),b(e,C.buildingKeys))}function ce(e,t){w(e),e.path.length?M(e,t)||k(e,e.path[0],t,.12):(x(e),(f(e)?se:(t=o((e,t)=>h(e)&&"🪚"===t.classification),b))(e,t))}function ue(a,e){var t,n,i,r=w(a);if(a.path.length)M(a,e)||k(a,a.path[0],e,.132*(a.inv.length?.6:1));else{if(e=[],e=y(a),a.inv.length){if(r&&e)return void ae(a,e);0===(e=o(e=>{return t=e,n=a.inv[0],!!t.on&&(i=(e,t)=>e+(t===n?1:0),r=L[t.type].input.reduce(i,0),(t=t.inv.reduce(i,0))<r)&&!m(e);var t,n,i,r})).length&&(e=o((e,t)=>"📦"===t.classification&&!m(e)&&e.on))}else{if(r&&e)return r=e,void(0<(t=a).inv.length||!_(t,r)||!(i=te(r)).length||0<v(r,[n=n&&i.includes(n)?n:i[B(i.length)]],!0).length||t.inv.push(n));e=o(e=>(e=te(e))&&e.length)}b(a,e)}}function de(e,t){if(w(e),e.path.length)M(e,t)||k(e,e.path[0],t,.12);else{x(e);const i=y(e),r=i&&"🛡️"===L[i.type].classification;r&&(e.defense=Math.min(e.defense+.01,.9)),0<C.invaderKeys.length?oe(e,t=C.meeples[(n=C.invaderKeys)[B(n.length)]],90):b(e,t=o((e,t)=>"🛡️"===t.classification&&(!r||i.key!==e.key)))}var n}function pe(e,t){w(e),e.path.length?M(e,t)||k(e,e.path[0],t,.12):(f(e)?se:(t=o((e,t)=>h(e)&&"☸️"===t.classification),b))(e,t)}function ge(e,t){w(e);var n=y(e);n&&(u(n),O()<.5)&&n.inv.length&&n.inv.pop(),e.path.length?k(e,e.path[0],t,.12):(t=C.citizenKeys,n=C.meeples[t[B(t.length)]],O()<.3&&(t=ne(e,t)["nearest"],n=t),oe(e,n,180))}function ye(s){var e=e=>{var t;(e=C.meeples[e]).hp<=0?ie(e):(t={idle:le,prod:ce,carr:ue,defe:de,spir:pe,kill:ge})[e.job]&&t[e.job](e,s)};C.citizenKeys.forEach(e),C.invaderKeys.forEach(e),C.buildingKeys.forEach(e=>{e=C.buildings[e];var t,n,i,r,a,o=L[e.type];(o.output||o.input)&&e.on&&(o.input.length||(e.supplied=!0),e.supplied?(t=Math.min((a=e,C.citizenKeys.reduce((e,t)=>e+(f(C.meeples[t],a)?1:0),0)),6),n=o.autoWork?1:0,e.prodCool-=s*(t?t/t**.55:n),0<e.prodCool||(e.prodCool=0,[t,n=[]]=[e,o.output],(n.includes("meeple")?({x:i,y:r}=t,p({x:i,y:r})):n.includes("karma")?(n.forEach(e=>{"karma"===e&&(C.karma+=1)}),1):!m(t)&&(t.inv=t.inv.concat([...n]),1))&&(e.supplied=!1,u(e,e.prodCool)))):0<v(e,o.input,!0).length||(e.supplied=!0))});{const i=C.citizenKeys;C.invaderKeys.forEach(e=>{var{nearest:t,distance:n}=ne(e=C.meeples[e],i);n<=13.5&&(O()>e.defense&&re(e,20),O()>t.defense)&&re(t,20)})}}function he(){if(C.looping){var t=Number(new Date),e=C.lastTime?t-C.lastTime:0;if(C.lastTime=t,C.peace)C.countdown=0;else if(C.countdown-=e,C.countdown<=0){t=C.citizenKeys.length;for(let e=0;e<t;e+=1)F({key:r("I"),job:"kill",faction:"mongol",hp:100,defense:.2,x:0,...void 0},C.invaderKeys);C.countdown=24e4}ye(e),g(),setTimeout(he,100)}}function fe(){C.looping=!0,C.lastTime=0,he()}function me(){C.looping=!1}function ve(n,i={}){const r=n.target;Object.keys(i).forEach(e=>{var t=r.closest(e);t&&i[e](n,t)}),J()}function we(e){const t=()=>{var e=C.buildings[C.selectedBuildingKey];e.on=!e.on};ve(e,{".up-action":(e,t)=>{var{building:n,upgrade:i}=t.dataset;if(e=C.buildings[n],{upgrades:t=[]}=L[e.type],!t.includes(i))throw Error("Unknown upTypeKey");!function(e,n=[]){if(V(n)){let t=[...n];return t=v(e,t),s(C.buildingKeys,C.buildings,e=>{t=v(e,t)}),s(C.citizenKeys,C.meeples,e=>{t=v(e,t)}),1}}(e,L[i].cost)||(e.type=i,e.refresh=!0,u(e),P()),C.creating=!1},"#b-on":()=>t(),"#b-off":()=>t(),"#cd":()=>C.countdown-=1e4,"#kamikaze":()=>{C.karma<300||(C.karma-=300,C.countdown+=18e4,C.kamikazes+=1,2<=C.kamikazes?(C.peace=!0,Q("Kamikaze!","Another divine wind washes away the Khan's fleet! Kublai Khan decides Japan is not worth conquering. You win!","💨🌪️🌊")):Q("Kamikaze!","A divine wind washes away the Khan's fleet!","💨🌪️🌊"))}})}function be(e){const t=(e,t)=>{e=e.target.parentNode.querySelector('input[type="range"]'),t=Number(e.value||0)+t,e.setAttribute("value",t),e.value=t,t=new Event("change"),e.dispatchEvent(t)};ve(e,{"#play":fe,"#pause":me,"#build":()=>C.creating=!0,"#upgra":()=>{C.upgradesOpen=!C.upgradesOpen,C.creating=!1,C.assigning=!1},"#cancel":()=>C.creating=!1,"#restart":()=>window.location.reload(),"#jobs":()=>{C.upgradesOpen=!1,C.creating=!1,C.assigning=!C.assigning,X()},".dec-range":e=>t(e,-1),".inc-range":e=>t(e,1)})}function ke(i){var e=i["el"];let r;var a=i.x,o=i.y,t=()=>{r=null,C.moving=!1,g()};e.addEventListener("pointerup",t),e.addEventListener("pointercancel",t),e.addEventListener("pointerout",t),e.addEventListener("pointerleave",t),j(e,"pointermove",e=>{var t;r&&(t=e.clientY-r.clientY,i.x=a+(e.clientX-r.clientX),i.y=o+t,g(),e.preventDefault())}),j(e,"pointerdown",e=>{var t=e.target,n=t.classList;C.state="game",n.contains("building")?(t=C.buildings[t.closest("g").id],C.creating&&C.selectedBuildingKey&&(c(t.key,C.selectedBuildingKey),C.creating=!1),C.selectedBuildingKey=t.key):C.creating&&C.selectedBuildingKey?(C.creating=!1,t=d({x:e.offsetX,y:e.offsetY,type:"connector"},C.selectedBuildingKey),C.selectedBuildingKey=t.key):(C.selectedBuildingKey=null,C.upgradesOpen=!1,C.assigning=!1),e.preventDefault(),g(),C.moving=!0,r=e,a=i.x,o=i.y,e.preventDefault()}),j(document.querySelector("#flash"),"pointerdown",()=>{C.flashMessage=null,g()}),j(document.querySelector("#bui"),"pointerdown",be),j(document.querySelector("#tui"),"pointerdown",we),G((r,a)=>{j(a,"change",()=>{var e=function(i,e){const r=T(),a={...r,[i]:e};if((e=a[i]-r[i])<=0)a.idle+=-1*e;else{let n=e;if("idle"!==i&&(e=Math.min(r.idle,e),n-=e,a.idle-=e),!(n<=0)){const o=H.reduce((e,t)=>(t!==i&&"idle"!==t&&e.push(t),e),[]);o.forEach((e,t)=>{t=Math.min(Math.ceil(n/(o.length-t||1)),r[e]),n-=t,a[e]-=t})}}return a}(r,Number(a.value)||0);{var[t={}]=[e];const n=A(),i=e=>(n[e]||0)<t[e];s(C.citizenKeys,C.meeples,e=>{e=(i(e.job)||(e.job=H.find(i)||"idle",e.path=[]),e.job),n[e]=(n[e]||0)+1}),H.forEach(()=>{})}X(),g()})})}const K=window.enableAsserts?(...e)=>console.assert(...e):()=>{};class ${constructor(e=0,t=0){this.x=e,this.y=t}copy(){return new $(this.x,this.y)}add(e){return K(null!=e.x),new $(this.x+e.x,this.y+e.y)}subtract(e){return K(null!=e.x),new $(this.x-e.x,this.y-e.y)}multiply(e){return K(null!=e.x),new $(this.x*e.x,this.y*e.y)}divide(e){return K(null!=e.x),new $(this.x/e.x,this.y/e.y)}scale(e){return K(null==e.x),new $(this.x*e,this.y*e)}length(){return this.lengthSquared()**.5}lengthSquared(){return this.x**2+this.y**2}distance(e){return this.distanceSquared(e)**.5}distanceSquared(e){return(this.x-e.x)**2+(this.y-e.y)**2}normalize(e=1){var t=this.length();return t?this.scale(e/t):new $(0,e)}clampLength(e=1){var t=this.length();return e<t?this.scale(e/t):this}dot(e){return K(null!=e.x),this.x*e.x+this.y*e.y}cross(e){return K(null!=e.x),this.x*e.y-this.y*e.x}angle(){return Math.atan2(this.x,this.y)}setAngle(e=0,t=1){return this.x=t*Math.sin(e),this.y=t*Math.cos(e),this}rotate(e){var t=Math.cos(e);return e=Math.sin(e),new $(this.x*t-this.y*e,this.x*e+this.y*t)}direction(){return abs(this.x)>abs(this.y)?this.x<0?3:1:this.y<0?2:0}invert(){return new $(this.y,-this.x)}floor(){return new $(Math.floor(this.x),Math.floor(this.y))}area(){return abs(this.x*this.y)}lerp(e,t){return K(null!=e.x),this.add(e.subtract(this).scale(clamp(t)))}arrayCheck(e){return 0<=this.x&&0<=this.y&&this.x<e.x&&this.y<e.y}toString(e=3){return`(${(this.x<0?"":" ")+this.x.toFixed(e)},${(this.y<0?"":" ")+this.y.toFixed(e)} )`}}const E=2*Math.PI,j=(e,t,n)=>e.addEventListener(t,n),S=(e,t)=>(e=document.createElementNS("http://www.w3.org/2000/svg",e),t.appendChild(e),e),z=(t,n)=>{Object.keys(n).forEach(e=>{t.setAttribute(e,n[e])})},I=(e,t)=>{var n="object"==typeof e?e:document.querySelector(e);if(n)return n.innerHTML!==t&&(n.innerHTML=t,!0);throw Error("Cannot find element "+e)},q=e=>`translate(${e.x}px, ${e.y}px)`,O=(e=1,t=0)=>t+(e-t)*Math.random(),B=(e=1,t=0)=>0|O(e,t),N=(e=0,t)=>null==e.x?new $(e,null==t?e:t):new $(e.x,e.y),xe=Object.freeze({grain:{shape:"polygon",sides:3,r:6,offsetAngle:1/6*E},rice:{shape:"polygon",sides:5,r:6},wood:{shape:"polygon",sides:4,r:6,offsetAngle:.125*E},stone:{shape:"polygon",sides:4,r:6},ore:{shape:"polygon",sides:3,r:6}}),Me=[{key:"idle",name:"Wanderer",altName:"Idle",classification:"💤"},{key:"prod",name:"Farmer/Artisan",altName:"Production",classification:"🪚"},{key:"carr",name:"Carrier/Merchant",altName:"Transportation",classification:"🧺"},{key:"defe",name:"Samurai/Soldier",altName:"Defenders",classification:"🛡️"},{key:"spir",name:"Monk/Pilgrim",altName:"Spiritualist",classification:"☸️"}].reduce((e,t)=>(e[t.key]=t,e),{}),H=Object.keys(Me),Ke={name:"",r:10,cap:0,cost:[],upgrades:[],defMax:0,popMax:0,input:[],output:[],rate:0,autoWork:!1,classification:"",emblem:null},L=[{key:"outpost",name:"Outpost",r:24,cap:6,cost:["wood","wood","stone","stone"],defMax:2,popMax:2,classification:"🚩",emblem:"20,0 40,40, 20,40 30,20 10,20 20,40 0,40"},{key:"connector",name:"Crossroad",r:14*.8,cap:2,cost:[],upgrades:"shrine tower stockpile stoneMine farmHouse woodCutter grainFarm".split(" "),classification:"🪧"},{key:"stockpile",name:"Stockpile",r:34,cap:20,cost:["stone","wood","grain"],upgrades:["warehouse"],classification:"📦"},{key:"warehouse",name:"Warehouse",r:46,cap:40,cost:["stone","stone"],classification:"📦"},{key:"woodCutter",name:"Woodcutter",r:24,cap:6,cost:["grain"],input:["grain"],output:["wood"],rate:4,upgrades:["lumberYard"],classification:"🪚"},{key:"lumberYard",name:"Lumber Yard",r:26,cap:7,cost:["grain","wood","ore"],input:["grain"],output:["wood","wood"],rate:5,classification:"🪚"},{key:"stoneMine",name:"Stone Mine",r:24,cap:6,cost:["wood","wood","wood","grain"],input:["grain"],output:["stone"],rate:1.5,upgrades:["oreMine","stoneMine2"],classification:"🪚"},{key:"stoneMine2",name:"Stone Mine II",r:26,cap:6,cost:["wood","wood","grain"],input:["grain"],output:["stone"],rate:3,upgrades:["oreMine"],classification:"🪚"},{key:"oreMine",name:"Ore Mine",r:34,cap:6,cost:["wood","stone","grain"],input:["wood","grain"],output:["ore"],rate:1,upgrades:["oreMine2"],classification:"🪚"},{key:"oreMine2",name:"Ore Mine II",r:35,cap:7,cost:["wood","stone","grain"],input:["wood","grain"],output:["ore"],rate:2,upgrades:["oreMine3"],classification:"🪚"},{key:"oreMine3",name:"Ore Mine III",r:36,cap:8,cost:["stone","grain","rice"],input:["wood","grain"],output:["ore","ore"],rate:3,upgrades:[],classification:"🪚"},{key:"tower",name:"Watchtower",r:18,cap:2,cost:["stone","wood","wood"],defMax:3,upgrades:["fortress"],classification:"🛡️"},{key:"fortress",name:"Fortress",r:28,cap:4,cost:["stone","stone","stone","wood","ore"],defMax:6,upgrades:[],classification:"🛡️"},{key:"grainFarm",name:"Grain Farm",r:24,cap:8,cost:["wood","wood"],input:[],output:["grain"],rate:3,upgrades:["riceFarm","grainFarm2"],classification:"🪚"},{key:"grainFarm2",name:"Grain Farm II",r:25,cap:8,cost:["wood","wood"],input:[],output:["grain"],rate:6,upgrades:["riceFarm"],classification:"🪚"},{key:"riceFarm",name:"Rice Farm",r:28,cap:6,cost:["wood","wood","ore","ore"],input:[],output:["rice"],rate:4,upgrades:["riceFarm2"],classification:"🪚"},{key:"riceFarm2",name:"Rice Farm II",r:29,cap:6,cost:["wood","ore","rice"],input:[],output:["rice"],rate:6,upgrades:[],classification:"🪚"},{key:"shrine",name:"Shrine",r:20,cap:4,cost:["wood","stone","ore"],input:["rice"],output:["karma"],rate:3,upgrades:["temple"],classification:"☸️"},{key:"temple",name:"Temple",r:36,cap:6,cost:["stone","ore","ore","rice"],input:["rice"],output:["karma","karma"],rate:4,upgrades:["temple2"],classification:"☸️"},{key:"temple2",name:"Temple II",r:38,cap:6,cost:["stone","ore","ore","rice"],input:["rice"],output:["karma","karma"],rate:8,upgrades:["grandTemple"],classification:"☸️"},{key:"grandTemple",name:"Grand Temple",r:40,cap:6,cost:["ore","ore","rice"],input:["rice"],output:["karma","karma","karma"],rate:12,classification:"☸️"},{key:"farmHouse",name:"Noka (farmhouse)",r:20,cap:2,cost:["wood","wood","wood"],input:["grain"],output:["meeple"],rate:1,popMax:3,upgrades:["urbanHouse","farmHouse2"],autoWork:!0,classification:"🛖"},{key:"farmHouse2",name:"Noka II (farmhouse)",r:22,cap:3,cost:["wood","grain"],input:["grain"],output:["meeple"],rate:1,popMax:4,upgrades:["urbanHouse","farmHouse3"],autoWork:!0,classification:"🛖"},{key:"farmHouse3",name:"Noka III (farmhouse)",r:24,cap:4,cost:["wood","grain"],input:["grain"],output:["meeple"],rate:1,popMax:5,upgrades:["urbanHouse"],autoWork:!0,classification:"🛖"},{key:"urbanHouse",name:"Machiya (urban house)",r:30,cap:4,cost:["wood","wood","ore","rice","rice"],input:["rice"],output:["meeple"],rate:1,popMax:8,autoWork:!0,classification:"🛖"}].reduce((e,t)=>(e[t.key]={...Ke,...t},e),{}),C=window.g={state:"intro",world:{},buildings:{},buildingKeys:[],meeples:{},citizenKeys:[],invaderKeys:[],roads:{},roadKeys:[],flashMessage:null,selectedBuildingKey:null,upgradesOpen:!1,countdownEl:null,peace:!1,kamikazes:0,lastTime:0,karma:0,countdown:3e5,looping:!1,moving:!1,creating:!1,assigning:!1,godMode:!1,zoom:1,start:function(){var e=2*window.innerWidth,t=window.innerHeight,n=document.querySelector("#wc"),i=(z(n,{width:e,height:t}),document.querySelector("#w")),r=document.querySelector("#ws");z(r,{viewBox:`0 0 ${e} `+t}),C.world={c:n,el:i,svg:r,width:e,height:t,ctx:n.getContext("2d"),layers:{road:document.querySelector("#layer-road"),building:document.querySelector("#layer-building"),meeple:document.querySelector("#layer-meeple")},x:-.5*e,y:0},I("#jass",`<div>Loyal to Hōjō clan: <span id="mcounts"></span>
		<br><span class="altname">Build houses or towers to increase capacity.</span></div>
		<ul>${H.map(e=>{var t=Me[e];return`<li id="jr-${e}">
			<label for="input-${e}">
				<span>
					${t.name}
					<span class="altname">(${t.altName})</span>
				</span>
				<i>${t.classification}</i>
			</label><b><span class="jr-num"></span></b>
			<div class="jass-ui">
				<button class="dec-range">-</button>
				<input id="input-${e}" type="range" min="0">
				<button class="inc-range">+</button>
			</div>
		</li>`}).join("")}</ul>`),ke(C.world),(i=d({type:"outpost",x:n=e/2-40,y:t/=2})).inv=["wood","wood"],d({type:"connector",x:n-(42+B(e/8)),y:t+B(200)-B(200)},i.key),p(),p(),p(),g()},destroyMeeple:ie};window.$=e=>document.querySelector(e),document.addEventListener("DOMContentLoaded",C.start)}();