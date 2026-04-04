
import os
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
from sklearn.ensemble import RandomForestClassifier

def analyze_feature_importance():
    # Paths
    DATA_PATH = 'data/processed/Bonn_EEG_Train.csv'
    OUTPUT_FIGURE = 'reports/figures/feature_importance.png'
    
    # Check if data exists
    if not os.path.exists(DATA_PATH):
        print(f"Error: {DATA_PATH} not found.")
        return

    # Load Data
    print(f"Loading data from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    
    # Define Feature Columns
    feature_cols = [
        'RMS', 'ZCR', 
        'Hjorth_Activity', 'Hjorth_Mobility', 'Hjorth_Complexity',
        'Envelope_Mean', 'Envelope_Max', 
        'Deriv1_Mean', 'Deriv1_Std', 
        'Deriv2_Mean', 'Deriv2_Std'
    ]
    
    # Filter for available columns
    available_cols = [c for c in feature_cols if c in df.columns]
    if len(available_cols) < len(feature_cols):
        print(f"Warning: Only found {len(available_cols)} feature columns out of {len(feature_cols)}.")
    
    X = df[available_cols]
    
    # Define Label
    # The dataset has One-Hot Encoded labels: y_0, y_1, y_2
    # We need to convert back to single column for standard sklearn y
    y_cols = [c for c in df.columns if c.startswith('y_')]
    if not y_cols:
        print("Error: No label columns (y_*) found.")
        return
        
    print(f"Using label columns: {y_cols}")
    y_ohe = df[y_cols]
    y = y_ohe.idxmax(axis=1).apply(lambda s: int(s.split('_')[1])) # Extract class index 0, 1, 2
    
    # Train Random Forest
    print("Training RandomForestClassifier...")
    rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    rf.fit(X, y)
    
    # Get Importances
    importances = rf.feature_importances_
    feature_importance_df = pd.DataFrame({
        'Feature': available_cols,
        'Importance': importances
    }).sort_values(by='Importance', ascending=False)
    
    print("\nFeature Importances:")
    print(feature_importance_df)
    
    # Generate Bar Plot
    print(f"Generating plot to {OUTPUT_FIGURE}...")
    plt.figure(figsize=(10, 6))
    sns.barplot(x='Importance', y='Feature', data=feature_importance_df, palette='viridis')
    plt.title('Feature Importance (Random Forest)')
    plt.xlabel('Importance Score')
    plt.ylabel('Feature')
    plt.tight_layout()
    
    os.makedirs(os.path.dirname(OUTPUT_FIGURE), exist_ok=True)
    plt.savefig(OUTPUT_FIGURE)
    print("Done.")

if __name__ == "__main__":
    analyze_feature_importance()
