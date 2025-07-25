# 🕹️ レトロテトリス - 80年代風パズルゲーム

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **80年代レトロゲーム風のブラウザテトリス** - コロベイニキのBGM付き、ピクセルアート風ビジュアルで蘇る懐かしのパズルゲーム

## 🎮 ゲームをプレイする

**[▶️ ゲームを開始する - src/index.html](./src/index.html)**

ブラウザで上記リンクをクリックするか、`src/index.html`ファイルを直接開いてプレイできます。

## ✨ 特徴

- 🎵 **本格BGM**: コロベイニキのメロディをWeb Audio APIで完全再現
- 🎨 **レトロビジュアル**: 80年代風ピクセルアート・サイバーカラー
- 🎮 **完全版テトリス**: 7種類のテトロミノ、ライン消去、レベルシステム
- 💾 **データ保存**: ハイスコア・統計・設定をローカル保存
- 📱 **レスポンシブ対応**: PC・タブレット・スマートフォン対応
- 🔊 **サウンド制御**: BGM・効果音の個別オン/オフ設定

## 🎯 ゲーム機能

### 基本システム
- **20×10のゲーム盤面** - クラシックテトリス仕様
- **7種類のテトロミノ** - I, O, T, S, Z, J, L すべて実装
- **完全なライン消去** - シングル〜テトリスの段階的スコア
- **レベルシステム** - 10ライン毎のレベルアップと速度変化
- **ゴーストピース** - 落下予測位置の表示

### 操作方法
| キー | 動作 |
|------|------|
| **← →** | ブロックの左右移動 |
| **↑** | ブロックの回転 |
| **↓** | ソフトドロップ（高速落下） |
| **スペース** | ハードドロップ（一気に落下） |
| **P** | 一時停止/再開 |
| **R** | ゲームリセット |
| **S** | ゲーム開始 |

### スコアシステム
- **シングル消去**: 100 × レベル
- **ダブル消去**: 300 × レベル  
- **トリプル消去**: 500 × レベル
- **テトリス**: 800 × レベル
- **ドロップボーナス**: ソフト1pt、ハード2pt/マス

## 🎵 音響システム

### BGM: コロベイニキ
Web Audio APIを使用してコロベイニキの楽譜を完全再現。レトロゲーム風のスクエア波音源で80年代の雰囲気を演出。

### 効果音
- ピース移動・回転音
- ライン消去音
- テトリス達成音
- ゲームオーバー音

## 🛠️ 技術仕様

### フロントエンド技術
- **HTML5** - セマンティックマークアップ
- **CSS3** - Tailwind CSS + カスタムレトロスタイル
- **JavaScript ES6+** - モダンJavaScript、クラスベース設計
- **HTML5 Canvas** - ピクセルパーフェクトな2D描画
- **Web Audio API** - リアルタイム音楽生成

### 対応ブラウザ
- Chrome 90+
- Firefox 88+  
- Safari 14+
- Edge 90+

## 📁 プロジェクト構成

```
📦 レトロテトリス/
├── 📄 README.md                 # このファイル
├── 📁 src/                      # ゲームソースコード
│   ├── 📄 index.html            # 🎮 メインゲーム画面
│   ├── 📁 css/
│   │   └── 📄 styles.css        # レトロスタイルCSS
│   └── 📁 js/
│       └── 📄 script.js         # ゲームロジック
├── 📁 docs/                     # ドキュメント
│   ├── 📄 game-specification.md # ゲーム仕様書
│   └── 📄 implementation-log.md # 実装ログ
└── 📄 LICENSE                   # MITライセンス
```

## 🚀 セットアップ

### 簡単スタート
1. このリポジトリをクローンまたはダウンロード
2. `src/index.html`をブラウザで開く
3. **S**キーを押してゲーム開始！

### ローカル開発サーバー（推奨）
```bash
# リポジトリクローン
git clone https://github.com/tokawa-ms/20250725-demo.git
cd 20250725-demo/src

# 簡易HTTPサーバー起動
python3 -m http.server 8000
# または
npx serve .

# ブラウザで http://localhost:8000 を開く
```

## 🎮 プレイ方法

1. **ゲーム開始**: ページを開いたら**S**キーでスタート
2. **ピース操作**: 矢印キーでブロックを移動・回転
3. **ライン消去**: 横一列を埋めてスコア獲得
4. **レベルアップ**: 10ライン消去毎に速度アップ
5. **ハイスコア**: 自己ベストを更新しよう！

## 📊 実装状況

### ✅ 完了機能
- [x] 完全なテトリスゲームエンジン
- [x] コロベイニキBGM（Web Audio API）
- [x] 80年代風レトロビジュアル
- [x] レスポンシブUI
- [x] データ永続化（ハイスコア・設定）
- [x] 詳細な統計情報
- [x] アクセシビリティ対応

### 🔄 今後の予定
- [ ] モバイル向けタッチ操作
- [ ] マルチプレイヤー機能
- [ ] 追加BGMトラック
- [ ] より豊富なビジュアルエフェクト

## 🎨 レトロデザイン

### カラーパレット
- **サイバー系**: シアン (#00ffff)、グリーン (#00ff00)
- **ネオン系**: マゼンタ (#ff00ff)、イエロー (#ffff00)
- **アクセント**: オレンジ (#ff8800)、ブルー (#0088ff)

### ビジュアル要素
- ピクセルパーフェクトな描画
- スキャンライン効果
- グローエフェクト
- 3D風ブロック描画

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を作成

## 🆘 サポート

- 🐛 **Issue報告**: [Issues](https://github.com/tokawa-ms/20250725-demo/issues)
- 📖 **ドキュメント**: [docs/](./docs/)フォルダ参照
- 💬 **質問・提案**: GitHub Discussions

---

<div align="center">
  <strong>🕹️ レトロテトリスで80年代にタイムスリップ！ 🎮</strong><br>
  Made with ❤️ and retro vibes
</div>
