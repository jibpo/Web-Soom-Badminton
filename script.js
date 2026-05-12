let players = [];
let matchHistory = [];
let pairingHistory = {};
let currentMatchIndex = -1;
let score1 = 0, score2 = 0;
let isDeuceMode = false;

window.onload = function() {
    loadSavedGroups();
};

// --- ระบบจัดการก๊วน ---
function saveCurrentGroup() {
    const groupNameInput = document.getElementById('groupNameInput');
    const playerInput = document.getElementById('playerInput');
    const groupName = groupNameInput.value.trim();
    const names = playerInput.value.trim();

    if (!groupName || !names) {
        alert("กรุณาใส่ชื่อก๊วนและรายชื่อเพื่อนก่อนนะ");
        return;
    }
    
    let groups = JSON.parse(localStorage.getItem('badminton_presets') || '{}');
    groups[groupName] = names;
    localStorage.setItem('badminton_presets', JSON.stringify(groups));
    groupNameInput.value = "";
    loadSavedGroups();
    alert(`บันทึกก๊วน "${groupName}" เรียบร้อย!`);
}

function loadSavedGroups() {
    const container = document.getElementById('savedGroupsList');
    const groups = JSON.parse(localStorage.getItem('badminton_presets') || '{}');
    container.innerHTML = "";
    Object.keys(groups).forEach(name => {
        const div = document.createElement('div');
        div.className = "group-tag";
        div.innerHTML = `
            <button class="btn-group-load" onclick="applyGroup('${name}')">${name}</button>
            <span class="btn-group-del" onclick="deleteGroup('${name}')">×</span>
        `;
        container.appendChild(div);
    });
}

function applyGroup(name) {
    const groups = JSON.parse(localStorage.getItem('badminton_presets') || '{}');
    document.getElementById('playerInput').value = groups[name];
}

function deleteGroup(name) {
    if(confirm(`ลบก๊วน "${name}" หรือไม่?`)) {
        let groups = JSON.parse(localStorage.getItem('badminton_presets') || '{}');
        delete groups[name];
        localStorage.setItem('badminton_presets', JSON.stringify(groups));
        loadSavedGroups();
    }
}

// ฟังก์ชันเปล่ากัน Error สำหรับหน้าแรก
function autoSaveNames() { }

function clearNames() {
    if (confirm("ล้างรายชื่อในช่องพิมพ์?")) {
        document.getElementById('playerInput').value = "";
    }
}

// --- ระบบสุ่มคู่ ---
function startRandom() {
    const val = document.getElementById('playerInput').value.trim();
    let names = val.split('\n').filter(n => n.trim() !== "");
    if (names.length < 4) { alert("ขอ 4 คนขึ้นไปจ้า"); return; }

    for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
    }

    players = names.map(n => ({ name: n.trim(), playCount: 0, lastPlayed: false }));
    matchHistory = []; pairingHistory = {}; currentMatchIndex = -1;
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
    players.sort((a, b) => (a.playCount - b.playCount) || (a.lastPlayed ? 1 : -1) || Math.random() - 0.5);
    const sel = players.slice(0, 4);
    
    const p = sel.map(x => x.name);
    const options = [
        { t1p1: p[0], t1p2: p[1], t2p1: p[2], t2p2: p[3] },
        { t1p1: p[0], t1p2: p[2], t2p1: p[1], t2p2: p[3] },
        { t1p1: p[0], t1p2: p[3], t2p1: p[1], t2p2: p[2] }
    ];

    let minPair = Infinity; let best = options[0];
    options.forEach(opt => {
        const getC = (n1, n2) => pairingHistory[[n1, n2].sort().join('-')] || 0;
        const score = getC(opt.t1p1, opt.t1p2) + getC(opt.t2p1, opt.t2p2);
        if (score < minPair) { minPair = score; best = opt; }
    });

    players.forEach(p => p.lastPlayed = false);
    sel.forEach(p => { p.playCount++; p.lastPlayed = true; });

    const record = (n1, n2) => {
        const key = [n1, n2].sort().join('-');
        pairingHistory[key] = (pairingHistory[key] || 0) + 1;
    };
    record(best.t1p1, best.t1p2); record(best.t2p1, best.t2p2);

    const match = {
        round: matchHistory.length + 1,
        p1: best.t1p1, p2: best.t1p2, p3: best.t2p1, p4: best.t2p2,
        stats: "รอบที่เล่น: " + players.map(p => `${p.name}(${p.playCount})`).join(' ')
    };
    matchHistory.push(match);
    currentMatchIndex = matchHistory.length - 1;
    displayMatch(match);
}

function prevMatch() {
    if (currentMatchIndex > 0) {
        currentMatchIndex--;
        displayMatch(matchHistory[currentMatchIndex]);
    }
}

function displayMatch(m) {
    document.getElementById('roundCount').innerText = "Match " + m.round;
    document.getElementById('p1').innerText = m.p1; document.getElementById('p2').innerText = m.p2;
    document.getElementById('p3').innerText = m.p3; document.getElementById('p4').innerText = m.p4;
    document.getElementById('playerStats').innerText = m.stats;
    document.getElementById('prevBtn').style.opacity = currentMatchIndex === 0 ? "0.3" : "1";
}

function openScoreboard() {
    document.getElementById('randomPage').style.display = 'none';
    document.getElementById('scorePage').style.display = 'flex';
    document.getElementById('namesTeam1').innerText = document.getElementById('p1').innerText + " & " + document.getElementById('p2').innerText;
    document.getElementById('namesTeam2').innerText = document.getElementById('p3').innerText + " & " + document.getElementById('p4').innerText;
    resetScore();
}

function handleScoreClick(e, team) {
    const rect = e.currentTarget.getBoundingClientRect();
    const isPlus = (e.clientX - rect.left) > rect.width / 2;
    if (window.navigator.vibrate) window.navigator.vibrate(isPlus ? 40 : 10);
    
    if (team === 1) score1 = Math.max(0, score1 + (isPlus ? 1 : -1));
    else score2 = Math.max(0, score2 + (isPlus ? 1 : -1));
    
    document.getElementById('s1').innerText = score1;
    document.getElementById('s2').innerText = score2;
    
    document.getElementById('shuttle1').classList.toggle('active', isPlus && team === 1);
    document.getElementById('shuttle2').classList.toggle('active', isPlus && team === 2);

    if (isPlus) {
        if (score1 === 20 && score2 === 20 && !isDeuceMode) document.getElementById('deuceModal').style.display = 'flex';
        else if (!isDeuceMode && (score1 === 21 || score2 === 21)) showEndModal();
        else if (isDeuceMode && (Math.abs(score1 - score2) >= 2 || score1 === 30 || score2 === 30)) showEndModal();
    }
}

function startDeuce() { isDeuceMode = true; document.getElementById('deuceModal').style.display = 'none'; }
function showEndModal() {
    document.getElementById('winnerTitle').innerText = score1 > score2 ? "ฝั่งแดงชนะ! 🏆" : "ฝั่งน้ำเงินชนะ! 🏆";
    document.getElementById('endModal').style.display = 'flex';
}
function backToRandom() { document.getElementById('scorePage').style.display = 'none'; document.getElementById('randomPage').style.display = 'block'; }
function resetScore() { score1 = 0; score2 = 0; isDeuceMode = false; document.getElementById('s1').innerText = "0"; document.getElementById('s2').innerText = "0"; }
function closeModal() { document.getElementById('endModal').style.display = 'none'; document.getElementById('deuceModal').style.display = 'none'; }
function endGame() { closeModal(); backToRandom(); nextMatch(); }
function resetAll() { if (confirm("เริ่มใหม่ทั้งหมดใช่ไหม?")) location.reload(); }