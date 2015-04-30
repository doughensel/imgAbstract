# imgAbstract
imgAbstract converts a static img into squares, dots, and polygons.

## ToDo
* Get the colors of an image
  * Transfer img to a canvas element
  * Use JS to capture the R, G, B, and Alpha of each pixel
    * Set variable to define the sample size of colors and find the average color/alpha in that grid
  * Save color/alpha values to a javascript object
* Create basic shapes (squares and dots)
  * Make a control that will use the saved color/alpha values to redraw image in square or dot shapes
    * Can be DIVs, SVG elements, or on a canvas
* Create mouse interaction
  * When a mouse/cursor hovers over a section, the grid shapes (dot or square) should push away from the origin of the mouse (like an explosion from the cursor origin)
  * Will work on hover or click
* Create polygons

## Issues
