import axios from "axios";
import FormData from "form-data";

/**
 * Get all the drills for given vessel from PAL QHSE
 * @param {string} vesselName vessel name
 * @return {Promise<{DrillName:string,ReferenceNo:string,DrillCategoryId:number,DrillId:number,VesselObjectId:number,Vessel:string,AlarmSoundedTime:string,DrillStatus:string}[]>} Array of drill objects
 */
export default async function getDrills(vesselName) {
	console.time("Drills POST request");

	const vesselId = await this.vesselNamesToIds(vesselName);

	// build the Form body
	let bodyFormData = new FormData();
	bodyFormData.append("sort", "");
	bodyFormData.append("group", "");
	bodyFormData.append("filter", "");
	bodyFormData.append("RefNo", "");
	bodyFormData.append("VesselIds", vesselId);
	bodyFormData.append("unitId", "");
	bodyFormData.append("CompanyId", "");
	bodyFormData.append("CategoryId", 1);
	bodyFormData.append("GroupId", "");
	bodyFormData.append("SubGroupId", "");
	bodyFormData.append("DrillId", "");
	bodyFormData.append("FromDate", "");
	bodyFormData.append("ToDate", "");
	bodyFormData.append("StatusId", "");
	bodyFormData.append("ManagerId", "");
	bodyFormData.append("MyVessels", "false");
	bodyFormData.append("MyNotification", "false");

	let options = {
		method: "POST",
		url: `${this.url}/pallpsq/LPSQ/Drill/GetDrillList`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: bodyFormData,
	};

	let response = await axios.request(options);
	console.timeEnd("Drills POST request");
	return response.data.Data;
}
