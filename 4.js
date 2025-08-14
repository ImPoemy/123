// === Google Apps Script 部署後的 Web App URL ===
const SHEET_API = "https://script.google.com/macros/s/AKfycbwkkZUN1Wgu8pUH51FmntixY6beb6A8Pcmonoj2JjTiQ7Zh4b9A2jBl5l534cj_9xd32A/exec"; 

// DOM 元素
const nameScreen = document.getElementById('nameScreen');
const gameScreen = document.getElementById('gameScreen');
const adminScreen = document.getElementById('adminScreen');
const playerNameInput = document.getElementById('playerName');
const startButton = document.getElementById('startButton');
const rollButton = document.getElementById('rollButton');
const resultDiv = document.getElementById('result');
const diceDiv = document.getElementById('dice');
const playerWelcome = document.getElementById('playerWelcome');
const adminButton = document.getElementById('adminButton');
const backToGameButton = document.getElementById('backToGameButton');
const historyContainer = document.getElementById('historyContainer');
const totalRollsElement = document.getElementById('totalRolls');
const customAlert = document.getElementById('customAlert');

const diceEmojis = ['⚀','⚁','⚂','⚃','⚄','⚅'];

function todayKey(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

let currentPlayer = '';
let rollHistory = [];
let playedPlayers = new Set();

const STORAGE_KEY = () => `diceGame_${todayKey()}`;

// 顯示提示視窗
function showCustomAlert(playerName){
  const playerRoll = rollHistory.find(r => r.player === playerName);
  const alertMessage = document.querySelector('.alert-message');
  if (playerRoll){
    const emoji = diceEmojis[playerRoll.result-1];
    alertMessage.innerHTML = `此帳號今日已經使用過了<br>您今日骰到的點數為：${emoji} ${playerRoll.result}<br>每個帳號每日限玩一次`;
  } else {
    alertMessage.innerHTML = `此帳號今日已經使用過了<br>每個帳號每日限玩一次`;
  }
  customAlert.classList.add('show');
}
function closeCustomAlert(){ customAlert.classList.remove('show'); playerNameInput.value=''; }

// 存取本地紀錄
function saveToday(){
  localStorage.setItem(STORAGE_KEY(), JSON.stringify({ rollHistory, playedPlayers:[...playedPlayers] }));
}
function loadToday(){
  const raw = localStorage.getItem(STORAGE_KEY());
  if (!raw) return;
  try{
    const d = JSON.parse(raw);
    rollHistory = d.rollHistory || [];
    playedPlayers = new Set(d.playedPlayers || []);
    updateAdminStats();
  }catch{ localStorage.removeItem(STORAGE_KEY()); }
}

window.addEventListener('load', loadToday);

// 開始遊戲
function startGame(){
  const playerName = playerNameInput.value.trim();
  if (!playerName){ alert('請輸入會員帳號！'); return; }
  if (playedPlayers.has(playerName)){ showCustomAlert(playerName); return; }
  currentPlayer = playerName;
  playerWelcome.textContent = `歡迎 ${currentPlayer}！`;
  nameScreen.style.display='none';
  gameScreen.style.display='block';
  updateAdminStats();
  saveToday();
}

// 擲骰
function rollDice(){
  rollButton.disabled = true;
  rollButton.textContent = '擲骰中...';
  diceDiv.classList.add('rolling');

  let cnt=0;
  const itv = setInterval(()=>{
    diceDiv.textContent = diceEmojis[Math.floor(Math.random()*6)];
    cnt++;
    if (cnt>=10){
      clearInterval(itv);
      const finalResult = Math.floor(Math.random()*6)+1;
      diceDiv.textContent = diceEmojis[finalResult-1];
      resultDiv.textContent = `${currentPlayer} 的結果：${finalResult}`;
      addRollToHistory(currentPlayer, finalResult);
      playedPlayers.add(currentPlayer);
      saveToday();

      // ★ 送資料到 Google 試算表
      sendDiceResult(currentPlayer, finalResult);

      setTimeout(()=>{
        diceDiv.classList.remove('rolling');
        rollButton.disabled = true;
        rollButton.textContent = '已完成（每人限玩一次）';
        rollButton.style.backgroundColor = '#6c757d';
        rollButton.style.cursor = 'not-allowed';
      },100);
    }
  },50);
}

// 加入紀錄
function addRollToHistory(player, result){
  const timestamp = new Date().toLocaleString('zh-TW', { hour12:false });
  rollHistory.push({ player, result, timestamp });
  updateAdminStats();
  saveToday();
}

// 更新後台數據
function updateAdminStats(){ totalRollsElement.textContent = rollHistory.length; }
function updateAdminDisplay(){
  if (!rollHistory.length){
    historyContainer.innerHTML = '<div class="no-data">目前沒有擲骰紀錄</div>';
    return;
  }
  let html = `<table class="history-table"><thead><tr><th>會員帳號</th><th>遊玩時間</th><th>骰子點數</th></tr></thead><tbody>`;
  rollHistory.slice().reverse().forEach(r=>{
    html += `<tr><td>${r.player}</td><td>${r.timestamp}</td><td>${diceEmojis[r.result-1]} ${r.result}</td></tr>`;
  });
  html += '</tbody></table>';
  historyContainer.innerHTML = html;
}

// 後台切換
function showAdminPanel(){ gameScreen.style.display='none'; adminScreen.style.display='block'; updateAdminDisplay(); }
function backToGame(){ adminScreen.style.display='none'; gameScreen.style.display='block'; }

// ★ 發送資料到 Google 試算表
function sendDiceResult(player, result) {
  fetch(SHEET_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player: player, result: result })
  })
  .then(res => res.json())
  .then(data => console.log("已送到試算表：", data))
  .catch(err => console.error("送出失敗：", err));
}

// 事件監聽
startButton.addEventListener('click', startGame);
rollButton.addEventListener('click', rollDice);
adminButton.addEventListener('click', showAdminPanel);
backToGameButton.addEventListener('click', backToGame);
playerNameInput.addEventListener('keypress', (e)=>{ if(e.key==='Enter') startGame(); });
document.addEventListener('keydown', (e)=>{
  if (e.code==='Space' && gameScreen.style.display!=='none' && !rollButton.disabled && !playedPlayers.has(currentPlayer)){
    e.preventDefault(); rollDice();
  }
  if (e.key==='Escape' && customAlert.classList.contains('show')) closeCustomAlert();
});
customAlert.addEventListener('click', (e)=>{ if (e.target===customAlert) closeCustomAlert(); });
