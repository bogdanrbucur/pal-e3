import "dotenv/config";
import getCookie from "../Common/getCookie"; // Import getCookie
import getVessels from "./getVessels";

describe("getVessels", () => {
	let realCookie;
	beforeAll(async () => {
		const context = {
			url: process.env.URL,
			user: process.env.PAL_USER,
			password: process.env.PASSWORD,
		};

		realCookie = await getCookie.call(context); // Get cookie before all tests
	}, 20000);

	const realUrl = process.env.URL;

	it("should return cached vessels if available", async () => {
		const mockCookie = "mockCookie";
		const mockCachedVessels = [
			{ id: 1, name: "Vessel 1" },
			{ id: 2, name: "Vessel 2" },
		];

		const instance = {
			url: realUrl,
			cookie: mockCookie,
			cachedVessels: mockCachedVessels,
		};

		const result = await getVessels.call(instance);

		expect(result).toEqual(mockCachedVessels);
	});

	it("should include one real vessel", async () => {
		const oneVessel = {
			Id: 1244,
			VesselId: 304405,
			VesselObjectId: 246080,
			VesselName: "CHEM SILICON",
			ApprovalCycleTemplateId: 201177,
			ApprovalTemplateId: 201178,
			StopProcess: false,
			ModifiedById: 149836,
			ModifiedOn: "13-Nov-2023 14:52:53",
			IsSelected: false,
			SNo: 27,
		};

		const instance = {
			url: realUrl,
			cookie: realCookie,
			cachedVessels: null,
		};

		const vessels = await getVessels.call(instance);
		expect(vessels).toContainEqual(oneVessel);
	});
});
