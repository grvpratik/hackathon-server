import { jwtVerify } from 'jose';
import * as jose from 'jose';
import { SECRET_KEY } from '../config/constant';

const secret = new TextEncoder().encode(SECRET_KEY);

export async function createPaymentToken(payerId: string, taskId: string): Promise<string> {
    return await new jose.SignJWT({ payerId, taskId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(secret);
}

export async function createSessionToken(id: string, tg_id: any) {
    const telegramId=tg_id.toString()
    const jwt = await new jose.SignJWT({ id, telegramId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30day')
        .sign(secret)

    return jwt
}

export async function verifySessionToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload; // Return the decoded payload if verification is successful
    } catch (error) {
        console.error('Token verification failed:', error);
        return null; // or throw an error
    }
}
