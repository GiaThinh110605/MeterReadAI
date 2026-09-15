from ddgs import DDGS
import requests, os, time

os.makedirs("images", exist_ok=True)

queries = [
    # =========================
    # ĐỒNG HỒ NƯỚC VIỆT NAM
    # =========================
    "đồng hồ nước Việt Nam",
    "đồng hồ nước dân dụng Việt Nam",
    "đồng hồ nước hộ gia đình",
    "đồng hồ nước nhà dân",


    # =========================
    # MÔI TRƯỜNG / THỰC TẾ
    # =========================
    "đồng hồ nước bị bẩn",
    "đồng hồ nước mới",
    "đồng hồ nước bị rỉ sét",
    "đồng hồ nước có nước đọng",
    "đồng hồ nước bị mờ",
    "đồng hồ nước bụi bặm",
    

    # =========================
    # ĐỒNG HỒ ĐIỆN VIỆT NAM
    # =========================
    "đồng hồ điện Việt Nam",
    "công tơ điện nhà dân",
    "công tơ điện chung cư",
    "công tơ điện phòng trọ",
    "công tơ điện trong hộp",


    # =========================
    # MÔI TRƯỜNG / THỰC TẾ
    # =========================
    "công tơ điện trong hộp bảo vệ",
    "công tơ điện cũ",
    "công tơ điện mới",
    "công tơ điện bị bẩn",
    "công tơ điện bị mờ",
    "công tơ điện ngoài đường",

    # =========================
    # ẢNH THỰC TẾ / KHÔNG QUÁ SẠCH
    # =========================
    "đồng hồ nước ảnh thực tế",
    "đồng hồ điện ảnh thực tế",

]

count = len(os.listdir("images"))

while count < 2500:

    for query in queries:
        if count >= 2500:
            break

        print(f"\nSearching: {query}")

        try:
            with DDGS() as ddgs:
                results = ddgs.images(query, max_results=150)

                for r in results:
                    if count >= 2500:
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
                            print(f"Downloaded: {count}/2000")

                    except:
                        pass

        except Exception as e:
            print("Skip:", query)

        time.sleep(2)

print(f"\nHoàn tất: {count} ảnh")
