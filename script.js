let players = [];
let round = 0, score1 = 0, score2 = 0;
let currentMatchPlayers = [];

function load8Players() {
    const list = ["Mad", "Plug", "May", "Petny", "Jibpo", "Bo", "Duen", "Anna"];
    document.getElementById('playerInput').value = list.join('\n');
}

function startRandom() {
    const val = document.getElementById('playerInput').value.trim();
    const names = val.split('\n').filter(n => n.trim() !== "");
    if (names.length < 4) { alert("กรุณาใส่ชื่ออย่างน้อย 4 คน"); return; }
    players = names.map(n => ({ name: n, playCount: 0, lastPlayed: false }));
    round = 0;
    document.getElementById('matchCard').style.display = 'block';
    pickMatch();
}

function pickMatch() {
    round++;
    players.sort((a, b) => a.playCount - b.playCount || (a.lastPlayed ? 1 : -1) || Math.random() - 0.5);
    currentMatchPlayers = players.slice(0, 4);
    players.forEach(p => p.lastPlayed = false);
    currentMatchPlayers.forEach(p => { p.playCount++; p.lastPlayed = true; });

    document.getElementById('roundCount').innerText = "Match " + round;
    document.getElementById('p1').innerText = currentMatchPlayers[0].name;
    document.getElementById('p2').innerText = currentMatchPlayers[1].name;
    document.getElementById('p3').innerText = currentMatchPlayers[2].name;
    document.getElementById('p4').innerText = currentMatchPlayers[3].name;
    
    let txt = "Stats: ";
    players.forEach(p => txt += `${p.name}(${p.playCount}) `);
    document.getElementById('playerStats').innerText = txt;
}

function openScoreboard() {
    document.getElementById('randomPage').style.display = 'none';
    document.getElementById('scorePage').style.display = 'block';
    document.getElementById('namesTeam1').innerText = `${currentMatchPlayers[0].name} & ${currentMatchPlayers[1].name}`;
    document.getElementById('namesTeam2').innerText = `${currentMatchPlayers[2].name} & ${currentMatchPlayers[3].name}`;
    resetScore();
}

function handleScoreClick(e, team) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isPlus = x > rect.width / 2;
    
    if (window.navigator.vibrate) window.navigator.vibrate(isPlus ? 40 : [30, 50]);
    
    if (team === 1) score1 = Math.max(0, score1 + (isPlus ? 1 : -1));
    else score2 = Math.max(0, score2 + (isPlus ? 1 : -1));
    
    document.getElementById('s1').innerText = score1;
    document.getElementById('s2').innerText = score2;

    if (((score1 >= 21 || score2 >= 21) && Math.abs(score1 - score2) >= 2) || score1 === 30 || score2 === 30) {
        document.getElementById('winnerTitle').innerText = score1 > score2 ? "Red Wins!" : "Blue Wins!";
        document.getElementById('endModal').style.display = 'flex';
    }
}

function backToRandom() {
    document.getElementById('scorePage').style.display = 'none';
    document.getElementById('randomPage').style.display = 'block';
}

function resetScore() { score1 = 0; score2 = 0; document.getElementById('s1').innerText = "0"; document.getElementById('s2').innerText = "0"; }
function closeModal() { document.getElementById('endModal').style.display = 'none'; }
function endGame() { closeModal(); nextMatch(); backToRandom(); }
function nextMatch() { if (players.length === 0) return; pickMatch(); }
function resetAll() { if (confirm("Reset everything?")) location.reload(); }