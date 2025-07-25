// テトリスゲーム - 80年代レトロスタイル
console.log('🎮 テトリスゲーム初期化開始');

// ゲーム設定
const GAME_CONFIG = {
    BOARD_WIDTH: 10,
    BOARD_HEIGHT: 20,
    CELL_SIZE: 20,
    INITIAL_FALL_SPEED: 1000, // ミリ秒
    LINE_CLEAR_SCORE: [0, 100, 300, 500, 800], // 0,1,2,3,4ライン消去
    LEVEL_SPEED_MULTIPLIER: 0.9,
    COMBO_MULTIPLIER: 1.5
};

// テトロミノの形状定義
const TETROMINOS = {
    I: {
        shape: [
            [0,0,0,0],
            [1,1,1,1],
            [0,0,0,0],
            [0,0,0,0]
        ],
        color: '#00ffff' // cyan
    },
    O: {
        shape: [
            [1,1],
            [1,1]
        ],
        color: '#ffff00' // yellow
    },
    T: {
        shape: [
            [0,1,0],
            [1,1,1],
            [0,0,0]
        ],
        color: '#ff00ff' // purple
    },
    S: {
        shape: [
            [0,1,1],
            [1,1,0],
            [0,0,0]
        ],
        color: '#00ff00' // green
    },
    Z: {
        shape: [
            [1,1,0],
            [0,1,1],
            [0,0,0]
        ],
        color: '#ff0000' // red
    },
    J: {
        shape: [
            [1,0,0],
            [1,1,1],
            [0,0,0]
        ],
        color: '#0080ff' // blue
    },
    L: {
        shape: [
            [0,0,1],
            [1,1,1],
            [0,0,0]
        ],
        color: '#ff8000' // orange
    }
};

// ゲーム状態管理
class GameState {
    constructor() {
        this.board = this.createEmptyBoard();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.isPlaying = false;
        this.isPaused = false;
        this.fallSpeed = GAME_CONFIG.INITIAL_FALL_SPEED;
        this.lastFallTime = 0;
        this.combo = 0;
        
        console.log('🎯 ゲーム状態初期化完了');
    }
    
    createEmptyBoard() {
        return Array(GAME_CONFIG.BOARD_HEIGHT).fill(null)
               .map(() => Array(GAME_CONFIG.BOARD_WIDTH).fill(0));
    }
    
    reset() {
        console.log('🔄 ゲームリセット');
        this.board = this.createEmptyBoard();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.isPlaying = false;
        this.isPaused = false;
        this.fallSpeed = GAME_CONFIG.INITIAL_FALL_SPEED;
        this.lastFallTime = 0;
        this.combo = 0;
        this.updateDisplay();
    }
    
    updateDisplay() {
        document.getElementById('currentScore').textContent = this.score.toLocaleString();
        document.getElementById('linesCleared').textContent = this.lines;
        document.getElementById('level').textContent = this.level;
        
        const highScore = localStorage.getItem('tetris-high-score') || 0;
        document.getElementById('highScore').textContent = parseInt(highScore).toLocaleString();
    }
    
    saveHighScore() {
        const currentHighScore = parseInt(localStorage.getItem('tetris-high-score') || 0);
        if (this.score > currentHighScore) {
            localStorage.setItem('tetris-high-score', this.score.toString());
            console.log('🏆 新ハイスコア:', this.score);
            return true;
        }
        return false;
    }
}

// テトロミノクラス
class Tetromino {
    constructor(type) {
        this.type = type;
        this.shape = JSON.parse(JSON.stringify(TETROMINOS[type].shape));
        this.color = TETROMINOS[type].color;
        this.x = Math.floor(GAME_CONFIG.BOARD_WIDTH / 2) - Math.floor(this.shape[0].length / 2);
        this.y = 0;
        
        console.log(`🧩 新しいテトロミノ生成: ${type}`);
    }
    
    rotate() {
        const rotated = this.shape[0].map((_, i) => 
            this.shape.map(row => row[row.length - 1 - i])
        );
        return rotated;
    }
    
    canMove(board, dx, dy, newShape = null) {
        const shape = newShape || this.shape;
        const newX = this.x + dx;
        const newY = this.y + dy;
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    
                    if (boardX < 0 || boardX >= GAME_CONFIG.BOARD_WIDTH ||
                        boardY >= GAME_CONFIG.BOARD_HEIGHT ||
                        (boardY >= 0 && board[boardY][boardX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    
    tryRotate(board) {
        const rotatedShape = this.rotate();
        if (this.canMove(board, 0, 0, rotatedShape)) {
            this.shape = rotatedShape;
            console.log('🔄 テトロミノ回転成功');
            return true;
        }
        console.log('❌ テトロミノ回転失敗');
        return false;
    }
}

// 音楽システム
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.isMusicEnabled = true;
        this.isSfxEnabled = true;
        this.currentMelodyIndex = 0;
        this.isPlayingMelody = false;
        
        // コロベイニキのメロディデータ（周波数とデュレーション）
        this.korobeinikiMelody = [
            // E四分,B↓八分,C八分,D四分,C八分,B↓八分,
            {freq: 329.63, duration: 500}, // E
            {freq: 246.94, duration: 250}, // B↓
            {freq: 261.63, duration: 250}, // C
            {freq: 293.66, duration: 500}, // D
            {freq: 261.63, duration: 250}, // C
            {freq: 246.94, duration: 250}, // B↓
            
            // A↓四分,A↓八分,C八分,E四分,D八分,C八分,
            {freq: 220.00, duration: 500}, // A↓
            {freq: 220.00, duration: 250}, // A↓
            {freq: 261.63, duration: 250}, // C
            {freq: 329.63, duration: 500}, // E
            {freq: 293.66, duration: 250}, // D
            {freq: 261.63, duration: 250}, // C
            
            // B↓四分,B↓八分,C八分,D四分,E四分,
            {freq: 246.94, duration: 500}, // B↓
            {freq: 246.94, duration: 250}, // B↓
            {freq: 261.63, duration: 250}, // C
            {freq: 293.66, duration: 500}, // D
            {freq: 329.63, duration: 500}, // E
            
            // C四分,A↓四分,A↓四分,休み四分
            {freq: 261.63, duration: 500}, // C
            {freq: 220.00, duration: 500}, // A↓
            {freq: 220.00, duration: 500}, // A↓
            {freq: 0, duration: 500}, // 休み
            
            // 休み八分,D四分,F八分,A四分,G八分,F八分,
            {freq: 0, duration: 250}, // 休み
            {freq: 293.66, duration: 500}, // D
            {freq: 349.23, duration: 250}, // F
            {freq: 440.00, duration: 500}, // A
            {freq: 392.00, duration: 250}, // G
            {freq: 349.23, duration: 250}, // F
            
            // E四分,休み八分,C八分,E四分,D八分,C八分,
            {freq: 329.63, duration: 500}, // E
            {freq: 0, duration: 250}, // 休み
            {freq: 261.63, duration: 250}, // C
            {freq: 329.63, duration: 500}, // E
            {freq: 293.66, duration: 250}, // D
            {freq: 261.63, duration: 250}, // C
            
            // B↓四分,B↓八分,C八分,D四分,E四分
            {freq: 246.94, duration: 500}, // B↓
            {freq: 246.94, duration: 250}, // B↓
            {freq: 261.63, duration: 250}, // C
            {freq: 293.66, duration: 500}, // D
            {freq: 329.63, duration: 500}, // E
            
            // C四分,A↓四分,A↓二分
            {freq: 261.63, duration: 500}, // C
            {freq: 220.00, duration: 500}, // A↓
            {freq: 220.00, duration: 1000}, // A↓二分
        ];
        
        this.initAudioContext();
        console.log('🎵 音楽システム初期化完了');
    }
    
    async initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🎼 AudioContext初期化成功');
        } catch (error) {
            console.error('❌ AudioContext初期化失敗:', error);
        }
    }
    
    async playNote(frequency, duration, volume = 0.1) {
        if (!this.audioContext || !this.isMusicEnabled) return;
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'square'; // レトロな音色
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    async playMelody() {
        if (!this.isMusicEnabled || this.isPlayingMelody) return;
        
        this.isPlayingMelody = true;
        console.log('🎵 コロベイニキ演奏開始');
        
        for (let i = 0; i < this.korobeinikiMelody.length; i++) {
            if (!this.isMusicEnabled || !this.isPlayingMelody) break;
            
            const note = this.korobeinikiMelody[i];
            if (note.freq > 0) {
                await this.playNote(note.freq, note.duration, 0.05);
            }
            
            await new Promise(resolve => setTimeout(resolve, note.duration));
        }
        
        this.isPlayingMelody = false;
        
        // ループ再生
        if (this.isMusicEnabled && gameState.isPlaying && !gameState.isPaused) {
            setTimeout(() => this.playMelody(), 1000);
        }
    }
    
    async playSfx(type) {
        if (!this.isSfxEnabled || !this.audioContext) return;
        
        switch (type) {
            case 'lineClear':
                await this.playNote(440, 100);
                await this.playNote(523, 100);
                await this.playNote(659, 200);
                console.log('🔊 ライン消去効果音再生');
                break;
            case 'gameOver':
                await this.playNote(220, 500);
                await this.playNote(196, 500);
                await this.playNote(175, 1000);
                console.log('🔊 ゲームオーバー効果音再生');
                break;
            case 'rotate':
                await this.playNote(440, 50);
                break;
            case 'drop':
                await this.playNote(220, 30);
                break;
        }
    }
    
    toggleMusic() {
        this.isMusicEnabled = !this.isMusicEnabled;
        if (!this.isMusicEnabled) {
            this.isPlayingMelody = false;
        } else if (gameState.isPlaying && !gameState.isPaused) {
            this.playMelody();
        }
        console.log('🎵 BGM:', this.isMusicEnabled ? 'ON' : 'OFF');
        return this.isMusicEnabled;
    }
    
    toggleSfx() {
        this.isSfxEnabled = !this.isSfxEnabled;
        console.log('🔊 効果音:', this.isSfxEnabled ? 'ON' : 'OFF');
        return this.isSfxEnabled;
    }
}

// レンダリングシステム
class Renderer {
    constructor() {
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPiece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        console.log('🖼️ レンダリングシステム初期化完了');
    }
    
    clear() {
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    clearNext() {
        this.nextCtx.fillStyle = '#0a0a0a';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    }
    
    drawCell(x, y, color, ctx = this.ctx) {
        const cellSize = GAME_CONFIG.CELL_SIZE;
        
        // メインカラーで塗りつぶし
        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        
        // ボーダーでレトロ感を演出
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        
        // 内側にも薄いボーダー
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
    }
    
    drawBoard(board) {
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                if (board[y][x]) {
                    this.drawCell(x, y, this.getCellColor(board[y][x]));
                }
            }
        }
    }
    
    drawTetromino(tetromino) {
        if (!tetromino) return;
        
        for (let y = 0; y < tetromino.shape.length; y++) {
            for (let x = 0; x < tetromino.shape[y].length; x++) {
                if (tetromino.shape[y][x]) {
                    this.drawCell(tetromino.x + x, tetromino.y + y, tetromino.color);
                }
            }
        }
    }
    
    drawNextPiece(tetromino) {
        this.clearNext();
        if (!tetromino) return;
        
        const offsetX = (this.nextCanvas.width / GAME_CONFIG.CELL_SIZE - tetromino.shape[0].length) / 2;
        const offsetY = (this.nextCanvas.height / GAME_CONFIG.CELL_SIZE - tetromino.shape.length) / 2;
        
        for (let y = 0; y < tetromino.shape.length; y++) {
            for (let x = 0; x < tetromino.shape[y].length; x++) {
                if (tetromino.shape[y][x]) {
                    this.drawCell(offsetX + x, offsetY + y, tetromino.color, this.nextCtx);
                }
            }
        }
    }
    
    getCellColor(cellValue) {
        const colors = ['#000000', '#00ffff', '#ffff00', '#ff00ff', '#00ff00', '#ff0000', '#0080ff', '#ff8000'];
        return colors[cellValue] || '#ffffff';
    }
    
    render(gameState) {
        this.clear();
        this.drawBoard(gameState.board);
        this.drawTetromino(gameState.currentPiece);
        this.drawNextPiece(gameState.nextPiece);
    }
}

// ゲームロジック
class TetrisGame {
    constructor() {
        this.gameState = new GameState();
        this.renderer = new Renderer();
        this.audioSystem = new AudioSystem();
        this.gameLoop = null;
        
        this.initializeEventListeners();
        this.gameState.updateDisplay();
        
        console.log('🎮 テトリスゲーム初期化完了');
    }
    
    initializeEventListeners() {
        // キーボードイベント
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // ボタンイベント
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        
        document.getElementById('musicToggle').addEventListener('click', () => {
            const isEnabled = this.audioSystem.toggleMusic();
            document.getElementById('musicToggle').textContent = `BGM: ${isEnabled ? 'ON' : 'OFF'}`;
        });
        
        document.getElementById('sfxToggle').addEventListener('click', () => {
            const isEnabled = this.audioSystem.toggleSfx();
            document.getElementById('sfxToggle').textContent = `効果音: ${isEnabled ? 'ON' : 'OFF'}`;
        });
        
        console.log('⌨️ イベントリスナー初期化完了');
    }
    
    handleKeyPress(e) {
        if (!this.gameState.isPlaying || this.gameState.isPaused) {
            if (e.key === 's' || e.key === 'S') this.startGame();
            if (e.key === 'p' || e.key === 'P') this.togglePause();
            if (e.key === 'r' || e.key === 'R') this.resetGame();
            return;
        }
        
        switch (e.key) {
            case 'ArrowLeft':
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
            case ' ':
                this.dropPiece();
                e.preventDefault();
                break;
            case 'p':
            case 'P':
                this.togglePause();
                break;
            case 'r':
            case 'R':
                this.resetGame();
                break;
        }
    }
    
    startGame() {
        console.log('🚀 ゲーム開始');
        this.gameState.isPlaying = true;
        this.gameState.isPaused = false;
        this.generateNextPiece();
        this.spawnNewPiece();
        this.updateGameStatus('プレイ中');
        
        if (this.audioSystem.isMusicEnabled) {
            this.audioSystem.playMelody();
        }
        
        this.gameLoop = setInterval(() => this.update(), 16); // 60fps
    }
    
    togglePause() {
        if (!this.gameState.isPlaying) return;
        
        this.gameState.isPaused = !this.gameState.isPaused;
        console.log('⏸️ ポーズ切り替え:', this.gameState.isPaused);
        
        this.updateGameStatus(this.gameState.isPaused ? '一時停止中' : 'プレイ中');
        
        if (this.gameState.isPaused) {
            this.audioSystem.isPlayingMelody = false;
        } else if (this.audioSystem.isMusicEnabled) {
            this.audioSystem.playMelody();
        }
    }
    
    resetGame() {
        console.log('🔄 ゲームリセット');
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        this.gameState.reset();
        this.renderer.clear();
        this.renderer.clearNext();
        this.updateGameStatus('待機中');
        this.audioSystem.isPlayingMelody = false;
        
        document.getElementById('gameOverModal').classList.add('hidden');
    }
    
    restartGame() {
        this.resetGame();
        this.startGame();
    }
    
    generateNextPiece() {
        const types = Object.keys(TETROMINOS);
        const randomType = types[Math.floor(Math.random() * types.length)];
        this.gameState.nextPiece = new Tetromino(randomType);
        console.log('🎲 次のピース生成:', randomType);
    }
    
    spawnNewPiece() {
        if (!this.gameState.nextPiece) {
            this.generateNextPiece();
        }
        
        this.gameState.currentPiece = this.gameState.nextPiece;
        this.generateNextPiece();
        
        // ゲームオーバー判定
        if (!this.gameState.currentPiece.canMove(this.gameState.board, 0, 0)) {
            this.gameOver();
            return;
        }
        
        console.log('🧩 新しいピーススポーン:', this.gameState.currentPiece.type);
    }
    
    movePiece(dx, dy) {
        if (!this.gameState.currentPiece) return;
        
        if (this.gameState.currentPiece.canMove(this.gameState.board, dx, dy)) {
            this.gameState.currentPiece.move(dx, dy);
            if (dy > 0) {
                this.audioSystem.playSfx('drop');
            }
            return true;
        }
        return false;
    }
    
    rotatePiece() {
        if (!this.gameState.currentPiece) return;
        
        if (this.gameState.currentPiece.tryRotate(this.gameState.board)) {
            this.audioSystem.playSfx('rotate');
        }
    }
    
    dropPiece() {
        while (this.movePiece(0, 1)) {
            // ピースが底に着くまで移動
        }
        this.placePiece();
    }
    
    placePiece() {
        if (!this.gameState.currentPiece) return;
        
        // ピースをボードに固定
        for (let y = 0; y < this.gameState.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.gameState.currentPiece.shape[y].length; x++) {
                if (this.gameState.currentPiece.shape[y][x]) {
                    const boardY = this.gameState.currentPiece.y + y;
                    const boardX = this.gameState.currentPiece.x + x;
                    
                    if (boardY >= 0) {
                        this.gameState.board[boardY][boardX] = this.getColorIndex(this.gameState.currentPiece.color);
                    }
                }
            }
        }
        
        // ライン消去チェック
        const clearedLines = this.clearLines();
        if (clearedLines > 0) {
            this.audioSystem.playSfx('lineClear');
            this.updateScore(clearedLines);
        }
        
        // 新しいピーススポーン
        this.spawnNewPiece();
    }
    
    clearLines() {
        let clearedLines = 0;
        
        for (let y = this.gameState.board.length - 1; y >= 0; y--) {
            if (this.gameState.board[y].every(cell => cell !== 0)) {
                this.gameState.board.splice(y, 1);
                this.gameState.board.unshift(Array(GAME_CONFIG.BOARD_WIDTH).fill(0));
                clearedLines++;
                y++; // 同じ行を再チェック
            }
        }
        
        if (clearedLines > 0) {
            console.log(`✨ ${clearedLines}ライン消去`);
        }
        
        return clearedLines;
    }
    
    updateScore(clearedLines) {
        const baseScore = GAME_CONFIG.LINE_CLEAR_SCORE[clearedLines] || 0;
        const levelMultiplier = this.gameState.level;
        const comboMultiplier = this.gameState.combo > 0 ? GAME_CONFIG.COMBO_MULTIPLIER : 1;
        
        const scoreIncrease = Math.floor(baseScore * levelMultiplier * comboMultiplier);
        this.gameState.score += scoreIncrease;
        this.gameState.lines += clearedLines;
        
        // レベルアップ判定
        const newLevel = Math.floor(this.gameState.lines / 10) + 1;
        if (newLevel > this.gameState.level) {
            this.gameState.level = newLevel;
            this.gameState.fallSpeed = Math.max(100, 
                GAME_CONFIG.INITIAL_FALL_SPEED * Math.pow(GAME_CONFIG.LEVEL_SPEED_MULTIPLIER, this.gameState.level - 1)
            );
            console.log('📈 レベルアップ!', this.gameState.level);
        }
        
        this.gameState.combo = clearedLines > 0 ? this.gameState.combo + 1 : 0;
        this.gameState.updateDisplay();
        
        console.log(`💯 スコア更新: +${scoreIncrease} (合計: ${this.gameState.score})`);
    }
    
    getColorIndex(color) {
        const colorMap = {
            '#00ffff': 1, // cyan - I
            '#ffff00': 2, // yellow - O
            '#ff00ff': 3, // purple - T
            '#00ff00': 4, // green - S
            '#ff0000': 5, // red - Z
            '#0080ff': 6, // blue - J
            '#ff8000': 7  // orange - L
        };
        return colorMap[color] || 1;
    }
    
    update() {
        if (!this.gameState.isPlaying || this.gameState.isPaused) return;
        
        const currentTime = Date.now();
        
        // 自動落下処理
        if (currentTime - this.gameState.lastFallTime > this.gameState.fallSpeed) {
            if (!this.movePiece(0, 1)) {
                this.placePiece();
            }
            this.gameState.lastFallTime = currentTime;
        }
        
        this.renderer.render(this.gameState);
    }
    
    gameOver() {
        console.log('💀 ゲームオーバー');
        this.gameState.isPlaying = false;
        this.audioSystem.isPlayingMelody = false;
        this.audioSystem.playSfx('gameOver');
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        // ハイスコア更新チェック
        const isNewHighScore = this.gameState.saveHighScore();
        
        // ゲームオーバー画面表示
        document.getElementById('finalScore').textContent = this.gameState.score.toLocaleString();
        document.getElementById('finalLines').textContent = this.gameState.lines;
        
        if (isNewHighScore) {
            document.getElementById('newHighScore').classList.remove('hidden');
        } else {
            document.getElementById('newHighScore').classList.add('hidden');
        }
        
        document.getElementById('gameOverModal').classList.remove('hidden');
        this.updateGameStatus('ゲームオーバー');
        this.gameState.updateDisplay();
    }
    
    updateGameStatus(status) {
        document.getElementById('gameStatus').textContent = status;
        console.log('🎯 ゲーム状態:', status);
    }
}

// ゲームインスタンス
let gameState, tetrisGame;

// ページ読み込み完了時にゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 ページ読み込み完了');
    tetrisGame = new TetrisGame();
    gameState = tetrisGame.gameState;
    
    // 初期状態をレンダリング
    tetrisGame.renderer.render(gameState);
    tetrisGame.updateGameStatus('ゲーム開始を待機中 - Sキーで開始');
    
    console.log('🎮 テトリスゲーム準備完了!');
});

console.log('📋 テトリスゲームスクリプト読み込み完了');