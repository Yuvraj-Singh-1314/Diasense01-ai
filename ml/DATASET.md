# DiaSense AI training data provenance

DiaSense AI uses the **Pima Indians Diabetes Dataset** as its primary model-development dataset. The dataset contains 768 records and the requested fields: Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age, and Outcome.

The canonical provenance is the Pima Indians Diabetes Database associated with the National Institute of Diabetes and Digestive and Kidney Diseases and distributed through the UCI / Kaggle ecosystem. For reproducible local setup, this project downloads the CSV from the public mirror at [`https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv`](https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv), because it is directly scriptable and does not require Kaggle credentials. The downloaded file is stored at `ml/data/pima-indians-diabetes.csv`.

The SHA-256 checksum of the training CSV used in this checkpoint is recorded below.

| Artifact | SHA-256 |
| --- | --- |
| `ml/data/pima-indians-diabetes.csv` | 6bfe5d0f379d17a0e0819b996407e3c09bf80febd4287f2ed212190dfff154af |

Zero values in Glucose, BloodPressure, SkinThickness, Insulin, and BMI are treated as missing measurements and imputed within the preprocessing pipeline. The web assessment fields are mapped into the Pima feature space through the inference adapter. The source population is not representative of all users; model outputs are informational signals only and must not be used as a diagnosis or treatment decision.
