import usersToIdAndUserName from "./usersToIdAndUserName";

// before running the entire test suite
beforeAll(async () => {
	//
});

const mockUsers = [
	{ UserId: "145161", Name: "Nir Geva" },
	{ UserId: "149755", Name: "Bogdan Bucur" },
];

describe("usersToIdAndUserName", () => {
	it("should return empty string for empty input", async () => {
		const result = await usersToIdAndUserName("");
		expect(result).toBe("");
	});

	it("should return empty string for null input", async () => {
		const result = await usersToIdAndUserName(null);
		expect(result).toBe("");
	});

	it("should return correct id and username for single user input", async () => {
		const mockGetUsers = jest.fn().mockResolvedValue(mockUsers);
		const context = { getUsers: mockGetUsers };

		const result = await usersToIdAndUserName.call(context, ["bogdan", "nir"]);
		expect(result).toEqual({ id: "145161,149755", username: "Nir Geva,Bogdan Bucur" });
	});

	it("should return correct id and username for multiple user input", async () => {
		const mockGetUsers = jest.fn().mockResolvedValue(mockUsers);
		const context = { getUsers: mockGetUsers };

		const result = await usersToIdAndUserName.call(context, "Bogdan");
		expect(result).toEqual({ id: "149755", username: "Bogdan Bucur" });
	});

	it("should handle case-insensitive matching", async () => {
		const mockGetUsers = jest.fn().mockResolvedValue(mockUsers);
		const context = { getUsers: mockGetUsers };

		const result = await usersToIdAndUserName.call(context, "bOgDaN");
		expect(result).toEqual({ id: "149755", username: "Bogdan Bucur" });
	});

	it("should handle no matching users", async () => {
		const mockGetUsers = jest.fn().mockResolvedValue(mockUsers);
		const context = { getUsers: mockGetUsers };

		// Mock console.error
		console.error = jest.fn();

		const result = await usersToIdAndUserName.call(context, "thisuserdoesntexist");
		expect(console.error).toHaveBeenCalledWith("User not found!");
		expect(result).toBeUndefined();
	});
});
