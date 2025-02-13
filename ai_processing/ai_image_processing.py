import sys
import cv2
import torch
import numpy as np
from PIL import Image
from torchvision.transforms import ToTensor, ToPILImage
import os

# Load AI model processing functions
from ai_models.esrgan import enhance_image as esrgan_enhance
from ai_models.deblurgan import enhance_image as deblurgan_enhance
from ai_models.denoisenet import enhance_image as denoisenet_enhance
from ai_models.deoldify import enhance_image as deoldify_enhance

def process_image(input_path, output_path, enhancement_type):
    """Processes an image based on the enhancement type."""
    if not os.path.exists(input_path):
        print("Error: Input file does not exist.")
        return

    # Load the image
    image = Image.open(input_path).convert("RGB")
    
    # Select enhancement method
    if enhancement_type == "super-resolution":
        enhanced_image = esrgan_enhance(image)
    elif enhancement_type == "deblurring":
        enhanced_image = deblurgan_enhance(image)
    elif enhancement_type == "denoising":
        enhanced_image = denoisenet_enhance(image)
    elif enhancement_type == "colorization":
        enhanced_image = deoldify_enhance(image)
    else:
        print("Invalid enhancement type. Applying basic enhancement.")
        enhanced_image = basic_enhance(image)
    
    # Save the output image
    enhanced_image.save(output_path)
    print(f"Enhanced image saved at {output_path}")

def basic_enhance(image):
    """Applies basic image enhancement (sharpening and contrast adjustment)."""
    image = np.array(image)
    enhanced = cv2.detailEnhance(image, sigma_s=10, sigma_r=0.15)  # Simple enhancement
    return Image.fromarray(enhanced)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python ai_image_processing.py <input_path> <output_path> <enhancement_type>")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    enhancement_type = sys.argv[3]
    
    process_image(input_path, output_path, enhancement_type)
