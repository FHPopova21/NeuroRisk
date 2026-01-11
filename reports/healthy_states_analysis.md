# Healthy States Analysis (Z vs O) - Findings

## Overview
This report summarizes the comparison between the two healthy sub-classes in the Bonn EEG dataset:
- **Set Z (A)**: Healthy volunteers, Eyes Open.
- **Set O (B)**: Healthy volunteers, Eyes Closed.

## 1. Statistical Comparison
| Metric | Set Z (Eyes Open) | Set O (Eyes Closed) | Difference |
| :--- | :--- | :--- | :--- |
| **Mean Amplitude** | -6.26 ± 24.69 | -12.51 ± 30.57 | O is slightly more negative, higher variance. |
| **Std Deviation** | 40.73 ± 8.26 | 61.10 ± 18.12 | **O has ~50% higher variability.** |
| **Signal Power** | 2375 ± 1233 | 5153 ± 2850 | **O has >2x signal power.** |

## 2. Spectral Analysis (Alpha Rhythm)
We analyzed the power in the Alpha band (8-12 Hz), which is typically associated with relaxed wakefulness and eyes closed.

*   **Set Z Alpha Power**: 278.80
*   **Set O Alpha Power**: 1855.69
*   **Ratio (O/Z)**: ~6.66x

**Observation**: Set O exhibits a massive increase in Alpha power compared to Set Z. This creates a distinct "oscillatory" signature in the time domain for Set O, whereas Set Z appears more desynchronized (lower amplitude, higher frequency mix).

## 3. Conclusion & Motivation for Merging
The significant differences in Signal Power and Alpha content highlight the **natural variability** within "Healthy" EEG signals.

*   **Result**: If the model is trained *only* on Z (Eyes Open), it might learn to associate high-amplitude alpha waves (present in O) with "abnormal" activity, potentially misclassifying healthy "Eyes Closed" segments as seizures or inter-ictal spikes.
*   **Action**: Merging Z and O into a single class (0) provides the model with a comprehensive view of the healthy baseline. It forces the classifier to learn features that are invariant to the subject's visual state (e.g., absence of sharp spikes/wave discharges) rather than relying on simple amplitude thresholds.

The combination of these datasets is methodologically essential for building a robust seizure detection system.
