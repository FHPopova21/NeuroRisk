import os
import sys
import numpy as np
import pandas as pd
import joblib
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

current_script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_script_dir, '..', '..'))

if project_root not in sys.path:
    sys.path.append(project_root)

from src.models.random_forest import RandomForest


def load_data(path):
    """
    Load data from CSV.
    Target classes are one-hot encoded in y_0, y_1, y_2.
    Returns: X (features), y (class index 0, 1, or 2), feature_cols
    """
    if not os.path.exists(path):
        raise FileNotFoundError(f"File not found: {path}")

    df = pd.read_csv(path)

    label_cols = ['y_0', 'y_1', 'y_2']
    feature_cols = [c for c in df.columns if c not in label_cols]

    X = df[feature_cols].values
    
    # Convert one-hot to class index (0, 1, 2)
    y = df[['y_0', 'y_1', 'y_2']].values.argmax(axis=1)

    return X, y, feature_cols


def main():
    print("--- Classical ML: Random Forest (Sklearn) ---")

    train_path = os.path.join(project_root, 'data', 'processed', 'Bonn_EEG_Train.csv')
    test_path = os.path.join(project_root, 'data', 'processed', 'Bonn_EEG_Test.csv')

    model_dir = os.path.join(project_root, 'models')
    output_dir = os.path.join(project_root, 'outputs')
    model_save_path = os.path.join(model_dir, 'random_forest.pkl')

    os.makedirs(model_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)

    print(f"Loading data from: {train_path}")
    try:
        X_train, y_train, feat_names = load_data(train_path)
        X_test, y_test, _ = load_data(test_path)
    except Exception as e:
        print(f"Error loading data: {e}")
        return

    print(f"Train Statistics: {X_train.shape} samples")
    print(f"Test Statistics:  {X_test.shape} samples")

    clf = RandomForest(
        n_estimators=100,
        criterion='entropy',
        max_depth=20,
        min_samples_split=10,
        min_samples_leaf=5,
        bootstrap=True,

        random_state=42
    )

    print(f"\nConfiguration: 100 Trees, Entropy, Max Depth=20")
    print("\nTraining Random Forest...")
    clf.fit(X_train, y_train)
    print("Training complete.")

    joblib.dump(clf, model_save_path)
    print(f"Model saved to {model_save_path}")

    print("\n--- Evaluation on Test Set ---")

    y_pred_test = clf.predict(X_test)
    y_pred_train = clf.predict(X_train)

    try:
        y_prob = clf.predict_proba(X_test)
    except:
        y_prob = np.zeros((len(y_pred_test), 3))
        print("Warning: predict_proba not supported, setting probs to 0.")

    # 2. ИЗЧИСЛЯВАНЕ НА ТОЧНОСТ (КОРЕКЦИЯТА Е ТУК)
    # Вместо clf.score(X, y), използваме accuracy_score(y_true, y_pred)
    train_acc = accuracy_score(y_train, y_pred_train)
    test_acc = accuracy_score(y_test, y_pred_test)

    print(f"Train Accuracy: {train_acc:.4f}")
    print(f"Test Accuracy:  {test_acc:.4f}")

    # Тази проверка е излишна сега, защото test_acc е същото, но може да я оставите за всеки случай
    # acc = accuracy_score(y_test, y_pred_test)
    # print(f"Sklearn Accuracy Check: {acc:.4f}")

    print("\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred_test, y_prob)
    print(cm)

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred_test, target_names=['Non-Seizure', 'Inter-ictal', 'Seizure']))

    # --- 8. SAVE PREDICTIONS ---
    print(f"\nSaving predictions to {output_dir} ...")
    np.save(os.path.join(output_dir, "rf_y_test_true.npy"), y_test)
    np.save(os.path.join(output_dir, "rf_y_test_pred.npy"), y_pred_test)  # Внимавайте да ползвате правилната променлива
    np.save(os.path.join(output_dir, "rf_y_test_prob.npy"), y_prob)
    print("Done.")

if __name__ == "__main__":
    main()