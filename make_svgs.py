def get_hang_slot_path(cx, cy, scale=1.0):
    # cx, cy is the center of the slot
    # standard base: width ~80, height ~24
    s = scale
    # points relative to cx, cy:
    # lobe left: cx - 30*s, lobe right: cx + 30*s
    # bottom: cy + 10*s
    # lobe R = 10*s
    # tab width = 24*s (from -12*s to 12*s), tab top = cy - 18*s
    d = (
        f"M {cx - 28*s:.1f} {cy + 10*s:.1f} "
        f"A {10*s:.1f} {10*s:.1f} 0 0 1 {cx - 28*s:.1f} {cy - 10*s:.1f} "
        f"L {cx - 15*s:.1f} {cy - 10*s:.1f} "
        f"Q {cx - 12*s:.1f} {cy - 10*s:.1f} {cx - 12*s:.1f} {cy - 13*s:.1f} "
        f"L {cx - 12*s:.1f} {cy - 15*s:.1f} "
        f"Q {cx - 12*s:.1f} {cy - 19*s:.1f} {cx - 8*s:.1f} {cy - 19*s:.1f} "
        f"L {cx + 8*s:.1f} {cy - 19*s:.1f} "
        f"Q {cx + 12*s:.1f} {cy - 19*s:.1f} {cx + 12*s:.1f} {cy - 15*s:.1f} "
        f"L {cx + 12*s:.1f} {cy - 13*s:.1f} "
        f"Q {cx + 12*s:.1f} {cy - 10*s:.1f} {cx + 15*s:.1f} {cy - 10*s:.1f} "
        f"L {cx + 28*s:.1f} {cy - 10*s:.1f} "
        f"A {10*s:.1f} {10*s:.1f} 0 0 1 {cx + 28*s:.1f} {cy + 10*s:.1f} "
        f"Z"
    )
    return d

slot = get_hang_slot_path(180, 48, scale=1.3)
print("Slot path generated:", slot[:60])
