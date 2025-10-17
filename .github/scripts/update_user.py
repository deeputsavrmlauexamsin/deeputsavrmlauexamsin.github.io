import os, json, csv, time, base64
from pathlib import Path
import qrcode

BASE = Path("Department/Print_Data")
PHOTOS = BASE / "photos"
QRS = BASE / "qr_codes"
CSV = BASE / "data.csv"

for p in (BASE, PHOTOS, QRS):
    p.mkdir(parents=True, exist_ok=True)

# Load payload
with open("payload.json", "r", encoding="utf-8") as f:
    payload = json.load(f)

uid = str(int(time.time()))
slug = base64.b64encode(uid.encode()).decode()[:6]
photo_filename = payload.get("photo_filename", "")

# Generate QR
qr_filename = f"{uid}_QR.png"
card_url = f"https://deeputsavrmlauexamsin.github.io/Department/Print_Data/?ID={slug}"
qr = qrcode.QRCode(box_size=8, border=2)
qr.add_data(card_url)
qr.make(fit=True)
img = qr.make_image(fill_color="black", back_color="white")
img.save(QRS / qr_filename)

# Append to CSV
row = {
    "id": uid,
    "slug": slug,
    "name": payload.get("name", ""),
    "phone": payload.get("phone", ""),
    "ghat": f"राम की पैड़ी घाट नं : {payload.get('ghat', '')}",
    "role": payload.get("role", ""),
    "photo": photo_filename,
    "college": payload.get("college", "")
}

fields = ["id", "slug", "name", "phone", "ghat", "role", "photo", "college"]
rows = []

if CSV.exists():
    with open(CSV, "r", encoding="utf-8") as f:
        txt = f.read().strip()
    if txt:
        reader = csv.DictReader(txt.splitlines(), delimiter="\t")
        rows.extend(reader)

rows.append(row)

with open(CSV, "w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields, delimiter="\t")
    w.writeheader()
    w.writerows(rows)

os.system("git add -A")
os.system(f'git commit -m "Add user {row['name']} id={uid}" || true')
os.system("git push origin HEAD:main || true")

print("✅ User added successfully:", row)
