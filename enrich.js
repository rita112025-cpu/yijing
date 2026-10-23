"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const views = ['casting','library','learn','journal'];
  function showView(id){
    views.forEach(view => $(view).hidden = view !== id);
    document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === id)));
  }
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
  document.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click', () => { questionInput.value = button.dataset.question; questionInput.focus(); }));
  const entries = Object.entries(HEXAGRAMS).sort((a,b) => a[1].no-b[1].no);
  function openHex(binary){
    $('hexDetail').innerHTML = describe(binary, HEXAGRAMS[binary]);
    const close = document.createElement('button'); close.className = 'detail-close'; close.textContent = '收起卦意';
    close.onclick = () => { $('hexDetail').hidden = true; document.querySelector('[data-binary="'+binary+'"]')?.focus(); };
    $('hexDetail').append(close); $('hexDetail').hidden = false; $('hexDetail').focus();
  }
  function renderLibrary(){
    const query = $('hexSearch').value.trim();
    const filtered = entries.filter(([b,h]) => (!query || [h.no,h.name,h.summary,h.action].join(' ').includes(query)) && (!$('upperFilter').value || b.slice(3) === $('upperFilter').value) && (!$('lowerFilter').value || b.slice(0,3) === $('lowerFilter').value));
    $('hexGrid').replaceChildren(); $('hexDetail').hidden = true;
    $('libraryCount').textContent = filtered.length ? '共 '+filtered.length+' 卦 · 點選卡片閱讀卦意' : '沒有符合的卦，請試試其他關鍵字或調整篩選。';
    filtered.forEach(([binary,h]) => {
      const card = document.createElement('button'); card.className = 'hex-card'; card.dataset.binary = binary;
      card.innerHTML = '<span class="symbol" aria-hidden="true">'+glyphOf(h.no)+'</span><small>第 '+h.no+' 卦</small><strong>'+h.name+'</strong>';
      card.onclick = () => openHex(binary); $('hexGrid').append(card);
    });
  }
  const qualities = {乾:'創造、主動與持續',坤:'承載、包容與配合',震:'啟動、震動與警醒',巽:'滲透、柔順與調整',坎:'險阻、流動與探索',離:'明辨、依附與照見',艮:'停止、界線與安定',兌:'交流、喜悅與開放'};
  Object.entries(TRIGRAMS).forEach(([binary,t]) => {
    ['upperFilter','lowerFilter'].forEach(id => { const option = document.createElement('option'); option.value = binary; option.textContent = t.symbol+' '+t.name+' · '+t.nature; $(id).append(option); });
    const item = document.createElement('article'); item.className = 'trigram-card'; item.innerHTML = '<b>'+t.symbol+'</b><strong>'+t.name+' · '+t.nature+'</strong><p>'+qualities[t.name]+'</p>'; $('trigramGuide').append(item);
  });
  $('hexSearch').addEventListener('input',renderLibrary);
  ['upperFilter','lowerFilter'].forEach(id => $(id).addEventListener('change',renderLibrary));
  renderLibrary();
  const key = 'yijing-journal-v1';
  let current = null, saved = false, records = [];
  function validRecord(r){ return r && typeof r.id === 'string' && typeof r.date === 'string' && !Number.isNaN(Date.parse(r.date)) && typeof r.question === 'string' && typeof r.note === 'string' && Array.isArray(r.values) && r.values.length === 6 && r.values.every(v => [6,7,8,9].includes(v)); }
  try { const data = JSON.parse(localStorage.getItem(key) || '[]'); if(Array.isArray(data)) records = data.filter(validRecord).slice(0,50); }
  catch { $('journalStatus').textContent = '目前無法讀取本機紀錄；仍可正常起卦。'; }
  function persist(next){
    try { localStorage.setItem(key, JSON.stringify(next)); records = next; return true; }
    catch { $('journalStatus').textContent = '無法儲存，請確認瀏覽器允許本機儲存且空間足夠。'; return false; }
  }
  const originalRender = renderResult;
  renderResult = function(lines,question){
    originalRender(lines,question); current = {question, values:lines.map(l=>l.value)}; saved = false;
    $('saveReading').hidden = false; $('saveReading').disabled = false; $('saveStatus').textContent = '';
  };
  castBtn.addEventListener('click', () => { current = null; $('saveReading').hidden = true; $('saveStatus').textContent = ''; }, {capture:true});
  $('saveReading').onclick = () => {
    if(!current || saved) return;
    const record = {...current,id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),date:new Date().toISOString(),note:''};
    if(persist([record,...records].slice(0,50))){ saved = true; $('saveReading').disabled = true; $('saveStatus').textContent = '已儲存，可到「我的紀錄」加入心得。'; renderJournal(); }
    else $('saveStatus').textContent = '無法儲存，請確認瀏覽器的本機儲存設定。';
  };
  function renderJournal(){
    $('journalList').replaceChildren();
    if(!records.length){ const p = document.createElement('p'); p.className = 'empty'; p.textContent = '還沒有紀錄。起卦後按下「儲存這次觀照」，把當時的問題與後來的體會留在一起。'; $('journalList').append(p); }
    records.forEach(record => {
      const lines = record.values.map(lineFromValue), binary = toBinary(lines,false), changed = toBinary(lines,true);
      const card = document.createElement('article'); card.className = 'journal-card';
      const time = document.createElement('time'); time.dateTime = record.date; time.textContent = new Date(record.date).toLocaleString('zh-TW');
      const title = document.createElement('h3'); title.textContent = HEXAGRAMS[binary].name + (lines.some(l=>l.changing) ? ' → '+HEXAGRAMS[changed].name : ' · 無變爻');
      const question = document.createElement('p'); question.textContent = record.question || '未設定問題';
      const label = document.createElement('label'); label.htmlFor = 'note-'+record.id; label.textContent = '此刻的體會與下一步';
      const note = document.createElement('textarea'); note.id = label.htmlFor; note.maxLength = 2000; note.value = record.note; note.placeholder = '我看見了什麼？可以先做哪一件小事？';
      const status = document.createElement('p'); status.setAttribute('role','status');
      const save = document.createElement('button'); save.textContent = '儲存心得'; save.onclick = () => { if(persist(records.map(r=>r.id===record.id?{...r,note:note.value}:r))) status.textContent = '心得已儲存。'; else status.textContent = '儲存失敗，請保留文字後重試。'; };
      const remove = document.createElement('button'); remove.textContent = '刪除此筆'; remove.onclick = () => { if(window.confirm('刪除這筆起卦紀錄與心得？')){ if(persist(records.filter(r=>r.id!==record.id))){renderJournal();$('journalStatus').textContent='已刪除一筆紀錄。';} } };
      const detail = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent='查看完整卦象'; const result = document.createElement('div'); result.innerHTML=describe(binary,HEXAGRAMS[binary]); const values=document.createElement('p');values.textContent='初爻至上爻：'+record.values.join('、');detail.append(summary,values,result);
      if(lines.some(l=>l.changing)){const change=document.createElement('div');change.innerHTML='<h4>之卦</h4>'+describe(changed,HEXAGRAMS[changed]);detail.append(change);}
      card.append(time,title,question,detail,label,note,save,remove,status); $('journalList').append(card);
    });
  }
  renderJournal();
})();
