import axios from "axios";
import FormData from "form-data";
import { dateToString } from "../Common/utils.js";

/**
 * Gets all the PSC reports available in PAL
 * @return {Promise<{  Id: number,ReportTypeId: number,ReportType: string,ReportSubTypeId: number,ReportSubType: string,RefNo: string,InspectionDate: string,InspectorName: string,UnitType:string,Unit:string,VesselStatus:string,NoOfDeficiencies:number, NoOfOpenDeficiencie:number, Status:string,Result:string, pscmou:string, ReportStatus:string,StatusDate:string, Port:string}[]>} Array of objects, each containing an inspection report
 */
export default async function getPSCreports() {
	console.log("Start POST request for vessels' schedule...");
	console.time("PSC reports POST request");

	let startDate = new Date("2000-01-01");
	let untilDate = new Date();

	// build the Form body
	let bodyFormData = new FormData();
	bodyFormData.append("pages", 1);
	bodyFormData.append("pageSize", 10000);
	bodyFormData.append("TreeLevel", 2);
	bodyFormData.append("OffVslOptSelect", "VSL");
	bodyFormData.append("DateYearOptSelect", "DATE");
	bodyFormData.append("FromDate", dateToString(startDate));
	bodyFormData.append("Todate", dateToString(untilDate));
	bodyFormData.append("ReportViewType", "PSC");
	bodyFormData.append("IsPendApproval", "N");
	bodyFormData.append("ReportTypeId", -1001);

	let options = {
		method: "POST",
		url: `${this.url}/pallpsq/LPSQ/ComplianceOverview/GetReportList`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: bodyFormData,
	};

	let response = await axios.request(options);
	console.log("Got POST response for PSC reports");
	console.log(`${response.data.Total} PSC inspections received`);
	console.timeEnd("PSC reports POST request");
	return response.data.Data;
}
