
from functools import lru_cache
from io import BytesIO
from pathlib import Path
from threading import Lock
import argparse

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image, ImageOps
from torch import nn
from torchvision import transforms
from torchvision.models import mobilenet_v3_small


PROJECT = Path(__file__).resolve().parents[3]

MODEL_PATH = (
    PROJECT / "artifacts" / "models"
    / "busi_mobilenetv3_best.pth"
)

CAM_LOCK = Lock()


@lru_cache(maxsize=1)
def load_gradcam_model():
    checkpoint = torch.load(
        MODEL_PATH,
        map_location="cpu",
        weights_only=True,
    )

    model = mobilenet_v3_small(weights=None)

    features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(features, 3)

    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    # We need input gradients, not weight updates.
    for parameter in model.parameters():
        parameter.requires_grad_(False)

    return model, checkpoint


def generate_gradcam_png(image_source):
    model, checkpoint = load_gradcam_model()
    size = checkpoint["image_size"]

    with Image.open(image_source) as image:
        original = image.convert("RGB")

    resized = ImageOps.contain(
        original,
        (size, size),
        method=Image.Resampling.LANCZOS,
    )

    processed = Image.new(
        "RGB", (size, size), (0, 0, 0)
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

    tensor = (
        transform(processed)
        .unsqueeze(0)
        .requires_grad_(True)
    )

    captured = {}

    def capture_features(module, inputs, output):
        captured["features"] = output

    with CAM_LOCK:
        handle = model.features[-1].register_forward_hook(
            capture_features
        )

        try:
            with torch.enable_grad():
                logits = model(tensor)
                predicted_index = int(
                    logits.argmax(dim=1).item()
                )

                features = captured["features"]

                gradients = torch.autograd.grad(
                    logits[0, predicted_index],
                    features,
                )[0]

                weights = gradients.mean(
                    dim=(2, 3),
                    keepdim=True,
                )

                cam = torch.relu(
                    (weights * features).sum(
                        dim=1,
                        keepdim=True,
                    )
                )

                cam = F.interpolate(
                    cam,
                    size=(size, size),
                    mode="bilinear",
                    align_corners=False,
                )

                cam = cam[0, 0].detach().numpy()

        finally:
            handle.remove()

    # Normalize only inside the real image area.
    cropped = cam[
        top:top + resized.height,
        left:left + resized.width,
    ]

    minimum = cropped.min()
    maximum = cropped.max()

    normalized = (
        (cropped - minimum) / (maximum - minimum)
        if maximum > minimum
        else np.zeros_like(cropped)
    )

    heatmap = np.zeros((size, size), dtype=np.float32)

    heatmap[
        top:top + resized.height,
        left:left + resized.width,
    ] = normalized

    original_array = np.asarray(
        processed,
        dtype=np.float32,
    )

    heat_color = np.zeros_like(original_array)
    heat_color[:, :, 0] = 255
    heat_color[:, :, 1] = 80

    alpha = (0.6 * heatmap)[..., None]

    overlay_array = (
        original_array * (1 - alpha)
        + heat_color * alpha
    )

    overlay = Image.fromarray(
        np.uint8(np.clip(overlay_array, 0, 255))
    )

    buffer = BytesIO()
    overlay.save(buffer, format="PNG")

    classes = sorted(
        checkpoint["class_to_idx"],
        key=checkpoint["class_to_idx"].get,
    )

    return buffer.getvalue(), classes[predicted_index]


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument("image_path")

    parser.add_argument(
        "--output",
        default=None,
        help="Optional path to save the Grad-CAM PNG.",
    )

    args = parser.parse_args()

    image_bytes, predicted_class = generate_gradcam_png(
        BytesIO(Path(args.image_path).read_bytes())
    )

    print("GRAD-CAM SERVICE VERIFICATION")
    print("Predicted class:", predicted_class)
    print("PNG generated:", len(image_bytes), "bytes")
    print("Model weights modified: No")

    if args.output:
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(image_bytes)

        print("Saved:", output)
    else:
        print("Not saved: in-memory verification only")

    print("GRAD-CAM SERVICE PASSED")
