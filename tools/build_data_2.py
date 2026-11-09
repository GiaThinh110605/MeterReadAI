import os
import glob
import json
import random
import argparse
import cv2
import numpy as np
import pandas as pd

def crop_roi(img, shape_info):
    """
    Crops ROI from image based on shape_info:
    - 'full_crop': The image is already cropped, only resize to (200, 60).
    - 'rectangle': Bounding box with 2 points [[x1, y1], [x2, y2]].
    - 'polygon': Polygon with 4 or more points, perspective-warped to (200, 60).
    """
    if shape_info['type'] == 'full_crop':
        return cv2.resize(img, (200, 60))
        
    pts = np.array(shape_info['points'], dtype=np.float32)
    if shape_info['type'] == 'rectangle':
        x1, y1 = int(min(pts[0][0], pts[1][0])), int(min(pts[0][1], pts[1][1]))
        x2, y2 = int(max(pts[0][0], pts[1][0])), int(max(pts[0][1], pts[1][1]))
        crop = img[max(0, y1):max(0, y2), max(0, x1):max(0, x2)]
        if crop.size == 0:
            return None
        return cv2.resize(crop, (200, 60))
        
    # Polygon perspective warp
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

def collect_samples(src_base):
    folders = sorted([f for f in os.listdir(src_base) if os.path.isdir(os.path.join(src_base, f))])
    samples_by_split = {'train': [], 'val': [], 'test': []}
    all_samples = []

    for fld in folders:
        fld_lower = fld.lower()
        if 'train' in fld_lower:
            split_tag = 'train'
        elif 'val' in fld_lower:
            split_tag = 'val'
        elif 'test' in fld_lower:
            split_tag = 'test'
        else:
            split_tag = 'train'
            
        fld_path = os.path.join(src_base, fld)
        jsons = sorted(glob.glob(os.path.join(fld_path, '*.json')))
        
        for jf in jsons:
            with open(jf, 'r', encoding='utf-8') as fp:
                d = json.load(fp)
                
            base_n = os.path.splitext(os.path.basename(jf))[0]
            img_p = os.path.join(fld_path, base_n + '.jpg')
            if not os.path.exists(img_p):
                img_p = os.path.join(fld_path, base_n + '.png')
            if not os.path.exists(img_p):
                img_p = os.path.join(fld_path, d.get('imagePath', ''))
                
            if not os.path.exists(img_p):
                continue
                
            if 'label_studio_data' in d:
                shape_info = {'type': 'full_crop'}
                label = str(d.get('label') or d.get('text') or '').strip()
            elif 'shapes' in d and len(d['shapes']) > 0:
                s = d['shapes'][0]
                label = str(s.get('label', '')).strip()
                shape_type = s.get('shape_type', 'polygon')
                pts = s.get('points', [])
                if shape_type == 'rectangle' or len(pts) == 2:
                    shape_info = {'type': 'rectangle', 'points': pts}
                else:
                    shape_info = {'type': 'polygon', 'points': pts}
            else:
                continue
                
            if not label:
                continue
                
            item = {
                'img_path': img_p,
                'shape_info': shape_info,
                'label': label,
                'source_folder': fld
            }
            samples_by_split[split_tag].append(item)
            all_samples.append(item)
            
    return samples_by_split, all_samples

def build_dataset(src_base, dest_dir, split_mode='existing'):
    print(f"Collecting samples from: {src_base}")
    samples_by_split, all_samples = collect_samples(src_base)
    print(f"Total collected: {len(all_samples)} samples")
    
    if split_mode == 'random':
        print("Using random 80/10/10 split...")
        random.seed(42)
        random.shuffle(all_samples)
        n_total = len(all_samples)
        n_train = int(n_total * 0.8)
        n_val = int(n_total * 0.1)
        splits = {
            'train': all_samples[:n_train],
            'val': all_samples[n_train:n_train + n_val],
            'test': all_samples[n_train + n_val:]
        }
    else:
        print("Preserving original split structure (_Train -> train, _Val -> val, _Test -> test)...")
        splits = samples_by_split
        
    for split_name, items in splits.items():
        print(f"Split [{split_name}]: {len(items)} samples")
        img_dest_dir = os.path.join(dest_dir, split_name, 'images')
        os.makedirs(img_dest_dir, exist_ok=True)
        
        csv_records = []
        for idx, item in enumerate(items):
            img = cv2.imread(item['img_path'])
            if img is None:
                continue
            crop = crop_roi(img, item['shape_info'])
            if crop is None:
                continue
                
            num_digits = len(item['label'])
            out_filename = f"{split_name}_{idx}_{num_digits}d.jpg"
            out_path = os.path.join(img_dest_dir, out_filename)
            
            cv2.imwrite(out_path, crop)
            csv_records.append({
                'filename': out_filename,
                'label': item['label']
            })
            
        csv_path = os.path.join(dest_dir, split_name, f"{split_name}_labels.csv")
        df = pd.DataFrame(csv_records)
        df.to_csv(csv_path, index=False, encoding='utf-8')
        print(f"  -> Saved {len(csv_records)} images to {img_dest_dir}")
        print(f"  -> Saved labels to {csv_path}")

    print(f"\nFinished building dataset at {dest_dir} successfully!")

def main():
    parser = argparse.ArgumentParser(description="Build data_2 recognition dataset from drive download")
    parser.add_argument('--src', default='/Users/mac/MeterReadAI/data/drive-download-20261109T035914Z-1-001', help='Source directory')
    parser.add_argument('--dest', default='/Users/mac/MeterReadAI/data/data_2', help='Destination directory')
    parser.add_argument('--split_mode', choices=['existing', 'random'], default='existing', help='Split mode (existing or random)')
    args = parser.parse_args()

    build_dataset(args.src, args.dest, args.split_mode)

if __name__ == '__main__':
    main()

