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
	let schedule = await palapi.getVesselSchedule();

	// Get all the PSC reports ever
	let pscReports = await palapi.getPSCreports();

	// Get all the vessels registered in PAL
	let vessels = await palapi.getVessels();

	// Convert the array of vessel names to a string of Vessel IDs to be passed to other methods
	let vesselsIds = await palapi.vesselNamesToIds(myVessels);

	// Convert the array of Purchase categories names to a string of IDs to be passed to other methods
	let catoriesIds = await palapi.categoriesNamesToIds(myCategories);

	// Get all Purchase categories
	let categories = await palapi.getPurchaseCategories();

	// Get all 2023 requisitions for myVessels and myCategories
	let requsitions = await palapi.generalQuery(myVessels, 2023, 1, myCategories);
	console.log(requsitions);

	// Get the port out of a port-country string
	let port = PAL.getPort("Antwerp {BEANR}, BELGIUM");
};

main();