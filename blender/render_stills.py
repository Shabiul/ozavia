"""Cycles stills for the static fallback.  blender -b --python blender/render_stills.py [-- name ...]
-> public/renders/{hero,garam,biryani,elite,pili,box,spices}.webp  (1920x1280). Pass names to render a subset;
add 'preview' for a fast low-sample pass."""
import bpy, math, os, sys
from mathutils import Vector, Matrix

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import jar, box, spices
from jar import principled, srgb, TEX, ROOT

IDS = ["garam", "biryani", "elite", "pili"]
SPICE = {"garam": "#7a4a22", "biryani": "#8a6a2a", "elite": "#9a3d1c", "pili": "#b5361a"}   # content/masalas.ts spiceColor
OUT = os.path.join(ROOT, "public", "renders")
args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
PREVIEW = "preview" in args
WANT = [a for a in args if a != "preview"] or ["hero", *IDS, "box", "spices"]


def tex(nt, name, non_color=False, uv_scale=None):
    t = nt.nodes.new("ShaderNodeTexImage")
    t.image = bpy.data.images.load(os.path.join(TEX, name), check_existing=True)
    if non_color:
        t.image.colorspace_settings.name = "Non-Color"
    if uv_scale:
        m = nt.nodes.new("ShaderNodeMapping")
        m.inputs["Scale"].default_value = (uv_scale, uv_scale, 1)
        nt.links.new(nt.nodes.new("ShaderNodeTexCoord").outputs["UV"], m.inputs["Vector"])
        nt.links.new(m.outputs["Vector"], t.inputs["Vector"])
    return t


def jar_mats(mid):
    glass, _ = principled("Glass", **{"Base Color": (1, 1, 1, 1), "Roughness": 0.02, "IOR": 1.5, "Transmission Weight": 1.0})
    lid, _ = principled("LidGold", **{"Base Color": srgb("#d9b25f"), "Metallic": 1.0, "Roughness": 0.3})
    label, b = principled(f"Label-{mid}", **{"Roughness": 0.42})
    nt = label.node_tree
    nt.links.new(tex(nt, f"label-{mid}.png").outputs["Color"], b.inputs["Base Color"])
    nt.links.new(tex(nt, f"label-{mid}-foil.png", True).outputs["Color"], b.inputs["Metallic"])
    sp, b = principled(f"Spice-{mid}", **{"Roughness": 1.0})
    nt = sp.node_tree
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type, mix.blend_type = "RGBA", "MULTIPLY"
    mix.inputs["Factor"].default_value = 1
    mix.inputs["B"].default_value = srgb(SPICE[mid])
    nt.links.new(tex(nt, "spice-albedo.png").outputs["Color"], mix.inputs["A"])
    mix.inputs["B"].default_value = [c * 2 for c in srgb(SPICE[mid])[:3]] + [1]   # albedo is mid-grey
    nt.links.new(mix.outputs["Result"], b.inputs["Base Color"])
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nt.links.new(tex(nt, "spice-normal.png", True).outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    return {"Glass": glass, "Lid": lid, "Label": label, "Spice": sp}


def place_jar(mid, mw):
    obs = jar.build_jar(jar_mats(mid))
    root = bpy.data.objects.new(f"jar-{mid}", None)
    bpy.context.scene.collection.objects.link(root)
    for o in obs.values():
        o.parent = root
    root.matrix_world = mw
    return root


def studio(cam_loc, target, lens=50, floor=True):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 24 if PREVIEW else 128
    sc.cycles.use_denoising = True
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        for dev in ("OPTIX", "CUDA", "HIP", "METAL", "ONEAPI"):
            try:
                prefs.compute_device_type = dev
                prefs.get_devices()
                if any(d.type == dev for d in prefs.devices):
                    for d in prefs.devices:
                        d.use = d.type == dev
                    sc.cycles.device = "GPU"
                    break
            except TypeError:
                continue
    except KeyError:
        pass
    sc.cycles.max_bounces = 16
    sc.cycles.transmission_bounces = 16
    sc.render.resolution_x, sc.render.resolution_y = (960, 640) if PREVIEW else (1920, 1280)
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.render.image_settings.file_format = "WEBP"
    sc.render.image_settings.quality = 88
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.004, 0.0045, 0.003, 1)
    sc.world = w
    if floor:
        bpy.ops.mesh.primitive_plane_add(size=60)
        fm, _ = principled("Floor", **{"Base Color": srgb("#16180f"), "Roughness": 0.28})
        bpy.context.object.data.materials.append(fm)
    def light(name, loc, energy, color, size, shape="RECTANGLE", sy=None):
        d = bpy.data.lights.new(name, "AREA")
        d.energy, d.color, d.shape, d.size = energy, color, shape, size
        if sy:
            d.size_y = sy
        o = bpy.data.objects.new(name, d)
        sc.collection.objects.link(o)
        o.location = loc
        o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    light("key", (-5, -5, 6), 1600, (1, 0.86, 0.68), 4)
    light("rimR", (5, 3, 2.5), 900, (1, 0.93, 0.82), 0.6, sy=6)
    light("rimL", (-5, 3, 2), 500, (1, 0.9, 0.76), 0.5, sy=6)
    light("fill", (0, -7, 1), 120, (1, 0.95, 0.88), 6)
    cd = bpy.data.cameras.new("cam")
    cd.lens = lens
    cam = bpy.data.objects.new("cam", cd)
    sc.collection.objects.link(cam)
    cam.location = cam_loc
    cam.rotation_euler = (Vector(target) - Vector(cam_loc)).to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam


def render(name):
    p = os.path.join(OUT, f"{name}{'-preview' if PREVIEW else ''}.webp")
    bpy.context.scene.render.filepath = p
    bpy.ops.render.render(write_still=True)
    print("rendered", p, os.path.getsize(p))


def scene_hero():
    for i, mid in enumerate(IDS):
        x = (i - 1.5) * 0.78
        place_jar(mid, Matrix.Translation((x, abs(i - 1.5) * 0.18, 0)) @ Matrix.Rotation((i - 1.5) * -0.12, 4, "Z"))
    studio((0, -6.2, 1.9), (0, 0, 0.62), lens=55)


def scene_jar(mid):
    place_jar(mid, Matrix.Rotation(0.32, 4, "Z"))
    studio((0, -4.2, 1.35), (0, 0, 0.6), lens=60)


def scene_box():
    olive, _ = principled("BoxOlive", **{"Base Color": srgb("#3a3f2a"), "Roughness": 0.72})
    box.make_base(olive)
    box.make_lid(olive, box.mat_image("BoxPrint", "box-lid.png", "box-lid-orm.png"))
    box.make_crinkle()
    for i, mid in enumerate(IDS):
        place_jar(mid, Matrix.Translation(((i - 1.5) * box.SLOT, -0.6, box.JAR_Y)) @ Matrix.Rotation(-math.pi / 2, 4, "X"))
    studio((0, -6.5, 4.6), (0, 0.1, 0.55), lens=50)


def scene_spices():
    obs = spices.build_spices()
    spots = {"StarAnise": (-0.6, 0.2, 0.3), "Cinnamon": (-0.15, 0.32, 0.5), "Cardamom": (0.2, 0.38, 0.9),
             "Peppercorn": (0.16, -0.3, 0), "BayLeaf": (-0.52, -0.22, -0.4), "Chilli": (-0.1, -0.1, 2.6), "Garlic": (0.55, 0.0, 0)}
    for o in obs:
        x, y, rz = spots[o.name]
        bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
        o.location = (x, y, -min(v.z for v in bb))
        o.rotation_euler.z = rz
    pep = next(o for o in obs if o.name == "Peppercorn")
    for k, (dx, dy) in enumerate([(0.07, 0.03), (-0.05, 0.06), (0.03, -0.07), (0.12, -0.04), (-0.08, -0.05)]):
        c = pep.copy()
        bpy.context.scene.collection.objects.link(c)
        c.location = pep.location + Vector((dx, dy, 0))
        c.rotation_euler = (k, k * 2, k * 3)
    studio((0, -1.75, 1.45), (0, 0.04, 0.03), lens=50)


SCENES = {"hero": scene_hero, "box": scene_box, "spices": scene_spices, **{m: (lambda m=m: scene_jar(m)) for m in IDS}}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name in WANT:
        bpy.ops.wm.read_factory_settings(use_empty=True)
        SCENES[name]()
        render(name)
