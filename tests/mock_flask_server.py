from flask import Flask, request, jsonify
import time

app = Flask(__name__)

@app.route('/api/monitoring/analyze', methods=['POST'])
def analyze():
    data = request.json
    signal_len = len(data.get('signal', []))
    print(f"📥 Получен пакет: {signal_len} точки от пациент {data.get('patient_id')}")
    
    # Симулираме AI отговор
    return jsonify({
        "risk_score": 15,
        "risk_status": "LOW",
        "interpretation": "Симулиран анализ: Всичко е нормално."
    })

if __name__ == '__main__':
    print("🚀 Mock Flask сървърът слуша на порт 5001...")
    app.run(port=5001)
