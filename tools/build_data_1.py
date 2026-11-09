import os
import glob
import json
import random
import cv2
import numpy as np
import pandas as pd

def crop_roi(img, pts):
    pts = np.array(pts, dtype=np.float32)
    if len(pts) == 4:
        e0 = np.linalg.norm(pts[1] - pts[0])
        e1 = np.linalg.norm(pts[2] - pts[1])
        if e0 > e1:
            src = np.array([pts[0], pts[1], pts[2], pts[3]], dtype=np.float32)
        else:
            src = np.array([pts[0], pts[3], pts[2], pts[1]], dtype=np.float32)
    else:
        rbox = cv2.minAreaRect(pts)
        box = cv2.boxPoints(rbox)
        distances = [np.linalg.norm(b - pts[0]) for b in box]
        tl_idx = np.argmin(distances)
        box_rot = np.roll(box, -tl_idx, axis=0)
        pt_mid = pts[len(pts)//2]
        d_next = np.linalg.norm(box_rot[1] - pt_mid)
        d_prev = np.linalg.norm(box_rot[3] - pt_mid)
        if d_next < d_prev:
            src = np.array([box_rot[0], box_rot[1], box_rot[2], box_rot[3]], dtype=np.float32)
        else:
            src = np.array([box_rot[0], box_rot[3], box_rot[2], box_rot[1]], dtype=np.float32)
            
    dst = np.array([[0,0], [200,0], [200,60], [0,60]], dtype=np.float32)
    M = cv2.getPerspectiveTransform(src, dst)
    return cv2.warpPerspective(img, M, (200, 60))

def main():
    src_images_dir = '/Users/mac/MeterReadAI/data/images_after_handle/images'
    src_labels_dir = '/Users/mac/MeterReadAI/data/images_after_handle/labels'
    dest_dir = '/Users/mac/MeterReadAI/data/data_1'
    
    # 1. Collect all valid pairs
    json_files = sorted(glob.glob(os.path.join(src_labels_dir, '*.json')))
    samples = []
    
    for jf in json_files:
        with open(jf, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        shapes = data.get('shapes', [])
        if not shapes:
            continue
            
        label = str(shapes[0]['label']).strip()
        pts = shapes[0]['points']
        
        base_name = os.path.basename(jf).rsplit('.', 1)[0]
        img_name = f"{base_name}.jpg"
        img_path = os.path.join(src_images_dir, img_name)
        
        if not os.path.exists(img_path):
            print(f"Warning: image {img_path} not found!")
            continue
            
        samples.append({
            'img_path': img_path,
            'points': pts,
            'label': label,
            'base_name': base_name
        })
        
    print(f"Total valid samples collected: {len(samples)}")
    
    # 2. Shuffle & Split (80% train, 10% val, 10% test)
    random.seed(42)
    random.shuffle(samples)
    
    n_total = len(samples)
    n_train = int(n_total * 0.8) # 191
    n_val = int(n_total * 0.1)   # 23 or 24
    # remaining to test
    
    train_samples = samples[:n_train]
    val_samples = samples[n_train:n_train + n_val]
    test_samples = samples[n_train + n_val:]
    
    splits = {
        'train': train_samples,
        'val': val_samples,
        'test': test_samples
    }
    
    print(f"Train: {len(train_samples)}, Val: {len(val_samples)}, Test: {len(test_samples)}")
    
    # 3. Process each split
    for split_name, split_data in splits.items():
        split_dir = os.path.join(dest_dir, split_name)
        img_dest_dir = os.path.join(split_dir, 'images')
        os.makedirs(img_dest_dir, exist_ok=True)
        
        csv_records = []
        for idx, sample in enumerate(split_data):
            img = cv2.imread(sample['img_path'])
            if img is None:
                print(f"Error reading {sample['img_path']}")
                continue
                
            crop = crop_roi(img, sample['points'])
            
            # Filename formatting: {split}_{idx}_{len}d.jpg
            num_digits = len(sample['label'])
            out_filename = f"{split_name}_{idx}_{num_digits}d.jpg"
            out_path = os.path.join(img_dest_dir, out_filename)
            
            cv2.imwrite(out_path, crop)
            csv_records.append({
                'filename': out_filename,
                'label': sample['label']
            })
            
        # Write CSV
        csv_path = os.path.join(split_dir, f"{split_name}_labels.csv")
        df = pd.DataFrame(csv_records)
        df.to_csv(csv_path, index=False, encoding='utf-8')
        print(f"Saved {len(csv_records)} images to {img_dest_dir} and CSV to {csv_path}")

    print("Successfully built data_1!")

if __name__ == '__main__':
    main()

