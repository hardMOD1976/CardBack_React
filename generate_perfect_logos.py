import math

# Baseline = 180
# x-height = 100 (y: 80..180)
# Ascender height = 150 (y: 30..180)
# W (stroke width) = 27
# R (outer radius) = 50, r (inner radius) = 23

def make_euro_slot(cx, cy, s=1.0):
    # Standard euro-slot punch hole
    # Base pill width = 76*s, height = 22*s
    # Top peg notch width = 28*s, height = 14*s
    w_pill = 38 * s
    h_pill = 10 * s
    w_notch = 14 * s
    h_notch = 13 * s
    
    return (
        f"M {cx - w_pill:.1f} {cy + h_pill:.1f} "
        f"A {h_pill:.1f} {h_pill:.1f} 0 0 1 {cx - w_pill:.1f} {cy - h_pill:.1f} "
        f"L {cx - w_notch - 4*s:.1f} {cy - h_pill:.1f} "
        f"Q {cx - w_notch:.1f} {cy - h_pill:.1f} {cx - w_notch:.1f} {cy - h_pill - 3*s:.1f} "
        f"L {cx - w_notch:.1f} {cy - h_notch:.1f} "
        f"Q {cx - w_notch:.1f} {cy - h_notch - 4*s:.1f} {cx - w_notch + 4*s:.1f} {cy - h_notch - 4*s:.1f} "
        f"L {cx + w_notch - 4*s:.1f} {cy - h_notch - 4*s:.1f} "
        f"Q {cx + w_notch:.1f} {cy - h_notch - 4*s:.1f} {cx + w_notch:.1f} {cy - h_notch:.1f} "
        f"L {cx + w_notch:.1f} {cy - h_pill - 3*s:.1f} "
        f"Q {cx + w_notch:.1f} {cy - h_pill:.1f} {cx + w_notch + 4*s:.1f} {cy - h_pill:.1f} "
        f"L {cx + w_pill:.1f} {cy - h_pill:.1f} "
        f"A {h_pill:.1f} {h_pill:.1f} 0 0 1 {cx + w_pill:.1f} {cy + h_pill:.1f} "
        f"Z"
    )

# Coordinates for 'cardback'
# Letter centers / positions:
# spacing:
gap = 14

# 'c': cx = 55
cx_c1 = 55
# 'a': cx = cx_c1 + 50 + gap + 50 = 169
cx_a1 = 170
# 'r': stem at cx_a1 + 50 + gap = 234
x_r = 234
w_r = 60 # total width of 'r' ~60

# Between 'r' and card:
x_card_start = x_r + w_r + gap # 234 + 60 + 14 = 308

# Card contains 'd' and 'b'
card_padding = 16
cx_d = x_card_start + card_padding + 50 # 308 + 16 + 50 = 374
# 'd' right stem is at cx_d + 23 .. cx_d + 50 (397 .. 424)
# Between d stem and b stem, let gap be 22
# 'b' left stem is at cx_b - 50 .. cx_b - 23
# So cx_b - 50 = 424 + 22 = 446 -> cx_b = 496
cx_b = 496
# 'b' ends at cx_b + 50 = 546
x_card_end = 546 + card_padding # 562
card_w = x_card_end - x_card_start # 562 - 308 = 254
card_cx = (x_card_start + x_card_end) / 2 # 435

# Card vertical:
card_y = -8
card_h = 208 # goes down to 200
card_rx = 22

# Euro slot inside card:
slot_cx = card_cx
slot_cy = 28
slot_path = make_euro_slot(slot_cx, slot_cy, s=1.15)

# After card:
cx_a2 = x_card_end + gap + 50 # 562 + 14 + 50 = 626
cx_c2 = cx_a2 + 50 + gap + 50 # 626 + 64 = 740
x_k = cx_c2 + 50 + gap # 740 + 64 = 804
w_k = 80
total_w = x_k + w_k + 20 # ~904

print(f"Total width: {total_w}, card: x={x_card_start}..{x_card_end} (cx={card_cx})")
