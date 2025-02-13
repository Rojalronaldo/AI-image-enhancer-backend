import torch
from PIL import Image
from torchvision.transforms import ToTensor, ToPILImage

def enhance_image(image):
    """Applies ESRGAN super-resolution."""
    model = torch.load("ai_models/pretrained_esrgan.pth", map_location="cpu")
    model.eval()
    
    image_tensor = ToTensor()(image).unsqueeze(0)
    with torch.no_grad():
        output = model(image_tensor).squeeze(0)
    
    return ToPILImage()(output)
