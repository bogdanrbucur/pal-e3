import axios from "axios";
import FormData from "form-data";

/**
 * Gets all the vessels in PAL
 * @param {string} docType "PROC" or "JOB"
 * @return {Promise<Array>} Array of objects, each containing a Purchase category
 */
export default async function getPurchaseCategories(docType) {
	if (!["JOB", "PROC"].includes(docType)) throw new Error("Document type unknown! Must be JOB or PROC");
	console.time("Purchase categories request");

	// build the Form body
	let bodyFormData = new FormData();
	bodyFormData.append("OpertionType", `${docType}`);
	bodyFormData.append("filter[logic]", "and");
	bodyFormData.append("filter[filters][0][field]", "Value");
	bodyFormData.append("filter[filters][0][operator]", "eq");
	bodyFormData.append("filter[filters][0][value]", `${docType}`);

	let options = {
		method: "POST",
		url: `${this.url}/palpurchase/PurchasePAL/AllocationOfVessel/GetJobOrderCategory`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: bodyFormData,
	};

	let response = await axios.request(options);
	console.timeEnd("Purchase categories request");
	return response.data;
}
