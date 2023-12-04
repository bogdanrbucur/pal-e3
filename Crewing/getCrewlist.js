import axios from "axios";
import FormData from "form-data";

/**
 * Get the crew list for a vessel if provided, or all vessels if not
 * @return {Promise<{Id:number,VslName:string,EmpId:number,EmpNo:string,FullName:string,Nationality:string}[]>} Array of objects, each containing a seafarer
 */
export default async function getCrewlist(vesselName) {
	console.log("Start Crewlist request...");
	console.time("Crewlist request");

	// if a vessel name is provieded, get the vesselId and make an array of one vesselId
	var vesselsIds = [];
	if (vesselName) {
		vesselsIds[0] = await this.vesselNamesToIds(vesselName);
	} else {
		const vessels = await this.getVessels();
		for (let vessel of vessels) {
			vesselsIds.push(vessel.VesselId);
		}
	}

	// build the Form body
	const bodyFormData = new URLSearchParams();
	bodyFormData.append("sort", "");
	bodyFormData.append("page", 1);
	bodyFormData.append("pageSize", 1000);
	bodyFormData.append("group", "");
	bodyFormData.append("filter", "");
	bodyFormData.append("ownersArray", "");
	bodyFormData.append("sdcsArray[]", 1);
	bodyFormData.append("cscsArray", "");
	bodyFormData.append("extAgencyArray", "");
	bodyFormData.append("SubCompanyArray", "");
	bodyFormData.append("workGroupArray", "");
	bodyFormData.append("vesselCategoryArray", "");
	bodyFormData.append("vesselTypeArray", "");
	bodyFormData.append("vslSubTypeArray", "");
	bodyFormData.append("ManagementType", "");
	bodyFormData.append("ServiceStatus", "null");
	bodyFormData.append("RegisteredOwner", "");
	bodyFormData.append("Flag", "");
	bodyFormData.append("EngineMake", "");
	bodyFormData.append("rankArray", "");
	bodyFormData.append("commonrankgrouparray", "");
	bodyFormData.append("commonRankDepartmentArray", "");
	bodyFormData.append("commonRankCategoryArray", "");
	bodyFormData.append("CommonMisGroupArray", "");
	bodyFormData.append("CommoFunctionalGroup", "");
	bodyFormData.append("IncludeInactive", "Y");
	bodyFormData.append("IncludeFuture", "Y");
	bodyFormData.append("IncludeNonRealVessel", "N");
	bodyFormData.append("nationalityArray", "");

	vesselsIds.forEach((vesselId) => {
		bodyFormData.append("vesselArray[]", vesselId);
	});

	bodyFormData.append("showFullName", "false");
	bodyFormData.append("showActual", "false");
	bodyFormData.append("showExp", "false");
	bodyFormData.append("showPay", "false");
	bodyFormData.append("sailOnly", "false");
	bodyFormData.append("showtravelDates", "false");
	bodyFormData.append("ExcludeSignOff", "false");
	bodyFormData.append("otherOption", "A");
	bodyFormData.append("reliefDue", 0);
	bodyFormData.append("isHighlightExp", "false");

  // TODO continue

	const response = await fetch(`${this.url}/palqdms/QDMS/DocumentLibrary/DocumentList_Read`, {
		method: "POST",
		headers: { Cookie: `.BSMAuthCookie=${this.cookie}` },
		body: bodyFormData,
	});

	const body = await response.json();
	if (body.Errors) throw new Error(body.Errors);

	return body;
}
