# メソッド

## Talk Method

TalkServiceのすべての関数は`client.talk`にあります。

例:

```js
await client.talk.sendMessage({
    to: "u...",
    text: "Hello, LINEJS!",
    e2ee: true,
});
```

上記はテキストメッセージをe2eeで暗号化してユーザーに送信する例です。

## Square Method

SquareServiceのすべての関数は`client.square`にあります。

例:

```js
await client.square.findSquareByInvitationTicket({
    request: {
        invitationTicket: "INVITATION_TICKET",
    },
});
```

上記は招待コードからスクエアを取得する例です。
