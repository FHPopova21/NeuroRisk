import os
import sys
import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

# Add project root to path
sys.path.append(os.path.abspath('.'))

from src.models.baseline import LogisticRegression

def load_data(path, target_class_col='y_2'):
    df = pd.read_csv(path)
    
    # Identify feature columns (X... and transient features)
    # Exclude label columns y_0, y_1, y_2
    label_cols = ['y_0', 'y_1', 'y_2']
    feature_cols = [c for c in df.columns if c not in label_cols]
    
    X = df[feature_cols].values
    y = df[target_class_col].values # 1 for Seizure, 0 for others
    
    return X, y, feature_cols

def main():
    print("--- Baseline Model Training (Logistic Regression) ---")
    
    # Paths
    train_path = 'data/processed/Bonn_EEG_Train.csv'
    test_path = 'data/processed/Bonn_EEG_Test.csv'
    
    if not os.path.exists(train_path):
        print("Data not found. Please run generate_dataset.py first.")
        return

    # Load Data
    print("Loading data...")
    X_train, y_train, feat_names = load_data(train_path)
    X_test, y_test, _ = load_data(test_path)
    
    print(f"Train Shape: {X_train.shape}, Class distribution: {np.bincount(y_train)}")
    print(f"Test Shape: {X_test.shape}, Class distribution: {np.bincount(y_test)}")
    
    # Initialize Model
    # Since we have many samples and features, we might need more epochs or higher LR
    # Normalize inputs? They are already Z-scored (mostly), but transient features might vary.
    # Logistic regression works best with scaled features.
    
    print("Initializing Custom Logistic Regression...")
    model = LogisticRegression(
        number_inputs=X_train.shape[1], 
        learning_rate=0.1, 
        epochs=2000
    )
    
    # Train
    print("Training...")
    model.train(X_train, y_train, verbose=True)
    
    # Evaluate
    print("\n--- Evaluation on Test Set ---")
    y_pred = model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc:.4f}")
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Non-Seizure', 'Seizure']))

    if acc > 0.90:
        print("\nNote: High accuracy achieved with simple linear model. \n" 
              "This suggests the engineered features (amplitude/energy) are very discriminative for Seizure vs Non-Seizure.")
    else:
        print(f"\nBaseline Performance: {acc*100:.1f}%. Deep Learning models should aim to beat this.")

if __name__ == "__main__":
    main()
