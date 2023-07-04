import PAL from "./pal.js";
import "dotenv/config";

// Create a new pal object
const pal = new PAL();

// Get credentials from env variables
pal.url = process.env.URL;
pal.user = process.env.PAL_USER;
pal.password = process.env.PASSWORD;

// Import the list of vessels from an external config file
let myVessels = ["CHEM ALYA", "CHEM HOUSTON", "CHEM LITHIUM"];
let myCategories = ["MEDICINE", "PROVISIONS"];

// Need to wrap in async function as all API calls are async
const main = async () => {
	// Get the session cookie to be able to use any other method
	await pal.getCookie();

	// Get all the vessels' schedule for the next month
	// let schedule = await pal.getVesselSchedule();

	// Get all the PSC reports ever
	// let pscReports = await pal.getPSCreports();

	// Get all the vessels registered in PAL
	// let vessels = await pal.getVessels();

	// Convert the array of vessel names to a string of Vessel IDs
	// let vesselsIds = await pal.vesselNamesToIds(myVessels);

	// Get all 2023 requisitions for myVessels
	// let requsitions = await pal.generalQuery(myVessels, 2023, 1, "9380");

	// Get all Purchase categories
	// let categories = await pal.getPurchaseCategories();

	// Convert the array of Purchase categories names to a string of IDs
	let vesselsIds = await pal.categoriesNamesToIds(myVessels);
	console.log(categories);
};

main();
