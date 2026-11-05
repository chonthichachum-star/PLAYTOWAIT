function loadRunnerGame(container) {
    container.innerHTML = `
        <div style="color:var(--pixel-text); font-size:13px; margin-bottom:6px; font-weight:bold; text-align:center;">🏃 แตะหน้าจอเพื่อกระโดดหลบสิ่งกีดขวาง!</div>
        <canvas id="runner-canvas" width="320" height="230"></canvas>
    `;

    const canvas = document.getElementById('runner-canvas');
    const ctx = canvas.getContext('2d');

    let player = { x: 30, y: 155, w: 20, h: 26, vy: 0, jumping: false };
    let bot = { x: 30, y: 55, w: 20, h: 26, vy: 0, jumping: false };
    
    let playerObstacles = [];
    let botObstacles = [];
    
    let p1SpawnTimer = 0;
    let p1NextDelay = getRandomInt(40, 90);
    
    let botSpawnTimer = 0;
    let botNextDelay = getRandomInt(40, 90);

    let baseSpeed = 4;
    let speedIncreaseTimer = 0;

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getDynamicDelay() {
        let rand = Math.random();
        if (rand < 0.35) return getRandomInt(30, 45);
        else if (rand < 0.75) return getRandomInt(60, 100);
        else return getRandomInt(120, 170);
    }

    function createObstacle(isFlyingAllowed = true) {
        let typeRoll = Math.random();
        let obsType = 'normal';
        let obsW = 16;
        let obsH = 22;
        let obsFly = false;

        if (typeRoll < 0.50) {
            obsW = getRandomInt(14, 18);
            obsH = getRandomInt(20, 24);
        } else if (typeRoll < 0.80) {
            obsType = 'wide';
            obsW = getRandomInt(26, 34);
            obsH = getRandomInt(16, 20);
        } else if (isFlyingAllowed) {
            obsType = 'flying';
            obsW = 20;
            obsH = 14;
            obsFly = true;
        }

        return {
            x: 320,
            w: obsW,
            h: obsH,
            type: obsType,
            isFlying: obsFly,
            hit: false,
            color: obsFly ? '#e67e22' : (obsType === 'wide' ? '#8e44ad' : '#2c3e50')
        };
    }

    function doJump() {
        if (!player.jumping) {
            playSound('jump');
            player.vy = -8.2;
            player.jumping = true;
        }
    }

    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); doJump(); });
    canvas.addEventListener('mousedown', doJump);

    activeGameLoop = setInterval(() => {
        player.y += player.vy;
        if (player.y < 155) player.vy += 0.5;
        else { player.y = 155; player.jumping = false; player.vy = 0; }

        bot.y += bot.vy;
        if (bot.y < 55) bot.vy += 0.5;
        else { bot.y = 55; bot.jumping = false; bot.vy = 0; }

        speedIncreaseTimer++;
        if (speedIncreaseTimer > 300) {
            baseSpeed += 0.12;
            speedIncreaseTimer = 0;
        }

        p1SpawnTimer++;
        if (p1SpawnTimer >= p1NextDelay) {
            p1SpawnTimer = 0;
            p1NextDelay = getDynamicDelay();
            playerObstacles.push(createObstacle(true));
        }

        botSpawnTimer++;
        if (botSpawnTimer >= botNextDelay) {
            botSpawnTimer = 0;
            botNextDelay = getDynamicDelay();
            botObstacles.push(createObstacle(true));
        }

        botObstacles.forEach(obs => {
            if (obs.x > 35 && obs.x < (75 + baseSpeed * 4) && !bot.jumping) {
                if (obs.isFlying) return;
                if (Math.random() < 0.82) {
                    bot.vy = -8.2;
                    bot.jumping = true;
                }
            }
        });

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(0, 181, 320, 8);
        ctx.fillRect(0, 81, 320, 8);

        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(bot.x, bot.y, bot.w, bot.h);

        for (let i = playerObstacles.length - 1; i >= 0; i--) {
            let obs = playerObstacles[i];
            obs.x -= baseSpeed;

            let posY = obs.isFlying ? (181 - obs.h - 22) : (181 - obs.h);

            ctx.fillStyle = obs.color;
            ctx.fillRect(obs.x, posY, obs.w, obs.h);

            if (!obs.hit && 
                player.x < obs.x + obs.w && 
                player.x + player.w > obs.x && 
                player.y + player.h > posY && 
                player.y < posY + obs.h) {
                
                obs.hit = true;
                loseP1Life();
            }

            if (obs.x < -40) {
                playerObstacles.splice(i, 1);
                addScore(10);
            }
        }

        for (let i = botObstacles.length - 1; i >= 0; i--) {
            let obs = botObstacles[i];
            obs.x -= baseSpeed;

            let posY = obs.isFlying ? (81 - obs.h - 22) : (81 - obs.h);

            ctx.fillStyle = obs.color;
            ctx.fillRect(obs.x, posY, obs.w, obs.h);

            if (!obs.hit && 
                bot.x < obs.x + obs.w && 
                bot.x + bot.w > obs.x && 
                bot.y + bot.h > posY && 
                bot.y < posY + obs.h) {
                
                obs.hit = true;
                loseBotLife();
            }

            if (obs.x < -40) {
                botObstacles.splice(i, 1);
            }
        }

        ctx.font = "bold 13px Kanit, sans-serif";
        ctx.fillStyle = "#e74c3c";
        let p1Hearts = "❤️".repeat(Math.max(0, p1Lives));
        ctx.fillText(`${playerName}: ${p1Hearts}`, 10, 218);

        ctx.fillStyle = "#f39c12";
        let botHearts = "❤️".repeat(Math.max(0, botLives));
        ctx.textAlign = "right";
        ctx.fillText(`BOT: ${botHearts}`, 310, 218);
        ctx.textAlign = "left";

    }, 1000 / 60);
}