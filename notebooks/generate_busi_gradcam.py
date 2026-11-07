
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F
from torch import nn
from PIL import Image, ImageOps, ImageDraw
from torchvision import transforms
from torchvision.models import mobilenet_v3_small

PROJECT = Path(__file__).resolve().parents[1]

MODEL_PATH = (
    PROJECT / "artifacts" / "models"
    / "busi_mobilenetv3_best.pth"
)

IMAGE_PATH = (
    PROJECT / "data" / "raw" / "BUSI"
    / "Dataset_BUSI_with_GT"
    / "benign" / "benign (103).png"
)

OUTPUT_DIR = PROJECT / "artifacts" / "explanations"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_PATH = OUTPUT_DIR / "gradcam_benign_103.png"

# Load our trained model.
checkpoint = torch.load(
    MODEL_PATH,
    map_location="cpu",
    weights_only=True,
)

model = mobilenet_v3_small(weights=None)

in_features = model.classifier[-1].in_features
model.classifier[-1] = nn.Linear(in_features, 3)

model.load_state_dict(checkpoint["model_state_dict"])
model.eval()

classes = sorted(
    checkpoint["class_to_idx"],
    key=checkpoint["class_to_idx"].get,
)

# Use identical image preprocessing.
size = checkpoint["image_size"]

with Image.open(IMAGE_PATH) as image:
    original = image.convert("RGB")

resized = ImageOps.contain(
    original,
    (size, size),
    method=Image.Resampling.LANCZOS,
)

processed = Image.new(
    "RGB",
    (size, size),
    (0, 0, 0),
)

left = (size - resized.width) // 2
top = (size - resized.height) // 2
processed.paste(resized, (left, top))

transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(
        checkpoint["mean"],
        checkpoint["std"],
    ),
])

# Grad-CAM requires gradients, even though
# the feature extractor was frozen in training.
tensor = transform(processed)
tensor = tensor.unsqueeze(0).requires_grad_(True)

captured = {}

def save_activations(module, inputs, output):
    captured["activations"] = output
    output.retain_grad()

# Target the final convolutional feature block.
handle = model.features[-1].register_forward_hook(
    save_activations
)

try:
    model.zero_grad(set_to_none=True)
    logits = model(tensor)

    predicted_index = logits.argmax(dim=1).item()
    predicted_class = classes[predicted_index]

    # Explain the predicted class.
    score = logits[0, predicted_index]
    score.backward()

    activations = captured["activations"].detach()
    gradients = captured["activations"].grad.detach()

    # Average gradients over spatial dimensions.
    weights = gradients.mean(
        dim=(2, 3),
        keepdim=True,
    )

    # Weighted feature-map combination.
    cam = (
        weights * activations
    ).sum(dim=1, keepdim=True)

    cam = torch.relu(cam)

    cam = F.interpolate(
        cam,
        size=(size, size),
        mode="bilinear",
        align_corners=False,
    )

    cam = cam[0, 0]
    cam = cam - cam.min()
    cam = cam / cam.max().clamp(min=1e-8)

finally:
    handle.remove()

# Convert heatmap into a colored overlay.
heatmap = cam.detach().cpu().numpy()

# Keep the added heatmap inside image content,
# excluding artificial padding.
mask = np.zeros((size, size), dtype=np.float32)
mask[top:top + resized.height,
     left:left + resized.width] = 1.0
heatmap = heatmap * mask

image_array = np.asarray(
    processed, dtype=np.float32
)

# Red/yellow visualization of high activation.
heat_color = np.zeros_like(image_array)
heat_color[:, :, 0] = 255
heat_color[:, :, 1] = 80

alpha = (0.6 * heatmap)[..., None]

overlay_array = (
    image_array * (1 - alpha)
    + heat_color * alpha
)

overlay = Image.fromarray(
    np.uint8(np.clip(overlay_array, 0, 255))
)

# Create side-by-side preview.
preview = Image.new(
    "RGB",
    (size * 2, size + 40),
    "white",
)

preview.paste(processed, (0, 30))
preview.paste(overlay, (size, 30))

draw = ImageDraw.Draw(preview)
draw.text((8, 8), "Processed Image", fill="black")
draw.text((size + 8, 8), "Grad-CAM Overlay", fill="black")

preview.save(OUTPUT_PATH)

print("GRAD-CAM VERIFICATION")
print("-" * 45)
print("Image:", IMAGE_PATH.name)
print("Predicted class:", predicted_class)
print("Target layer: MobileNetV3 final feature block")
print("Heatmap dimensions:", heatmap.shape)
print("Grad-CAM generated: Yes")
print("Model weights modified: No")
print("Test dataset used: No")
print("Saved:", OUTPUT_PATH)
print("-" * 45)
print("GRAD-CAM COMPLETED")
