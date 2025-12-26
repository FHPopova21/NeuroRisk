import numpy as np
from sklearn.preprocessing import StandardScaler

def fit_scaler(X_train):
    """
    Fits a StandardScaler on the training data.
    
    Args:
        X_train (np.ndarray): Training data of shape (N_samples, TimePoints).
        
    Returns:
        scaler (StandardScaler): Fitted scaler object.
    """
    # Flatten the data to (N_samples * TimePoints, 1) to learn global mean/std
    # This treats every time point as an instance of the signal amplitude distribution
    X_flat = X_train.flatten().reshape(-1, 1)
    
    scaler = StandardScaler()
    scaler.fit(X_flat)
    
    print(f"Scaler fitted. Mean: {scaler.mean_[0]:.4f}, Std: {np.sqrt(scaler.var_[0]):.4f}")
    return scaler

def apply_scaler(scaler, X):
    """
    Applies the fitted scaler to input data.
    
    Args:
        scaler (StandardScaler): Fitted scaler object.
        X (np.ndarray): Data to transform of shape (N_samples, TimePoints).
        
    Returns:
        X_scaled (np.ndarray): Scaled data of same shape.
    """
    if scaler is None:
        raise ValueError("Scaler is not provided.")
        
    original_shape = X.shape
    
    # Flatten, transform, reshape back
    X_flat = X.flatten().reshape(-1, 1)
    X_scaled_flat = scaler.transform(X_flat)
    X_scaled = X_scaled_flat.reshape(original_shape)
    
    return X_scaled
