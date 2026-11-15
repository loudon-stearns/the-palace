#!/bin/sh
# Moebius (hustvl, ECCV 2026; code Apache 2.0, weights MIT) on the dilate-21 hole and the big hole,
# as run on 2026-11-15. Not in the palace's tools: it ran from a throwaway scratch venv.
#   MOEB=<clone of https://github.com/hustvl/Moebius>  VENV=<python 3.12 venv>  sh run_moebius.sh IMGDIR MASKDIR OUTDIR
# Setup that day (about 4 minutes): uv venv -p 3.12; pip install torch torchvision diffusers==0.38.0 transformers
#   accelerate safetensors omegaconf timm opencv-python pyyaml toml orjson scipy tqdm pandas einops tensorboard;
#   in the clone, comment out model_lib/__init__.py's teacher import (from .nets.unet_gla ...), which needs
#   flash-linear-attention / triton, which macOS lacks; hf download hustvl/Moebius ft_places2/diffusion_pytorch_model.bin
#   into weight/Moebius and hustvl/PixelHacker vae/* into weight.
# IMGDIR and MASKDIR hold same-named PNGs; the CLI squares each to 512x512, 20 DDIM steps, cfg 2.0, on MPS.
# moebius_finish.py then resizes back and pastes the outside of the hole from the input.
cd "$MOEB" && PYTORCH_ENABLE_MPS_FALLBACK=1 HF_HUB_DISABLE_IMPLICIT_TOKEN=1 "$VENV/bin/python" -m infer.infer_moebius \
  --model-config config/model_cfg/moebius.yaml --model-weight weight/Moebius/ft_places2/diffusion_pytorch_model.bin \
  --real-dir "$1" --mask-dir "$2" --save-dir "$3" --cfg 2.0 --batch-size 1 --num-workers 0 --device mps
