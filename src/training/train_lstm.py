import os
import sys
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import tensorflow as tf

current_script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_script_dir, '..', '..'))

if project_root not in sys.path:
    sys.path.append(project_root)

from src.models.lstm_model import LSTMModel


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
    print("--- Deep Learning ML: LSTM (TensorFlow/Keras) ---")

    train_path = os.path.join(project_root, 'data', 'processed', 'Bonn_EEG_Train.csv')
    test_path = os.path.join(project_root, 'data', 'processed', 'Bonn_EEG_Test.csv')

    model_dir = os.path.join(project_root, 'models')
    output_dir = os.path.join(project_root, 'outputs')
    model_save_path = os.path.join(model_dir, 'lstm_model.keras')

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

    # The input shape for the LSTM is (time_steps, features)
    # Since tabular data has shape (samples, features) and we reshape to (samples, features, 1)
    input_shape = (X_train.shape[1], 1)

    print("\nInitializing LSTM model...")
    print(f"Input Shape: {input_shape}")
    clf = LSTMModel(input_shape=input_shape, units=64, dropout_rate=0.2, learning_rate=0.001)

    print("\nTraining LSTM Model...")
    clf.fit(X_train, y_train, epochs=20, batch_size=32, validation_split=0.2, verbose=1)
    print("Training complete.")

    clf.save(model_save_path)
    print(f"Model saved to {model_save_path}")

    print("\n--- Evaluation on Test Set ---")

    y_pred_test = clf.predict(X_test)
    y_pred_train = clf.predict(X_train)

    try:
        y_prob = clf.predict_proba(X_test)
    except Exception as e:
        print(f"Warning: predict_proba not supported or failed: {e}")
        y_prob = np.zeros_like(y_pred_test)

    train_acc = accuracy_score(y_train, y_pred_train)
    test_acc = accuracy_score(y_test, y_pred_test)

    print(f"Train Accuracy: {train_acc:.4f}")
    print(f"Test Accuracy:  {test_acc:.4f}")

    print("\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred_test)
    print(cm)

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred_test, target_names=['Non-Seizure', 'Inter-ictal', 'Seizure']))

    print(f"\nSaving predictions to {output_dir} ...")
    np.save(os.path.join(output_dir, "lstm_y_test_true.npy"), y_test)
    np.save(os.path.join(output_dir, "lstm_y_test_pred.npy"), y_pred_test)
    np.save(os.path.join(output_dir, "lstm_y_test_prob.npy"), y_prob)
    print("Done.")

if __name__ == "__main__":
    main()
