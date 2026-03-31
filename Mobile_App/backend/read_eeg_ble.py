import asyncio
from bleak import BleakClient

DEVICE_UUID = "407688CC-40F2-2C12-4B14-AE389339B4C3"
CHAR_NOTIFY_1 = "039afff4-2c94-11e3-9e06-0002a5d5c51b"
CHAR_NOTIFY_2 = "039afff8-2c94-11e3-9e06-0002a5d5c51b"

def handler_1(sender, data):
    print(f"🟢 [КАНАЛ 1] {data.hex(' ')}")

def handler_2(sender, data):
    print(f"🔵 [КАНАЛ 2] {data.hex(' ')}")

async def stream_data():
    print("--------------------------------------------------")
    print("1. Забрави слушалката от Bluetooth настройките на Mac-а!")
    print("2. Сложи слушалката на главата си (Щипка на ухото + Сензор на челото).")
    print("3. Изчакай да чуеш 'Бийп-Бийп' от самата слушалка.")
    print("--------------------------------------------------")
    print(f"\nТърся слушалката ({DEVICE_UUID}) през въздуха...")
    
    try:
        async with BleakClient(DEVICE_UUID, timeout=20.0) as client:
            print(f"✅ ВРЪЗКАТА Е ОСЪЩЕСТВЕНА!")
            
            await client.start_notify(CHAR_NOTIFY_1, handler_1)
            await client.start_notify(CHAR_NOTIFY_2, handler_2)
            
            print("🎧 Слушам за мозъчни вълни... (30 секунди)")
            print("Ако не виждаш данни, размести леко сензора на челото си!\n")
            
            await asyncio.sleep(30)
            
            await client.stop_notify(CHAR_NOTIFY_1)
            await client.stop_notify(CHAR_NOTIFY_2)
            print("Край на записа.")
            
    except Exception as e:
        print(f"❌ Връзката пропадна: {e}")

if __name__ == "__main__":
    asyncio.run(stream_data())