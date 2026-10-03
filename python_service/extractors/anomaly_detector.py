import json
import os
import numpy as np
import logging
from sentence_transformers import SentenceTransformer
from sklearn.ensemble import IsolationForest

logger = logging.getLogger("anomaly_detector")

class AnomalyDetector:
    def __init__(self, model_name="all-MiniLM-L6-v2", baseline_path="data/baseline_corpus.json"):
        self.model_name = model_name
        self.baseline_path = baseline_path
        self.encoder = None
        self.iso_forest = None
        self.is_ready = False
        
        # Load automatically upon initialization
        self.initialize()

    def initialize(self):
        try:
            logger.info(f"Loading Sentence-BERT model: {self.model_name}")
            self.encoder = SentenceTransformer(self.model_name)
            
            logger.info("Loading baseline corpus...")
            if not os.path.exists(self.baseline_path):
                logger.warning(f"Baseline corpus not found at {self.baseline_path}. Anomaly detector will be disabled.")
                return

            with open(self.baseline_path, "r", encoding="utf-8") as f:
                baseline_data = json.load(f)
            
            baseline_texts = [item["text"] for item in baseline_data if "text" in item]
            
            if not baseline_texts:
                logger.warning("Baseline corpus is empty. Anomaly detector will be disabled.")
                return
                
            logger.info(f"Generating embeddings for {len(baseline_texts)} baseline clauses...")
            baseline_embeddings = self.encoder.encode(baseline_texts)
            
            logger.info("Training Isolation Forest model...")
            self.iso_forest = IsolationForest(
                n_estimators=100, 
                contamination=0.1,  # Assume 10% of standard stuff might be weird, but we are looking for real outliers
                random_state=42
            )
            self.iso_forest.fit(baseline_embeddings)
            
            self.is_ready = True
            logger.info("Anomaly Detector initialized and ready.")
        except Exception as e:
            logger.error(f"Failed to initialize Anomaly Detector: {e}")
            self.is_ready = False

    def detect_anomalies(self, clauses):
        if not self.is_ready or not clauses:
            return clauses

        texts = []
        for clause in clauses:
            # Handle different formats (dict or pydantic model)
            text = clause.get("text", "") if isinstance(clause, dict) else getattr(clause, "text", "")
            texts.append(text)
            
        try:
            embeddings = self.encoder.encode(texts)
            predictions = self.iso_forest.predict(embeddings)
            # IsolationForest returns 1 for inliers, -1 for outliers/anomalies
            
            scores = self.iso_forest.decision_function(embeddings)
            
            for i, clause in enumerate(clauses):
                is_anomaly = bool(predictions[i] == -1)
                anomaly_score = float(scores[i]) # Lower score means more anomalous
                
                if isinstance(clause, dict):
                    clause["is_anomaly"] = is_anomaly
                    clause["anomaly_score"] = anomaly_score
                else:
                    setattr(clause, "is_anomaly", is_anomaly)
                    setattr(clause, "anomaly_score", anomaly_score)
                    
            return clauses
        except Exception as e:
            logger.error(f"Error during anomaly detection: {e}")
            return clauses

# Singleton instance
detector = AnomalyDetector()

def run_anomaly_detection(clauses):
    """Entry point to run anomaly detection on a list of clauses"""
    return detector.detect_anomalies(clauses)
