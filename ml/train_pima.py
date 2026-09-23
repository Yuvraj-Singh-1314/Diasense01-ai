from pathlib import Path
import pandas as pd
from pipeline import train_models, persist

COLUMNS = ['pregnancies','glucose','blood_pressure','skin_thickness','insulin','bmi','diabetes_pedigree','age','risk']
path = Path(__file__).parent / 'data' / 'pima-indians-diabetes.csv'
frame = pd.read_csv(path, header=None, names=COLUMNS)
for column in ['glucose','blood_pressure','skin_thickness','insulin','bmi']:
    frame.loc[frame[column] == 0, column] = pd.NA
frame['family_history'] = frame['diabetes_pedigree'] >= frame['diabetes_pedigree'].median()
frame['activity'] = 'moderate'
frame.loc[frame['bmi'].fillna(frame['bmi'].median()) >= 30, 'activity'] = 'low'
frame = frame.rename(columns={'blood_pressure':'blood_pressure'})
models, metrics = train_models(frame, target='risk')
persist(models, metrics, output_dir=Path(__file__).parent / 'artifacts')
print(metrics)
