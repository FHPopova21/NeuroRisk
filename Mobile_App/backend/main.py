import eel
import os
import subprocess
import serial
from serial import Serial
import threading
import time

# MindWave Config
SERIAL_PORT = "/dev/tty.MindWaveMobile"
BAUD_RATE = 57600 # Standard for MindWave

streaming = False

@eel.expose
def start_eeg_stream():
    global streaming
    if streaming:
        return
    
    streaming = True
    thread = threading.Thread(target=read_mindwave)
    thread.daemon = True
    thread.start()
    return True

@eel.expose
def stop_eeg_stream():
    global streaming
    streaming = False
    return True

def read_mindwave():
    global streaming
    try:
        # Explicitly use Serial class to avoid namespace confusion
        with Serial(SERIAL_PORT, BAUD_RATE, timeout=1) as ser:
            print(f"Connected to {SERIAL_PORT}")
            while streaming:
                if ser.in_waiting > 0:
                    data = ser.read(ser.in_waiting)
                    for byte in data:
                        # Push raw byte to frontend
                        eel.updateEEGData(int(byte))
                eel.sleep(0.01) # Crucial for Eel thread management
    except Exception as e:
        print(f"Serial Error: {e}")
        # Use a safer way to call frontend if it might not be ready
        try:
            eel.onStreamError(str(e))()
        except:
            pass
    finally:
        streaming = False
        print("EEG Stream stopped")

def build_app():
    print("Building Mobile App...")
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend'))
    subprocess.run(["npm", "run", "build"], cwd=frontend_dir, shell=True)

if __name__ == '__main__':
    # Build the app if dist doesn't exist
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend/dist'))
    if not os.path.exists(dist_dir):
        build_app()
    
    # Initialize Eel with the dist directory
    eel.init(dist_dir)
    
    print("\n" + "="*50)
    print("NeuroRisk Mobile App Preview (Eel Engine)")
    print("="*50)
    print("\nСтартиране в самостоятелен прозорец...")
    print("="*50 + "\n")
    
    try:
        # Start the app in a fixed mobile-sized window
        eel.start('index.html', size=(400, 800))
    except (SystemExit, MemoryError, KeyboardInterrupt):
        print("\nПриложението е спряно.")
