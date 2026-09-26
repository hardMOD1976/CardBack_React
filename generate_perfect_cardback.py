import math

# Dimensions
# baseline: y = 165
# x-height: 85 (y: 80..165, cy = 122.5)
# ascender: y = 35..165 (height 130)
# stroke: 24
# R = 42.5, r = 18.5

cy = 122.5
R = 42.5
r = 18.5
W = 24.0

def make_slot(cx, cy, s=0.9):
    # Width ~66, height ~18, notch height ~12
    w_pill = 33 * s
    h_pill = 8 * s
    w_notch = 11 * s
    h_notch = 11 * s
    
    return (
        f"M {cx - w_pill:.1f} {cy + h_pill:.1f} "
        f"A {h_pill:.1f} {h_pill:.1f} 0 0 1 {cx - w_pill:.1f} {cy - h_pill:.1f} "
        f"L {cx - w_notch - 3*s:.1f} {cy - h_pill:.1f} "
        f"Q {cx - w_notch:.1f} {cy - h_pill:.1f} {cx - w_notch:.1f} {cy - h_pill - 2*s:.1f} "
        f"L {cx - w_notch:.1f} {cy - h_notch:.1f} "
        f"Q {cx - w_notch:.1f} {cy - h_notch - 3*s:.1f} {cx - w_notch + 3*s:.1f} {cy - h_notch - 3*s:.1f} "
        f"L {cx + w_notch - 3*s:.1f} {cy - h_notch - 3*s:.1f} "
        f"Q {cx + w_notch:.1f} {cy - h_notch - 3*s:.1f} {cx + w_notch:.1f} {cy - h_notch:.1f} "
        f"L {cx + w_notch:.1f} {cy - h_pill - 2*s:.1f} "
        f"Q {cx + w_notch:.1f} {cy - h_pill:.1f} {cx + w_notch + 3*s:.1f} {cy - h_pill:.1f} "
        f"L {cx + w_pill:.1f} {cy - h_pill:.1f} "
        f"A {h_pill:.1f} {h_pill:.1f} 0 0 1 {cx + w_pill:.1f} {cy + h_pill:.1f} "
        f"Z"
    )

def path_c(cx):
    # Circular 'c' with horizontal cuts at right
    ang = math.radians(38)
    ox1 = cx + R * math.cos(ang)
    oy1 = cy + R * math.sin(ang)
    ox2 = cx + R * math.cos(ang)
    oy2 = cy - R * math.sin(ang)
    ix1 = cx + r * math.cos(ang)
    iy1 = cy + r * math.sin(ang)
    ix2 = cx + r * math.cos(ang)
    iy2 = cy - r * math.sin(ang)
    return (
        f"M {ox1:.1f} {oy1:.1f} "
        f"A {R} {R} 0 1 1 {ox2:.1f} {oy2:.1f} "
        f"L {ix2:.1f} {iy2:.1f} "
        f"A {r} {r} 0 1 0 {ix1:.1f} {iy1:.1f} "
        f"Z"
    )

def path_a(cx):
    # Single-story 'a': circle bowl + tangent vertical right stem
    # Bowl
    bowl = (
        f"M {cx} {cy - R} "
        f"A {R} {R} 0 1 0 {cx} {cy + R} "
        f"A {R} {R} 0 1 0 {cx} {cy - R} "
        f"Z "
        f"M {cx} {cy - r} "
        f"A {r} {r} 0 1 1 {cx} {cy + r} "
        f"A {r} {r} 0 1 1 {cx} {cy - r} "
        f"Z"
    )
    # Right stem from y=80 to y=165, x from cx + R - W to cx + R
    stem = f"M {cx + R - W:.1f} 80 L {cx + R:.1f} 80 L {cx + R:.1f} 165 L {cx + R - W:.1f} 165 Z"
    return bowl + " " + stem

def path_r(x_start):
    # Stem + upper rounded arch
    # Stem: x from x_start to x_start + W, y from 80 to 165
    stem = f"M {x_start:.1f} 80 L {x_start + W:.1f} 80 L {x_start + W:.1f} 165 L {x_start:.1f} 165 Z"
    # Arch: from x_start + W to x_start + W + 26
    # Outer radius = 26, inner radius = 26 - W = 2
    x_arc = x_start + W
    arch = (
        f"M {x_arc:.1f} 104 "
        f"L {x_arc:.1f} 80 "
        f"L {x_arc + 6:.1f} 80 "
        f"A 24 24 0 0 1 {x_arc + 30:.1f} 104 "
        f"L {x_arc + 30 - W:.1f} 104 "
        f"A 6 6 0 0 0 {x_arc + 6:.1f} 98 "
        f"L {x_arc:.1f} 98 "
        f"Z"
    )
    return stem + " " + arch

def path_d(cx):
    # Left bowl + right vertical ascender stem
    bowl = (
        f"M {cx} {cy - R} "
        f"A {R} {R} 0 1 0 {cx} {cy + R} "
        f"A {R} {R} 0 1 0 {cx} {cy - R} "
        f"Z "
        f"M {cx} {cy - r} "
        f"A {r} {r} 0 1 1 {cx} {cy + r} "
        f"A {r} {r} 0 1 1 {cx} {cy - r} "
        f"Z"
    )
    stem = f"M {cx + R - W:.1f} 35 L {cx + R:.1f} 35 L {cx + R:.1f} 165 L {cx + R - W:.1f} 165 Z"
    return bowl + " " + stem

def path_b(cx):
    # Left vertical ascender stem + right bowl
    bowl = (
        f"M {cx} {cy - R} "
        f"A {R} {R} 0 1 1 {cx} {cy + R} "
        f"A {R} {R} 0 1 1 {cx} {cy - R} "
        f"Z "
        f"M {cx} {cy - r} "
        f"A {r} {r} 0 1 0 {cx} {cy + r} "
        f"A {r} {r} 0 1 0 {cx} {cy - r} "
        f"Z"
    )
    stem = f"M {cx - R:.1f} 35 L {cx - R + W:.1f} 35 L {cx - R + W:.1f} 165 L {cx - R:.1f} 165 Z"
    return bowl + " " + stem

def path_k(x_start):
    # Stem: y=35..165
    stem = f"M {x_start:.1f} 35 L {x_start + W:.1f} 35 L {x_start + W:.1f} 165 L {x_start:.1f} 165 Z"
    # Diagonal arms
    # Upper arm from (x_start + 18, 120) to (x_start + 65, 80)
    # Lower arm from (x_start + 32, 108) to (x_start + 70, 165)
    diag = (
        f"M {x_start + 16:.1f} 125 "
        f"L {x_start + 45:.1f} 80 "
        f"L {x_start + 72:.1f} 80 "
        f"L {x_start + 34:.1f} 125 "
        f"L {x_start + 75:.1f} 165 "
        f"L {x_start + 46:.1f} 165 "
        f"L {x_start + 16:.1f} 125 "
        f"Z"
    )
    return stem + " " + diag

# Horizontal positions
cx_c1 = 48
cx_a1 = cx_c1 + R + 10 + R # 48 + 42.5 + 10 + 42.5 = 143
x_r1 = cx_a1 + R + 10 # 143 + 42.5 + 10 = 195.5
w_r1 = 54

# Card positioning:
card_x = x_r1 + w_r1 + 10 # 195.5 + 54 + 10 = 259.5
card_pad = 14
cx_d = card_x + card_pad + R # 259.5 + 14 + 42.5 = 316

# Gap between d stem and b stem:
# d stem ends at cx_d + R = 358.5
# b stem begins at cx_b - R.
# Let gap be 20px -> cx_b - R = 358.5 + 20 = 378.5 -> cx_b = 421
cx_b = 421
card_end = cx_b + R + card_pad # 421 + 42.5 + 14 = 477.5
card_w = card_end - card_x # 218
card_cx = (card_x + card_end) / 2 # 368.5

# Card vertical:
card_y = 6
card_h = 172 # down to 178
card_rx = 16

slot_path = make_slot(card_cx, 28, s=1.05)

# After card:
cx_a2 = card_end + 10 + R # 477.5 + 10 + 42.5 = 530
cx_c2 = cx_a2 + R + 10 + R # 530 + 95 = 625
x_k2 = cx_c2 + R + 10 # 625 + 52.5 = 677.5
total_w = x_k2 + 76 + 15 # ~768.5

print(f"Computed total_w: {total_w}, card_cx: {card_cx}")

svg_full = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 770 190" fill="none">
  <!-- Official Cardback Logo (POS_blue) -->
  <g class="cb-letters" fill="#000B76">
    <!-- 'c' (car) -->
    <path d="{path_c(cx_c1)}" />
    <!-- 'a' (car) -->
    <path d="{path_a(cx_a1)}" />
    <!-- 'r' (car) -->
    <path d="{path_r(x_r1)}" />
  </g>

  <!-- Central Blister Cardback with rounded corners -->
  <rect x="{card_x:.1f}" y="{card_y:.1f}" width="{card_w:.1f}" height="{card_h:.1f}" rx="{card_rx}" fill="#000B76" class="cb-card" />

  <!-- Inside Central Card: Euro Hanger Punch Hole & 'db' in crisp White -->
  <g fill="#FFFFFF" class="cb-card-content">
    <!-- Euro Hanger Slot -->
    <path d="{slot_path}" />
    <!-- 'd' letter inside card -->
    <path d="{path_d(cx_d)}" />
    <!-- 'b' letter inside card -->
    <path d="{path_b(cx_b)}" />
  </g>

  <g class="cb-letters" fill="#000B76">
    <!-- 'a' (ack) -->
    <path d="{path_a(cx_a2)}" />
    <!-- 'c' (ack) -->
    <path d="{path_c(cx_c2)}" />
    <!-- 'k' (ack) -->
    <path d="{path_k(x_k2)}" />
  </g>
</svg>"""

with open("public/cardback-logo.svg", "w") as f:
    f.write(svg_full)

# Also generate the Mark logo (NEG_blue)
# Centered around cx_d and cx_b, with the slot directly above:
mark_w = card_w + 20
mark_offset = card_x - 10
mark_slot = make_slot(card_cx - mark_offset, 32, s=1.1)

svg_mark = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {mark_w:.1f} 190" fill="none">
  <!-- Official Cardback Mark (NEG_blue) -->
  <g fill="#4739F5" class="cb-mark-content">
    <!-- Floating Euro Hanger Slot -->
    <path d="{mark_slot}" />
    <!-- 'd' -->
    <path d="{path_d(cx_d - mark_offset)}" />
    <!-- 'b' -->
    <path d="{path_b(cx_b - mark_offset)}" />
  </g>
</svg>"""

with open("public/cardback-mark.svg", "w") as f:
    f.write(svg_mark)

with open("public/favicon.svg", "w") as f:
    f.write(svg_mark)

print("Successfully wrote public/cardback-logo.svg and public/cardback-mark.svg")
