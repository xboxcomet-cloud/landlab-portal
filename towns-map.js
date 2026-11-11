/* Approximate district points only – no false official boundaries */
(()=>{'use strict';
const rows=[
 ['남양주 왕숙',37.665,127.205],['남양주 왕숙2',37.613,127.168],['하남 교산',37.523,127.198],
 ['고양 창릉',37.637,126.881],['인천 계양',37.563,126.764],['부천 대장',37.543,126.800]
];
const div=document.getElementById('landlabMap'),list=document.getElementById('mapDistrictList');if(!div||!list)return;
list.innerHTML=rows.map(([name],i)=>`<button type="button" class="map-district" data-map-index="${i}">${name}<small>지구 개략 위치 확인 ↗</small></button>`).join('');
function init(){if(!window.L){div.innerHTML='<p>외부 지도 라이브러리를 불러오지 못했습니다. 오른쪽 지구 목록을 이용하세요.</p>';return}
 div.innerHTML='';const m=L.map(div,{scrollWheelZoom:false}).setView([37.58,127.02],10);
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(m);
 const markers=rows.map(([name,lat,lng])=>L.marker([lat,lng]).addTo(m).bindPopup('<strong>'+name+'</strong><div>개략 참고 위치 · 지구 경계 아님</div>'));
 const btns=[...list.querySelectorAll('button')];btns.forEach((b,i)=>b.addEventListener('click',()=>{btns.forEach(x=>x.classList.remove('active'));b.classList.add('active');m.flyTo(markers[i].getLatLng(),12);markers[i].openPopup()}));
 const bounds=L.latLngBounds(markers.map(x=>x.getLatLng()));m.fitBounds(bounds,{padding:[26,26]});
}
if(document.readyState==='complete')init();else window.addEventListener('load',init,{once:true});
})();
