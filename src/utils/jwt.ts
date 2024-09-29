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