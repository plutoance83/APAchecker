document.getElementById('checkBtn').addEventListener('click', checkAPA);
document.getElementById('sampleBtn').addEventListener('click', loadSample);
document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('input').value = '';
  document.getElementById('results').innerHTML = '';
});

function splitEntries(text){
  const blocks = text.split(/\r?\n\r?\n+/).map(s=>s.trim()).filter(Boolean);
  if(blocks.length===0 && text.trim()) return [text.trim()];
  return blocks;
}

function checkAPA(){
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
    heading.textContent = `文獻 ${idx + 1}`;
    card.appendChild(heading);

    const pre = document.createElement('pre');
    pre.textContent = entry;
    card.appendChild(pre);

    // 判斷類型
    let type = '未知文獻';
    if (/\(\d{4}\)\..*, \d+\(\d+\),/.test(entry)) type = '期刊文章';
    else if (/\(\d{4}, [A-Za-z]+ \d{1,2}\)\..*\..*, \d+/.test(entry)) type = '雜誌文章';
    else if (/\(\d{4}, [A-Za-z]+ \d{1,2}\)\..*\..*[\.,] p? ?[A-Z]?\d*/.test(entry)) type = '新聞報紙';
    else if (/出版社|Press|Publishers/.test(entry)) type = '書籍';
    else if (/https?:\/\/|doi\.org/.test(entry)) type = '網路資源';

    const typePara = document.createElement('p');
    typePara.innerHTML = `<strong>類型：</strong>${type}`;
    card.appendChild(typePara);

    // 基本檢查
    const checks = [];
    const yearPattern = /\(\d{4}(, [A-Za-z]+ \d{1,2})?\)/;
    checks.push({key:'年份格式', ok: yearPattern.test(entry), hint:'(2021) 或 (2020, April 15)'});

    const authorPattern = /^([A-Z][a-zA-Z\-]+,\s+[A-Z]\.(\s*[A-Z]\.)?)(,\s*[A-Z][a-zA-Z\-]+,\s+[A-Z]\.(\s*[A-Z]\.)?)*(\s*&\s*[A-Z][a-zA-Z\-]+,\s+[A-Z]\.(\s*[A-Z]\.)?)?/;
    checks.push({key:'作者格式', ok: authorPattern.test(entry), hint:'Lastname, F. M., & Other, F. M.'});


    const titlePattern = /[A-Za-z0-9\s:]+[.,]/;
    checks.push({key:'標題/書名格式', ok: titlePattern.test(entry), hint:'確認文章標題或書名存在，期刊文章需句號結束'});

    const doiPattern = /https:\/\/doi\.org\/\S+/i;
    const urlPattern = /https?:\/\/[^\s]+/i;
    checks.push({key:'DOI/URL', ok: doiPattern.test(entry) || urlPattern.test(entry), hint:'建議提供 DOI 或穩定 URL'});

    // 顯示檢查結果
    const ul = document.createElement('ul');
    let allOk = true;
    checks.forEach(c=>{
      const li = document.createElement('li');
      li.innerHTML = (c.ok ? '✅ ' : '❌ ') + `<strong>${c.key}</strong> — ${c.ok ? '通過' : '未通過'} (${c.hint})`;
      if(!c.ok) { li.className='fail'; allOk=false; }
      ul.appendChild(li);
    });
    card.appendChild(ul);

    const summary = document.createElement('p');
    summary.className = 'summary';
    summary.textContent = allOk ? '整體：看起來符合 APA 第七版 ✅' : '整體：有錯誤或缺項，請參考上方建議 ❌';
    card.appendChild(summary);

    results.appendChild(card);
  });
}

/* 範例資料 */
function loadSample(){
  const sample = [
`Smith, J. D., & Howard, L. M. (2021). Efficacy of a novel vaccine for preventing severe influenza among older adults. Journal of Clinical Immunology, 15(3), 123–131. https://doi.org/10.1111/jci.15123`,

`Johnson, M. (2020, April). The future of telemedicine in rural healthcare. Medical Technology Monthly, 28(4), 45–49. https://www.medtechmonthly.org/future-telemed`,

`Rodriguez, A. (2021, August 2). Local hospitals see surge in respiratory illnesses. The Chicago Tribune, p. A1. https://www.chicagotribune.com/health/surge-2021`
  ].join('\n\n');
  document.getElementById('input').value = sample;
  document.getElementById('results').innerHTML = '';
}
