# utils.py
import numpy as np
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def extract_features(bulletin, client):
    try:
        sessions_attended = bulletin["treatmentDetails"]["sessionsAttended"]
        total_amount_paid = bulletin["financialInfo"]["totalAmountPaid"]
        case_severity = bulletin["treatmentDetails"]["caseSeverity"]
        treatment_duration = bulletin["treatmentDetails"].get("treatmentDuration", "1 month")

        birth_date = client["birthDate"]
        health_conditions = len(client["health"]["conditions"].split()) if client["health"]["conditions"] else 0
        smoker = 1 if client["health"]["smoker"] else 0
        exercise_map = {"Often": 2, "Sometimes": 1, "Never": 0}
        exercise = exercise_map.get(client["health"]["exercise"], 0)
        plan_min = client["plan"]["range"]["min"] / 100
        plan_max = client["plan"]["range"]["max"] / 100

        birth_date = datetime.fromisoformat(birth_date.replace('Z', '+00:00'))
        today = datetime.now(birth_date.tzinfo)
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

        severity_map = {0: [1, 0, 0], 1: [1, 0, 0], 2: [0, 1, 0], 3: [0, 1, 0], 4: [0, 0, 1], 5: [0, 0, 1]}
        severity_encoded = severity_map.get(case_severity, [1, 0, 0])

        try:
            duration_value = float(treatment_duration.split()[0])
            duration_unit = treatment_duration.split()[1].lower() if len(treatment_duration.split()) > 1 else "month"
            duration_months = duration_value / 4 if duration_unit in ["week", "weeks"] else duration_value
        except (ValueError, IndexError):
            duration_months = 1

        features = [
            sessions_attended,
            total_amount_paid,
            age,
            health_conditions,
            smoker,
            exercise,
            severity_encoded[0],
            severity_encoded[1],
            severity_encoded[2],
            duration_months,
            plan_min,
            plan_max
        ]
        return np.array(features, dtype=np.float32)
    except Exception as e:
        logger.error(f"Feature extraction failed: {str(e)}")
        raise