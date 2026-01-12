import os
import sys
import numpy as np
import pandas as pd
import joblib
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from src.models.random_forest import RandomForest

# Add project root to path
sys.path.append(os.path.abspath('.'))

def load_data(path, target_class_col='y_2'):
    """
    Load data from CSV.
    target_class_col: Column to use as target (1=Seizure, 0=Non-Seizure)
    """
    if not os.path.exists(path):
        raise FileNotFoundError(f"File not found: {path}")

    df = pd.read_csv(path)
    
    # Identify feature columns (X... and transient features)
    label_cols = ['y_0', 'y_1', 'y_2']
    feature_cols = [c for c in df.columns if c not in label_cols]
    
    X = df[feature_cols].values
    y = df[target_class_col].values
    
    return X, y, feature_cols

def main():
    print("--- Classical ML: Random Forest (Sklearn) ---")
    
    # Paths
    train_path = 'data/processed/Bonn_EEG_Train.csv'
    test_path = 'data/processed/Bonn_EEG_Test.csv'
    model_save_path = 'models/random_forest.pkl'
    os.makedirs('models', exist_ok=True)
    os.makedirs('outputs', exist_ok=True)

    # 1. Load Data
    print("Loading data...")
    try:
        X_train, y_train, feat_names = load_data(train_path)
        X_test, y_test, _ = load_data(test_path)
    except Exception as e:
        print(e)
        return

    print(f"Train Statistics: {X_train.shape} samples")
    print(f"Test Statistics:  {X_test.shape} samples")

    # 2. Initialize Model
    # Using 100 trees, entropy criterion (information gain), and parallel processing
    clf = RandomForest(
        n_estimators=100,
        criterion='entropy',
        max_depth=20,           # КРИТИЧНО: ограничаваме сложността
        min_samples_split=10,   # предотвратява микро-разклонения
        min_samples_leaf=5,     # стабилизира листата
        bootstrap=True,
        n_jobs=-1,              # ако използваш sklearn
        random_state=42
)

    print(f"\nConfiguration: 100 Trees, Entropy, Max Depth=None")

    # 3. Train
    print("\nTraining Random Forest...")
    clf.fit(X_train, y_train)
    print("Training complete.")

    # 4. Save Model
    joblib.dump(clf, model_save_path)
    print(f"Model saved to {model_save_path}")

    # 5. Evaluate
    print("\n--- Evaluation on Test Set ---")
    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1] # Probability of Class 1 (Seizure)

    train_acc = clf.score(X_train, y_train)
    test_acc = clf.score(X_test, y_test)
    print(train_acc, test_acc)

    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc:.4f}")

    print("\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Non-Seizure', 'Seizure']))

    # 6. Save Predictions for Notebook Evaluation
    print(f"\nSaving predictions to outputs/ ...")
    np.save("outputs/rf_y_test_true.npy", y_test)
    np.save("outputs/rf_y_test_pred.npy", y_pred)
    np.save("outputs/rf_y_test_prob.npy", y_prob)
    print("Done.")

if __name__ == "__main__":
    main()
