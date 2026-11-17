"""Whole spices.  blender -b --python blender/spices.py  ->  public/models/spices.glb
Seven objects, each centred on its own origin; longest side ~0.4 (peppercorn 0.06). Also imported by render_spices.py.
ponytail: plain PBR colours + modelled detail instead of baked texture maps; bake if close-ups ever need it."""
import bpy, bmesh, math, os, sys
from mathutils import Vector, Matrix, noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jar import lathe, principled, srgb, export_glb, ROOT

TAU = 2 * math.pi


def mat(name, hexs, rough, **kw):
    return principled(name, **{"Base Color": srgb(hexs), "Roughness": rough, **kw})[0]


def join(parts, name):
    bpy.ops.object.select_all(action="DESELECT")
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    ob = parts[0]
    ob.name = ob.data.name = name
    return ob


def finish(ob, longest):
    """Apply transforms, centre on bounds, scale so the longest side == longest, smooth shade."""
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    ob.location = (0, 0, 0)
    ob.data.transform(Matrix.Scale(longest / max(ob.dimensions), 4))
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def ellipsoid(name, a, b, c, segs=32, rings=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segs, ring_count=rings, radius=1)
    ob = bpy.context.object
    ob.name = name
    ob.data.transform(Matrix.Diagonal((a, b, c, 1)))
    return ob


def lathe_x(name, profile, segs, mod):
    """lathe about Z with every point tagged, so mod() runs on all rings."""
    ob, _ = lathe(name, [(r, z, "t") if r else (r, z) for r, z in profile], segs, mod)
    return ob


def star_anise(m_pod, m_seed):
    parts = []
    for k in range(8):
        a = TAU * k / 8 + noise.noise(Vector((k, 0.5, 0))) * 0.06
        c = ellipsoid(f"carpel{k}", 0.09, 0.03, 0.028, 24, 12)
        for v in c.data.vertices:
            u = (v.co.x + 0.09) / 0.18          # 0 at hub, 1 at tip
            v.co.y *= (1 - u ** 3) ** 0.6 + 0.08
            v.co.z *= (1 - u ** 2) ** 0.4 + 0.1
            v.co.z += 0.03 * u ** 4 - (0.012 if v.co.z > 0 and abs(v.co.y) < 0.008 else 0)   # upturned tip, split seam
            v.co += Vector((0, 0, 1)) * noise.noise(v.co * 60) * 0.003
        c.data.materials.append(m_pod)
        c.matrix_world = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((0.1, 0, 0))
        s = ellipsoid(f"seed{k}", 0.022, 0.011, 0.009, 16, 8)
        s.data.materials.append(m_seed)
        s.matrix_world = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((0.09, 0, 0.021))
        parts += [c, s]
    hub = ellipsoid("hub", 0.025, 0.025, 0.03, 16, 8)
    hub.data.materials.append(m_pod)
    return finish(join([hub] + parts, "StarAnise"), 0.4)


def cinnamon(m):
    """Rolled quill: a bark sheet spiralling inward, cross-section in XY, length along Z."""
    bm = bmesh.new()
    turns, n, L, rows = 2.2, 140, 0.4, 48
    grid = []
    for i in range(rows + 1):
        z = L * i / rows
        row = []
        for k in range(n + 1):
            t = k / n
            th = TAU * turns * t
            r = 0.045 - 0.017 * t + 0.0015 * noise.noise(Vector((t * 9, z * 40, 1)))
            r += 0.0012 * math.sin(z * 260 + th) + 0.0009 * math.sin(th * 90 + z * 30)   # bark grain
            row.append(bm.verts.new((r * math.cos(th), r * math.sin(th), z)))
        grid.append(row)
    for i in range(rows):
        for k in range(n):
            bm.faces.new((grid[i][k], grid[i][k + 1], grid[i + 1][k + 1], grid[i + 1][k]))
    me = bpy.data.meshes.new("Cinnamon")
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new("Cinnamon", me)
    bpy.context.scene.collection.objects.link(ob)
    sol = ob.modifiers.new("thick", "SOLIDIFY")
    sol.thickness = 0.0035
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.modifier_apply(modifier="thick")
    me.materials.append(m)
    ob.rotation_euler.x = math.pi / 2
    return finish(ob, 0.4)


def cardamom(m):
    P = [(0, -0.5)] + [(0.24 * math.sin(math.pi * k / 24) ** 0.8, -0.5 + k / 24) for k in range(1, 24)] + [(0, 0.5)]

    def ridges(r, z, tag, th, j):
        return r * (1 + 0.09 * math.cos(3 * th) + 0.025 * math.cos(21 * th) + 0.02 * noise.noise(Vector((th * 3, z * 9, 0)))), z

    pod = lathe_x("Cardamom", P, 96, ridges)
    pod.data.materials.append(m)
    tip = ellipsoid("tip", 0.015, 0.015, 0.05, 12, 6)
    tip.location.z = 0.52
    tip.data.materials.append(m)
    ob = join([pod, tip], "Cardamom")
    ob.rotation_euler.y = math.pi / 2
    return finish(ob, 0.4)


def peppercorn(m):
    P = [(0, -1)] + [(math.sin(math.pi * k / 20), -math.cos(math.pi * k / 20)) for k in range(1, 20)] + [(0, 1)]

    def wrinkle(r, z, tag, th, j):
        p = Vector((r * math.cos(th), r * math.sin(th), z))
        return r * (1 + 0.07 * noise.noise(p * 3.5) + 0.03 * noise.noise(p * 8)), z

    ob = lathe_x("Peppercorn", P, 48, wrinkle)
    ob.data.materials.append(m)
    return finish(ob, 0.06)


def bay_leaf(m):
    nx, ny, L = 60, 16, 1.0
    bm = bmesh.new()
    grid = []
    for i in range(nx + 1):
        u = i / nx
        half = 0.19 * math.sin(math.pi * u) ** 0.9 * (1 - 0.25 * u)    # broad near the stalk, pointed tip
        row = []
        for k in range(ny + 1):
            w = (k / ny) * 2 - 1
            x, y = u * L, w * half
            z = 0.12 * w * w * half / 0.19 + 0.08 * (u - 0.5) ** 2            # cupped and arched
            z += 0.006 * (1 - abs(w)) ** 6                                       # raised midrib
            z += 0.003 * max(0.0, math.cos((u * 14 - abs(w) * 2.2) * math.pi)) ** 8 * (1 - abs(w))  # paired veins
            z += 0.01 * noise.noise(Vector((x * 3, y * 3, 2)))
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for i in range(nx):
        for k in range(ny):
            bm.faces.new((grid[i][k], grid[i + 1][k], grid[i + 1][k + 1], grid[i][k + 1]))
    me = bpy.data.meshes.new("BayLeaf")
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new("BayLeaf", me)
    bpy.context.scene.collection.objects.link(ob)
    sol = ob.modifiers.new("thick", "SOLIDIFY")
    sol.thickness = 0.008
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.modifier_apply(modifier="thick")
    me.materials.append(m)
    return finish(ob, 0.4)


def chilli(m_pod, m_stem):
    L = 1.0
    P = [(0, 0)] + [(0.11 * (k / 30) ** 0.35 * (1 - 0.15 * (k / 30) ** 4), L * (1 - k / 30)) for k in range(1, 31)][::-1]
    P = sorted(P, key=lambda p: p[1])
    P = [(0, -0.002)] + [p for p in P if p[0] > 0] + [(0, L)]

    def wrinkle(r, z, tag, th, j):
        p = Vector((math.cos(th), math.sin(th), z * 4))
        return r * (1 + 0.12 * abs(noise.noise(p * 2.2)) - 0.06 + 0.04 * noise.noise(p * 6)), z

    pod = lathe_x("pod", P, 48, wrinkle)
    for v in pod.data.vertices:                     # tip-ward curve
        t = 1 - v.co.z / L
        v.co.x += 0.25 * t ** 2.2
    pod.data.materials.append(m_pod)
    cap = ellipsoid("cap", 0.1, 0.1, 0.04, 24, 8)
    cap.location.z = L
    stem = ellipsoid("stem", 0.018, 0.018, 0.09, 12, 6)
    stem.location = (0.01, 0, L + 0.09)
    stem.rotation_euler.y = 0.25
    for s in (cap, stem):
        s.data.materials.append(m_stem)
    ob = join([pod, cap, stem], "Chilli")
    ob.rotation_euler.y = math.pi / 2
    return finish(ob, 0.4)


def garlic(m, m_root):
    P = [(0, -0.42)] + [(0.5 * math.sin(math.pi * k / 26) ** 0.75 * (1 - 0.82 * max(0, (k - 15) / 11) ** 1.4), -0.42 + 0.95 * k / 26) for k in range(1, 26)]
    P += [(0.035, 0.6), (0.03, 0.72), (0, 0.72)]

    def cloves(r, z, tag, th, j):
        lobe = abs(math.cos(4 * th + 0.3 * z)) ** 0.5            # 8 clove bulges
        return r * (0.9 + 0.1 * lobe + 0.012 * noise.noise(Vector((th * 6, z * 12, 3)))), z

    bulb = lathe_x("Garlic", P, 96, cloves)
    bulb.data.materials.append(m)
    root = ellipsoid("root", 0.13, 0.13, 0.025, 24, 6)
    root.location.z = -0.41
    root.data.materials.append(m_root)
    return finish(join([bulb, root], "Garlic"), 0.4)


def build_spices():
    return [
        star_anise(mat("StarAnisePod", "#5a2c1a", 0.7), mat("StarAniseSeed", "#9a6a34", 0.25)),
        cinnamon(mat("Cinnamon", "#6a361b", 0.85)),
        cardamom(mat("Cardamom", "#7f8e48", 0.6)),
        peppercorn(mat("Peppercorn", "#2b1e16", 0.55)),
        bay_leaf(mat("BayLeaf", "#4f5a2a", 0.45)),
        chilli(mat("Chilli", "#8c1a10", 0.35), mat("ChilliStem", "#5d5a2a", 0.7)),
        garlic(mat("Garlic", "#e2d6bf", 0.6), mat("GarlicRoot", "#b8a684", 0.9)),
    ]


if __name__ == "__main__":
    bpy.ops.wm.read_factory_settings(use_empty=True)
    obs = build_spices()
    for o in obs:
        print(o.name, len(o.data.polygons), "polys", tuple(round(d, 3) for d in o.dimensions))
    export_glb(os.path.join(ROOT, "public", "models", "spices.glb"), obs)
