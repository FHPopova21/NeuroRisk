/**
 * Simple FFT implementation for EEG signal visualization.
 */
export function computeFFT(signal: number[]) {
  const n = signal.length;
  if (n === 0) return [];

  // Simple Magnitude spectrum (Mock FFT for visualization if real one is too complex)
  // For 178 points, we can do a basic DFT or just a simple mock for now if performance is an issue.
  // Actually, let's do a basic DFT magnitude for small-ish n.
  
  const results = [];
  const limit = Math.floor(n / 2); // Nyquist
  
  for (let k = 0; k < limit; k++) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * k * i) / n;
      re += signal[i] * Math.cos(angle);
      im -= signal[i] * Math.sin(angle);
    }
    const mag = Math.sqrt(re * re + im * im) / n;
    results.push({
      frequency: k,
      magnitude: mag
    });
  }
  
  return results;
}
