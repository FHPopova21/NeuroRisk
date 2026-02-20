
import numpy as np
from sklearn.model_selection import train_test_split

def split_data_by_patient(X: np.ndarray, y: np.ndarray, 
                         test_size: float = 0.3, 
                         val_size: float = 0.1, 
                         random_state: int = 42):
    """
    Splits the dataset into Train, Validation, and Test sets at the patient level.
    Ensures that all segments from a single patient (file) stay in the same set to avoid data leakage.
    
    Standard Ratio: Train 60%, Val 10%, Test 30%
    (Note: Inputs `test_size` and `val_size` refer to the portion of the *total* dataset)
    
    Args:
        X (np.ndarray): Input data (N_files, ...).
        y (np.ndarray): Labels (N_files,).
        test_size (float): Proportion of dataset to include in the test split.
        val_size (float): Proportion of dataset to include in the validation split.
        random_state (int): Seed for reproducibility.
        
    Returns:
        X_train, X_val, X_test, y_train, y_val, y_test
    """
    
    X_temp, X_test, y_temp, y_test = train_test_split(
        X, y, 
        test_size=test_size, 
        random_state=random_state, 
        stratify=y
    )
    
    remaining_size = 1.0 - test_size
    relative_val_size = val_size / remaining_size
    
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp, 
        test_size=relative_val_size, 
        random_state=random_state, 
        stratify=y_temp
    )
    
    print(f"Data Split Summary:")
    print(f"  Total Samples: {len(X)}")
    print(f"  Train: {len(X_train)} ({len(X_train)/len(X):.1%})")
    print(f"  Val:   {len(X_val)}   ({len(X_val)/len(X):.1%})")
    print(f"  Test:  {len(X_test)}  ({len(X_test)/len(X):.1%})")
    
    return X_train, X_val, X_test, y_train, y_val, y_test
