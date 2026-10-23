import { Buffer } from 'node:buffer'
import { randomBytes, scrypt as callbackScrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(callbackScrypt)
const PARAMETERS = Object.freeze({ N: 16384, r: 8, p: 1, keyLength: 64 })
const DUMMY_SECRET = randomBytes(32)
const DUMMY_SALT = randomBytes(16)
const DUMMY_HASH_PROMISE = scrypt(DUMMY_SECRET, DUMMY_SALT, PARAMETERS.keyLength, {
  N: PARAMETERS.N, r: PARAMETERS.r, p: PARAMETERS.p,
})

export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password, 'utf8') > 1024) {
    throw new Error('Password must be at least 12 characters and no more than 1024 bytes.')
  }
}

export async function hashPassword(password) {
  validatePassword(password)
  const salt = randomBytes(16)
  const derivedKey = await scrypt(password, salt, PARAMETERS.keyLength, {
    N: PARAMETERS.N, r: PARAMETERS.r, p: PARAMETERS.p,
  })
  return `scrypt$${PARAMETERS.N}$${PARAMETERS.r}$${PARAMETERS.p}$${salt.toString('hex')}$${derivedKey.toString('hex')}`
}

export async function verifyPassword(password, encodedHash) {
  const parts = typeof encodedHash === 'string' ? encodedHash.split('$') : []
  const validEncoding = parts.length === 6 &&
    parts[0] === 'scrypt' &&
    Number(parts[1]) === PARAMETERS.N &&
    Number(parts[2]) === PARAMETERS.r &&
    Number(parts[3]) === PARAMETERS.p &&
    /^[a-f0-9]{32}$/.test(parts[4]) &&
    /^[a-f0-9]{128}$/.test(parts[5])
  if (!validEncoding) {
    const dummy = await DUMMY_HASH_PROMISE
    const candidate = await scrypt(String(password), DUMMY_SALT, PARAMETERS.keyLength, {
      N: PARAMETERS.N, r: PARAMETERS.r, p: PARAMETERS.p,
    })
    timingSafeEqual(candidate, dummy)
    return false
  }
  const candidate = await scrypt(String(password), Buffer.from(parts[4], 'hex'), PARAMETERS.keyLength, {
    N: PARAMETERS.N, r: PARAMETERS.r, p: PARAMETERS.p,
  })
  return timingSafeEqual(candidate, Buffer.from(parts[5], 'hex'))
}
