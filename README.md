# PAL e3

## Description

Interact with MariApps PAL e3 ERP via REST API.

Since PAL e3 does not offer APIs for programmatically interacting with the backend, this package provides functions which abstract the complexity of performing HTTP requests to the backend server.

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
const myVessels = ["CHEM MIA", "CHEM POLARIS", "CHEM VENUS"];
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

const myVessels = ["CHEM MIA", "CHEM POLARIS", "CHEM VENUS"];
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

#### Remove all users from Chem Polaris, BREAKDOWN JOB category, Breakdown - Normal template, from the Insurance Manager role

```js
import * as PAL from "pal-e3";
import PALAPI from "pal-e3";

const palapi = new PALAPI();

palapi.url = "https://...";
palapi.user = "user_name";
palapi.password = "passw0rd";

const main = async () => {
await palapi.getCookie();

let jobAllocation = await palapi.purchaseAllocation("JOB", "Chem Polaris", "BREAKDOWN", "insurance manager", "", "BREAKDOWN - Normal");
console.log(jobAllocation); // true if succesful
};

main();
```

#### Assigning Bogdan and Marius in Technical Supt alert role in Voyage User Alert Configuration for Chem Polaris

```js
import * as PAL from "pal-e3";
import PALAPI from "pal-e3";

const palapi = new PALAPI();

palapi.url = "https://...";
palapi.user = "user_name";
palapi.password = "passw0rd";

const main = async () => {
await palapi.getCookie();

let voyAlloc = await palapi.voyageAlertConfig("chem polaris", "technical supt", ["bogdan", "marius"]);
console.log(voyAlloc); // true if succesful
};

main();
```

#### Assigning Bogdan and Adrian as Crew Manager in MDM -> Crewing -> Vessel User Allocation for the Incidental Expense process on Chem Mia

Users not in the users array will be removed from the Crew Manager role in Incidental Expense on Chem Mia.

```js
import * as PAL from "pal-e3";
import PALAPI from "pal-e3";

const palapi = new PALAPI();

palapi.url = "https://...";
palapi.user = "user_name";
palapi.password = "passw0rd";

const main = async () => {
await palapi.getCookie();

let crewAlloc = await palapi.crewAllocation("Chem mia", "incidential  expense", "crew - crew manager", ["bogdan", "adrian"]);
console.log(crewAlloc); // true if succesful or if user already there in the same role
};

main();
```

### Accessing all available API methods and data manipulation functions

All available PAL API call methods are available on the `palapi` object using IntelliSense:
![ss1](https://imgur.com/xJ1W3xH.png)

All available data manipulation functions can be accessed from the `PAL` object using IntelliSense:
![ss2](https://imgur.com/pKDcXcd.png)

### Release notes 1.3.0

- added `voyageAlertConfig` method for Voyage User Alert Configuration
- added `crewAllocation` method for MDM Crewing Vessel User Allocation
- a few private methods renamed to better reflect their use

### Release notes 1.2.0

- `purchaseAllocation` method now supports JOB allocations
- `getPRCtemplateIds` renamed to `getCurrentPRCallocation` as it's a more accurate name

### To do

- MDM Crewing Vessel User Allocation (Crewing Oficer - Incidental Expense, Appraisal)
