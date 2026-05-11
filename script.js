let players = [];
let round = 0, score1 = 0, score2 = 0;
let currentMatchPlayers = [];

// 1. โหลดรายชื่อตัวอย่าง
function load8Players() {
    const list = ["พี่เกษ", "พี่ต้อม", "น้องนิด", "เต้", "สมชาย", "น้องมิ้นต์", "น้องปลา", "นัท"];
    document.getElementById('playerInput').value = list.join('\n');
}

// 2. ฟังก์ชันเริ่มสุ่ม (จากหน้าแรก)
function startRandom() {
    const val = document.getElementById('playerInput').value.trim();
    const names = val.split('\n').filter(n => n.trim() !== "");
    
    if (names.length < 4) { 
        alert("กรุณาใส่ชื่ออย่างน้อย 4 คนครับ"); 
        return; 
    }

    // สร้างฐานข้อมูลผู้เล่น (ถ้ายังไม่มี)
    players = names.map(n => ({ 
        name: n, 
        playCount: 0, 
        lastPlayed: false 
    }));
    
    round = 0;
    document.getElementById('matchCard').style.display = 'block';
    pickMatch();
}

// 3. อัลกอริทึมเลือกคู่ (เน้นให้ทุกคนเล่นเท่ากัน)
function pickMatch() {
    round++;
    // เรียง: คนเล่นน้อยสุด > คนที่ไม่ได้เพิ่งเล่น > สุ่มดวง
    players.sort((a, b) => a.playCount - b.playCount || (a.lastPlayed ? 1 : -1) || Math.random() - 0.5);
    
    currentMatchPlayers = players.slice(0, 4);
    
    // อัปเดตสถานะ (คนกลุ่มนี้เพิ่งเล่นไปนะ)
    players.forEach(p => p.lastPlayed = false);
    currentMatchPlayers.forEach(p => { 
        p.playCount++; 
        p.lastPlayed = true; 
    });

    // แสดงผลที่หน้าสุ่ม
    document.getElementById('roundCount').innerText = "แมตช์ที่ " + round;
    document.getElementById('p1').innerText = currentMatchPlayers[0].name;
    document.getElementById('p2').innerText = currentMatchPlayers[1].name;
    document.getElementById('p3').innerText = currentMatchPlayers[2].name;
    document.getElementById('p4').innerText = currentMatchPlayers[3].name;

    updateStatsText();
}

// 4. อัปเดตตัวเลขสถิติเล็กๆ ด้านล่าง
function updateStatsText() {
    let txt = "สถิติลงสนาม: ";
    players.forEach(p => txt += `${p.name}(${p.playCount}) `);
    document.getElementById('playerStats').innerText = txt;
}

// 5. เปลี่ยนหน้าไปที่สกอร์บอร์ดเต็มจอ
function openScoreboard() {
    document.getElementById('randomPage').style.display = 'none';
    document.getElementById('scorePage').style.display = 'block';
    
    // ส่งชื่อผู้เล่นไปแสดงที่หน้าสกอร์ (แบบโปร่งแสงด้านบน)
    document.getElementById('namesTeam1').innerText = `${currentMatchPlayers[0].name} + ${currentMatchPlayers[1].name}`;
    document.getElementById('namesTeam2').innerText = `${currentMatchPlayers[2].name} + ${currentMatchPlayers[3].name}`;
    
    resetScore();
}

// 6. ระบบนับคะแนน (แตะขวาเพิ่ม / แตะซ้ายลด)
function handleScoreClick(e, team) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isPlus = x > rect.width / 2;
    
    // ระบบสั่น Feedback (สั่นสั้นถ้าบวก / สั่น 2 ครั้งถ้าลด)
    if (window.navigator.vibrate) {
        if (isPlus) window.navigator.vibrate(40);
        else window.navigator.vibrate([30, 50, 30]);
    }
    
    updateScore(team, isPlus ? 1 : -1);
}

function updateScore(team, val) {
    if (team === 1) score1 = Math.max(0, score1 + val);
    else score2 = Math.max(0, score2 + val);
    
    document.getElementById('s1').innerText = score1;
    document.getElementById('s2').innerText = score2;

    // เช็คกติกาการชนะ (21 แต้ม หรือ Deuce)
    if (val > 0) {
        if ((score1 >= 21 || score2 >= 21) && Math.abs(score1 - score2) >= 2) {
            showEndModal();
        } else if (score1 === 30 || score2 === 30) {
            showEndModal();
        }
    }
}

// 7. จัดการ Modal จบเกม
function showEndModal() {
    const winner = score1 > score2 ? "ทีมแดงชนะ!" : "ทีมน้ำเงินชนะ!";
    document.getElementById('winnerTitle').innerText = winner;
    document.getElementById('endModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('endModal').style.display = 'none';
}

function endGame() {
    document.getElementById('endModal').style.display = 'none';
    backToRandom();
}

// 8. ฟังก์ชันช่วยอื่นๆ
function backToRandom() {
    document.getElementById('scorePage').style.display = 'none';
    document.getElementById('randomPage').style.display = 'block';
}

function resetScore() {
    score1 = 0; score2 = 0;
    document.getElementById('s1').innerText = "0";
    document.getElementById('s2').innerText = "0";
}

function nextMatch() {
    if (players.length === 0) {
        alert("กรุณาเริ่มสุ่มคู่แรกก่อนครับ");
        return;
    }
    pickMatch();
}

function resetAll() {
    if (confirm("ต้องการล้างรายชื่อและรีเซ็ตสถิติทั้งหมดใช่ไหม?")) {
        location.reload();
    }
}