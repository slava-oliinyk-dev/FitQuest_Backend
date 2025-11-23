import { NextFunction, Request, Response } from 'express';
import { HTTPError } from '../errors/http-error.class';

export class CsrfMiddleware {
	execute(req: Request, _res: Response, next: NextFunction): void {
		const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

		if (safeMethods.includes(req.method)) {
			return next();
		}

		const csrfCookie = req.cookies?.csrfToken;
		const csrfHeader = req.headers['x-csrf-token'];

		if (!csrfCookie || typeof csrfHeader !== 'string' || csrfHeader !== csrfCookie) {
			return next(new HTTPError(403, 'CSRF token validation failed'));
		}

		return next();
	}
}
