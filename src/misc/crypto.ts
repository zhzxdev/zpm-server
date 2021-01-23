import nodeUtil from 'util'
import crypto from 'crypto'

export const randomBytesAsync = nodeUtil.promisify(crypto.randomBytes)
export const pbkdf2Async = nodeUtil.promisify(crypto.pbkdf2)

export async function generatePasswordPair(pwd: string): Promise<[string, string]> {
  const salt = await randomBytesAsync(16)
  const hash = await pbkdf2Async(pwd, salt, 1000, 16, 'sha512')
  return [hash.toString('base64'), salt.toString('base64')]
}

export async function verifyPassword(pwd: string, hash: string, salt: string): Promise<boolean> {
  const result = await pbkdf2Async(pwd, Buffer.from(salt, 'base64'), 1000, 16, 'sha512')
  return result.equals(Buffer.from(hash, 'base64'))
}
