/**
 * Transforms an array of vessel names to a string of VesselObjectIds to be used in other methods
 * @private
 * @param {array} myVessels Array of vessel names: ["CHEM HOUSTON", "CHEM MIA"]
 * @return {Promise<string>} List of VesselObjectIds as string: "246049,246026"
 */
export default async function vesselNamesToObjectIds(vesselsArray) {
	// make sure the input vessel(s) are all UpperCase
	if (typeof vesselsArray === "string") vesselsArray = vesselsArray.toUpperCase();
	else vesselsArray = vesselsArray.map((vsl) => vsl.toUpperCase());

	// console.log(vesselsArray);

	let vessels = await this.getVessels();
	let filteredVessels = vessels.filter((vessel) => vesselsArray.includes(vessel.VesselName));
	let vesselsIds = "";
	filteredVessels.forEach((vsl) => {
		vesselsIds += vsl.VesselObjectId += ",";
	});

	// prune the , at the end
	while (vesselsIds.charAt(vesselsIds.length - 1) === ",") vesselsIds = vesselsIds.slice(0, -1);

	if (vesselsIds === "") throw new Error("Vessel not found!");
	return vesselsIds;
}
