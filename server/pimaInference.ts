import portableForest from "../ml/artifacts/pima_rf_portable.json";

export type PimaAssessmentInput = {
  age: number; bmi: number; glucose?: number; bloodPressure?: number; pregnancies?: number;
  skinThickness?: number; insulin?: number; diabetesPedigree?: number;
  familyHistory: boolean; activity: "low" | "moderate" | "high";
};

type PortableTree = { childrenLeft: number[]; childrenRight: number[]; feature: number[]; threshold: number[]; value: number[][] };
type PortableForest = { version: string; numericImpute: number[]; numericMean: number[]; numericScale: number[]; categoricalCategories: Array<Array<string | boolean>>; trees: PortableTree[] };
type PimaPrediction = { riskPercentage: number; confidence: number; modelVersion: string };

const artifact: PortableForest = portableForest as PortableForest;

function normalized(value: number | undefined, index: number, model: PortableForest) {
  const source = Number.isFinite(value) ? Number(value) : model.numericImpute[index];
  return (source - model.numericMean[index]) / model.numericScale[index];
}

function featuresFor(input: PimaAssessmentInput, model: PortableForest) {
  const numeric = [input.pregnancies, input.glucose, input.bloodPressure, input.skinThickness, input.insulin, input.bmi, input.diabetesPedigree, input.age].map((value, index) => normalized(value, index, model));
  const categorical = [input.familyHistory, input.activity];
  const encoded = model.categoricalCategories.flatMap((categories, index) => categories.map(value => value === categorical[index] ? 1 : 0));
  return [...numeric, ...encoded];
}

function probabilityFromTree(tree: PortableTree, features: number[]) {
  let node = 0;
  while (tree.feature[node] >= 0) node = features[tree.feature[node]] <= tree.threshold[node] ? tree.childrenLeft[node] : tree.childrenRight[node];
  const [negative = 0, positive = 0] = tree.value[node] ?? [];
  return positive / Math.max(1, negative + positive);
}

export async function predictPimaRisk(input: PimaAssessmentInput): Promise<PimaPrediction> {
  const model = artifact;
  const features = featuresFor(input, model);
  const treeProbabilities = model.trees.map(tree => probabilityFromTree(tree, features));
  const probability = treeProbabilities.reduce((total, value) => total + value, 0) / treeProbabilities.length;
  const variance = treeProbabilities.reduce((total, value) => total + (value - probability) ** 2, 0) / treeProbabilities.length;
  const confidence = Math.round(60 + Math.max(0, 1 - Math.sqrt(variance)) * 35);
  return { riskPercentage: Math.round(probability * 100), confidence, modelVersion: model.version };
}
