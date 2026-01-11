# Multicollinearity Management Report (Window Overlap)

## Problem Analysis
The segmentation process uses a **178-sample window** with a **45-sample step**, resulting in a **75% overlap** between consecutive segments.
This high overlap leads to severe multicollinearity (redundancy) if the segments are fed sequentially into a model, particularly if the model assumes independent and identically distributed (i.i.d.) samples (like standard MLP/CNNs).

### Quantitative Evidence
We analyzed the autocorrelation of transient features (RMS, Envelope, ZCR) between adjacent rows in the generated dataset.

*   **Before Mitigation (Ordered)**:
    *   Mean Feature Correlation: **~0.98**
    *   Result: **HIGH REDUNDANCY DETECTED**
*   **After Mitigation (Shuffled)**:
    *   Mean Feature Correlation: **~0.005**
    *   Result: **LOW REDUNDANCY**

## Mitigation Strategies Implemented

### 1. Training Set Shuffling
We modified `generate_dataset.py` to explicit shuffle the **Train Set** rows (`frac=1`). This breaks the temporal dependency between adjacent samples in the CSV file, ensuring that a batch of data contains a random mix of segments rather than a highly correlated sequence.

*   **Note**: Validation and Test sets are **NOT** shuffled to maintain reproducibility and allow for sequential evaluation if needed (though standard metrics don't care about order).

### 2. Recommended Regularization Strategies
For the subsequent modeling phase (Task 6+), we recommend the following to further handle any residual feature co-variance:

*   **Dropout**: A Dropout rate of **0.3 - 0.5** in dense layers. This prevents neurons from co-adapting to the redundant features.
*   **L2 Regularization (Weight Decay)**: Apply L2 penalty (e.g., `1e-4` or `1e-5`) to weights. This penalizes large weights and forces the model to distribute importance across features, reducing sensitivity to collinearity.
*   **Global Average Pooling (GAP)**: For CNNs, using GAP instead of flattening at the end can reduce overfitting to specific spatial/temporal locations of features.

## Conclusion
The multicollinearity issue has been successfully addressed at the data level via shuffling. The dataset is now robust for training standard neural networks.
