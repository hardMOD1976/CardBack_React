import math

# Let's parameterize the geometric glyphs for maximum precision:
# Let's set:
# baseline = 180
# x-height = 100 -> top of lowercase = 80
# ascender height = 150 -> top of ascender = 30
# stroke width W = 28
# bowl outer diameter = 100, so outer radius R = 50. Inner radius r = 50 - 28 = 22.

def get_c(cx, cy):
    # cx, cy is center of bowl (cy = 130)
    # Circle outer R=50, inner r=22
    # Aperture on right: angle from -35 deg to +35 deg
    # In SVG path:
    # Outer arc from angle +35 to angle -35 (going counter-clockwise around left)
    # Then line to inner radius, then inner arc clockwise back to +35, then close
    a_rad = math.radians(36)
    ox1 = cx + 50 * math.cos(a_rad)
    oy1 = cy + 50 * math.sin(a_rad)
    ox2 = cx + 50 * math.cos(a_rad)
    oy2 = cy - 50 * math.sin(a_rad)
    
    ix1 = cx + 22 * math.cos(a_rad)
    iy1 = cy + 22 * math.sin(a_rad)
    ix2 = cx + 22 * math.cos(a_rad)
    iy2 = cy - 22 * math.sin(a_rad)
    
    return f"M {ox1:.1f} {oy1:.1f} A 50 50 0 1 1 {ox2:.1f} {oy2:.1f} L {ix2:.1f} {iy2:.1f} A 22 22 0 1 0 {ix1:.1f} {iy1:.1f} Z"

print("c test path:", get_c(100, 130))
