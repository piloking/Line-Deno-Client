# Receive Message Event

The next step is to finally receive the message.\
The atmosphere is becoming more and more like a bot!

:::warning
however, that to receive the group's message, the decrypt key
in `FileStorage` or so on, as described in [Start 2](/docs/start-2). 
:::

First, let's create a bot that only receives “!ping” and returns “pong!”.

## Chat

To receive messages, do the following.

```ts
client.on("message", (message) => {
    ...
});

await client.login({...})
client.polling(["square","talk"])
```

This is all that is needed to receive the message.\
Easy, isn't it?

So first, let's retrieve the messages sent.

```ts
client.on("message", (message) => {
    const text = message.text;

    console.log(text);
});
```

Your console should now show the message that was sent to you!

```console
Hello EdamAmex
I love you! :D
```

Next, let's check if the message is “!ping”.

```ts
client.on("message", (message) => {
    const text = message.text;

    if (text === "!ping") {
        ...
    }
});
```

This is perfect. Next time I need to reply.

To reply, you can call a method that sends a `messageId` with a
`relatedMessageId`, but there is a more convenient way.

```ts
client.on("message", (message) => {
    const text = message.text;

    if (text === "!ping") {
        message.reply("pong!");
    }
});
```

What a beautiful code! It's too easy. However, in this case, it is more
beautiful to enclose it in an asynchronous function.

```ts
client.on("message", async (message) => {
    const text = message.text;

    if (text === "!ping") {
        await message.reply("pong!");
    }
});
```

That's all!\
There are also `send`, `reaction`, etc.\
Let me explain all the methods in other chapters.

## Square

So what should we do with Square (OpenChat)? Basically the same thing.

```ts
client.on("square:message", async (message) => {
    const text = message.text;

    if (text === "!ping") {
        await message.reply("pong!");
    }
});
```

With this alone you can create a basic bot.\
There are many more features!

Stay tuned for our next journey.

:::tip
If you encounter problems, please refer to [Question](/docs/question),
not only here.
:::
