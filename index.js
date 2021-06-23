const axios = require("axios");

const calcTime = (offset) => {
	var d = new Date();
	var utc = d.getTime() + d.getTimezoneOffset() * 60000;
	var nd = new Date(utc + 3600000 * offset);

	const date = nd.getDate() > 9 ? nd.getDate() : `0${nd.getDate()}`;
	const month =
		nd.getMonth() + 1 > 9 ? nd.getMonth() + 1 : `0${nd.getMonth() + 1}`;

	return `${date}-${month}-2021`;
};

const handler = async (event) => {
	const _date = calcTime("+5.5");
	const CHAT_ID = "";
	const BOT_API_KEY = "";

	const _res = await new Promise(async (resolve, reject) => {
		axios
			.get(
				`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=389&date=${_date}`
			)
			.then(async ({ data }) => {
				const centers = data.centers;

				let out = centers.reduce((acc, curr) => {
					const sessions = curr.sessions.map((_el) => ({
						name: curr.name,
						address: curr.address,
						..._el,
					}));

					acc = acc.concat(sessions);
					return acc;
				}, []);

				dates = Array.from(new Set(out.map((el) => el.date)));
				console.log(dates);

				out = out
					.filter((el) => el.min_age_limit === 18)
					.filter((el) => el.available_capacity_dose1 > 0)
					.filter((el) => el.vaccine === "COVAXIN");

				if (new Date().getMinutes() % 10 === 0) {
					await new Promise((res, rej) => {
						// Interval Pings
						axios
							.get(
								`https://api.telegram.org/bot${BOT_API_KEY}/sendMessage?chat_id=${CHAT_ID}&text=Interval Ping`
							)
							.then(({ data }) => {
								console.log(data);
								res(data);
							})
							.catch((err) => {
								rej(err);
							});
					});
				}

				if (out.length > 0) {
					const _data = await new Promise((res, rej) => {
						// Positive Responses
						axios
							.get(
								`https://api.telegram.org/bot${BOT_API_KEY}/sendMessage?chat_id=${CHAT_ID}&text=${out.length} slot(s) available in Nasik for dose 1 of COVAXIN. Checked on ${_date}. Showing for ${dates}`
							)
							.then(({ data }) => {
								console.log(data);
								res(data);
							})
							.catch((err) => {
								rej(err);
							});
					});
					resolve(_data);
				} else {
					resolve(null);
				}
			})
			.catch((err) => reject(err));
	});

	const response = {
		statusCode: 200,
		body: JSON.stringify(_res, null, 2),
	};

	return response;
};

exports.handler = handler;

// handler();
