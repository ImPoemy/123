// 你的 Google Apps Script Web App URL
const GAS_URL = "https://script.google.com/macros/s/AKfycbxxkT6oOYY-MlN4pok5UKOwEarSvFVlrRaF9ISZlyxaqkPnr4Ult4BNLOUKvC_eOiFM/exec";

// 新增：將擲骰資料送到 Google Sheets
async function sendToSheet(record) {
  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record)
    });
    const text = await res.text();
    console.log("GAS 回應：", text);
  } catch (e) {
    console.error("送出到試算表失敗：", e);
  }
}

function addRollToHistory(player, result) {
  const timestamp = new Date().toLocaleString('zh-TW', { hour12:false });
  const record = { player, result, timestamp };

  // 原本紀錄流程
  rollHistory.push(record);
  updateAdminStats();
  saveToday();

  // 新增：送出資料到 Google Sheets
  sendToSheet(record);
}
