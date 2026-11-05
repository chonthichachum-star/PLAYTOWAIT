function loadJigsawGame(container) {
    let tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];

    function shuffleJigsawTiles() {
        for (let i = 0; i < 30; i++) {
            const emptyIdx = tiles.indexOf(0);
            const row = Math.floor(emptyIdx / 3), col = emptyIdx % 3;
            let validNeighbors = [];

            if (row > 0) validNeighbors.push(emptyIdx - 3);
            if (row < 2) validNeighbors.push(emptyIdx + 3);
            if (col > 0) validNeighbors.push(emptyIdx - 1);
            if (col < 2) validNeighbors.push(emptyIdx + 1);

            const randNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
            tiles[emptyIdx] = tiles[randNeighbor];
            tiles[randNeighbor] = 0;
        }
    }

    shuffleJigsawTiles();

    function renderJigsaw() {
        let tilesHtml = '';
        tiles.forEach((num, idx) => {
            if (num === 0) {
                tilesHtml += `<div class="puzzle-tile empty"></div>`;
            } else {
                tilesHtml += `<div class="puzzle-tile" onclick="moveJigsawTile(${idx})">${num}</div>`;
            }
        });

        container.innerHTML = `
            <div style="color:var(--pixel-text); font-size:13px; margin-bottom:8px; text-align:center; font-weight:bold;">
                🧩 คลิกเลื่อนบล็อกตัวเลขติดช่องว่าง ให้เรียง 1 ถึง 8
            </div>
            <div class="puzzle-grid">${tilesHtml}</div>
        `;
    }

    window.moveJigsawTile = function(idx) {
        const emptyIdx = tiles.indexOf(0);
        const row = Math.floor(idx / 3), col = idx % 3;
        const empRow = Math.floor(emptyIdx / 3), empCol = emptyIdx % 3;

        if ((Math.abs(row - empRow) + Math.abs(col - empCol)) === 1) {
            playSound('btn');
            tiles[emptyIdx] = tiles[idx];
            tiles[idx] = 0;

            if (tiles.join('') === '123456780') {
                renderJigsaw();
                addScore(100);
                savePoints(currentGameScore);
                showCustomAlert(`🎉 ยินดีด้วยคุณ ${playerName}!\nแก้ปริศนาจิ๊กซอว์สำเร็จ! รับแต้มสะสม +${currentGameScore} PTS!`, "สำเร็จ", "🧩", () => switchScreen('selection-screen'));
                return;
            }

            renderJigsaw();
        }
    };

    renderJigsaw();
}