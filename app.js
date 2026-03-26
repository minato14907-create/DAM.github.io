/* ============================================
   VALO CASE - Main Application Logic
   ============================================ */

// ==========================================
// CONSTANTS & CONFIG
// ==========================================
const API_BASE = 'https://valorant-api.com/v1';

const RARITY_MAP = {
    '12683d76-48d7-84a3-4e09-6985794f0445': { name: 'Select', rank: 0, color: '#5A9FE2', css: 'select', chance: 45 },
    '0cebb8be-46d7-c12a-d306-e9907bfc5a25': { name: 'Deluxe', rank: 1, color: '#009587', css: 'deluxe', chance: 28 },
    '60bca009-4182-7998-dee7-b8a2558dc369': { name: 'Premium', rank: 2, color: '#D1548D', css: 'premium', chance: 17 },
    'e046854e-406c-37f4-6607-19a9ba8426fc': { name: 'Exclusive', rank: 3, color: '#F5955B', css: 'exclusive', chance: 8 },
    '411e4a55-4e59-7757-41f0-86a53f101bb5': { name: 'Ultra', rank: 4, color: '#FAD663', css: 'ultra', chance: 2 },
};

const RARITY_SELL_PRICES = { select: 20, deluxe: 50, premium: 120, exclusive: 300, ultra: 800 };

const CASES_CONFIG = [
    { id: 'budget', name: '📦 Budget Case', desc: 'กล่องราคาประหยัด เหมาะสำหรับมือใหม่', price: 50, rarityWeights: { select: 55, deluxe: 30, premium: 12, exclusive: 2.5, ultra: 0.5 } },
    { id: 'standard', name: '🎁 Standard Case', desc: 'กล่องมาตรฐาน โอกาสดีขึ้น', price: 100, rarityWeights: { select: 40, deluxe: 30, premium: 20, exclusive: 8, ultra: 2 } },
    { id: 'premium', name: '💎 Premium Case', desc: 'กล่องพรีเมียม โอกาสได้สกินหายากสูง', price: 250, rarityWeights: { select: 20, deluxe: 25, premium: 30, exclusive: 18, ultra: 7 } },
    { id: 'legendary', name: '🔥 Legendary Case', desc: 'กล่องตำนาน สกินระดับ Ultra รอคุณอยู่!', price: 500, rarityWeights: { select: 10, deluxe: 15, premium: 30, exclusive: 30, ultra: 15 } },
    { id: 'vandal', name: '🎯 Vandal Collection', desc: 'กล่องพิเศษ สกิน Vandal เท่านั้น!', price: 200, rarityWeights: { select: 30, deluxe: 28, premium: 25, exclusive: 12, ultra: 5 }, weaponFilter: 'Vandal' },
    { id: 'phantom', name: '👻 Phantom Collection', desc: 'กล่องพิเศษ สกิน Phantom เท่านั้น!', price: 200, rarityWeights: { select: 30, deluxe: 28, premium: 25, exclusive: 12, ultra: 5 }, weaponFilter: 'Phantom' },
    { id: 'knife', name: '🗡️ Knife Collection', desc: 'กล่องมีด สกินมีดแบบเดียวกับในเกม!', price: 400, rarityWeights: { select: 15, deluxe: 20, premium: 30, exclusive: 25, ultra: 10 }, weaponFilter: 'Melee' },
    { id: 'operator', name: '🔭 Operator Collection', desc: 'กล่อง Operator สกินสไนเปอร์ระดับตำนาน!', price: 300, rarityWeights: { select: 25, deluxe: 25, premium: 25, exclusive: 17, ultra: 8 }, weaponFilter: 'Operator' },
    { id: 'sheriff', name: '🔫 Sheriff Collection', desc: 'กล่องรวมสกิน Sheriff สุดเท่!', price: 180, rarityWeights: { select: 30, deluxe: 28, premium: 25, exclusive: 12, ultra: 5 }, weaponFilter: 'Sheriff' },
    { id: 'spectre', name: '💨 Spectre Collection', desc: 'กล่องสกิน Spectre ปืนกลมือยอดนิยม', price: 160, rarityWeights: { select: 32, deluxe: 28, premium: 24, exclusive: 12, ultra: 4 }, weaponFilter: 'Spectre' },
    { id: 'guardian', name: '🛡️ Guardian Collection', desc: 'กล่อง Guardian ปืนกึ่งอัตโนมัติ', price: 200, rarityWeights: { select: 28, deluxe: 25, premium: 26, exclusive: 14, ultra: 7 }, weaponFilter: 'Guardian' },
    { id: 'judge', name: '⚡ Judge Collection', desc: 'กล่อง Judge ช็อตกันระยะประชิด!', price: 150, rarityWeights: { select: 35, deluxe: 28, premium: 22, exclusive: 11, ultra: 4 }, weaponFilter: 'Judge' },
    { id: 'marshal', name: '🏹 Marshal Case', desc: 'กล่อง Marshal สไนเปอร์ราคาประหยัด', price: 170, rarityWeights: { select: 30, deluxe: 27, premium: 25, exclusive: 13, ultra: 5 }, weaponFilter: 'Marshal' },
    { id: 'rainbow', name: '🌈 Rainbow Case', desc: 'กล่องสีรุ้ง โอกาสได้ทุกระดับเท่าๆ กัน!', price: 350, rarityWeights: { select: 20, deluxe: 20, premium: 20, exclusive: 20, ultra: 20 } },
    { id: 'neon', name: '💜 Neon Rush', desc: 'กล่องนีออน สกินเรืองแสงสุดล้ำ', price: 300, rarityWeights: { select: 22, deluxe: 22, premium: 28, exclusive: 18, ultra: 10 } },
    { id: 'whale', name: '🐋 Whale Case', desc: 'กล่องสำหรับเศรษฐี! Ultra Rate สูงมาก!', price: 1000, rarityWeights: { select: 5, deluxe: 10, premium: 20, exclusive: 35, ultra: 30 } },
];

// ==========================================
// STATE
// ==========================================
let allSkins = [];
let skinsByRarity = {};
let currentUser = null;
let currentCase = null;
let currentWinItem = null;
let withdrawItemIndex = -1;
let isSpinning = false;
let dropHistory = [];

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    createParticles();
    loadSession();
    updateUI();
    await fetchSkins();
    renderHome();
    navigateTo('home');
});

// ==========================================
// API - FETCH SKINS
// ==========================================
async function fetchSkins() {
    try {
        const res = await fetch(`${API_BASE}/weapons/skins`);
        const data = await res.json();

        allSkins = data.data
            .filter(skin => {
                // Filter out standard/default skins and random favorites
                return skin.contentTierUuid &&
                    skin.displayIcon &&
                    !skin.displayName.includes('Standard') &&
                    !skin.displayName.includes('Random Favorite');
            })
            .map(skin => {
                const rarity = RARITY_MAP[skin.contentTierUuid];
                return {
                    uuid: skin.uuid,
                    name: skin.displayName,
                    icon: skin.displayIcon,
                    chromas: skin.chromas,
                    rarity: rarity ? rarity.css : 'select',
                    rarityName: rarity ? rarity.name : 'Select',
                    rarityColor: rarity ? rarity.color : '#5A9FE2',
                    contentTierUuid: skin.contentTierUuid,
                };
            });

        // Group by rarity
        skinsByRarity = {};
        for (const skin of allSkins) {
            if (!skinsByRarity[skin.rarity]) skinsByRarity[skin.rarity] = [];
            skinsByRarity[skin.rarity].push(skin);
        }

        console.log(`Loaded ${allSkins.length} skins from Valorant API`);
    } catch (err) {
        console.error('Failed to fetch skins:', err);
        showToast('ไม่สามารถโหลดข้อมูลสกินได้ กรุณารีเฟรชหน้า', 'error');
    }
}

// ==========================================
// NAVIGATION
// ==========================================
function navigateTo(page) {
    // Auth guard
    if ((page === 'inventory' || page === 'admin' || page === 'tradeup' || page === 'achievements' || page === 'shootingrange' || page === 'luckywheel') && !currentUser) {
        showToast('กรุณาเข้าสู่ระบบก่อน', 'error');
        showLoginModal();
        return;
    }
    if (page === 'admin' && currentUser && !currentUser.isAdmin) {
        showToast('คุณไม่มีสิทธิ์เข้าถึงหน้านี้', 'error');
        return;
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    const targetLink = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (targetLink) targetLink.classList.add('active');

    // Render page content
    switch (page) {
        case 'home': renderHome(); break;
        case 'cases': renderCases(); break;
        case 'inventory': renderInventory(); break;
        case 'tradeup': renderTradeUp(); break;
        case 'leaderboard': renderLeaderboard('value'); break;
        case 'achievements': renderAchievements(); break;
        case 'shootingrange': renderShootingRange(); break;
        case 'luckywheel': renderLuckyWheel(); break;
        case 'admin': renderAdmin(); break;
    }

    window.scrollTo(0, 0);
    closeUserDropdown();
}

// ==========================================
// AUTH SYSTEM
// ==========================================
function getUsers() {
    return JSON.parse(localStorage.getItem('valocase_users') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('valocase_users', JSON.stringify(users));
}

function loadSession() {
    const session = localStorage.getItem('valocase_session');
    if (session) {
        const username = JSON.parse(session);
        const users = getUsers();
        currentUser = users.find(u => u.username === username);
        if (!currentUser) {
            localStorage.removeItem('valocase_session');
        }
    }

    // Create default admin if none exists
    const users = getUsers();
    if (!users.find(u => u.isAdmin)) {
        users.push({
            username: 'admin',
            password: 'admin123',
            balance: 99999,
            inventory: [],
            isAdmin: true,
            createdAt: Date.now(),
        });
        saveUsers(users);
    }
}

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    if (!username || !password) {
        errorEl.textContent = 'กรุณากรอกข้อมูลให้ครบ';
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        errorEl.textContent = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        return;
    }

    currentUser = user;
    localStorage.setItem('valocase_session', JSON.stringify(username));
    closeModal();
    updateUI();
    showToast(`ยินดีต้อนรับ ${username}! 🎉`, 'success');

    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    errorEl.textContent = '';
}

function register() {
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    const errorEl = document.getElementById('regError');

    if (!username || !password || !confirm) {
        errorEl.textContent = 'กรุณากรอกข้อมูลให้ครบ';
        return;
    }
    if (username.length < 3) {
        errorEl.textContent = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
        return;
    }
    if (password.length < 4) {
        errorEl.textContent = 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร';
        return;
    }
    if (password !== confirm) {
        errorEl.textContent = 'รหัสผ่านไม่ตรงกัน';
        return;
    }

    const users = getUsers();
    if (users.find(u => u.username === username)) {
        errorEl.textContent = 'ชื่อผู้ใช้นี้มีคนใช้แล้ว';
        return;
    }

    const newUser = {
        username,
        password,
        balance: 500, // Starting bonus
        inventory: [],
        isAdmin: false,
        createdAt: Date.now(),
    };

    users.push(newUser);
    saveUsers(users);

    currentUser = newUser;
    localStorage.setItem('valocase_session', JSON.stringify(username));
    closeModal();
    updateUI();
    showToast(`สมัครสำเร็จ! ได้รับ 500 VP ฟรี! 🎁`, 'success');

    document.getElementById('regUsername').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regConfirm').value = '';
    errorEl.textContent = '';
}

function logout() {
    currentUser = null;
    localStorage.removeItem('valocase_session');
    updateUI();
    navigateTo('home');
    showToast('ออกจากระบบเรียบร้อย', 'info');
    closeUserDropdown();
}

function saveCurrentUser() {
    if (!currentUser) return;
    const users = getUsers();
    const idx = users.findIndex(u => u.username === currentUser.username);
    if (idx !== -1) {
        users[idx] = currentUser;
        saveUsers(users);
    }
}

// ==========================================
// UI UPDATES
// ==========================================
function updateUI() {
    const authBtns = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const balanceDisplay = document.getElementById('balanceDisplay');
    const adminLink = document.getElementById('adminLink');

    if (currentUser) {
        authBtns.style.display = 'none';
        userMenu.style.display = 'block';
        balanceDisplay.style.display = 'flex';
        document.getElementById('balanceAmount').textContent = currentUser.balance.toLocaleString();
        document.getElementById('userInitial').textContent = currentUser.username[0].toUpperCase();
        document.getElementById('dropdownUsername').textContent = currentUser.username;
        document.getElementById('dropdownRole').textContent = currentUser.isAdmin ? '⭐ Admin' : 'Member';
        adminLink.style.display = currentUser.isAdmin ? 'flex' : 'none';
    } else {
        authBtns.style.display = 'flex';
        userMenu.style.display = 'none';
        balanceDisplay.style.display = 'none';
        adminLink.style.display = 'none';
    }
}

// ==========================================
// MODAL SYSTEM
// ==========================================
function showLoginModal() {
    document.getElementById('loginError').textContent = '';
    openModal('loginModal');
}

function showRegisterModal() {
    document.getElementById('regError').textContent = '';
    openModal('registerModal');
}

function showTopupModal() {
    if (!currentUser) { showLoginModal(); return; }
    document.getElementById('topupCurrentBalance').textContent = currentUser.balance.toLocaleString();
    openModal('topupModal');
}

function openModal(id) {
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById(id).classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

function closeWinModal() {
    document.getElementById('winModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
}

// ==========================================
// USER DROPDOWN
// ==========================================
function toggleUserDropdown() {
    document.getElementById('userDropdown').classList.toggle('active');
}

function closeUserDropdown() {
    document.getElementById('userDropdown').classList.remove('active');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-avatar') && !e.target.closest('.user-dropdown')) {
        closeUserDropdown();
    }
});

// ==========================================
// WALLET / TOP-UP / PAYMENT
// ==========================================
let pendingPayment = null;
let paymentTimerInterval = null;

const TOPUP_PRICES = { 100: 35, 500: 170, 1000: 320, 2500: 750, 5000: 1400, 10000: 2600 };

function topUp(amount) {
    showPayment(amount, TOPUP_PRICES[amount] || Math.round(amount * 0.3));
}

function showPayment(vpAmount, thbPrice) {
    if (!currentUser) return;
    pendingPayment = { vp: vpAmount, price: thbPrice };

    // Close topup modal first
    closeModal();

    setTimeout(() => {
        const infoEl = document.getElementById('paymentInfo');
        infoEl.innerHTML = `
            <div class="pi-label">ยอดชำระ</div>
            <div class="pi-amount">฿${thbPrice.toLocaleString()}</div>
            <div class="pi-vp">+${vpAmount.toLocaleString()} VP</div>
        `;

        generateQR(thbPrice);
        startPaymentTimer();

        document.getElementById('modalOverlay').classList.add('active');
        document.getElementById('paymentModal').classList.add('active');
    }, 300);
}

function selectPaymentMethod(btn, method) {
    document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (pendingPayment) generateQR(pendingPayment.price, method);
}

function generateQR(amount, method) {
    const qrEl = document.getElementById('qrCode');
    // Generate a simple QR-like pattern using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 180, 180);

    // Draw QR-like pattern
    const cellSize = 6;
    const grid = 26;
    const offset = (180 - grid * cellSize) / 2;

    // Seed deterministic pattern from amount
    let seed = amount * 1337 + 42;
    const rand = () => { seed = (seed * 16807 + 12345) % 2147483647; return seed / 2147483647; };

    ctx.fillStyle = '#000000';

    // Corner patterns (QR finder patterns)
    const drawFinder = (x, y) => {
        for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 7; c++) {
                if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
                    ctx.fillRect(offset + (x + c) * cellSize, offset + (y + r) * cellSize, cellSize, cellSize);
                }
            }
        }
    };
    drawFinder(0, 0);
    drawFinder(grid - 7, 0);
    drawFinder(0, grid - 7);

    // Random data cells
    for (let r = 0; r < grid; r++) {
        for (let c = 0; c < grid; c++) {
            if ((r < 7 && c < 7) || (r < 7 && c >= grid - 7) || (r >= grid - 7 && c < 7)) continue;
            if (rand() > 0.5) {
                ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
            }
        }
    }

    // Center logo
    ctx.fillStyle = '#FF4655';
    ctx.beginPath();
    ctx.arc(90, 90, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('V', 90, 91);

    qrEl.innerHTML = '';
    qrEl.appendChild(canvas);
}

function startPaymentTimer() {
    let seconds = 900; // 15 minutes
    const timerEl = document.getElementById('paymentTimer');
    clearInterval(paymentTimerInterval);
    paymentTimerInterval = setInterval(() => {
        seconds--;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        if (seconds <= 0) {
            clearInterval(paymentTimerInterval);
            closePayment();
            showToast('หมดเวลาชำระเงิน', 'error');
        }
    }, 1000);
}

function confirmPayment() {
    if (!pendingPayment || !currentUser) return;

    const modal = document.getElementById('paymentModal');
    const body = modal.querySelector('.modal-body');

    // Show processing
    body.innerHTML = `
        <div class="payment-processing">
            <div class="spinner"></div>
            <h3>กำลังตรวจสอบการชำระเงิน...</h3>
            <p style="color:var(--val-text-dim)">กรุณารอสักครู่</p>
        </div>
    `;

    // Simulate processing
    setTimeout(() => {
        currentUser.balance += pendingPayment.vp;
        saveCurrentUser();
        updateUI();

        body.innerHTML = `
            <div class="payment-success">
                <div class="payment-success-icon">✅</div>
                <h3>ชำระเงินสำเร็จ!</h3>
                <div class="payment-success-amount">+${pendingPayment.vp.toLocaleString()} VP</div>
                <p style="color:var(--val-text-dim);margin-top:8px">ยอดเงินใหม่: ${currentUser.balance.toLocaleString()} VP</p>
                <button class="btn btn-primary" style="margin-top:16px" onclick="closePayment()">ตกลง</button>
            </div>
        `;

        showToast(`เติมเงินสำเร็จ +${pendingPayment.vp.toLocaleString()} VP! 💰`, 'success');
        pendingPayment = null;
    }, 2000);
}

function closePayment() {
    clearInterval(paymentTimerInterval);
    document.getElementById('paymentModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
    pendingPayment = null;
}

// ==========================================
// HOME PAGE
// ==========================================
function renderHome() {
    // Featured cases
    const featured = document.getElementById('featuredCases');
    if (featured) {
        featured.innerHTML = CASES_CONFIG.slice(0, 4).map(c => createCaseCardHTML(c)).join('');
    }

    // Floating skins
    renderFloatingSkins();

    // Drops ticker
    renderDropsTicker();

    // Daily free case
    updateDailyFree();
}

function renderFloatingSkins() {
    const container = document.getElementById('floatingSkins');
    if (!container || allSkins.length === 0) return;

    const showcaseSkins = allSkins
        .filter(s => s.rarity === 'exclusive' || s.rarity === 'ultra')
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

    container.innerHTML = showcaseSkins.map((skin, i) => {
        const positions = [
            { top: '10%', left: '10%', delay: '0s' },
            { top: '5%', left: '55%', delay: '1s' },
            { top: '50%', left: '25%', delay: '2s' },
            { top: '45%', left: '65%', delay: '0.5s' },
        ];
        const p = positions[i];
        return `<img class="floating-skin" src="${skin.icon}" alt="${skin.name}" 
                     style="top:${p.top};left:${p.left};animation-delay:${p.delay}" 
                     onerror="this.style.display='none'">`;
    }).join('');
}

function renderDropsTicker() {
    const ticker = document.getElementById('dropsTicker');
    if (!ticker || allSkins.length === 0) return;

    const fakeDrops = [];
    const usernames = ['xXPro_Playerx', 'ValoKing99', 'ShadowHunter', 'NightOwl_TH', 'DragonSlayer', 'AceSniper', 'PhoenixRise', 'SageMain', 'JettDash', 'ReynaMaster'];

    for (let i = 0; i < 12; i++) {
        const skin = allSkins[Math.floor(Math.random() * allSkins.length)];
        fakeDrops.push({
            skin,
            user: usernames[Math.floor(Math.random() * usernames.length)],
        });
    }

    ticker.innerHTML = fakeDrops.map(d => `
        <div class="drop-card" style="border-left: 3px solid ${d.skin.rarityColor}">
            <img src="${d.skin.icon}" alt="${d.skin.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2236%22><rect fill=%22%23333%22 width=%2248%22 height=%2236%22 rx=%224%22/></svg>'">
            <div class="drop-card-info">
                <div class="drop-name" title="${d.skin.name}">${d.skin.name}</div>
                <div class="drop-user">${d.user}</div>
            </div>
        </div>
    `).join('');
}

// ==========================================
// CASES PAGE
// ==========================================
function renderCases() {
    const grid = document.getElementById('casesGrid');
    if (!grid) return;
    grid.innerHTML = CASES_CONFIG.map(c => createCaseCardHTML(c)).join('');
}

function createCaseCardHTML(caseConfig) {
    const rarities = ['select', 'deluxe', 'premium', 'exclusive', 'ultra'];
    const rarityColors = {
        select: '#5A9FE2', deluxe: '#009587', premium: '#D1548D',
        exclusive: '#F5955B', ultra: '#FAD663'
    };

    // Get a representative skin for this case
    let previewSkin = null;
    if (caseConfig.weaponFilter && allSkins.length > 0) {
        previewSkin = allSkins.find(s => s.name.includes(caseConfig.weaponFilter) && (s.rarity === 'exclusive' || s.rarity === 'ultra'));
        if (!previewSkin) previewSkin = allSkins.find(s => s.name.includes(caseConfig.weaponFilter));
    }
    if (!previewSkin && allSkins.length > 0) {
        const good = allSkins.filter(s => s.rarity === 'exclusive' || s.rarity === 'ultra');
        previewSkin = good[Math.floor(Math.random() * good.length)];
    }

    const imgSrc = previewSkin ? previewSkin.icon : '';

    return `
        <div class="case-card" onclick="openCase('${caseConfig.id}')">
            <div class="case-image">
                ${imgSrc ? `<img src="${imgSrc}" alt="${caseConfig.name}" onerror="this.style.display='none'">` : ''}
            </div>
            <div class="case-rarity-bar">
                ${rarities.map(r => `<span style="background:${rarityColors[r]};opacity:${caseConfig.rarityWeights[r] > 10 ? 1 : 0.4}"></span>`).join('')}
            </div>
            <div class="case-info">
                <div class="case-name">${caseConfig.name}</div>
                <div class="case-desc">${caseConfig.desc}</div>
                <div class="case-footer">
                    <span class="case-price">${caseConfig.price} VP</span>
                    <span class="case-items-count">${getCaseItemCount(caseConfig)} สกิน</span>
                </div>
            </div>
        </div>
    `;
}

function getCaseItemCount(caseConfig) {
    if (caseConfig.weaponFilter) {
        return allSkins.filter(s => s.name.includes(caseConfig.weaponFilter)).length || '50+';
    }
    return allSkins.length || '500+';
}

// ==========================================
// CASE OPENING
// ==========================================
function openCase(caseId) {
    if (!currentUser) {
        showToast('กรุณาเข้าสู่ระบบก่อน', 'error');
        showLoginModal();
        return;
    }

    currentCase = CASES_CONFIG.find(c => c.id === caseId);
    if (!currentCase) return;

    if (currentUser.balance < currentCase.price) {
        showToast('ยอดเงินไม่เพียงพอ กรุณาเติมเงิน', 'error');
        showTopupModal();
        return;
    }

    // Navigate to opening page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-opening').classList.add('active');
    document.getElementById('openingCaseName').textContent = currentCase.name;
    document.getElementById('caseCost').textContent = currentCase.price;

    // Update auto-spin cost labels
    const costEl = document.getElementById('autoSpinCost');
    if (costEl) costEl.innerHTML = `(x5 = ${(currentCase.price * 5).toLocaleString()} VP, x10 = ${(currentCase.price * 10).toLocaleString()} VP, x25 = ${(currentCase.price * 25).toLocaleString()} VP, x50 = ${(currentCase.price * 50).toLocaleString()} VP)`;

    // Populate roulette and contents
    populateRoulette();
    populateContents();

    document.getElementById('openCaseBtn').disabled = false;
    isSpinning = false;

    window.scrollTo(0, 0);
}

function getSkinsForCase(caseConfig) {
    if (caseConfig.weaponFilter) {
        return allSkins.filter(s => s.name.includes(caseConfig.weaponFilter));
    }
    return allSkins;
}

function getLockedWeights(caseConfig) {
    const saved = localStorage.getItem('valocase_pct_' + caseConfig.id);
    if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
    }
    return null;
}

function pickRandomSkinByRarity(caseConfig) {
    // Use admin-locked percentages if available, otherwise default
    const locked = getLockedWeights(caseConfig);
    const weights = locked || caseConfig.rarityWeights;
    const rand = Math.random() * 100;
    let cumulative = 0;
    let pickedRarity = 'select';

    for (const [rarity, weight] of Object.entries(weights)) {
        cumulative += weight;
        if (rand <= cumulative) {
            pickedRarity = rarity;
            break;
        }
    }

    const caseSkins = getSkinsForCase(caseConfig);
    const raritySkins = caseSkins.filter(s => s.rarity === pickedRarity);

    if (raritySkins.length === 0) {
        return caseSkins[Math.floor(Math.random() * caseSkins.length)];
    }

    return raritySkins[Math.floor(Math.random() * raritySkins.length)];
}

function populateRoulette() {
    const track = document.getElementById('rouletteTrack');
    if (!track || !currentCase) return;

    const items = [];
    const itemCount = 60;

    // The winning item will be at position ~45
    const winIndex = 45;
    const winSkin = pickRandomSkinByRarity(currentCase);
    currentWinItem = winSkin;

    const caseSkins = getSkinsForCase(currentCase);
    if (caseSkins.length === 0) return;

    for (let i = 0; i < itemCount; i++) {
        if (i === winIndex) {
            items.push(winSkin);
        } else {
            // Random skin from case weighted by rarity
            items.push(pickRandomSkinByRarity(currentCase));
        }
    }

    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';

    track.innerHTML = items.map(skin => `
        <div class="roulette-item rarity-bg-${skin.rarity}" style="border-bottom: 3px solid ${skin.rarityColor}">
            <img src="${skin.icon}" alt="${skin.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%2280%22><rect fill=%22%23222%22 width=%22120%22 height=%2280%22 rx=%228%22/><text x=%2260%22 y=%2244%22 fill=%22%23666%22 text-anchor=%22middle%22 font-size=%2212%22>?</text></svg>'">
            <span class="item-name">${skin.name}</span>
            <span class="item-rarity" style="color:${skin.rarityColor}">${skin.rarityName}</span>
        </div>
    `).join('');
}

function populateContents() {
    const grid = document.getElementById('contentsGrid');
    if (!grid || !currentCase) return;

    const caseSkins = getSkinsForCase(currentCase);
    const showcaseSkins = [];

    // Show a mix of rarities
    const rarities = ['ultra', 'exclusive', 'premium', 'deluxe', 'select'];
    for (const r of rarities) {
        const rs = caseSkins.filter(s => s.rarity === r);
        const take = r === 'ultra' ? 3 : r === 'exclusive' ? 4 : r === 'premium' ? 4 : 3;
        for (let i = 0; i < Math.min(take, rs.length); i++) {
            showcaseSkins.push(rs[Math.floor(Math.random() * rs.length)]);
        }
    }

    grid.innerHTML = showcaseSkins.map(skin => `
        <div class="content-item" style="border-top: 2px solid ${skin.rarityColor}">
            <img src="${skin.icon}" alt="${skin.name}" onerror="this.style.display='none'">
            <div class="ci-name" title="${skin.name}">${skin.name}</div>
            <div class="ci-rarity" style="color:${skin.rarityColor}">${skin.rarityName}</div>
        </div>
    `).join('');
}

function startOpening() {
    if (isSpinning || !currentCase || !currentUser) return;

    if (currentUser.balance < currentCase.price) {
        showToast('ยอดเงินไม่เพียงพอ กรุณาเติมเงิน', 'error');
        showTopupModal();
        return;
    }

    isSpinning = true;
    document.getElementById('openCaseBtn').disabled = true;

    // Deduct cost
    currentUser.balance -= currentCase.price;
    saveCurrentUser();
    updateUI();

    // Re-populate roulette (picks new winner)
    populateRoulette();

    const track = document.getElementById('rouletteTrack');
    const wrapper = document.querySelector('.roulette-wrapper');
    const wrapperWidth = wrapper.offsetWidth;

    // Calculate target position: item 45 * (160 + 4) - half wrapper + random offset
    const itemWidth = 164; // 160 + 4 gap
    const targetPos = (45 * itemWidth) - (wrapperWidth / 2) + 80 + (Math.random() * 60 - 30);

    // Animate
    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            track.style.transition = 'transform 6s cubic-bezier(0.15, 0.85, 0.25, 1)';
            track.style.transform = `translateX(-${targetPos}px)`;
        });
    });

    // Show win after animation
    setTimeout(() => {
        showWinResult();
        checkAchievements();
        isSpinning = false;
        document.getElementById('openCaseBtn').disabled = false;
    }, 6500);
}

// ==========================================
// AUTO-SPIN (MULTI-OPEN)
// ==========================================
function startAutoSpin(count) {
    if (isSpinning || !currentCase || !currentUser) return;

    const totalCost = currentCase.price * count;
    if (currentUser.balance < totalCost) {
        showToast(`ยอดเงินไม่พอ! ต้องใช้ ${totalCost.toLocaleString()} VP (คุณมี ${currentUser.balance.toLocaleString()} VP)`, 'error');
        showTopupModal();
        return;
    }

    isSpinning = true;
    document.getElementById('openCaseBtn').disabled = true;
    document.querySelectorAll('.auto-btn').forEach(b => b.disabled = true);

    // Deduct total cost
    currentUser.balance -= totalCost;
    saveCurrentUser();
    updateUI();

    // Open all cases at once
    const results = [];
    for (let i = 0; i < count; i++) {
        const skin = pickRandomSkinByRarity(currentCase);
        results.push(skin);

        // Add to inventory
        currentUser.inventory.push({
            ...skin,
            wonAt: Date.now(),
            caseId: currentCase.id,
        });

        // Add to drop history
        dropHistory.unshift({
            skin: skin,
            user: currentUser.username,
            time: Date.now(),
        });
    }
    if (dropHistory.length > 200) dropHistory.length = 200;
    saveCurrentUser();

    // Show multi-result modal
    showMultiResult(results, totalCost);

    isSpinning = false;
    document.getElementById('openCaseBtn').disabled = false;
    document.querySelectorAll('.auto-btn').forEach(b => b.disabled = false);
}

function showMultiResult(results, totalCost) {
    const summaryEl = document.getElementById('multiSummary');
    const gridEl = document.getElementById('multiResultsGrid');

    // Count rarities
    const rarityCounts = {};
    results.forEach(r => {
        rarityCounts[r.rarity] = (rarityCounts[r.rarity] || 0) + 1;
    });

    const totalSellValue = results.reduce((s, r) => s + (RARITY_SELL_PRICES[r.rarity] || 20), 0);
    const profit = totalSellValue - totalCost;

    summaryEl.innerHTML = `
        <div class="multi-summary-stat">
            <span class="ms-value">${results.length}</span>
            <span class="ms-label">กล่องที่เปิด</span>
        </div>
        <div class="multi-summary-stat">
            <span class="ms-value" style="color:var(--val-red)">${totalCost.toLocaleString()}</span>
            <span class="ms-label">VP ที่ใช้</span>
        </div>
        <div class="multi-summary-stat">
            <span class="ms-value" style="color:var(--val-teal)">${totalSellValue.toLocaleString()}</span>
            <span class="ms-label">มูลค่ารวม</span>
        </div>
        <div class="multi-summary-stat">
            <span class="ms-value" style="color:${profit >= 0 ? 'var(--val-teal)' : 'var(--val-red)'}">${profit >= 0 ? '+' : ''}${profit.toLocaleString()}</span>
            <span class="ms-label">กำไร/ขาดทุน</span>
        </div>
        ${rarityCounts.ultra ? `<div class="multi-summary-stat"><span class="ms-value" style="color:var(--rarity-ultra)">🌟 ${rarityCounts.ultra}</span><span class="ms-label">Ultra!</span></div>` : ''}
        ${rarityCounts.exclusive ? `<div class="multi-summary-stat"><span class="ms-value" style="color:var(--rarity-exclusive)">🔥 ${rarityCounts.exclusive}</span><span class="ms-label">Exclusive</span></div>` : ''}
    `;

    // Sort results by rarity (best first)
    const rarityOrder = { ultra: 0, exclusive: 1, premium: 2, deluxe: 3, select: 4 };
    const sorted = [...results].sort((a, b) => (rarityOrder[a.rarity] || 4) - (rarityOrder[b.rarity] || 4));

    gridEl.innerHTML = sorted.map((skin, i) => `
        <div class="multi-result-item" style="border-top: 3px solid ${skin.rarityColor};animation-delay:${Math.min(i * 0.05, 1)}s">
            <img src="${skin.icon}" alt="${skin.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%2280%22><rect fill=%22%23222%22 width=%22120%22 height=%2280%22 rx=%228%22/></svg>'">
            <div class="mr-name" title="${skin.name}">${skin.name}</div>
            <div class="mr-rarity" style="color:${skin.rarityColor}">${skin.rarityName}</div>
        </div>
    `).join('');

    // Show modal
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById('multiResultModal').classList.add('active');

    // Toast
    if (rarityCounts.ultra) {
        showToast(`🌟 ULTRA x${rarityCounts.ultra}! สุดยอด!`, 'success');
    } else if (rarityCounts.exclusive) {
        showToast(`🔥 Exclusive x${rarityCounts.exclusive}! เก่งมาก!`, 'success');
    } else {
        showToast(`เปิด ${results.length} กล่องสำเร็จ!`, 'success');
    }
}

function closeMultiResult() {
    document.getElementById('multiResultModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
}

function showWinResult() {
    if (!currentWinItem || !currentUser) return;

    // Add to inventory
    currentUser.inventory.push({
        ...currentWinItem,
        wonAt: Date.now(),
        caseId: currentCase.id,
    });
    saveCurrentUser();

    // Add to drop history
    dropHistory.unshift({
        skin: currentWinItem,
        user: currentUser.username,
        time: Date.now(),
    });
    if (dropHistory.length > 50) dropHistory.pop();

    // Show win modal
    const winModal = document.getElementById('winModal');
    const winItem = document.getElementById('winItem');
    const winGlow = document.getElementById('winGlow');

    winGlow.style.background = currentWinItem.rarityColor;

    // Add rarity class for glow
    winModal.className = 'modal win-modal';
    if (currentWinItem.rarity === 'ultra') winModal.classList.add('ultra-win');
    else if (currentWinItem.rarity === 'exclusive') winModal.classList.add('exclusive-win');

    winItem.innerHTML = `
        <img src="${currentWinItem.icon}" alt="${currentWinItem.name}">
        <div class="win-item-name">${currentWinItem.name}</div>
        <div class="win-item-rarity" style="color:${currentWinItem.rarityColor}">${currentWinItem.rarityName} Edition</div>
    `;

    openModal('winModal');

    // Spawn confetti celebration
    spawnConfetti();
    spawnWinStars();

    // Celebration toast based on rarity
    if (currentWinItem.rarity === 'ultra') {
        showToast(`🌟 ULTRA! คุณได้ ${currentWinItem.name}!`, 'success');
    } else if (currentWinItem.rarity === 'exclusive') {
        showToast(`🔥 Exclusive! ${currentWinItem.name}!`, 'success');
    }
}

function spawnConfetti() {
    const container = document.getElementById('confettiContainer');
    if (!container) return;
    container.innerHTML = '';

    const colors = ['#FF4655', '#FAD663', '#17DEA5', '#5A9FE2', '#D1548D', '#F5955B', '#FF6B9D', '#00E5FF'];
    const count = 60;

    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 0.6 + 's';
        piece.style.animationDuration = (2 + Math.random() * 1.5) + 's';
        piece.style.width = (4 + Math.random() * 8) + 'px';
        piece.style.height = (8 + Math.random() * 12) + 'px';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        container.appendChild(piece);
    }
}

function spawnWinStars() {
    const container = document.getElementById('winStars');
    if (!container) return;
    container.innerHTML = '';

    const emojis = ['✨', '⭐', '💫', '🌟', '✦'];
    const count = 15;

    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'win-star';
        star.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        star.style.left = Math.random() * 90 + 5 + '%';
        star.style.top = Math.random() * 90 + 5 + '%';
        star.style.animationDelay = Math.random() * 0.8 + 's';
        star.style.fontSize = (12 + Math.random() * 16) + 'px';
        container.appendChild(star);
    }
}

// ==========================================
// INVENTORY
// ==========================================
let selectedItems = new Set();

function getFilteredInventory() {
    if (!currentUser) return [];
    const inv = currentUser.inventory || [];
    const rarityFilter = document.getElementById('invFilterRarity')?.value || 'all';
    const weaponFilter = document.getElementById('invFilterWeapon')?.value || 'all';
    const sortBy = document.getElementById('invSortBy')?.value || 'rarity';

    let filtered = [...inv];

    if (rarityFilter !== 'all') {
        filtered = filtered.filter(item => item.rarity === rarityFilter);
    }

    if (weaponFilter !== 'all') {
        if (weaponFilter === 'Melee') {
            filtered = filtered.filter(item => item.name.toLowerCase().includes('melee') || item.name.toLowerCase().includes('knife') || item.name.toLowerCase().includes('karambit') || item.name.toLowerCase().includes('axe') || item.name.toLowerCase().includes('sword') || item.name.toLowerCase().includes('blade'));
        } else {
            filtered = filtered.filter(item => item.name.includes(weaponFilter));
        }
    }

    const rarityOrder = { ultra: 0, exclusive: 1, premium: 2, deluxe: 3, select: 4 };
    switch (sortBy) {
        case 'rarity':
            filtered.sort((a, b) => (rarityOrder[a.rarity] || 4) - (rarityOrder[b.rarity] || 4));
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'newest':
            filtered.sort((a, b) => (b.wonAt || 0) - (a.wonAt || 0));
            break;
        case 'value':
            filtered.sort((a, b) => (RARITY_SELL_PRICES[b.rarity] || 0) - (RARITY_SELL_PRICES[a.rarity] || 0));
            break;
    }

    return filtered;
}

function renderInventory() {
    if (!currentUser) return;

    const grid = document.getElementById('inventoryGrid');
    const statsContainer = document.getElementById('inventoryStats');
    const emptyState = document.getElementById('emptyInventory');
    const toolbar = document.getElementById('invToolbar');

    const inventory = currentUser.inventory || [];

    if (inventory.length === 0) {
        grid.innerHTML = '';
        grid.style.display = 'none';
        statsContainer.innerHTML = '';
        emptyState.style.display = 'block';
        if (toolbar) toolbar.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    grid.style.display = 'grid';
    if (toolbar) toolbar.style.display = 'flex';

    // Stats
    const totalValue = inventory.reduce((sum, item) => sum + (RARITY_SELL_PRICES[item.rarity] || 20), 0);
    const rarityCounts = {};
    inventory.forEach(item => {
        rarityCounts[item.rarity] = (rarityCounts[item.rarity] || 0) + 1;
    });

    statsContainer.innerHTML = `
        <div class="inv-stat">
            <div class="inv-stat-label">สกินทั้งหมด</div>
            <div class="inv-stat-value">${inventory.length}</div>
        </div>
        <div class="inv-stat">
            <div class="inv-stat-label">มูลค่ารวม</div>
            <div class="inv-stat-value" style="color:var(--val-red)">${totalValue.toLocaleString()} VP</div>
        </div>
        <div class="inv-stat">
            <div class="inv-stat-label">สกินหายากที่สุด</div>
            <div class="inv-stat-value" style="color:var(--rarity-ultra)">${rarityCounts.ultra || 0} Ultra</div>
        </div>
        <div class="inv-stat">
            <div class="inv-stat-label">ยอดเงิน</div>
            <div class="inv-stat-value">${currentUser.balance.toLocaleString()} VP</div>
        </div>
    `;

    // Apply filters
    const filtered = getFilteredInventory();

    grid.innerHTML = filtered.map((item, idx) => {
        const origIdx = inventory.indexOf(item);
        const isSelected = selectedItems.has(origIdx);
        return `
        <div class="inv-item ${isSelected ? 'selected' : ''}" style="border-top: 3px solid ${item.rarityColor}" onclick="toggleSelectItem(${origIdx}, event)">
            <div class="inv-checkbox">${isSelected ? '✓' : ''}</div>
            <div class="inv-item-image rarity-bg-${item.rarity}">
                <img src="${item.icon}" alt="${item.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%2280%22><rect fill=%22%23222%22 width=%22120%22 height=%2280%22 rx=%228%22/></svg>'">
            </div>
            <div class="inv-item-info">
                <div class="inv-item-name" title="${item.name}">${item.name}</div>
                <div class="inv-item-tier" style="color:${item.rarityColor}">${item.rarityName}</div>
            </div>
            <div class="inv-item-actions">
                <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();showWithdrawModal(${origIdx})">ถอน / ขาย</button>
            </div>
        </div>
    `;
    }).join('');

    updateSelectedCount();
}

function toggleSelectItem(idx, event) {
    if (event && event.target.closest('.inv-item-actions')) return;
    if (selectedItems.has(idx)) {
        selectedItems.delete(idx);
    } else {
        selectedItems.add(idx);
    }
    renderInventory();
}

function selectAllInv() {
    const filtered = getFilteredInventory();
    const inv = currentUser.inventory || [];
    filtered.forEach(item => {
        const idx = inv.indexOf(item);
        selectedItems.add(idx);
    });
    renderInventory();
    showToast(`เลือก ${selectedItems.size} สกิน`, 'info');
}

function deselectAllInv() {
    selectedItems.clear();
    renderInventory();
    showToast('ยกเลิกการเลือกทั้งหมด', 'info');
}

function updateSelectedCount() {
    const el = document.getElementById('selectedCount');
    if (el) el.textContent = selectedItems.size;
}

function sellSelected() {
    if (!currentUser || selectedItems.size === 0) {
        showToast('กรุณาเลือกสกินที่ต้องการขาย', 'error');
        return;
    }

    const inv = currentUser.inventory || [];
    let totalValue = 0;
    const indices = [...selectedItems].sort((a, b) => b - a); // Sort descending to remove safely

    indices.forEach(idx => {
        if (inv[idx]) {
            totalValue += (RARITY_SELL_PRICES[inv[idx].rarity] || 20);
        }
    });

    if (!confirm(`ขาย ${selectedItems.size} สกิน ได้ ${totalValue.toLocaleString()} VP?`)) return;

    // Remove from inventory (descending index order)
    indices.forEach(idx => {
        if (inv[idx]) inv.splice(idx, 1);
    });

    currentUser.balance += totalValue;
    saveCurrentUser();
    selectedItems.clear();
    updateUI();
    renderInventory();
    showToast(`💰 ขาย ${indices.length} สกิน ได้ ${totalValue.toLocaleString()} VP!`, 'success');
}

function sellAllFiltered() {
    if (!currentUser) return;
    const filtered = getFilteredInventory();
    if (filtered.length === 0) {
        showToast('ไม่มีสกินที่จะขาย', 'error');
        return;
    }

    let totalValue = filtered.reduce((s, item) => s + (RARITY_SELL_PRICES[item.rarity] || 20), 0);

    if (!confirm(`ขายทั้งหมด ${filtered.length} สกินที่กรอง ได้ ${totalValue.toLocaleString()} VP?`)) return;

    const inv = currentUser.inventory || [];
    const indicesToRemove = filtered.map(item => inv.indexOf(item)).sort((a, b) => b - a);

    indicesToRemove.forEach(idx => {
        if (idx >= 0) inv.splice(idx, 1);
    });

    currentUser.balance += totalValue;
    saveCurrentUser();
    selectedItems.clear();
    updateUI();
    renderInventory();
    showToast(`💰 ขายทั้งหมด ${indicesToRemove.length} สกิน ได้ ${totalValue.toLocaleString()} VP!`, 'success');
}

// ==========================================
// WITHDRAW / SELL
// ==========================================
function showWithdrawModal(index) {
    if (!currentUser || !currentUser.inventory[index]) return;
    withdrawItemIndex = index;
    const item = currentUser.inventory[index];
    const sellPrice = RARITY_SELL_PRICES[item.rarity] || 20;

    document.getElementById('withdrawItem').innerHTML = `
        <img src="${item.icon}" alt="${item.name}">
        <div style="font-weight:700;font-size:16px;margin-top:8px">${item.name}</div>
        <div style="color:${item.rarityColor};font-size:13px;text-transform:uppercase">${item.rarityName} Edition</div>
    `;
    document.getElementById('sellPrice').textContent = sellPrice;

    openModal('withdrawModal');
}

function sellSkin() {
    if (!currentUser || withdrawItemIndex < 0) return;
    const item = currentUser.inventory[withdrawItemIndex];
    const sellPrice = RARITY_SELL_PRICES[item.rarity] || 20;

    currentUser.balance += sellPrice;
    currentUser.inventory.splice(withdrawItemIndex, 1);
    saveCurrentUser();
    updateUI();
    closeModal();
    showToast(`ขายสกินสำเร็จ! ได้รับ ${sellPrice} VP 💰`, 'success');
    renderInventory();
    withdrawItemIndex = -1;
}

function withdrawSkin() {
    if (!currentUser || withdrawItemIndex < 0) return;
    const item = currentUser.inventory[withdrawItemIndex];

    currentUser.inventory.splice(withdrawItemIndex, 1);
    saveCurrentUser();
    closeModal();
    showToast(`📤 ส่งคำขอถอนสกิน "${item.name}" เรียบร้อย! (จะได้รับภายใน 24 ชม.)`, 'success');
    renderInventory();
    withdrawItemIndex = -1;
}

// ==========================================
// ADMIN PANEL
// ==========================================
function renderAdmin() {
    if (!currentUser || !currentUser.isAdmin) return;

    const users = getUsers();
    const totalBalance = users.reduce((s, u) => s + u.balance, 0);
    const totalSkins = users.reduce((s, u) => s + (u.inventory?.length || 0), 0);

    // Stats cards
    document.getElementById('adminGrid').innerHTML = `
        <div class="admin-card">
            <div class="admin-card-icon" style="background:rgba(90,159,226,0.15)">👥</div>
            <div class="admin-card-label">ผู้ใช้ทั้งหมด</div>
            <div class="admin-card-value">${users.length}</div>
        </div>
        <div class="admin-card">
            <div class="admin-card-icon" style="background:rgba(255,70,85,0.15)">💰</div>
            <div class="admin-card-label">VP ในระบบ</div>
            <div class="admin-card-value" style="color:var(--val-red)">${totalBalance.toLocaleString()}</div>
        </div>
        <div class="admin-card">
            <div class="admin-card-icon" style="background:rgba(250,214,99,0.15)">🎁</div>
            <div class="admin-card-label">สกินที่ดรอป</div>
            <div class="admin-card-value" style="color:var(--val-gold)">${totalSkins}</div>
        </div>
        <div class="admin-card">
            <div class="admin-card-icon" style="background:rgba(23,222,165,0.15)">📦</div>
            <div class="admin-card-label">กล่องในระบบ</div>
            <div class="admin-card-value" style="color:var(--val-teal)">${CASES_CONFIG.length}</div>
        </div>
    `;

    // Users table
    document.getElementById('adminUsersBody').innerHTML = users.map(u => `
        <tr>
            <td><strong>${u.username}</strong></td>
            <td>${u.balance.toLocaleString()} VP</td>
            <td>${u.inventory?.length || 0}</td>
            <td><span class="status-badge ${u.isAdmin ? 'status-admin' : 'status-active'}">${u.isAdmin ? 'Admin' : 'Active'}</span></td>
            <td>
                ${!u.isAdmin ? `<button class="btn btn-outline btn-sm" onclick="adminAddBalance('${u.username}')">+VP</button>` : '-'}
            </td>
        </tr>
    `).join('');

    // Recent drops
    const dropsEl = document.getElementById('adminDropsList');
    if (dropHistory.length === 0) {
        dropsEl.innerHTML = '<p style="color:var(--val-text-dim);padding:20px;">ยังไม่มีประวัติดรอป</p>';
    } else {
        dropsEl.innerHTML = dropHistory.slice(0, 20).map(d => `
            <div class="admin-drop-item" style="border-left:3px solid ${d.skin.rarityColor}">
                <img src="${d.skin.icon}" alt="${d.skin.name}" onerror="this.style.display='none'">
                <div class="admin-drop-info">
                    <div class="admin-drop-name">${d.skin.name}</div>
                    <div class="admin-drop-user">โดย ${d.user} • <span style="color:${d.skin.rarityColor}">${d.skin.rarityName}</span></div>
                </div>
                <div class="admin-drop-time">${timeAgo(d.time)}</div>
            </div>
        `).join('');
    }

    // Render percentage lock controls
    populateAdminCaseSelect();
    renderAdminPctControls();
}

function adminAddBalance(username) {
    const amount = prompt(`เพิ่ม VP ให้ ${username}:`, '1000');
    if (!amount || isNaN(amount)) return;

    const users = getUsers();
    const user = users.find(u => u.username === username);
    if (user) {
        user.balance += parseInt(amount);
        saveUsers(users);
        if (currentUser && currentUser.username === username) {
            currentUser.balance = user.balance;
            updateUI();
        }
        renderAdmin();
        showToast(`เพิ่ม ${parseInt(amount).toLocaleString()} VP ให้ ${username} สำเร็จ`, 'success');
    }
}

// ==========================================
// ADMIN PERCENTAGE LOCK
// ==========================================
function populateAdminCaseSelect() {
    const sel = document.getElementById('adminCaseSelect');
    if (!sel) return;
    sel.innerHTML = CASES_CONFIG.map(c => `<option value="${c.id}">${c.name} (${c.price} VP)</option>`).join('');
}

function renderAdminPctControls() {
    const sel = document.getElementById('adminCaseSelect');
    const controlsEl = document.getElementById('adminPctControls');
    const previewEl = document.getElementById('adminPctPreview');
    if (!sel || !controlsEl) return;

    const caseId = sel.value;
    const caseConfig = CASES_CONFIG.find(c => c.id === caseId);
    if (!caseConfig) return;

    // Load saved or default weights
    const locked = getLockedWeights(caseConfig);
    const weights = locked || { ...caseConfig.rarityWeights };

    const rarities = [
        { key: 'select', name: 'Select', color: '#5A9FE2' },
        { key: 'deluxe', name: 'Deluxe', color: '#009587' },
        { key: 'premium', name: 'Premium', color: '#D1548D' },
        { key: 'exclusive', name: 'Exclusive', color: '#F5955B' },
        { key: 'ultra', name: 'Ultra', color: '#FAD663' },
    ];

    const total = Object.values(weights).reduce((s, v) => s + v, 0);
    const isValid = Math.abs(total - 100) < 0.5;
    const isLocked = !!locked;

    controlsEl.innerHTML = `
        <div class="pct-controls-grid">
            ${rarities.map(r => `
                <div class="pct-row">
                    <div class="pct-rarity-badge" style="background:${r.color}"></div>
                    <div class="pct-info">
                        <div class="pct-rarity-name" style="color:${r.color}">${r.name}</div>
                        <div class="pct-rarity-label">Tier ${rarities.indexOf(r) + 1}</div>
                    </div>
                    <div class="pct-slider-wrap">
                        <input type="range" class="pct-slider" id="pctSlider_${r.key}"
                            min="0" max="100" step="0.5" value="${weights[r.key] || 0}"
                            style="accent-color:${r.color}"
                            oninput="updatePctSlider('${caseId}')">
                        <div class="pct-value" id="pctVal_${r.key}" style="color:${r.color}">${(weights[r.key] || 0).toFixed(1)}%</div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="pct-total-bar ${isValid ? 'valid' : 'invalid'}" id="pctTotalBar">
            <span class="pct-total-label">รวม:</span>
            <span class="pct-total-value" id="pctTotalValue" style="color:${isValid ? 'var(--val-teal)' : 'var(--val-red)'}">${total.toFixed(1)}%</span>
        </div>
        <div class="pct-save-row">
            ${isLocked ? '<span style="color:var(--val-teal);font-size:13px;line-height:36px;">🔒 ล็อคอยู่</span>' : ''}
            <button class="btn btn-primary btn-sm" onclick="savePctLock('${caseId}')" ${!isValid ? 'disabled' : ''}>💾 บันทึก${!isValid ? ' (ต้องรวม 100%)' : ''}</button>
            <button class="btn btn-outline btn-sm" onclick="resetPctLock('${caseId}')">🔄 รีเซ็ต</button>
        </div>
    `;

    // Render preview with skin images
    renderPctPreview(caseConfig, weights, previewEl, rarities);
}

function updatePctSlider(caseId) {
    const rarityKeys = ['select', 'deluxe', 'premium', 'exclusive', 'ultra'];
    let total = 0;
    rarityKeys.forEach(key => {
        const slider = document.getElementById('pctSlider_' + key);
        const valEl = document.getElementById('pctVal_' + key);
        if (slider && valEl) {
            const v = parseFloat(slider.value);
            valEl.textContent = v.toFixed(1) + '%';
            total += v;
        }
    });

    const totalBar = document.getElementById('pctTotalBar');
    const totalVal = document.getElementById('pctTotalValue');
    const isValid = Math.abs(total - 100) < 0.5;

    totalBar.className = 'pct-total-bar ' + (isValid ? 'valid' : 'invalid');
    totalVal.textContent = total.toFixed(1) + '%';
    totalVal.style.color = isValid ? 'var(--val-teal)' : 'var(--val-red)';

    // Enable/disable save button
    const saveBtn = totalBar.parentElement.querySelector('.btn-primary');
    if (saveBtn) {
        saveBtn.disabled = !isValid;
        saveBtn.textContent = isValid ? '💾 บันทึก' : '💾 บันทึก (ต้องรวม 100%)';
    }
}

function savePctLock(caseId) {
    const rarityKeys = ['select', 'deluxe', 'premium', 'exclusive', 'ultra'];
    const weights = {};
    let total = 0;

    rarityKeys.forEach(key => {
        const slider = document.getElementById('pctSlider_' + key);
        if (slider) {
            weights[key] = parseFloat(slider.value);
            total += weights[key];
        }
    });

    if (Math.abs(total - 100) > 0.5) {
        showToast('ผลรวมต้องเป็น 100%!', 'error');
        return;
    }

    localStorage.setItem('valocase_pct_' + caseId, JSON.stringify(weights));
    showToast('🔒 บันทึกเปอร์เซ็นต์สำเร็จ!', 'success');
    renderAdminPctControls();
}

function resetPctLock(caseId) {
    localStorage.removeItem('valocase_pct_' + caseId);
    showToast('🔄 รีเซ็ตเป็นค่าเริ่มต้นแล้ว', 'info');
    renderAdminPctControls();
}

function renderPctPreview(caseConfig, weights, container, rarities) {
    if (!container) return;
    const caseSkins = getSkinsForCase(caseConfig);

    let html = '<div class="pct-preview-section"><h4>🔍 ตัวอย่างสกินแต่ละระดับ</h4>';

    rarities.forEach(r => {
        const raritySkins = caseSkins.filter(s => s.rarity === r.key);
        const displaySkins = raritySkins.sort(() => Math.random() - 0.5).slice(0, 10);
        const pct = weights[r.key] || 0;

        html += `
            <div class="pct-preview-rarity">
                <div class="pct-preview-header">
                    <div class="pct-preview-dot" style="background:${r.color}"></div>
                    <span class="pct-preview-title" style="color:${r.color}">${r.name}</span>
                    <span class="pct-preview-chance">${pct.toFixed(1)}% • ${raritySkins.length} สกิน</span>
                </div>
                <div class="pct-preview-skins">
                    ${displaySkins.length > 0 ? displaySkins.map(skin => `
                        <div class="pct-preview-skin" style="border-color:${r.color}">
                            <img src="${skin.icon}" alt="${skin.name}" onerror="this.style.display='none'">
                            <div class="pskin-name" title="${skin.name}">${skin.name}</div>
                        </div>
                    `).join('') : '<span style="font-size:12px;color:var(--val-text-dim);padding:10px;">ไม่มีสกินในหมวดนี้</span>'}
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// ==========================================
// PARTICLES
// ==========================================
function createParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (5 + Math.random() * 8) + 's';
        particle.style.width = (2 + Math.random() * 4) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ==========================================
// UTILITIES
// ==========================================
function timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'เมื่อกี้';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ชม.ที่แล้ว`;
    return `${Math.floor(hours / 24)} วันที่แล้ว`;
}

// ==========================================
// DAILY FREE CASE
// ==========================================
function updateDailyFree() {
    const btn = document.getElementById('dailyFreeBtn');
    const timerEl = document.getElementById('dailyFreeTimer');
    if (!btn || !timerEl) return;

    if (!currentUser) {
        btn.disabled = false;
        btn.textContent = '🎰 เข้าสู่ระบบก่อน';
        timerEl.textContent = '';
        btn.onclick = () => { showToast('กรุณาเข้าสู่ระบบก่อน', 'error'); showLoginModal(); };
        return;
    }

    const lastFree = localStorage.getItem('valocase_daily_' + currentUser.username);
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000; // 24 hours

    if (lastFree && (now - parseInt(lastFree)) < cooldown) {
        const remaining = cooldown - (now - parseInt(lastFree));
        btn.disabled = true;
        btn.textContent = '⏳ เปิดไปแล้ววันนี้';

        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        timerEl.innerHTML = `เปิดอีกครั้งใน <strong>${h}ชม. ${m}น. ${s}ว.</strong>`;

        setTimeout(updateDailyFree, 1000);
    } else {
        btn.disabled = false;
        btn.textContent = '🎰 เปิดกล่องฟรี!';
        btn.onclick = openDailyFree;
        timerEl.innerHTML = '🟢 <strong>พร้อมเปิดแล้ว!</strong>';
    }
}

function openDailyFree() {
    if (!currentUser) { showLoginModal(); return; }

    const lastFree = localStorage.getItem('valocase_daily_' + currentUser.username);
    const now = Date.now();
    if (lastFree && (now - parseInt(lastFree)) < 86400000) {
        showToast('คุณเปิดกล่องฟรีไปแล้ววันนี้', 'error');
        return;
    }

    // Use budget case config for daily free
    const freeCase = CASES_CONFIG[0]; // Budget Case
    const skin = pickRandomSkinByRarity(freeCase);

    // Add to inventory
    currentUser.inventory.push({ ...skin, wonAt: Date.now(), caseId: 'daily-free' });
    saveCurrentUser();
    updateUI();

    // Mark as used
    localStorage.setItem('valocase_daily_' + currentUser.username, now.toString());

    // Add to drop history
    dropHistory.unshift({ skin, user: currentUser.username, time: now });

    // Show win modal
    currentWinItem = skin;
    showWinResult();

    showToast(`🎁 ได้ ${skin.name} จากกล่องฟรี!`, 'success');
    checkAchievements();
    updateDailyFree();
}

// ==========================================
// TRADE UP CONTRACT
// ==========================================
let tradeupSlots = [null, null, null, null, null];
let tradeupPickerOpen = false;

function renderTradeUp() {
    updateTradeupUI();
}

function updateTradeupUI() {
    const rarity = document.getElementById('tradeupRarity')?.value || 'select';
    const nextRarity = { select: 'deluxe', deluxe: 'premium', premium: 'exclusive', exclusive: 'ultra' };
    const target = nextRarity[rarity];
    const chances = { select: 100, deluxe: 85, premium: 65, exclusive: 40 };

    // Update chance display
    const chanceEl = document.querySelector('.tradeup-chance-value');
    if (chanceEl) chanceEl.textContent = chances[rarity] + '%';

    // Reset slots when changing rarity
    tradeupSlots = [null, null, null, null, null];
    renderTradeupSlots(rarity);

    // Update result preview
    const preview = document.getElementById('tradeupResultPreview');
    const rarityColors = { deluxe: '#009587', premium: '#D1548D', exclusive: '#F5955B', ultra: '#FAD663' };
    if (preview) {
        preview.innerHTML = `<div class="tradeup-result-label">ผลลัพธ์: สกินระดับ <span style="color:${rarityColors[target]};font-weight:700;text-transform:uppercase">${target}</span> 1 ตัว</div>`;
    }

    updateTradeupBtn();
}

function renderTradeupSlots(rarity) {
    const slotsEl = document.getElementById('tradeupSlots');
    if (!slotsEl) return;

    slotsEl.innerHTML = tradeupSlots.map((slot, i) => {
        if (slot) {
            return `
                <div class="tradeup-slot filled" style="border-color:${slot.rarityColor}" onclick="openTradeupPicker(${i})">
                    <button class="slot-remove" onclick="event.stopPropagation();removeTradeupSlot(${i})">✕</button>
                    <img src="${slot.icon}" alt="${slot.name}" onerror="this.style.display='none'">
                    <div class="slot-name">${slot.name}</div>
                </div>
            `;
        } else {
            return `
                <div class="tradeup-slot" onclick="openTradeupPicker(${i})">
                    <div class="tradeup-slot-empty">+</div>
                    <div class="tradeup-slot-label">ช่อง ${i + 1}</div>
                </div>
            `;
        }
    }).join('');
}

function openTradeupPicker(slotIndex) {
    if (!currentUser) return;
    const rarity = document.getElementById('tradeupRarity')?.value || 'select';
    const inv = currentUser.inventory || [];

    // Get skins of selected rarity not already in a slot
    const usedIndices = tradeupSlots.filter(s => s).map(s => s._invIdx);
    const available = inv.filter((item, idx) => item.rarity === rarity && !usedIndices.includes(idx));

    if (available.length === 0) {
        showToast(`ไม่มีสกินระดับ ${rarity} ในคลัง`, 'error');
        return;
    }

    // Close existing picker
    closeTradeupPicker();

    const picker = document.createElement('div');
    picker.className = 'tradeup-picker';
    picker.id = 'tradeupPickerEl';
    picker.innerHTML = `
        <h3>เลือกสกิน (${rarity.toUpperCase()}) - ${available.length} ตัว</h3>
        <div class="tradeup-picker-grid">
            ${available.map((item) => {
        const origIdx = inv.indexOf(item);
        return `
                    <div class="tradeup-picker-item" onclick="pickTradeupSkin(${slotIndex}, ${origIdx})">
                        <img src="${item.icon}" alt="${item.name}" onerror="this.style.display='none'">
                        <div class="tp-name">${item.name}</div>
                    </div>
                `;
    }).join('')}
        </div>
        <button class="btn btn-outline btn-sm" style="margin-top:12px;width:100%" onclick="closeTradeupPicker()">ปิด</button>
    `;

    document.body.appendChild(picker);
    tradeupPickerOpen = true;

    // Also add overlay behind picker
    const overlay = document.createElement('div');
    overlay.id = 'tradeupPickerOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1099;';
    overlay.onclick = closeTradeupPicker;
    document.body.appendChild(overlay);
}

function closeTradeupPicker() {
    const picker = document.getElementById('tradeupPickerEl');
    const overlay = document.getElementById('tradeupPickerOverlay');
    if (picker) picker.remove();
    if (overlay) overlay.remove();
    tradeupPickerOpen = false;
}

function pickTradeupSkin(slotIndex, invIdx) {
    const inv = currentUser.inventory || [];
    const skin = inv[invIdx];
    if (!skin) return;

    tradeupSlots[slotIndex] = { ...skin, _invIdx: invIdx };
    closeTradeupPicker();

    const rarity = document.getElementById('tradeupRarity')?.value || 'select';
    renderTradeupSlots(rarity);
    updateTradeupBtn();
}

function removeTradeupSlot(slotIndex) {
    tradeupSlots[slotIndex] = null;
    const rarity = document.getElementById('tradeupRarity')?.value || 'select';
    renderTradeupSlots(rarity);
    updateTradeupBtn();
}

function updateTradeupBtn() {
    const btn = document.getElementById('tradeupBtn');
    if (!btn) return;
    const filled = tradeupSlots.filter(s => s !== null).length;
    btn.disabled = filled < 5;
    btn.textContent = filled < 5
        ? `🔄 แลกเปลี่ยนเลย! (ใส่อีก ${5 - filled} ตัว)`
        : '🔄 แลกเปลี่ยนเลย!';
}

function executeTradeUp() {
    if (!currentUser) return;
    const filled = tradeupSlots.filter(s => s !== null);
    if (filled.length < 5) return;

    const rarity = document.getElementById('tradeupRarity')?.value || 'select';
    const nextRarity = { select: 'deluxe', deluxe: 'premium', premium: 'exclusive', exclusive: 'ultra' };
    const target = nextRarity[rarity];
    const chances = { select: 100, deluxe: 85, premium: 65, exclusive: 40 };
    const chance = chances[rarity];

    // Remove skins from inventory (sort indices descending)
    const inv = currentUser.inventory || [];
    const indicesToRemove = filled.map(s => s._invIdx).sort((a, b) => b - a);
    indicesToRemove.forEach(idx => { if (idx >= 0 && idx < inv.length) inv.splice(idx, 1); });

    // Roll for success
    const success = Math.random() * 100 < chance;
    let resultSkin;

    if (success) {
        // Pick random skin of target rarity from all skins
        const targetSkins = allSkins.filter(s => s.rarity === target);
        if (targetSkins.length > 0) {
            resultSkin = targetSkins[Math.floor(Math.random() * targetSkins.length)];
        } else {
            resultSkin = filled[0]; // Fallback
        }

        // Add to inventory
        currentUser.inventory.push({ ...resultSkin, wonAt: Date.now(), caseId: 'tradeup' });
    }

    saveCurrentUser();
    updateUI();

    // Show result modal
    const resultEl = document.getElementById('tradeupModalResult');
    if (success && resultSkin) {
        resultEl.innerHTML = `
            <h3 style="color:var(--val-teal);margin-bottom:16px">✅ Trade Up สำเร็จ!</h3>
            <img src="${resultSkin.icon}" alt="${resultSkin.name}" onerror="this.style.display='none'">
            <div class="tru-name">${resultSkin.name}</div>
            <div class="tru-rarity" style="color:${resultSkin.rarityColor}">${resultSkin.rarityName}</div>
        `;
        showToast(`🌟 Trade Up สำเร็จ! ได้ ${resultSkin.name}!`, 'success');
    } else {
        resultEl.innerHTML = `
            <h3 style="color:var(--val-red);margin-bottom:16px">❌ Trade Up ล้มเหลว!</h3>
            <div style="font-size:64px;margin:20px 0">💨</div>
            <p style="color:var(--val-text-dim)">สกิน 5 ตัวหายไป... (โอกาส ${chance}%)</p>
        `;
        showToast('❌ Trade Up ล้มเหลว! สกินหายไป', 'error');
    }

    openModal('tradeupResultModal');
    tradeupSlots = [null, null, null, null, null];
    renderTradeupSlots(rarity);
    updateTradeupBtn();
    checkAchievements();
}

// ==========================================
// LEADERBOARD
// ==========================================
let currentLBSort = 'value';

function switchLBTab(btn, sortBy) {
    document.querySelectorAll('.lb-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLBSort = sortBy;
    renderLeaderboard(sortBy);
}

function renderLeaderboard(sortBy) {
    const users = getUsers();
    const list = document.getElementById('leaderboardList');
    if (!list) return;

    const userData = users.map(u => {
        const inv = u.inventory || [];
        const value = inv.reduce((s, item) => s + (RARITY_SELL_PRICES[item.rarity] || 20), 0);
        const ultraCount = inv.filter(item => item.rarity === 'ultra').length;
        return { username: u.username, count: inv.length, value, ultraCount, isAdmin: u.isAdmin };
    });

    // Sort
    switch (sortBy) {
        case 'value': userData.sort((a, b) => b.value - a.value); break;
        case 'count': userData.sort((a, b) => b.count - a.count); break;
        case 'ultra': userData.sort((a, b) => b.ultraCount - a.ultraCount); break;
    }

    if (userData.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:var(--val-text-dim);padding:40px">ยังไม่มีผู้เล่น</p>';
        return;
    }

    const medals = { 0: '🥇', 1: '🥈', 2: '🥉' };
    const rankClasses = { 0: 'top1 gold', 1: 'top2 silver', 2: 'top3 bronze' };

    list.innerHTML = userData.slice(0, 20).map((u, i) => {
        const isYou = currentUser && u.username === currentUser.username;
        const rankClass = rankClasses[i] || '';
        const medal = medals[i] || '';
        const rankColor = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';

        let displayValue, subLabel;
        switch (sortBy) {
            case 'value':
                displayValue = u.value.toLocaleString() + ' VP';
                subLabel = `${u.count} สกิน`;
                break;
            case 'count':
                displayValue = u.count;
                subLabel = `${u.value.toLocaleString()} VP`;
                break;
            case 'ultra':
                displayValue = u.ultraCount + ' Ultra';
                subLabel = `${u.count} สกินทั้งหมด`;
                break;
        }

        return `
            <div class="lb-row ${rankClass} ${isYou ? 'lb-you' : ''}">
                <div class="lb-rank ${rankColor}">${medal || '#' + (i + 1)}</div>
                <div class="lb-avatar">${u.username[0].toUpperCase()}</div>
                <div class="lb-username">${u.username} ${isYou ? '(คุณ)' : ''} ${u.isAdmin ? '🛡️' : ''}</div>
                <div>
                    <div class="lb-value">${displayValue}</div>
                    <div class="lb-sub">${subLabel}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// ACHIEVEMENTS
// ==========================================
const ACHIEVEMENTS = [
    { id: 'first_open', icon: '🎁', name: 'เปิดกล่องครั้งแรก', desc: 'เปิดกล่อง 1 ครั้ง', reward: 50, check: u => (u.inventory?.length || 0) >= 1 },
    { id: 'open_10', icon: '📦', name: 'นักเปิดกล่อง', desc: 'เปิดกล่องรวม 10 ครั้ง', reward: 100, check: u => (u.inventory?.length || 0) >= 10 },
    { id: 'open_50', icon: '💫', name: 'ชำนาญการเปิด', desc: 'เปิดกล่องรวม 50 ครั้ง', reward: 300, check: u => (u.inventory?.length || 0) >= 50 },
    { id: 'open_100', icon: '🌟', name: 'ตำนานการเปิด', desc: 'เปิดกล่องรวม 100 ครั้ง', reward: 500, check: u => (u.inventory?.length || 0) >= 100 },
    { id: 'first_ultra', icon: '⭐', name: 'Ultra แรก!', desc: 'ได้รับสกินระดับ Ultra ครั้งแรก', reward: 200, check: u => (u.inventory || []).some(i => i.rarity === 'ultra') },
    { id: 'ultra_5', icon: '🏆', name: 'สะสม Ultra', desc: 'มีสกิน Ultra 5 ตัว', reward: 500, check: u => (u.inventory || []).filter(i => i.rarity === 'ultra').length >= 5 },
    { id: 'first_exclusive', icon: '🔥', name: 'Exclusive!', desc: 'ได้รับสกินระดับ Exclusive ครั้งแรก', reward: 100, check: u => (u.inventory || []).some(i => i.rarity === 'exclusive') },
    { id: 'rich_1000', icon: '💰', name: 'เศรษฐี', desc: 'มียอด VP รวม 1,000 ขึ้นไป', reward: 50, check: u => u.balance >= 1000 },
    { id: 'rich_10000', icon: '💎', name: 'มหาเศรษฐี', desc: 'มียอด VP รวม 10,000 ขึ้นไป', reward: 200, check: u => u.balance >= 10000 },
    { id: 'daily_opener', icon: '🌅', name: 'เช็คอินประจำวัน', desc: 'เปิดกล่องฟรีประจำวัน 1 ครั้ง', reward: 30, check: u => localStorage.getItem('valocase_daily_' + u.username) !== null },
    { id: 'tradeup_1', icon: '🔄', name: 'Trade Up!', desc: 'ทำ Trade Up สำเร็จ 1 ครั้ง', reward: 100, check: u => (u.inventory || []).some(i => i.caseId === 'tradeup') },
    {
        id: 'collector', icon: '🖼️', name: 'นักสะสม', desc: 'มีสกินครบทุกระดับ', reward: 300, check: u => {
            const rarities = new Set((u.inventory || []).map(i => i.rarity));
            return rarities.has('select') && rarities.has('deluxe') && rarities.has('premium') && rarities.has('exclusive') && rarities.has('ultra');
        }
    },
];

function renderAchievements() {
    if (!currentUser) return;

    const progEl = document.getElementById('achievementsProgress');
    const gridEl = document.getElementById('achievementsGrid');
    if (!progEl || !gridEl) return;

    const unlockedIds = currentUser.achievements || [];
    let newUnlocks = 0;

    // Check for new achievements
    ACHIEVEMENTS.forEach(ach => {
        if (!unlockedIds.includes(ach.id) && ach.check(currentUser)) {
            unlockedIds.push(ach.id);
            newUnlocks++;
        }
    });

    if (newUnlocks > 0) {
        currentUser.achievements = unlockedIds;
        saveCurrentUser();
    }

    const unlocked = unlockedIds.length;
    const total = ACHIEVEMENTS.length;
    const pct = Math.round((unlocked / total) * 100);

    progEl.innerHTML = `
        <div class="ach-prog-info">
            <div class="ach-prog-title">ความคืบหน้า</div>
            <div class="ach-prog-subtitle">ปลดล็อค ${unlocked}/${total} ความสำเร็จ</div>
        </div>
        <div class="ach-prog-bar"><div class="ach-prog-fill" style="width:${pct}%"></div></div>
        <div class="ach-prog-text">${pct}%</div>
    `;

    gridEl.innerHTML = ACHIEVEMENTS.map(ach => {
        const isUnlocked = unlockedIds.includes(ach.id);
        return `
            <div class="ach-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="ach-icon">${ach.icon}</div>
                <div class="ach-info">
                    <div class="ach-name">${ach.name}</div>
                    <div class="ach-desc">${ach.desc}</div>
                </div>
                <div class="ach-reward">${isUnlocked ? '✓' : '+' + ach.reward + ' VP'}</div>
            </div>
        `;
    }).join('');
}

function checkAchievements() {
    if (!currentUser) return;
    const unlockedIds = currentUser.achievements || [];
    let totalReward = 0;
    let newAchs = [];

    ACHIEVEMENTS.forEach(ach => {
        if (!unlockedIds.includes(ach.id) && ach.check(currentUser)) {
            unlockedIds.push(ach.id);
            totalReward += ach.reward;
            newAchs.push(ach);
        }
    });

    if (newAchs.length > 0) {
        currentUser.achievements = unlockedIds;
        currentUser.balance += totalReward;
        saveCurrentUser();
        updateUI();
        newAchs.forEach(ach => {
            showToast(`🎖️ ปลดล็อค! "${ach.name}" +${ach.reward} VP`, 'success');
        });
    }
}

// ==========================================
// SHOOTING RANGE MINI-GAME
// ==========================================
let srGame = {
    running: false,
    score: 0,
    combo: 0,
    maxCombo: 0,
    hits: 0,
    shots: 0,
    timeLeft: 30,
    targets: [],
    equippedSkin: null,
    timerInterval: null,
    spawnInterval: null,
};

function renderShootingRange() {
    // Populate weapon list from inventory
    const listEl = document.getElementById('srWeaponList');
    if (!listEl || !currentUser) return;

    const inv = currentUser.inventory || [];
    if (inv.length === 0) {
        listEl.innerHTML = '<span style="color:var(--val-text-dim);font-size:13px">คุณยังไม่มีสกินในคลัง เปิดกล่องเพื่อรับสกินก่อน!</span>';
        return;
    }

    // Show unique skins (no duplicates by name)
    const seen = new Set();
    const unique = inv.filter(s => {
        if (seen.has(s.name)) return false;
        seen.add(s.name);
        return true;
    });

    listEl.innerHTML = unique.slice(0, 20).map((skin, i) => `
        <div class="sr-weapon-item ${srGame.equippedSkin?.name === skin.name ? 'equipped' : ''}" onclick="equipSRWeapon(${i})">
            <img src="${skin.icon}" alt="${skin.name}" onerror="this.style.display='none'">
            <div class="srw-name" style="color:${skin.rarityColor}">${skin.name}</div>
        </div>
    `).join('');

    // Set crosshair dot
    const crosshair = document.getElementById('srCrosshair');
    if (crosshair && !crosshair.querySelector('.sr-crosshair-dot')) {
        const dot = document.createElement('div');
        dot.className = 'sr-crosshair-dot';
        crosshair.appendChild(dot);
    }
}

function equipSRWeapon(idx) {
    if (!currentUser) return;
    const inv = currentUser.inventory || [];
    const seen = new Set();
    const unique = inv.filter(s => {
        if (seen.has(s.name)) return false;
        seen.add(s.name);
        return true;
    });

    const skin = unique[idx];
    if (!skin) return;

    srGame.equippedSkin = skin;

    // Update weapon display
    const img = document.getElementById('srWeaponImg');
    const name = document.getElementById('srWeaponName');
    if (img) { img.src = skin.icon; img.style.display = 'block'; }
    if (name) { name.textContent = skin.name; name.style.color = skin.rarityColor; }

    // Re-render list to show equipped
    renderShootingRange();
    showToast(`🔫 ติดตั้ง ${skin.name}`, 'info');
}

function startShootingRange() {
    if (!currentUser) return;

    // Reset game state
    srGame.running = true;
    srGame.score = 0;
    srGame.combo = 0;
    srGame.maxCombo = 0;
    srGame.hits = 0;
    srGame.shots = 0;
    srGame.timeLeft = 30;
    srGame.targets = [];

    // Clear old targets
    const gameArea = document.getElementById('srGameArea');
    gameArea.querySelectorAll('.sr-target, .sr-hit-effect, .sr-hit-score, .sr-miss-effect, .sr-muzzle').forEach(e => e.remove());

    // Hide overlays
    document.getElementById('srStartOverlay').style.display = 'none';
    document.getElementById('srGameOver').style.display = 'none';

    // Show crosshair
    document.getElementById('srCrosshair').style.display = 'block';

    // Update HUD
    updateSRHud();

    // Setup mouse tracking for crosshair
    gameArea.onmousemove = (e) => {
        const rect = gameArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ch = document.getElementById('srCrosshair');
        ch.style.left = (x - 15) + 'px';
        ch.style.top = (y - 15) + 'px';
    };

    // Click to shoot
    gameArea.onclick = (e) => {
        if (!srGame.running) return;
        srGame.shots++;

        const rect = gameArea.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Check if hit any target
        let hit = false;
        const targets = gameArea.querySelectorAll('.sr-target');
        targets.forEach(target => {
            if (hit) return;
            const tr = target.getBoundingClientRect();
            const tx = tr.left - rect.left + tr.width / 2;
            const ty = tr.top - rect.top + tr.height / 2;
            const dist = Math.sqrt((clickX - tx) ** 2 + (clickY - ty) ** 2);
            const radius = tr.width / 2;

            if (dist <= radius) {
                hit = true;
                srGame.hits++;
                srGame.combo++;
                if (srGame.combo > srGame.maxCombo) srGame.maxCombo = srGame.combo;

                // Calculate points
                const isSmall = target.dataset.type === 'small';
                const isMoving = target.dataset.type === 'moving';
                let points = 100;
                if (isSmall) points = 200;
                if (isMoving) points = 150;
                if (dist < radius * 0.3) points += 50; // Headshot bonus
                points += srGame.combo * 10; // Combo bonus

                srGame.score += points;

                // Hit effect
                const hitFx = document.createElement('div');
                hitFx.className = 'sr-hit-effect';
                hitFx.style.left = (tx - 20) + 'px';
                hitFx.style.top = (ty - 20) + 'px';
                hitFx.style.background = 'radial-gradient(circle, rgba(23,222,165,0.6), transparent 70%)';
                gameArea.appendChild(hitFx);
                setTimeout(() => hitFx.remove(), 400);

                // Score popup
                const scoreFx = document.createElement('div');
                scoreFx.className = 'sr-hit-score';
                scoreFx.textContent = '+' + points;
                if (srGame.combo >= 3) scoreFx.textContent += ` (x${srGame.combo})`;
                scoreFx.style.left = (tx - 20) + 'px';
                scoreFx.style.top = (ty - 30) + 'px';
                gameArea.appendChild(scoreFx);
                setTimeout(() => scoreFx.remove(), 800);

                // Remove target
                target.style.transform = 'scale(0)';
                target.style.transition = 'transform 0.15s ease-in';
                setTimeout(() => target.remove(), 150);
            }
        });

        if (!hit) {
            srGame.combo = 0;
            // Miss effect
            const missFx = document.createElement('div');
            missFx.className = 'sr-miss-effect';
            missFx.style.left = (clickX - 10) + 'px';
            missFx.style.top = (clickY - 10) + 'px';
            gameArea.appendChild(missFx);
            setTimeout(() => missFx.remove(), 300);
        }

        // Muzzle flash
        const muzzle = document.createElement('div');
        muzzle.className = 'sr-muzzle';
        gameArea.appendChild(muzzle);
        setTimeout(() => muzzle.remove(), 100);

        updateSRHud();
    };

    // Timer
    clearInterval(srGame.timerInterval);
    srGame.timerInterval = setInterval(() => {
        srGame.timeLeft--;
        updateSRHud();
        if (srGame.timeLeft <= 0) {
            endShootingRange();
        }
    }, 1000);

    // Spawn targets
    clearInterval(srGame.spawnInterval);
    spawnSRTarget();
    srGame.spawnInterval = setInterval(() => {
        if (srGame.running) spawnSRTarget();
    }, 1200);
}

function spawnSRTarget() {
    const gameArea = document.getElementById('srGameArea');
    if (!gameArea) return;

    const areaW = gameArea.offsetWidth;
    const areaH = gameArea.offsetHeight;

    // Random type
    const rand = Math.random();
    let type = 'normal';
    let size = 50 + Math.random() * 20;
    if (rand > 0.8) { type = 'small'; size = 30 + Math.random() * 10; }
    else if (rand > 0.6) { type = 'moving'; }

    // Random position (avoid HUD area at top)
    const x = 40 + Math.random() * (areaW - 80 - size);
    const y = 80 + Math.random() * (areaH - 160 - size);

    const target = document.createElement('div');
    target.className = 'sr-target';
    target.dataset.type = type;
    target.style.width = size + 'px';
    target.style.height = size + 'px';
    target.style.left = x + 'px';
    target.style.top = y + 'px';

    // Visual rings
    const colors = {
        normal: ['#FF4655', '#FF6B7A', '#FFB3BA'],
        small: ['#FAD663', '#FFE599', '#FFF3CC'],
        moving: ['#17DEA5', '#5BFFCF', '#B3FFE6'],
    };
    const c = colors[type];

    target.style.background = `radial-gradient(circle, ${c[2]} 15%, ${c[1]} 40%, ${c[0]} 70%, rgba(0,0,0,0.3) 100%)`;
    target.style.boxShadow = `0 0 20px ${c[0]}66, inset 0 0 10px ${c[2]}44`;

    // Add center dot
    const dot = document.createElement('div');
    dot.style.cssText = `position:absolute;top:50%;left:50%;width:${size * 0.2}px;height:${size * 0.2}px;background:white;border-radius:50%;transform:translate(-50%,-50%);`;
    target.appendChild(dot);

    gameArea.appendChild(target);

    // Moving target animation
    if (type === 'moving') {
        let moveX = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2);
        let moveY = (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random());
        const moveInterval = setInterval(() => {
            if (!target.parentElement || !srGame.running) { clearInterval(moveInterval); return; }
            let curX = parseFloat(target.style.left);
            let curY = parseFloat(target.style.top);
            curX += moveX;
            curY += moveY;
            if (curX < 20 || curX > areaW - size - 20) moveX *= -1;
            if (curY < 80 || curY > areaH - size - 80) moveY *= -1;
            target.style.left = curX + 'px';
            target.style.top = curY + 'px';
        }, 16);
    }

    // Auto-remove after lifetime
    const lifetime = type === 'small' ? 2000 : type === 'moving' ? 4000 : 3000;
    setTimeout(() => {
        if (target.parentElement) {
            target.style.transition = 'opacity 0.3s, transform 0.3s';
            target.style.opacity = '0';
            target.style.transform = 'scale(0.5)';
            setTimeout(() => target.remove(), 300);
        }
    }, lifetime);
}

function updateSRHud() {
    document.getElementById('srScore').textContent = srGame.score;
    document.getElementById('srCombo').textContent = 'x' + srGame.combo;
    document.getElementById('srTimer').textContent = srGame.timeLeft;
    const acc = srGame.shots > 0 ? Math.round((srGame.hits / srGame.shots) * 100) : 0;
    document.getElementById('srAccuracy').textContent = acc + '%';
}

function endShootingRange() {
    srGame.running = false;
    clearInterval(srGame.timerInterval);
    clearInterval(srGame.spawnInterval);

    // Hide crosshair
    document.getElementById('srCrosshair').style.display = 'none';

    const acc = srGame.shots > 0 ? Math.round((srGame.hits / srGame.shots) * 100) : 0;

    // Calculate VP reward
    let vpReward = Math.floor(srGame.score / 50);
    if (acc >= 80) vpReward += 20;
    if (srGame.maxCombo >= 5) vpReward += 10;
    vpReward = Math.min(vpReward, 200); // Cap reward

    // Show game over
    const statsEl = document.getElementById('srFinalStats');
    statsEl.innerHTML = `
        <div class="sr-final-stat">
            <div class="sfs-value" style="color:var(--val-teal)">${srGame.score}</div>
            <div class="sfs-label">คะแนน</div>
        </div>
        <div class="sr-final-stat">
            <div class="sfs-value">${srGame.hits}/${srGame.shots}</div>
            <div class="sfs-label">โดน/ยิง</div>
        </div>
        <div class="sr-final-stat">
            <div class="sfs-value">${acc}%</div>
            <div class="sfs-label">แม่นยำ</div>
        </div>
        <div class="sr-final-stat">
            <div class="sfs-value" style="color:var(--val-gold)">x${srGame.maxCombo}</div>
            <div class="sfs-label">Max Combo</div>
        </div>
    `;

    const rewardEl = document.getElementById('srReward');
    rewardEl.textContent = `🏆 ได้รับ +${vpReward} VP!`;

    // Give reward
    if (vpReward > 0 && currentUser) {
        currentUser.balance += vpReward;
        saveCurrentUser();
        updateUI();
    }

    document.getElementById('srGameOver').style.display = 'flex';

    // Remove remaining targets
    document.getElementById('srGameArea').querySelectorAll('.sr-target').forEach(t => t.remove());

    showToast(`🎮 จบเกม! คะแนน ${srGame.score} | +${vpReward} VP`, 'success');
    checkAchievements();
}

function showSRStart() {
    document.getElementById('srStartOverlay').style.display = 'flex';
    document.getElementById('srGameOver').style.display = 'none';
}

// ==========================================
// LUCKY WHEEL
// ==========================================
const LW_PRIZES = [
    { label: '50 VP', icon: '💰', color: '#5A9FE2', type: 'vp', value: 50, chance: 25 },
    { label: '100 VP', icon: '💵', color: '#009587', type: 'vp', value: 100, chance: 20 },
    { label: '200 VP', icon: '💶', color: '#D1548D', type: 'vp', value: 200, chance: 15 },
    { label: '500 VP', icon: '💰', color: '#F5955B', type: 'vp', value: 500, chance: 8 },
    { label: 'สกินสุ่ม', icon: '🎲', color: '#17DEA5', type: 'skin_random', value: null, chance: 12 },
    { label: 'สกิน Premium+', icon: '⭐', color: '#FAD663', type: 'skin_premium', value: null, chance: 8 },
    { label: 'VP x2', icon: '🔥', color: '#FF4655', type: 'vp_double', value: null, chance: 5 },
    { label: 'เสียใจ', icon: '💨', color: '#666', type: 'nothing', value: 0, chance: 7 },
];

let lwSpinning = false;
let lwAngle = 0;

function renderLuckyWheel() {
    drawWheel(0);
    renderLWPrizes();
}

function drawWheel(rotation) {
    const canvas = document.getElementById('lwCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 200, cy = 200, r = 195;
    const segments = LW_PRIZES.length;
    const arc = (2 * Math.PI) / segments;

    ctx.clearRect(0, 0, 400, 400);

    // Save and rotate
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.translate(-cx, -cy);

    for (let i = 0; i < segments; i++) {
        const startAngle = i * arc - Math.PI / 2;
        const endAngle = startAngle + arc;
        const prize = LW_PRIZES[i];

        // Draw segment
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = prize.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + arc / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = 'white';
        ctx.font = 'bold 13px system-ui';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 3;
        ctx.fillText(prize.icon + ' ' + prize.label, r - 15, 5);
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    ctx.strokeStyle = 'var(--val-red)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎡', cx, cy);

    ctx.restore();
}

function renderLWPrizes() {
    const list = document.getElementById('lwPrizesList');
    if (!list) return;

    list.innerHTML = LW_PRIZES.map(p => `
        <div class="lw-prize-item" style="border-left-color:${p.color}">
            <div class="lw-prize-icon">${p.icon}</div>
            <div class="lw-prize-name">${p.label}</div>
            <div class="lw-prize-chance">${p.chance}%</div>
        </div>
    `).join('');
}

function spinLuckyWheel() {
    if (lwSpinning || !currentUser) return;

    const SPIN_COST = 150;
    if (currentUser.balance < SPIN_COST) {
        showToast('ยอดเงินไม่พอ! ต้องการ 150 VP', 'error');
        return;
    }

    currentUser.balance -= SPIN_COST;
    saveCurrentUser();
    updateUI();
    lwSpinning = true;
    document.getElementById('lwSpinBtn').disabled = true;
    document.getElementById('lwResult').style.display = 'none';

    // Pick prize based on weighted chance
    const totalChance = LW_PRIZES.reduce((s, p) => s + p.chance, 0);
    let roll = Math.random() * totalChance;
    let winIdx = 0;
    for (let i = 0; i < LW_PRIZES.length; i++) {
        roll -= LW_PRIZES[i].chance;
        if (roll <= 0) { winIdx = i; break; }
    }

    // Calculate target angle
    const segments = LW_PRIZES.length;
    const segAngle = (2 * Math.PI) / segments;
    // Target: the winning segment should be at the top (pointer position)
    const targetSegCenter = winIdx * segAngle + segAngle / 2;
    const spins = 5 + Math.random() * 3; // 5-8 full spins
    const targetAngle = spins * 2 * Math.PI + (2 * Math.PI - targetSegCenter);

    const startAngle = lwAngle;
    const duration = 4000;
    const startTime = Date.now();

    function animateSpin() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing: cubic ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        lwAngle = startAngle + (targetAngle - startAngle) * eased;

        drawWheel(lwAngle);

        if (progress < 1) {
            requestAnimationFrame(animateSpin);
        } else {
            // Spin complete
            lwSpinning = false;
            document.getElementById('lwSpinBtn').disabled = false;
            awardLWPrize(LW_PRIZES[winIdx]);
        }
    }

    requestAnimationFrame(animateSpin);
}

function awardLWPrize(prize) {
    const resultEl = document.getElementById('lwResult');
    let rewardText = '';

    switch (prize.type) {
        case 'vp':
            currentUser.balance += prize.value;
            rewardText = `+${prize.value} VP!`;
            showToast(`🎡 ได้รับ ${prize.value} VP!`, 'success');
            break;

        case 'skin_random': {
            const freeCase = CASES_CONFIG[1]; // Standard case
            const skin = pickRandomSkinByRarity(freeCase);
            currentUser.inventory.push({ ...skin, wonAt: Date.now(), caseId: 'luckywheel' });
            rewardText = `สกิน: ${skin.name}!`;
            showToast(`🌟 ได้สกิน ${skin.name}!`, 'success');
            break;
        }

        case 'skin_premium': {
            const premCase = CASES_CONFIG[2]; // Premium case
            const skin = pickRandomSkinByRarity(premCase);
            currentUser.inventory.push({ ...skin, wonAt: Date.now(), caseId: 'luckywheel' });
            rewardText = `สกิน Premium: ${skin.name}!`;
            showToast(`⭐ ได้สกิน Premium+ ${skin.name}!`, 'success');
            break;
        }

        case 'vp_double': {
            const doubled = currentUser.balance;
            const bonus = Math.min(doubled, 2000); // Cap at 2000 VP
            currentUser.balance += bonus;
            rewardText = `VP x2! +${bonus} VP!`;
            showToast(`🔥 VP x2! +${bonus.toLocaleString()} VP!`, 'success');
            break;
        }

        case 'nothing':
            rewardText = 'โชคไม่ดี ลองใหม่!';
            showToast('💨 เสียใจ! ลองอีกครั้งนะ', 'error');
            break;
    }

    saveCurrentUser();
    updateUI();

    resultEl.style.display = 'block';
    resultEl.innerHTML = `
        <h3>🏆 ผลลัพธ์!</h3>
        <div class="lw-prize-won">${prize.icon}</div>
        <div class="lw-prize-desc">${rewardText}</div>
    `;

    checkAchievements();
}
