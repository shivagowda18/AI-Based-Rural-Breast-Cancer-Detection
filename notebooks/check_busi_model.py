
import torch
from torch import nn
from torchvision.models import (
    mobilenet_v3_small,
    MobileNet_V3_Small_Weights,
)

# Load pretrained ImageNet weights.
weights = MobileNet_V3_Small_Weights.DEFAULT
model = mobilenet_v3_small(weights=weights)

# Freeze the feature extractor for our first experiment.
for parameter in model.features.parameters():
    parameter.requires_grad = False

# Replace ImageNet's classifier with our 3 BUSI classes.
input_features = model.classifier[-1].in_features
model.classifier[-1] = nn.Linear(input_features, 3)

# Run a test without training.
model.eval()

sample = torch.randn(1, 3, 224, 224)

with torch.inference_mode():
    output = model(sample)

assert output.shape == (1, 3)

print("MODEL VERIFICATION")
print("-" * 40)
print("Model: MobileNetV3-Small")
print("Pretrained weights: ImageNet")
print("Classes: benign, malignant, normal")
print("Input shape:", sample.shape)
print("Output shape:", output.shape)
print("Feature extractor frozen: Yes")
print("Training completed: No")
print("-" * 40)
print("MODEL VERIFICATION PASSED")
