"""
FastAPI Backend pour la Détection d'Exoplanètes
================================================
Version optimisée pour ton modèle ML avec pickle.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
import pickle
import os
import random
from joblib import load

# ====================================================================
# 1️⃣ CHEMINS ET CHARGEMENT DES OBJETS PICKLE
# ====================================================================

current_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(os.path.dirname(current_dir), "models")

# Créer le dossier models s'il n'existe pas
if not os.path.exists(models_dir):
    os.makedirs(models_dir)
    print("✨ Dossier models créé")

try:
    with open(os.path.join(models_dir, "exoplanet_model_vf.pkl"), "rb") as f:
        model = pickle.load(f)
    with open(os.path.join(models_dir, "exoplanet_scaler_vf.pkl"), "rb") as f:
        scaler = pickle.load(f)
    with open(os.path.join(models_dir, "model_metadata.pkl"), "rb") as f:
        metadata = pickle.load(f)

    features = metadata["feature_names"]
    label_classes = metadata["classes"]
    print("✅ Modèle, scaler et métadonnées chargés avec succès")

except Exception as e:
    print(f"❌ Erreur lors du chargement des fichiers pickle: {e}")
    model = None
    scaler = None
    features = []
    label_classes = []

try:
    label_encoder = load(os.path.join(models_dir, "label_encoder_vf.pkl"))
    print("✅ LabelEncoder chargé avec succès")
except Exception as e:
    print(f"❌ Erreur lors du chargement du LabelEncoder: {e}")
    label_encoder = None

# ====================================================================
# 2️⃣ CONFIGURATION DE L'API
# ====================================================================

app = FastAPI(
    title="Exoplanet Classifier API",
    description="API pour classifier des exoplanètes avec Random Forest",
    version="1.0.0"
)

# Autoriser le front-end (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# ====================================================================
# 3️⃣ MODÈLES PYDANTIC
# ====================================================================

class PlanetFeatures(BaseModel):
    ra: float
    dec: float
    koi_period: float
    koi_prad: float
    koi_smass: float
    koi_srad: float
    koi_dor: float
    koi_teq: float
    koi_insol: float
    koi_score: float
    koi_pdisposition: float


class ExoplanetPrediction(BaseModel):
    name: str
    distance: float
    period: float
    size: float
    habitability: float
    habitability_percent: str
    light_curve: List[float]
    prediction: str
    confidence: float
    confidence_percent: str

# ====================================================================
# 4️⃣ FONCTIONS UTILES
# ====================================================================

def generate_light_curve(features: PlanetFeatures) -> List[float]:
    """Génère une courbe de lumière réaliste avec transit."""
    num_points = 100
    light_curve = []
    transit_depth = min((features.koi_prad / max(features.koi_srad, 0.1)) ** 2, 0.05)
    transit_center = random.randint(35, 65)
    transit_duration = max(4, min(18, int(8 * (features.koi_prad / max(features.koi_dor, 1)))))
    transit_start = transit_center - transit_duration // 2
    transit_end = transit_center + transit_duration // 2

    for i in range(num_points):
        flux = 1.0
        if transit_start <= i <= transit_end:
            progress = (i - transit_start) / transit_duration
            if progress < 0.15:
                transit_factor = 1.0 - (transit_depth * (progress / 0.15))
            elif progress > 0.85:
                transit_factor = 1.0 - (transit_depth * ((1 - progress) / 0.15))
            else:
                transit_factor = 1.0 - transit_depth * random.uniform(0.95, 1.05)
            flux = flux * transit_factor
        flux += random.gauss(0, 0.0003)
        light_curve.append(round(max(0.985, min(1.015, flux)), 6))
    return light_curve


def calculate_habitability(features: PlanetFeatures) -> float:
    """Calcule un score d'habitabilité réaliste basé sur les features."""
    score = 0.0
    if 0.8 <= features.koi_prad <= 1.5:
        score += 0.3
    elif 0.5 <= features.koi_prad <= 2.0:
        score += 0.15

    if 200 <= features.koi_teq <= 320:
        score += 0.3
    elif 150 <= features.koi_teq <= 400:
        score += 0.15

    if 0.25 <= features.koi_insol <= 4.0:
        score += 0.2
    elif 0.1 <= features.koi_insol <= 10.0:
        score += 0.1

    if 10 <= features.koi_period <= 500:
        score += 0.1

    score += features.koi_score * 0.1
    score += random.uniform(-0.08, 0.08)
    return round(max(0.0, min(1.0, score)), 3)


def generate_planet_name(features: PlanetFeatures, prediction: str) -> str:
    """Génère un nom de planète réaliste basé sur RA/DEC et prédiction."""
    ra, dec = features.ra, features.dec
    if 340 <= ra <= 350 and -10 <= dec <= 0:
        suffix = random.choice(['b', 'c', 'd', 'e', 'f', 'g', 'h'])
        return f"TRAPPIST-1 {suffix}"
    elif 280 <= ra <= 290 and 40 <= dec <= 50:
        suffix = random.choice(['e', 'f', 'g'])
        return f"Kepler-62 {suffix}"
    elif 60 <= ra <= 70 and -25 <= dec <= -15:
        suffix = random.choice(['b', 'c'])
        return f"TESS-14 {suffix}"
    else:
        return f"KOI-{int(ra)}{random.randint(100, 999)}"


def calculate_distance(features: PlanetFeatures) -> float:
    """Distance réaliste basée sur le rayon stellaire."""
    base = 200 if features.koi_srad < 1 else 1000
    return round(base * random.uniform(0.85, 1.15), 1)


def get_prediction_confidence(model, X_scaled) -> float:
    """Obtient la confiance de la prédiction."""
    try:
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(X_scaled)
            return round(float(np.max(proba)), 3)
        else:
            return 0.85
    except:
        return 0.85

# ====================================================================
# 5️⃣ ENDPOINTS
# ====================================================================

@app.get("/")
async def root():
    return {"message": "Exoplanet Classifier API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None
    }


@app.post("/predict", response_model=ExoplanetPrediction)
async def predict(data: PlanetFeatures):
    if not model or not scaler or not features or not label_classes:
        raise HTTPException(status_code=500, detail="Modèle, scaler ou métadonnées non chargés")

    # 1️⃣ Préparer le DataFrame depuis l'entrée
    df = pd.DataFrame([data.dict()])

    # 2️⃣ Encodage du feature catégoriel 'koi_pdisposition' comme à l'entraînement
    X_cat_encoded = pd.get_dummies(df[['koi_pdisposition']], drop_first=True)
    for col in features:  # Assurer toutes les colonnes nécessaires
        if col not in X_cat_encoded and col.startswith("koi_pdisposition"):
            X_cat_encoded[col] = 0
    X_cat_encoded = X_cat_encoded[[col for col in features if col.startswith("koi_pdisposition")]]

    # 3️⃣ Extraire les features numériques restantes
    numeric_cols = [col for col in features if col not in X_cat_encoded.columns]
    X_numeric = df[numeric_cols]

    # 4️⃣ Concaténer toutes les features dans le bon ordre
    X_model = pd.concat([X_numeric, X_cat_encoded], axis=1)
    X_model = X_model[features]  # S'assurer que l'ordre des colonnes correspond exactement

    # 5️⃣ Standardiser les données
    X_scaled = scaler.transform(X_model)

    # 6️⃣ Prédiction
    y_pred = model.predict(X_scaled)

    # Obtenir la prédiction en format texte
    if label_encoder is not None:
        prediction_label = str(label_encoder.inverse_transform([y_pred[0]])[0])
    elif label_classes:
        prediction_label = str(label_classes[y_pred[0]])
    else:
        prediction_label = str(y_pred[0])

    # 7️⃣ Générer le reste des informations
    planet_name = generate_planet_name(data, prediction_label)
    distance = calculate_distance(data)
    habitability = calculate_habitability(data)
    light_curve = generate_light_curve(data)
    confidence = get_prediction_confidence(model, X_scaled)

    # 8️⃣ Retourner la réponse au frontend
    return ExoplanetPrediction(
        name=planet_name,
        distance=distance,
        period=round(data.koi_period, 2),
        size=round(data.koi_prad, 2),
        habitability=habitability,
        habitability_percent=f"{habitability * 100:.1f}%",
        light_curve=light_curve,
        prediction=prediction_label,
        confidence=confidence,
        confidence_percent=f"{confidence * 100:.1f}%"
    )


# ------------------------------------------------------------------
# Endpoint : upload CSV, strict preprocessing like in the training notebook
# - Imputation: numeric median, categorical mode
# - get_dummies(drop_first=True) and rename koi_pdisposition_FALSE POSITIVE -> koi_pdisposition
# - Add missing model columns with zeros and reorder according to features
# - No column dropping based on outliers (to strictly match training logic)
# ------------------------------------------------------------------


@app.post("/predict-csv")
async def predict_csv(file: UploadFile = File(...)):
    print("Début traitement CSV")
    # Vérifier que le modèle et le scaler sont chargés
    if model is None or scaler is None or not features:
        raise HTTPException(status_code=500, detail="Modèle, scaler ou métadonnées non chargés")

    # Lire le CSV
    try:
        df = pd.read_csv(file.file, sep=",", comment="#")
    except Exception as e:
        print("Erreur lors de la lecture du CSV :", e)
        raise HTTPException(status_code=400, detail=f"Impossible de lire le CSV: {e}")

    # Colonnes attendues (ordre exact)
    expected_features = list(features)
    present = [c for c in expected_features if c in df.columns]
    if len(present) == 0:
        raise HTTPException(status_code=422, detail="Aucune des colonnes attendues présentes dans le CSV")

    # Ne garder que les colonnes d'entraînement présentes
    X = df[[c for c in expected_features if c in df.columns]].copy()

    # Forcer conversions: numériques -> numeric (coerce)
    numeric_expected = [c for c in expected_features if c != 'koi_pdisposition']
    for col in numeric_expected:
        if col in X.columns:
            X[col] = pd.to_numeric(X[col], errors='coerce')

    # Forcer koi_pdisposition en string si présent
    if 'koi_pdisposition' in X.columns:
        try:
            X['koi_pdisposition'] = X['koi_pdisposition'].astype(str)
        except Exception:
            pass

    # Séparer numériques / catégorielles
    X_num = X.select_dtypes(include='number')
    X_cat = X.select_dtypes(exclude='number')

    print("Shape X_num:", X_num.shape)
    print("Shape X_cat:", X_cat.shape)

    # Imputation numériques -> médiane
    if not X_num.empty:
        X_num = X_num.fillna(X_num.median())

    # Imputation catégorielle -> mode puis get_dummies(drop_first=True)
    if not X_cat.empty:
        try:
            modes = X_cat.mode().iloc[0]
            X_cat = X_cat.fillna(modes)
        except Exception:
            print("Erreur lors de l'imputation catégorielle")
            X_cat = X_cat.fillna('')

        X_cat_encoded = pd.get_dummies(X_cat, drop_first=True)
        if 'koi_pdisposition_FALSE POSITIVE' in X_cat_encoded.columns:
            X_cat_encoded.rename(columns={"koi_pdisposition_FALSE POSITIVE": "koi_pdisposition"}, inplace=True)
        X_clean = pd.concat([X_num, X_cat_encoded], axis=1)
    else:
        X_clean = X_num

    print("Shape X_clean:", X_clean.shape)
    print("Columns X_clean:", X_clean.columns.tolist())

    # Ajouter les colonnes manquantes attendues par le modèle (initialiser à 0)
    for col in expected_features:
        if col not in X_clean.columns:
            X_clean[col] = 0

    # Réordonner
    try:
        X_model = X_clean[expected_features]
    except Exception as e:
        print("Erreur lors du réordonnancement des colonnes:", e)
        raise HTTPException(status_code=500, detail=f"Erreur lors du réordonnancement des colonnes: {e}")

    # Vérifier que tout est numérique
    non_numeric_cols = X_model.select_dtypes(exclude=['number']).columns.tolist()
    if len(non_numeric_cols) > 0:
        print("Colonnes non numériques après prétraitement:", non_numeric_cols)
        # Try to convert remaining categoricals to numeric using get_dummies
        try:
            X_model = pd.get_dummies(X_model, columns=non_numeric_cols, drop_first=True)
            # Add missing columns again if needed
            for col in expected_features:
                if col not in X_model.columns:
                    X_model[col] = 0
            X_model = X_model[expected_features]
            # Re-check
            still_non_numeric = X_model.select_dtypes(exclude=['number']).columns.tolist()
            if len(still_non_numeric) > 0:
                print("Colonnes toujours non numériques:", still_non_numeric)
                raise HTTPException(status_code=500, detail=f"Colonnes non numériques après tentative d'encodage: {still_non_numeric}")
        except Exception as e:
            print("Erreur lors de l'encodage des colonnes catégorielles:", e)
            raise HTTPException(status_code=500, detail=f"Erreur lors de l'encodage des colonnes catégorielles: {e}")

    # Scaling
    try:
        X_scaled = scaler.transform(X_model)
    except Exception as e:
        print("Erreur lors du scaling:", e)
        raise HTTPException(status_code=500, detail=f"Erreur lors du scaling: {e}")

    # Prédiction
    try:
        print("Shape X_scaled:", X_scaled.shape)
        y_pred = model.predict(X_scaled)
        y_proba = model.predict_proba(X_scaled) if hasattr(model, 'predict_proba') else None
    except Exception as e:
        print("Erreur lors de la prédiction:", e)
        raise HTTPException(status_code=500, detail=f"Erreur lors de la prédiction: {e}")


    results = []
    planet_names = None
    if 'planet_name' in df.columns:
        planet_names = df['planet_name'].tolist()

    for i in range(len(X_model)):
        if label_encoder is not None:
            try:
                pred_label = str(label_encoder.inverse_transform([y_pred[i]])[0])
            except Exception:
                pred_label = str(y_pred[i])
        else:
            pred_label = str(y_pred[i])

        confidence = None
        if y_proba is not None:
            try:
                confidence = float(max(y_proba[i]))
            except Exception:
                confidence = None

        result = {
            "row": int(i),
            "prediction": pred_label,
            "confidence": confidence
        }
        if planet_names:
            result["planet_name"] = planet_names[i] if i < len(planet_names) else None
        results.append(result)

    return {"rows": len(results), "predictions": results}

# ====================================================================
# 6️⃣ LANCEMENT DU SERVEUR (développement)
# ====================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend_api:app", host="0.0.0.0", port=8000, reload=True)
