# PAL e3

## Description

A collection of methods for interacting with MariApps PAL e3 ERP via REST API.

## Installation

`npm install pal-e3`

## Usage

Import the API methods as PALAPI and the data manipulation functions as PAL

```js
import * as PAL from "pal-e3";
import PALAPI from "pal-e3";
```

Create a new object using the PALAPI class

```js
const palapi = new PALAPI();
```

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

### Examples

#### Getting all requsitions for given vessels and Purchase cateogries

```js
import * as PAL from "pal-e3";
import PALAPI from "pal-e3";

const palapi = new PALAPI();

palapi.url = "https://...";
palapi.user = "user_name";
palapi.password = "passw0rd";

const myVessels = ["CHEM ALYA", "CHEM HOUSTON", "CHEM LITHIUM"];
const myCategories = ["MEDICINE", "PROVISIONS"];

const main = async () => {
	await palapi.getCookie();

	let requsitions = await palapi.generalQuery(myVessels, 2023, 1, myCategories);
	console.log(requsitions);
};

main();
```

#### Allocate Roni and Bogdan on Chem Polaris, Crew Welfare category in the Tech. Director role

```js
import * as PAL from "pal-e3";
import PALAPI from "pal-e3";

const palapi = new PALAPI();

palapi.url = "https://...";
palapi.user = "user_name";
palapi.password = "passw0rd";

const main = async () => {
	await palapi.getCookie();

	let allocation = await palapi.purchaseAllocation("PROC", "Chem Polaris", "crew welfare", "technical director", ["Bogdan", "roni"]);
	console.log(allocation); // true if succesful
};

main();
```

### Accessing all available API methods and data manipulation functions

All available PAL API call methods are available on the `palapi` object using IntelliSense:
![ss1](https://imgur.com/xJ1W3xH.png)

All available data manipulation functions can be accessed from the `PAL` object using IntelliSense:
![ss2](https://imgur.com/pKDcXcd.png)
