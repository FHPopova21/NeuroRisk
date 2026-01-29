
import os
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np

def analyze_correlation():
    # Paths
    DATA_PATH = 'data/processed/Bonn_EEG_Train.csv'
    OUTPUT_FIGURE = 'reports/figures/correlation_heatmap.png'
    
    # Check if data exists
    if not os.path.exists(DATA_PATH):
        print(f"Error: {DATA_PATH} not found.")
        return

    # Load Data
    print(f"Loading data from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    
    # Define Feature Columns (exclude 'X...' generic names if they exist, assuming we need to map them or they are already named)
    # Wait, generate_dataset.py saves columns as X1, X2, etc. 
    # and "extra_features" are added. 
    # Let's check the CSV header to be sure how columns are named.
    # In generate_dataset.py:
    # columns = [f'X{i+1}' for i in range(n_features)] -> attributes of time series itself? No, X is "X_train" which comes from segment_data(X_train_norm...)
    # segment_data returns (n_segments, window_size).
    # So X1..X178 are the raw time points.
    
    # The "extra_features" are passed as `feats_train`.
    # `feats_train` is a list of dicts.
    # `save_subset_to_csv` does:
    # df_features = pd.DataFrame(extra_features)
    # df = pd.concat([df, df_features], axis=1)
    
    # So the feature columns should be present with their names from `extract_features` keys.
    # Keys from features.py: 
    # 'RMS', 'ZCR', 'Hjorth_Activity', 'Hjorth_Mobility', 'Hjorth_Complexity', 
    # 'Envelope_Mean', 'Envelope_Max', 'Deriv1_Mean', 'Deriv1_Std', 'Deriv2_Mean', 'Deriv2_Std'
    
    feature_cols = [
        'RMS', 'ZCR', 
        'Hjorth_Activity', 'Hjorth_Mobility', 'Hjorth_Complexity',
        'Envelope_Mean', 'Envelope_Max', 
        'Deriv1_Mean', 'Deriv1_Std', 
        'Deriv2_Mean', 'Deriv2_Std'
    ]
    
    # Filter for just these columns
    base_msg = "Checking for feature columns..."
    print(base_msg)
    missing_cols = [c for c in feature_cols if c not in df.columns]
    if missing_cols:
        print(f"Warning: Missing columns: {missing_cols}")
        # Proceed with available columns
        feature_cols = [c for c in feature_cols if c in df.columns]
    
    df_features = df[feature_cols]
    
    # Compute Correlation
    print("Computing correlation matrix...")
    corr_matrix = df_features.corr()
    
    # Identify High Correlations
    print("\nHigh Correlations (> 0.95):")
    high_corr_pairs = []
    # Iterate over the upper triangle
    for i in range(len(corr_matrix.columns)):
        for j in range(i+1, len(corr_matrix.columns)):
            val = corr_matrix.iloc[i, j]
            if abs(val) > 0.95:
                pair = (corr_matrix.columns[i], corr_matrix.columns[j], val)
                high_corr_pairs.append(pair)
                print(f"  {pair[0]} vs {pair[1]}: {val:.4f}")
                
    if not high_corr_pairs:
        print("  None found.")

    # Generate Heatmap
    print(f"Generating heatmap to {OUTPUT_FIGURE}...")
    plt.figure(figsize=(12, 10))
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', fmt=".2f", vmin=-1, vmax=1)
    plt.title('Feature Correlation Matrix (Bonn EEG)')
    plt.tight_layout()
    
    os.makedirs(os.path.dirname(OUTPUT_FIGURE), exist_ok=True)
    plt.savefig(OUTPUT_FIGURE)
    print("Done.")

if __name__ == "__main__":
    analyze_correlation()
