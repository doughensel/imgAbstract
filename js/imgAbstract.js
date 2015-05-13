/**
//		imgAbstract v 0.06.04
//		last revision: May 13, 2015
//		https://github.com/doughensel/imgAbstract
**/

// capture: an object that houses the code to port an image to the canvas, read the color
//			information, and output it as an array of elements
var capture = {
// USER VARIABLES
	//	Set the grid size for sampling data from the image.
	//	'10' equals a 10px by 10px grid
	sampleSize : 10,
	//	Set the grid size for the output
	outputSize : 10,
	//  The ID for the image being scanned from the DOM
	imgID      : 'originalImage',
	//	The ID for the canvas element from the DOM
	canvasID   : 'canvas',
	//  Set how the dots are rendered: dotRadius is divided from outputSize
	//  2 sets the radius to half the size (thus the dot's diameter will fill the output grid)
	//  higher numbers will make smaller dots and the inverse is also true
	dotRadius  : 2,
	//  Set the polygon threshold of how strict/lenient the code should be in comparing colors
	polyThres  : 10,
	//  Select which type of output to generate. Only one should be set to TRUE
	output     : {
		square : false,
		dot    : false,
		poly   : true 	//	Not functional: in progress
	},
// SYSTEM VARIABLES
	img        : new Image(),
	canvas     : undefined,
	rawImgData : [],
	colorArray : [],
// FUNCTIONS
	test       : function( p, color ){
		console.log( 'test' );
		var ctx = this.canvas.getContext( '2d' );
			ctx.fillStyle = color;
			ctx.fillRect( p.x * this.sampleSize, p.y * this.sampleSize, this.sampleSize, this.sampleSize );
	},
	init       : function(){
		// get the image from the DOM
		this.img.src    = document.getElementById( this.imgID ).src;
		var _this       = this;
		this.img.onload = function(){
			_this.load();
		}
	},
	load       : function(){
		// get the canvas element
		this.canvas = document.getElementById( this.canvasID );
		var ctx    = this.canvas.getContext( '2d' );
		//	Set the canvas's height & width to match the image
		//	Crop the canvas size to cut off pixels outside of the sample size
		this.canvas.width  = this.img.width  - ( this.img.width  % this.sampleSize );
		this.canvas.height = this.img.height - ( this.img.height % this.sampleSize );
		//	Draw the image on the canvas
		ctx.drawImage( this.img, 0, 0 );
		//	Pull the image data from the canvas element
		//	For this to work the image MUST reside on the same domain (Issue #1 in README.md)
		this.rawImgData = ctx.getImageData( 0, 0, canvas.width, canvas.height );
		
		this.getColors();
	},
	getColors  : function(){
		//	Count how many sample regions exist within the canvas
		//  Doesn't need to be rounded because the declaration of canvas.height & canvas.width
		//		already made the dimensions easily divisible by sampleSize
		var columns     = this.canvas.width  / this.sampleSize,
			rows        = this.canvas.height / this.sampleSize,
			sampleCount = ( columns + 1 ) * ( rows ) - 1,
			sampleSqr   = this.sampleSize * this.sampleSize;
		// pixel OBJECT to store the corrdinates, color, and alpha info for each sample area
		function pixel(){
			this.x = 0;			// x-coordinate
			this.y = 0;			// y-coordinate
			this.r = 0;			// red
			this.g = 0;			// green
			this.b = 0;			// blue
			this.a = 0;			// alpha
		};
		// declaring variables to be used in the loop (outside to save on performance)
		var p      = undefined,	// pixel object
			// color data
			r      = 0,			// red
			g      = 0,			// green
			b      = 0,			// blue
			a      = 0,			// alpha
			// counters
			i      = 0,	
			j      = 0,	
			k      = 0,	
			l      = 0,	
			m      = 0, 
			n      = 0,
			row    = 0,
			column = 0;
		// Where the real fun begins...
		// Looping over the image data stored in this.rawImgData
		for( i=0; i < sampleCount; i++ ){
			// reset variables...
			// new pixel
			p = new pixel();
			// new rgba
			r = 0;
			g = 0;
			b = 0;
			a = 0;
			
			// Check out FIGURING OUT THE MATH at the bottom of the file to see a 
			// breakdown on how the code scans over the sample grid space on the image
			
			// Loop over the sample size
			j = 0;
			k = ( row * columns * sampleSqr ) + ( column * this.sampleSize );
			for( ; j < this.sampleSize; j++ ){
				// find the start of the line based off of the row / column
				l = k + ( ( this.sampleSize * columns ) * ( j ) );
				m = l + this.sampleSize;
				
				for( ; l < m; l++ ){

					n = l * 4;

					r += this.rawImgData.data[ n + 0 ];
					g += this.rawImgData.data[ n + 1 ];
					b += this.rawImgData.data[ n + 2 ];
					a += this.rawImgData.data[ n + 3 ];

				}

			}

			p.r = Math.floor( r / sampleSqr );
			p.g = Math.floor( g / sampleSqr );
			p.b = Math.floor( b / sampleSqr );
			// alpha is captured from 0-255, but rgba uses 0.0-1.0
			p.a = ( a / sampleSqr / 255 ).toFixed( 2 );

			// capture the X and Y coordinates
			p.x = column;
			p.y = row;
			// incriment the column (and row) appropriately
			// if the column value exceeds available columns, to a new row
			column++
			if( column > columns ){
				column = 0;
				row++;
			}

			// push the pixel to the colorArray[]
			this.colorArray.push( p );
		}// END for( i=0; i < sampleCount; i++ )

		if( this.output.square ){
			this.drawBoxes();
		}
		if( this.output.dot    ){
			this.drawDots();
		}
		if( this.output.poly   ){
			this.drawPoly();
		}

	},
	drawBoxes  : function(){
		var ctx = this.canvas.getContext( '2d' );
		// 	Update the canvas size, if outputSize is different that the original
		//  sampleSize
		if( this.outputSize != this.sampleSize ){
			var diff = this.outputSize / this.sampleSize;
			this.canvas.width  = Math.floor( this.canvas.width  * diff );
			this.canvas.height = Math.floor( this.canvas.height * diff );
		}
		//	Clear the canvas element
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		//	p is for pixel again, but this time to read, not write
		var p = undefined;
		for( var i = 0, x = this.colorArray.length; i < x; i ++ ){
			p = this.colorArray[i];
			ctx.fillStyle = 'rgba(' + p.r + ', ' + p.g + ', ' + p.b + ', ' + p.a + ')';
			ctx.fillRect( (p.x * this.outputSize), (p.y * this.outputSize), this.outputSize, this.outputSize );
		}
	},
	drawDots   : function(){
		var ctx = this.canvas.getContext( '2d' );
		
		if( this.outputSize != this.sampleSize ){
			var diff = this.outputSize / this.sampleSize;
			this.canvas.width  = Math.floor( this.canvas.width  * diff );
			this.canvas.height = Math.floor( this.canvas.height * diff );
		}
		
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		var p        = undefined,
			dotNudge = Math.ceil( this.outputSize / 2 ),
			endAngle = ( 2 * Math.PI ),
			radius   = 0,
			scale    = 0;

		for( var i = 0, x = this.colorArray.length; i < x; i ++ ){

			p = this.colorArray[i];
			// dot transparency is represented by the size of the dot
			radius = Math.floor( parseFloat( p.a ) * this.outputSize / this.dotRadius );
			
			ctx.beginPath();
			ctx.fillStyle = 'rgba(' + p.r + ', ' + p.g + ', ' + p.b + ', 1)';
			ctx.arc( ( p.x * this.outputSize + dotNudge ), ( p.y * this.outputSize + dotNudge ), radius, 0, endAngle ); 
			ctx.closePath();
			ctx.fill();

		}

	},
	drawPoly   : function(){
		var threshold  = this.polyThres;
			startPix   = Math.floor( this.colorArray.length/2 );

		var p1 = this.colorArray[ startPix ],
			p2 = this.colorArray[ startPix - 1 ];

		console.log( p1 );
		console.log( p2 );
		console.log( compareColors( p1, p2 ) );

		this.test( p1, 'rgba( 255, 0, 0, 1)' );

		function spiral( index, level, testColor ){

			// Go out level number of spaces from the index point


		}

		//  Compare one color with another, but use polyThres (threshold) 
		//  to allow for variations in the colors. 
		function compareColors( colorPrime, colorTest ){
			if( ( colorTest.r >= colorPrime.r - threshold && colorTest.r <= colorPrime.r + threshold ) && 
				( colorTest.g >= colorPrime.g - threshold && colorTest.g <= colorPrime.g + threshold ) && 
				( colorTest.b >= colorPrime.b - threshold && colorTest.b <= colorPrime.b + threshold ) ){
				return true;
			}else{
				return false;
			}
		}// END function compareColors()

	}
};

capture.init();

/*
	FIGURING OUT THE MATH

	Example of Known Variables
		SAMPLE SIZE   = 4
		target.COLUMN = 2 // index starts at 0 => - 1 = 1
		target.ROW    = 3 // index starts at 0 => - 1 = 2
		columns       = 3
		rows          = 3

		Find the start of the ROW
		row * columns * sample * sample
		1	:	( 0 * 3 * 4 * 4 ) = 0
		2	:	( 1 * 3 * 4 * 4 ) = 48
		3	:	( 2 * 3 * 4 * 4 ) = 96
		4	:	( 3 * 3 * 4 * 4 ) = 144

		Find the offset of the COLUMN
		column * sample
		1	:	( 0 * 4 ) = 0
		2	:	( 1 * 4 ) = 4
		3	:	( 2 * 4 ) = 8
		4	:	( 3 * 4 ) = 12

				{ row : 3, column : 2 } => 96 + 4 = 100

		Find the end of the first line
		+ sample
				{ row : 3, column : 2, line: {1, end  } } => 96 + 4 + 4 = 104

		Find the start of the second line
		+ ( sample * columns ) * ( lineNumber - 1 )
				{ row : 3, column : 2, line: {2, start} } => 96 + 4 + ( ( 4 * 3 ) * ( 1 ) ) = 112

		Find the start of the third line
		+ ( sample * columns ) * ( lineNumber - 1 )
				{ row : 3, column : 2, line: {3, start} } => 96 + 4 + ( ( 4 * 3 ) * ( 2 )  ) = 124

	+-----------------------+-----------------------+-------------------------+
	| 0,0 : 1,0 : 2,0 : 3,0 | 4,0 : 5,0 : 6,0 : 7,0 | 8,0 : 9,0 : 10,0 : 11,0 | => 12
	| 0,1 : 1,1 : 2,1 : 3,1 | 4,1 : 5,1 : 6,1 : 7,1 | 8,1 : 9,1 : 10,1 : 11,1 | => 24
	| 0,2 : 1,2 : 2,2 : 3,2 | 4,2 : 5,2 : 6,2 : 7,2 | 8,2 : 9,2 : 10,2 : 11,2 | => 36
	| 0,3 : 1,3 : 2,3 : 3,3 | 4,3 : 5,3 : 6,3 : 7,3 | 8,3 : 9,3 : 10,3 : 11,3 | => 48
	+-----------------------+-----------------------+-------------------------+
	| 0,4 : 1,4 : 2,4 : 3,4 | 4,4 : 5,4 : 6,4 : 7,4 | 8,4 : 9,4 : 10,4 : 11,4 | => 60
	| 0,5 : 1,5 : 2,5 : 3,5 | 4,5 : 5,5 : 6,5 : 7,5 | 8,5 : 9,5 : 10,5 : 11,5 | => 72
	| 0,6 : 1,6 : 2,6 : 3,6 | 4,6 : 5,6 : 6,6 : 7,6 | 8,6 : 9,6 : 10,6 : 11,6 | => 84
	| 0,7 : 1,7 : 2,7 : 3,7 | 4,7 : 5,7 : 6,7 : 7,7 | 8,7 : 9,7 : 10,7 : 11,7 | => 96
	+-----------------------+~~~~~~~~~~~~~~~~~~~~~~~+-------------------------+
	| 0,8 : 1,8 : 2,8 : 3,8 [ 4,8 : 5,8 : 6,8 : 7,8 ] 8,8 : 9,8 : 10,8 : 11,8 | => 108
	| 0,9 : 1,9 : 2,9 : 3,9 [ 4,9 : 5,9 : 6,9 : 7,9 ] 8,9 : 9,9 : 10,9 : 11,9 | => 120
	| 0,10: 1,10: 2,10: 3,10[ 4,10: 5,10: 6,10: 7,10] 8,10: 9,10: 10,10: 11,10| => 132
	| 0,11: 1,11: 2,11: 3,11[ 4,11: 5,11: 6,11: 7,11] 8,11: 9,11: 10,11: 11,11| => 144
	+-----------------------+~~~~~~~~~~~~~~~~~~~~~~~+-------------------------+
*/