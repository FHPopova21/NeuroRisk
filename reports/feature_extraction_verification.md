# Feature Extraction Verification Report

## Objective
To verify the successful extraction and integration of transient features (related to signal dynamics) into the processed EEG dataset.

## Methodology
1.  **Code implementation**: 
    -   Created `src/data_processing/features.py` to calculate RMS, ZCR, Hjorth parameters, Envelope statistics, and Derivative statistics.
    -   Updated `scripts/generate_dataset.py` to apply this extraction on **raw signal segments** (preserving absolute amplitude information) before they are merged with the normalized time-series data.
2.  **Execution**: Ran the dataset generation pipeline.
3.  **Verification**: Inspected the output CSV files (`Bonn_EEG_Train.csv`, `Bonn_EEG_Val.csv`, `Bonn_EEG_Test.csv`).

## Results

### Dataset Dimensions
The generated CSV files now exhibit the following structure:

*   **Total Columns**: **192**
*   **Breakdown**:
    *   **178** Normalized Time-Series Points (`X1` to `X178`)
    *   **11** Transient Features (calculated on raw segments)
    *   **3** One-Hot Encoded Labels (`y_0`, `y_1`, `y_2`)

### Feature List
The following 11 new features have been added:
1.  **RMS**: Root Mean Square (Signal Energy)
2.  **ZCR**: Zero Crossing Rate (Frequency estimate)
3.  **Hjorth_Activity**: Signal variance
4.  **Hjorth_Mobility**: Mean frequency
5.  **Hjorth_Complexity**: Bandwidth change
6.  **Envelope_Mean**: Average amplitude of Hilbert envelope
7.  **Envelope_Max**: Peak amplitude of Hilbert envelope
8.  **Deriv1_Mean**: Mean of 1st derivative
9.  **Deriv1_Std**: Stability of 1st derivative
10. **Deriv2_Mean**: Mean of 2nd derivative
11. **Deriv2_Std**: Stability of 2nd derivative

## Conclusion
The feature extraction module works as expected. The dataset now contains hybrid information:
*   **Normalized shape** (via Z-score time-points) for Neural Networks.
*   **Absolute dynamics** (via features) to compensate for normalization and capturing transient events like seizure onsets.

The data is ready for model training.
