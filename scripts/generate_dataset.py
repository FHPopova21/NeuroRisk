
import os
import sys
import numpy as np

# Add src to path
sys.path.append(os.path.abspath('.'))

from src.data_processing.loader import load_bonn_data
from src.data_processing.filtering import apply_lowpass_filter
from src.data_processing.segmentation import segment_data
from src.data_processing.export import save_to_csv

def main():
    print("Starting dataset generation...")
    
    # 1. Load Data
    data_path = os.path.join('data', 'raw')
    print(f"Loading data from {data_path}...")
    X, y = load_bonn_data(data_path)
    print(f"Data loaded. Shape: {X.shape}")
    
    # 2. Apply Filtering
    print("Applying Low-Pass Filter (40 Hz)...")
    X_filtered = apply_lowpass_filter(X, cutoff=40.0)
    
    # 3. Apply Segmentation (75% Overlap)
    WINDOW_SIZE = 178
    STEP_SIZE = 45 # 75% Overlap
    print(f"Segmenting data (Window={WINDOW_SIZE}, Step={STEP_SIZE})...")
    X_seg, y_seg = segment_data(X_filtered, y, window_size=WINDOW_SIZE, step_size=STEP_SIZE)
    print(f"Segmentation complete. New Shape: {X_seg.shape}")
    
    # 4. Save to CSV
    output_file = os.path.join('data', 'processed', 'Bonn_EEG_Augmented.csv')
    print(f"Saving to {output_file}...")
    save_to_csv(X_seg, y_seg, output_file)
    print("Dataset generation successful!")

if __name__ == "__main__":
    main()
