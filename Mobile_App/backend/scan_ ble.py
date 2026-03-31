import asyncio
from bleak import BleakScanner

async def scan_for_headset():
    print("Търся Bluetooth устройства наоколо (моля, изчакайте 5-10 секунди)...")
    
    # Сканираме ефира
    devices = await BleakScanner.discover()
    
    found_headset = False
    print("\n--- НАМЕРЕНИ УСТРОЙСТВА ---")
    for d in devices:
        # Проверяваме дали устройството има име (понякога са None)
        if d.name:
            print(f"Устройство: {d.name} | Адрес (UUID): {d.address}")
            # Търсим ключови думи в името
            if "BrainLink" in d.name or "Mind" in d.name or "Neuro" in d.name:
                print(f"\n🎉 НАМЕРИХМЕ СЛУШАЛКАТА! 🎉")
                print(f"ИМЕ: {d.name}")
                print(f"UUID АДРЕС: {d.address}")
                print("Запиши си този UUID адрес, ще ни трябва за връзката!")
                found_headset = True
                
    if not found_headset:
        print("\nСлушалката не беше намерена. Уверете се, че е включена и мига (в режим на сдвояване)!")

if __name__ == "__main__":
    asyncio.run(scan_for_headset())