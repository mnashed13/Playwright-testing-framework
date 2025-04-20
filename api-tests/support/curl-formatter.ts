import { IFormatterOptions } from '@cucumber/cucumber';
import { AxiosResponse } from 'axios';

export class CurlFormatter {
	static generateCurlCommand(response: AxiosResponse): string {
		const { config } = response;
		const { method, url, data, headers } = config;

		let curlCommand = `curl --location '${url}'`;

		// Add headers
		if (headers) {
			Object.entries(headers).forEach(([key, value]) => {
				if (key.toLowerCase() !== 'common' && key.toLowerCase() !== 'delete') {
					curlCommand += `\n  --header '${key}: ${value}'`;
				}
			});
		}

		// Add data for POST/PUT requests
		if (data) {
			curlCommand += `\n  --data '${
				typeof data === 'string' ? data : JSON.stringify(data, null, 2)
			}'`;
		}

		return curlCommand;
	}
}
