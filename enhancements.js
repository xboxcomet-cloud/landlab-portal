/* LANDLAB research utilities: browser-local only; no analytics, secrets, or server upload */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
function download(name,body,mime='application/json;charset=utf-8'){
 const blob=new Blob([body],{type:mime});const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),3000);
}
function csv(rows){return '\ufeff'+rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n')}
const fmt=(n)=>Number(n).toLocaleString('ko-KR',{maximumFractionDigits:2});
// Local checklist, user can choose to save; clearing it also clears the saved copy.
const check=$('compCheck');
if(check){
 const key='LANDLAB_COMP_CHECK_V1', boxes=[...check.querySelectorAll('input[type=checkbox]')];
 const status=$('compSavedState');
 const labels=boxes.map((el,i)=>{const text=el.closest('label')?.textContent||el.parentElement?.textContent||'항목 '+(i+1);return text.trim()});
 try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(Array.isArray(saved)){boxes.forEach((e,i)=>e.checked===undefined?null:e.checked=Boolean(saved[i]));document.getElementById('compProgress').textContent=boxes.filter(x=>x.checked).length+' / '+boxes.length+' 확인';if(status)status.textContent='이 브라우저에서 저장한 체크 상태를 불러왔습니다.';}}catch(_){}
 $('compSave')?.addEventListener('click',()=>{try{localStorage.setItem(key,JSON.stringify(boxes.map(e=>e.checked)));status.textContent='저장 완료 · 이 브라우저에만 보관됩니다.';}catch{status.textContent='브라우저 설정으로 저장할 수 없습니다.'}});
 $('compPrint')?.addEventListener('click',()=>window.print());
 $('compExport')?.addEventListener('click',()=>download('LANDLAB_보상재결_점검표.csv',csv([['항목','확인여부'],...boxes.map((e,i)=>[labels[i],e.checked?'확인':'미확인'])]),'text/csv;charset=utf-8'));
 $('clearComp')?.addEventListener('click',()=>{try{localStorage.removeItem(key)}catch(_){}if(status)status.textContent='체크 상태와 저장값을 초기화했습니다.';});
}
// Calculation results: local save, restore and JSON export
const inputs=['statsNumbers','areaInput','areaMode','noiInput','priceInput','capInput'];
if($('toolSave')){
 const key='LANDLAB_TOOL_INPUT_V1',msg=$('toolSaveStatus');
 const collect=()=>Object.fromEntries(inputs.map(id=>[id,$(id)?.value||'']));
 const recalc=()=>{$('statsRun')?.click();$('capCompute')?.click();$('areaInput')?.dispatchEvent(new Event('input',{bubbles:true}));};
 $('toolSave').addEventListener('click',()=>{try{localStorage.setItem(key,JSON.stringify(collect()));msg.textContent='입력값을 이 브라우저에 저장했습니다.';}catch(e){msg.textContent='저장할 수 없습니다: '+e.message}});
 $('toolRestore').addEventListener('click',()=>{let obj=null;try{obj=JSON.parse(localStorage.getItem(key)||'null')}catch(_){}if(!obj){msg.textContent='저장된 값이 없습니다.';return}for(const id of inputs)if($(id)&&typeof obj[id]==='string')$(id).value=obj[id];recalc();msg.textContent='저장값을 불러와 다시 계산했습니다.';});
 $('toolForget').addEventListener('click',()=>{try{localStorage.removeItem(key)}catch(_){}msg.textContent='저장값을 삭제했습니다.';});
 $('toolExportJSON').addEventListener('click',()=>{recalc();const result={source:'LANDLAB 브라우저 계산 도구',generatedAt:new Date().toISOString(),inputs:collect(),statsOutput:$('statsOut')?.innerText||'',areaOutput:$('areaResult')?.innerText||'',capitalizationOutput:$('capResult')?.innerText||'',note:'예시 계산 결과이며 통계적 추론이나 감정평가 의견이 아닙니다.'};download('LANDLAB_계산결과.json',JSON.stringify(result,null,2));});
 $('toolPrint').addEventListener('click',()=>{recalc();window.print()});
 $('pasteExample')?.addEventListener('click',()=>{$('statsNumbers').value='64\t16\n37\t18\n38\t20';$('statsRun').click();msg.textContent='엑셀 2열 × 3행을 복사한 예시입니다. 실제 엑셀 범위도 붙여넣을 수 있습니다.';});
}
// Sales: no invented dates; API/later verified JSON can replace nulls
const sales=$('salesScheduleRows');
if(sales){const fallback=['남양주 왕숙','남양주 왕숙2','하남 교산','고양 창릉','인천 계양','부천 대장'].map(name=>({name}));
 const draw=arr=>{sales.innerHTML=arr.map(r=>`<tr><th scope="row">${esc(r.name)}</th><td>${esc(r.preSubscription||'공식 확인 전')}</td><td>${esc(r.mainSubscription||'공식 확인 전')}</td><td>${esc(r.contract||'공식 확인 전')}</td><td>${esc(r.moveIn||'공식 확인 전')}</td><td><a href="https://apply.lh.or.kr/" target="_blank" rel="noopener noreferrer">LH청약플러스 ↗</a></td></tr>`).join('')};
 draw(fallback);fetch('sales-schedule.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(d=>{if(d?.districts?.length)draw(d.districts)}).catch(()=>{});
}
// Land-use percentages by actual land areas; do not display invented values.
if($('landuseFile')){
 const fields=['주거용지_ha','상업용지_ha','자족시설용지_ha','기반시설용지_ha','공원녹지_ha','기타_ha'];
 const labels=['주거','상업','자족','기반시설','공원녹지','기타'];const colors=['#276bb1','#4d9cda','#6a80c5','#5ca8b0','#65ab80','#b5c4d2'];
 const note=$('landuseMessage');
 function parseCSV(raw){const lines=[];let field='',row=[],quotes=false;
  for(let i=0;i<raw.length;i++){const ch=raw[i];if(ch==='"'){if(quotes&&raw[i+1]==='"'){field+='"';i++}else quotes=!quotes;}else if(ch===','&&!quotes){row.push(field);field=''}else if((ch==='\n'||ch==='\r')&&!quotes){if(ch==='\r'&&raw[i+1]==='\n')i++;row.push(field);if(row.some(c=>c.trim()!==''))lines.push(row);field='';row=[]}else field+=ch;}
  row.push(field);if(row.some(c=>c.trim()!==''))lines.push(row);return lines;}
 $('landuseFile').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;file.text().then(text=>{
  const lines=parseCSV(text.replace(/^\uFEFF/,''));if(lines.length<2)throw Error('헤더와 데이터 행이 필요합니다.');
  const headers=lines.shift().map(x=>x.trim());if(!fields.every(f=>headers.includes(f))||!headers.includes('지구명'))throw Error('공식 입력 양식의 열 이름과 일치해야 합니다.');
  const results=[];for(const line of lines){const r=Object.fromEntries(headers.map((h,i)=>[h,(line[i]||'').trim()]));const vals=fields.map(f=>Number(r[f]));if(!r['지구명']||fields.some(f=>!r[f])||vals.some(n=>!Number.isFinite(n)||n<0)){continue}const total=vals.reduce((a,b)=>a+b,0);if(total<=0)continue;results.push({name:r['지구명'],vals,total,source:r['출처URL']||'',date:r['기준일']||''});}
  if(!results.length)throw Error('면적 값이 입력된 유효한 지구 행이 없습니다.');
  $('landuseChart').innerHTML=`<div class="landuse-legend">${labels.map((l,i)=>`<span style="--legend:${colors[i]}">${l}</span>`).join('')}</div>`+results.map(r=>`<div class="landuse-row"><b>${esc(r.name)}</b><div class="landuse-bar">${r.vals.map((v,i)=>`<span title="${labels[i]} ${(v/r.total*100).toFixed(1)}%" style="width:${(v/r.total*100).toFixed(3)}%;background:${colors[i]}"></span>`).join('')}</div><span>${fmt(r.total)}ha</span></div>`).join('');
  $('landuseTable').innerHTML=`<table class="data-table"><thead><tr><th>지구</th>${labels.map(x=>`<th>${x} (%)</th>`).join('')}<th>기준일</th><th>출처</th></tr></thead><tbody>${results.map(r=>`<tr><th>${esc(r.name)}</th>${r.vals.map(v=>`<td>${(v/r.total*100).toFixed(1)}%</td>`).join('')}<td>${esc(r.date||'미기재')}</td><td>${esc(r.source||'미기재')}</td></tr>`).join('')}</tbody></table>`;
  note.textContent=`입력된 ${results.length}개 지구의 면적에서 비율을 계산했습니다. 공식 자료 여부를 확인하고 논문에 사용하세요.`;
 }).catch(err=>{note.textContent='불러오기 오류: '+err.message;note.classList.add('landuse-warn')});});
}
})();
