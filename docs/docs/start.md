# Getting Started

<b>LINEJS</b> is always by your side.

<b>Thank you for choosing this library!</b>

## Installation

LINEJS is published on JSR, not a npm. You can install LINEJS with npm, yarn, pnpm, Bun, and Deno.
```bash
npx jsr add @evex/linejs # If you use npm
bunx --bun jsr add @evex/linejs # If you use Bun
deno add @evex/linejs # If you use Deno
```

After execution, you should have the library available.

## Usage

Next, let's create a script that just retrieves your profile!

To making client, you can use `loginWithPassword`.
```ts
import { loginWithPassword } from "@evex/linejs";

const client = loginWithPassword({
  email: 'you@example.com', // e-mail address
  password: 'password', // Password
  onPincodeRequest(pincode) {
    console.log('Enter this pincode to your LINE app:', pincode)
  }
})
```

Authentication is complicated process, so you should read [here](./auth.md).

After created client, you can do various things!

For instance, you can get one of chat informations you joined:
```ts
const chats = await client.fetchChats()
console.log(chats[0].name)
```

---

This library is still in its infancy!\
If you find <i>any bugs</i> or <i>missing parts</i>, please let us know on our
server! \
(Roles will be given to those who suggest bugs and features!)
