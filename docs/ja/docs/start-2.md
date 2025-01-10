# クライアントメソッドの使い方

次のように呼び出すだけです。簡単です。

```ts
import { Client } from "@evex/linejs";

const client = new Client({ device: "IOSIPAD" });

client.on("pincall", (pincode) => {
	console.log(`pincode: ${pincode}`);
});

client.on("ready", async (user) => {
	console.log(`Logged in as ${user.displayName} (${user.mid});`);

	console.log(await client.getProfile());
});

await client.login({
	email: "YOUR_EMAIL",
	password: "YOUR_PASSWORD",
});

// もしくはQRコードを使用してログインできます。
await client.login({
	qr: true,
});
```

出力:

```console
{
	mid: "u**********",
	phone: "***********",
	regionCode: "JP",
    ...
}
```

メアドでのログインを繰り返すと、不正ログインと見なされる可能性があり、\
アカウントが一時的にBANされることがあります（数日間だけですが...）

なので**AuthToken**を使用するのが良いログイン方法です。

メアドログインでは、期限が切れると停止する一時的なトークンが使用されます。\
長期間動作させたい場合は、v1トークンを使用する必要があります。

開発時はv2トークンを使用するのが良いでしょう。\
繰り返しにはなりますが、メアドログインを何度も繰り返すことは強くおすすめしていません。

それでは、トークンを取得する方法を見てみましょう。

次のように書くだけです。

```ts
client.on("update:authtoken", (authtoken) => {
	console.log("AuthToken", authtoken);
});
```

出力:

```console
AuthToken **********.********
```

上記はv2トークンです。次のように使用できます。

```ts
await client.login({
	authToken: "YOUR_AUTH_TOKEN",
});
```

## 注意点

このログイン方法には落とし穴があります。LINEは_e2ee_を使用して暗号化していますが、\
これを解読するキーはPin付きのメアドログインまたはQRログインでしか取得できません。

したがって、authTokenだけでログインすると、グループトークイベントを取得できません。\
（Square（オープンチャット）は可能です。）

解決策は簡単です。

内部ストレージを使って、最初の一回だけメアドでログインすれば良いのです。

LINEJSには内部ストレージがあり、キャッシュを保存します。\
デフォルトでは`MemoryStorage`で、一度の実行後にすべて消えます。

次のように`FileStorage`にすることもできます。

```ts
import { FileStorage } from "@evex/linejs/storage";

const client = new Client({
	device: "IOSIPAD",
	storage: new FileStorage("./storage.json"), // ストレージファイルへのパス（秘密ファイル）
});
```

最初の一回だけメールでログインし、その後はauthTokenを使用すれば良いのです。



::: tip
クラウドAPIに接続するなど、自分のストレージを作成したい場合は、
`BaseStorage`をインポートし、それを拡張して自分のストレージを作成してください。（詳細はお問い合わせください。）
:::

:::info
v1トークンを使用したい場合は、
[discord.gg/evex](https://discord.gg/evex)で詳細をお問い合わせください。
:::

これで最初の体験は終わりです。まだ続きます！\
お楽しみに！