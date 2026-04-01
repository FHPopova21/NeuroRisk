import asyncio
from bleak import BleakClient

DEVICE_UUID = "407688CC-40F2-2C12-4B14-AE389339B4C3"
CHAR_WRITE = "039affa0-2c94-11e3-9e06-0002a5d5c51b"
CHAR_NOTIFY_1 = "039afff4-2c94-11e3-9e06-0002a5d5c51b"
CHAR_NOTIFY_2 = "039afff8-2c94-11e3-9e06-0002a5d5c51b"

def notification_handler(sender, data):
    # Превръщаме суровите байтове в четим шестнадесетичен формат (hex)
    hex_data = data.hex(' ')
    
    # Търсим "aa aa" (170 170) - това е началото на всеки валиден ЕЕГ пакет
    if "aa aa" in hex_data.lower():
        print(f"🧠 [НЕВРО-ПАКЕТ] {hex_data}")
    else:
        # Ако връща нещо друго (криптирани данни от Macrotellect)
        print(f"📦 [ДРУГИ ДАННИ] {hex_data}")

async def hack_brainlink():
    print("--------------------------------------------------")
    print("🚨 ВАЖНО: Увери се, че официалното приложение е НАПЪЛНО ЗАТВОРЕНО!")
    print("--------------------------------------------------")
    print(f"Свързвам се с {DEVICE_UUID}...")
    
    try:
        async with BleakClient(DEVICE_UUID, timeout=20.0) as client:
            print("✅ Свързано! Абонирам се за потока от данни...")
            
            await client.start_notify(CHAR_NOTIFY_1, notification_handler)
            await client.start_notify(CHAR_NOTIFY_2, notification_handler)
            
            print("🔓 Отключвам хардуера (изпращам магически байтове)...")
            
            # Команда 1: Събуждане (0x00)
            try:
                await client.write_gatt_char(CHAR_WRITE, bytearray([0x00]), response=False)
                await asyncio.sleep(0.5)
            except: pass
            
            # Команда 2: RAW EEG режим (0x02)
            try:
                await client.write_gatt_char(CHAR_WRITE, bytearray([0x02]), response=False)
                await asyncio.sleep(0.5)
            except: pass
            
            # Команда 3: Алтернативно събуждане (понякога BrainLink иска 'b')
            try:
                await client.write_gatt_char(CHAR_WRITE, b'b', response=False)
            except: pass

            print("\n🎧 Слушалката е на главата ти, нали? Чакаме данни (30 секунди)...")
            await asyncio.sleep(30)
            
            await client.stop_notify(CHAR_NOTIFY_1)
            await client.stop_notify(CHAR_NOTIFY_2)
            print("Край на хакерската сесия.")
            
    except Exception as e:
        print(f"❌ Грешка при свързване: {e}")

if __name__ == "__main__":
    asyncio.run(hack_brainlink())