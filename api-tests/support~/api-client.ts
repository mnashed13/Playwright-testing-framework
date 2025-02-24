import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class APIClient {
	private client: AxiosInstance;

	constructor() {
		this.client = axios.create({
			baseURL: process.env.API_BASE_URL,
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		});
	}

	async get(path: string): Promise<AxiosResponse> {
		return await this.client.get(path);
	}

	async post(path: string, data: any): Promise<AxiosResponse> {
		return await this.client.post(path, data);
	}

	async put(path: string, data: any): Promise<AxiosResponse> {
		return await this.client.put(path, data);
	}

	async delete(path: string): Promise<AxiosResponse> {
		return await this.client.delete(path);
	}
}
