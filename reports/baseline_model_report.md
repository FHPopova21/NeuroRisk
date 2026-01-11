# Baseline Model Report: Logistic Regression
**(Sanity Check for Seizure Detection)**

## 1. Introduction
The objective of this experiment was to establish a **baseline performance** using the simplest possible classification algorithm: **Logistic Regression**.
If this linear model performs reasonably well, it indicates that the engineered features (Amplitude, RMS, Spectral Power) are highly discriminative. Deep Learning models (developed in later stages) must significantly outperform this baseline, particularly in sensitivity (Recall), to be justified.

## 2. Model Configuration
The implementation uses a custom, vectorized Logistic Regression built from scratch in Python/NumPy (no high-level training loop).

### 2.1. Architecture
*   **Type:** Binary Classifier (Seizure vs Non-Seizure).
*   **Input Dimension:** 192 features (178 Time-points + 14 Transient Features).
*   **Activation:** Sigmoid Function ($\sigma(z) = \frac{1}{1 + e^{-z}}$).
*   **Decision Threshold:** 0.5.

### 2.2. Training Hyperparameters
*   **Learning Rate:** 0.1
*   **Epochs:** 2000
*   **Optimizer:** Batch Gradient Descent
*   **Loss Function:** Binary Cross-Entropy

### 2.3. Dataset
*   **Training Set:** ~26,000 samples (Shuffled).
*   **Test Set:** ~13,200 samples.
*   **Classes:**
    *   **0 (Non-Seizure):** Classes Z, O, N, F.
    *   **1 (Seizure):** Class S.

## 3. Results (Test Set Evaluation)

### 3.1. Overall Performance
*   **Accuracy:** **97.41%**

### 3.2. Confusion Matrix
| | Predict: Non-Seizure | Predict: Seizure |
| :--- | :---: | :---: |
| **Actual: Non-Seizure** | **10,509** (TN) | 51 (FP) |
| **Actual: Seizure** | 291 (FN) | **2,349** (TP) |

### 3.3. Classification Report
| Class | Precision | Recall | F1-Score |
| :--- | :--- | :--- | :--- |
| **Non-Seizure** | 0.97 | **1.00** | 0.98 |
| **Seizure** | **0.98** | **0.89** | 0.93 |

## 4. Analysis & Conclusion

1.  **High Linearity:** The model achieved ~97% accuracy, which is exceptionally high for a linear classifier. This confirms that **Seizure** signals are linearly separable from **Non-Seizure** signals in the high-dimensional feature space, primarily due to the massive amplitude difference (~240µV vs ~50µV).
2.  **The "Safety Gap" (False Negatives):** Despite high accuracy, the model missed **291 seizures** (Recall = 89%). In a medical context, this is a critical failure mode. A diagnostic system must ideally have >99% sensitivity.
3.  **Next Steps (Deep Learning):**
    *   The goal for CNN/RNN models is not just "better accuracy" (which is already high), but **closing the Recall gap**.
    *   Future models will also solve the harder **3-Class Problem** (distinguishing Inter-ictal from Healthy), which this baseline ignored.

**Verdict:** The Baseline is strong but insufficient for clinical use due to 11% missed seizures.
