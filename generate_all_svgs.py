import math

# We create:
# 1. public/cardback-mark.svg
# 2. public/cardback-logo.svg
# 3. public/favicon.svg

# Colors from user's images:
# POS_blue: #000B76 (Deep Navy Kenner Cardback Blue)
# NEG_blue: #4739F5 (Bright Royal / Electric Indigo Blue)

# Helper function for hang slot path
def make_hang_slot(cx, cy, scale=1.0):
    s = scale
    return (
        f"M {cx - 30*s:.2f} {cy + 10*s:.2f} "
        f"A {10*s:.2f} {10*s:.2f} 0 0 1 {cx - 30*s:.2f} {cy - 10*s:.2f} "
        f"L {cx - 16*s:.2f} {cy - 10*s:.2f} "
        f"C {cx - 13*s:.2f} {cy - 10*s:.2f} {cx - 13*s:.2f} {cy - 13*s:.2f} {cx - 13*s:.2f} {cy - 14*s:.2f} "
        f"L {cx - 13*s:.2f} {cy - 16*s:.2f} "
        f"C {cx - 13*s:.2f} {cy - 20*s:.2f} {cx - 9*s:.2f} {cy - 20*s:.2f} {cx - 7*s:.2f} {cy - 20*s:.2f} "
        f"L {cx + 7*s:.2f} {cy - 20*s:.2f} "
        f"C {cx + 9*s:.2f} {cy - 20*s:.2f} {cx + 13*s:.2f} {cy - 20*s:.2f} {cx + 13*s:.2f} {cy - 16*s:.2f} "
        f"L {cx + 13*s:.2f} {cy - 14*s:.2f} "
        f"C {cx + 13*s:.2f} {cy - 13*s:.2f} {cx + 13*s:.2f} {cy - 10*s:.2f} {cx + 16*s:.2f} {cy - 10*s:.2f} "
        f"L {cx + 30*s:.2f} {cy - 10*s:.2f} "
        f"A {10*s:.2f} {10*s:.2f} 0 0 1 {cx + 30*s:.2f} {cy + 10*s:.2f} "
        f"Z"
    )

# Mark SVG
mark_slot = make_hang_slot(160, 48, scale=1.35)

# db geometry in mark:
# Center is x=160.
# d stem: x = 144 to 172. d bowl: cx = 114, cy = 175, R = 50, r = 22.
# b stem: x = 178 to 206. b bowl: cx = 206, cy = 175, R = 50, r = 22.
# Wait, let's look at the spacing in Logo_v1_var6_NEG_blue.png:
# In the user's logo, 'd' has bowl on left, stem on right.
# 'b' has stem on left, bowl on right.
# Between 'd' stem and 'b' stem is a gap of about 26px.
# 'd' ascender top: y = 85. baseline: y = 225. (height 140)
# bowl is from y = 125 to 225 (diameter 100).

mark_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 280" fill="none">
  <!-- Official Cardback Logo Mark (db with hang-hole slot) -->
  <g fill="currentColor">
    <!-- Euro Hang-Slot Punch Hole -->
    <path d="{mark_slot}" />

    <!-- 'd' letter: bowl + vertical right stem -->
    <!-- stem -->
    <rect x="135" y="80" width="28" height="145" rx="2" />
    <!-- outer bowl with inner counter cut out using evenodd -->
    <path fill-rule="evenodd" clip-rule="evenodd" d="
      M 149 125
      A 50 50 0 1 0 149 225
      Z
      M 149 147
      A 28 28 0 1 1 149 203
      Z
    " />

    <!-- 'b' letter: vertical left stem + bowl -->
    <!-- stem -->
    <rect x="187" y="80" width="28" height="145" rx="2" />
    <!-- outer bowl with inner counter cut out using evenodd -->
    <path fill-rule="evenodd" clip-rule="evenodd" d="
      M 201 125
      A 50 50 0 1 1 201 225
      Z
      M 201 147
      A 28 28 0 1 0 201 203
      Z
    " />
  </g>
</svg>"""

with open("public/cardback-mark.svg", "w") as f:
    f.write(mark_svg)

with open("public/favicon.svg", "w") as f:
    f.write(mark_svg.replace('currentColor', '#4739F5'))

print("Saved mark and favicon SVG")
