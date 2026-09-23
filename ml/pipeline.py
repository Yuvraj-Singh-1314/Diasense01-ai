"""DiaSense model training pipeline.

This module is intentionally data-source agnostic: production training should receive
an approved, de-identified clinical dataset through the training environment rather
than shipping patient data with the web application.
"""
from pathlib import Path
import json
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

NUMERIC = ["pregnancies", "glucose", "blood_pressure", "skin_thickness", "insulin", "bmi", "diabetes_pedigree", "age"]
CATEGORICAL = ["family_history", "activity"]

def build_pipeline(model):
    preprocessor = ColumnTransformer([
        ("numeric", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), NUMERIC),
        ("categorical", Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("encode", OneHotEncoder(handle_unknown="ignore"))]), CATEGORICAL),
    ])
    return Pipeline([("preprocess", preprocessor), ("model", model)])

def train_models(frame: pd.DataFrame, target: str = "risk"):
    x_train, x_test, y_train, y_test = train_test_split(frame[NUMERIC + CATEGORICAL], frame[target], test_size=.2, random_state=42, stratify=frame[target])
    models = {"random_forest": build_pipeline(RandomForestClassifier(n_estimators=300, random_state=42, class_weight="balanced")), "xgboost": build_pipeline(XGBClassifier(n_estimators=250, max_depth=4, learning_rate=.05, eval_metric="logloss", random_state=42))}
    results = {}
    for name, model in models.items():
        model.fit(x_train, y_train)
        predicted = model.predict(x_test)
        probability = model.predict_proba(x_test)[:, 1]
        results[name] = {"accuracy": accuracy_score(y_test, predicted), "precision": precision_score(y_test, predicted, zero_division=0), "recall": recall_score(y_test, predicted, zero_division=0), "f1": f1_score(y_test, predicted, zero_division=0), "roc_auc": roc_auc_score(y_test, probability)}
    return models, results

def predict_risk(model, assessment):
    """Map the web assessment into the Pima feature space for inference."""
    row = pd.DataFrame([{
        "pregnancies": assessment.get("pregnancies", 0),
        "glucose": assessment.get("glucose"),
        "blood_pressure": assessment.get("bloodPressure"),
        "skin_thickness": assessment.get("skinThickness"),
        "insulin": assessment.get("insulin"),
        "bmi": assessment.get("bmi"),
        "diabetes_pedigree": assessment.get("diabetesPedigree", 0.5),
        "age": assessment.get("age"),
        "family_history": assessment.get("familyHistory", False),
        "activity": assessment.get("activity", "moderate"),
    }])
    return float(model.predict_proba(row[NUMERIC + CATEGORICAL])[:, 1][0])

def persist(models, metrics, output_dir="ml/artifacts"):
    path = Path(output_dir); path.mkdir(parents=True, exist_ok=True)
    for name, model in models.items(): joblib.dump(model, path / f"{name}.joblib")
    (path / "metrics.json").write_text(json.dumps(metrics, indent=2))
