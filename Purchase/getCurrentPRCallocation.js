import axios from "axios";
import FormData from "form-data";

/**
 * Get the current Purchase allocation
 * @param {string} docType "PROC" or "JOB"
 * @param {number} vesselId VesselId
 * @param {number} vesselObjectId VesselObjectId
 * @param {number} categoryId CategoryId
 * @return {Promise<{ApprovalCycleTemplateId: number, ApprovalTemplateId: number, VesselAllocationId: number, roles: {Id: number, Code: string, Name: string, UserIds: string, UserNames: string,}[]}>}
 */
export default async function getCurrentPRCallocation(docType, vesselId, vesselObjectId, categoryId, ApprovalCycleTemplateId = "") {
	if (!["JOB", "PROC"].includes(docType)) throw new Error("Document type unknown! Must be JOB or PROC");

	console.log("Start request for current PRC allocation...");
	console.time("Current PRC allocation request");

	// build the Form body
	let bodyFormData = new FormData();
	bodyFormData.append("sort", "");
	bodyFormData.append("group", "");
	bodyFormData.append("filter", "");
	bodyFormData.append("VesselId", vesselId);
	bodyFormData.append("VesselObjectId", vesselObjectId);
	bodyFormData.append("CategoryId", categoryId);
	bodyFormData.append("DocType", `${docType}`);
	bodyFormData.append("CycleTemplateId", ApprovalCycleTemplateId);

	let options = {
		method: "POST",
		url: `${this.url}/palpurchase/PurchasePAL/AllocationOfVessel/GetFunctionalRoleDetails`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: bodyFormData,
	};

	let response = await axios.request(options);
	console.log("Got response for current PRC allocation");
	console.timeEnd("Current PRC allocation request");
	// return response.data.Data[0];
	return {
		ApprovalCycleTemplateId: response.data.Data[0].ApprovalCycleTemplateId,
		ApprovalTemplateId: response.data.Data[0].ApprovalTemplateId,
		VesselAllocationId: response.data.Data[0].VesselAllocationId,
		roles: response.data.Data,
	};
}
