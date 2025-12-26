
import numpy as np
from scipy.signal import butter, filtfilt

def apply_lowpass_filter(data: np.ndarray, cutoff: float = 40.0, fs: float = 173.61, order: int = 5) -> np.ndarray:
    """
    Apply a Low-Pass Butterworth filter to the EEG data.
    
    Args:
        data: Input data, can be 1D (n_samples,) or 2D (n_signals, n_samples).
              If 2D, filtering is applied along axis -1 (time axis).
        cutoff: Cutoff frequency in Hz (default 40 Hz).
        fs: Sampling frequency in Hz (default 173.61 Hz).
        order: Order of the filter (default 5).
        
    Returns:
        Filtered data with same shape as input.
    """
    # Calculate Nyquist frequency
    nyq = 0.5 * fs
    
    # Normalize cutoff frequency
    normal_cutoff = cutoff / nyq
    
    # Design Butterworth filter
    b, a = butter(order, normal_cutoff, btype='low', analog=False)
    
    # Apply filter using zero-phase filtering (filtfilt)
    # axis=-1 handles both 1D and 2D arrays correctly if time is the last axis
    y = filtfilt(b, a, data, axis=-1)
    
    return y
