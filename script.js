function checkAPA() {
  const text = document.getElementById("inputText").value.trim();
  const result = document.getElementById("result");

  if (!text) {
    result.innerText = "⚠️ 請先輸入一篇參考文獻";
    return;
  }

  let messages = [];
  let type = "未知文獻類型";

  // ----- 判斷文獻類型 -----
  // 簡單判斷：依照文字特徵或格式
  if (/\d{4}\)\.\s.*\..*, \d+\(\d+\),/.test(text)) {
    type = "期刊文章 (Journal Article)";
  } else if (/\d{4}, [A-Za-z]+ \d{1,2}\)\.\s.*\..*, \d+/.test(text)) {
    type = "雜誌文章 (Magazine Article)";
  } else if (/\d{4}, [A-Za-z]+ \d{1,2}\)\.\s.*\..*[\.,] p? ?[A-Z]?\d*/.test(text)) {
    type = "新聞報紙 (Newspaper Article)";
  } else if (/出版社/.test(text) || /Press/.test(text) || /Publishers/.test(text)) {
    type = "書籍 (Book)";
  } else if (/https?:\/\/|doi\.org/.test(text)) {
    type = "網路資源 (Online Resource)";
  }

  messages.push(`📌 偵測文獻類型：${type}`);

  // ----- 基本檢查 -----
  // 1️⃣ 年份格式
  const yearPattern = /\(\d{4}(, [A-Za-z]+ \d{1,2})?\)/;
  if (!yearPattern.test(text)) {
    messages.push("⚠️ 年份格式可能不正確，例如 (2021) 或 (2020, April 15)");
  }

  // 2️⃣ 作者格式
  const authorPattern = /^([A-Z][a-zA-Z\-]+, [A-Z]\.?)(, [A-Z][a-zA-Z\-]+, [A-Z]\.?)*(& [A-Z][a-zA-Z\-]+, [A-Z]\.?)/;
  if (!authorPattern.test(text)) {
    messages.push("⚠️ 作者格式可能不正確，例如 Smith, J. D., & Howard, L. M.");
  }

  // 3️⃣ 斜體檢查 (簡單判斷期刊/書名是否存在)
  const titlePattern = /[A-Za-z0-9\s:]+[.,]/;
  if (!titlePattern.test(text)) {
    messages.push("⚠️ 請確認期刊或書名是否標示斜體（至少文字部分存在）");
  }

  // 4️⃣ DOI / URL
  const doiPattern = /https:\/\/doi\.org\/\S+/i;
  const urlPattern = /https?:\/\/[^\s]+/i;
  if (!doiPattern.test(text) && !urlPattern.test(text)) {
    messages.push("⚠️ 建議提供 DOI 或穩定的 URL");
  }

  // ----- 顯示結果 -----
  if (messages.length === 1) {
    result.innerText = "✅ 這篇參考文獻基本符合 APA 第七版格式";
  } else {
    result.innerText = messages.join("\n");
  }
}
