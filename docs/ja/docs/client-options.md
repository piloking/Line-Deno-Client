# クライアントオプション

次に、クライアントのオプションについて説明します。

```ts
const client = new Client({
    device: "...",
    ...
});
```

オプションは数種類あり、**storage for the data**や**OBS Endpoint**、通信用の**Endpoint**、CORSやプロキシのための**customFetch**、レート制限のための**RateLimitter**などがあります。

これらを一つずつ説明します。

## Storage

復号キーやキャッシュなどの内部処理のためのストレージです。\
デフォルトでは`MemoryStorage`が使用され、プログラム停止時は最初からログインする必要があります。

`FileStorage`を使用することもできます:

```ts
import { FileStorage } from "@evex/linejs/storage";

const client = new Client({
    device: "IOSIPAD",
    storage: new FileStorage("./storage.json"), // ストレージファイルへのパス（秘密ファイル）
});
```

クラウドやデータストレージAPIを使用してストレージに保存したい場合は、`BaseStorage`を拡張して自分の好みに作成できます。

## Endpoint

通常、変更する必要はありませんが、通信のエンドポイントです。

プロキシサーバーを試したい場合:

```ts
const client = new Client({
    endpoint: "legy-jp.line-apps.com",
});
```

## Custom Fetch

CORS回避やプロキシのためのものです。fetchを置き換える関数を定義します:

```ts
...

const client = new Client({
    fetch: async (url, options) => {
        return await fetch(url, {
            ...options,
            ...proxyAgent
        });
    }
});
```

オプションの説明は以上です！\
次のセクションでは、さまざまなメソッドを紹介します。
