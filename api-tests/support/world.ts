import { World } from '@cucumber/cucumber';
import { APIClient } from './api-client';
import { AxiosResponse } from 'axios';

interface CurlCommand {
	scenarioName: string;
	curl: string;
}

export interface CustomWorld extends World {
	apiClient: APIClient;
	response: AxiosResponse | null;
	requestData: any;
	headers: Record<string, string>;
	curlCommands?: CurlCommand[];
}
