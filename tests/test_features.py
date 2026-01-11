import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
import numpy as np
from src.data_processing.features import extract_features, compute_rms, compute_zcr

class TestFeatures(unittest.TestCase):
    
    def setUp(self):
        # Create a simple sine wave: 1 Hz, Amplitude 1
        t = np.linspace(0, 1, 100, endpoint=False)
        self.sine_wave = np.sin(2 * np.pi * t)
        
        # Create a defined array for exact manual check
        self.simple_array = np.array([1.0, -1.0, 1.0, -1.0])

    def test_rms_sine(self):
        # RMS of sin wave with amp 1 is 1/sqrt(2) approx 0.707
        rms = compute_rms(self.sine_wave)
        self.assertAlmostEqual(rms, 0.7071, places=4)
        
    def test_zcr_simple(self):
        # [1, -1, 1, -1] -> 3 crossings / 4 samples = 0.75
        zcr = compute_zcr(self.simple_array)
        self.assertEqual(zcr, 0.75)
        
    def test_extract_features_keys(self):
        feats = extract_features(self.sine_wave)
        expected_keys = [
            'RMS', 'ZCR', 
            'Hjorth_Activity', 'Hjorth_Mobility', 'Hjorth_Complexity',
            'Envelope_Mean', 'Envelope_Max',
            'Deriv1_Mean', 'Deriv1_Std',
            'Deriv2_Mean', 'Deriv2_Std'
        ]
        for key in expected_keys:
            self.assertIn(key, feats)

if __name__ == '__main__':
    unittest.main()
