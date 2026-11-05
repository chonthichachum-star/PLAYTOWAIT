/* --- ระบบร้านค้าแลกรางวัลจำกัด 5 ชิ้น/เดือน (js/shop.js) --- */

const MAX_CLAIM_PER_MONTH = 5;
let pendingRewardId = null;

const defaultShopRewards = [
    { id: 1, name: "น้ำฟรี 1 ขวด", icon: "🥤", cost: 1000, claimedCount: 0 },
    { id: 2, name: "ขนม 1 ห่อ", icon: "🍿", cost: 2000, claimedCount: 0 },
    { id: 3, name: "ผ้าเย็น 1 ผืน", icon: "🧊", cost: 3000, claimedCount: 0 },
    { id: 4, name: "ยาดม 1 หลอด", icon: "🧪", cost: 5000, claimedCount: 0 },
    { id: 5, name: "สิทธินั่งฟรี 1 ครั้ง", icon: "🪑", cost: 10000, claimedCount: 0 }
];

function getCurrentMonthString() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

function getShopRewards() {
    const currentMonth = getCurrentMonthString();
    const savedData = JSON.parse(localStorage.getItem('gt_shop_rewards_v2') || 'null');

    if (!savedData || savedData.month !== currentMonth) {
        const resetRewards = defaultShopRewards.map(item => ({ ...item, claimedCount: 0 }));
        localStorage.setItem('gt_shop_rewards_v2', JSON.stringify({ month: currentMonth, rewards: resetRewards }));
        return resetRewards;
    }

    return defaultShopRewards.map(defaultItem => {
        const matchedSaved = savedData.rewards.find(s => s.id === defaultItem.id);
        return {
            ...defaultItem,
            claimedCount: matchedSaved ? (matchedSaved.claimedCount || 0) : 0
        };
    });
}

function renderShopGrid() {
    const grid = document.getElementById('reward-shop-grid');
    if (!grid) return;
    grid.innerHTML = '';

    totalAccumulatedPoints = parseInt(localStorage.getItem('gt_points') || '0', 10);
    const rewards = getShopRewards();

    rewards.forEach(item => {
        const isLimitReached = item.claimedCount >= MAX_CLAIM_PER_MONTH;
        const canAfford = totalAccumulatedPoints >= item.cost && !isLimitReached;

        grid.innerHTML += `
            <div class="reward-card">
                <div class="reward-img-box">${item.icon}</div>
                <div class="reward-title">${item.name}</div>
                <div class="reward-cost">⭐ ${item.cost.toLocaleString()} PTS</div>
                
                <div style="font-size: 11px; color: ${isLimitReached ? '#e74c3c' : '#27ae60'}; font-weight: bold; margin: 4px 0;">
                    ${isLimitReached ? '🚫 สิทธิ์ในเดือนนี้หมดแล้ว' : `แลกแล้ว: ${item.claimedCount}/${MAX_CLAIM_PER_MONTH} ชิ้น`}
                </div>

                <button class="pixel-btn ${isLimitReached ? 'blue' : (canAfford ? 'green' : 'red')}" 
                        style="font-size:12px; width:100%; padding:6px;" 
                        onclick="openConfirmModal(${item.id})" ${canAfford ? '' : 'disabled'}>
                    ${isLimitReached ? 'หมด' : 'แลกรางวัล'}
                </button>
            </div>
        `;
    });
}

function openConfirmModal(id) {
    totalAccumulatedPoints = parseInt(localStorage.getItem('gt_points') || '0', 10);
    const rewards = getShopRewards();
    const item = rewards.find(r => r.id === id);

    if (!item) return;

    if (item.claimedCount >= MAX_CLAIM_PER_MONTH) {
        showCustomAlert(`⚠️ สิทธิ์แลก "${item.name}" ในเดือนนี้หมดแล้ว!`, "แจ้งเตือน", "⚠️");
        return;
    }

    if (totalAccumulatedPoints < item.cost) {
        showCustomAlert(`❌ แต้มสะสมของคุณ ${playerName} ไม่พอ!\n(ต้องการ ${item.cost.toLocaleString()} PTS)`, "แต้มไม่พอ", "❌");
        return;
    }

    pendingRewardId = id;
    const modalText = document.getElementById('modal-reward-text');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modal = document.getElementById('confirm-modal');

    if (modalText && modalConfirmBtn && modal) {
        modalText.innerHTML = `คุณ <b>${playerName}</b> ต้องการใช้ <b style="color:#f1c40f;">${item.cost.toLocaleString()} PTS</b><br>เพื่อแลก <b>"${item.name}"</b> หรือไม่?`;
        modalConfirmBtn.onclick = confirmBuyReward;
        modal.style.display = 'flex';
    }
}

function closeConfirmModal() {
    pendingRewardId = null;
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.style.display = 'none';
}

function confirmBuyReward() {
    if (!pendingRewardId) return;

    totalAccumulatedPoints = parseInt(localStorage.getItem('gt_points') || '0', 10);
    const rewards = getShopRewards();
    const item = rewards.find(r => r.id === pendingRewardId);

    if (item && totalAccumulatedPoints >= item.cost && item.claimedCount < MAX_CLAIM_PER_MONTH) {
        totalAccumulatedPoints -= item.cost;
        item.claimedCount += 1;
        
        const currentMonth = getCurrentMonthString();
        localStorage.setItem('gt_points', totalAccumulatedPoints);
        localStorage.setItem('gt_shop_rewards_v2', JSON.stringify({ month: currentMonth, rewards: rewards }));
        
        closeConfirmModal();

        if (typeof playSound === 'function') playSound('correct');
        showCustomAlert(`🎉 แลก "${item.name}" สำเร็จ!\n(${item.claimedCount}/${MAX_CLAIM_PER_MONTH} ชิ้น)`, "สำเร็จ", "🎁", () => updatePointsDisplays());
    } else {
        closeConfirmModal();
    }
}