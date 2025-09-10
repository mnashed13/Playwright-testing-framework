import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export class LambdaTestTunnel {
	private tunnelProcess: ChildProcess | null = null;
	private tunnelName: string;
	private username: string;
	private accessKey: string;
	private isConnected: boolean = false;

	constructor() {
		this.username = process.env.LT_USERNAME || '';
		this.accessKey = process.env.LT_ACCESS_KEY || '';
		this.tunnelName = process.env.LT_TUNNEL_NAME || `tunnel_${Date.now()}`;

		if (!this.username || !this.accessKey) {
			throw new Error(
				'LambdaTest credentials (LT_USERNAME, LT_ACCESS_KEY) are required'
			);
		}
	}

	/**
	 * Start LambdaTest tunnel
	 */
	async start(): Promise<void> {
		return new Promise((resolve, reject) => {
			console.log('🚀 Starting LambdaTest tunnel...');

			// Download tunnel binary if not exists
			this.downloadTunnelBinary()
				.then(() => {
					const tunnelPath = this.getTunnelBinaryPath();

					const args = [
						'--user',
						this.username,
						'--key',
						this.accessKey,
						'--tunnelName',
						this.tunnelName,
						'--infoAPIPort',
						'8000',
						'--verbose',
					];

					// Add additional options from environment
					if (process.env.LT_TUNNEL_VERBOSE === 'true') {
						args.push('--verbose');
					}

					if (process.env.LT_TUNNEL_PROXY) {
						args.push('--proxy', process.env.LT_TUNNEL_PROXY);
					}

					if (process.env.LT_TUNNEL_SHARED === 'true') {
						args.push('--shared-tunnel');
					}

					this.tunnelProcess = spawn(tunnelPath, args, {
						stdio: 'pipe',
					});

					this.tunnelProcess.stdout?.on('data', (data) => {
						const output = data.toString();
						console.log(`Tunnel: ${output.trim()}`);

						if (output.includes('Tunnel is now active')) {
							this.isConnected = true;
							console.log('✅ LambdaTest tunnel connected successfully');
							resolve();
						}
					});

					this.tunnelProcess.stderr?.on('data', (data) => {
						const error = data.toString();
						console.error(`Tunnel Error: ${error.trim()}`);
					});

					this.tunnelProcess.on('error', (error) => {
						console.error('Failed to start tunnel process:', error);
						reject(error);
					});

					this.tunnelProcess.on('close', (code) => {
						console.log(`Tunnel process exited with code ${code}`);
						this.isConnected = false;
					});

					// Timeout after 60 seconds
					setTimeout(() => {
						if (!this.isConnected) {
							this.stop();
							reject(new Error('Tunnel connection timeout'));
						}
					}, 60000);
				})
				.catch(reject);
		});
	}

	/**
	 * Stop LambdaTest tunnel
	 */
	async stop(): Promise<void> {
		return new Promise((resolve) => {
			if (this.tunnelProcess) {
				console.log('🛑 Stopping LambdaTest tunnel...');

				this.tunnelProcess.kill('SIGTERM');

				setTimeout(() => {
					if (this.tunnelProcess && !this.tunnelProcess.killed) {
						this.tunnelProcess.kill('SIGKILL');
					}
					this.isConnected = false;
					console.log('✅ LambdaTest tunnel stopped');
					resolve();
				}, 5000);
			} else {
				resolve();
			}
		});
	}

	/**
	 * Check if tunnel is connected
	 */
	isActive(): boolean {
		return this.isConnected;
	}

	/**
	 * Get tunnel name
	 */
	getTunnelName(): string {
		return this.tunnelName;
	}

	/**
	 * Download LambdaTest tunnel binary
	 */
	private async downloadTunnelBinary(): Promise<void> {
		const tunnelPath = this.getTunnelBinaryPath();

		if (fs.existsSync(tunnelPath)) {
			console.log('Tunnel binary already exists');
			return;
		}

		console.log('📥 Downloading LambdaTest tunnel binary...');

		const platform = process.platform;
		const arch = process.arch;

		let downloadUrl: string;
		let binaryName: string;

		if (platform === 'win32') {
			binaryName = 'LT.exe';
			downloadUrl =
				arch === 'x64'
					? 'https://downloads.lambdatest.com/tunnel/v3/windows/64bit/LT_Windows.zip'
					: 'https://downloads.lambdatest.com/tunnel/v3/windows/32bit/LT_Windows.zip';
		} else if (platform === 'darwin') {
			binaryName = 'LT';
			downloadUrl =
				'https://downloads.lambdatest.com/tunnel/v3/mac/64bit/LT_Mac.zip';
		} else {
			binaryName = 'LT';
			downloadUrl =
				arch === 'x64'
					? 'https://downloads.lambdatest.com/tunnel/v3/linux/64bit/LT_Linux.zip'
					: 'https://downloads.lambdatest.com/tunnel/v3/linux/32bit/LT_Linux.zip';
		}

		// Create tunnel directory
		const tunnelDir = path.dirname(tunnelPath);
		if (!fs.existsSync(tunnelDir)) {
			fs.mkdirSync(tunnelDir, { recursive: true });
		}

		// Download and extract (simplified - in production, you'd want proper download/extraction)
		console.log(`Download URL: ${downloadUrl}`);
		console.log(
			'⚠️  Please manually download and extract the tunnel binary to:',
			tunnelPath
		);
		console.log('   Or use the LambdaTest CLI: npm install -g lambdatest-cli');

		// For now, assume the binary is available or will be provided
		// In a real implementation, you'd download and extract the zip file
	}

	/**
	 * Get tunnel binary path
	 */
	private getTunnelBinaryPath(): string {
		const platform = process.platform;
		const binaryName = platform === 'win32' ? 'LT.exe' : 'LT';
		return path.join(process.cwd(), 'tunnel', binaryName);
	}
}

// CLI usage
if (require.main === module) {
	const tunnel = new LambdaTestTunnel();

	const command = process.argv[2];

	if (command === 'start') {
		tunnel
			.start()
			.then(() => {
				console.log('Tunnel started successfully');
				// Keep process running
				process.on('SIGINT', async () => {
					await tunnel.stop();
					process.exit(0);
				});
			})
			.catch((error) => {
				console.error('Failed to start tunnel:', error);
				process.exit(1);
			});
	} else if (command === 'stop') {
		tunnel
			.stop()
			.then(() => {
				console.log('Tunnel stopped successfully');
				process.exit(0);
			})
			.catch((error) => {
				console.error('Failed to stop tunnel:', error);
				process.exit(1);
			});
	} else {
		console.log('Usage: ts-node lambdatest-tunnel.ts [start|stop]');
		process.exit(1);
	}
}
