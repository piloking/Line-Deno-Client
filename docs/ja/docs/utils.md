# ユーティリティ

LINEJSは単なるself-bot用ライブラリではありません。\
内部URIの構築からOBSの構築やオープンチャット検索、emid、チケットを取得するための正規表現など、多岐にわたります。
順番に説明していきます。

## LINE_OBS

obsハッシュから画像や動画を取得するためのもの。
以下のように取得できます。\
すべてのメソッドは[こちら](https://github.com/evex-dev/linejs/blob/main/packages/linejs/utils/obs/index.ts)

```ts
import { LINE_OBS } from "@evex/linejs/utils";

const OBS = new LINE_OBS(); // endpoint is optional

const OBS_IMAGE_URI = OBS.getURI("0hy28TkoGoJh0FLTatCdtZSjt7ezN-Xj8PeFUrfHAvey8pHDUcMEppKXR-eisuFGJObRhheCh6KngqGzY"); // obs hash

const OBS_PROFILE_IAMGE_URI = OBS.getProfileImage("u**********"); // メンバーID (mid)

const OBS_SQUARE_PROFILE_IAMGE_URI = OBS.getSquareMemberImage("p**********"); // squareメンバーID (pid)

// その他メソッド
```



## LINE_SCHEME

LINEのスキームURIを構築するためのもの。\
すべてのメソッドは[こちら](https://github.com/evex-dev/linejs/blob/main/packages/linejs/utils/scheme/index.ts)

```ts
import { LINE_SCHEME } from "@evex/linejs/utils";

const SCHEME = new LINE_SCHEME();

const SCHEME_HOME_URI = SCHEME.getHome();

const SCHEME_PROFILE_POPUP_URI = SCHEME.getProfilePopup("u**********");

// その他メソッド
```



## LINE_REGEX

URLからチケットやemidを抽出するためのもの。\
すべてのメソッドは[こちら](https://github.com/evex-dev/linejs/blob/main/packages/linejs/utils/regex/index.ts)

```ts
import { LINE_REGEX } from "@evex/linejs/utils";

const REGEX = new LINE_REGEX();

console.log(REGEX.getTicket("Square Invitation https://line.me/ti/g2/*************")); // *************

console.log(REGEX.getEmid(".../emid=*************")); // *************
```



## LINE_FUNCTIONS

LINEに関連する外部APIに接続するためのもの。\
すべてのメソッドは[こちら](https://github.com/evex-dev/linejs/blob/main/packages/linejs/utils/functions/index.ts)

```ts
import Utils from '@evex/linejs/utils';

const squareList = await Utils.LINE_FUNCTIONS.searchSquare("Developer", 100);

if (squareList.error === null) {
    const squareInfo = await Utils.LINE_FUNCTIONS.getSquare(squareList.data.squares[0].square.emid, false, {
        "x-line-channeltoken": "..."
    });

    console.log(squareInfo);
}
```

次のセクションでは、他のさまざまなメソッドを紹介します。
