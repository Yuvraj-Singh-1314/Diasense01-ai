import { describe, expect, it, vi } from 'vitest';
vi.mock('./db', () => ({ createAssessment: vi.fn().mockResolvedValue({ assessmentId: 101, predictionId: 202 }), getAssessmentsByUser: vi.fn().mockResolvedValue([{ id: 101, userId: 7, bmi: '23.7' }]), getAdminStats: vi.fn() }));
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';
const ctx={user:{id:7,openId:'u',name:'Test',email:'test@example.com',loginMethod:'test',role:'user',createdAt:new Date(),updatedAt:new Date(),lastSignedIn:new Date()},req:{} as TrpcContext['req'],res:{} as TrpcContext['res']} as TrpcContext;
const valid={age:34,heightCm:172,weightKg:70,bloodPressure:80,glucose:95,pregnancies:0,skinThickness:20,insulin:80,diabetesPedigree:.3,familyHistory:false,activity:'moderate' as const,gender:'male' as const};
describe('assessments procedures',()=>{
 it('creates a persisted Pima-model payload for valid input',async()=>{const result=await appRouter.createCaller(ctx).assessments.create(valid);expect(result.assessmentId).toBe(101);expect(result.modelVersion).toBe('pima-rf-portable-v1');expect(result.riskPercentage).toBeGreaterThanOrEqual(0);expect(result.recommendations.diet).toBeTruthy();});
 it('rejects invalid age before execution',async()=>{await expect(appRouter.createCaller(ctx).assessments.create({...valid,age:12})).rejects.toMatchObject({code:'BAD_REQUEST'});});
 it('lists assessments for the authenticated user',async()=>{const result=await appRouter.createCaller(ctx).assessments.list();expect(result).toHaveLength(1);expect(result[0]?.userId).toBe(7);});
});
