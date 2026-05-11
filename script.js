let players = [];
let matchHistory = [];
let currentMatchIndex = -1;
let score1 = 0, score2 = 0;

function load8Players() {
    const list = ["Mad", "Plug", "Petny", "Bo", "Jibpo", "May", "Duen", "Anna"];
    document.getElementById('playerInput').value = list.join('\n');
}

function startRandom() {
    const val = document.getElementById('playerInput').value.trim();
    const names = val.split('\n').filter(n => n.trim() !== "");
    if (names.length < 4) { alert("กรุณาใส่ชื่ออย่างน้อย 4 คน"); return; }
    players = names.map(n => ({ name: n, playCount: 0, lastPlayed: false }));
    matchHistory = []; 
    currentMatchIndex = -1;
    document.getElementById('matchCard').style.display = 'block';
    nextMatch();
}

function nextMatch() {
    if (currentMatchIndex < matchHistory.length - 1) {
        currentMatchIndex++;
        displayMatch(matchHistory[currentMatchIndex]);
    } else {
        pickNewMatch();
    }
}

function pickNewMatch() {
    players.sort((a, b) => a.playCount - b.playCount || (a.lastPlayed ? 1 : -1) || Math.random() - 0.5);
    const selected = players.slice(0, 4);
    players.forEach(p => p.lastPlayed = false);
    selected.forEach(p => { p.playCount++; p.lastPlayed = true; });

    const newMatch = {
        round: matchHistory.length + 1,
        p1: selected[0].name, p2: selected[1].name,
        p3: selected[2].name, p4: selected[3].name,
        stats: getStatsSnapshot()
    };
    matchHistory.push(newMatch);
    currentMatchIndex = matchHistory.length - 1;
    displayMatch(newMatch);
}

function prevMatch() {
    if (currentMatchIndex > 0) {
        currentMatchIndex--;
        displayMatch(matchHistory[currentMatchIndex]);
    }
}

function displayMatch(match) {
    document.getElementById('roundCount').innerText = "Match " + match.round;
    document.getElementById('p1').innerText = match.p1;
    document.getElementById('p2').innerText = match.p2;
    document.getElementById('p3').innerText = match.p3;
    document.getElementById('p4').innerText = match.p4;
    document.getElementById('playerStats').innerText = match.stats;

    const prevBtn = document.getElementById('prevBtn');
    prevBtn.disabled = currentMatchIndex === 0;
    prevBtn.style.opacity = prevBtn.disabled ? "0.3" : "1";
}

function getStatsSnapshot() {
    let txt = "Stats: ";
    players.forEach(p => txt += `${p.name}(${p.playCount}) `);
    return txt;
}

function openScoreboard() {
    document.getElementById('randomPage').style.none = 'none'; // Clear older
    document.getElementById('randomPage').style.display = 'none';
    document.getElementById('scorePage').style.display = 'block';
    document.getElementById('namesTeam1').innerText = `${document.getElementById('p1').innerText} & ${document.getElementById('p2').innerText}`;
    document.getElementById('namesTeam2').innerText = `${document.getElementById('p3').innerText} & ${document.getElementById('p4').innerText}`;
    resetScore();
}

function handleScoreClick(e, team) {
    const rect = e.currentTarget.getBoundingClientRect();
    const isPlus = (e.clientX - rect.left) > rect.width / 2;
    
    // --- ระบบสั่นแบบอัปเกรด ---
    if (window.navigator.vibrate) {
        if (isPlus) {
            // สั่นสั้นๆ 1 ครั้งตอนเพิ่มแต้ม
            window.navigator.vibrate(50); 
        } else {
            // สั่น 2 ครั้งตอนลดแต้ม (สั่น 40ms, หยุด 30ms, สั่น 40ms)
            window.navigator.vibrate([40, 30, 40]);
        }
    }
    // -----------------------

    const val = isPlus ? 1 : -1;
    if (team === 1) score1 = Math.max(0, score1 + val);
    else score2 = Math.max(0, score2 + val);
    
    document.getElementById('s1').innerText = score1;
    document.getElementById('s2').innerText = score2;

    // อัปเดตลูกขนไก่
    if (val > 0) updateShuttle(team);
    else updateShuttle(0);

    // เช็คจบเกม
    if (val > 0 && (((score1 >= 21 || score2 >= 21) && Math.abs(score1 - score2) >= 2) || score1 === 30 || score2 === 30)) {
        // สั่นยาวๆ แจ้งเตือนจบเกม
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100, 50, 300]);
        document.getElementById('winnerTitle').innerText = score1 > score2 ? "Red Wins!" : "Blue Wins!";
        document.getElementById('endModal').style.display = 'flex';
    }
}

function updateShuttle(winner) {
    document.getElementById('shuttle1').classList.remove('active');
    document.getElementById('shuttle2').classList.remove('active');
    if (winner === 1) document.getElementById('shuttle1').classList.add('active');
    if (winner === 2) document.getElementById('shuttle2').classList.add('active');
}

function backToRandom() {
    document.getElementById('scorePage').style.display = 'none';
    document.getElementById('randomPage').style.display = 'block';
}

function resetScore() {
    score1 = 0; score2 = 0;
    document.getElementById('s1').innerText = "0";
    document.getElementById('s2').innerText = "0";
    updateShuttle(0);
}

function closeModal() { document.getElementById('endModal').style.display = 'none'; }
function endGame() { closeModal(); backToRandom(); }
function resetAll() { if (confirm("Reset everything?")) location.reload(); }