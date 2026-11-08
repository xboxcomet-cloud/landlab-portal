
'use strict';
const toggle=document.getElementById('menuToggle'),nav=document.getElementById('topnav');
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'✕':'☰'});nav.addEventListener('click',event=>{if(event.target.closest('a')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰'}})}
const check=document.getElementById('compCheck');
if(check){const boxes=[...check.querySelectorAll('input[type=checkbox]')],out=document.getElementById('compProgress');const update=()=>{out.textContent=boxes.filter(x=>x.checked).length+' / '+boxes.length+' 확인'};boxes.forEach(b=>b.addEventListener('change',update));document.getElementById('clearComp')?.addEventListener('click',()=>{boxes.forEach(x=>x.checked=false);update()});update()}
// 공고명에 실제 3기 신도시 사업지구명이 들어가고 공사/용역으로 분류된 공고만 표시.
const type=document.getElementById('tenderType');
const query=document.getElementById('tenderQuery');
const district=document.getElementById('tenderDistrict');
const category=document.getElementById('tenderCategory');
if(type&&query&&district&&category){
 const cards=[...document.querySelectorAll('.tender-entry')],empty=document.getElementById('tenderEmpty'),counter=document.getElementById('tenderCount');
 const normalized=str=>String(str||'').toLowerCase().replace(/\s+/g,'');
 const eligibleDistricts=['남양주왕숙','남양주왕숙2','하남교산','고양창릉','인천계양','부천대장'];
 const matchesName=name=>{
  const n=normalized(name);
  return eligibleDistricts.some(d=>n.includes(d));
 };
 const update=()=>{
  let shown=0;
  for(const c of cards){
   const eligible=matchesName(c.dataset.title)&&['공사','용역'].includes(c.dataset.type);
   const words=normalized(c.dataset.title+' '+c.textContent);
   const matchesQuery=words.includes(normalized(query.value));
   const matchesType=type.value==='전체'||c.dataset.type===type.value;
   const matchesCategory=category.value==='전체'||c.dataset.category===category.value;
   // Value is explicit district tags; avoids classifying 왕숙2 as 왕숙1.
   const matchesDistrict=district.value==='전체'||c.dataset.district.split('|').includes(district.value);
   c.hidden=!(eligible&&matchesQuery&&matchesType&&matchesCategory&&matchesDistrict);
   if(!c.hidden)shown++;
  }
  empty.hidden=shown!==0;
  counter.textContent=`표시 ${shown}건 / ${cards.length}건 · 2026.11.08 자료`;
 };
 for(const elem of [type,query,district,category])elem.addEventListener('change',update);
 query.addEventListener('input',update);update();
}
