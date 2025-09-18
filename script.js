// script.js - 基本檢查邏輯（可擴充）
document.getElementById('checkBtn').addEventListener('click', checkAPA);
document.getElementById('sampleBtn').addEventListener('click', loadSample);
document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('input').value = '';
  document.getElementById('results').innerHTML = '';
});

// 分割多筆：以空白行分隔；若使用者只有單行也可
function splitEntries(text){
  // 以空白行（兩個或更多換行）或單行分割
  const blocks = text.split(/\r?\n\r?\n+/).map(s=>s.trim()).filter(Boolean);
  if(blocks.length===0 && text.trim()) return [text.trim()];
  return blocks;
}

function checkAPA(){
  const type = document.getElementById('type').value;
  const raw = document.getElementById('input').value;
  const results = document.getElementById('results');
  results.innerHTML = '';

  if(!raw.trim()){
    results.innerHTML = '<p style="color:#b91c1c">請先貼上至少一筆參考文獻（多筆請以空白行分隔）</p>';
    return;
  }

  const entries = splitEntries(raw);
  entries.forEach((entry, idx) => {
    const card = document.createElement('div');
    card.className = 'entry';
    const heading = document.createElement('h3');
    heading.textContent = `參考 ${idx + 1}`;
    card.appendChild(heading);

    const pre = document.createElement('pre');
    pre.textContent = entry;
    card.appendChild(pre);

    // 基本檢查項目
    const checks = [];
    checks.push({key:'作者格式', ok: checkAuthor(entry), hint:'常見格式：Lastname, F. M.'});
    checks.push({key:'年份 (YYYY)', ok: checkYear(entry), hint:'應為 (2020) 或 (2020a) 等'});

    // 根據類型決定檢查
    if(type === 'journal' || (type==='auto' && looksLikeJournal(entry))){
      checks.push({key:'文章標題', ok: checkTitle(entry), hint:'在年份後應有文章標題，並以句號結束'});
      checks.push({key:'期刊/卷/頁碼', ok: checkJournalVolumePages(entry), hint:'檢查是否有期刊名、卷號(期)、頁碼'});
      checks.push({key:'DOI / URL', ok: checkDOI(entry), hint:'若有 DOI 建議出現（或 https://）'});
    } else if(type === 'book' || (type==='auto' && looksLikeBook(entry))){
      checks.push({key:'書名', ok: checkBookTitle(entry), hint:'書名通常在年份後，並以句號結束'});
      checks.push({key:'出版社', ok: checkPublisher(entry), hint:'檢查是否有出版社名稱'});
    } else if(type === 'web' || (type==='auto' && looksLikeWeb(entry))){
      checks.push({key:'網址/取用日期', ok: checkURL(entry), hint:'網頁需包含 URL 或 "Retrieved from"'});
    }

    // 列出結果
    const ul = document.createElement('ul');
    let allOk = true;
    checks.forEach(c=>{
      const li = document.createElement('li');
      li.innerHTML = (c.ok ? '✅ ' : '❌ ') + `<strong>${c.key}</strong> — ${c.ok ? '通過' : '未通過'} (${c.hint})`;
      if(!c.ok) { li.className = 'fail'; allOk = false; }
      ul.appendChild(li);
    });
    card.appendChild(ul);

    const summary = document.createElement('p');
    summary.className = 'summary';
    summary.textContent = allOk ? '整體：看起來符合所選格式 ✅' : '整體：有錯誤或缺項，請參考上方建議 ❌';
    card.appendChild(summary);

    results.appendChild(card);
  });
}

/* ---- 檢查函式（簡易版） ---- */
function checkAuthor(s){
  // 最常見英文格式：Lastname, F. M.
  const r = /[A-Za-z\u00C0-\u024F\'\-]+,\s+[A-Z](?:\.\s*[A-Z]\.)*/;
  return r.test(s);
}
function checkYear(s){
  return /\(\s*\d{4}[a-z]?\s*\)/i.test(s);
}
function checkTitle(s){
  // 找年份後的第一個句子（當作標題）
  const m = s.match(/\(\s*\d{4}[a-z]?\s*\)\.?\s*(.+?)\.\s*/i);
  return m && m[1] && m[1].length > 3;
}
function checkJournalVolumePages(s){
  // 嘗試找出期刊、卷號(期)與頁碼的常見格式
  return /,\s*[A-Za-z].+,\s*\d{1,4}\s*\(\d{1,3}\)\s*,\s*\d{1,4}-\d{1,4}/i.test(s) ||
         /,\s*[A-Za-z].+,\s*\d{1,4}\s*\(\d{1,3}\)/i.test(s) ||
         /,\s*[A-Za-z].+,\s*\d{1,4},\s*\d{1,4}-\d{1,4}/i.test(s);
}
function checkDOI(s){
  return /doi\.org\/\S+|doi:\s*\S+/i.test(s) || /https?:\/\/\S+/i.test(s);
}
function checkBookTitle(s){
  // 找年後第一句為書名（較寬鬆判斷）
  const m = s.match(/\(\s*\d{4}[a-z]?\s*\)\.?\s*(.+?)\.\s*/i);
  return m && m[1] && m[1].length > 4;
}
function checkPublisher(s){
  return /(Press|Publisher|University|出版社|出版|有限公司|Inc\.|Ltd\.|Co\.)/i.test(s);
}
function checkURL(s){
  return /https?:\/\/\S+/i.test(s) || /Retrieved from/i.test(s);
}

/* ---- 類型偵測輔助 ---- */
function looksLikeJournal(s){
  return /journal|volume|vol\.|pp\.|\(\d{1,3}\)|doi/i.test(s);
}
function looksLikeBook(s){
  return /(Press|Publisher|出版社|出版|University Press|Edition|ed\.)/i.test(s);
}
function looksLikeWeb(s){
  return /https?:\/\/|Retrieved from|Accessed|accessed/i.test(s);
}

/* ---- 範例測試資料 ---- */
function loadSample(){
  const sample = [
`Smith, J. A., & Lee, K. B. (2020). Exploring learning analytics. Journal of Education, 15(3), 45-60. https://doi.org/10.1234/abcd`,

`Wang, Y. (2018). 教育科技入門 (2nd ed.). Taipei: Example Press.`,

`Ministry of Education. (2021). National statistics report. Retrieved from https://example.gov/reports/2021`
  ].join('\n\n');
  document.getElementById('input').value = sample;
  document.getElementById('results').innerHTML = '';
}
