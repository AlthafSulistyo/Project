import os

try:
    with open("Form_Pengujian_SchoolGuard.doc", "rb") as f:
        data = f.read()
    
    text = data.decode("utf-16le", errors="ignore")
    
    with open("Form_Pengujian_SchoolGuard.txt", "w", encoding="utf-8") as f:
        f.write(text)
        
    print("✅ BERHASIL! File telah diubah menjadi Form_Pengujian_SchoolGuard.txt")
except Exception as e:
    print(f"❌ GAGAL: {e}")
