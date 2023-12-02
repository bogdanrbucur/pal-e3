import axios from "axios";
import qs from "qs";

/**
 * Gets some seafarer contact details based on employee ID (internal code)
 * @private
 * @param {number} empId employee ID
 * @return {Promise<{email:string,phone:string,mobile:string,address:string,skype:string}>} Seafarer object with contact details
 */
export default async function getSeafarerContacts(empId) {
	let data = {
		EmpId: empId,
		localLang: "N",
	};

	let options = {
		method: "POST",
		url: `${this.url}/palcrewing/CrewingPAL/Address/PopulateData`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		data: qs.stringify(data),
	};

	let response = await axios.request(options);
	const results = {
		email: response.data.Email,
		phone: response.data.PPhone1Code + response.data.PPhone1,
		mobile: response.data.PMobileCode + response.data.PMobile,
		address: response.data.PAddress1 + response.data.PCity,
		skype: response.data.SkypeOrIm,
	};

	return results;
}
