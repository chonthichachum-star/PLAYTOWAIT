function loadTriviaGame(container) {
    const questions = [
        {
            q: "อะไรเอ่ย? เดินได้ วิ่งได้ แต่ไม่มีขา",
            options: ["นาฬิกา", "เงา", "น้ำตก", "ลม"],
            answer: 0
        },
        {
            q: "สัตว์อะไรเอ่ย? มีกระเป๋าหน้าท้องแต่ไม่ใช่จังกรู้",
            options: ["หมีโคอาล่า", "จิ้งโจ้", "วอมแบต", "โอพอสซัม"],
            answer: 1
        },
        {
            q: "จังหวัดใดในประเทศไทยที่มีพื้นที่ใหญ่ที่สุด?",
            options: ["เชียงใหม่", "นครราชสีมา", "ตาก", "กาญจนบุรี"],
            answer: 1
        },
        {
            q: "อะไรเอ่ย? ยิ่งตัด ยิ่งยาว",
            options: ["เชือก", "ถนน", "ผม", "เล็บ"],
            answer: 1
        },
        {
            q: "เดือนอะไรมี 28 วัน?",
            options: ["กุมภาพันธ์", "กุมภาพันธ์และเมษายน", "ทุกเดือน", "ไม่มีเลย"],
            answer: 2
        }
    ];

    let currentQIndex = 0;

    function renderTrivia() {
        if (currentQIndex >= questions.length) {
            // เล่นครบทุกข้อ
            addScore(50);
            savePoints(currentGameScore);
            showCustomAlert(
                `🎉 ยินดีด้วยคุณ ${playerName}!\nคุณตอบคำถามครบทุกข้อแล้ว! รับแต้มสะสม +${currentGameScore} PTS!`,
                "เก่งมาก",
                "❓",
                () => switchScreen('selection-screen')
            );
            return;
        }

        const qData = questions[currentQIndex];
        let optionsHtml = '';

        qData.options.forEach((opt, idx) => {
            optionsHtml += `
                <button class="pixel-btn blue" style="width:100%; font-size:14px; padding:10px; text-align:left; justify-content:flex-start;" onclick="checkTriviaAnswer(${idx})">
                    ${idx + 1}. ${opt}
                </button>
            `;
        });

        container.innerHTML = `
            <div class="trivia-container">
                <div style="font-size:13px; font-weight:bold; color:var(--pixel-blue);">
                    ข้อที่ ${currentQIndex + 1} / ${questions.length} (ผู้เล่น: ${playerName})
                </div>
                <div class="trivia-box">
                    ${qData.q}
                </div>
                <div class="trivia-options">
                    ${optionsHtml}
                </div>
            </div>
        `;
    }

    window.checkTriviaAnswer = function(selectedIdx) {
        const qData = questions[currentQIndex];

        if (selectedIdx === qData.answer) {
            playSound('correct');
            addScore(20);
            currentQIndex++;
            renderTrivia();
        } else {
            playSound('wrong');
            loseP1Life(); // ลดหัวใจถ้าตอบผิด
            if (p1Lives > 0) {
                showCustomAlert(`❌ คำตอบยังไม่ถูกต้อง! ลองดูใหม่อีกทีนะ`, "ตอบผิด", "💥");
            }
        }
    };

    renderTrivia();
}