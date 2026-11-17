"""Ozavia gift box.  blender -b --python blender/box.py  ->  public/models/box.glb
Blender Z up, front = -Y, hinge at the back (+Y). 1 unit = 10 cm.
Experience.tsx places jar slots at x = (i-1.5)*(W-0.2)/4, 0.4 above the floor, base end 0.6 toward the front,
and closes the lid by adding LID_CLOSE (1.75 rad) to the exported rotation."""
import bpy, bmesh, math, os, random, sys
from mathutils import Vector, noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jar import principled, srgb, export_glb, TEX, ROOT

W, D = 3.0, 1.5          # outer footprint (2:1, matches box-lid.png)
HB, HL = 0.55, 0.22      # base / lid height
TH = 0.03                # board thickness
LID_OPEN = -1.75         # radians about X; scene adds +1.75 to close
JAR_Y, JAR_R, SLOT = 0.4, 0.31, (W - 0.2) / 4


def tray(name, w, d, h, t, top_tag, bottom_tag):
    """Closed-shell tray open at the top: outer bottom at z=0, inner floor at z=t. Faces tagged for material/UV."""
    bm = bmesh.new()
    def ring(hw, hd, z):
        return [bm.verts.new((x, y, z)) for x, y in ((-hw, -hd), (hw, -hd), (hw, hd), (-hw, hd))]
    o0, oh = ring(w / 2, d / 2, 0), ring(w / 2, d / 2, h)
    i0, ih = ring(w / 2 - t, d / 2 - t, t), ring(w / 2 - t, d / 2 - t, h)
    tags = {}
    tags[bm.faces.new(o0[::-1])] = bottom_tag
    tags[bm.faces.new(i0)] = top_tag
    for a, b in ((o0, oh), (oh, ih), (ih, i0)):
        for k in range(4):
            bm.faces.new((a[k], a[(k + 1) % 4], b[(k + 1) % 4], b[k]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.faces.index_update()
    tagged = {f.index: v for f, v in tags.items()}
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob, tagged


def mat_image(name, img, orm=None, rough=0.7, metal=0.0):
    m, b = principled(name, **{"Roughness": rough, "Metallic": metal})
    nt = m.node_tree
    t = nt.nodes.new("ShaderNodeTexImage")
    t.image = bpy.data.images.load(os.path.join(TEX, img))
    nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    if orm:
        o = nt.nodes.new("ShaderNodeTexImage")
        o.image = bpy.data.images.load(os.path.join(TEX, orm))
        o.image.colorspace_settings.name = "Non-Color"
        s = nt.nodes.new("ShaderNodeSeparateColor")
        nt.links.new(o.outputs["Color"], s.inputs["Color"])
        nt.links.new(s.outputs["Green"], b.inputs["Roughness"])
        nt.links.new(s.outputs["Blue"], b.inputs["Metallic"])
    return m


def box_uv(ob, tagged, print_uv):
    """Box-project every face (paper grain scale), then print_uv(co) on tagged faces."""
    me = ob.data
    uv = me.uv_layers.new(name="UVMap")
    for p in me.polygons:
        n = p.normal
        for li in p.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            if p.index in tagged:
                uv.data[li].uv = print_uv(co)
            elif abs(n.z) > 0.5:
                uv.data[li].uv = (co.x * 4, co.y * 4)
            elif abs(n.x) > 0.5:
                uv.data[li].uv = (co.y * 4, co.z * 4)
            else:
                uv.data[li].uv = (co.x * 4, co.z * 4)
            if p.index in tagged:
                p.material_index = 1


def bevel(ob, w=0.006):
    m = ob.modifiers.new("bevel", "BEVEL")
    m.width, m.segments, m.limit_method = w, 2, "ANGLE"


def make_base(olive):
    ob, tagged = tray("BoxBase", W, D, HB, TH, "floor", "bottom")
    box_uv(ob, {}, None)
    ob.data.materials.append(olive)
    # round emblem on the front face, joined in as a second material
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.13, depth=0.008, location=(0, -D / 2 - 0.004, HB * 0.52), rotation=(math.pi / 2, 0, 0))
    em = bpy.context.object
    me = em.data
    uv = me.uv_layers.active
    for p in me.polygons:
        for li in p.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co   # local: cap in XY plane
            uv.data[li].uv = (co.x / 0.26 + 0.5, co.y / 0.26 + 0.5)
    me.materials.append(mat_image("BoxEmblem", "box-emblem.png", "box-emblem-orm.png"))
    bpy.ops.object.select_all(action="DESELECT")
    em.select_set(True)
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.join()
    bevel(ob)
    return ob


def make_lid(olive, printed):
    ob, tagged = tray("BoxLid", W, D, HL, TH, "ceiling", "top")
    me = ob.data
    # flip so it is open at the bottom, then put the hinge (back-bottom edge) at the origin
    for v in me.vertices:
        v.co.z = HL - v.co.z
        v.co.y -= D / 2
    me.flip_normals()
    # top (outer) reads from the front when closed; ceiling reads from the front when the lid stands open
    box_uv(ob, tagged, lambda co: ((co.x + W / 2) / W, (co.y + D) / D) if co.z > HL - 1e-4 else ((co.x + W / 2) / W, -co.y / D))
    me.materials.append(olive)
    me.materials.append(printed)
    bevel(ob)
    ob.location = (0, D / 2, HB)
    ob.rotation_euler.x = LID_OPEN
    return ob


def surface(x, y):
    """Top of the paper bed at (x, y): a loose mound, pressed into a cradle under each jar."""
    z = 0.29 + 0.03 * noise.noise(Vector((x * 2.5, y * 2.5, 1.0)))
    for i in range(4):
        dx = x - (i - 1.5) * SLOT
        if abs(dx) < JAR_R + 0.04 and -0.62 < -y < 0.67:   # jar spans glTF z -0.65..0.6 => Blender y -0.6..0.65
            cradle = JAR_Y - math.sqrt(max(0.0, (JAR_R + 0.01) ** 2 - dx * dx)) + 0.012
            z = min(z, max(TH + 0.01, cradle))
    return z


def make_crinkle(strips=900, segs=22, seed=4):
    """Crinkle-cut shredded paper: zig-zag folded strips (3.5 mm wide) heaped over a dark bed."""
    rnd = random.Random(seed)
    hw, hd = W / 2 - TH - 0.01, D / 2 - TH - 0.01
    bm = bmesh.new()
    mats = []
    # bed so no box floor shows between strips
    nx, ny = 60, 30
    bed = [[bm.verts.new(((i / nx - 0.5) * 2 * hw, (k / ny - 0.5) * 2 * hd, 0)) for k in range(ny + 1)] for i in range(nx + 1)]
    for row in bed:
        for v in row:
            v.co.z = surface(v.co.x, v.co.y) - 0.035
    for i in range(nx):
        for k in range(ny):
            bm.faces.new((bed[i][k], bed[i + 1][k], bed[i + 1][k + 1], bed[i][k + 1]))
            mats.append(0)
    for _ in range(strips):
        L, wid = rnd.uniform(0.25, 0.55), 0.035
        cx, cy = rnd.uniform(-hw, hw), rnd.uniform(-hd, hd)
        yaw, roll = rnd.uniform(0, math.tau), rnd.uniform(-0.9, 0.9)
        depth = rnd.random() ** 1.5 * 0.07
        bend, phase = rnd.uniform(-0.12, 0.12), rnd.uniform(0, math.tau)
        d = Vector((math.cos(yaw), math.sin(yaw), 0))
        side = Vector((-d.y * math.cos(roll), d.x * math.cos(roll), math.sin(roll)))   # tilted strip plane
        n = d.cross(side).normalized()
        row = []
        for k in range(segs + 1):
            t = k / segs - 0.5
            zig = (abs((k % 2) - 0.5) - 0.25) * 0.024                                   # alternating folds
            c = Vector((cx, cy, 0)) + d * (t * L) + Vector((-d.y, d.x, 0)) * (bend * math.sin(t * 3 + phase))
            c.x, c.y = max(-hw, min(hw, c.x)), max(-hd, min(hd, c.y))
            c.z = surface(c.x, c.y) - depth
            c += n * zig
            row.append((bm.verts.new(c - side * wid / 2), bm.verts.new(c + side * wid / 2)))
        m = 1 if rnd.random() < 0.7 else 2
        for k in range(segs):
            bm.faces.new((row[k][0], row[k + 1][0], row[k + 1][1], row[k][1]))
            mats.append(m)
    me = bpy.data.meshes.new("Crinkle")
    bm.to_mesh(me)
    bm.free()
    for p, m in zip(me.polygons, mats):
        p.material_index = m
    ob = bpy.data.objects.new("Crinkle", me)
    bpy.context.scene.collection.objects.link(ob)
    for name, hexs, rough, metal in (("CrinkleBed", "#6e5a36", 0.9, 0.0), ("CrinkleGold", "#c9a862", 0.45, 0.45), ("CrinkleCream", "#ebe0c6", 0.75, 0.0)):
        me.materials.append(principled(name, **{"Base Color": srgb(hexs), "Roughness": rough, "Metallic": metal})[0])
    return ob


def olive_material():
    """Olive board with a tileable linen-emboss normal map (one tile = 2.5 cm, see box_uv)."""
    import numpy as np
    N, f = 512, 48
    rng = np.random.default_rng(7)
    fx = np.fft.fftfreq(N)
    def blur(sig):
        g = np.exp(-2 * (np.pi * sig) ** 2 * (fx[:, None] ** 2 + fx[None, :] ** 2))
        a = np.real(np.fft.ifft2(np.fft.fft2(rng.standard_normal((N, N))) * g))
        return a / a.std()
    u = np.arange(N) / N
    warp = np.sin(2 * np.pi * f * (u[None, :] + 0.004 * blur(20)))
    weft = np.sin(2 * np.pi * f * (u[:, None] + 0.004 * blur(20)))
    h = 0.5 * (np.maximum(warp, 0) + np.maximum(weft, 0)) * (0.8 + 0.2 * blur(6)) + 0.25 * blur(1.2)
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5
    dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 0.5
    nrm = np.stack([-dx * 0.6, -dy * 0.6, np.ones_like(h)], -1)
    nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
    img = bpy.data.images.new("box-linen-normal", N, N, alpha=False)
    img.colorspace_settings.name = "Non-Color"
    img.pixels.foreach_set(np.concatenate([nrm * 0.5 + 0.5, np.ones((N, N, 1))], -1).astype(np.float32).ravel())
    img.file_format = "PNG"
    m, b = principled("BoxOlive", **{"Base Color": srgb("#3a3f2a"), "Roughness": 0.78})
    nt = m.node_tree
    t = nt.nodes.new("ShaderNodeTexImage")
    t.image = img
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = 0.6
    nt.links.new(t.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    return m


if __name__ == "__main__":
    bpy.ops.wm.read_factory_settings(use_empty=True)
    olive = olive_material()
    printed = mat_image("BoxPrint", "box-lid.png", "box-lid-orm.png")
    obs = [make_base(olive), make_lid(olive, printed), make_crinkle()]
    for o in obs:
        print(o.name, len(o.data.polygons), "polys", tuple(round(d, 3) for d in o.dimensions))
    os.makedirs(os.path.join(ROOT, "public", "models"), exist_ok=True)
    export_glb(os.path.join(ROOT, "public", "models", "box.glb"), obs)
