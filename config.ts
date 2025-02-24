import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
	apiBaseUrl: process.env.API_BASE_URL,
	apiToken: process.env.API_TOKEN,
	timeout: 30000,
};
