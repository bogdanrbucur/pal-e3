/**
 * Transforms an array/string of usernames to a string of Ids to be used in other allocation methods
 * @private
 * @param {Array<string>} usr String or array of users names: ["Bogdan", "Helen"]
 * @return {Promise<{id: string, username: string}>} Object with 2 strings: {id: "110531,489954", username: "Bogdan Lazar, Lidia Haile"}
 */
export default async function usersToIdAndUserName(usr) {
	if (usr === "") return "";
	if (usr === null) return "";

	let users = await this.getUsers();

	// if input is string, make an array of one item and continue
	if (typeof usr == "string") usr = [`${usr}`];

	let filteredUsers = [];
	users.forEach((user) => {
		const isMatch = usr.some((word) => user.Name.toUpperCase().includes(word.toUpperCase()));
		if (isMatch) filteredUsers.push(user);
	});

	let userIds = "";
	let username = "";
	filteredUsers.forEach((usr) => {
		userIds += usr.UserId += ",";
		username += usr.Name += ",";
	});

	// prune the , at the end and account for ,,
	while (userIds.charAt(userIds.length - 1) === ",") userIds = userIds.slice(0, -1);
	while (username.charAt(username.length - 1) === ",") username = username.slice(0, -1);
	while (userIds.includes(",,")) userIds = userIds.replaceAll(",,", ",");
	while (username.includes(",,")) username = username.replaceAll(",,", ",");

	// if (userIds === "") throw new Error("User not found!");
	if (userIds === "") return console.error("User not found!");

	return { id: userIds, username: username };
}
