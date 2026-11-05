/* --- ระบบเสียง 8-BIT AUDIO SYNTHESIZER --- */
let audioCtx = null;
let isAudioMuted = false;
let bgmInterval = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function initAndPlayAudio() {
    initAudio();
    playSound('btn');
    startBGM();
}

function toggleAudio() {
    initAudio();
    isAudioMuted = !isAudioMuted;
    document.querySelector('.audio-toggle-btn').innerText = isAudioMuted ? '🔇' : '🔊';
    if (isAudioMuted) {
        clearInterval(bgmInterval);
        bgmInterval = null;
    } else {
        startBGM();
    }
}

function playSound(type) {
    if (isAudioMuted) return;
    initAudio();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'btn') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.08);
        osc.start(now); osc.stop(now + 0.08);
    } else if (type === 'jump') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'correct') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(130, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'dice') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(250 + Math.random()*250, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.06);
        osc.start(now); osc.stop(now + 0.06);
    }
}

function startBGM() {
    if (bgmInterval || isAudioMuted) return;
    const melody = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 293.66, 349.23, 440.00, 523.25, 440.00, 349.23];
    let idx = 0;
    bgmInterval = setInterval(() => {
        if (isAudioMuted || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(melody[idx], audioCtx.currentTime);
        gain.gain.setValueAtTime(0.025, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.22);
        idx = (idx + 1) % melody.length;
    }, 260);
}