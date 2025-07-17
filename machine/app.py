from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import shap
import numpy as np
import json
import pandas as pd

app = Flask(__name__)
CORS(app)

# Model ve özellik listesi yükleniyor
model = joblib.load("best_model.pkl")
with open("features.json") as f:
    feature_names = json.load(f)

# SHAP Explainer
explainer = shap.Explainer(model)

# Geçmiş segment verisi yükleniyor
historical_df = pd.read_csv("data/data.csv")


@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    print("Received data:", data)

    try:
        # Eksik özellik kontrolü
        missing_features = [feature for feature in feature_names if feature not in data]
        if missing_features:
            return jsonify({"error": f"Missing features: {missing_features}"}), 400

        # Model girdisi oluşturuluyor
        features = [data[feature] for feature in feature_names]
        input_array = np.array(features).reshape(1, -1)

        # Tahmin (Wh cinsinden segment tüketimi)
        prediction = model.predict(input_array)[0]

        # SHAP değerleri
        shap_values = explainer(input_array)
        shap_contribs = shap_values.values[0]

        # Segment benzerliği üzerinden ortalama tüketim (Wh/km)
        segment_length = float(data["segment_length"])
        slope = float(data["slope"])
        avg_speed = float(data["avg_vehicle_speed"])
        avg_acceleration = float(data["avg_Acceleration"])
        avg_mass = float(data["avg_Total_Mass"])

        remaining_energy = data.get("remaining_energy")
        nonlinear_energy = data.get("nonlinear_energy", 0)
        segment_count = data.get("segment_count", 0)

        # Sabit ilk menzil için kullanılıyor
        if segment_count == 0:
            segment_count = len(historical_df)  # "data/data.csv" dosyasındaki segment sayısı
            historical_df["km_energy_consumption"] = historical_df["Total_Energy_Consumption"] / (historical_df["segment_length"] / 1000)
            nonlinear_energy = historical_df["km_energy_consumption"].mean()  # Wh/km
        else:
            # Yeni segment tüketimi ile Enonlinear güncellemesi
            segment_count += 1
            nonlinear_energy = ((nonlinear_energy * (segment_count - 1)) + prediction) / segment_count


        remaining_energy = remaining_energy - prediction
        remaining_range = remaining_energy / nonlinear_energy

        response = {
            "prediction": prediction,
            "shap_values": shap_contribs.tolist(),
            "avg_consumption_wh_per_km": nonlinear_energy,
            "remaining_range": remaining_range,
            "remaining_energy": remaining_energy,  # Güncellenmiş remaining_energy
            "nonlinear_energy": nonlinear_energy,  # Güncellenmiş nonlinear_energy
            "segment_count": segment_count  # Güncellenmiş segment_count
        }

        print("==== Prediction Debug ====")
        print(f"Prediction (Wh): {prediction}")
        print(f"Remaining Range: {remaining_range}")
        print(f"Updated Remaining Energy: {remaining_energy}")
        print(f"Updated Nonlinear Energy: {nonlinear_energy}")
        print(f"Updated Segment Count: {segment_count}")
        print("==========================")

        return jsonify(response)

    except Exception as e:
        print("Error during prediction:", str(e))
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)