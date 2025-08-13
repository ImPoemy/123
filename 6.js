function sendToTelegram(player, result) {
    fetch("https://script.google.com/macros/s/你的GAS-ID/exec", {
        method: "POST",
        body: JSON.stringify({ player: player, result: result })
    })
    .then(res => res.json())
    .then(data => console.log("已發送到 Telegram:", data))
    .catch(err => console.error("發送失敗:", err));
}

sendToTelegram("玩家名稱", 5); // 範例
