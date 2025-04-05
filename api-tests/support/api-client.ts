const axios = require('axios');

namespace API {
	export class APIClient {
		private client: any;

		constructor() {
			this.client = axios.create({
				baseURL: process.env.API_BASE_URL,
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
			});
		}

		// ... rest of the methods stay the same ...
	}
}

module.exports = {
	APIClient: API.APIClient,
};
