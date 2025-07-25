/**
 * レトロテトリス - 80年代風テトリスゲーム
 * Web Audio APIを使用したコロベイニキBGM付き
 */

console.log('🎮 レトロテトリス初期化開始');

// ゲーム設定
const GAME_CONFIG = {
    BOARD_WIDTH: 10,
    BOARD_HEIGHT: 20,
    CELL_SIZE: 30,
    COLORS: {
        I: '#00ffff', // シアン
        O: '#ffff00', // イエロー
        T: '#ff00ff', // マゼンタ
        S: '#00ff00', // グリーン
        Z: '#ff0000', // レッド
        J: '#0000ff', // ブルー
        L: '#ff8800', // オレンジ
        GHOST: '#444444' // ゴーストピース
    },
    LINES_PER_LEVEL: 10,
    SCORE_VALUES: {
        SINGLE: 100,
        DOUBLE: 300,
        TRIPLE: 500,
        TETRIS: 800,
        SOFT_DROP: 1,
        HARD_DROP: 2
    }
};

// テトロミノの形状定義
const TETROMINOS = {
    I: [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],
    O: [
        [1,1],
        [1,1]
    ],
    T: [
        [0,1,0],
        [1,1,1],
        [0,0,0]
    ],
    S: [
        [0,1,1],
        [1,1,0],
        [0,0,0]
    ],
    Z: [
        [1,1,0],
        [0,1,1],
        [0,0,0]
    ],
    J: [
        [1,0,0],
        [1,1,1],
        [0,0,0]
    ],
    L: [
        [0,0,1],
        [1,1,1],
        [0,0,0]
    ]
};

// ゲーム状態
class GameState {
    constructor() {
        this.board = this.createEmptyBoard();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.started = false;
        this.dropTime = 0;
        this.dropCounter = 0;
        this.lastTime = 0;
        
        // 統計情報
        this.stats = {
            gamesPlayed: 0,
            totalLines: 0,
            playTime: 0,
            startTime: 0
        };
        
        // 設定
        this.settings = {
            bgm: true,
            sfx: true,
            speed: 'normal'
        };
        
        console.log('🎯 ゲーム状態を初期化しました');
    }
    
    createEmptyBoard() {
        return Array(GAME_CONFIG.BOARD_HEIGHT).fill().map(() => 
            Array(GAME_CONFIG.BOARD_WIDTH).fill(0)
        );
    }
}

// テトロミノピース
class Tetromino {
    constructor(type, x = 3, y = 0) {
        this.type = type;
        this.shape = TETROMINOS[type];
        this.x = x;
        this.y = y;
        this.color = GAME_CONFIG.COLORS[type];
        
        // 無限ループ防止フラグ
        this.isConstructing = true;
        
        console.log(`🔷 新しいピース生成: ${type} at (${x}, ${y})`);
        
        this.isConstructing = false;
    }
    
    rotate() {
        const rotated = this.shape[0].map((_, i) =>
            this.shape.map(row => row[i]).reverse()
        );
        return rotated;
    }
    
    copy() {
        const newPiece = new Tetromino(this.type, this.x, this.y);
        newPiece.shape = this.shape;
        return newPiece;
    }
}

// BGM管理クラス（コロベイニキ）
class MusicManager {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.currentNote = 0;
        this.noteStartTime = 0;
        this.tempo = 120; // BPM
        
        // コロベイニキの楽譜（周波数で表現）
        this.melody = [
            {note: 'E4', duration: 0.5}, {note: 'B3', duration: 0.25}, {note: 'C4', duration: 0.25},
            {note: 'D4', duration: 0.5}, {note: 'C4', duration: 0.25}, {note: 'B3', duration: 0.25},
            {note: 'A3', duration: 0.5}, {note: 'A3', duration: 0.25}, {note: 'C4', duration: 0.25},
            {note: 'E4', duration: 0.5}, {note: 'D4', duration: 0.25}, {note: 'C4', duration: 0.25},
            {note: 'B3', duration: 0.5}, {note: 'B3', duration: 0.25}, {note: 'C4', duration: 0.25},
            {note: 'D4', duration: 0.5}, {note: 'E4', duration: 0.5},
            {note: 'C4', duration: 0.5}, {note: 'A3', duration: 0.5}, {note: 'A3', duration: 0.5}, {note: 'REST', duration: 0.5},
            {note: 'REST', duration: 0.25}, {note: 'D4', duration: 0.5}, {note: 'F4', duration: 0.25},
            {note: 'A4', duration: 0.5}, {note: 'G4', duration: 0.25}, {note: 'F4', duration: 0.25},
            {note: 'E4', duration: 0.5}, {note: 'REST', duration: 0.25}, {note: 'C4', duration: 0.25},
            {note: 'E4', duration: 0.5}, {note: 'D4', duration: 0.25}, {note: 'C4', duration: 0.25},
            {note: 'B3', duration: 0.5}, {note: 'B3', duration: 0.25}, {note: 'C4', duration: 0.25},
            {note: 'D4', duration: 0.5}, {note: 'E4', duration: 0.5},
            {note: 'C4', duration: 0.5}, {note: 'A3', duration: 0.5}, {note: 'A3', duration: 1.0}
        ];
        
        // 音程マッピング
        this.noteFrequencies = {
            'A3': 220.00, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66,
            'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00,
            'REST': 0
        };
        
        console.log('🎵 音楽マネージャーを初期化しました');
    }
    
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🎼 AudioContextを作成しました');
        } catch (error) {
            console.error('❌ AudioContext作成エラー:', error);
        }
    }
    
    playNote(frequency, duration) {
        if (!this.audioContext || frequency === 0) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'square'; // レトロなスクエア波
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playMelody() {
        if (!this.audioContext || !gameState.settings.bgm) return;
        
        this.isPlaying = true;
        this.currentNote = 0;
        this.noteStartTime = this.audioContext.currentTime;
        
        this.scheduleNextNote();
        console.log('🎶 コロベイニキの演奏を開始');
    }
    
    scheduleNextNote() {
        if (!this.isPlaying || this.currentNote >= this.melody.length) {
            // メロディ終了、最初から繰り返し
            this.currentNote = 0;
        }
        
        const note = this.melody[this.currentNote];
        const frequency = this.noteFrequencies[note.note];
        const noteDuration = (note.duration * 60) / this.tempo;
        
        this.playNote(frequency, noteDuration);
        
        this.currentNote++;
        
        if (this.isPlaying) {
            setTimeout(() => this.scheduleNextNote(), noteDuration * 1000);
        }
    }
    
    stop() {
        this.isPlaying = false;
        console.log('🛑 BGMを停止しました');
    }
    
    playSFX(type) {
        if (!this.audioContext || !gameState.settings.sfx) return;
        
        const sounds = {
            move: { freq: 200, duration: 0.1 },
            rotate: { freq: 300, duration: 0.1 },
            drop: { freq: 150, duration: 0.2 },
            line: { freq: 400, duration: 0.3 },
            tetris: { freq: 500, duration: 0.5 },
            gameOver: { freq: 100, duration: 1.0 }
        };
        
        const sound = sounds[type];
        if (sound) {
            this.playNote(sound.freq, sound.duration);
        }
    }
}

// ゲームクラス
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // ピクセルアート風の設定
        this.ctx.imageSmoothingEnabled = false;
        this.nextCtx.imageSmoothingEnabled = false;
        
        this.music = new MusicManager();
        
        // 無限ループ防止フラグ
        this.isGeneratingPiece = false;
        
        console.log('🎮 テトリスゲームを初期化しました');
    }
    
    async init() {
        await this.music.init();
        this.loadSavedData();
        this.setupEventListeners();
        this.updateUI();
        
        // 初期状態では次のピースのみ生成
        this.generateNextPiece();
        this.draw();
        
        console.log('✅ ゲーム初期化完了');
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // UI要素のイベントリスナー
        document.getElementById('bgm-toggle').addEventListener('click', () => this.toggleBGM());
        document.getElementById('sfx-toggle').addEventListener('click', () => this.toggleSFX());
        document.getElementById('speed-select').addEventListener('change', (e) => this.changeSpeed(e.target.value));
        
        console.log('🎛️ イベントリスナーを設定しました');
    }
    
    handleKeyPress(e) {
        if (!gameState.started && e.key.toLowerCase() === 's') {
            this.startGame();
            return;
        }
        
        if (!gameState.started || gameState.gameOver) {
            if (e.key.toLowerCase() === 'r') {
                this.resetGame();
            }
            return;
        }
        
        if (e.key.toLowerCase() === 'p') {
            this.togglePause();
            return;
        }
        
        if (gameState.paused) return;
        
        const actions = {
            'ArrowLeft': () => this.movePiece(-1, 0),
            'ArrowRight': () => this.movePiece(1, 0),
            'ArrowDown': () => this.softDrop(),
            'ArrowUp': () => this.rotatePiece(),
            ' ': () => this.hardDrop(),
            'r': () => this.resetGame()
        };
        
        const action = actions[e.key];
        if (action) {
            e.preventDefault();
            action();
        }
    }
    
    startGame() {
        if (gameState.started) return;
        
        console.log('🚀 ゲーム開始');
        gameState.started = true;
        gameState.gameOver = false;
        gameState.paused = false;
        gameState.stats.startTime = Date.now();
        gameState.stats.gamesPlayed++;
        gameState.lastTime = Date.now();
        gameState.dropCounter = 0;
        
        // 最初のピースをスポーン（nextPieceが既に存在する前提）
        gameState.currentPiece = gameState.nextPiece;
        gameState.currentPiece.x = Math.floor((GAME_CONFIG.BOARD_WIDTH - gameState.currentPiece.shape[0].length) / 2);
        gameState.currentPiece.y = 0;
        
        // 新しいnextPieceを生成
        this.generateNextPiece();
        
        console.log(`🆕 最初のピース: ${gameState.currentPiece.type} at (${gameState.currentPiece.x}, ${gameState.currentPiece.y})`);
        
        // ゲームオーバー判定
        if (this.isCollision(gameState.currentPiece)) {
            this.gameOver();
            return;
        }
        
        this.music.playMelody();
        this.hideStartScreen();
        this.hideGameOverScreen();
        
        // ゲームループ開始
        this.gameLoop();
        
        this.updateRetroMessage('Let\'s play Tetris! 🎮');
    }
    
    resetGame() {
        console.log('🔄 ゲームリセット');
        
        // ゲーム状態をリセット
        gameState.board = gameState.createEmptyBoard();
        gameState.score = 0;
        gameState.lines = 0;
        gameState.level = 1;
        gameState.gameOver = false;
        gameState.paused = false;
        gameState.started = false;
        gameState.dropTime = 0;
        gameState.dropCounter = 0;
        gameState.currentPiece = null;
        
        this.music.stop();
        
        // 新しいnextPieceを生成
        this.generateNextPiece();
        
        this.updateUI();
        this.showStartScreen();
        this.hideGameOverScreen();
        this.hidePauseScreen();
        this.draw();
        
        this.updateRetroMessage('Ready for another round? 🎯');
    }
    
    togglePause() {
        gameState.paused = !gameState.paused;
        
        if (gameState.paused) {
            this.music.stop();
            this.showPauseScreen();
            console.log('⏸️ ゲーム一時停止');
        } else {
            this.music.playMelody();
            this.hidePauseScreen();
            console.log('▶️ ゲーム再開');
        }
    }
    
    spawnPiece() {
        // currentPieceにnextPieceを設定
        gameState.currentPiece = gameState.nextPiece;
        
        // 新しいnextPieceを生成
        this.generateNextPiece();
        
        // currentPieceの位置を設定
        gameState.currentPiece.x = Math.floor((GAME_CONFIG.BOARD_WIDTH - gameState.currentPiece.shape[0].length) / 2);
        gameState.currentPiece.y = 0;
        
        console.log(`🆕 新しいピース: ${gameState.currentPiece.type} at (${gameState.currentPiece.x}, ${gameState.currentPiece.y})`);
        
        // 新しいピースが配置できない場合はゲームオーバー
        if (this.isCollision(gameState.currentPiece)) {
            this.gameOver();
            return false;
        }
        
        return true;
    }
    
    generateNextPiece() {
        // 生成中フラグをチェックして無限ループを防止
        if (this.isGeneratingPiece) {
            console.log('⚠️ ピース生成中のため処理をスキップ');
            return;
        }
        
        this.isGeneratingPiece = true;
        
        const types = Object.keys(TETROMINOS);
        const randomType = types[Math.floor(Math.random() * types.length)];
        gameState.nextPiece = new Tetromino(randomType);
        
        console.log(`🔮 次のピース: ${randomType}`);
        
        // nextPieceキャンバスを更新
        this.drawNextPiece();
        
        this.isGeneratingPiece = false;
    }
    
    movePiece(deltaX, deltaY) {
        const newPiece = gameState.currentPiece.copy();
        newPiece.x += deltaX;
        newPiece.y += deltaY;
        
        if (!this.isCollision(newPiece)) {
            gameState.currentPiece = newPiece;
            this.music.playSFX('move');
            return true;
        }
        
        return false;
    }
    
    rotatePiece() {
        const newPiece = gameState.currentPiece.copy();
        newPiece.shape = newPiece.rotate();
        
        // Wall kick - 回転時の壁当たり調整
        for (let kick = 0; kick < 3; kick++) {
            newPiece.x = gameState.currentPiece.x + kick * (kick % 2 === 0 ? 1 : -1);
            if (!this.isCollision(newPiece)) {
                gameState.currentPiece = newPiece;
                this.music.playSFX('rotate');
                return;
            }
        }
    }
    
    softDrop() {
        if (this.movePiece(0, 1)) {
            gameState.score += GAME_CONFIG.SCORE_VALUES.SOFT_DROP;
            this.updateUI();
        }
    }
    
    hardDrop() {
        let distance = 0;
        while (this.movePiece(0, 1)) {
            distance++;
        }
        
        gameState.score += distance * GAME_CONFIG.SCORE_VALUES.HARD_DROP;
        this.placePiece();
        this.updateUI();
        this.music.playSFX('drop');
    }
    
    isCollision(piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardX = piece.x + x;
                    const boardY = piece.y + y;
                    
                    if (boardX < 0 || boardX >= GAME_CONFIG.BOARD_WIDTH ||
                        boardY >= GAME_CONFIG.BOARD_HEIGHT ||
                        (boardY >= 0 && gameState.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    placePiece() {
        // 現在のピースをボードに配置
        for (let y = 0; y < gameState.currentPiece.shape.length; y++) {
            for (let x = 0; x < gameState.currentPiece.shape[y].length; x++) {
                if (gameState.currentPiece.shape[y][x]) {
                    const boardX = gameState.currentPiece.x + x;
                    const boardY = gameState.currentPiece.y + y;
                    
                    if (boardY >= 0) {
                        gameState.board[boardY][boardX] = gameState.currentPiece.type;
                    }
                }
            }
        }
        
        console.log('📍 ピースを配置しました');
        
        // ライン消去をチェック
        this.clearLines();
        
        // 新しいピースを生成
        if (!this.spawnPiece()) {
            // ゲームオーバーの場合は処理を停止
            return;
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = GAME_CONFIG.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (gameState.board[y].every(cell => cell !== 0)) {
                gameState.board.splice(y, 1);
                gameState.board.unshift(Array(GAME_CONFIG.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // 同じ行を再チェック
            }
        }
        
        if (linesCleared > 0) {
            this.updateScore(linesCleared);
            this.updateLevel();
            gameState.stats.totalLines += linesCleared;
            
            const sfxType = linesCleared === 4 ? 'tetris' : 'line';
            this.music.playSFX(sfxType);
            
            console.log(`✨ ${linesCleared}ライン消去`);
            
            if (linesCleared === 4) {
                this.updateRetroMessage('TETRIS! Amazing! 🎉');
            } else {
                this.updateRetroMessage(`${linesCleared} lines cleared! 🌟`);
            }
        }
    }
    
    updateScore(linesCleared) {
        const scoreValues = [
            0,
            GAME_CONFIG.SCORE_VALUES.SINGLE,
            GAME_CONFIG.SCORE_VALUES.DOUBLE,
            GAME_CONFIG.SCORE_VALUES.TRIPLE,
            GAME_CONFIG.SCORE_VALUES.TETRIS
        ];
        
        const baseScore = scoreValues[linesCleared] || 0;
        gameState.score += baseScore * gameState.level;
        gameState.lines += linesCleared;
    }
    
    updateLevel() {
        const newLevel = Math.floor(gameState.lines / GAME_CONFIG.LINES_PER_LEVEL) + 1;
        if (newLevel > gameState.level) {
            gameState.level = newLevel;
            console.log(`📈 レベルアップ: ${gameState.level}`);
            this.updateRetroMessage(`Level up! ${gameState.level} 🚀`);
        }
    }
    
    gameOver() {
        gameState.gameOver = true;
        gameState.started = false;
        
        this.music.stop();
        this.music.playSFX('gameOver');
        
        // ハイスコア更新
        const highScore = this.getHighScore();
        if (gameState.score > highScore) {
            this.saveHighScore(gameState.score);
            this.updateRetroMessage('New High Score! 👑');
        }
        
        this.showGameOverScreen();
        this.saveStats();
        
        console.log('💀 ゲームオーバー - Score:', gameState.score);
    }
    
    getDropSpeed() {
        const speedMultipliers = {
            slow: 1.5,
            normal: 1.0,
            fast: 0.5
        };
        
        const baseSpeed = Math.max(1000 - (gameState.level - 1) * 100, 50);
        return baseSpeed * speedMultipliers[gameState.settings.speed];
    }
    
    gameLoop() {
        if (!gameState.started || gameState.gameOver || gameState.paused) {
            console.log('🔄 ゲームループ停止:', { started: gameState.started, gameOver: gameState.gameOver, paused: gameState.paused });
            return;
        }
        
        const now = Date.now();
        const deltaTime = now - gameState.lastTime;
        gameState.lastTime = now;
        
        gameState.dropCounter += deltaTime;
        
        if (gameState.dropCounter > this.getDropSpeed()) {
            if (!this.movePiece(0, 1)) {
                // ピースが下に移動できない場合は配置
                console.log('📍 ピース配置処理開始');
                this.placePiece();
            }
            gameState.dropCounter = 0;
        }
        
        this.draw();
        this.updateUI();
        
        // ゲームが継続中の場合のみ次のフレームをリクエスト
        if (gameState.started && !gameState.gameOver && !gameState.paused) {
            requestAnimationFrame(() => this.gameLoop());
        } else {
            console.log('🛑 ゲームループ終了');
        }
    }
    
    draw() {
        // キャンバスクリア
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // グリッド描画
        this.drawGrid();
        
        // ボード描画
        this.drawBoard();
        
        // 現在のピース描画
        if (gameState.currentPiece) {
            this.drawGhostPiece();
            this.drawPiece(gameState.currentPiece);
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= GAME_CONFIG.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * GAME_CONFIG.CELL_SIZE, 0);
            this.ctx.lineTo(x * GAME_CONFIG.CELL_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= GAME_CONFIG.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * GAME_CONFIG.CELL_SIZE);
            this.ctx.lineTo(this.canvas.width, y * GAME_CONFIG.CELL_SIZE);
            this.ctx.stroke();
        }
    }
    
    drawBoard() {
        for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
            for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                const cellType = gameState.board[y][x];
                if (cellType) {
                    this.drawCell(x, y, GAME_CONFIG.COLORS[cellType]);
                }
            }
        }
    }
    
    drawPiece(piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    this.drawCell(piece.x + x, piece.y + y, piece.color);
                }
            }
        }
    }
    
    drawGhostPiece() {
        if (!gameState.currentPiece) return;
        
        const ghostPiece = gameState.currentPiece.copy();
        while (!this.isCollision(ghostPiece)) {
            ghostPiece.y++;
        }
        ghostPiece.y--;
        
        for (let y = 0; y < ghostPiece.shape.length; y++) {
            for (let x = 0; x < ghostPiece.shape[y].length; x++) {
                if (ghostPiece.shape[y][x]) {
                    this.drawCell(ghostPiece.x + x, ghostPiece.y + y, GAME_CONFIG.COLORS.GHOST, true);
                }
            }
        }
    }
    
    drawCell(x, y, color, isGhost = false) {
        const pixelX = x * GAME_CONFIG.CELL_SIZE;
        const pixelY = y * GAME_CONFIG.CELL_SIZE;
        
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = isGhost ? 0.3 : 1.0;
        this.ctx.fillRect(pixelX + 1, pixelY + 1, GAME_CONFIG.CELL_SIZE - 2, GAME_CONFIG.CELL_SIZE - 2);
        
        // レトロな3D効果
        if (!isGhost) {
            // ハイライト
            this.ctx.fillStyle = this.lightenColor(color, 40);
            this.ctx.fillRect(pixelX + 1, pixelY + 1, GAME_CONFIG.CELL_SIZE - 2, 3);
            this.ctx.fillRect(pixelX + 1, pixelY + 1, 3, GAME_CONFIG.CELL_SIZE - 2);
            
            // シャドウ
            this.ctx.fillStyle = this.darkenColor(color, 40);
            this.ctx.fillRect(pixelX + GAME_CONFIG.CELL_SIZE - 4, pixelY + 1, 3, GAME_CONFIG.CELL_SIZE - 2);
            this.ctx.fillRect(pixelX + 1, pixelY + GAME_CONFIG.CELL_SIZE - 4, GAME_CONFIG.CELL_SIZE - 2, 3);
        }
        
        this.ctx.globalAlpha = 1.0;
    }
    
    drawNextPiece() {
        if (!gameState.nextPiece || this.isGeneratingPiece) return;
        
        this.nextCtx.fillStyle = '#000000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const cellSize = 15;
        const offsetX = (this.nextCanvas.width - gameState.nextPiece.shape[0].length * cellSize) / 2;
        const offsetY = (this.nextCanvas.height - gameState.nextPiece.shape.length * cellSize) / 2;
        
        for (let y = 0; y < gameState.nextPiece.shape.length; y++) {
            for (let x = 0; x < gameState.nextPiece.shape[y].length; x++) {
                if (gameState.nextPiece.shape[y][x]) {
                    this.nextCtx.fillStyle = gameState.nextPiece.color;
                    this.nextCtx.fillRect(
                        offsetX + x * cellSize,
                        offsetY + y * cellSize,
                        cellSize - 1,
                        cellSize - 1
                    );
                }
            }
        }
    }
    
    // ユーティリティメソッド
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }
    
    // UI更新メソッド
    updateUI() {
        document.getElementById('current-score').textContent = gameState.score.toString().padStart(6, '0');
        document.getElementById('high-score').textContent = this.getHighScore().toString().padStart(6, '0');
        document.getElementById('lines-cleared').textContent = gameState.lines;
        document.getElementById('current-level').textContent = gameState.level;
        
        // 統計更新
        document.getElementById('games-played').textContent = gameState.stats.gamesPlayed;
        document.getElementById('best-score').textContent = this.getHighScore();
        document.getElementById('total-lines').textContent = gameState.stats.totalLines;
        
        // プレイ時間更新
        if (gameState.started && !gameState.paused) {
            const playTime = Math.floor((Date.now() - gameState.stats.startTime) / 1000);
            const minutes = Math.floor(playTime / 60);
            const seconds = playTime % 60;
            document.getElementById('play-time').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    // 画面表示制御
    showStartScreen() {
        document.getElementById('start-screen').classList.remove('hidden');
    }
    
    hideStartScreen() {
        document.getElementById('start-screen').classList.add('hidden');
    }
    
    showPauseScreen() {
        document.getElementById('pause-screen').classList.remove('hidden');
    }
    
    hidePauseScreen() {
        document.getElementById('pause-screen').classList.add('hidden');
    }
    
    showGameOverScreen() {
        document.getElementById('final-score').textContent = gameState.score;
        document.getElementById('game-over-screen').classList.remove('hidden');
    }
    
    hideGameOverScreen() {
        document.getElementById('game-over-screen').classList.add('hidden');
    }
    
    // 設定制御
    toggleBGM() {
        gameState.settings.bgm = !gameState.settings.bgm;
        const button = document.getElementById('bgm-toggle');
        button.textContent = gameState.settings.bgm ? 'ON' : 'OFF';
        button.className = gameState.settings.bgm ? 'px-2 py-1 bg-retro-green text-black rounded text-xs' : 
                                                   'px-2 py-1 bg-gray-600 text-white rounded text-xs';
        
        if (!gameState.settings.bgm) {
            this.music.stop();
        } else if (gameState.started && !gameState.paused) {
            this.music.playMelody();
        }
        
        this.saveSettings();
    }
    
    toggleSFX() {
        gameState.settings.sfx = !gameState.settings.sfx;
        const button = document.getElementById('sfx-toggle');
        button.textContent = gameState.settings.sfx ? 'ON' : 'OFF';
        button.className = gameState.settings.sfx ? 'px-2 py-1 bg-retro-green text-black rounded text-xs' : 
                                                   'px-2 py-1 bg-gray-600 text-white rounded text-xs';
        
        this.saveSettings();
    }
    
    changeSpeed(speed) {
        gameState.settings.speed = speed;
        this.saveSettings();
        console.log('⚡ 速度変更:', speed);
    }
    
    updateRetroMessage(message) {
        document.getElementById('retro-message').innerHTML = message;
        
        // メッセージを一定時間後にデフォルトに戻す
        setTimeout(() => {
            document.getElementById('retro-message').innerHTML = 
                'Welcome to the 80s!<br>🎮 Insert coin to play! 🎮';
        }, 3000);
    }
    
    // データ保存・読み込み
    saveHighScore(score) {
        localStorage.setItem('tetris-highscore', score.toString());
    }
    
    getHighScore() {
        return parseInt(localStorage.getItem('tetris-highscore') || '0');
    }
    
    saveStats() {
        localStorage.setItem('tetris-stats', JSON.stringify(gameState.stats));
    }
    
    loadStats() {
        const saved = localStorage.getItem('tetris-stats');
        if (saved) {
            gameState.stats = { ...gameState.stats, ...JSON.parse(saved) };
        }
    }
    
    saveSettings() {
        localStorage.setItem('tetris-settings', JSON.stringify(gameState.settings));
    }
    
    loadSettings() {
        const saved = localStorage.getItem('tetris-settings');
        if (saved) {
            gameState.settings = { ...gameState.settings, ...JSON.parse(saved) };
            
            // UI更新
            document.getElementById('bgm-toggle').textContent = gameState.settings.bgm ? 'ON' : 'OFF';
            document.getElementById('sfx-toggle').textContent = gameState.settings.sfx ? 'ON' : 'OFF';
            document.getElementById('speed-select').value = gameState.settings.speed;
        }
    }
    
    loadSavedData() {
        this.loadStats();
        this.loadSettings();
    }
}

// グローバル変数
let gameState;
let game;

// ゲーム初期化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎯 DOM読み込み完了 - ゲーム初期化開始');
    
    gameState = new GameState();
    game = new TetrisGame();
    
    await game.init();
    
    console.log('🎉 レトロテトリス初期化完了！');
});

// ウィンドウフォーカス時のAudioContext再開
window.addEventListener('focus', () => {
    if (game && game.music && game.music.audioContext && game.music.audioContext.state === 'suspended') {
        game.music.audioContext.resume();
        console.log('🔊 AudioContextを再開しました');
    }
});