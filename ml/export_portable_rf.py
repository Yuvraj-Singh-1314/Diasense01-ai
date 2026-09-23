import json
from pathlib import Path

import joblib


BASE_DIR = Path(__file__).parent
MODEL = joblib.load(BASE_DIR / "artifacts" / "random_forest.joblib")
PREPROCESS = MODEL.named_steps["preprocess"]
NUMERIC = PREPROCESS.transformers_[0][1]
CATEGORICAL = PREPROCESS.transformers_[1][1]


def tree_payload(tree):
    return {
        "childrenLeft": tree.children_left.tolist(),
        "childrenRight": tree.children_right.tolist(),
        "feature": tree.feature.tolist(),
        "threshold": tree.threshold.tolist(),
        "value": [row[0].tolist() for row in tree.value],
    }


payload = {
    "version": "pima-rf-portable-v1",
    "numericImpute": NUMERIC.named_steps["impute"].statistics_.tolist(),
    "numericMean": NUMERIC.named_steps["scale"].mean_.tolist(),
    "numericScale": NUMERIC.named_steps["scale"].scale_.tolist(),
    "categoricalCategories": [values.tolist() for values in CATEGORICAL.named_steps["encode"].categories_],
    "trees": [tree_payload(estimator.tree_) for estimator in MODEL.named_steps["model"].estimators_],
}
(BASE_DIR / "artifacts" / "pima_rf_portable.json").write_text(json.dumps(payload, separators=(",", ":")))
print(f"Exported {len(payload['trees'])} trees")
