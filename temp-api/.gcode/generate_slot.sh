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
# Feeds and Speeds for Aluminum - Metric (converted from inches)
#
# | Operation           | Tool Size (mm) | Speed (rpm) | Feed (mm/min) | Stepover (mm)   | Stepdown (mm)  | Helix/Ramp  |
# |---------------------|----------------|-------------|---------------|-----------------|----------------|-------------|
# | Face Finish         | 6.35 (1/4")    | 8000        | 762           | 2.54 (40%)      | 0.254          | -           |
# | Adaptive Rough      | 6.35 (1/4")    | 8000        | 762           | 0.508 (8%)      | 3.175          | 2 deg       |
# | Adaptive Finish     | 6.35 (1/4")    | 8000        | 762           | 0.254 (4%)      | 3.175          | 3 deg       |
# | Slotting            | 6.35 (1/4")    | 6000        | 178           | Full width      | 1.588          | 1 deg       |
# | Contour Finishing   | 6.35 (1/4")    | 6000        | 254           | 0.254 (4%)      | 9.525          | -           |
# | Drill (pecking)     | 3.175 (1/8")   | 6000        | 178           | -               | 0.76 (peck)    | -           |
#
# Notes:
# - Feed rates converted from ipm (inches per minute) to mm/min (1 ipm = 25.4 mm/min)
# - Stepover for adaptive: 1/2 of tool diameter for rough, 1/4 for finish
# - Stepover for contour finishing: tool diameter x 4%
# - Stepdown for slotting: 1/4 of tool diameter
# - Stepdown for contour finishing: 1.5x tool diameter
#
# Data source: Manufacturer recommendation converted from imperial to metric.
#

printf "Enter X position: "
read x_pos
x="X${x_pos}"

printf "Enter starting Y position: "
read start_y
printf "Enter ending Y position: "
read end_y

printf "Enter safe Z height: "
read safe_z
printf "Enter surface Z: "
read surface_z
printf "Enter step size (positive number): "
read step_size
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
gcode_output+="G0 ${x};\n"
gcode_output+="M3 S6000;\n"  # Updated spindle speed for slotting

current_depth=$surface_z

# Add some debug info
echo "Starting from Z=$surface_z, cutting to Z=$target_depth with step size $step_size"
echo "Slotting from Y=$start_y to Y=$end_y at X=$x_pos"

# For absolute mode where we're cutting downward, adjust the loop condition
# In typical CNC, a higher Z value is further from workpiece
if [ $(echo "$surface_z > $target_depth" | bc -l) -eq 1 ]; then
  # Normal case - cutting downward
  echo "Cutting slot..."
  
  while [ $(echo "$current_depth > $target_depth" | bc -l) -eq 1 ]; do
    # Move to safe height
    gcode_output+="G0 Z${safe_z};\n"
    # Move to starting Y position
    gcode_output+="G0 Y${start_y};\n"
    # Plunge to current depth
    gcode_output+="G1 Z${current_depth} F178;\n"  # Plunge at 178 mm/min
    # Cut along Y axis to end position
    gcode_output+="G1 Y${end_y} F178;\n"  # Cut at 178 mm/min for aluminum
    
    # Calculate next depth
    next_depth=$(echo "$current_depth - $step_size" | bc -l)
    if [ $(echo "$next_depth < $target_depth" | bc -l) -eq 1 ]; then
      next_depth=$target_depth
    fi
    current_depth=$next_depth
    echo "Current depth: $current_depth"
  done
  
  # Final pass at full depth
  gcode_output+="G0 Z${safe_z};\n"
  gcode_output+="G0 Y${start_y};\n"
  gcode_output+="G1 Z${target_depth} F178;\n"
  gcode_output+="G1 Y${end_y} F178;\n"
else
  # Unusual case - cutting upward or to the same point
  echo "Not cutting (target Z is same or above surface Z)"
  # Just move to the positions
  gcode_output+="G0 Z${safe_z};\n"
  gcode_output+="G0 Y${start_y};\n"
  gcode_output+="G1 Z${target_depth} F178;\n"
  gcode_output+="G1 Y${end_y} F178;\n"
fi

gcode_output+="M2;\n"

printf "$gcode_output" > "$filename"
echo "G-code written to $filename."
