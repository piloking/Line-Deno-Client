# Utils of LINEJS

LINEJS is not only a self-bot. \
From building internal URIs to building OBS, open chat search, regex for picking emid, ticket, and more.
I will explain one by one.

## LINE_OBS

Utils to retrieve images and videos from obs hash.
You can retrieve them as follows

```ts
import { LINE_OBS } from "@evex/linejs/utils";

const OBS = new LINE_OBS(); // endpoint is optional

const OBS_IMAGE_URI = OBS.getURI("0hy28TkoGoJh0FLTatCdtZSjt7ezN-Xj8PeFUrfHAvey8pHDUcMEppKXR-eisuFGJObRhheCh6KngqGzY"); // obs hash

const OBS_PROFILE_IAMGE_URI = OBS.getProfileImage("u**********"); // member id (mid)

const OBS_SQUARE_PROFILE_IAMGE_URI = OBS.getSquareMemberImage("p**********"); // square member id (pid)

// and more
```

All methods can be viewed [here](https://github.com/evex-dev/linejs/blob/main/packages/linejs/utils/obs/index.ts)

## LINE_SCHEME

Utils for constructing a scheme URI for LINE

```ts
import { LINE_SCHEME } from "@evex/linejs/utils";

const SCHEME = new LINE_SCHEME();

const SCHEME_HOME_URI = SCHEME.getHome();

const SCHEME_PROFILE_POPUP_URI = SCHEME.getProfilePopup("u**********");

// and more
```

All methods can be viewed [here](https://github.com/evex-dev/linejs/blob/main/packages/linejs/utils/scheme/index.ts)


## LINE_REGEX

Utils for extracting tickets and emids from URLs.

```ts
import { LINE_REGEX } from "@evex/linejs/utils";

const REGEX = new LINE_REGEX();

console.log(REGEX.getTicket("Square Invitation https://line.me/ti/g2/*************")); // *************

console.log(REGEX.getEmid(".../emid=*************")); // *************
```

All methods can be viewed [here](https://github.com/evex-dev/linejs/blob/main/packages/linejs/utils/regex/index.ts)

## LINE_FUNCTIONS

Utils for connecting to external APIs related to LINE

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

All methods can be viewed [here](https://github.com/evex-dev/linejs/blob/main/packages/linejs/utils/functions/index.ts)

The next sections will introduce the various methods.
