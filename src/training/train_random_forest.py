import os
import sys
import numpy as np
import pandas as pd
import joblib
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

# --- 1. SETUP PATHS (CRITICAL FIX) ---
# Намираме къде се намира този файл (src/training/train_random_forest.py)
current_script_dir = os.path.dirname(os.path.abspath(__file__))
# Връщаме се две нива назад, за да намерим главната папка на проекта (Project Root)
project_root = os.path.abspath(os.path.join(current_script_dir, '..', '..'))

# Добавяме главната папка към Python пътя, за да работят импортите от src
if project_root not in sys.path:
    sys.path.append(project_root)

# Сега можем безопасно да импортираме нашия модел
from src.models.random_forest import RandomForest


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

    # --- 2. DEFINE ABSOLUTE PATHS ---
    # Използваме project_root, за да сме сигурни, че файловете ще бъдат намерени
    train_path = os.path.join(project_root, 'data', 'processed', 'Bonn_EEG_Train.csv')
    test_path = os.path.join(project_root, 'data', 'processed', 'Bonn_EEG_Test.csv')

    model_dir = os.path.join(project_root, 'models')
    output_dir = os.path.join(project_root, 'outputs')
    model_save_path = os.path.join(model_dir, 'random_forest.pkl')

    # Създаваме папките, ако не съществуват
    os.makedirs(model_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)

    # --- 3. LOAD DATA ---
    print(f"Loading data from: {train_path}")
    try:
        X_train, y_train, feat_names = load_data(train_path)
        X_test, y_test, _ = load_data(test_path)
    except Exception as e:
        print(f"Error loading data: {e}")
        return

    print(f"Train Statistics: {X_train.shape} samples")
    print(f"Test Statistics:  {X_test.shape} samples")

    # --- 4. INITIALIZE MODEL ---
    # Using 100 trees, entropy criterion (information gain), and parallel processing
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

    # --- 5. TRAIN ---
    print("\nTraining Random Forest...")
    clf.fit(X_train, y_train)
    print("Training complete.")

    # --- 6. SAVE MODEL ---
    joblib.dump(clf, model_save_path)
    print(f"Model saved to {model_save_path}")

    # --- 7. EVALUATE ---
    print("\n--- Evaluation on Test Set ---")

    # 1. Предсказване (това работи, защото wrapper-ът има predict)
    y_pred_test = clf.predict(X_test)
    y_pred_train = clf.predict(X_train)  # Трябва да предскажем и за train, за да сметнем точността

    # Проверка за вероятности
    try:
        y_prob = clf.predict_proba(X_test)[:, 1]
    except:
        y_prob = np.zeros_like(y_pred_test)
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
    cm = confusion_matrix(y_test, y_pred_test)
    print(cm)

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred_test, target_names=['Non-Seizure', 'Seizure']))

    # --- 8. SAVE PREDICTIONS ---
    print(f"\nSaving predictions to {output_dir} ...")
    np.save(os.path.join(output_dir, "rf_y_test_true.npy"), y_test)
    np.save(os.path.join(output_dir, "rf_y_test_pred.npy"), y_pred_test)  # Внимавайте да ползвате правилната променлива
    np.save(os.path.join(output_dir, "rf_y_test_prob.npy"), y_prob)
    print("Done.")

if __name__ == "__main__":
    main()