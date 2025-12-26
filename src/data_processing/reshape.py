import numpy as np

def reshape_for_cnn(X):
    """
    Reshapes 2D EEG data into 3D tensors for 1D CNNs or RNNs.
    
    Transforms (N_samples, TimePoints) -> (N_samples, TimePoints, 1)
    
    Args:
        X (np.ndarray): Input data. Can be 2D (N, T) or already 3D (N, T, 1).
        
    Returns:
        X_3d (np.ndarray): Reshaped data (N, T, 1).
        
    Raises:
        ValueError: If input dimensions are not supported.
    """
    if X.ndim == 2:
        # (N, T) -> (N, T, 1)
        return X[..., np.newaxis]
    
    elif X.ndim == 3:
        if X.shape[-1] == 1:
            # Already (N, T, 1)
            return X
        else:
            raise ValueError(f"Input is 3D but last dimension is {X.shape[-1]}, expected 1.")
            
    else:
        raise ValueError(f"Expected 2D or 3D input, got {X.ndim}D shape {X.shape}.")
