import json
import shutil
import random
from pathlib import Path
from PIL import Image

def convert():
    base = Path(__file__).resolve().parent.parent / "data"
    src = base / "images_after_handle"
    dest = base / "DataAfterHandle" / "images_after_handle"

    # Reset & tạo thư mục images/{train,val,test} và labels/{train,val,test}
    if dest.exists():
        shutil.rmtree(dest)

    for sub in ["images", "labels"]:
        for s in ["train", "val", "test"]:
            (dest / sub / s).mkdir(parents=True, exist_ok=True)

    pairs = []
    for jf in sorted(src.glob("*.json")):
        img_p = src / f"{jf.stem}.jpg"
        if not img_p.exists():
            continue

        with open(jf, "r", encoding="utf-8") as f:
            data = json.load(f)

        shapes = data.get("shapes", [])
        if not shapes or len(shapes[0].get("points", [])) < 3:
            continue

        with Image.open(img_p) as im:
            w, h = im.size

        coords = [f"{max(0.0, min(1.0, x / w)):.6f} {max(0.0, min(1.0, y / h)):.6f}" for x, y in shapes[0]["points"]]
        label_text = f"0 {' '.join(coords)}\n"
        pairs.append((img_p, jf.stem, label_text))

    # Chia tỷ lệ 80% Train - 10% Val - 10% Test
    random.seed(42)
    random.shuffle(pairs)
    n = len(pairs)
    splits = {
        "train": pairs[:int(n * 0.8)],
        "val": pairs[int(n * 0.8):int(n * 0.9)],
        "test": pairs[int(n * 0.9):]
    }

    for s_name, items in splits.items():
        for img_p, stem, label_text in items:
            shutil.copy2(img_p, dest / "images" / s_name / img_p.name)
            (dest / "labels" / s_name / f"{stem}.txt").write_text(label_text, encoding="utf-8")

    print(f"Done: {len(pairs)} pairs split into train={len(splits['train'])}, val={len(splits['val'])}, test={len(splits['test'])}.")

if __name__ == "__main__":
    convert()
