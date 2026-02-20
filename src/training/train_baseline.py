import os
import sys
import pandas as pd
import numpy as np
import pickle
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

sys.path.append(os.path.abspath('.'))

from src.models.baseline import LogisticRegression

def load_data(path, target_class_col='y_2'):
    df = pd.read_csv(path)
    
    label_cols = ['y_0', 'y_1', 'y_2']
    feature_cols = [c for c in df.columns if c not in label_cols]
    
    X = df[feature_cols].values
    y = df[target_class_col].values 
    return X, y, feature_cols

def main():
    print("--- Baseline Model Training (Logistic Regression) ---")
    
    train_path = 'data/processed/Bonn_EEG_Train.csv'
    test_path = 'data/processed/Bonn_EEG_Test.csv'
    
    if not os.path.exists(train_path):
        print("Data not found. Please run generate_dataset.py first.")
        return

    print("Loading data...")
    X_train, y_train, feat_names = load_data(train_path)
    X_test, y_test, _ = load_data(test_path)
    
    print(f"Train Shape: {X_train.shape}, Class distribution: {np.bincount(y_train)}")
    print(f"Test Shape: {X_test.shape}, Class distribution: {np.bincount(y_test)}")
    

    print("Initializing Custom Logistic Regression...")
    model = LogisticRegression(
        number_inputs=X_train.shape[1], 
        learning_rate=0.1, 
        epochs=2000
    )
    
    print("Training...")
    model.train(X_train, y_train, verbose=True)
    
    print("\n--- Evaluation on Test Set ---")
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc:.4f}")
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Non-Seizure', 'Seizure']))

    if acc > 0.90:
        print("\nNote: High accuracy achieved with simple linear model. \n" 
              "This suggests the engineered features (amplitude/energy) are very discriminative for Seizure vs Non-Seizure.")
        print(f"\nBaseline Performance: {acc*100:.1f}%. Deep Learning models should aim to beat this.")
    
    output_dir = "outputs"
    model_dir = "models"
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, "baseline_logistic_regression.pkl")
    print(f"\nSaving model to {model_path} ...")
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    
    print(f"Saving predictions to {output_dir}/ ...")
    np.save(os.path.join(output_dir, "y_test_true.npy"), y_test)
    np.save(os.path.join(output_dir, "y_test_pred.npy"), y_pred)
    np.save(os.path.join(output_dir, "y_test_prob.npy"), y_prob)
    print("Done.")

if __name__ == "__main__":
    main()
