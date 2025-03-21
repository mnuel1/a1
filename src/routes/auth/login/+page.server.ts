// import { hash, verify } from '@node-rs/argon2';
import { verify } from '@node-rs/argon2';
// import { encodeBase32LowerCase } from '@oslojs/encoding';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions } from './$types';


export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const loginID = formData.get('loginID');
		const password = formData.get('password');
	
		if (!validateLoginID(loginID)) {				
			return fail(400, {
				idError: 'Login ID is required'
			});
		}
		if (!validatePassword(password)) {
			return fail(400, { passError: 'Password is required' });
		}

		const results = await db.select().from(table.user).where(
			eq(
				table.user.loginID, loginID
			)
		);

		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(400, { errorMsg: 'Incorrect login ID or password' });
		}

		const validPassword = await verify(existingUser.password, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		if (!validPassword) {
			return fail(400, { errorMsg: 'Incorrect login ID or password' });
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect(302, '/manifest');
	},
	// register: async (event) => {
	// 	const formData = await event.request.formData();
	// 	const loginID = formData.get('loginID');
	// 	const password = formData.get('password');
	// 	// const loginID = "001";
	// 	// const password = "001";
	// 	// const name = "admin"
	
	// 	if (!validateLoginID(loginID)) {
	// 		return fail(400, { idError: 'Login ID is required' });
	// 	}
	// 	if (!validatePassword(password)) {
	// 		return fail(400, { passError: 'Password is required' });
	// 	}

	// 	const passwordHash = await hash(password, {
	// 		memoryCost: 19456,
	// 		timeCost: 2,
	// 		outputLen: 32,
	// 		parallelism: 1
	// 	});

	// 	try {
	// 		const [newUser] = await db.insert(table.user)
	// 		.values({ 				
	// 			loginID: loginID, 
	// 			password: passwordHash,
	// 			name: name
	// 		})
	// 		.returning({ id: table.user.id }); // Return the inserted user's ID

	// 		const userId = newUser.id;
	
	// 		const sessionToken = auth.generateSessionToken();
	// 		const session = await auth.createSession(sessionToken, userId);
	// 		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		
	// 	} catch (e) {
	// 		console.log(e);
			
	// 		return fail(500, { errorMsg: 'Something went wrong. Please try again.' });
			
	// 	}
	// 	return redirect(302, '/demo/lucia');
	// }
};

function validateLoginID(loginID: unknown): loginID is string {
	return (
		typeof loginID === 'string' &&
		loginID.length > 1
	);
}

function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && password.length > 1;
}
