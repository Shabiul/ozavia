"""Ozavia spice jar.  blender -b --python blender/jar.py  ->  public/models/jar.glb
Units: 1 = 10 cm. Blender Z up / front = -Y, exported glTF Y up / front = +Z.
Also imported by box.py and render_stills.py (build_jar)."""
import bpy, bmesh, math, os, sys
from mathutils import Vector, Matrix, noise

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
TEX = os.path.join(ROOT, "public", "textures")

# ---- dimensions -------------------------------------------------------------
R = 0.31            # body outer radius
T = 0.022           # wall thickness
BASE = 0.075        # heavy base thickness
ZS0, ZS1 = 0.92, 1.03   # shoulder start / end
RN, RNI = 0.235, 0.213  # neck outer / inner radius
LIP = 1.195
LID_Z0, LID_Z1 = 1.045, 1.25
LID_R = 0.263
LABEL_R, LABEL_Z0, LABEL_H = 0.3115, 0.19, 0.70   # keep in sync with build_labels.mjs
SPICE_TOP = 0.985
SPICE_TILE = 2 * math.pi * 0.2855 / 6             # one texture tile = ~3 cm
SEGS = 96
RIBS = 80


def lathe(name, profile, segs, mod=None, closed=True):
    """Revolve [(r, z, tag?)] about Z. Returns (obj, corner_info) where corner_info maps
    face index -> [(i, j)] profile/column index per corner (j may equal segs, for seam UVs)."""
    bm = bmesh.new()
    rows = []
    for i, p in enumerate(profile):
        r, z = p[0], p[1]
        tag = p[2] if len(p) > 2 else None
        if r == 0:
            rows.append([bm.verts.new((0, 0, z))])
            continue
        ring = []
        for j in range(segs):
            th = 2 * math.pi * j / segs
            rr, zz = mod(r, z, tag, th, j) if (mod and tag) else (r, z)
            ring.append(bm.verts.new((-rr * math.sin(th), rr * math.cos(th), zz)))   # j=0 at +Y (back)
        rows.append(ring)
    info = []
    for i in range(len(rows) - 1):
        a, b = rows[i], rows[i + 1]
        for j in range(segs):
            k = (j + 1) % segs
            if len(a) == 1 and len(b) == 1:
                continue
            if len(a) == 1:
                vs, ij = [a[0], b[j], b[k]], [(i, j), (i + 1, j), (i + 1, j + 1)]
            elif len(b) == 1:
                vs, ij = [a[j], b[0], a[k]], [(i, j), (i + 1, j), (i, j + 1)]
            else:
                vs, ij = [a[j], b[j], b[k], a[k]], [(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)]
            f = bm.faces.new(vs)
            f.smooth = True
            info.append(ij)
    if closed:
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.verts.index_update()
    bm.faces.index_update()
    me = bpy.data.meshes.new(name)
    # recalc may flip winding; record corner info by vertex identity instead of order
    vkey = {}
    for f, ij in zip(bm.faces, info):
        for l, c in zip(f.loops, ij):
            vkey[(f.index, l.vert.index)] = c
    bm.to_mesh(me)
    bm.free()
    corner = [vkey[(p.index, me.loops[li].vertex_index)] for p in me.polygons for li in p.loop_indices]
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob, corner


def arc(cx, cz, rad, a0, a1, n):
    return [(cx + rad * math.cos(math.radians(a0 + (a1 - a0) * k / n)),
             cz + rad * math.sin(math.radians(a0 + (a1 - a0) * k / n))) for k in range(n + 1)]


def shoulder(r_body, r_neck, z0, z1, n=10):
    return [(r_neck + (r_body - r_neck) * math.cos(math.pi / 2 * k / n),
             z0 + (z1 - z0) * math.sin(math.pi / 2 * k / n)) for k in range(n + 1)]


def make_glass():
    P = [(0, 0.012), (0.18, 0.008), (0.262, 0.0)]
    P += arc(R - 0.03, 0.03, 0.03, -90, 0, 6)
    P += shoulder(R, RN, ZS0, ZS1)
    P += [(RN, 1.062)]
    P += [(RN, 1.066 + 0.1 * k / 28, "thread") for k in range(29)]
    P += [(RN, 1.172), (RN, LIP - 0.01), (RN - 0.003, LIP - 0.003), (RN - 0.011, LIP), (RNI + 0.003, LIP - 0.003), (RNI, LIP - 0.01)]
    P += [(RNI, ZS1 - 0.008)]
    P += shoulder(R - T, RNI, ZS0, ZS1 - 0.012)[::-1][1:]
    P += [(a, b) for a, b in arc(R - T - 0.03, BASE + 0.03, 0.03, 0, -90, 6)]
    P += [(0, BASE)]

    def thread(r, z, tag, th, j):
        p = ((z - 1.066) / 0.036 + th / (2 * math.pi)) % 1.0
        fade = min(1.0, (z - 1.066) / 0.012, (1.166 - z) / 0.012)
        return r + 0.0085 * max(0.0, fade) * math.exp(-((p - 0.5) / 0.17) ** 2), z

    ob, _ = lathe("Glass", P, SEGS, thread)
    return ob


def make_lid():
    k = "knurl"
    P = [(0, 1.240), (0.212, 1.240), (0.224, 1.2415), (0.232, 1.246), (0.240, 1.2495), (0.248, 1.2495),
         (0.255, 1.246), (0.260, 1.240), (0.2625, 1.232), (LID_R, 1.222), (LID_R, 1.213),
         (LID_R, 1.206, k), (LID_R, 1.076, k), (LID_R, 1.069),
         (0.2655, 1.063), (0.2670, 1.056), (0.2655, 1.049), (0.262, 1.0455), (0.256, LID_Z0), (0.250, 1.047),
         (0.247, 1.053), (0.247, 1.220), (0.240, 1.228), (0, 1.228)]

    def knurl(r, z, tag, th, j):
        return r + 0.0032 * (abs((j % 4) - 2) - 1), z     # +,0,-,0 zigzag: 4 segments per rib

    ob, _ = lathe("Lid", P, RIBS * 4, knurl)
    ob.data.transform(Matrix.Translation((0, 0, -LID_Z0)))   # origin = centre of the bottom edge
    ob.location.z = LID_Z0
    return ob


def make_label():
    ob, corner = lathe("Label", [(LABEL_R, LABEL_Z0), (LABEL_R, LABEL_Z0 + LABEL_H)], SEGS, closed=False)
    me = ob.data
    if me.polygons[0].normal.dot(Vector(me.polygons[0].center.xy.to_3d())) < 0:
        me.flip_normals()
        corner = [vk for p in me.polygons for vk in corner[p.loop_start:p.loop_start + p.loop_total]]
    uv = me.uv_layers.new(name="UVMap")
    # recompute per-loop from geometry (robust to winding flips): U from angle, seam at +Y (back)
    for p in me.polygons:
        ang = [math.atan2(-me.vertices[me.loops[li].vertex_index].co.x, me.vertices[me.loops[li].vertex_index].co.y) % (2 * math.pi) for li in p.loop_indices]
        wrap = max(ang) - min(ang) > math.pi
        for li, a in zip(p.loop_indices, ang):
            if wrap and a < math.pi:
                a += 2 * math.pi
            z = me.vertices[me.loops[li].vertex_index].co.z
            uv.data[li].uv = (a / (2 * math.pi), (z - LABEL_Z0) / LABEL_H)
    return ob


def make_spice():
    rs = R - T - 0.0025
    P = [(0, BASE + 0.002)] + arc(rs - 0.03, BASE + 0.032, 0.03, -90, 0, 5)
    P += [(rs, BASE + 0.032 + (ZS0 - BASE - 0.032) * k / 6) for k in range(1, 6)]
    for r, z in shoulder(R - T, RNI, ZS0, ZS1 - 0.012, 14):
        if z < SPICE_TOP:
            P.append((r - 0.0025, z))
    rt = P[-1][0]
    P += [(rt * (1 - k / 14), SPICE_TOP, "top") for k in range(0, 14)] + [(0, SPICE_TOP, "c")]

    def top(r, z, tag, th, j):
        x, y = -r * math.sin(th), r * math.cos(th)
        edge = min(1.0, (rt - r) / 0.04)
        n = noise.noise(Vector((x * 9, y * 9, 0.3))) * 0.016 + noise.noise(Vector((x * 30, y * 30, 2.0))) * 0.006
        return r, z + edge * (n + 0.008)

    ob, _ = lathe("Spice", P, SEGS, top)
    me = ob.data
    c = [v for v in me.vertices if abs(v.co.x) < 1e-6 and abs(v.co.y) < 1e-6 and v.co.z > 0.5][0]
    c.co.z = SPICE_TOP + 0.012
    uv = me.uv_layers.new(name="UVMap")
    for p in me.polygons:
        side = abs(p.normal.z) < 0.6
        ang = [math.atan2(-me.vertices[me.loops[li].vertex_index].co.x, me.vertices[me.loops[li].vertex_index].co.y) % (2 * math.pi) for li in p.loop_indices]
        wrap = max(ang) - min(ang) > math.pi
        for li, a in zip(p.loop_indices, ang):
            co = me.vertices[me.loops[li].vertex_index].co
            if side:
                if wrap and a < math.pi:
                    a += 2 * math.pi
                uv.data[li].uv = (a / (2 * math.pi) * 6, co.z / SPICE_TILE)
            else:
                uv.data[li].uv = (co.x / SPICE_TILE + 0.5, co.y / SPICE_TILE + 0.5)
    return ob


# ---- export materials (plain Principled so the glTF exporter maps them 1:1) ---
def principled(name, **kw):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    for k, v in kw.items():
        b.inputs[k].default_value = v
    return m, b


def srgb(hexs, a=1.0):
    h = hexs.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [a]


def gltf_thickness(mat, thickness):
    """KHR_materials_volume: the exporter reads 'Thickness' from a 'glTF Material Output' group node."""
    g = bpy.data.node_groups.get("glTF Material Output")
    if not g:
        g = bpy.data.node_groups.new("glTF Material Output", "ShaderNodeTree")
        g.interface.new_socket("Occlusion", in_out="INPUT", socket_type="NodeSocketFloat")
        s = g.interface.new_socket("Thickness", in_out="INPUT", socket_type="NodeSocketFloat")
        g.nodes.new("NodeGroupInput")
    n = mat.node_tree.nodes.new("ShaderNodeGroup")
    n.node_tree = g
    n.inputs["Thickness"].default_value = thickness


def export_materials(label_id="garam"):
    glass, b = principled("Glass", **{"Base Color": (1, 1, 1, 1), "Roughness": 0.03, "IOR": 1.5, "Transmission Weight": 1.0})
    gltf_thickness(glass, T)
    lid, _ = principled("LidGold", **{"Base Color": srgb("#d9b25f"), "Metallic": 1.0, "Roughness": 0.3})
    label, b = principled("LabelPaper", **{"Roughness": 0.85, "Specular IOR Level": 0.3})
    img = bpy.data.images.load(os.path.join(TEX, f"label-{label_id}.png"))
    t = label.node_tree.nodes.new("ShaderNodeTexImage")
    t.image = img
    label.node_tree.links.new(t.outputs["Color"], b.inputs["Base Color"])
    spice, _ = principled("Spice", **{"Base Color": srgb("#7a4a26"), "Roughness": 1.0})
    return {"Glass": glass, "Lid": lid, "Label": label, "Spice": spice}


def build_jar(mats=None):
    """Create the four objects at the world origin; returns {name: object}."""
    obs = {"Glass": make_glass(), "Lid": make_lid(), "Label": make_label(), "Spice": make_spice()}
    if mats:
        for k, o in obs.items():
            o.data.materials.append(mats[k])
    return obs


def export_glb(path, objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_selection=True, export_yup=True, export_apply=True,
        export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14, export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12, export_image_format="AUTO", export_animations=False)
    print("exported", path, os.path.getsize(path), "bytes")


if __name__ == "__main__":
    bpy.ops.wm.read_factory_settings(use_empty=True)
    obs = build_jar(export_materials("garam"))
    for o in obs.values():
        print(o.name, len(o.data.polygons), "polys")
    os.makedirs(os.path.join(ROOT, "public", "models"), exist_ok=True)
    export_glb(os.path.join(ROOT, "public", "models", "jar.glb"), obs.values())
