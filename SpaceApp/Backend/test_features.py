import io
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from backend_api import app

client = TestClient(app)


def _post_csv_and_get(client, df: pd.DataFrame):
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)
    files = {"file": ("test.csv", buf.read())}
    resp = client.post("/predict-csv", files=files)
    return resp


def test_predict_csv_happy_path():
    # Construire un petit DataFrame avec toutes les colonnes attendues
    df = pd.DataFrame([
        {"ra": 10.0, "dec": 5.0, "koi_period": 50.0, "koi_prad": 1.0, "koi_smass": 1.0, "koi_srad": 1.0, "koi_dor": 0.1, "koi_teq": 250.0, "koi_insol": 1.0, "koi_score": 0.5, "koi_pdisposition": "CANDIDATE"},
        {"ra": 20.0, "dec": -5.0, "koi_period": 100.0, "koi_prad": 2.0, "koi_smass": 0.9, "koi_srad": 0.9, "koi_dor": 0.2, "koi_teq": 300.0, "koi_insol": 0.5, "koi_score": 0.2, "koi_pdisposition": "FALSE POSITIVE"}
    ])
    resp = _post_csv_and_get(client, df)
    assert resp.status_code == 200
    j = resp.json()
    assert j["rows"] == 2
    assert len(j["predictions"]) == 2


def test_predict_csv_numeric_as_strings():
    # Certaines colonnes numériques envoyées comme strings -> doivent être converties
    df = pd.DataFrame([
        {"ra": "10.0", "dec": "5.0", "koi_period": "50", "koi_prad": "1", "koi_smass": "1", "koi_srad": "1", "koi_dor": "0.1", "koi_teq": "250", "koi_insol": "1", "koi_score": "0.5", "koi_pdisposition": "CANDIDATE"}
    ])
    resp = _post_csv_and_get(client, df)
    assert resp.status_code == 200
    j = resp.json()
    assert j["rows"] == 1
    assert isinstance(j["predictions"][0]["confidence"], (float, type(None)))


def test_predict_csv_missing_koi_pdisposition():
    # Si koi_pdisposition absent, endpoint doit ajouter colonne et prédire
    df = pd.DataFrame([
        {"ra": 11.0, "dec": 6.0, "koi_period": 40.0, "koi_prad": 1.2, "koi_smass": 1.1, "koi_srad": 1.05, "koi_dor": 0.12, "koi_teq": 220.0, "koi_insol": 1.2, "koi_score": 0.45}
    ])
    resp = _post_csv_and_get(client, df)
    assert resp.status_code == 200
    j = resp.json()
    assert j["rows"] == 1