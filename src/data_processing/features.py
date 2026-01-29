import numpy as np
from scipy.signal import hilbert

def compute_rms(signal):
    """
    Compute Root Mean Square (RMS) of a signal.
    """
    return np.sqrt(np.mean(signal**2))

def compute_zcr(signal):
    """
    Compute Zero Crossing Rate (ZCR).
    """
    # Count sign changes
    return ((signal[:-1] * signal[1:]) < 0).sum() / len(signal)

def compute_hjorth_parameters(signal):
    """
    Compute Hjorth Parameters: Activity, Mobility, Complexity.
    """
    deriv1 = np.diff(signal)
    deriv2 = np.diff(deriv1)
    
    # Activity: Variance of the signal
    activity = np.var(signal)
    
    # Mobility: sqrt(var(deriv1) / var(signal))
    # Avoid division by zero
    if activity == 0:
        mobility = 0
    else:
        mobility = np.sqrt(np.var(deriv1) / activity)
        
    # Complexity: Mobility(deriv1) / Mobility(signal)
    # Mobility(deriv1) = sqrt(var(deriv2) / var(deriv1))
    var_deriv1 = np.var(deriv1)
    if var_deriv1 == 0:
        mobility_deriv1 = 0
    else:
        mobility_deriv1 = np.sqrt(np.var(deriv2) / var_deriv1)
        
    if mobility == 0:
        complexity = 0
    else:
        complexity = mobility_deriv1 / mobility
        
    return activity, mobility, complexity

def compute_envelope_stats(signal):
    """
    Compute statistics (Mean, Max) of the Hilbert Envelope.
    """
    analytic_signal = hilbert(signal)
    amplitude_envelope = np.abs(analytic_signal)
    
    return np.mean(amplitude_envelope), np.max(amplitude_envelope)

def compute_derivative_stats(signal):
    """
    Compute Mean and Std of 1st and 2nd derivatives.
    Returns: (mean_d1, std_d1, mean_d2, std_d2)
    """
    d1 = np.diff(signal)
    d2 = np.diff(d1)
    
    mean_d1 = np.mean(d1)
    std_d1 = np.std(d1)
    
    mean_d2 = np.mean(d2)
    std_d2 = np.std(d2)
    
    return mean_d1, std_d1, mean_d2, std_d2

def extract_features(signal):
    """
    Extract a dictionary of all transient features for a single segment.
    """
    features = {}
    
    features['RMS'] = compute_rms(signal)
    features['ZCR'] = compute_zcr(signal)
    
    act, mob, comp = compute_hjorth_parameters(signal)
    features['Hjorth_Activity'] = act
    features['Hjorth_Mobility'] = mob
    features['Hjorth_Complexity'] = comp
    
    env_mean, env_max = compute_envelope_stats(signal)
    # features['Envelope_Mean'] = env_mean  # REMOVED: Redundant with RMS
    features['Envelope_Max'] = env_max
    
    md1, sd1, md2, sd2 = compute_derivative_stats(signal)
    # features['Deriv1_Mean'] = md1  # REMOVED: Noise
    features['Deriv1_Std'] = sd1
    # features['Deriv2_Mean'] = md2  # REMOVED: Noise
    features['Deriv2_Std'] = sd2
    
    return features
