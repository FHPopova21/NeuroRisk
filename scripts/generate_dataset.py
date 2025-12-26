
import os
import sys
import numpy as np
import pandas as pd

# Add src to path
sys.path.append(os.path.abspath('.'))

from src.data_processing.loader import load_bonn_data
from src.data_processing.filtering import apply_lowpass_filter
from src.data_processing.segmentation import segment_data
from src.data_processing.splitting import split_data_by_patient
from src.data_processing.normalization import fit_scaler, apply_scaler

def save_subset_to_csv(X, y, filename, subset_name, expected_classes=None):
    """Encodes labels to One-Hot and saves to CSV."""
    if len(X) == 0:
        print(f"Warning: {subset_name} is empty. Skipping save.")
        return

    # 1. Create Feature Columns
    n_features = X.shape[1]
    columns = [f'X{i+1}' for i in range(n_features)]
    df = pd.DataFrame(X, columns=columns)
    
    # 2. One-Hot Encoding of Labels
    y_series = pd.Series(y)
    y_dummies = pd.get_dummies(y_series, prefix='y')
    
    # Enforce expected columns if provided
    if expected_classes is not None:
        expected_cols = [f'y_{c}' for c in expected_classes]
        # Reindex to ensure all columns exist, fill missing with 0
        y_dummies = y_dummies.reindex(columns=expected_cols, fill_value=0)
    
    # Ensure converting boolean OHE to integers (0/1)
    y_dummies = y_dummies.astype(int)
    
    # Concatenate features and OHE labels
    df_final = pd.concat([df, y_dummies], axis=1)
    
    # Save
    print(f"Saving {subset_name} ({df_final.shape}) to {filename}...")
    df_final.to_csv(filename, index=False)

def main():
    print("Starting dataset generation pipeline...")
    
    # Constants
    DATA_PATH = os.path.join('data', 'raw')
    OUTPUT_DIR = os.path.join('data', 'processed')
    cutoff_freq = 40.0
    
    # 1. Load Data
    print(f"Loading data from {DATA_PATH} (3-class)...")
    X, y = load_bonn_data(DATA_PATH)
    print(f"Data loaded. Shape: {X.shape}")
    
    # 2. Apply Filtering (Low-Pass 40Hz)
    print("Applying Low-Pass Filter (40 Hz)...")
    X_filtered = apply_lowpass_filter(X, cutoff=cutoff_freq)
    
    # 3. Split Data (Patient Level)
    # Ratio: 60% Train, 10% Val, 30% Test
    print("Splitting data (60/10/30) at patient level...")
    X_train_raw, X_val_raw, X_test_raw, y_train_raw, y_val_raw, y_test_raw = split_data_by_patient(
        X_filtered, y, test_size=0.3, val_size=0.1, random_state=42
    )
    
    
    # 3.5 Apply Normalization (Fit on Train, Transform All)
    print("Normalizing data (Z-score)...")
    scaler = fit_scaler(X_train_raw)
    
    X_train_norm = apply_scaler(scaler, X_train_raw)
    X_val_norm = apply_scaler(scaler, X_val_raw)
    X_test_norm = apply_scaler(scaler, X_test_raw)

    # 4. Segment Data (Independently for each set to prevent leakage)
    WINDOW_SIZE = 178
    STEP_SIZE = 45 # 75% Overlap
    print(f"Segmenting data (Window={WINDOW_SIZE}, Step={STEP_SIZE})...")
    
    X_train, y_train = segment_data(X_train_norm, y_train_raw, WINDOW_SIZE, STEP_SIZE)
    X_val, y_val = segment_data(X_val_norm, y_val_raw, WINDOW_SIZE, STEP_SIZE)
    X_test, y_test = segment_data(X_test_norm, y_test_raw, WINDOW_SIZE, STEP_SIZE)
    
    print(f"Segmentation complete.")
    print(f"  Train: {X_train.shape}")
    print(f"  Val:   {X_val.shape}")
    print(f"  Test:  {X_test.shape}")
    
    # 5. Export to CSV (with One-Hot Encoding)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Define expected columns for 3-class mapping
    expected_classes = [0, 1, 2]
    
    save_subset_to_csv(X_train, y_train, os.path.join(OUTPUT_DIR, 'Bonn_EEG_Train.csv'), "Train Set", expected_classes)
    save_subset_to_csv(X_val, y_val, os.path.join(OUTPUT_DIR, 'Bonn_EEG_Val.csv'), "Validation Set", expected_classes)
    save_subset_to_csv(X_test, y_test, os.path.join(OUTPUT_DIR, 'Bonn_EEG_Test.csv'), "Test Set", expected_classes)
    
    print("Dataset generation successful!")

if __name__ == "__main__":
    main()
