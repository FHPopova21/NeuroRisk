
import os
import pandas as pd
import numpy as np

def save_to_csv(X: np.ndarray, y: np.ndarray, filename: str):
    """
    Saves the segmented data and labels to a CSV file.
    
    Args:
        X (np.ndarray): Segmented data array of shape (n_samples, window_size).
        y (np.ndarray): Labels array of shape (n_samples,).
        filename (str): The path to save the CSV file.
    """
    # Ensure directory exists
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    # Create column names
    n_features = X.shape[1]
    columns = [f'X{i+1}' for i in range(n_features)]
    
    # Create DataFrame
    df = pd.DataFrame(X, columns=columns)
    df['y'] = y
    
    # Save to CSV
    print(f"Saving dataset with shape {df.shape} to {filename}...")
    df.to_csv(filename, index=False)
    print("Save complete.")
