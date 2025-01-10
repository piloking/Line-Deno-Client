# メッセージイベントの受信

次のステップは、メッセージを受信してみましょう。\
ますますボットらしくなってきましたね！

:::warning
グループのメッセージを受信するには、`FileStorage`などにある復号キーが必要です。\
詳細は[こちら](/ja/docs/start-2)を参照してください。
:::

「!ping」を受信し「pong!」と返すだけのボットを作成してみましょう。

## Chat

まずは、メッセージを受信してみましょう。

```ts
client.on("message", (message) => {
    ...
});

await client.login({...})
client.polling(["square","talk"])
```

メッセージを受信し、表示してみます。

```ts
client.on("message", (message) => {
    const text = message.text;

    console.log(text);
});
```

コンソールに送信されたメッセージが表示されるはずです！

```console
Hello MaguRo
I love you! :D
```

次に、メッセージが「!ping」かどうかを確認しましょう。

```ts
client.on("message", (message) => {
    const text = message.text;

    if (text === "!ping") {
        ...
    }
});
```

完璧ですね！今度はリプライをさせてみましょう。

リプライをするには`messageId`と`relatedMessageId`を使用しますが、もっと便利な方法があります。

```ts
client.on("message", (message) => {
    const text = message.text;

    if (text === "!ping") {
        message.reply("pong!");
    }
});
```

美しいシンプルなコードの完成です！\
非同期関数で囲むことで、さらに美しくすることが可能です。

```ts
client.on("message", async (message) => {
    const text = message.text;

    if (text === "!ping") {
        await message.reply("pong!");
    }
});
```

これで完了です！\
他にも`send`や`reaction`などのメソッドがあります。\
他の章でこれらのメソッドについて説明します。

## Square

さて、Square（オープンチャット）ではどうすればいいのでしょうか?\
基本的には同じことです。

```ts
client.on("square:message", async (message) => {
    const text = message.text;

    if (text === "!ping") {
        await message.reply("pong!");
    }
});
```

これだけで基本的なBOTを作成できます。\
他にもたくさんの機能があります！

次の体験をお楽しみに。

:::tip
問題が発生した場合は、[お問い合わせ](/ja/docs/question)を参照してください。
:::
