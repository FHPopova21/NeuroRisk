import os
import sys
import numpy as np
import pandas as pd
import time
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

sys.path.append(os.path.abspath('.'))
from src.models.random_forest import RandomForest

def load_data(path, target_class_col='y_2'):
    df = pd.read_csv(path)
    label_cols = ['y_0', 'y_1', 'y_2']
    feature_cols = [c for c in df.columns if c not in label_cols]
    
    X = df[feature_cols].values
    y = df[target_class_col].values
    return X, y

def main():
    print("--- Classical ML: Random Forest (From Scratch) ---")
    
    train_path = 'data/processed/Bonn_EEG_Train.csv'
    test_path = 'data/processed/Bonn_EEG_Test.csv'

    print("Loading data...")
    X_train, y_train = load_data(train_path)
    X_test, y_test = load_data(test_path)
    
    # Subsampling for speed during demonstration (optional but recommended for python implementation)
    # Using 10k samples for training to keep training time < 5 mins
    limit = 5000 
    print(f"Subsampling to first {limit} samples for feasibility of Python implementation...")
    X_train_sub = X_train[:limit]
    y_train_sub = y_train[:limit]

    # Configuration
    # n_trees=5, max_depth=5 to start. 
    # Increase if time permits.
    n_trees = 5
    max_depth = 10
    
    print(f"Model: RandomForest(n_trees={n_trees}, max_depth={max_depth})")
    model = RandomForest(n_trees=n_trees, max_depth=max_depth, min_samples_split=5)
    
    print("Training... (This might take a few minutes)")
    start_time = time.time()
    model.fit(X_train_sub, y_train_sub)
    print(f"Training completed in {time.time() - start_time:.1f} seconds.")
    
    print("Evaluating on Test Set...")
    y_pred = model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc:.4f}")
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Non-Seizure', 'Seizure']))
    
    # Save predictions
    output_dir = "outputs"
    os.makedirs(output_dir, exist_ok=True)
    np.save(f"{output_dir}/rf_y_test_pred.json", y_pred)
    # RF custom implementation doesn't support predict_proba easily yet, skipping proba save
    
if __name__ == "__main__":
    main()
