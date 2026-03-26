import eel
import os
import subprocess

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
