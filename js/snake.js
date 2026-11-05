function loadSnakeGame(container) {
    let pPos = 1, bPos = 1;
    const snakes = { 14: 4, 19: 7, 23: 11 };
    const ladders = { 3: 12, 8: 17, 15: 22 };

    function renderBoard(logMsg = "แตะทอยเต๋าเพื่อเดิน") {
        let cellsHtml = '';
        for (let i = 25; i >= 1; i--) {
            const isSnake = snakes[i] ? '🐍' : '';
            const isLadder = ladders[i] ? '🪜' : '';
            const hasP = pPos === i ? '🏃' : '';
            const hasB = bPos === i ? '🤖' : '';
            cellsHtml += `
                <div class="snake-cell ${i%2===0?'even':''}">
                    <span class="cell-num">${i}</span>
                    ${hasP}${hasB} ${isSnake}${isLadder}
                </div>
            `;
        }

        container.innerHTML = `
            <div class="snake-board">${cellsHtml}</div>
            <div style="margin-top:8px; display:flex; flex-direction:column; align-items:center; gap:6px; width:100%;">
                <div id="dice-anim-display" style="font-size:26px;">🎲</div>
                <div id="snake-info-box" style="background:#ffffff; border: 2px solid var(--pixel-blue); color:var(--pixel-text); padding:6px; border-radius:4px; font-size:12px; text-align:center; width:100%;">
                    ${logMsg}
                </div>
                <button class="pixel-btn green" id="snake-roll-btn" onclick="playSnakeTurn()" ${!isPlayerTurn?'disabled':''}>
                    🎲 ทอยลูกเต๋า
                </button>
            </div>
        `;
    }

    window.playSnakeTurn = function() {
        if (!isPlayerTurn) return;

        const rollBtn = document.getElementById('snake-roll-btn');
        const diceDisp = document.getElementById('dice-anim-display');
        rollBtn.disabled = true;

        const roll = Math.floor(Math.random() * 6) + 1;

        animateDiceRoll(diceDisp, roll, () => {
            pPos += roll;
            let msg = `🎲 ${playerName} ทอยได้แต้ม [ ${roll} ] เดินไปช่อง ${pPos}`;

            if (snakes[pPos]) {
                pPos = snakes[pPos];
                msg += ` 🐍 โดนงูฉก! ถอยไปช่อง ${pPos}`;
            } else if (ladders[pPos]) {
                pPos = ladders[pPos];
                msg += ` 🪜 เจอบันได! ปีนไปช่อง ${pPos}`;
                addScore(10);
            }

            if (pPos >= 25) {
                pPos = 25;
                renderBoard(`🎉 ${playerName} ทอยได้ [ ${roll} ] ถึงเส้นชัยแล้ว!`);
                addScore(100);
                savePoints(currentGameScore);
                showCustomAlert(`🏆 ยินดีด้วยคุณ ${playerName}!\nเข้าเส้นชัยสำเร็จ รับแต้มสะสม +${currentGameScore} PTS!`, "ชนะเลิศ", "🎉", () => switchScreen('selection-screen'));
                return;
            }

            isPlayerTurn = false;
            renderBoard(msg);
            updateHeaderUI();

            setTimeout(() => {
                const bDiceDisp = document.getElementById('dice-anim-display');
                const bRoll = Math.floor(Math.random() * 5) + 1;

                animateDiceRoll(bDiceDisp, bRoll, () => {
                    bPos += bRoll;
                    let bMsg = `🤖 บอท (CPU) ทอยได้แต้ม [ ${bRoll} ] เดินไปช่อง ${bPos}`;

                    if (snakes[bPos]) {
                        bPos = snakes[bPos];
                        bMsg += ` 🐍 บอทโดนงูฉก! ถอยไปช่อง ${bPos}`;
                    } else if (ladders[bPos]) {
                        bPos = ladders[bPos];
                        bMsg += ` 🪜 บอทปีนบันได ไปช่อง ${bPos}`;
                    }

                    if (bPos >= 25) {
                        bPos = 25;
                        renderBoard(`💥 บอทเข้าเส้นชัยก่อน! คุณแพ้`);
                        showCustomAlert(`💀 บอทเข้าเส้นชัยก่อนในรอบนี้!`, "แพ้แล้ว", "💥", () => switchScreen('selection-screen'));
                        return;
                    }

                    isPlayerTurn = true;
                    renderBoard(bMsg);
                    updateHeaderUI();
                });
            }, 1000);
        });
    };

    renderBoard();
}