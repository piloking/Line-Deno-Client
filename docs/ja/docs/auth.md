# 認証

いくつかの方法で認証を受けることができます。

## Login

LINEJSには2つのログイン方法があります。

### `loginWithPassword`

メアドとパスワードが必要です。

例:
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


`onPincodeRequest`はPinを受け取ることができます。\
初回ログイン時、スマホ版のLINEでPinを入力し、e2eeを有効にする必要があります。

### `loginWithQR`

メアドとパスワードは必要ありません。

```ts
import { loginWithQR } from '@evex/linejs'

const client = loginWithQR({
  onReceiveQRURL(url) {
    console.log('Access to this URL:', url)
  }
})
```

この関数はスマホ版LINEで読み込む為のURLを表示します。\
LINEJSではQRコードの作成をサポートしていないため、画像として表示したい場合は自分で作成する必要があります。

## With authToken

短時間に何度もログインを試みるとアカウントがBANされる可能性があるため、認証にはauthTokenを使用することをおすすめします。
