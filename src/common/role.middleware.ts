import { Request, Response, NextFunction } from 'express';
import { HTTPError } from '../errors/http-error.class';

type Role = 'USER' | 'ADMIN';

export function RoleMiddleware(requiredRoles: Role[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = req.user as { role: Role };
		if (user && user.role && requiredRoles.includes(user.role)) {
			next();
		} else {
			next(new HTTPError(403, 'Insufficient rights to perform this action'));
		}
	};
}
