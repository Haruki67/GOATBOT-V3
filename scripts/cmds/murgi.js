const { findUid } = global.utils;
const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "cdi",
		version: "1.4",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: {
			vi: "Cm th�nh vi�n khi box chat",
			en: "cdi user from box chat"
		},
		category: "box chat",
		guide: {
			vi: "   {pn} [@tag|uid|link fb|reply] [<l� do cm>| trng nu kh�ng c� l� do]: Cm th�nh vi�n khi box chat"
				+ "\n   {pn} check: Kim tra th�nh vi�n b cm v� kick th�nh vi�n � ra khi box chat"
				+ "\n   {pn} unban [@tag|uid|link fb|reply]: B cm th�nh vi�n khi box chat"
				+ "\n   {pn} list: Xem danh s�ch th�nh vi�n b cm",
			en: "   {pn} [@tag|uid|fb link|reply] [<reason>|leave blank if no reason]: Ban user from box chat"
				+ "\n   {pn} check: Check banned members and kick them out of the box chat"
				+ "\n   {pn} unban [@tag|uid|fb link|reply]: Unban user from box chat"
				+ "\n   {pn} list: View the list of banned members"
		}
	},

	langs: {
		vi: {
			notFoundTarget: " | Vui l�ng tag ngi cn cm hoc nhp uid hoc link fb hoc phn hi tin nhn ca ngi cn cm",
			notFoundTargetUnban: " | Vui l�ng tag ngi cn b cm hoc nhp uid hoc link fb hoc phn hi tin nhn ca ngi cn b cm",
			userNotBanned: " | Ngi mang id %1 kh�ng b cm khi box chat n�y",
			unbannedSuccess: " | � b cm %1 khi box chat!",
			cantSelfBan: " | Bn kh�ng th t cm ch�nh m�nh!",
			cantBanAdmin: " | Bn kh�ng th cm qun tr vi�n!",
			existedBan: " | Ngi n�y � b cm t trc!",
			noReason: "Kh�ng c� l� do",
			bannedSuccess: " | � cm %1 khi box chat!",
			needAdmin: " | Bot cn quyn qun tr vi�n  kick th�nh vi�n b cm",
			noName: "Ngi d�ng facebook",
			noData: " | Kh�ng c� th�nh vi�n n�o b cm trong box chat n�y",
			listBanned: " | Danh s�ch th�nh vi�n b cm trong box chat n�y (trang %1/%2)",
			content: "%1/ %2 (%3)\nL� do: %4\nThi gian cm: %5\n\n",
			needAdminToKick: " | Th�nh vi�n %1 (%2) b cm khi box chat, nhng bot kh�ng c� quyn qun tr vi�n  kick th�nh vi�n n�y, vui l�ng cp quyn qun tr vi�n cho bot  kick th�nh vi�n n�y",
			bannedKick: " | %1 � b cm khi box chat t trc!\nUID: %2\nL� do: %3\nThi gian cm: %4\n\nBot � t ng kick th�nh vi�n n�y"
		},
		en: {
			notFoundTarget: " | Please tag the person to cdi or enter uid or fb link or reply to the message of the person to cdi",
			notFoundTargetUnban: " | Please tag the person to uncdi or enter uid or fb link or reply to the message of the person to uncdi",
			userNotBanned: " | The person with id %1 is not cdi from this box chat",
			unbannedSuccess: " | Uncdi %1 from box chat!",
			cantSelfBan: " | You can't ban yourself!",
			cantBanAdmin: " | You can't cdi a the administrator!",
			existedBan: " | This person has been cdi before!",
			noReason: "No reason",
			bannedSuccess: " | Banned %1 from box chat!",
			needAdmin: " | cdi on",
			noName: "Facebook user",
			noData: " | There are no banned members in this box chat",
			listBanned: " | List of banned members in this box chat (page %1/%2)",
			content: "%1/ %2 (%3)\nReason: %4\nBan time: %5\n\n",
			needAdminToKick: " | Member %1 (%2) has been banned from box chat, but the bot does not have administrator permission to kick this member, please grant administrator permission to the bot to kick this member",
			bannedKick: " | %   \n   %2\n %3\n\n !!"
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang, usersData, api }) {
		const { members, adminIDs } = await threadsData.get(event.threadID);
		const { senderID } = event;
		let target;
		let reason;

		const dataBanned = await threadsData.get(event.threadID, 'data.banned_ban', []);

		if (args[0] == 'uncdii) {
			if (!isNaN(args[1]))
				target = args[1];
			else if (args[1]?.startsWith('https'))
				target = await findUid(args[1]);
			else if (Object.keys(event.mentions || {}).length)
				target = Object.keys(event.mentions)[0];
			else if (event.messageReply?.senderID)
				target = event.messageReply.senderID;
			else
				return api.sendMessage(getLang('notFoundTargetUncdi'), event.threadID, event.messageID);

			const index = dataBanned.findIndex(item => item.id == target);
			if (index == -1)
				return api.sendMessage(getLang('userNotcdi', target), event.threadID, event.messageID);

			dataBanned.splice(index, 1);
			await threadsData.set(event.threadID, dataBanned, 'data.banned_cdi');
			const userName = members[target]?.name || await usersData.getName(target) || getLang('noName');

			return api.sendMessage(getLang('uncdiSuccess', userName), event.threadID, event.messageID);
		}
		else if (args[0] == "check") {
			if (!dataBanned.length)
				return;
			for (const user of dataBanned) {
				if (event.participantIDs.includes(user.id))
					api.removeUserFromGroup(user.id, event.threadID);
			}
		}

		if (event.messageReply?.senderID) {
			target = event.messageReply.senderID;
			reason = args.join(' ');
		}
		else if (Object.keys(event.mentions || {}).length) {
			target = Object.keys(event.mentions)[0];
			reason = args.join(' ').replace(event.mentions[target], '');
		}
		else if (!isNaN(args[0])) {
			target = args[0];
			reason = args.slice(1).join(' ');
		}
		else if (args[0]?.startsWith('https')) {
			target = await findUid(args[0]);
			reason = args.slice(1).join(' ');
		}
		else if (args[0] == 'list') {
			if (!dataBanned.length)
				return message.reply(getLang('noData'));
			const limit = 20;
			const page = parseInt(args[1] || 1) || 1;
			const start = (page - 1) * limit;
			const end = page * limit;
			const data = dataBanned.slice(start, end);
			let msg = '';
			let count = 0;
			for (const user of data) {
				count++;
				const name = members[user.id]?.name || await usersData.getName(user.id) || getLang('noName');
				const time = user.time;
				msg += getLang('content', start + count, name, user.id, user.reason, time);
			}
			return message.reply(getLang('listcdi', page, Math.ceil(dataBanned.length / limit)) + '\n\n' + msg);
		}

		if (!target)
			return message.reply(getLang('notFoundTarget'));
		if (target == senderID)
			return message.reply(getLang('cantSelfcdi'));
		if (adminIDs.includes(target))
			return message.reply(getLang('cantcdiAdmin'));

		const banned = dataBanned.find(item => item.id == target);
		if (banned)
			return message.reply(getLang('existedcdi'));

		const name = members[target]?.name || (await usersData.getName(target)) || getLang('noName');
		const time = moment().tz(global.GoatBot.config.timeZone).format('HH:mm:ss DD/MM/YYYY');
		const data = {
			id: target,
			time,
			reason: reason || getLang('noReason')
		};

		dataBanned.push(data);
		await threadsData.set(event.threadID, dataBanned, 'data.banned_cdi');
		message.reply(getLang('bannedSuccess', name), () => {
			if (members.some(item => item.userID == target)) {
				if (adminIDs.includes(api.getCurrentUserID())) {
					if (event.participantIDs.includes(target))
						api.removeUserFromGroup(target, event.threadID);
				}
				else {
					message.send(getLang('needAdmin'), (err, info) => {
						global.GoatBot.onEvent.push({
							messageID: info.messageID,
							onStart: ({ event }) => {
								if (event.logMessageType === "log:thread-admins" && event.logMessageData.ADMIN_EVENT == "add_admin") {
									const { TARGET_ID } = event.logMessageData;
									if (TARGET_ID == api.getCurrentUserID()) {
										api.removeUserFromGroup(target, event.threadID, () => global.GoatBot.onEvent = global.GoatBot.onEvent.filter(item => item.messageID != info.messageID));
									}
								}
							}
						});
					});
				}
			}
		});
	},

	onEvent: async function ({ event, api, threadsData, getLang, message }) {
		if (event.logMessageType == "log:subscribe") {
			const { threadID } = event;
			const dataBanned = await threadsData.get(threadID, 'data.banned_ban', []);
			const usersAdded = event.logMessageData.addedParticipants;

			for (const user of usersAdded) {
				const { userFbId, fullName } = user;
				const banned = dataBanned.find(item => item.id == userFbId);
				if (banned) {
					const reason = banned.reason || getLang('noReason');
					const time = banned.time;
					return api.removeUserFromGroup(userFbId, threadID, err => {
						if (err)
							return message.send(getLang('needAdminToKick', fullName, userFbId), (err, info) => {
								global.GoatBot.onEvent.push({
									messageID: info.messageID,
									onStart: ({ event }) => {
										if (event.logMessageType === "log:thread-admins" && event.logMessageData.ADMIN_EVENT == "add_admin") {
											const { TARGET_ID } = event.logMessageData;
											if (TARGET_ID == api.getCurrentUserID()) {
												api.removeUserFromGroup(userFbId, event.threadID, () => global.GoatBot.onEvent = global.GoatBot.onEvent.filter(item => item.messageID != info.messageID));
											}
										}
									}
								});
							});
						else
							message.send(getLang('bannedKick', fullName, userFbId, reason, time));
					});
				}
			}
		}
	}
};