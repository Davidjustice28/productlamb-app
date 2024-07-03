import jwt from 'jsonwebtoken';


export function generateInviteToken(email: string, organizationId: string) {
  const SECRET_KEY = process.env.ENCRYPTION_SECRET
  return jwt.sign({ email, organizationId }, SECRET_KEY, { expiresIn: '7d' });
}

export function verifyInviteToken(token: string) {
  const SECRET_KEY = process.env.ENCRYPTION_SECRET!;
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
}