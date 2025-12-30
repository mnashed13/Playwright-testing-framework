/**
 * Test Data Generator
 * Generates random test data for database testing
 * Ensures unique values and realistic data for comprehensive testing
 */

export class TestDataGenerator {
	private static usedEmails = new Set<string>();
	private static usedUsernames = new Set<string>();
	private static counter = 0;

	/**
	 * Generate a unique username
	 */
	static generateUsername(prefix: string = 'user'): string {
		this.counter++;
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2, 8);
		const username = `${prefix}_${timestamp}_${random}_${this.counter}`;
		this.usedUsernames.add(username);
		return username;
	}

	/**
	 * Generate a unique email address
	 */
	static generateEmail(domain: string = 'example.com'): string {
		this.counter++;
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2, 8);
		const email = `user_${timestamp}_${random}_${this.counter}@${domain}`;
		this.usedEmails.add(email);
		return email;
	}

	/**
	 * Generate a hashed password (simulated)
	 */
	static generatePasswordHash(): string {
		const random = Math.random().toString(36).substring(2);
		return `$2b$10$hashedpassword${random}1234567890`;
	}

	/**
	 * Generate a random first name
	 */
	static generateFirstName(): string {
		const firstNames = [
			'John',
			'Jane',
			'Michael',
			'Sarah',
			'David',
			'Emily',
			'Robert',
			'Lisa',
			'James',
			'Mary',
			'William',
			'Jennifer',
			'Richard',
			'Linda',
			'Charles',
			'Patricia',
			'Thomas',
			'Barbara',
			'Christopher',
			'Elizabeth',
			'Daniel',
			'Susan',
			'Matthew',
			'Jessica',
			'Anthony',
			'Karen',
		];
		return firstNames[Math.floor(Math.random() * firstNames.length)];
	}

	/**
	 * Generate a random last name
	 */
	static generateLastName(): string {
		const lastNames = [
			'Smith',
			'Johnson',
			'Williams',
			'Brown',
			'Jones',
			'Garcia',
			'Miller',
			'Davis',
			'Rodriguez',
			'Martinez',
			'Hernandez',
			'Lopez',
			'Gonzalez',
			'Wilson',
			'Anderson',
			'Thomas',
			'Taylor',
			'Moore',
			'Jackson',
			'Martin',
			'Lee',
			'Thompson',
			'White',
			'Harris',
			'Clark',
		];
		return lastNames[Math.floor(Math.random() * lastNames.length)];
	}

	/**
	 * Generate a complete user object
	 */
	static generateUser(overrides: Partial<User> = {}): User {
		return {
			username: this.generateUsername(),
			email: this.generateEmail(),
			password_hash: this.generatePasswordHash(),
			first_name: this.generateFirstName(),
			last_name: this.generateLastName(),
			is_active: true,
			...overrides,
		};
	}

	/**
	 * Generate multiple users
	 */
	static generateUsers(count: number, overrides: Partial<User> = {}): User[] {
		const users: User[] = [];
		for (let i = 0; i < count; i++) {
			users.push(this.generateUser(overrides));
		}
		return users;
	}

	/**
	 * Generate a role name
	 */
	static generateRole(): string {
		const roles = ['admin', 'user', 'moderator', 'guest'];
		return roles[Math.floor(Math.random() * roles.length)];
	}

	/**
	 * Generate a user role object
	 */
	static generateUserRole(userId: number, roleName?: string): UserRole {
		return {
			user_id: userId,
			role_name: roleName || this.generateRole(),
		};
	}

	/**
	 * Generate an IP address
	 */
	static generateIPAddress(): string {
		const octet = () => Math.floor(Math.random() * 256);
		return `${octet()}.${octet()}.${octet()}.${octet()}`;
	}

	/**
	 * Generate a user agent string
	 */
	static generateUserAgent(): string {
		const userAgents = [
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
			'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
			'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
		];
		return userAgents[Math.floor(Math.random() * userAgents.length)];
	}

	/**
	 * Generate a login attempt object
	 */
	static generateLoginAttempt(userId: number, success: boolean = true): LoginAttempt {
		return {
			user_id: userId,
			success: success,
			ip_address: this.generateIPAddress(),
			user_agent: this.generateUserAgent(),
			failure_reason: success ? null : this.generateFailureReason(),
		};
	}

	/**
	 * Generate a failure reason for failed login attempts
	 */
	static generateFailureReason(): string {
		const reasons = [
			'Invalid password',
			'Account is inactive',
			'Account is locked',
			'User not found',
			'Too many failed attempts',
			'Session expired',
		];
		return reasons[Math.floor(Math.random() * reasons.length)];
	}

	/**
	 * Generate multiple login attempts
	 */
	static generateLoginAttempts(userId: number, count: number, successRate: number = 0.7): LoginAttempt[] {
		const attempts: LoginAttempt[] = [];
		for (let i = 0; i < count; i++) {
			const success = Math.random() < successRate;
			attempts.push(this.generateLoginAttempt(userId, success));
		}
		return attempts;
	}

	/**
	 * Generate a random date within a range
	 */
	static generateDateInRange(daysAgo: number = 30): Date {
		const now = new Date();
		const pastDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
		const randomTime = pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime());
		return new Date(randomTime);
	}

	/**
	 * Generate a random boolean
	 */
	static generateBoolean(trueChance: number = 0.5): boolean {
		return Math.random() < trueChance;
	}

	/**
	 * Generate a random integer within a range
	 */
	static generateInteger(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	/**
	 * Reset used values (call between tests if needed)
	 */
	static reset(): void {
		this.usedEmails.clear();
		this.usedUsernames.clear();
		this.counter = 0;
	}

	/**
	 * Generate a random string
	 */
	static generateRandomString(length: number = 10): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}
}

// Type definitions for generated test data
export interface User {
	username: string;
	email: string;
	password_hash: string;
	first_name?: string;
	last_name?: string;
	is_active?: boolean;
}

export interface UserRole {
	user_id: number;
	role_name: string;
}

export interface LoginAttempt {
	user_id: number;
	success: boolean;
	ip_address: string;
	user_agent: string;
	failure_reason: string | null;
}

// Export as default for convenient importing
export default TestDataGenerator;


