function loadChessGame(container) {
    let board = [
        ['r','n','b','q','k','b','n','r'],
        ['p','p','p','p','p','p','p','p'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['P','P','P','P','P','P','P','P'],
        ['R','N','B','Q','K','B','N','R']
    ];

    const pieceIcons = {
        'R':'♖', 'N':'♘', 'B':'♗', 'Q':'♕', 'K':'♔', 'P':'♙',
        'r':'♜', 'n':'♞', 'b':'♝', 'q':'♛', 'k':'♚', 'p':'♟'
    };

    let selR = -1, selC = -1;
    let validMoves = [];

    function isWhite(p) { return p >= 'A' && p <= 'Z'; }
    function isBlack(p) { return p >= 'a' && p <= 'z'; }

    function getLegalMoves(r, c) {
        const p = board[r][c];
        const moves = [];
        if (!p) return moves;

        const addMove = (tr, tc) => {
            if (tr < 0 || tr > 7 || tc < 0 || tc > 7) return false;
            const target = board[tr][tc];
            if (!target) { moves.push({r: tr, c: tc}); return true; }
            if ((isWhite(p) && isBlack(target)) || (isBlack(p) && isWhite(target))) {
                moves.push({r: tr, c: tc});
            }
            return false;
        };

        if (p === 'P') {
            if (r > 0 && !board[r-1][c]) moves.push({r: r-1, c: c});
            if (r === 6 && !board[r-1][c] && !board[r-2][c]) moves.push({r: r-2, c: c});
            if (r > 0 && c > 0 && isBlack(board[r-1][c-1])) moves.push({r: r-1, c: c-1});
            if (r > 0 && c < 7 && isBlack(board[r-1][c+1])) moves.push({r: r-1, c: c+1});
        } else if (p === 'p') {
            if (r < 7 && !board[r+1][c]) moves.push({r: r+1, c: c});
            if (r === 1 && !board[r+1][c] && !board[r+2][c]) moves.push({r: r+2, c: c});
            if (r < 7 && c > 0 && isWhite(board[r+1][c-1])) moves.push({r: r+1, c: c-1});
            if (r < 7 && c < 7 && isWhite(board[r+1][c+1])) moves.push({r: r+1, c: c+1});
        } else if (p === 'N' || p === 'n') {
            [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(o => addMove(r + o[0], c + o[1]));
        } else if (p === 'K' || p === 'k') {
            [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(d => addMove(r + d[0], c + d[1]));
        } else {
            let dirs = [];
            if (p === 'R' || p === 'r' || p === 'Q' || p === 'q') dirs.push([-1,0],[1,0],[0,-1],[0,1]);
            if (p === 'B' || p === 'b' || p === 'Q' || p === 'q') dirs.push([-1,-1],[-1,1],[1,-1],[1,1]);
            dirs.forEach(d => {
                let step = 1;
                while (addMove(r + d[0]*step, c + d[1]*step)) step++;
            });
        }
        return moves;
    }

    function renderChess() {
        let html = '';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const isLight = (r + c) % 2 === 0;
                const isSel = (selR === r && selC === c);
                const isValid = validMoves.some(m => m.r === r && m.c === c);
                const piece = board[r][c] ? pieceIcons[board[r][c]] : '';

                html += `
                    <div class="chess-cell ${isLight?'light':'dark'} ${isSel?'selected':''} ${isValid?'valid-move':''}"
                         onclick="onChessClick(${r}, ${c})">
                        ${piece}
                    </div>
                `;
            }
        }

        container.innerHTML = `
            <div class="chess-board">${html}</div>
            <div style="margin-top:6px; color:var(--pixel-text); font-size:12px; text-align:center; font-weight:bold;">
                ♟️ เดินกินขุนของบอทเพื่อเอาชนะ!
            </div>
        `;
    }

    window.onChessClick = function(r, c) {
        if (!isPlayerTurn) return;

        if (selR !== -1 && selC !== -1) {
            const isMoveValid = validMoves.some(m => m.r === r && m.c === c);
            if (isMoveValid) {
                playSound('btn');
                const targetPiece = board[r][c];
                board[r][c] = board[selR][selC];
                board[selR][selC] = '';

                if (targetPiece === 'k') {
                    addScore(150);
                    savePoints(currentGameScore);
                    showCustomAlert(`🏆 รุกฆาตขุนของบอทสำเร็จ!\nคุณ ${playerName} รับแต้มสะสม +${currentGameScore} PTS!`, "ชนะเลิศ", "♟️", () => switchScreen('selection-screen'));
                    return;
                } else if (targetPiece) {
                    addScore(20);
                }

                selR = -1; selC = -1; validMoves = [];
                isPlayerTurn = false;
                renderChess();
                updateHeaderUI();

                setTimeout(botChessMove, 1000);
                return;
            }
        }

        if (isWhite(board[r][c])) {
            playSound('btn');
            selR = r; selC = c;
            validMoves = getLegalMoves(r, c);
        } else {
            selR = -1; selC = -1; validMoves = [];
        }
        renderChess();
    };

    function botChessMove() {
        let allBotMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (isBlack(board[r][c])) {
                    const moves = getLegalMoves(r, c);
                    moves.forEach(m => allBotMoves.push({fromR: r, fromC: c, toR: m.r, toC: m.c}));
                }
            }
        }

        if (allBotMoves.length > 0) {
            playSound('btn');
            let chosen;
            if (Math.random() < 0.4) {
                chosen = allBotMoves[Math.floor(Math.random() * allBotMoves.length)];
            } else {
                let captureMove = allBotMoves.find(m => board[m.toR][m.toC] !== '');
                chosen = captureMove || allBotMoves[Math.floor(Math.random() * allBotMoves.length)];
            }

            const captured = board[chosen.toR][chosen.toC];
            board[chosen.toR][chosen.toC] = board[chosen.fromR][chosen.fromC];
            board[chosen.fromR][chosen.fromC] = '';

            if (captured === 'K') {
                showCustomAlert(`💀 บอทกิน King ของคุณ ${playerName}!\nคุณแพ้ในเกมนี้`, "แพ้แล้ว", "💥", () => switchScreen('selection-screen'));
                return;
            }
        }

        isPlayerTurn = true;
        renderChess();
        updateHeaderUI();
    }

    renderChess();
}