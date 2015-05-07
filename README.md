# imgAbstract
imgAbstract converts a static img into squares, dots, and polygons.

## ToDo
* ~~Get the colors of an image~~
  * ~~Transfer img to a canvas element~~
  * ~~Use JS to capture the R, G, B, and Alpha of each pixel~~
    * ~~Set variable to define the sample size of colors and find the average color/alpha in that grid~~
  * ~~Save color/alpha values to a javascript object~~
* ~~Create basic shapes (squares and dots)~~
  * ~~Make a control that will use the saved color/alpha values to redraw image in square or dot shapes~~
  * ~~Give the option to change the output grid size~~
* Create mouse interaction
  * When a mouse/cursor hovers over a section, the grid shapes (dot or square) should push away from the origin of the mouse (like an explosion from the cursor origin)
  * Will work on hover or click
* Create polygons

## Issues

1. Image has to be the same domain, however James Tomasino found out a clever work-around by creating a proxy file that saved locally can serve up images from other sites. https://github.com/jamestomasino/Reactive-Color
2. Sporadically, image.onload event will trigger before the image has loaded, causing the code to break

## Release History

### 0.06
May 6, 2015
* Created drawDots() function
  * Displays the image/color information on the canvas element
  * Alpha/Transparency is represented by a dot's radius size

### 0.05
May 6, 2015
* Created the nested for loops to scan over the grid specified by sampleSize
* Created drawBoxes() function
	* Displays the image/color information on the canvas element

### 0.04
May 5, 2015
* encapsulated code into one global object, 'capture'
