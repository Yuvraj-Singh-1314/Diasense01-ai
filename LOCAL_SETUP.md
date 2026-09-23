# DiaSense AI — VS Code local setup

## Requirements
- Node.js 20+ (Node 22 LTS recommended)
- pnpm 10+
- MySQL 8.x (XAMPP MySQL also works)
- Python 3.10+ only if you retrain the model

## 1. Create the database
Run in MySQL:
```sql
CREATE DATABASE diasense_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Copy `.env.example` to `.env`, then set `DATABASE_URL` and `JWT_SECRET`.

## 2. Install dependencies
```powershell
pnpm install
pnpm db:push
```

## 3. Run
```powershell
pnpm dev
```
Open `http://localhost:3000`.

The server now defaults to development mode, so Windows PowerShell does not need the Unix-only `NODE_ENV=development` syntax.

## 4. Pima dataset
The project already contains the 768-row Pima Indians Diabetes Dataset:
`ml/data/pima-indians-diabetes.csv`

The website uses:
`ml/artifacts/pima_rf_portable.json`

Python is NOT required to run the website.

## 5. Retrain only if you change the dataset/model
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r ml/requirements.txt
pnpm train:pima
```

## 6. Pima feature mapping
The assessment uses Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin,
BMI, DiabetesPedigreeFunction and Age. BMI is calculated from height/weight.
Optional Pima measurements are median-imputed using the training preprocessing.

## Important
This is a research/demo risk-estimation project, not a clinical diagnostic tool.
The Pima dataset is small and historical and should not be treated as representative
of every population.
