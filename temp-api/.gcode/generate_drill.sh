#!/bin/sh


# ; -23.66// bottom bar
# ; G0 X16.42// top bar
# ; 2.273
# ; Y64.6 // 1 in side
# ; Y13.8 1 in side
# Z17 to Z2
#  X-10
#  Y77 to -12

#
# Suggested Peck Drilling Settings Table
#
# | Material  | Tool Size (mm) | Step Size (mm) | Retract (mm) | Dwell (s) |
# |-----------|---------------|---------------|--------------|-----------|
# | Aluminum  | 3.175         | 0.76          | 1            | 0.5       |
# | Aluminum  | 3-6           | 2             | 1            | 0.5       |
# | Aluminum  | 8-12          | 3             | 1.5          | 0.5       |
# | Steel     | 3-6           | 1             | 1            | 1         |
# | Steel     | 8-12          | 2             | 1.5          | 1.5       |
#
# Notes:
# - Step Size: Depth of each peck.
# - Retract: Amount to retract after each peck.
# - Dwell: Pause at bottom of each peck (G4 Pn, where n = seconds).
# - Adjust feed rates and spindle speed as appropriate for your machine and tooling.
#
# Example: For steel, 6mm tool, use step size 1mm, retract 1mm, dwell 1s.
#
# Data source: Manufacturer recommendation for ALUMINUM / PLASTIC, .125" drill (.03" pecks) converted to metric.
#

echo "Select position:"
echo "1) top-right"
echo "2) top-left"
echo "3) bottom-right"
echo "4) bottom-left"
printf "Enter choice (1-4): "
read pos

case $pos in
  1)
    x="X-10"
    y="Y77"
    ;;
#   1)
#     x="X16.42"
#     y="Y64.6"
#     ;;
  2)
    x="X16.42"
    y="Y13.8"
    ;;
  3)
    x="X-23.66"
    y="Y64.6"
    ;;
  4)
    x="X-23.66"
    y="Y13.8"
    ;;
  *)
    echo "Invalid position"
    exit 1
    ;;
esac

printf "Enter safe Z height: "
read safe_z
printf "Enter surface Z: "
read surface_z
printf "Enter step size (positive number): "
read step_size
printf "Enter retract depth: "
read retract
echo "Select depth mode:"
echo "1) Absolute (exact Z coordinate to reach)"
echo "2) Relative (distance from surface)"
printf "Enter choice (1-2): "
read depth_mode

if [ "$depth_mode" = "1" ]; then
  printf "Enter absolute target Z coordinate: "
  read target_depth
elif [ "$depth_mode" = "2" ]; then
  printf "Enter depth to drill (positive distance from surface): "
  read depth_from_surface
  # Convert to absolute Z coordinate
  target_depth=$(echo "$surface_z - $depth_from_surface" | bc -l)
else
  echo "Invalid depth mode"
  exit 1
fi

printf "Enter output filename (e.g., drill_output.gcode): "
read filename
if [ -f "$filename" ]; then
  echo "Warning: $filename already exists and will be overwritten."
fi

gcode_output=""
gcode_output+="G21;\n"
gcode_output+="G90;\n"
gcode_output+="G0 Z${safe_z};\n"
gcode_output+="G0 ${y};\n"
gcode_output+="M3 S8000;\n"
gcode_output+="G0 ${x};\n"

current_z=$surface_z

# Add some debug info
echo "Starting from Z=$surface_z, drilling to Z=$target_depth with step size $step_size"

# For absolute mode where we're drilling downward, adjust the loop condition
# In typical CNC, a higher Z value is further from workpiece
if [ $(echo "$surface_z > $target_depth" | bc -l) -eq 1 ]; then
  # Normal case - drilling downward
  echo "Drilling downward"
  while [ $(echo "$current_z > $target_depth" | bc -l) -eq 1 ]; do
    gcode_output+="G1 Z${current_z} F100;\n"
    gcode_output+="G4 P1;\n"  # Dwell for 1 second
    next_z=$(echo "$current_z - $step_size" | bc -l)
    if [ $(echo "$next_z < $target_depth" | bc -l) -eq 1 ]; then
      next_z=$target_depth
    fi
    gcode_output+="G1 Z${next_z} F100;\n"
    gcode_output+="G4 P1;\n"  # Dwell for 1 second
    retract_z=$(echo "$next_z + $retract" | bc -l)
    gcode_output+="G0 Z${retract_z};\n"
    current_z=$next_z
    echo "Current Z: $current_z"
  done
else
  # Unusual case - drilling upward or to the same point
  echo "Not drilling (target Z is same or above surface Z)"
  # Just move to the target Z
  gcode_output+="G1 Z${target_depth} F100;\n"
fi

gcode_output+="M2;\n"

printf "$gcode_output" > "$filename"
echo "G-code written to $filename."
