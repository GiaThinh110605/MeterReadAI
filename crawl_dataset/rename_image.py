import os
from pathlib import Path

path = Path("/Users/mac/MeterReadAI/images")
count = 0

for file in os.listdir(path):
    if file.endswith(".jpg"):
        os.rename(path / file, path / f"{count:03d}.jpg")
        count += 1