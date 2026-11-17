"""Re-import the exported GLBs and assert names, sizes and file budgets.  blender -b --python blender/check_glb.py"""
import bpy, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = os.path.join(ROOT, "public", "models")
SPICES = ["StarAnise", "Cinnamon", "Cardamom", "Peppercorn", "BayLeaf", "Chilli", "Garlic"]
# file: (MB budget, {object: (min longest side, max longest side) in Blender units})
EXPECT = {
    "jar.glb": (1.5, {"Glass": (1.15, 1.25), "Lid": (0.5, 0.56), "Label": (0.6, 0.72), "Spice": (0.5, 1.0)}),
    "box.glb": (2.0, {"BoxBase": (2.9, 3.1), "BoxLid": (2.9, 3.1), "Crinkle": (2.8, 3.0)}),
    "spices.glb": (3.0, {n: (0.05, 0.07) if n == "Peppercorn" else (0.38, 0.42) for n in SPICES}),
}
fail = []
for f, (mb, objs) in EXPECT.items():
    p = os.path.join(M, f)
    size = os.path.getsize(p) / 1e6
    if size > mb:
        fail.append(f"{f}: {size:.2f} MB > {mb}")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=p)
    for name, (lo, hi) in objs.items():
        o = bpy.data.objects.get(name)
        if not o:
            fail.append(f"{f}: missing {name}")
            continue
        d = max(o.dimensions)
        if not lo <= d <= hi:
            fail.append(f"{f}: {name} longest {d:.3f} not in [{lo}, {hi}]")
    print(f"{f}: {size:.3f} MB, {sorted(objs)} ok" if not any(x.startswith(f) for x in fail) else f"{f}: FAIL")
    if f == "jar.glb":
        g, lid = bpy.data.objects["Glass"], bpy.data.objects["Lid"]
        top = lid.location.z + lid.dimensions.z    # lid origin = its bottom edge
        if not (1.22 <= top <= 1.28 and 0.6 <= g.dimensions.x <= 0.64):
            fail.append(f"jar.glb: diameter {g.dimensions.x:.3f} / total height {top:.3f} not ~0.62 x 1.25")
print("\n".join(fail) or "ALL OK")
if fail:
    raise SystemExit(1)
