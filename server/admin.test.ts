import { describe, expect, it, vi } from 'vitest';
vi.mock('./db', () => ({ getAdminStats: vi.fn().mockResolvedValue({ users: 12, assessments: 30, reports: 21, predictions: 30 }), createAssessment: vi.fn(), getAssessmentsByUser: vi.fn() }));
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';
const user=(role:'user'|'admin')=>({id:7,openId:role,name:role,email:`${role}@example.com`,loginMethod:'test',role,createdAt:new Date(),updatedAt:new Date(),lastSignedIn:new Date()});
const context=(role:'user'|'admin')=>({user:user(role),req:{ } as TrpcContext['req'],res:{} as TrpcContext['res']}) as TrpcContext;
describe('admin.stats',()=>{
  it('rejects non-admin users',async()=>await expect(appRouter.createCaller(context('user')).admin.stats()).rejects.toMatchObject({code:'FORBIDDEN'}));
  it('returns the aggregate shape for admins',async()=>{const result=await appRouter.createCaller(context('admin')).admin.stats();expect(result).toEqual({users:12,assessments:30,reports:21,predictions:30});});
});
