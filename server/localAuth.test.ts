import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './localAuth';
describe('local password auth',()=>{it('hashes and verifies a strong password',async()=>{const hash=await hashPassword('correct horse battery staple');expect(hash).toMatch(/^scrypt:/);expect(await verifyPassword('correct horse battery staple',hash)).toBe(true);expect(await verifyPassword('wrong password',hash)).toBe(false);});it('rejects weak passwords',async()=>{await expect(hashPassword('short')).rejects.toThrow('at least 10 characters');});});
