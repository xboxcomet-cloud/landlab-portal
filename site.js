/* LANDLAB static page enhancements. Values are local inputs; no server submission. */
'use strict';
const $ = (id) => document.getElementById(id);
const ko = n => new Intl.NumberFormat('ko-KR',{maximumFractionDigits:2}).format(n);
const finite = x => Number.isFinite(x);
const $menu = $('pageMenu'), $nav = $('pageNav');
if($menu && $nav){$menu.addEventListener('click',()=>{const o=$nav.classList.toggle('open');$menu.setAttribute('aria-expanded',String(o));$menu.textContent=o?'✕':'☰'});$nav.addEventListener('click',e=>{if(e.target.closest('a')){$nav.classList.remove('open');$menu.setAttribute('aria-expanded','false');$menu.textContent='☰'}});}
function csvDownload(name, rows){const value='\ufeff'+rows.map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');const a=document.createElement('a');const url=URL.createObjectURL(new Blob([value],{type:'text/csv;charset=utf-8'}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function getNumbers(raw){
 const text=String(raw||'').trim();if(!text)throw Error('숫자를 하나 이상 입력하세요.');
 // Excel rows/columns are tab/newline separated: preserve commas used as thousands grouping per cell.
 let tokens=/[\t\r\n]/.test(text)?text.split(/[\t\r\n]+/).flatMap(cell=>cell.trim().split(/[;\s]+/).filter(Boolean)):text.split(/[,;\s]+/).filter(Boolean);
 const arr=tokens.filter(Boolean).map(t=>{const v=String(t).trim();return /^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(v)?Number(v.replaceAll(',','')):Number(v)});
 if(arr.length>10000)throw Error('한 번에 최대 10,000개까지 계산할 수 있습니다.');
 if(arr.some(n=>!Number.isFinite(n)))throw Error('숫자가 아닌 값이 포함되어 있습니다. 엑셀 범위에 문자·단위·병합 셀이 있는지 확인하세요.');
 return arr;
}
if($('statsRun')){
 const run=()=>{const out=$('statsOut'), err=$('statsError');try{const a=getNumbers($('statsNumbers').value),b=[...a].sort((x,y)=>x-y),n=a.length,mean=a.reduce((x,y)=>x+y,0)/n,median=n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2,sd=n>1?Math.sqrt(a.reduce((x,y)=>x+(y-mean)**2,0)/(n-1)):null;out.innerHTML=[['표본 수',ko(n)],['평균',ko(mean)],['중앙값',ko(median)],['표본 표준편차',sd===null?'—':ko(sd)],['최솟값',ko(b[0])],['최댓값',ko(b.at(-1))]].map(([label,num])=>`<div class="stat-box"><small>${label}</small><strong>${num}</strong></div>`).join('');err.textContent='';}catch(e){out.innerHTML='';err.textContent=e.message;}};
 $('statsRun').addEventListener('click',run);run();
}
if($('areaInput')){
 function run(){const n=Number($('areaInput').value),unit=$('areaMode').value,el=$('areaResult');if(!finite(n)||n<0){el.textContent='0 이상의 값을 입력하세요.';return;}const result=unit==='pyeong'?n*3.305785124:n/3.305785124;el.textContent=ko(result)+' '+(unit==='pyeong'?'㎡':'평');}
 ['areaInput','areaMode'].forEach(id=>$(id).addEventListener('input',run));run();
}
if($('capCompute')){
 function run(){const noi=Number($('noiInput').value),price=Number($('priceInput').value),cap=Number($('capInput').value);const el=$('capResult'),err=$('capError');err.textContent='';if([noi,price,cap].some(v=>!finite(v)||v<0)||price===0||cap===0){err.textContent='금액은 0 이상, 가격과 환원율은 0보다 큰 값으로 입력하세요.';return;}const implied=noi/price*100,estimated=noi/(cap/100);el.innerHTML=`<div class="stat-box"><small>입력한 가격 기준 환원율</small><strong>${ko(implied)}%</strong></div><div class="stat-box"><small>입력한 환원율 기준 가치</small><strong>${ko(estimated)}만원</strong></div>`;}
 $('capCompute').addEventListener('click',run);run();
}
const districts=window.LANDLAB_TOWNS||[];
if($('townGrid')){
 let region='전체',sort='homes';
 const draw=()=>{const a=districts.filter(d=>region==='전체'||d.region===region).sort((a,b)=>b[sort]-a[sort]);$('townGrid').innerHTML=a.map(d=>`<article class="card"><span class="tag">${d.region}</span><h3 style="margin:11px 0 5px">${d.name}</h3><p>${d.concept}</p><div class="stat-grid" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="stat-box"><small>계획 공급</small><strong>${ko(d.homes)}호</strong></div><div class="stat-box"><small>계획 면적</small><strong>${ko(d.area)}㎢</strong></div></div><div class="btn-row"><a class="btn secondary small" href="https://www.xn--3-3u6ey6lv7rsa.kr/kor/CMS/Contents/Contents.do?mCode=${encodeURIComponent(d.portal)}" target="_blank" rel="noopener noreferrer">공식 지구 정보 ↗</a></div></article>`).join('');
 $('townRows').innerHTML=a.map(d=>`<tr><td>${d.name}</td><td>${d.region}</td><td>${ko(d.area)}</td><td>${ko(d.homes)}</td><td>${d.designation}</td><td>${d.approval}</td></tr>`).join('');
 const max=Math.max(...a.map(d=>d.homes),1);$('townBars').innerHTML=a.map(d=>`<div class="bar-row"><b>${d.short}</b><div class="bar-track" role="img" aria-label="${d.name} ${ko(d.homes)}호"><div class="bar-fill" style="width:${d.homes/max*100}%"></div></div><span>${ko(d.homes)}호</span></div>`).join('');
 };
 document.querySelectorAll('[data-region]').forEach(b=>b.addEventListener('click',()=>{region=b.dataset.region;document.querySelectorAll('[data-region]').forEach(x=>x.classList.toggle('active',x===b));draw();}));$('townSort').addEventListener('change',e=>{sort=e.target.value;draw();});$('townCSV').addEventListener('click',()=>csvDownload('LANDLAB_3기신도시_기초현황.csv',[['지구명','지역','계획면적(km2)','계획공급(호)','지구지정일','최초지구계획승인일','자료기준일'],...districts.map(d=>[d.name,d.region,d.area,d.homes,d.designation,d.approval,'2026-11-07'])]));draw();
}
if($('sourceGrid')){
 const resources=[
 ['논문','KCI 한국학술지인용색인','학술논문·인용정보 검색','https://www.kci.go.kr/'],['논문','RISS','학위논문·학술자료 검색','https://www.riss.kr/'],
 ['통계','KOSIS','인구·가구·주택 등 국가통계','https://kosis.kr/'],['통계','한국은행 ECOS','금리·물가 등 거시경제 시계열','https://ecos.bok.or.kr/'],['통계','한국부동산원 R-ONE','주택가격지수·지가변동률 등','https://www.reb.or.kr/r-one/'],
 ['토지·주택','국토교통부 실거래가','실거래가 공개자료 및 연계 API','https://www.data.go.kr/data/15126469/openapi.do'],['토지·주택','3기 신도시 종합정보포털','지구 개요·사업 및 공급정보','https://www.xn--3-3u6ey6lv7rsa.kr/'],['토지·주택','LH청약플러스','공공주택 입주자모집공고 원문','https://apply.lh.or.kr/'],['토지·주택','청약홈','민영주택 분양공고 및 청약','https://www.applyhome.co.kr/'],
 ['보상·재결','LH 손실보상','보상절차·토지·지장물 조사·보상계획','https://www.lh.or.kr/menu.es?mid=a10403170101'],['보상·재결','중앙토지수용위원회','수용재결·이의재결 절차','https://oclt.molit.go.kr/USR/WPGE0201/m_9308/DTL.jsp'],['발주·입찰','LH 전자조달','공사·용역 입찰공고 원문','https://ebid.lh.or.kr/'],['발주·입찰','나라장터','공사·용역 공고 조회','https://www.g2b.go.kr/'],['법령','국가법령정보센터','법령·판례·연혁 원문','https://www.law.go.kr/'],['법령','대법원 종합법률정보','판례·규칙·문헌 검색','https://glaw.scourt.go.kr/']
 ];let filter='전체';const draw=()=>{const q=$('sourceSearch').value.trim().toLowerCase(),matches=resources.filter(a=>(filter==='전체'||a[0]===filter)&&a.join(' ').toLowerCase().includes(q));$('sourceGrid').innerHTML=matches.length?matches.map(r=>`<a class="card tile-link" href="${r[3]}" target="_blank" rel="noopener noreferrer"><span class="outside">↗</span><span class="kicker">${r[0]}</span><h3>${r[1]}</h3><p>${r[2]}</p><span class="fine">공식·학술 사이트로 이동</span></a>`).join(''):'<p class="muted">조건에 맞는 출처가 없습니다.</p>';};$('sourceSearch').addEventListener('input',draw);document.querySelectorAll('[data-source]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.source;document.querySelectorAll('[data-source]').forEach(x=>x.classList.toggle('active',x===b));draw();}));draw();
}
