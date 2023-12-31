# PAL e3

## Description

Interact with MariApps PAL e3 ERP via REST API.

Since PAL e3 does not offer APIs for programmatically interacting with the backend, this package provides functions which abstract the complexity of performing HTTP requests to the backend server.

## Installation

`npm install pal-e3`

## Testing using `jest`

### Use ES6 imports

1. Install jest and babel-jest: `npm install --save-dev jest babel-jest`
2. Install Babel and the Babel Jest plugin: `npm install --save-dev @babel/core @babel/preset-env babel-jest`
3. Create a `.babelrc` file in the root of the project with the following content:

```js
{
  "presets": ["@babel/preset-env"]
}
```

4. `npm init jest@latest` to create a `jest.config.js` file
5. The `collectCoverageFrom` key sets the files to be tested. Add new folders or exclude files as needed.

### Run tests

- `npm test` to run all tests
- `npm test -- --coverage` to run all tests and generate coverage report

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

#### Getting EU MRV legs for given vessel from start of the year of the given date

```js
// optional third argument true if needed to run from pervious 1 Jan
let eumrv = await palapi.eumrv("Chem Mia", new Date());
console.log(eumrv);

// Get the result object
{
  vessel: 'CHEM MIA',
  startDate: '01.01.2023',
  endDate: '09.01.2023',
  legs: [
    {
      voyageLeg: '274/01, 274/02',
      depPort: 'Rotterdam',
      depCountry: 'NETHERLANDS',
      depTime: '29-Dec-2022 20:24',
      arrPort: 'Hamburg',
      arrCountry: 'GERMANY',
      arrTime: '09-Jan-2023 07:00',
      seaHFOcons: 0,
      seaHFOCO2: 0,
      seaLFOcons: 0,
      seaLFOCO2: 0,
      seaMDOcons: 43.36,
      seaMDOCO2: 139.01,
      seaTotalCons: 43.36,
      seaTotalCO2: 139.01,
      portHFOcons: 0,
      portHFOCO2: 0,
      portLFOcons: 0,
      portLFOCO2: 0,
      portMDOcons: 8.33,
      portMDOCO2: 26.71,
      portTotalCons: 8.33,
      portTotalCO2: 26.71,
      distance: 371,
      timeAtSea: 212,
      timeAtAnchorage: 181.1,
      timeDrifting: 0,
      timeNavigation: 30.9,
      timeSteaming: 30.9,
      cargo: 0,
      transportwork: 0
    },
  {...},
  ...
  ]
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

#### Getting all documents in a given QDMS folder by the folder ID

```js
const docs = await palapi.getQDMSdocsByFolderId(6148);
console.log(docs);

// Get the result object
{
	CreatedBy: "Marine Assistant";
	CreatedOn: "31-Oct-2023 06:51:46";
	DocFolder: "Karlshamn";
	DocNo: "PI-KAR-02";
	DocSite: "All";
	Doctitle: "CDC - Sweden";
	ID: 99990000505971;
	Revision: 3;
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

#### Getting one or all vessel's crewlist

```js
// get the current crewlist for given vessel
const crewlist = await palapi.getCrewlist("chem mia");
console.log(crewlist);

// Get the  objects array
[
	{
		Id: 11164,
		VesselId: 304392,
		VslName: "Chem Mia",
		EmpId: 2065009,
		EmpNo: "18985",
		onName: "JANE DOE",
		Nationality: "INDIAN",
		SignOnDate: "12-Nov-2022",
		ReliefDate: "09-Mar-2023",
	},
  ...
];

// get the crewlist for all vessels at given date
const crewlist = await palapi.getCrewlist("", new Date("2022-11-12"), new Date("2022-11-12"));
console.log(crewlist);
```

### Accessing all available API methods and data manipulation functions

All available PAL API call methods are available on the `palapi` object using IntelliSense:
![ss1](https://imgur.com/xJ1W3xH.png)

All available data manipulation functions can be accessed from the `PAL` object using IntelliSense:
![ss2](https://imgur.com/pKDcXcd.png)

### Release notes 1.7.5

- implement `getCrewlist()` method
