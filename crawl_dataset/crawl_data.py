from ddgs import DDGS
import requests, os, time

os.makedirs("images", exist_ok=True)
queries = [
    # ==========================================
    # 1. THEO THƯƠNG HIỆU PHỔ BIẾN TẠI VIỆT NAM
    # ==========================================
    "đồng hồ nước Asahi",
    "đồng hồ nước Zenner",
    "đồng hồ nước Sanwa",
    "đồng hồ nước Minh Hòa",
    "đồng hồ nước Komax",
    "đồng hồ nước Itron",
    "đồng hồ nước T-Flow",
    "đồng hồ nước Merlion",
    "đồng hồ nước Unik",

    # ==========================================
    # 2. THEO MẶT SỐ & CẤU TẠO BÁNH RĂNG/ĐIỆN TỬ
    # ==========================================
    "mặt số đồng hồ nước",
    "đồng hồ nước mặt kính mờ",
    "đồng hồ nước cơ học",

    # ==========================================
    # 3. ĐỊA ĐIỂM & HỘP BẢO VỆ THỰC TẾ
    # ==========================================
    "đồng hồ nước nhà dân Việt Nam",
    "đồng hồ nước hộ gia đình",
    "đồng hồ nước chôn dưới đất",

    # ==========================================
    # 4. ĐIỀU KIỆN MÔI TRƯỜNG / NHIỄU THỰC TẾ (RẤT QUAN TRỌNG CHO TRAIN AI)
    # ==========================================
    "đồng hồ nước bị bẩn",
    "đồng hồ nước bám bùn đất",
    "đồng hồ nước bị rỉ sét",
    "đồng hồ nước đọng nước mặt kính",
    "đồng hồ nước bị trầy xước",
    "đồng hồ nước cũ bẩn",
    "đồng hồ nước bị mờ mặt",
]

count = len(os.listdir("images"))

while count < 3000:

    for query in queries:
        if count >= 3000:
            break

        print(f"\nSearching: {query}")

        try:
            with DDGS() as ddgs:
                results = ddgs.images(query, max_results=200)

                for r in results:
                    if count >= 3000:
                        break

                    try:
                        data = requests.get(
                            r["image"],
                            timeout=5,
                            headers={"User-Agent": "Mozilla/5.0"}
                        ).content

                        if len(data) > 5000:
                            with open(f"images/{count:04d}.jpg", "wb") as f:
                                f.write(data)

                            count += 1
                            print(f"Downloaded: {count}/3000")

                    except:
                        pass

        except Exception as e:
            print("Skip:", query)

        time.sleep(2)

print(f"\nHoàn tất: {count} ảnh")
