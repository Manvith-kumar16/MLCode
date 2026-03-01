from PIL import Image
import os

def crop_transparent():
    file_path = 'public/ML Code LOGO.png'
    try:
        img = Image.open(file_path).convert("RGBA")
    except Exception as e:
        print("Error opening image:", e)
        return
        
    print("Original size:", img.size)
    
    # Get the bounding box of the non-transparent pixels
    bbox = img.getbbox()
    
    if bbox:
        print("Tightly cropping to bounding box:", bbox)
        cropped_img = img.crop(bbox)
        
        # Save cropped image back
        cropped_img.save(file_path, "PNG")
        print("Cropped and saved to public/ML Code LOGO.png")
    else:
        print("No bounding box found (image is completely transparent)")

if __name__ == '__main__':
    crop_transparent()
