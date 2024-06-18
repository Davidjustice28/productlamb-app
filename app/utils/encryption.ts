import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

export function encrypt(data: string, key: string, iv: string) {
  const keyBuffer = Buffer.from(key, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, ivBuffer);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decrypt(encryptedData: string, key: string, iv: string) {
  const keyBuffer = Buffer.from(key, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, keyBuffer, ivBuffer);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
