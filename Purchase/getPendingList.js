import axios from "axios";
import FormData from "form-data";

/**
 * Get the pending list for Purchase docId and docType
 * @param {number} docId
 * @param {string} docType - "PO" or "QC"
 * @return {Promise<{Id: number,Document:string,Code:string,TakenBy:string,ActionDate:string,Status:string,Remarks:string,ForwardBy:string}[]>} Array of actions objects
 */
export default async function getPendingList(docId, docType) {
	console.time("Pending list request");

	const documentTypes = {
		PO: "PO_ALL",
		QC: "AQT_DEF",
	};

	if (!documentTypes.hasOwnProperty(docType)) throw new Error("Invalid docType argument. Only 'PO' or 'QC' are accepted.");

	// build the Form body
	let bodyFormData = new FormData();
	bodyFormData.append("sort", "");
	bodyFormData.append("group", "");
	bodyFormData.append("filter", "");
	bodyFormData.append("docId", docId);
	bodyFormData.append("pageType", documentTypes[docType]); // AQT_DEF or PO_ALL
	bodyFormData.append("docType", 1);
	bodyFormData.append("isShow", "true");

	let options = {
		method: "POST",
		url: `${this.url}/palpurchase/SharedPlugins/ApprovalList/GetApprovalList`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: bodyFormData,
	};

	let response = await axios.request(options);
	console.timeEnd("Pending list request");
	return response.data.Data;
}
