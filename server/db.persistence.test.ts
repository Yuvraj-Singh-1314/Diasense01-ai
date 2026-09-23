import { afterEach, describe, expect, it } from "vitest";
import { createAssessment, setDbForTesting } from "./db";

describe("createAssessment persistence helper", () => {
  afterEach(() => setDbForTesting(null));

  it("persists the normalized assessment, prediction, and recommendations in order", async () => {
    const writes: unknown[] = [];
    const ids = [{ id: 101 }, { id: 202 }, { id: 303 }];
    const db = {
      insert: () => ({ values: (payload: unknown) => { writes.push(payload); return { $returningId: async () => [ids.shift()] }; } }),
    } as any;
    setDbForTesting(db);
    await expect(createAssessment({userId:7,age:34,heightCm:172,weightKg:70,bmi:23.7,bloodPressure:80,glucose:95,pregnancies:0,skinThickness:20,insulin:80,diabetesPedigree:.3,familyHistory:false,activity:"moderate",riskPercentage:18,confidence:91,healthScore:82,category:"Low risk",modelVersion:"pima-rf-xgb-ensemble-v1",diet:"Fiber-forward meals",exercise:"Walk daily",lifestyle:"Sleep regularly"})).resolves.toEqual({assessmentId:101,predictionId:202});
    expect(writes).toHaveLength(3);
    expect(writes[0]).toMatchObject({userId:7,heightCm:"172.0",weightKg:"70.0",bmi:"23.7",glucose:"95.0",bloodPressure:"80.0",diabetesPedigree:"0.3000"});
    expect(writes[1]).toMatchObject({assessmentId:101,riskPercentage:18,category:"Low risk",modelVersion:"pima-rf-xgb-ensemble-v1"});
    expect(writes[2]).toMatchObject({predictionId:202,diet:"Fiber-forward meals"});
  });
});
