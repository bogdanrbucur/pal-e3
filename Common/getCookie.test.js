import getCookie from "./getCookie";
import "dotenv/config";

describe("getCookie", () => {
	jest.setTimeout(30000); // 30 seconds

	it("should return a valid cookie", async () => {
		const mockUrl = process.env.URL;
		const mockUser = process.env.PAL_USER;
		const mockPassword = process.env.PASSWORD;

		const cookie = await getCookie.call({ url: mockUrl, user: mockUser, password: mockPassword });

		expect(cookie).toBeDefined();
		expect(cookie.length).toBe(192);
	});

	it("should throw an error for invalid credentials", async () => {
		const mockUrl = process.env.URL;
		const mockUser = "invalidUser";
		const mockPassword = "invalidPassword";

		await expect(getCookie.call({ url: mockUrl, user: mockUser, password: mockPassword })).rejects.toEqual("Received invalid cookie! Check the login credentials");
	});
});
