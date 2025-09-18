let articleCount = 0; // 記錄檢查過的文獻數

function checkAPA() {
  const text = document.getElementById("inputText").value.trim();
  const result = document.getElementById("result");

  if (!text) {
    result.innerText = "⚠️ 請先輸入一篇參考文獻";
    return;
  }

  articleCount++; // 每次檢查就加一
  let messages = [];
  let type = "未知文獻類型";

  // ----- 判斷文獻類型 -----
  if (/\d{4}\)\.\s.*\..*, \d+\(\d+\),/.test(text)) {
    type = "期刊文章";
  } else if (/\d{4}, [A-Za-z]+ \d{1,2}\)\.\s.*\..*, \d+/.test(text)) {
    type = "雜誌文章";
  } else if (/\d{4}, [A-Za-z]+ \d{1,2}\)\.\s.*\..*[\.,] p? ?[A-Z]?\d*/.test(text)) {
    type = "新聞報紙";
  } else if (/出版社/.test(text) || /Press/.test(text) || /Publishers/.test(text)) {
    type = "書籍";
  } else if (/https?:\/\/|doi\.org/.test(text)) {
    type = "網路資源";
  }

  messages.push(`文獻${articleCount}：(${type})`);

  // ----- 基本檢查 -----
  const yearPattern = /\(\d{4}(, [A-Za-z]+ \d{1,2})?\)/;
  if (!yearPattern.test(text)) {
    messages.push("⚠️ 年份格式可能不正確，例如 (2021) 或 (2020, April 15)");
  }

  const authorPattern = /^([A-Z][a-zA-Z\-]+, [A-Z]\.?)(, [A-Z][a-zA-Z\-]+, [A-Z]\.?)*(& [A-Z][a-zA-Z\-]+, [A-Z]\.?)/;
  if (!authorPattern.test(text)) {
    messages.push("⚠️ 作者格式可能不正確，例如 Smith, J. D., & Howard, L. M.");
  }

  const titlePattern = /[A-Za-z0-9\s:]+[.,]/;
  if (!titlePattern.test(text)) {
    messages.push("⚠️ 請確認期刊或書名是否標示斜體（至少文字部分存在）");
  }

  const doiPattern = /https:\/\/doi\.org\/\S+/i;
  const urlPattern = /https?:\/\/[^\s]+/i;
  if (!doiPattern.test(text) && !urlPattern.test(text)) {
    messages.push("⚠️ 建議提供 DOI 或穩定的 URL");
  }

  result.innerText = messages.join("\n");
}
