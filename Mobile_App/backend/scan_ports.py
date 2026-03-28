import serial.tools.list_ports

def scan():
    print("Searching for MindWave ports...")
    ports = serial.tools.list_ports.comports()
    found = False
    for port, desc, hwid in sorted(ports):
        if "MindWave" in port or "MindWave" in desc:
            print(f"MATCH FOUND: {port} [{desc}]")
            found = True
        else:
            print(f"Available port: {port} [{desc}]")
    
    if not found:
        print("\nNo MindWave ports detected. Try re-pairing the device.")

if __name__ == "__main__":
    scan()
