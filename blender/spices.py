"""Whole spices.  blender -b --python blender/spices.py  ->  public/models/spices.glb
Seven objects, each centred on its own origin; longest side ~0.4 (peppercorn 0.06). Also imported by render_stills.py.
Surface detail: procedural Cycles materials (colour variation, streaks, fine bump) are baked to per-spice
base-colour + normal maps, which is what gets exported."""
import bpy, bmesh, math, os, sys
from mathutils import Vector, Matrix, noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jar import lathe, principled, srgb, export_glb, use_gpu, ROOT

TAU = 2 * math.pi


def mat(name, ramp, rough, scale=8.0, long=None, streak=0.0, bump=0.25, cell=0.0, **kw):
    """Bake-source material. ramp: [(pos, hex)] over a noise field (optionally mixed with lengthwise
    streaks running along the spice's long axis `long`, which also stretches the noise); bump: fine noise
    (+ voronoi creases when cell > 0)."""
    m, b = principled(name, **{"Roughness": rough, **kw})
    m["rough"] = rough
    nt, L = m.node_tree, m.node_tree.links
    N = lambda t: nt.nodes.new(t)
    tc, mp = N("ShaderNodeTexCoord"), N("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = [0.3 if a == long else 1.0 for a in "XYZ"]
    L.new(tc.outputs["Object"], mp.inputs["Vector"])
    v = mp.outputs["Vector"]
    nz = N("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value, nz.inputs["Detail"].default_value, nz.inputs["Roughness"].default_value = scale, 10, 0.62
    L.new(v, nz.inputs["Vector"])
    fac = nz.outputs["Fac"]
    if streak:
        wv = N("ShaderNodeTexWave")
        wv.bands_direction = "Y" if long == "X" else "X"
        wv.inputs["Scale"].default_value, wv.inputs["Distortion"].default_value, wv.inputs["Detail"].default_value = scale * 0.7, 3.5, 4
        L.new(v, wv.inputs["Vector"])
        mx = N("ShaderNodeMix")
        mx.inputs["Factor"].default_value = streak
        L.new(fac, mx.inputs["A"])
        L.new(wv.outputs["Fac"], mx.inputs["B"])
        fac = mx.outputs["Result"]
    cr = N("ShaderNodeValToRGB")
    el = cr.color_ramp.elements
    for k, (pos, hx) in enumerate(ramp):
        e = el[k] if k < 2 else el.new(pos)
        e.position, e.color = pos, srgb(hx)
    L.new(fac, cr.inputs["Fac"])
    L.new(cr.outputs["Color"], b.inputs["Base Color"])
    fine = N("ShaderNodeTexNoise")
    fine.inputs["Scale"].default_value, fine.inputs["Detail"].default_value = scale * 7, 12
    L.new(v, fine.inputs["Vector"])
    h = fine.outputs["Fac"]
    if cell:
        vo = N("ShaderNodeTexVoronoi")
        vo.feature = "DISTANCE_TO_EDGE"
        vo.inputs["Scale"].default_value = cell
        L.new(v, vo.inputs["Vector"])
        add = N("ShaderNodeMath")
        add.operation = "MULTIPLY_ADD"
        L.new(vo.outputs["Distance"], add.inputs[0])
        add.inputs[1].default_value = 2.0
        L.new(h, add.inputs[2])
        h = add.outputs["Value"]
    bp = N("ShaderNodeBump")
    bp.inputs["Strength"].default_value, bp.inputs["Distance"].default_value = bump, 0.01
    L.new(h, bp.inputs["Height"])
    L.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


def bake(ob, size):
    """Bake every material slot of ob into one base-colour and one normal map, then swap in plain
    Principled materials that use them (the exporter maps those 1:1 to glTF)."""
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.01)
    bpy.ops.object.mode_set(mode="OBJECT")
    imgs = {}
    for kind in ("color", "normal"):
        im = bpy.data.images.new(f"{ob.name}-{kind}", size, size, alpha=False)
        im.colorspace_settings.name = "sRGB" if kind == "color" else "Non-Color"
        imgs[kind] = im
    sc = bpy.context.scene
    sc.cycles.samples = 8
    sc.render.bake.margin = 6
    for kind, btype in (("color", "DIFFUSE"), ("normal", "NORMAL")):
        for m in ob.data.materials:
            n = m.node_tree.nodes.new("ShaderNodeTexImage")
            n.image = imgs[kind]
            m.node_tree.nodes.active = n
        bpy.ops.object.bake(type=btype, pass_filter={"COLOR"}, use_clear=True)
    for i, m in enumerate(ob.data.materials):
        out, b = principled(m.name + "-baked", **{"Roughness": m["rough"]})
        nt = out.node_tree
        tc = nt.nodes.new("ShaderNodeTexImage")
        tc.image = imgs["color"]
        nt.links.new(tc.outputs["Color"], b.inputs["Base Color"])
        tn = nt.nodes.new("ShaderNodeTexImage")
        tn.image = imgs["normal"]
        nm = nt.nodes.new("ShaderNodeNormalMap")
        nt.links.new(tn.outputs["Color"], nm.inputs["Color"])
        nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
        ob.data.materials[i] = out
    for im in imgs.values():   # the exporter embeds images by file type; jpeg keeps the GLB small
        im.file_format = "JPEG"
    return ob


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
        ragged = i in (0, rows)                      # torn, uneven ends
        row = []
        for k in range(n + 1):
            t = k / n
            th = TAU * turns * t
            r = 0.045 - 0.017 * t + 0.0015 * noise.noise(Vector((t * 9, z * 40, 1)))
            zz = z + (0.012 * noise.noise(Vector((t * 25, i, 5))) if ragged else 0)
            r += 0.0012 * math.sin(z * 260 + th) + 0.0009 * math.sin(th * 90 + z * 30)   # bark grain
            row.append(bm.verts.new((r * math.cos(th), r * math.sin(th), zz)))
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
    nx, ny, L = 180, 44, 1.0
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
            z += 0.014 * (1 - abs(w)) ** 14                                      # raised midrib
            z += 0.006 * max(0.0, math.cos((u * 16 - abs(w) * 2.6) * math.pi)) ** 16 * (1 - abs(w)) ** 0.5  # paired veins
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
    P = [(0, 0)] + [(0.11 * (k / 90) ** 0.35 * (1 - 0.15 * (k / 90) ** 4), L * (1 - k / 90)) for k in range(1, 91)][::-1]
    P = sorted(P, key=lambda p: p[1])
    P = [(0, -0.002)] + [p for p in P if p[0] > 0] + [(0, L)]

    def wrinkle(r, z, tag, th, j):
        p = Vector((math.cos(th), math.sin(th), z * 4))
        fold = noise.noise(Vector((math.cos(th) * 1.5, math.sin(th) * 1.5, z * 3)))     # long dried folds
        return r * (1 + 0.2 * fold - 0.14 * abs(noise.noise(p * 3.5)) + 0.05 * noise.noise(p * 9)), z

    pod = lathe_x("pod", P, 96, wrinkle)
    for v in pod.data.vertices:                     # tip-ward curve
        t = 1 - v.co.z / L
        v.co.x += 0.25 * t ** 2.2
        v.co.y *= 0.72                              # dried pods flatten
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
    P += [(0.05, 0.55), (0.028, 0.6), (0, 0.6)]

    def cloves(r, z, tag, th, j):
        lobe = abs(math.cos(4 * th + 0.3 * z)) ** 0.5            # 8 clove bulges
        return r * (0.9 + 0.1 * lobe + 0.012 * noise.noise(Vector((th * 6, z * 12, 3)))), z

    bulb = lathe_x("Garlic", P, 96, cloves)
    bulb.data.materials.append(m)
    root = ellipsoid("root", 0.13, 0.13, 0.025, 24, 6)
    root.location.z = -0.41
    root.data.materials.append(m_root)
    return finish(join([bulb, root], "Garlic"), 0.4)


def build_spices(baked=True):
    obs = [
        star_anise(mat("StarAnisePod", [(0.2, "#2e140b"), (0.5, "#5a2a17"), (0.8, "#7c3f22")], 0.75, scale=14, bump=0.5, cell=30),
                   mat("StarAniseSeed", [(0.3, "#7a4f22"), (0.7, "#a87a40")], 0.3, scale=30, bump=0.1)),
        cinnamon(mat("Cinnamon", [(0.25, "#5a2c14"), (0.55, "#8a4a26"), (0.85, "#a8653a")], 0.85, scale=9, long="Y", streak=0.6, bump=0.45)),
        cardamom(mat("Cardamom", [(0.25, "#5f6e30"), (0.6, "#87974e"), (0.9, "#b0b46e")], 0.6, scale=10, long="X", streak=0.35, bump=0.3)),
        peppercorn(mat("Peppercorn", [(0.35, "#1e140e"), (0.7, "#3b2a1f"), (0.95, "#5c4635")], 0.55, scale=60, bump=0.6, cell=120)),
        bay_leaf(mat("BayLeaf", [(0.15, "#3a4320"), (0.5, "#56602c"), (0.75, "#7a7a40"), (0.95, "#9a8a52")], 0.7, scale=9, bump=0.25)),
        chilli(mat("Chilli", [(0.2, "#3e0805"), (0.55, "#73110a"), (0.85, "#9c2010")], 0.32, scale=8, long="X", streak=0.3, bump=0.5, cell=18),
               mat("ChilliStem", [(0.3, "#4a4420"), (0.7, "#7a6f3a")], 0.7, scale=20, bump=0.3)),
        garlic(mat("Garlic", [(0.3, "#ddd2bc"), (0.65, "#efe7d6"), (0.97, "#d4bdb4")], 0.65, scale=7, long="Z", streak=0.5, bump=0.35),
               mat("GarlicRoot", [(0.3, "#9a8a68"), (0.7, "#c2b08a")], 0.9, scale=30, bump=0.4)),
    ]
    if baked:
        use_gpu()
        for o in obs:
            bake(o, 256 if o.name == "Peppercorn" else 1024)
    return obs


if __name__ == "__main__":
    bpy.ops.wm.read_factory_settings(use_empty=True)
    obs = build_spices()
    for o in obs:
        print(o.name, len(o.data.polygons), "polys", tuple(round(d, 3) for d in o.dimensions))
    export_glb(os.path.join(ROOT, "public", "models", "spices.glb"), obs, export_image_format="JPEG", export_jpeg_quality=88)
