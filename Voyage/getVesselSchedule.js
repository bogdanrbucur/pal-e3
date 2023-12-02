import axios from "axios";
import { dateToString } from "../Common/utils.js";
/**
 * Gets all the vessels' port call schedule for the next month
 * @param {days} days how many days ahead to check
 * @return {Promise<Array>} Array of objects, each containing a port call
 */
export default async function getVesselSchedule(days) {
	console.log("Start POST request for vessels' schedule...");
	console.time("Vessels' schedule POST request");
	// get today's date and 1 month from now
	let startDate = new Date();
	// if days is provided, use it, otherwise default to 1 month
	let untilDate;
	if (days) {
		untilDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + days);
	} else {
		untilDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
	}

	let options = {
		method: "POST",
		url: `${this.url}/palvoyage/VoyagePAL/PortCallPlanner/GetLegPlanning`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			"Content-Type": "application/json",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: { Fromdate: dateToString(startDate), ToDate: dateToString(untilDate) },
	};

	let response = await axios.request(options);
	console.log("Got POST request for vessels' schedule");
	console.timeEnd("Vessels' schedule POST request");
	return response.data.data;
}
