import os
import numpy as np
import glob

# Constants for Bonn Dataset folders
# Classes A (Z) and B (O) - Healthy
# Classes C (N) and D (F) - Epileptic inter-ictal
# Class E (S) - Epileptic ictal (seizure)
# Mapping: Z, O, N, F -> 0 (Non-Seizure)
#          S -> 1 (Seizure)
SETS = {
    'Z': 0,
    'O': 0,
    'N': 0,
    'F': 0,
    'S': 1
}

def load_bonn_data(base_path: str, binary: bool = True):
    """
    Load data from the Bonn EEG dataset.
    
    Args:
        base_path: Path to the root directory containing folder (Z, O, N, F, S)
                   or path containing 'Dataset' folder which contains these folders.
        binary: If True, perform binary classification (Seizure vs Non-Seizure).
                If False, raw classes might be returned (not implemented in this specific task request).
                
    Returns:
        X: numpy array of shape (n_samples, n_timepoints)
        y: numpy array of shape (n_samples,)
    """
    
    # Adjust path if 'Dataset' is a subdirectory of base_path but not included in input
    if os.path.exists(os.path.join(base_path, 'Dataset')):
        base_path = os.path.join(base_path, 'Dataset')
        
    X = []
    y = []
    
    # Iterate through defined sets
    for folder_name, label in SETS.items():
        folder_path = os.path.join(base_path, folder_name)
        
        if not os.path.exists(folder_path):
            print(f"Warning: Folder {folder_path} not found. Skipping.")
            continue
            
        file_pattern = os.path.join(folder_path, '*.txt')
        files = glob.glob(file_pattern)
        
        if not files:
            print(f"Warning: No .txt files found in {folder_path}")
            continue
            
        print(f"Loading {len(files)} files from {folder_name} (Class {label})...")
        
        for file_path in files:
            try:
                # Read single column text file
                # Each file contains one EEG recording (4097 samples)
                # Using np.loadtxt is convenient for simple text files
                data = np.loadtxt(file_path)
                X.append(data)
                y.append(label)
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
                
    X = np.array(X)
    y = np.array(y)
    
    return X, y

if __name__ == "__main__":
    # Simple test execution
    # Assuming standard project structure
    repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_path = os.path.join(repo_root, 'data', 'raw')
    
    print(f"Testing loader with path: {data_path}")
    X_data, y_data = load_bonn_data(data_path)
    print(f"Loaded data shape: X={X_data.shape}, y={y_data.shape}")
    
    # Verify classes
    unique, counts = np.unique(y_data, return_counts=True)
    print("Class distribution:", dict(zip(unique, counts)))
