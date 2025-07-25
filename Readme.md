# 🎮 TETRIS - 80年代レトロスタイル

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> 🕹️ **GitHub Copilot** で開発された本格的な80年代レトロスタイルテトリスゲーム

## 🎯 概要

このリポジトリには、80年代のレトロゲームを彷彿とさせるドット絵スタイルのテトリスゲームが含まれています。GitHub Copilot を活用して開発され、モダンなWeb技術とクラシックなゲームデザインを融合させた作品です。

### ✨ 主な特徴

- 🎮 **本格的なテトリスゲーム** - 7種類のテトロミノと完全なゲームロジック
- 🎵 **コロベイニキBGM** - Web Audio APIによる本格的な楽曲演奏
- 🎨 **80年代レトロデザイン** - ネオンカラーとドット絵風スタイル
- 📱 **レスポンシブ対応** - あらゆるデバイスで楽しめる
- 🏆 **ハイスコア機能** - ローカルストレージでスコア保存

## 🎮 今すぐプレイ！

### [👆 ここをクリックしてゲームを開始 👆](src/index.html)

## 🎯 ゲーム機能

### 🕹️ ゲームプレイ

- **7種類のテトロミノ** - I, O, T, S, Z, J, L ピース
- **スムーズな操作** - 矢印キーによる直感的な操作
- **ライン消去** - 複数ライン同時消去でコンボボーナス
- **レベルシステム** - 難易度の段階的上昇
- **スコアシステム** - ハイスコア保存機能

### 🎵 音楽・効果音

- **コロベイニキBGM** - Web Audio APIによる高品質演奏
- **効果音** - ライン消去、ゲームオーバー、操作音
- **音量制御** - BGMと効果音の個別ON/OFF

### 🎨 ビジュアル

- **80年代レトロデザイン** - ネオンカラーとドット絵風
- **アニメーション** - スムーズなピース移動とエフェクト
- **レスポンシブ** - PC・タブレット・スマートフォン対応

## 🛠️ 技術スタック

| 技術                                     | バージョン | 用途                         |
| ---------------------------------------- | ---------- | ---------------------------- |
| HTML5                                    | Latest     | ゲームUI構造                 |
| CSS3                                     | Latest     | レトロスタイリング           |
| [Tailwind CSS](https://tailwindcss.com/) | 3.x (CDN)  | ユーティリティファースト CSS |
| JavaScript (ES6+)                       | Latest     | ゲームロジック・音楽システム |
| Web Audio API                            | Latest     | BGM・効果音生成              |
| Canvas API                               | Latest     | ゲーム画面描画               |

## 📁 プロジェクト構造

```
📦 20250725-demo/
├── 📄 README.md                 # プロジェクト概要
├── 📁 docs/                     # ドキュメント
├── 📁 src/                      # アプリケーションソース
│   ├── 📄 index.html           # メインゲームページ
│   ├── 📁 css/                 # スタイルシート
│   │   └── 📄 styles.css       # カスタムCSS
│   └── 📁 js/                  # JavaScript
│       └── 📄 script.js        # ゲームロジック
└── 📄 .github/
    └── 📄 copilot-instructions.md
```

## 🎮 操作方法

### ⌨️ キーボード操作

| キー | 動作 |
|------|------|
| `←` `→` | ピースを左右に移動 |
| `↑` | ピースを回転 |
| `↓` | ピースを高速落下 |
| `SPACE` | ピースを最下段まで即座に落下 |
| `S` | ゲーム開始 |
| `P` | 一時停止/再開 |
| `R` | ゲームリセット |

### 🖱️ マウス操作

- **ゲーム制御ボタン** - 開始、一時停止、リセット
- **音楽設定** - BGM・効果音のON/OFF切り替え

## 🚀 クイックスタート

### 前提条件

- 📌 モダンな Web ブラウザ (Chrome 90+, Firefox 88+, Safari 14+)
- 📌 Web Audio API サポート（音楽機能用）

### プレイ方法

1. **ゲームアクセス**
   ```
   📂 src/index.html をブラウザで開く
   ```

2. **ゲーム開始**
   - `S` キーを押すか「ゲーム開始」ボタンをクリック
   - BGMが自動で再生開始（ブラウザの自動再生ポリシーにより、最初のユーザー操作後）

3. **ゲームプレイ**
   - 矢印キーでテトロミノを操作
   - ライン消去でスコア獲得
   - レベルアップで難易度上昇

4. **設定調整**
   - BGM・効果音のON/OFF切り替え
   - 一時停止機能でゲーム中断可能

## 🎵 音楽について

このゲームではコロベイニキ（ロシア民謡）のメロディーがBGMとして流れます。Web Audio APIを使用してプログラムで生成された音楽で、以下の特徴があります：

- **完全なワンコーラス演奏**
- **レトロな8bit風音色**
- **ループ再生**
- **リアルタイム生成**

## 🏆 スコアシステム

### 得点計算

| ライン数 | 基本スコア |
|----------|------------|
| 1ライン  | 100点      |
| 2ライン  | 300点      |
| 3ライン  | 500点      |
| 4ライン  | 800点      |

- **レベルボーナス**: 基本スコア × 現在レベル
- **コンボボーナス**: 連続消去時に1.5倍
- **ハイスコア**: ローカルストレージに自動保存

## 🎨 デザインコンセプト

### 80年代レトロスタイル

- **ネオンカラー**: シアン、マゼンタ、イエローの鮮烈な色彩
- **ドット絵風**: ピクセルパーフェクトなレンダリング
- **グロウエフェクト**: テキストとボーダーの発光表現
- **モノスペースフォント**: Orbitronフォントによるサイバー感

### レスポンシブデザイン

このテトリスゲームは以下の画面サイズに最適化されています：

- 📱 **モバイル**: 320px〜768px（タッチ操作対応予定）
- 📊 **タブレット**: 768px〜1024px
- 💻 **デスクトップ**: 1024px 以上

## 🔧 技術的な特徴

### ゲームエンジン

- **オブジェクト指向設計** - クラスベースの構造化コード
- **ゲームループ** - 60fps での滑らかな描画
- **状態管理** - 一元化されたゲーム状態
- **イベント駆動** - キーボード・マウス入力の統合

### 音楽システム

- **Web Audio API** - 低遅延・高品質音声
- **リアルタイム合成** - プログラム生成による音楽
- **周波数制御** - 正確な音程とタイミング

### データ永続化

- **LocalStorage** - ハイスコア・設定の保存
- **JSON形式** - 構造化データ管理

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を作成

### 改善アイデア

- **タッチ操作対応** - モバイル向けジェスチャー操作
- **パーティクルエフェクト** - ライン消去時のビジュアル強化
- **追加ゲームモード** - スピードモード、エンドレスモード
- **ベースライン追加** - コロベイニキの和音・ベース音
- **レトロフィルター** - CRTモニター風の画面エフェクト

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 🆘 サポートとリソース

- 📖 **ドキュメント**: [プロジェクトWiki](../../wiki)
- 💬 **コミュニティ**: [GitHub Discussions](../../discussions)
- 🐛 **Issue 報告**: [Issues](../../issues)
- 🎮 **プレイレポート**: ハイスコアやプレイ体験をIssueで共有歓迎！

## 📊 プロジェクト統計

![GitHub stars](https://img.shields.io/github/stars/tokawa-ms/20250725-demo?style=social)
![GitHub forks](https://img.shields.io/github/forks/tokawa-ms/20250725-demo?style=social)
![GitHub issues](https://img.shields.io/github/issues/tokawa-ms/20250725-demo)

---

<div align="center">
  <strong>🎮 Let's Play TETRIS! 🕹️</strong><br>
  Made with ❤️ and GitHub Copilot<br><br>
  
  <img src="https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif" width="200" alt="Tetris Animation">
  
  <br><br>
  <em>「テトリスは永遠に不滅です」</em>
</div>
