import eel
import socket
import json
import threading
import time
import os
import sys
import requests 


# Add the project root to sys.path to allow importing from api
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# ThinkGear Connector (TGC) Configuration
TGC_HOST = '127.0.0.1'
TGC_PORT = 13854

streaming = False

from eeg_simulator import EEGSimulator
simulator = None

@eel.expose
def start_eeg_stream():
    global streaming
    if not streaming:
        streaming = True
        threading.Thread(target=read_mindwave_socket, daemon=True).start()
        return True
    return False

@eel.expose
def start_simulation(patient_label=1):
    """
    Стартира виртуалната симулация.
    label=1 (Епилепсия), label=5 (Здрав)
    """
    global streaming, simulator
    if not streaming:
        streaming = True
        simulator = EEGSimulator()
        threading.Thread(
            target=simulator.stream_to_eel, 
            args=(patient_label, None), 
            daemon=True
        ).start()
        return True
    return False

@eel.expose
def stop_eeg_stream():
    global streaming, simulator
    streaming = False
    if 'simulator' in globals() and simulator:
        simulator.stop_streaming()
    return True



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
                                
                                # Frontend LiveMonitoring component buffers these
                                # natively and sends an authenticated REST API Call!
                                
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
except KeyboardInterrupt:
    print("\n[Eel] Затваряне принудително от потребителя...")
except SystemExit as e:
    print(f"\n[Eel] SystemExit: {e}")
except Exception as e:
    import traceback
    print(f"\n[Eel] Фатална грешка при стартиране:")
    traceback.print_exc()

