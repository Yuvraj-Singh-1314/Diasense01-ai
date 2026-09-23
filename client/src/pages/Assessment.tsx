import { useMemo, useState } from "react";
import { Activity, ArrowLeft, ArrowRight, Check, Info } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { optionalPositiveNumber, parseDiastolicPressure } from "@/lib/assessmentInput";
import { signInPathFor } from "@/lib/authRedirect";

const field =
  "mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-300";

type Gender = "male" | "female";

type Result = {
  riskPercentage: number;
  confidence: number;
  healthScore: number;
  bmi: number;
  modelVersion: string;
};

export default function Assessment() {
  const { user, loading, error } = useAuth();
  const create = trpc.assessments.create.useMutation();

  const [gender, setGender] = useState<Gender | null>(null);
  const [height, setHeight] = useState("172");
  const [weight, setWeight] = useState("70");
  const [age, setAge] = useState("34");
  const [bloodPressure, setBloodPressure] = useState("");
  const [glucose, setGlucose] = useState("");
  const [familyHistory, setFamilyHistory] = useState(false);
  const [activity, setActivity] =
    useState<"low" | "moderate" | "high">("moderate");

  const [pregnancyStatus, setPregnancyStatus] =
    useState<"no" | "yes" | "unknown">("no");

  const [pregnancies, setPregnancies] = useState("0");
  const [skinThickness, setSkinThickness] = useState("");

  // Kept for ML/prediction compatibility.
  // These values are no longer shown in the UI.
  const [insulin] = useState("");
  const [diabetesPedigree] = useState("");

  const [result, setResult] = useState<Result | null>(null);

  const bmi = useMemo(() => {
    const meters = Number(height) / 100;
    return meters
      ? Number(weight) / (meters * meters)
      : 0;
  }, [height, weight]);

  if (loading) {
    return (
      <div className="app-shell grid min-h-screen place-items-center">
        <div className="eyebrow">Loading secure assessment</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell grid min-h-screen place-items-center p-6">
        <div className="panel p-8 text-center">
          <div className="eyebrow">Session error</div>

          <h1 className="mt-4 text-2xl font-bold text-white">
            We couldn’t verify your session.
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Please refresh or sign in again.
          </p>

          <Link
            href={signInPathFor("/assessment")}
            className="btn-primary mt-6 inline-flex px-5 py-3 no-underline"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-shell grid min-h-screen place-items-center p-6">
        <div className="panel p-8 text-center">
          <div className="eyebrow">Authentication required</div>

          <h1 className="mt-4 text-2xl font-bold text-white">
            Sign in to begin your assessment.
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            After you sign in, you will return here and can start your
            assessment.
          </p>

          <Link
            href={signInPathFor("/assessment")}
            className="btn-primary mt-6 inline-flex px-5 py-3 no-underline"
          >
            Sign in to run assessment
          </Link>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="app-shell">
        <div className="container-wide py-10">
          <Link
            href="/dashboard"
            className="text-sm text-slate-400 no-underline"
          >
            ← Back to overview
          </Link>

          <div className="mx-auto mt-16 max-w-2xl text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-emerald-300/40 bg-emerald-300/10 text-emerald-300">
              <Check />
            </div>

            <div className="eyebrow mt-8">Assessment complete</div>

            <h1 className="mt-3 text-5xl font-bold text-white">
              Your signal is ready, {user.name ?? "there"}.
            </h1>

            <p className="mt-4 text-slate-400">
              This informational estimate uses the values you submitted. It
              is not a medical diagnosis.
            </p>

            <div className="panel bracket mt-10 p-8">
              <div className="mono text-[10px] text-slate-500">
                ESTIMATED RISK SIGNAL
              </div>

              <div className="mt-2 text-7xl font-extrabold text-cyan-300">
                {result.riskPercentage}%
              </div>

              <div className="mx-auto mt-5 h-2 max-w-sm bg-slate-800">
                <div
                  className="h-full bg-cyan-300"
                  style={{ width: `${result.riskPercentage}%` }}
                />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-800 pt-5 text-left">
                <div>
                  <span className="mono text-[10px] text-slate-500">
                    BMI
                  </span>
                  <b className="block text-xl text-white">
                    {result.bmi.toFixed(1)}
                  </b>
                </div>

                <div>
                  <span className="mono text-[10px] text-slate-500">
                    HEALTH SCORE
                  </span>
                  <b className="block text-xl text-white">
                    {result.healthScore}/100
                  </b>
                </div>

                <div>
                  <span className="mono text-[10px] text-slate-500">
                    MODEL CONSISTENCY
                  </span>
                  <b className="block text-xl text-white">
                    {result.confidence}%
                  </b>
                </div>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                Model: {result.modelVersion}. Model consistency is not a
                clinical certainty.
              </p>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/insights"
                className="btn-primary px-5 py-3 no-underline"
              >
                View insights{" "}
                <ArrowRight size={16} className="ml-2 inline" />
              </Link>

              <Link
                href="/reports"
                className="btn-ghost px-5 py-3 no-underline"
              >
                View report
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const submit = () =>
    create.mutate(
      {
        age: Number(age),
        heightCm: Number(height),
        weightKg: Number(weight),
        bloodPressure: parseDiastolicPressure(bloodPressure),
        glucose: optionalPositiveNumber(glucose),

        // Pregnancies is only applicable to female profile.
        pregnancies: gender === "female" ? Number(pregnancies) : 0,

        skinThickness: optionalPositiveNumber(skinThickness),

        // Keep these fields for the existing ML/prediction pipeline.
        // They remain empty because they are no longer user inputs.
        insulin: optionalPositiveNumber(insulin),
        diabetesPedigree: optionalPositiveNumber(diabetesPedigree),

        gender: gender!,
        activity,
        familyHistory,

        pregnancyStatus:
          gender === "female" ? pregnancyStatus : undefined,
      },
      {
        onSuccess: setResult,
      }
    );

  return (
    <div className="app-shell">
      <div className="container-wide py-8">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-400 no-underline"
          >
            <ArrowLeft size={15} />
            Exit assessment
          </Link>

          <div className="mono text-[10px] text-slate-500">
            PROTOCOL · 01—02
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <div className="eyebrow">Guided assessment</div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Let’s map your current signal.
          </h1>

          <p className="mt-4 max-w-xl leading-7 text-slate-400">
            Use the core information below to generate an understandable
            wellness signal and a practical next step.
          </p>

          <div className="mt-10 panel bracket p-6 sm:p-9">
            <div className="mb-8 flex gap-2">
              <span className="h-1 flex-1 bg-cyan-300" />
              <span className="h-1 flex-1 bg-slate-700" />
              <span className="h-1 flex-1 bg-slate-700" />
            </div>

            {!gender ? (
              <>
                <div className="mono text-[10px] text-slate-500">
                  01 · PROFILE CONTEXT
                </div>

                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Which profile should we use?
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Choose a profile to begin the same simple core assessment.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => setGender("male")}
                    className="btn-ghost p-5 text-left"
                  >
                    <div className="font-semibold text-white">
                      Male profile
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                      Core adult health factors
                    </div>
                  </button>

                  <button
                    onClick={() => setGender("female")}
                    className="btn-ghost p-5 text-left"
                  >
                    <div className="font-semibold text-white">
                      Female profile
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                      Core adult health factors + pregnancy status
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mono text-[10px] text-slate-500">
                  02 · CORE PARAMETERS
                </div>

                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Your health snapshot
                </h2>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  {/* Age */}
                  <label className="text-sm text-slate-300">
                    Age (years)
                    <input
                      className={field}
                      value={age}
                      onChange={(event) => setAge(event.target.value)}
                      type="number"
                      min="18"
                      max="120"
                      required
                    />
                  </label>

                  {/* Height */}
                  <label className="text-sm text-slate-300">
                    Height (cm)
                    <input
                      className={field}
                      value={height}
                      onChange={(event) => setHeight(event.target.value)}
                      type="number"
                      required
                    />
                  </label>

                  {/* Weight */}
                  <label className="text-sm text-slate-300">
                    Weight (kg)
                    <input
                      className={field}
                      value={weight}
                      onChange={(event) => setWeight(event.target.value)}
                      type="number"
                      required
                    />

                    <span className="mt-2 flex items-center gap-2 text-xs text-cyan-300">
                      <Activity size={13} />
                      Calculated BMI: {bmi.toFixed(1)}
                    </span>
                  </label>

                  {/* Blood Pressure */}
                  <label className="text-sm text-slate-300">
                    Blood pressure
                    <input
                      className={field}
                      value={bloodPressure}
                      onChange={(event) =>
                        setBloodPressure(event.target.value)
                      }
                      placeholder="e.g. 120/80"
                      inputMode="numeric"
                    />
                  </label>

                  {/* Glucose */}
                  <label className="text-sm text-slate-300">
                    Glucose level
                    <input
                      className={field}
                      value={glucose}
                      onChange={(event) => setGlucose(event.target.value)}
                      placeholder="mg/dL"
                      type="number"
                      min="1"
                    />
                  </label>

                  {/* Pregnancies - FEMALE ONLY */}
                  {gender === "female" && (
                    <label className="text-sm text-slate-300">
                      Pregnancies
                      <input
                        className={field}
                        value={pregnancies}
                        onChange={(event) =>
                          setPregnancies(event.target.value)
                        }
                        type="number"
                        min="0"
                        max="30"
                      />
                    </label>
                  )}

                  {/* Skin Thickness */}
                  <label className="text-sm text-slate-300">
                    Skin thickness
                    <input
                      className={field}
                      value={skinThickness}
                      onChange={(event) =>
                        setSkinThickness(event.target.value)
                      }
                      placeholder="mm (optional)"
                      type="number"
                      min="1"
                      max="150"
                    />
                  </label>

                  {/* Family History */}
                  <label className="text-sm text-slate-300">
                    Family history
                    <select
                      className={field}
                      value={familyHistory ? "yes" : "no"}
                      onChange={(event) =>
                        setFamilyHistory(event.target.value === "yes")
                      }
                    >
                      <option value="no">No known history</option>
                      <option value="yes">Yes</option>
                    </select>
                  </label>

                  {/* Physical Activity */}
                  <label className="text-sm text-slate-300">
                    Physical activity
                    <select
                      className={field}
                      value={activity}
                      onChange={(event) =>
                        setActivity(
                          event.target.value as
                            | "low"
                            | "moderate"
                            | "high"
                        )
                      }
                    >
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </label>

                  {/* Pregnancy Status - FEMALE ONLY */}
                  {gender === "female" && (
                    <label className="text-sm text-slate-300">
                      Pregnancy status
                      <select
                        className={field}
                        value={pregnancyStatus}
                        onChange={(event) =>
                          setPregnancyStatus(
                            event.target.value as
                              | "no"
                              | "yes"
                              | "unknown"
                          )
                        }
                      >
                        <option value="no">Not pregnant</option>
                        <option value="yes">Pregnant</option>
                        <option value="unknown">
                          Prefer not to say
                        </option>
                      </select>
                    </label>
                  )}
                </div>

                <div className="mt-7 flex gap-2 rounded-lg border border-cyan-300/15 bg-cyan-300/5 p-4 text-xs leading-5 text-slate-400">
                  <Info
                    className="mt-0.5 shrink-0 text-cyan-300"
                    size={15}
                  />

                  Your entries are used to generate an informational
                  estimate. Consult a qualified clinician for interpretation.
                </div>

                {create.error && (
                  <p className="mt-4 text-sm text-rose-200">
                    {create.error.message}
                  </p>
                )}

                <button
                  disabled={create.isPending}
                  onClick={submit}
                  className="btn-primary mt-8 inline-flex items-center px-5 py-3"
                >
                  {create.isPending
                    ? "Generating signal…"
                    : "Generate my signal"}

                  <ArrowRight size={16} className="ml-2" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}