# Let's verify SVG syntax and dimensions
svg_mark = """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" fill="none">
  <!-- Punch hole hanger tab -->
  <path d="M 90 40 
           C 90 35 94 31 100 31 
           L 110 31 
           C 114 26 118 22 124 22 
           L 136 22 
           C 142 22 146 26 150 31 
           L 160 31 
           C 166 31 170 35 170 40 
           C 170 45 166 49 160 49 
           L 100 49 
           C 94 49 90 45 90 40 Z" fill="#4739F5" />
</svg>
"""
print("SVG test ready")
