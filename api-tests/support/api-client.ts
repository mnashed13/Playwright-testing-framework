import axios, { AxiosRequestConfig } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface RequestConfig {
	data?: any;
	headers?: Record<string, string>;
}

export class APIClient {
	private baseURL: string;

	constructor() {
		// Make sure there's a default if env variable isn't set
		this.baseURL = process.env.API_BASE_URL || 'https://postman-echo.com/';

		console.log('Base URL:', this.baseURL);

		if (!this.baseURL) {
			throw new Error(
				'API_BASE_URL is not configured in environment variables'
			);
		}
	}

	async get(endpoint: string) {
		const url = new URL(endpoint, this.baseURL).toString();
		return await axios.get(url);
	}

	async post(endpoint: string, config: RequestConfig = {}) {
		const url = new URL(endpoint, this.baseURL).toString();
		const axiosConfig: AxiosRequestConfig = {
			headers: config.headers,
		};
		return await axios.post(url, config.data, axiosConfig);
	}

	async put(endpoint: string, data: any) {
		const url = new URL(endpoint, this.baseURL).toString();
		return await axios.put(url, data);
	}

	async delete(path: string): Promise<any> {
		return await axios.delete(path);
	}
}

module.exports = {
	APIClient: APIClient,
};
