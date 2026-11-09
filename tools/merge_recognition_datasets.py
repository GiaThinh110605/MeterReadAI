import os
import shutil
import pandas as pd

def merge_datasets():
    src_dirs = [
        ('/Users/mac/MeterReadAI/data/DataAfterHandle/recognition_merge_2', 'rec_merge_2'),
        ('/Users/mac/MeterReadAI/data/data_2', 'data_2'),
        ('/Users/mac/MeterReadAI/data/data_1', 'data_1'),
    ]
    dest_base = '/Users/mac/MeterReadAI/data/merge_recognition'
    
    splits = ['train', 'val', 'test']
    
    total_merged = 0
    stats_summary = {}

    for split in splits:
        dest_split_dir = os.path.join(dest_base, split)
        dest_img_dir = os.path.join(dest_split_dir, 'images')
        os.makedirs(dest_img_dir, exist_ok=True)
        
        merged_records = []
        new_idx = 0
        
        for src_path, tag in src_dirs:
            csv_path = os.path.join(src_path, split, f"{split}_labels.csv")
            src_img_dir = os.path.join(src_path, split, 'images')
            
            if not os.path.exists(csv_path):
                continue
                
            df = pd.read_csv(csv_path, dtype=str)
            
            for _, row in df.iterrows():
                orig_filename = row['filename']
                label = str(row['label']).strip()
                src_img_file = os.path.join(src_img_dir, orig_filename)
                
                if not os.path.exists(src_img_file):
                    continue
                    
                num_digits = len(label)
                out_filename = f"{split}_{new_idx}_{num_digits}d.jpg"
                dest_img_file = os.path.join(dest_img_dir, out_filename)
                
                # Copy image file
                shutil.copy2(src_img_file, dest_img_file)
                
                merged_records.append({
                    'filename': out_filename,
                    'label': label
                })
                new_idx += 1
                
        # Write merged CSV
        dest_csv_path = os.path.join(dest_split_dir, f"{split}_labels.csv")
        merged_df = pd.DataFrame(merged_records)
        merged_df.to_csv(dest_csv_path, index=False, encoding='utf-8')
        
        stats_summary[split] = len(merged_records)
        total_merged += len(merged_records)
        
    for split, count in stats_summary.items():
        print(f"[{split}]: {count} samples")
    print(f"Total merged: {total_merged} samples -> {dest_base}")

if __name__ == '__main__':
    merge_datasets()

