import axios from "axios";
import FormData from "form-data";

/**
 * Get the IDs of all the cycle templates
 * @private
 * @return {Promise<{ Id: number, Name: string, CompanySel: string }[]>}
 */
export default async function getPRCcycleTemplateIds() {
	console.log("Start request for PRC cycle template IDs...");
	console.time("Purchase cycle template IDs request");

	// build the Form body
	let bodyFormData = new FormData();
	bodyFormData.append("sort", "");
	bodyFormData.append("page", 1);
	bodyFormData.append("pageSize", 200);
	bodyFormData.append("group", "");
	bodyFormData.append("filter", "Name~contains~''");

	let options = {
		method: "POST",
		url: `${this.url}/palpurchase/PurchasePAL/ProcurementBusinessFlow/GetTemplateDetails`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: bodyFormData,
	};

	let response = await axios.request(options);
	console.log("Got response for PRC cycle template IDs");
	console.timeEnd("Purchase cycle template IDs request");
	// return response.data.Data[0];
	return response.data.Data;
}
