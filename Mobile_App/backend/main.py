import eel
import socket
import json
import threading
import time
import os
import sys
import requests 
from mindwave.mindwave import Headset

# Add the project root to sys.path to allow importing from api
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# ThinkGear Connector (TGC) Configuration
TGC_HOST = '127.0.0.1'
TGC_PORT = 13854
FLASK_API_URL = 'http://127.0.0.1:5001/api/monitoring/analyze' # НОВО: Адресът на твоя Flask сървър

streaming = False
eeg_buffer = [] # НОВО: Тук ще събираме точките

@eel.expose
def start_eeg_stream():
    global streaming, eeg_buffer
    if not streaming:
        streaming = True
        eeg_buffer = [] # Изчистваме буфера при старт
        threading.Thread(target=read_mindwave_socket, daemon=True).start()
        return True
    return False

@eel.expose
def stop_eeg_stream():
    global streaming
    streaming = False
    return True

# НОВО: Функция, която праща събраните данни на Flask сървъра
def send_to_flask_server(data_array):
    try:
        # В реална система ще ни трябва patient_id от сесията
        # За демо цели ползваме "default_patient"
        payload = {
            "patient_id": "87654321-4321-4321-4321-098765432109", # Примерно ID
            "signal": data_array,
            "sampling_rate": 512
        }
        
        # print(f"DEBUG: Пакет от {len(data_array)} точки -> Flask...")
        response = requests.post(FLASK_API_URL, json=payload, timeout=2)
        
        if response.status_code == 200:
            result = response.json()
            # Пращаме резултата обратно на React UI
            eel.onAiAnalysisResult(result)
        else:
            print(f"DEBUG: Flask Error {response.status_code}")
    except Exception as e:
        print(f"DEBUG: Flask Connection failed: {e}")

def read_mindwave_socket():
    global streaming, eeg_buffer
    print(f"DEBUG: Connecting to ThinkGear Connector at {TGC_HOST}:{TGC_PORT}...")
    
    try:
        # Create TCP Socket
        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client.settimeout(5)
        client.connect((TGC_HOST, TGC_PORT))
        print("DEBUG: Connected to TGC Socket!")

        # 1. Authorization Request
        auth_req = {
            "appName": "NeuroRisk",
            "appKey": "9f54141b4b4c567748de857c093a8e7a63445582" # Standard local key
        }
        client.send(json.dumps(auth_req).encode('utf-8'))

        # 2. Configuration: Enable Raw EEG
        config_req = {"enableRawOutput": True, "format": "Json"}
        client.send(json.dumps(config_req).encode('utf-8'))
        
        print("DEBUG: Handshake complete. Waiting for JSON stream...")

        # Buffer for splitting packets by \r
        buffer = ""
        
        while streaming:
            try:
                data = client.recv(4096).decode('utf-8')
                if not data: break
                
                buffer += data
                while '\r' in buffer:
                    line, buffer = buffer.split('\r', 1)
                    if line.strip():
                        try:
                            packet = json.loads(line)
                            
                            # Handle Raw EEG
                            if "rawEeg" in packet:
                                eeg_value = packet["rawEeg"]
                                eel.updateEEGData(eeg_value)
                                
                                # НОВО: Добавяме в буфера за AI анализ
                                eeg_buffer.append(eeg_value)
                                
                                # НОВО: На всеки 512 точки (1 секунда) пращаме към Flask
                                if len(eeg_buffer) >= 512:
                                    data_to_send = eeg_buffer.copy()
                                    eeg_buffer.clear()
                                    
                                    # Изпращаме в отделна нишка, за да не бавим стрийма
                                    threading.Thread(
                                        target=send_to_flask_server, 
                                        args=(data_to_send,), 
                                        daemon=True
                                    ).start()
                                
                            # Handle Connection/Signal Quality
                            if "poorSignalLevel" in packet:
                                eel.updateSignalQuality(packet["poorSignalLevel"])
                                
                        except json.JSONDecodeError:
                            continue
            except socket.timeout:
                continue
            except Exception as e:
                print(f"DEBUG: Socket Read Error: {e}")
                break
                
    except Exception as e:
        print(f"DEBUG: Connection failed: {e}")
        try:
            eel.onStreamError(f"Уверете се, че ThinkGear Connector е пуснат (Port {TGC_PORT})")()
        except:
            pass
    finally:
        streaming = False
        try: client.close()
        except: pass
        print("DEBUG: MindWave Socket thread terminated.")

# Initialize Eel with the React build directory
eel.init("../frontend/dist")

try:
    print("==================================================")
    print("NeuroRisk Mobile App Preview (Eel Engine)")
    print("==================================================")
    print("\nИнструкция: СТАРТИРАЙТЕ 'ThinkGear Connector' приложението.")
    print("==================================================")
    
    eel.start('index.html', mode='chrome', port=8080, size=(400, 800))
except (SystemExit, KeyboardInterrupt):
    print("\nЗатваряне...")
except Exception as e:
    print(f"Error starting Eel: {e}")

