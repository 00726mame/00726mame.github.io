# Household Finance Apps

Household Finance AppsはAI技術を活用した家計管理アプリケーション群です。React + Vite + React Routerで構築された統合SPAアプリケーションです。

## 📱 アプリ機能

### 1. AI搭載家計簿
レシート読み取り、AI分析、予算提案機能を備えた高機能家計簿アプリ

**主な機能:**
- 📷 カメラでレシート自動読み取り
- 🤖 Gemini AIによる家計分析
- 💬 AIチャット機能
- 📊 詳細な統計とグラフ
- 🎯 AI予算プランナー
- 🌙 ダークモード対応

### 2. スマート計画立てAI
AIとマップ連携で効率的な予定作成を支援するスマートプランナー

**主な機能:**
- 🤖 Gemini AIによる計画自動生成
- 🗺️ Yahoo! YOLP連携
- 🌤️ 天気情報考慮
- 🔍 Tavily Web検索統合
- 📱 レスポンシブデザイン
- 🌙 ダークモード対応

## 🚀 セットアップ

### 1. 開発環境
```bash
git clone [repository-url]
cd household_accounting
npm install
npm run dev    # 開発サーバー起動
```

### 2. 本番ビルド
```bash
npm run build  # 本番ビルド
npm run preview # ビルド結果をプレビュー
```

### 3. GitHub Pagesでの公開
```bash
npm run deploy # GitHub Pagesにデプロイ
```

### 4. API キーの設定

#### AI搭載家計簿
- **Gemini API**: [Google AI Studio](https://aistudio.google.com/app/apikey)

#### スマート計画立てAI
- **Gemini API**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **OpenWeather API**: [OpenWeatherMap](https://openweathermap.org/api)
- **Tavily API**: [Tavily](https://tavily.com)
- **YOLP API**: [Yahoo!デベロッパーネットワーク](https://developer.yahoo.co.jp/webapi/map/)

## 📁 ファイル構造
```
household_accounting/
├── src/
│   ├── components/
│   │   ├── MainPage.jsx             # ランディングページ
│   │   ├── SimpleBudgetApp.jsx      # AI搭載家計簿
│   │   └── SmartPlannerAI.jsx       # スマート計画立てAI
│   ├── App.jsx                      # ルーター設定
│   ├── main.jsx                     # エントリーポイント
│   ├── App.css                      # スタイル
│   └── index.css                    # グローバルスタイル
├── public/                          # 静的ファイル
├── index.html                       # HTMLテンプレート
├── package.json                     # プロジェクト設定
├── vite.config.js                   # Vite設定
├── tailwind.config.js               # Tailwind設定
└── README.md
```

## 🔧 技術スタック

- **フロントエンド**: React 19 + Vite
- **ルーティング**: React Router 6
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide React
- **グラフ**: Recharts
- **API統合**: Fetch API
- **ビルドツール**: Vite
- **デプロイ**: GitHub Pages

## 🌐 API統合

### Gemini AI
- 家計分析とアドバイス生成
- レシート読み取り
- 計画立て支援

### OpenWeather API
- 天気情報取得
- 予定に応じた服装アドバイス

### Tavily Search API
- Web情報検索
- 場所情報取得

### Yahoo! YOLP API
- 位置情報取得（ジオコーディング）
- 逆位置情報取得（逆ジオコーディング）
- ルート最適化

## 📱 ルーティング

- `/` - ランディングページ（アプリ選択）
- `/budget` - AI搭載家計簿
- `/planner` - スマート計画立てAI

## 💾 データ保存
- ローカルストレージを使用
- クライアントサイドで完結
- プライバシー重視設計

## 🔒 セキュリティ
- APIキーはローカル保存
- サーバーへの送信なし
- HTTPS推奨

## 📱 対応ブラウザ
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 貢献
プルリクエストやイシューの報告を歓迎します。

## 📄 ライセンス
MIT License

---
Created with ❤️ for better financial management