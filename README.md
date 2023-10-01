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

#### Getting IMO DCS cummulated results from 1 Jan until current date

```js
// optional third argument true if needed to run from pervious 1 Jan
// i.e. if full IMO DCS data is not yet available
let dcs = await palapi.imoDcs("Chem Mia", new Date());
console.log(dcs);

// Get the result object
{
  vessel: 'Chem Mia',
  startDate: '01.01.2023',
  endDate: '01.07.2023',
  distance: 32279.7,
  seaHFO: 1303.38,
  seaLFO: 220.28,
  seaMDO: 233.36,
  portHFO: 100.83,
  portLFO: 0,
  portMDO: 50.18,
  totalHFO: 1404.21,
  totalLFO: 220.28,
  totalMDO: 283.54,
  hrsAtSea: 3509.05,
  hrsAtAnchor: 75.63,
  hrsDrifting: 0,
  hrsSteaming: 3433.42,
  hrsInPort: 850.05
}
```

#### Getting all drills for a given vessel name

```js
let drills = await palapi.getDrills("Chem alya");
console.log(drills);

// Get the result object
{
  DrillName: 'Lowering & Launching of Life Boat',
  ReferenceNo: 'CMIA/DRILL/2022/Z/427',
  Vessel: 'Chem Mia',
  DrillConductedOn: '09-Nov-2017 00:00:00',
  DrillStatus: 'Close',
  ...
}

```

#### Getting upcoming crew changes for the next 10 days CPT and C/E ranks

```js
// 1 = CPT, 31 = C/E
const crewChange = await palapi.getPlannedCrewChanges(vessels, new Date(), 10, [1, 31]);
console.log(crewChange);

// Get the  objects array
[
	{
		vessel: "Chem Mia",
		rank: "C/E",
		offName: "JOHN DOE",
		offDueDate: "09-Aug-2023",
		plannedRelief: "24-Aug-2023",
		onName: "JANE DOE",
		port: "Buenaventura",
		remarks: "Briefing in office / process Schengen visa",
		onCrewAgent: "SOMETHING MARITIME AGENCY, INC.",
		offCrewAgent: "SOMETHING MARITIME AGENCY, INC.",
	},
];
```

### Accessing all available API methods and data manipulation functions

All available PAL API call methods are available on the `palapi` object using IntelliSense:
![ss1](https://imgur.com/xJ1W3xH.png)

All available data manipulation functions can be accessed from the `PAL` object using IntelliSense:
![ss2](https://imgur.com/pKDcXcd.png)

### Release notes 1.4.10

- remove cache for VoyageAlertRoles as it's vessel specific
