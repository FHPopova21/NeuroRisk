
import os
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np

def analyze_feature_distribution():
    # Paths
    DATA_PATH = 'data/processed/Bonn_EEG_Train.csv'
    OUTPUT_DIR = 'reports/figures'
    
    # Check if data exists
    if not os.path.exists(DATA_PATH):
        print(f"Error: {DATA_PATH} not found.")
        return

    # Load Data
    print(f"Loading data from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    
    # Decode Labels
    # y_0, y_1, y_2 -> 0, 1, 2
    y_cols = [c for c in df.columns if c.startswith('y_')]
    if not y_cols:
        print("Error: No label columns found.")
        return
        
    # Map index to class name
    # Assuming: 0=Healthy (Set B), 1=Inter-ictal (Set C/D), 2=Seizure (Set E)
    # Check generate_dataset.py logic if unsure, but typically this is the order.
    # We will assume: 0=Healthy, 1=Inter-ictal, 2=Seizure
    class_map = {0: 'Healthy', 1: 'Inter-ictal', 2: 'Seizure'}
    
    df['Class_Index'] = df[y_cols].idxmax(axis=1).apply(lambda s: int(s.split('_')[1]))
    df['Condition'] = df['Class_Index'].map(class_map)
    
    # Features to Plot
    # Top features from Part B + RMS (requested by user)
    features_to_plot = ['RMS', 'Hjorth_Mobility', 'Hjorth_Complexity', 'Hjorth_Activity', 'Envelope_Max']
    
    # Filter available
    features_to_plot = [f for f in features_to_plot if f in df.columns]
    
    print(f"Generating Box Plots for: {features_to_plot}")
    
    # 1. Combined Boxplot (Subplots)
    n_feats = len(features_to_plot)
    fig, axes = plt.subplots(1, n_feats, figsize=(4 * n_feats, 6))
    
    if n_feats == 1:
        axes = [axes]
        
    for i, feature in enumerate(features_to_plot):
        sns.boxplot(x='Condition', y=feature, data=df, ax=axes[i], palette='Set2')
        axes[i].set_title(f'Distribution of {feature}')
        axes[i].set_xlabel('')
        
    plt.tight_layout()
    combined_path = os.path.join(OUTPUT_DIR, 'feature_distribution_boxplots.png')
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    plt.savefig(combined_path)
    print(f"Saved combined plot to {combined_path}")
    
    # 2. Individual RMS Plot (Specific User Request)
    if 'RMS' in df.columns:
        plt.figure(figsize=(6, 6))
        sns.boxplot(x='Condition', y='RMS', data=df, palette='Set2')
        plt.title('RMS Distribution by Class')
        plt.grid(True, linestyle='--', alpha=0.5)
        rms_path = os.path.join(OUTPUT_DIR, 'boxplot_RMS.png')
        plt.savefig(rms_path)
        print(f"Saved independent RMS plot to {rms_path}")

if __name__ == "__main__":
    analyze_feature_distribution()
