import numpy as np

def segment_data(X: np.ndarray, y: np.ndarray, window_size: int = 178, step_size: int = 45):
    """
    Segments EEG data using an overlapping sliding window technique.
    
    Args:
        X (np.ndarray): Input data array of shape (n_samples, signal_length).
        y (np.ndarray): Labels array of shape (n_samples,).
        window_size (int, optional): The size of the sliding window. Defaults to 178 (approx 1 sec).
        step_size (int, optional): The step size for the sliding window. Defaults to 45 (approx 75% overlap).
        
    Returns:
        tuple: A tuple containing:
            - X_segmented (np.ndarray): Segmented data of shape (total_segments, window_size).
            - y_segmented (np.ndarray): Labels for each segment of shape (total_segments,).
    """
    n_samples, signal_length = X.shape
    
    segments = []
    labels = []
    
    for i in range(n_samples):
        signal = X[i]
        label = y[i]
        
        # Slide window across the signal
        for start in range(0, signal_length - window_size + 1, step_size):
            end = start + window_size
            segment = signal[start:end]
            
            segments.append(segment)
            labels.append(label)
            
    X_segmented = np.array(segments)
    y_segmented = np.array(labels)
    
    return X_segmented, y_segmented
