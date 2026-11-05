function loadMonopolyGame(container) {
    let pMoney = 1000, bMoney = 1000;
    let pPos = 0, bPos = 0;
    
    let gameHistory = [`🎮 เริ่มต้นเกมเศรษฐี! ทั้งสองฝ่ายได้รับเงินขวัญถุง ฿1,000`];

    window.currentMonoPMoney = pMoney;
    window.currentMonoBMoney = bMoney;

    const boardData = [
        { name: "เริ่ม", type: "start", color: "#2ecc71" },
        { name: "กรุงเทพ", type: "property", price: 200, incomePerTurn: 50, color: "#e74c3c", owner: null, level: 0 },
        { name: "ภาษี💸", type: "tax", color: "#f39c12" },
        { name: "เชียงใหม่", type: "property", price: 150, incomePerTurn: 35, color: "#3498db", owner: null, level: 0 },
        { name: "พัทยา", type: "property", price: 180, incomePerTurn: 40, color: "#9b59b6", owner: null, level: 0 },
        { name: "ดวงดี🎁", type: "bonus", color: "#f1c40f" },
        { name: "หัวหิน", type: "property", price: 160, incomePerTurn: 38, color: "#e67e22", owner: null, level: 0 },
        { name: "ติดคุก⛓️", type: "jail", color: "#7f8c8d" },
        { name: "ภูเก็ต", type: "property", price: 220, incomePerTurn: 55, color: "#1abc9c", owner: null, level: 0 },
        { name: "โบนัส💰", type: "bonus", color: "#2ecc71" },
        { name: "ชลบุรี", type: "property", price: 140, incomePerTurn: 30, color: "#e74c3c", owner: null, level: 0 },
        { name: "จัดเลี้ยง", type: "party", color: "#9b59b6" }
    ];

    const coords = [
        {r:4, c:1}, {r:4, c:2}, {r:4, c:3}, {r:4, c:4},
        {r:3, c:4}, {r:2, c:4}, {r:1, c:4}, {r:1, c:3},
        {r:1, c:2}, {r:1, c:1}, {r:2, c:1}, {r:3, c:1}
    ];

    function getAssetValue(ownerMark) {
        return boardData.reduce((sum, item) => {
            if (item.owner === ownerMark) {
                return sum + (item.price * item.level);
            }
            return sum;
        }, 0);
    }

    function getTotalIncomePerTurn(ownerMark) {
        return boardData.reduce((sum, item) => {
            if (item.owner === ownerMark) {
                return sum + (item.incomePerTurn * item.level);
            }
            return sum;
        }, 0);
    }

    function syncNetWorth() {
        const pAssets = getAssetValue('P1');
        const bAssets = getAssetValue('BOT');
        window.currentMonoPMoney = pMoney;
        window.currentMonoBMoney = bMoney;
        window.currentMonoPNetWorth = pMoney + pAssets;
        window.currentMonoBNetWorth = bMoney + bAssets;
    }

    function addLog(msg) {
        gameHistory.unshift(msg);
        if (gameHistory.length > 5) gameHistory.pop();
    }

    syncNetWorth();

    function renderBoard(latestMsg = null) {
        if (latestMsg) addLog(latestMsg);

        let cellsHtml = '';
        coords.forEach((pos, idx) => {
            const item = boardData[idx];
            const hasP = pPos === idx ? '🏃' : '';
            const hasB = bPos === idx ? '🤖' : '';
            
            let ownerBadge = '';
            if (item.owner === 'P1') {
                const lvlText = item.level === 3 ? '🏰 Landmark' : `🏠 Lvl ${item.level}`;
                ownerBadge = `<span style="color:#27ae60; font-weight:bold;">${lvlText}</span>`;
            } else if (item.owner === 'BOT') {
                const lvlText = item.level === 3 ? '🏰 Landmark' : `🏠 Lvl ${item.level}`;
                ownerBadge = `<span style="color:#c0392b; font-weight:bold;">${lvlText}</span>`;
            }

            cellsHtml += `
                <div class="mono-cell" style="grid-row:${pos.r}; grid-column:${pos.c}; border-top: 3px solid ${item.color}">
                    <div style="font-size:12px;">${item.name}</div>
                    <div style="font-size:10px;">${ownerBadge}</div>
                    <div style="font-size:13px;">${hasP}${hasB}</div>
                </div>
            `;
        });

        const pNet = pMoney + getAssetValue('P1');
        const bNet = bMoney + getAssetValue('BOT');
        const pIncome = getTotalIncomePerTurn('P1');
        const bIncome = getTotalIncomePerTurn('BOT');

        const historyHtml = gameHistory.map((item, i) => 
            `<div style="margin-bottom:3px; ${i === 0 ? 'font-weight:bold; color:#2980b9;' : 'opacity:0.75;'}">• ${item}</div>`
        ).join('');

        container.innerHTML = `
            <div class="monopoly-board" style="position:relative;">
                ${cellsHtml}
                <div class="mono-center">
                    <div style="font-size:12px; color:var(--pixel-text); font-weight:bold; text-align:center;">
                        <b>${playerName}</b> ทรัพย์สิน: <span style="color:#27ae60;">฿${pNet}</span><br>(เงิน: ฿${pMoney} | +฿${pIncome}/รอบ)
                    </div>
                    <div style="font-size:12px; color:var(--pixel-text); font-weight:bold; text-align:center;">
                        <b>BOT</b> ทรัพย์สิน: <span style="color:#c0392b;">฿${bNet}</span><br>(เงิน: ฿${bMoney} | +฿${bIncome}/รอบ)
                    </div>
                    <div id="mono-dice-disp" style="font-size:22px;">🎲</div>
                    <button class="pixel-btn red" id="mono-roll-btn" style="font-size:13px; padding:6px 12px;" onclick="playMonopolyTurn()" ${!isPlayerTurn?'disabled':''}>
                        ทอยเต๋า
                    </button>
                </div>

                <div id="mono-confirm-modal" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:20; flex-direction:column; justify-content:center; align-items:center; padding:15px; text-align:center;">
                    <div style="background:#fff; border:3px solid var(--pixel-blue); border-radius:8px; padding:12px; width:100%; max-width:240px; box-shadow:0 4px 10px rgba(0,0,0,0.3);">
                        <div id="modal-title" style="font-size:14px; font-weight:bold; color:var(--pixel-text); margin-bottom:8px;">🛒 ยืนยันการทำรายการ</div>
                        <div id="modal-body" style="font-size:12px; color:#555; margin-bottom:12px; white-space:pre-line;">คุณต้องการทำรายการหรือไม่?</div>
                        <div style="display:flex; gap:8px; justify-content:center;">
                            <button class="pixel-btn green" id="modal-buy-btn" style="font-size:12px; padding:6px 10px;">ตกลง</button>
                            <button class="pixel-btn red" id="modal-skip-btn" style="font-size:12px; padding:6px 10px;">ข้าม</button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="mono-log" style="margin-top:6px; background:#ffffff; border: 2px solid var(--pixel-blue); color:var(--pixel-text); padding:6px 8px; border-radius:4px; font-size:12px; text-align:left; width:100%; max-height:85px; overflow-y:auto; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);">
                <div style="font-weight:bold; border-bottom:1px solid #ddd; padding-bottom:2px; margin-bottom:4px; color:#555; font-size:11px; text-transform:uppercase;">📜 ประวัติการเดิน (LOG):</div>
                ${historyHtml}
            </div>
        `;
    }

    function promptPurchase(title, bodyText, cost, onConfirm, onSkip) {
        const modal = document.getElementById('mono-confirm-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const buyBtn = document.getElementById('modal-buy-btn');
        const skipBtn = document.getElementById('modal-skip-btn');

        modalTitle.innerText = title;
        modalBody.innerText = bodyText;
        buyBtn.innerText = `ตกลง (฿${cost})`;

        modal.style.display = 'flex';

        buyBtn.onclick = () => {
            modal.style.display = 'none';
            onConfirm();
        };

        skipBtn.onclick = () => {
            modal.style.display = 'none';
            onSkip();
        };
    }

    function proceedToBotTurn(msg) {
        syncNetWorth();

        if (pMoney <= 0) {
            pMoney = 0;
            syncNetWorth();
            renderBoard(`💥 เงินของคุณหมดแล้ว (฿0)! คุณล้มละลาย`);
            showCustomAlert(`💸 คุณ ${playerName} เงินหมดล้มละลาย!\nแพ้ในเกมเศรษฐี`, "ล้มละลาย", "💥", () => switchScreen('selection-screen'));
            return;
        }

        isPlayerTurn = false;
        renderBoard(msg);
        updateHeaderUI();

        setTimeout(() => {
            const bDiceDisp = document.getElementById('mono-dice-disp');
            const bRoll = Math.floor(Math.random() * 6) + 1;

            animateDiceRoll(bDiceDisp, bRoll, () => {
                const bPassiveIncome = getTotalIncomePerTurn('BOT');
                if (bPassiveIncome > 0) bMoney += bPassiveIncome;

                bPos = (bPos + bRoll) % 12;
                const bLand = boardData[bPos];
                let bMsg = `🤖 BOT ทอยได้ [ ${bRoll} ] ตกช่อง [${bLand.name}]`;
                if (bPassiveIncome > 0) bMsg += ` (+฿${bPassiveIncome}/รอบ)`;

                if (bLand.type === "tax") {
                    bMoney -= 200;
                    bMsg += " 💸 เสียภาษี 200";
                } else if (bLand.type === "bonus") {
                    bMoney += 250;
                } else if (bLand.type === "jail") {
                    bMoney -= 150;
                } else if (bLand.type === "party") {
                    bMoney -= 100;
                } else if (bLand.type === "property") {
                    if (bLand.owner === null) {
                        if (bMoney >= bLand.price) {
                            bMoney -= bLand.price;
                            bLand.owner = 'BOT';
                            bLand.level = 1;
                            bMsg += ` 🏠 BOT ซื้อบ้าน Level 1 ราคา ฿${bLand.price}`;
                        }
                    } else if (bLand.owner === 'BOT') {
                        const upgradeCost = Math.floor(bLand.price * 0.8);
                        if (bLand.level < 3 && bMoney >= upgradeCost) {
                            bMoney -= upgradeCost;
                            bLand.level++;
                            const lvlLabel = bLand.level === 3 ? '🏰 สร้าง Landmark สำเร็จ!' : `🏠 อัปเกรดเป็น Level ${bLand.level}`;
                            bMsg += ` ⬆️ BOT ${lvlLabel}`;
                        }
                    } else if (bLand.owner === 'P1') {
                        const rent = Math.floor(bLand.price * 0.6 * bLand.level);
                        bMoney -= rent;
                        pMoney += rent;
                        bMsg += ` 💸 BOT จ่ายค่าผ่านทางให้คุณ ฿${rent}!`;

                        const takeoverCost = Math.floor(bLand.price * 2 * bLand.level);
                        if (bLand.level < 3 && bMoney >= takeoverCost + 200) {
                            bMoney -= takeoverCost;
                            pMoney += takeoverCost;
                            bLand.owner = 'BOT';
                            bMsg += ` ⚔️ BOT จ่าย ฿${takeoverCost} ยึดเมืองไป!`;
                        }
                    }
                }

                syncNetWorth();

                if (bMoney <= 0) {
                    bMoney = 0;
                    syncNetWorth();
                    renderBoard(`🎉 บอทเงินหมดล้มละลาย (฿0)! คุณชนะแล้ว!`);
                    addScore(150);
                    savePoints(currentGameScore);
                    showCustomAlert(`🏆 ยินดีด้วยคุณ ${playerName}!\nบอทล้มละลาย ชนะเกมเศรษฐี! รับแต้มสะสม +${currentGameScore} PTS!`, "ชนะเลิศ", "🎉", () => switchScreen('selection-screen'));
                    return;
                }

                isPlayerTurn = true;
                renderBoard(bMsg);
                updateHeaderUI();
            });
        }, 1000);
    }

    window.playMonopolyTurn = function() {
        if (!isPlayerTurn) return;

        const rollBtn = document.getElementById('mono-roll-btn');
        const diceDisp = document.getElementById('mono-dice-disp');
        rollBtn.disabled = true;

        const pPassiveIncome = getTotalIncomePerTurn('P1');
        if (pPassiveIncome > 0) pMoney += pPassiveIncome;

        const roll = Math.floor(Math.random() * 6) + 1;

        animateDiceRoll(diceDisp, roll, () => {
            pPos = (pPos + roll) % 12;
            const land = boardData[pPos];
            let msg = `🎲 ${playerName} ทอยได้ [ ${roll} ] ตกช่อง [${land.name}]`;
            if (pPassiveIncome > 0) msg += ` (+฿${pPassiveIncome}/รอบ)`;

            if (land.type === "tax") {
                pMoney -= 200;
                msg += " 💸 เสียภาษี 200";
                proceedToBotTurn(msg);
            } else if (land.type === "bonus") {
                pMoney += 250;
                msg += " 🎁 ได้โบนัส +250";
                addScore(20);
                proceedToBotTurn(msg);
            } else if (land.type === "jail") {
                pMoney -= 150;
                msg += " ⛓️ จ่ายค่าประกันคุก 150";
                proceedToBotTurn(msg);
            } else if (land.type === "party") {
                pMoney -= 100;
                msg += " 🎉 จ่ายค่าจัดเลี้ยง 100";
                proceedToBotTurn(msg);
            } else if (land.type === "property") {
                if (land.owner === null) {
                    if (pMoney >= land.price) {
                        promptPurchase(
                            `🏠 ซื้อเมือง [${land.name}]`,
                            `ราคา ฿${land.price}\nรายได้ประจำรอบ: +฿${land.incomePerTurn}/รอบ`,
                            land.price,
                            () => {
                                pMoney -= land.price;
                                land.owner = 'P1';
                                land.level = 1;
                                addScore(25);
                                proceedToBotTurn(msg + ` 🏠 ซื้อ Level 1 สำเร็จ!`);
                            },
                            () => proceedToBotTurn(msg + ` (ข้ามการซื้อ)`)
                        );
                    } else {
                        proceedToBotTurn(msg + ` (เงินไม่พอซื้อ ฿${land.price})`);
                    }
                } else if (land.owner === 'P1') {
                    const upgradeCost = Math.floor(land.price * 0.8);
                    if (land.level < 3 && pMoney >= upgradeCost) {
                        const isLandmark = land.level === 2;
                        const titleText = isLandmark ? `🏰 สร้าง Landmark [${land.name}]` : `⬆️ อัปเกรดเมือง [${land.name}]`;
                        const bodyText = isLandmark ? 
                            `ต้องการสร้าง Landmark ราคา ฿${upgradeCost} หรือไม่?\n(อีกฝ่ายจะไม่สามารถซื้อยึดเมืองนี้ได้อีก!)` :
                            `ต้องการอัปเกรดเป็น Level ${land.level + 1} ในราคา ฿${upgradeCost} หรือไม่?`;

                        promptPurchase(
                            titleText,
                            bodyText,
                            upgradeCost,
                            () => {
                                pMoney -= upgradeCost;
                                land.level++;
                                addScore(20);
                                const statusMsg = land.level === 3 ? ` 🏰 สร้าง Landmark สำเร็จ!` : ` ⬆️ อัปเกรดเป็น Level ${land.level}!`;
                                proceedToBotTurn(msg + statusMsg);
                            },
                            () => proceedToBotTurn(msg + ` (ข้ามการอัปเกรด)`)
                        );
                    } else if (land.level === 3) {
                        proceedToBotTurn(msg + ` 🏰 Landmark ของคุณเอง!`);
                    } else {
                        proceedToBotTurn(msg + ` 🏠 เมืองของคุณเอง (Level ${land.level})`);
                    }
                } else if (land.owner === 'BOT') {
                    const rent = Math.floor(land.price * 0.6 * land.level);
                    pMoney -= rent;
                    bMoney += rent;
                    msg += ` 💸 จ่ายค่าผ่านทางให้ BOT ฿${rent}`;

                    if (land.level === 3) {
                        proceedToBotTurn(msg + ` (🏰 เป็น Landmark ยึดไม่ได้!)`);
                        return;
                    }

                    const takeoverCost = Math.floor(land.price * 2 * land.level);
                    if (pMoney >= takeoverCost) {
                        promptPurchase(
                            `⚔️ ซื้อยึดเมือง (Takeover) [${land.name}]`,
                            `ต้องการจ่าย ฿${takeoverCost} เพื่อซื้อยึดเมืองของ BOT มาเป็นของคุณหรือไม่?`,
                            takeoverCost,
                            () => {
                                pMoney -= takeoverCost;
                                bMoney += takeoverCost;
                                land.owner = 'P1';
                                addScore(35);
                                proceedToBotTurn(msg + ` ⚔️ ซื้อยึดเมืองสำเร็จ!`);
                            },
                            () => proceedToBotTurn(msg + ` (ไม่ซื้อยึด)`)
                        );
                    } else {
                        proceedToBotTurn(msg);
                    }
                }
            } else {
                proceedToBotTurn(msg);
            }
        });
    };

    renderBoard();
}