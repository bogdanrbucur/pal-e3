# PAL e3

## Description

A collection of methods for reading data from PAL e3 ERP using REST API and manipulating it.

## Installation

`npm install pal-e3`

## Usage

```js
import * as PAL from "./pal.js";
import PALAPI from "./pal.js";
import "dotenv/config";

// Create a new pal object
const palapi = new PALAPI();

// Get credentials from env variables
palapi.url = process.env.URL;
palapi.user = process.env.PAL_USER;
palapi.password = process.env.PASSWORD;

// Import lists of parameters from external config file
let myVessels = ["CHEM ALYA", "CHEM HOUSTON", "CHEM LITHIUM"];
let myCategories = ["MEDICINE", "PROVISIONS"];

// Need to wrap in async function as all API calls are async
const main = async () => {
	// Get the session cookie to be able to use any other method
	await palapi.getCookie();

	// Get all the vessels' schedule for the next month
	let schedule = await pal.getVesselSchedule();

	// Get all the PSC reports ever
	let pscReports = await pal.getPSCreports();

	// Get all the vessels registered in PAL
	let vessels = await pal.getVessels();

	// Convert the array of vessel names to a string of Vessel IDs to be passed to other methods
	let vesselsIds = await pal.vesselNamesToIds(myVessels);

	// Convert the array of Purchase categories names to a string of IDs to be passed to other methods
	let catoriesIds = await pal.categoriesNamesToIds(myCategories);

	// Get all Purchase categories
	let categories = await pal.getPurchaseCategories();

	// Get all 2023 requisitions for myVessels and myCategories
	let requsitions = await palapi.generalQuery(myVessels, 2023, 1, myCategories);
	console.log(requsitions);

	// Get the port out of a port-country string
	let port = PAL.getPort("Antwerp {BEANR}, BELGIUM");
};

main();
```

All available data manipulation functions can be accessed from the PAL object:
![ss](https://imgur.com/pKDcXcd.png)