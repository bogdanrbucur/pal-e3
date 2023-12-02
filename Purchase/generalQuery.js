import axios from "axios";
import FormData from "form-data";

/**
	 * Gets PAL Purchase documents from General Query
	 * @param {Array} vessels Array of vessel names: ["CHEM MIA", "CHEM ZEALOT"]
	 * @param {number} year
	 * @param {number} docType Requisition: 1, PO: 4
	 * @param {Array} categories Array of Purchase categories names: ["MEDICINE", "PROVISIONS"]
	 * @return {Promise<Array>} Array of objects, each containing a Purchase document
	 */
export default async function generalQuery(vessels, year, docType, categories) {
  console.log("Start General Query POST request...");
  console.time("General Query reponse time");

  // convert the array of vessel names to string of IDs
  let vesslesIdsString = await this.vesselNamesToObjectIds(vessels);

  // convert the array of vessel names to string of IDs
  let catoriesIds = await this.categoriesNamesToIds(categories, "PROC");

  // build the Form body
  let body = new FormData();
  body.append("sort", "");
  body.append("group", "");
  body.append("filter", "");
  body.append("ObjectId", "");
  body.append("whereClause", "");
  body.append("CycleCompletewhereclause", "");
  body.append("vesselId", "");
  body.append("vesselCompanyId", "");
  body.append("vesselOwnerId", "");
  body.append("fleetId", "");
  body.append("vesselGroupId", "");
  body.append("page", 1);
  body.append("pageSize", 50000);
  body.append("flag", "true");
  body.append("FLAG_PCC", "false");
  body.append("QueryType", 0);
  body.append("isAllVessels", "true");
  body.append("CrewManaged", "true");
  body.append("DateFilter", 6);
  body.append("NewVesselObjectId", vesslesIdsString);
  body.append("selectedYear", year);
  body.append(
    "WhereConditions",
    `{
    whereclause: "",
    queryType: 0,
    CycleCompletewhereclause: "",
    FLAG_PCC: false,
    condition1: "Select Any",
    docType: "${docType}",
    SearchCondition1: "Select Any",
    Search1Date: "01-Jan-${year}",
    Search1Dates: "01-Jan-${year}",
    documentPaymentMultiList1: "",
    StatusFilter1: "",
    obj: "4",
    ItemIds1: "",
    AccountIds1: "",
    VesselObjectId_Conv: null,
    combEntity1: "",
    EntityId1: "",
    txtSearch1: "",
    getFilters_txtSearch1: null,
    Condition2: "Select Any",
    SearchCondition2: "Select Any",
    Search2Date: "01-Jan-${year}",
    Search2Dates: "01-Jan-${year}",
    Filter1: "0",
    StatusFilter2: "",
    documentPoMultiList2: "",
    documentInvoiceMultiList2: "",
    documentPaymentMultiList2: "",
    Filter2: "0",
    ItemIds2: "",
    combEntity2: "",
    EntityId2: "",
    AccountIds2: "",
    txtSearch2: "",
    getFilters_txtSearch2: null,
    documentPoMultiList1: "",
    documentInvoiceMultiList1: "",
    Condition3: "Select Any",
    SearchCondition3: "Select Any",
    Search3Date: "01-Jan-${year}",
    Search3Dates: "01-Jan-${year}",
    StatusFilter3: "",
    documentPoMultiList3: "",
    documentInvoiceMultiList3: "",
    documentPaymentMultiList3: "",
    ItemIds3: "",
    combEntity3: "",
    EntityId3: "",
    AccountIds3: "",
    txtSearch3: "",
    getFilters_txtSearch3: null,
    cashPO1: false,
    cashPO2: false,
    GeneralVendorId: "",
    PortId: "",
    CategoriesMultiList: "${catoriesIds}",
    DocumentIn: "0",
  }`
  );

  let options = {
    method: "POST",
    url: `${this.url}/palpurchase/PurchasePAL/GeneralQuery/GetGeneralQueryData`,
    headers: {
      Accept: "*/*",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
      Cookie: `.BSMAuthCookie=${this.cookie}`,
    },
    data: body,
  };

  let response = await axios.request(options);
  console.log("Got POST response for General Query");
  console.log(`${response.data.Total} PRC documents received`);
  console.timeEnd("General Query reponse time");

  return response.data.Data;
}