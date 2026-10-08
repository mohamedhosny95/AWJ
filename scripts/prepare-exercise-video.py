#!/usr/bin/env python3
"""Prepare an already reviewed, licensed local clip. Requires FFmpeg and Pillow.

Does not download or approve assets. Add the returned metadata and source licence
to data/exercise-media.json only after visually reviewing complete repetitions.
"""
import argparse
import hashlib
import io
import json
import re
import subprocess
import tempfile
from pathlib import Path
from PIL import Image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('input', type=Path)
parser.add_argument('--stem', required=True)
parser.add_argument('--start', type=float, required=True)
parser.add_argument('--duration', type=float, required=True)
parser.add_argument('--poster-offset', type=float, default=0.2)
parser.add_argument('--ffmpeg', default='ffmpeg')
parser.add_argument('--output', type=Path, default=Path('src/client/assets/exercises'))
args = parser.parse_args()
if not re.fullmatch(r'[a-z0-9-]+', args.stem):
    parser.error('stem must use lowercase letters, digits and hyphens')
if args.start < 0 or args.duration <= 0 or not 0 <= args.poster_offset < args.duration:
    parser.error('invalid trim or poster offset')
args.output.mkdir(parents=True, exist_ok=True)

def inspect(path):
    info = subprocess.run([args.ffmpeg, '-hide_banner', '-i', str(path)], capture_output=True, text=True).stderr
    wh = re.search(r' (\d{2,5})x(\d{2,5})', info)
    fps = re.search(r' ([\d.]+) fps', info)
    if not wh or not fps:
        raise ValueError('cannot read native dimensions / frame rate')
    return int(wh[1]), int(wh[2]), float(fps[1])

def store(data, suffix, kind, width, height, **extra):
    version = hashlib.sha256(data).hexdigest()[:16]
    path = args.output / f'{args.stem}-{suffix}-{version}.{ "mp4" if kind == "video" else "webp" }'
    path.write_bytes(data)
    return {'src':str(path.relative_to('src/client')), 'version':version, 'bytes':len(data),
            'type':kind, 'width':width, 'height':height, **extra}

native_width, native_height, native_fps = inspect(args.input)
variants = []
with tempfile.TemporaryDirectory() as temporary:
    for quality in [720, 1080]:
        if min(native_width, native_height) < quality:
            continue  # No upscaling and no invented HD label.
        path = Path(temporary) / f'{quality}.mp4'
        scale = f'scale=-2:{quality}' if native_width >= native_height else f'scale={quality}:-2'
        subprocess.run([args.ffmpeg,'-v','error','-ss',str(args.start),'-i',str(args.input),
                        '-t',str(args.duration),'-vf',scale,'-c:v','libx264','-preset','slow',
                        '-crf','20','-pix_fmt','yuv420p','-an','-movflags','+faststart','-y',str(path)], check=True)
        width, height, fps = inspect(path)
        variants.append(store(path.read_bytes(),str(quality),'video',width,height,
                              quality=quality,fps=fps,duration=args.duration))
    if not variants:
        raise ValueError('source is below the minimum 720p delivery size')
    poster_path = Path(temporary) / 'poster.png'
    subprocess.run([args.ffmpeg,'-v','error','-ss',str(args.start+args.poster_offset),
                    '-i',str(args.input),'-frames:v','1','-y',str(poster_path)], check=True)
    poster = Image.open(poster_path).convert('RGB')
    output = io.BytesIO(); poster.save(output,'WEBP',quality=92,method=6)
    result = {'poster':store(output.getvalue(),'poster','image',poster.width,poster.height),
              'videos':variants,'nativeWidth':native_width,'nativeHeight':native_height,
              'nativeFps':native_fps,'upscaled':False,'interpolated':False,'audioRemoved':True}
print(json.dumps(result, indent=2))
