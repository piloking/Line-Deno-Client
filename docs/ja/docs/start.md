# はじめに


<b>まずは、LINEJSライブラリを選んでくれてありがとうございます！</b>

## インストール

LINEJSはJSRに公開されています。npmではありません。npm、yarn、pnpm、Bun、DenoでLINEJSをインストールできます。
```bash
npx jsr add @evex/linejs # npmを使う場合
bunx --bun jsr add @evex/linejs # Bunを使う場合
deno add @evex/linejs # Denoを使う場合
```

完了後、ライブラリが利用可能になります。

## 使い方

自分のプロフィールを取得するだけのスクリプトを作成してみましょう。

クライアントの作成には`loginWithPassword`を使用します。
```ts
import { loginWithPassword } from "@evex/linejs";

const client = loginWithPassword({
  email: 'you@example.com', // メアド
  password: 'password', // パスワード
  onPincodeRequest(pincode) {
    console.log('Enter this pincode to your LINE app:', pincode)
  }
})
```

複雑なプロセスなので認証については[こちら](./auth.md)を読んでください。

クライアント作成後は、様々な機能を使うことが可能になります。

例えば、参加しているチャットの情報を取得する例:
```ts
const chats = await client.fetchChats()
console.log(chats[0].name)
```

---

このライブラリはまだ初期段階です！\
<i>バグ</i>や<i>不足している部分</i>を見つけた場合は、Discordサーバーでお知らせください！\
（バグや機能を提案してくれた方にはロールが付与されるかもしれません）