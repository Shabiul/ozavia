"""Tileable granular powder: spice-albedo.png (neutral, tinted at runtime) + spice-normal.png (OpenGL / glTF +Y).
blender -b --python blender/spice_tex.py"""
import bpy, os
import numpy as np

TEX = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "textures")
N = 512
rng = np.random.default_rng(3)
f = np.fft.fftfreq(N)
f2 = f[:, None] ** 2 + f[None, :] ** 2


def blur(sigma):  # FFT gaussian blur of white noise: periodic, so it tiles
    g = np.exp(-2 * (np.pi * sigma) ** 2 * f2)
    a = np.real(np.fft.ifft2(np.fft.fft2(rng.standard_normal((N, N))) * g))
    return a / a.std()


h = 0.55 * blur(0.6) + 0.3 * blur(1.6) + 0.15 * blur(6.0)
alb = np.clip(0.5 + 0.11 * h + 0.05 * blur(0.4), 0, 1)
dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5
dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 0.5
s = 0.9
nrm = np.stack([-dx * s, -dy * s, np.ones_like(h)], -1)
nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)


def save(name, rgb, srgb):
    img = bpy.data.images.new(name, N, N, alpha=False)
    img.colorspace_settings.name = "sRGB" if srgb else "Non-Color"
    px = np.concatenate([rgb, np.ones((N, N, 1))], -1).astype(np.float32)
    img.pixels.foreach_set(px.ravel())
    img.filepath_raw = os.path.join(TEX, name)
    img.file_format = "PNG"
    img.save()
    print(name, os.path.getsize(img.filepath_raw))


save("spice-albedo.png", np.repeat(alb[..., None], 3, -1), True)
save("spice-normal.png", nrm * 0.5 + 0.5, False)
