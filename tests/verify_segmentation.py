
import sys
import os
import numpy as np

# Add src to path
sys.path.append(os.path.abspath('.'))

from src.data_processing.segmentation import segment_data

def verify_segmentation():
    # Simulate data: 500 recordings, 4097 points each
    n_recordings = 500
    points_per_recording = 4097
    X = np.random.rand(n_recordings, points_per_recording)
    y = np.random.randint(0, 2, n_recordings)

    print(f"Input X shape: {X.shape}")
    print(f"Input y shape: {y.shape}")

    # Expected parameters
    window_size = 178
    step_size = 45 # 75% overlap

    # Calculate expected segments per recording
    # (4097 - 178) // 45 + 1
    expected_segments_per_rec = (points_per_recording - window_size) // step_size + 1
    total_expected = expected_segments_per_rec * n_recordings
    
    print(f"Expected segments per recording: {expected_segments_per_rec}")
    print(f"Total expected segments: {total_expected}")

    # Run segmentation
    X_seg, y_seg = segment_data(X, y, window_size=window_size, step_size=step_size)

    print(f"Output X_seg shape: {X_seg.shape}")
    print(f"Output y_seg shape: {y_seg.shape}")

    # Assertions
    assert X_seg.shape[0] == total_expected, f"Expected {total_expected}, got {X_seg.shape[0]}"
    assert X_seg.shape[1] == window_size, f"Expected window size {window_size}, got {X_seg.shape[1]}"
    assert y_seg.shape[0] == total_expected, "Label count mismatch"

    print("Verification PASSED!")

if __name__ == "__main__":
    verify_segmentation()
