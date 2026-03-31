import asyncio
from bleak import BleakClient

DEVICE_UUID = "407688CC-40F2-2C12-4B14-AE389339B4C3"

async def explore_headset():
    print(f"Опитвам свързване със слушалката ({DEVICE_UUID})...")
    try:
        async with BleakClient(DEVICE_UUID) as client:
            print(f"✅ УСПЕШНО СВЪРЗВАНЕ! Статус: {client.is_connected}")
            
            print("\n--- НАЛИЧНИ КАНАЛИ ЗА ДАННИ (Characteristics) ---")
            
            # ПРОМЯНАТА Е ТУК: вече използваме директно client.services
            for service in client.services:
                print(f"\n[Папка / Service] {service.uuid} ({service.description})")
                for char in service.characteristics:
                    print(f"  |-- [Тръба / Characteristic] {char.uuid}")
                    print(f"  |   Свойства: {char.properties}")
                    print(f"  |   Описание: {char.description}")
                    
    except Exception as e:
        print(f"❌ Грешка при свързване: {e}")

if __name__ == "__main__":
    asyncio.run(explore_headset())