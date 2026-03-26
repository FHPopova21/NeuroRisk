import os
import subprocess
import webbrowser
from flask import Flask, send_from_directory

app = Flask(__name__, static_folder='../frontend/dist')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

def build_app():
    print("Building Mobile App...")
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend'))
    subprocess.run(["npm", "run", "build"], cwd=frontend_dir, shell=True)

if __name__ == '__main__':
    # Build the app first if dist doesn't exist
    if not os.path.exists(app.static_folder):
        build_app()
    
    print("\n" + "="*50)
    print("NeuroRisk Mobile App Preview")
    print("="*50)
    print("\nПриложението се стартира на http://localhost:5175")
    print("ЗАБЕЛЕЖКА: За най-добро изживяване, отворете линка в мобилен изглед (F12 -> Mobile Mode)")
    print("="*50 + "\n")
    
    webbrowser.open("http://localhost:5175")
    app.run(port=5175)
