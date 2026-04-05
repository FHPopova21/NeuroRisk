import pandas as pd
import time
import eel
import os

class EEGSimulator:
    def __init__(self, data_path=None):
        if data_path is None:
            # Default to the known project path
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
            data_path = os.path.join(base_dir, "data", "eeg_data", "Epileptic Seizure Recognition.csv")
            
        self.data_path = data_path
        self.df = None
        self.streaming = False
        
    def load_data(self):
        if self.df is None:
            print(f"Зареждане на датасет от: {self.data_path}")
            self.df = pd.read_csv(self.data_path)
            # Remove the 'Unnamed' column if it exists
            if 'Unnamed' in self.df.columns or 'Unnamed: 0' in self.df.columns:
                col_to_drop = 'Unnamed' if 'Unnamed' in self.df.columns else 'Unnamed: 0'
                self.df = self.df.drop(columns=[col_to_drop])
            print(f"Датасетът е зареден: {self.df.shape}")

    def get_signal_batch(self, patient_label, num_chunks=24):
        """
        Взима `num_chunks` реда от конкретен клас (label).
        Всеки ред съдържа 178 точки.
        y=1 (Епилепсия/Болен), y=5 (Здрав)
        """
        self.load_data()
        
        # Филтрираме по етикет
        subset = self.df[self.df['y'] == patient_label]
        
        if len(subset) == 0:
            print(f"Няма данни за клас {patient_label}")
            return []
            
        # Взимаме произволни N реда от този клас
        sample = subset.sample(n=min(num_chunks, len(subset)))
        
        # Всички колони без последната ('y') са ЕЕГ данни
        eeg_cols = [col for col in self.df.columns if col.startswith('X')]
        
        signal = []
        for _, row in sample.iterrows():
            signal.extend(row[eeg_cols].values.tolist())
            
        return signal

    def stream_to_eel(self, patient_label=5, add_to_buffer_func=None):
        """
        Стриймва данните към Eel UI като истински сензор (~173.6Hz).
        """
        signal = self.get_signal_batch(patient_label=patient_label)
        if not signal:
            return
            
        self.streaming = True
        print(f"Старт на симулация с етикет {patient_label}. Точки: {len(signal)}")
        
        # 173.61 Hz = 0.00576 секунди на точка
        # Намаляваме малко sleep timer-а, понеже самият print/eel.update отнема време
        sleep_time = 1.0 / 250.0 
        
        for value in signal:
            if not self.streaming:
                break
                
            # Пращаме към UI-а директно стойността (number)
            eel.updateEEGData(float(value))
            
            # Добавяме в буфера на main.py, за да може да го анализира Flask
            if add_to_buffer_func:
                add_to_buffer_func(float(value))
                
            time.sleep(sleep_time)
            
        self.streaming = False
        print("Симулацията приключи.")

    def stop_streaming(self):
        self.streaming = False
