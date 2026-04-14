# DiscordSRV for Xserver (Node.js Edition)

Xserver for Game を使ったマイクラサーバーと Discord を、プラグインなしで連携させるツールです。

---

## 🛠 準備

1. **Node.js** をインストール
2. このフォルダをダウンロード
3. コマンドプロンプト（またはターミナル）で以下を実行：

```bash
npm install discord.js dotenv playwright https://github.com/executecode1/xserver-client
npx playwright install
```

---

## ⚙ 設定

`.env` ファイルを作成（または編集）し、各項目を記入します。

例：

```env
# Discord設定
DISCORD_TOKEN=あなたのトークンをここに
LOG_CHANNEL_ID=ログチャンネルID
MAIN_CHANNEL_ID=メインチャンネルID

# Xserver設定
XSERVER_ID=サーバーID
XSERVER_MAIL=メールアドレス
XSERVER_PASS=パスワード
MC_VERSION=je
```

### Discord Bot 設定

以下の Intent を有効にしてください：

* SERVER MEMBERS INTENT
* MESSAGE CONTENT INTENT

---

## 🚀 起動

```bash
node index.js
```

---

## ✨ 機能

### 📢 メインチャンネル

* 入退出通知
* 実績通知
* 死亡通知
* チャット同期（役職・色対応）

### 📜 ログチャンネル

* コンソールログをリアルタイム表示
* チャンネルで入力した内容をコマンドとして実行可能

---

## 📌 補足

* プラグイン不要で動作します
* Xserver for Game 環境に最適化されています
* Node.js ベースでカスタマイズ可能

---

## ⚠ 注意事項

* Bot トークンやパスワードは第三者に共有しないでください
* 利用は自己責任で行ってください

---

## 📄 ライセンス

このプロジェクトのライセンスは、各依存パッケージのライセンスに準拠します。
