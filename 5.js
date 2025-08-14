// 你的 GAS Web App URL
const DISCORD_GAS_URL = "https://script.google.com/macros/s/AKfycbzB-C8Ls08VhuZNgSWZ1RzIr4-T47yWTcPTBRvOpW_r2mt952gf-m1TgNmhAmOhifjN/exec";

// 傳資料給 GAS，再由 GAS 發送給 Discord
function sendToDiscord(player, result) {
  fetch(DISCORD_GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player, result })
  })
  .then(res => res.json())
  .then(data => console.log("Discord 訊息發送狀態：", data))
  .catch(err => console.error("Discord 訊息發送失敗：", err));
}

function addRollToHistory(player, result) {
  const timestamp = new Date().toLocaleString("zh-TW", { hour12: false });
  const record = { player, result, timestamp };

  rollHistory.push(record);
  updateAdminStats();
  saveToday();

  // 改用 GAS 中介發送 Discord 通知
  sendToDiscord(player, result);
}
