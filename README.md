# PAL e3

## Description

A collection of methods for reading data from PAL e3 ERP using REST API and manipulating it.

## Installation

`npm install pal-e3`

## Usage

Import the API methods as PALAPI and the data manipulation functions as PAL

```js
import * as PAL from "./pal.js";
import PALAPI from "./pal.js";
```

Create a new object using the PALAPI class
`const palapi = new PALAPI();`

Set the PAL URL, username and password. Use something like [dontenv](https://www.npmjs.com/package/dotenv) preferably.

```js
import "dotenv/config";
palapi.url = process.env.URL;
palapi.user = process.env.PAL_USER;
palapi.password = process.env.PASSWORD;
```

Import the vessels and Purchase categories and set them in variables to be reused

```js
const myVessels = ["CHEM ALYA", "CHEM HOUSTON", "CHEM LITHIUM"];
const myCategories = ["MEDICINE", "PROVISIONS"];
```

Wrap all the API calls in an `async` function to be able to use `await`. Before using any API call, need to call `getCookie()` so the session cookie will be set as `palapi.cookie` using the provided credentials.

```js
const main = async () => {
await palapi.getCookie();
};

main();
```

Any other API call method from `palapi` needs to be called inside the `async` function and waited. Some methods are called automatically as needed.
`generalQuery` will call the `vesselsIds` and `catoriesIds` methods to get the necessary IDs for the API call, so it's enough to provide arrays of names as arguments.

### Getting all requsitions for given vessels and Purchase cateogries

```js
const myVessels = ["CHEM ALYA", "CHEM HOUSTON", "CHEM LITHIUM"];
const myCategories = ["MEDICINE", "PROVISIONS"];

const main = async () => {
await palapi.getCookie();

let requsitions = await palapi.generalQuery(myVessels, 2023, 1, myCategories);
console.log(requsitions);
};

main();
```

### Accessing all available API methods and data manipulation functions

All available PAL API call methods are available on the `palapi` object using IntelliSense:
![ss1](https://imgur.com/xJ1W3xH.png)

All available data manipulation functions can be accessed from the `PAL` object using IntelliSense:
![ss2](https://imgur.com/pKDcXcd.png)
