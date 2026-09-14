from ddgs import DDGS
import requests, os, time

os.makedirs("images", exist_ok=True)

queries = [
    # Đồng hồ nước
    "đồng hồ đo nước Việt Nam",
    "đồng hồ nước gia đình",
    "đồng hồ nước dân dụng",
    "đồng hồ nước công nghiệp",

    # Đồng hồ điện
    "đồng hồ điện Việt Nam",
    "đồng hồ đo điện Việt Nam",
    "công tơ điện Việt Nam",
    "đồng hồ điện gia đình",
    "đồng hồ điện dân dụng",

    # Các loại / góc chụp khác
    "mặt đồng hồ nước",
    "mặt đồng hồ điện",
    "số đồng hồ nước",
    "số công tơ điện",
]

count = len(os.listdir("images"))

while count < 2000:

    for query in queries:
        if count >= 2000:
            break

        print(f"\nSearching: {query}")

        try:
            with DDGS() as ddgs:
                results = ddgs.images(query, max_results=100)

                for r in results:
                    if count >= 2000:
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
