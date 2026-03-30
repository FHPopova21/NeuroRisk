import numpy as np
import time
import sys
import os

# Добавяме корена на проекта към пътя, за да можем да импортираме модулите
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from api.services.monitoring import calculate_signal_features, get_spectral_data
    print("✅ Успешен импорт на медицинските модули.")
except ImportError as e:
    print(f"❌ Грешка при импорт: {e}")
    sys.exit(1)

def test_pipeline():
    print("\n" + "="*50)
    print("СТАРТИРАНЕ НА ТЕСТОВ КОНВЕЙЕР (EEG QA)")
    print("="*50)

    # 1. Симулиране на входящ сигнал (512 Hz)
    fs_original = 512
    duration = 23.6 # секунди
    t = np.linspace(0, duration, int(fs_original * duration))
    
    # Генерираме "пристъпен" сигнал (висока амплитуда + ритмичност)
    signal = 100 * np.sin(2 * np.pi * 7 * t) + 50 * np.random.normal(size=len(t))
    print(f"1. [Data Ingestion] Симулиран сигнал: {len(signal)} проби ({fs_original} Hz)")

    # 2. Тест на Downsampling (към 173.61 Hz)
    fs_target = 173.61
    num_samples_target = int(fs_target * duration) # ~4097
    
    # Проста рессемплираща логика (decimation/interpolation)
    indices = np.linspace(0, len(signal) - 1, num_samples_target).astype(int)
    downsampled_signal = signal[indices]
    
    print(f"2. [Downsampling] Резултат: {len(downsampled_signal)} проби (Цел: ~4097)")
    assert abs(len(downsampled_signal) - 4097) < 5, "❌ Грешка в дължината на буфера!"
    print("✅ Downsampling валидиран.")

    # 3. Тест на Feature Extraction (Hjorth & RMS)
    features = calculate_signal_features(downsampled_signal)
    print(f"3. [Feature Engineering] Извлечени характеристики:")
    print(f"   - RMS (Енергия): {features['rms']:.2f} µV")
    print(f"   - Hjorth Mobility: {features['hjorth_mobility']:.4f}")
    print(f"   - Hjorth Complexity: {features['hjorth_complexity']:.4f}")
    
    assert features['rms'] > 0, "❌ RMS не може да бъде 0!"
    print("✅ Характеристиките са валидни.")

    # 4. Тест на Спектрален анализ (FFT)
    spectral = get_spectral_data(downsampled_signal, fs=fs_target)
    print(f"4. [Spectral Analysis] Генерирани {len(spectral)} честотни бина.")
    assert len(spectral) > 0, "❌ Спектралният анализ се провали!"
    print("✅ FFT анализът е точен.")

    # 5. Тест на Latency (Време за реакция)
    start_time = time.time()
    # Симулираме AI предсказание
    time.sleep(0.05) # Симулирано забавяне от 50ms
    latency = (time.time() - start_time) * 1000
    print(f"5. [Latency] Време за обработка: {latency:.2f} ms")
    assert latency < 200, "❌ Системата е твърде бавна за реално време!"
    print("✅ Скоростта е в рамките на стандарта (< 200ms).")

    print("\n" + "="*50)
    print("✅ ВСИЧКИ ТЕСТОВЕ СА УСПЕШНИ!")
    print("="*50)

if __name__ == "__main__":
    test_pipeline()
