# Let's generate the complete full logo SVG (viewBox 0 0 760 220)
# Baseline is at y = 160
# x-height is 80 (y from 80 to 160)
# Ascenders ('k') go to y = 40
# Card goes from y = 16 to y = 184 (height 168, width 180), rx=18 ry=18

def slot_path(cx, cy, s=1.1):
    return (
        f"M {cx - 28*s:.1f} {cy + 9*s:.1f} "
        f"A {9*s:.1f} {9*s:.1f} 0 0 1 {cx - 28*s:.1f} {cy - 9*s:.1f} "
        f"L {cx - 15*s:.1f} {cy - 9*s:.1f} "
        f"C {cx - 12*s:.1f} {cy - 9*s:.1f} {cx - 12*s:.1f} {cy - 12*s:.1f} {cx - 12*s:.1f} {cy - 13*s:.1f} "
        f"L {cx - 12*s:.1f} {cy - 15*s:.1f} "
        f"C {cx - 12*s:.1f} {cy - 18*s:.1f} {cx - 8*s:.1f} {cy - 18*s:.1f} {cx - 6*s:.1f} {cy - 18*s:.1f} "
        f"L {cx + 6*s:.1f} {cy - 18*s:.1f} "
        f"C {cx + 8*s:.1f} {cy - 18*s:.1f} {cx + 12*s:.1f} {cy - 18*s:.1f} {cx + 12*s:.1f} {cy - 15*s:.1f} "
        f"L {cx + 12*s:.1f} {cy - 13*s:.1f} "
        f"C {cx + 12*s:.1f} {cy - 12*s:.1f} {cx + 12*s:.1f} {cy - 9*s:.1f} {cx + 15*s:.1f} {cy - 9*s:.1f} "
        f"L {cx + 28*s:.1f} {cy - 9*s:.1f} "
        f"A {9*s:.1f} {9*s:.1f} 0 0 1 {cx + 28*s:.1f} {cy + 9*s:.1f} "
        f"Z"
    )

# Geometry of "car"
# baseline = 160, x-height = 80 (top = 80)
# 'c': center x=50, y=120, outer R=40, inner r=18, gap on right
# 'a': center x=135, y=120, outer R=40, inner r=18, right stem from x=157 to 175, y=80..160
# 'r': stem at x=205..227, y=80..160, arch to x=255, y=80

# Card silhouette:
# x from 270 to 450 (cx=360, width=180, height=176, y from 16 to 192, rx=20)
# Card contains:
# - slot at cx=360, cy=44
# - 'd': stem at x=344..364, y=65..160. bowl cx=322, cy=120, R=38, r=17
# - 'b': stem at x=376..396, y=65..160. bowl cx=398, cy=120, R=38, r=17

# Geometry of "ack"
# 'a': center x=495, y=120
# 'c': center x=580, y=120
# 'k': stem at x=640..662, y=36..160, arms up to x=715, y=80, down to x=725, y=160

svg_card_slot = slot_path(360, 44, s=1.0)

full_logo_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 210" fill="none">
  <!-- Official Cardback Full Logo -->
  <g fill="currentColor">
    <!-- 'c' (car) -->
    <path fill-rule="evenodd" clip-rule="evenodd" d="
      M 75 92
      C 67 84 57 80 46 80
      C 24 80 6 98 6 120
      C 6 142 24 160 46 160
      C 57 160 67 156 75 148
      L 63 134
      C 58 139 52 142 46 142
      C 34 142 24 132 24 120
      C 24 108 34 98 46 98
      C 52 98 58 101 63 106
      Z
    " />

    <!-- 'a' (car) -->
    <path fill-rule="evenodd" clip-rule="evenodd" d="
      M 160 80
      L 160 160
      L 142 160
      L 142 148
      C 136 156 126 160 115 160
      C 93 160 76 142 76 120
      C 76 98 93 80 115 80
      C 126 80 136 84 142 92
      L 142 80
      Z
      M 118 98
      C 106 98 96 108 96 120
      C 96 132 106 142 118 142
      C 130 142 142 132 142 120
      C 142 108 130 98 118 98
      Z
    " />

    <!-- 'r' (car) -->
    <path d="
      M 178 80
      L 197 80
      L 197 94
      C 202 85 212 80 224 80
      C 229 80 234 81 238 83
      L 233 101
      C 229 99 225 98 221 98
      C 208 98 197 109 197 122
      L 197 160
      L 178 160
      Z
    " />

    <!-- Central Blister Cardback Silhouette -->
    <!-- Card container with knockout punch hole & 'db' -->
    <path fill-rule="evenodd" clip-rule="evenodd" d="
      M 264 22
      C 255 22 248 29 248 38
      L 248 180
      C 248 189 255 196 264 196
      L 456 196
      C 465 196 472 189 472 180
      L 472 38
      C 472 29 465 22 456 22
      Z

      <!-- Knockout Hanger Slot -->
      {svg_card_slot}

      <!-- Knockout 'd' stem -->
      M 344 65
      L 364 65
      L 364 160
      L 344 160
      Z

      <!-- Knockout 'd' bowl -->
      M 346 80
      A 40 40 0 1 0 346 160
      Z
      M 346 98
      A 22 22 0 1 1 346 142
      Z

      <!-- Knockout 'b' stem -->
      M 368 65
      L 388 65
      L 388 160
      L 368 160
      Z

      <!-- Knockout 'b' bowl -->
      M 386 80
      A 40 40 0 1 1 386 160
      Z
      M 386 98
      A 22 22 0 1 0 386 142
      Z
    " />

    <!-- 'a' (ack) -->
    <path fill-rule="evenodd" clip-rule="evenodd" d="
      M 564 80
      L 564 160
      L 546 160
      L 546 148
      C 540 156 530 160 519 160
      C 497 160 480 142 480 120
      C 480 98 497 80 519 80
      C 530 80 540 84 546 92
      L 546 80
      Z
      M 522 98
      C 510 98 500 108 500 120
      C 500 132 510 142 522 142
      C 534 142 546 132 546 120
      C 546 108 534 98 522 98
      Z
    " />

    <!-- 'c' (ack) -->
    <path fill-rule="evenodd" clip-rule="evenodd" d="
      M 651 92
      C 643 84 633 80 622 80
      C 600 80 582 98 582 120
      C 582 142 600 160 622 160
      C 633 160 643 156 651 148
      L 639 134
      C 634 139 628 142 622 142
      C 610 142 600 132 600 120
      C 600 108 610 98 622 98
      C 628 98 634 101 639 106
      Z
    " />

    <!-- 'k' (ack) -->
    <path d="
      M 668 40
      L 688 40
      L 688 106
      L 714 80
      L 739 80
      L 704 114
      L 742 160
      L 718 160
      L 688 123
      L 688 160
      L 668 160
      Z
    " />
  </g>
</svg>"""

with open("public/cardback-logo.svg", "w") as f:
    f.write(full_logo_svg)

print("Saved full logo SVG")
