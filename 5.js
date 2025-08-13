fetch("https://script.google.com/macros/s/AKfycbxDsVPA5JATA7NkmuC3XokBa2gedWE_ffaLElMUHPRllHUTr4JzzwJrstFanpnwmtHD/exec", {
  method: "POST",
  body: JSON.stringify({ player, result })
});
