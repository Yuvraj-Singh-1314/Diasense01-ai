import { z } from "zod";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parse as parseCookie } from "cookie";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getAdminStats,
  createAssessment,
  getAssessmentsByUser,
  getReportsByUser,
  getRecommendationsByPrediction,
  upsertProfile,
  getUserByEmail,
  getUserByOpenId,
  createLocalUser,
  updatePassword,
  updateUserProfile,
  createReportMetadata,
  getLatestAssessmentBundle,
  getReportDownloadUrl,
  getDashboardSummary,
  createDailyHealthLog,
  getDailyHealthLogsByUser,
  getDailyReminderSetting,
  getLatestUnreadDailyReminder,
  markDailyReminderSeen,
  saveDailyReminderSetting,
} from "./db";
import {
  calculateBmi,
  healthScore,
  recommendations,
  riskCategory,
} from "../shared/health";
import { hashPassword, verifyPassword } from "./localAuth";
import { sdk } from "./_core/sdk";
import { generateStoredReport } from "./reportService";
import { invokeLLM } from "./_core/llm";
import {
  buildAssistantMessages,
  normalizeAssistantAnswer,
} from "./assistantPrompt";
import { predictPimaRisk } from "./pimaInference";
import {
  createHeartbeatJob,
  updateHeartbeatJob,
} from "./_core/heartbeat";
import {
  dailyReminderMessage,
  reminderCron,
} from "./dailyReminderUtils";

const assessmentInput = z.object({
  age: z.number().int().min(18).max(120),
  heightCm: z.number().positive().max(250),
  weightKg: z.number().positive().max(400),
  bloodPressure: z.number().positive().max(300).optional(),
  glucose: z.number().positive().max(1000).optional(),
  pregnancies: z.number().int().min(0).max(30).optional(),
  skinThickness: z.number().positive().max(150).optional(),
  insulin: z.number().positive().max(1500).optional(),
  diabetesPedigree: z.number().positive().max(5).optional(),
  familyHistory: z.boolean().default(false),
  activity: z
    .enum(["low", "moderate", "high"])
    .default("moderate"),
  gender: z.enum(["male", "female"]),
  pregnancyStatus: z
    .enum(["no", "yes", "unknown"])
    .optional(),
});

const highRisk = (risk?: number) =>
  typeof risk === "number" && risk >= 50;

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(2).max(120),
          email: z.string().email().max(320),
          password: z.string().min(10).max(128),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const email = input.email.toLowerCase();

        if (await getUserByEmail(email)) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "Unable to create account with those details",
          });
        }

        const id = await createLocalUser({
          name: input.name,
          email,
          passwordHash: await hashPassword(input.password),
        });

        if (!id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
          });
        }

        const token = await sdk.createSessionToken(
          `local:${email}`,
          {
            name: input.name,
            expiresInMs: ONE_YEAR_MS,
          }
        );

        ctx.res.cookie(
          COOKIE_NAME,
          token,
          {
            ...getSessionCookieOptions(ctx.req),
            maxAge: ONE_YEAR_MS,
          }
        );

        return { success: true };
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(1).max(128),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await getUserByEmail(input.email);

        if (
          !user?.passwordHash ||
          !(await verifyPassword(
            input.password,
            user.passwordHash
          ))
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        const token = await sdk.createSessionToken(
          user.openId,
          {
            name: user.name ?? "",
            expiresInMs: ONE_YEAR_MS,
          }
        );

        ctx.res.cookie(
          COOKIE_NAME,
          token,
          {
            ...getSessionCookieOptions(ctx.req),
            maxAge: ONE_YEAR_MS,
          }
        );

        return { success: true };
      }),

    changePassword: protectedProcedure
      .input(
        z.object({
          currentPassword: z.string().min(1),
          newPassword: z.string().min(10).max(128),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await getUserByOpenId(
          ctx.user.openId
        );

        if (
          !user?.passwordHash ||
          !(await verifyPassword(
            input.currentPassword,
            user.passwordHash
          ))
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Current password is incorrect",
          });
        }

        await updatePassword(
          user.id,
          await hashPassword(input.newPassword)
        );

        return { success: true };
      }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2).max(120),
          email: z.string().email().max(320),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await getUserByEmail(
          input.email
        );

        if (
          existing &&
          existing.id !== ctx.user.id
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "That email is already in use",
          });
        }

        await updateUserProfile(
          ctx.user.id,
          input
        );

        return { success: true };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(
        COOKIE_NAME,
        {
          ...getSessionCookieOptions(ctx.req),
          maxAge: -1,
        }
      );

      return { success: true } as const;
    }),
  }),

  assessments: router({
    list: protectedProcedure.query(
      ({ ctx }) => getAssessmentsByUser(ctx.user.id)
    ),

    create: protectedProcedure
      .input(assessmentInput)
      .mutation(async ({ ctx, input }) => {
        const bmi = calculateBmi(
          input.heightCm,
          input.weightKg
        );

        let model;

        try {
          model = await predictPimaRisk({
            ...input,
            bmi,
          });
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "The validated Pima model is temporarily unavailable. Please try again shortly.",
          });
        }

        const risk = model.riskPercentage;
        const category = riskCategory(risk);
        const plan = recommendations({
          bmi,
          activity: input.activity,
        });
        const score = healthScore(risk);

        const result = await createAssessment({
          ...input,
          userId: ctx.user.id,
          bmi,
          riskPercentage: risk,
          confidence: model.confidence,
          healthScore: score,
          category,
          modelVersion: model.modelVersion,
          diet: plan.diet,
          exercise: plan.exercise,
          lifestyle: plan.lifestyle,
        });

        return {
          ...result,
          bmi,
          riskPercentage: risk,
          confidence: model.confidence,
          healthScore: score,
          category,
          modelVersion: model.modelVersion,
          recommendations: plan,
        };
      }),
  }),

  dailyLogs: router({
    list: protectedProcedure.query(
      ({ ctx }) =>
        getDailyHealthLogsByUser(ctx.user.id)
    ),

    exportData: protectedProcedure.query(
      ({ ctx }) =>
        getDailyHealthLogsByUser(ctx.user.id, 1000)
    ),

    create: protectedProcedure
      .input(
        z
          .object({
            glucose: z
              .number()
              .positive()
              .max(1000)
              .optional(),

            systolicPressure: z
              .number()
              .int()
              .positive()
              .max(300)
              .optional(),

            diastolicPressure: z
              .number()
              .int()
              .positive()
              .max(250)
              .optional(),

            steps: z
              .number()
              .int()
              .min(0)
              .max(100000)
              .optional(),

            sleepHours: z
              .number()
              .positive()
              .max(24)
              .optional(),

            waterMl: z
              .number()
              .int()
              .min(0)
              .max(20000)
              .optional(),

            movementMinutes: z
              .number()
              .int()
              .min(0)
              .max(1440)
              .optional(),
          })
          .refine(
            (input) =>
              Object.values(input).some(
                (value) => value !== undefined
              ),
            {
              message:
                "Add at least one check-in value.",
            }
          )
      )
      .mutation(({ ctx, input }) =>
        createDailyHealthLog({
          ...input,
          userId: ctx.user.id,
        })
      ),
  }),

  dailyReminders: router({
    status: protectedProcedure.query(
      async ({ ctx }) => ({
        setting:
          await getDailyReminderSetting(ctx.user.id),
        notice:
          await getLatestUnreadDailyReminder(
            ctx.user.id
          ),
      })
    ),

    save: protectedProcedure
      .input(
        z.object({
          enabled: z.boolean(),
          reminderTime: z
            .string()
            .regex(/^([01]\d|2[0-3]):[0-5]\d$/),
          timezoneOffsetMinutes: z
            .number()
            .int()
            .min(-840)
            .max(840),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing =
          await getDailyReminderSetting(
            ctx.user.id
          );

        const sessionToken =
          parseCookie(
            ctx.req.headers.cookie ?? ""
          )[COOKIE_NAME] ?? "";

        const cron = reminderCron(
          input.reminderTime,
          input.timezoneOffsetMinutes
        );

        let scheduleCronTaskUid =
          existing?.scheduleCronTaskUid ?? null;

        if (existing?.scheduleCronTaskUid) {
          await updateHeartbeatJob(
            existing.scheduleCronTaskUid,
            {
              cron,
              path:
                "/api/scheduled/daily-health-reminder",
              method: "POST",
              description:
                "Private Daily Health Check-in reminder",
              enable: input.enabled,
            },
            sessionToken
          );
        } else if (input.enabled) {
          const job =
            await createHeartbeatJob(
              {
                name: `daily-health-${ctx.user.id}`,
                cron,
                path:
                  "/api/scheduled/daily-health-reminder",
                method: "POST",
                description:
                  "Private Daily Health Check-in reminder",
              },
              sessionToken
            );

          scheduleCronTaskUid =
            job.taskUid;
        }

        const setting =
          await saveDailyReminderSetting({
            ...input,
            userId: ctx.user.id,
            scheduleCronTaskUid,
          });

        return { setting };
      }),

    markSeen: protectedProcedure
      .input(
        z.object({
          noticeId: z
            .number()
            .int()
            .positive(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await markDailyReminderSeen(
          ctx.user.id,
          input.noticeId
        );

        return { success: true };
      }),
  }),

  dashboard: router({
    summary: protectedProcedure.query(
      ({ ctx }) =>
        getDashboardSummary(ctx.user.id)
    ),
  }),

  profile: router({
    save: protectedProcedure
      .input(
        z.object({
          gender: z.enum(["male", "female"]),
          heightCm: z.number().positive().optional(),
          weightKg: z.number().positive().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        upsertProfile({
          ...input,
          userId: ctx.user.id,
        })
      ),
  }),

  reports: router({
    list: protectedProcedure.query(
      ({ ctx }) =>
        getReportsByUser(ctx.user.id)
    ),

    downloadUrl: protectedProcedure
      .input(
        z.object({
          reportId: z
            .string()
            .min(1)
            .max(64),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const url =
          await getReportDownloadUrl(
            ctx.user.id,
            input.reportId
          );

        if (!url) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Report file is unavailable.",
          });
        }

        return { url };
      }),

    createMetadata: protectedProcedure
      .input(
        z.object({
          assessmentId: z
            .number()
            .int()
            .positive(),
          storageUrl: z
            .string()
            .max(2048)
            .optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        createReportMetadata({
          ...input,
          userId: ctx.user.id,
        })
      ),

    generate: protectedProcedure
      .input(
        z.object({
          assessmentId: z
            .number()
            .int()
            .positive(),
          name: z
            .string()
            .min(1)
            .max(120),
          risk: z
            .number()
            .min(0)
            .max(100),
          confidence: z
            .number()
            .min(0)
            .max(100),
          bmi: z.number().positive(),
          healthScore: z
            .number()
            .min(0)
            .max(100),
          category: z
            .string()
            .max(40),
          diet: z
            .string()
            .max(500),
          exercise: z
            .string()
            .max(500),
          lifestyle: z
            .string()
            .max(500),
        })
      )
      .mutation(({ ctx, input }) =>
        generateStoredReport({
          ...input,
          userId: ctx.user.id,
        })
      ),

    generateLatest: protectedProcedure.mutation(
      async ({ ctx }) => {
        const bundle =
          await getLatestAssessmentBundle(
            ctx.user.id
          );

        if (!bundle?.prediction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Complete an assessment before generating a report.",
          });
        }

        return generateStoredReport({
          userId: ctx.user.id,
          assessmentId: bundle.assessment.id,
          name:
            ctx.user.name ?? "DiaSense user",
          risk:
            bundle.prediction.riskPercentage,
          confidence:
            bundle.prediction.confidence,
          bmi: Number(bundle.assessment.bmi),
          healthScore:
            bundle.prediction.healthScore,
          category:
            bundle.prediction.category,
          diet:
            bundle.recommendation?.diet ??
            "Maintain a balanced, fiber-forward plate.",
          exercise:
            bundle.recommendation?.exercise ??
            "Add regular moderate movement.",
          lifestyle:
            bundle.recommendation?.lifestyle ??
            "Protect consistent sleep and hydration.",
        });
      }
    ),
  }),

  recommendations: router({
    byPrediction: protectedProcedure
      .input(
        z.object({
          predictionId: z
            .number()
            .int()
            .positive(),
        })
      )
      .query(({ input }) =>
        getRecommendationsByPrediction(
          input.predictionId
        )
      ),
  }),

  assistant: router({
    status: protectedProcedure.query(
      async ({ ctx }) => {
        const bundle =
          await getLatestAssessmentBundle(
            ctx.user.id
          );

        const risk =
          bundle?.prediction?.riskPercentage;

        return {
          risk: risk ?? null,
          category:
            bundle?.prediction?.category ??
            null,
          highRisk: highRisk(risk),
        };
      }
    ),

    chat: protectedProcedure
      .input(
        z.object({
          message: z
            .string()
            .trim()
            .min(1)
            .max(1000),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const bundle =
          await getLatestAssessmentBundle(
            ctx.user.id
          );

        const risk =
          bundle?.prediction?.riskPercentage;

        const context =
          `User name: ${
            ctx.user.name ?? "Account holder"
          }\nLatest assessment: ${
            risk === undefined
              ? "not available"
              : `risk ${risk}%, category ${
                  bundle?.prediction?.category ??
                  "unknown"
                }, BMI ${
                  bundle?.assessment?.bmi ??
                  "unknown"
                }, health score ${
                  bundle?.prediction
                    ?.healthScore ?? "unknown"
                }`
          }\nRecommendations: diet ${
            bundle?.recommendation?.diet ??
            "not available"
          }; movement ${
            bundle?.recommendation?.exercise ??
            "not available"
          }; lifestyle ${
            bundle?.recommendation?.lifestyle ??
            "not available"
          }.`;

        try {
          const result = await invokeLLM({
            messages:
              buildAssistantMessages({
                context,
                message: input.message,
              }),
            max_tokens: 450,
          });

          const content =
            result.choices[0]?.message.content;

          return {
            answer:
              typeof content === "string"
                ? normalizeAssistantAnswer(
                    content
                  )
                : "I could not generate a response right now. Please try again.",

            highRisk: highRisk(risk),

            risk: risk ?? null,
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : String(error);

          console.error(
            "[Assistant] AI request failed:",
            errorMessage
          );

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: errorMessage,
          });
        }
      }),
  }),

  admin: router({
    stats: protectedProcedure.query(
      async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
          });
        }

        return getAdminStats();
      }
    ),
  }),
});

export type AppRouter = typeof appRouter;