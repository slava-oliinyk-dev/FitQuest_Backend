declare namespace Express {
	export interface Request {
		user: string;
	}
}

import { UserModel } from '@prisma/client';

declare global {
	namespace Express {
		interface User {
			id: number;
			email: string;
			role: string;
		}
		interface Request {
			user?: User;
		}
	}
}
