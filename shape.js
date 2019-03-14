//shape arrays

function octagon(){
	var vertices = new Float32Array([   // Coordinates
	0.0, 0.0, 0.0,  -0.25, 0.0, 0.5,  0.25, 0.0, 0.5,  //origin,v0,v1
	0.0, 0.0, 0.0,   0.25, 0.0, 0.5,  0.5, 0.0, 0.25,  //origin,v1,v2
	0.0, 0.0, 0.0,   0.5, 0.0, 0.25,  0.5, 0.0, -0.25,  //origin,v2,v3
	0.0, 0.0, 0.0,   0.5, 0.0, -0.25, 0.25, 0.0, -0.5,  //origin,v3,v4
	0.0, 0.0, 0.0,   0.25, 0.0, -0.5,-0.25, 0.0, -0.5,  //origin,v4,v5
	0.0, 0.0, 0.0,  -0.25, 0.0, -0.5,-0.5, 0.0, -0.25,  //origin,v5,v6
	0.0, 0.0, 0.0,  -0.5, 0.0, -0.25,-0.5, 0.0, 0.25,  //origin,v6,v7
	0.0, 0.0, 0.0,  -0.5, 0.0, 0.25,  0.25, 0.0, 0.5,   //origin,v7,v0
	0.0, 0.0, 0.0,  -0.25, 0.0, 0.5,  0.25, 0.0, 0.5,  //origin,v0,v1
	//back face
	0.0, 0.0, 0.0,  -0.25, 0.0, 0.5,  0.25, 0.0, 0.5,  //origin,v0,v1
	0.0, 0.0, 0.0,   0.25, 0.0, 0.5,  0.5, 0.0, 0.25,  //origin,v1,v2
	0.0, 0.0, 0.0,   0.5, 0.0, 0.25,  0.5, 0.0, -0.25,  //origin,v2,v3
	0.0, 0.0, 0.0,   0.5, 0.0, -0.25, 0.25, 0.0, -0.5,  //origin,v3,v4
	0.0, 0.0, 0.0,   0.25, 0.0, -0.5,-0.25, 0.0, -0.5,  //origin,v4,v5
	0.0, 0.0, 0.0,  -0.25, 0.0, -0.5,-0.5, 0.0, -0.25,  //origin,v5,v6
	0.0, 0.0, 0.0,  -0.5, 0.0, -0.25,-0.5, 0.0, 0.25,  //origin,v6,v7
	0.0, 0.0, 0.0,  -0.5, 0.0, 0.25,  0.25, 0.0, 0.5   //origin,v7,v0
	]);

	// Indices of the vertices
	var indices = new Uint8Array([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15
	,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,
	38,39,40,41,42,43,44,45,46,47]);


	var colors = new Float32Array([    // Colors
	1, 0, 0,   1, 0, 0,   1, 0, 0,
	1, 0, 0,   1, 0, 0,   1, 0, 0,
	1, 0, 0,   1, 0, 0,   1, 0, 0,
	1, 0, 0,   1, 0, 0,   1, 0, 0,
	1, 0, 0,   1, 0, 0,   1, 0, 0,
	1, 0, 0,   1, 0, 0,   1, 0, 0,
	1, 0, 0,   1, 0, 0,   1, 0, 0,
	1, 0, 0,   1, 0, 0,   1, 0, 0,
	1, 0, 0,   1, 0, 0,   1, 0, 0,
	1, 0, 0,   1, 0, 0,   1, 0, 0,
	1, 0, 0,   1, 0, 0,   1, 0, 0,
	1, 0, 0,   1, 0, 0,   1, 0, 0,
	1, 0, 0,   1, 0, 0,   1, 0, 0,
	1, 0, 0,   1, 0, 0,   1, 0, 0,
	1, 0, 0,   1, 0, 0,   1, 0, 0,
	1, 0, 0,   1, 0, 0,   1, 0, 0,
	]);


	var normals = new Float32Array([    // Normal
	0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
	0.0, 0.0, -1.0,   0.0, 0.0, -1.0,   0.0, 0.0, -1.0,
	0.0, 0.0, -1.0,   0.0, 0.0, -1.0,   0.0, 0.0, -1.0,
	0.0, 0.0, -1.0,   0.0, 0.0, -1.0,   0.0, 0.0, -1.0,
	0.0, 0.0, -1.0,   0.0, 0.0, -1.0,   0.0, 0.0, -1.0,
	0.0, 0.0, -1.0,   0.0, 0.0, -1.0,   0.0, 0.0, -1.0,
	0.0, 0.0, -1.0,   0.0, 0.0, -1.0,   0.0, 0.0, -1.0,
	0.0, 0.0, -1.0,   0.0, 0.0, -1.0,   0.0, 0.0, -1.0,
	0.0, 0.0, -1.0,   0.0, 0.0, -1.0,   0.0, 0.0, -1.0
	]);
	
	var texCoords = new Float32Array([
	0.0,0.0,   0.0,1.0,   1.0,0.0,
	0.0,0.0,   0.0,1.0,   1.0,0.0,
	0.0,0.0,   0.0,1.0,   1.0,0.0,
	0.0,0.0,   0.0,1.0,   1.0,0.0,
	0.0,0.0,   0.0,1.0,   1.0,0.0,
	0.0,0.0,   0.0,1.0,   1.0,0.0,
	0.0,0.0,   0.0,1.0,   1.0,0.0,
	0.0,0.0,   0.0,1.0,   1.0,0.0,
	0.0,0.0,   0.0,1.0,   1.0,0.0,
	0.0,0.0,   0.0,1.0,   1.0,0.0,
	0.0,0.0,   0.0,1.0,   1.0,0.0,
	0.0,0.0,   0.0,1.0,   1.0,0.0,
	0.0,0.0,   0.0,1.0,   1.0,0.0,
	0.0,0.0,   0.0,1.0,   1.0,0.0,
	0.0,0.0,   0.0,1.0,   1.0,0.0,
	0.0,0.0,   0.0,1.0,   1.0,0.0
	]);
	

function cube(){
	// Create a cube
	//    v6----- v5
	//   /|      /|
	//  v1------v0|
	//  | |     | |
	//  | |v7---|-|v4
	//  |/      |/
	//  v2------v3
	var vertices = new Float32Array([   // Coordinates
	 0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5, // v0-v1-v2-v3 front
	 0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5, // v0-v3-v4-v5 right
	 0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5, // v0-v5-v6-v1 up
	-0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5, // v1-v6-v7-v2 left
	-0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5, // v7-v4-v3-v2 down
	 0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5  // v4-v7-v6-v5 back
	]);


	var colors = new Float32Array([    // Colors
	1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
	1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
	1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
	1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
	1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
	1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
	]);


	var normals = new Float32Array([    // Normal
	0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
	1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
	0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
	-1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
	0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
	0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
	]);
	
	var texCoords = new Float32Array([
	1.0,1.0,   0.0,1.0,   0.0,0.0,   1.0,0.0,
	0.0,1.0,   0.0,0.0,   1.0,0.0,   1.0,1.0, 
	1.0,0.0,   1.0,1.0,   0.0,1.0,   0.0,0.0,
	1.0,1.0,   0.0,1.0,   0.0,0.0,   1.0,0.0,
	0.0,0.0,   1.0,0.0,   1.0,0.0,   0.0,1.0,
	0.0,0.0,   1.0,0.0,   1.0,1.0,   0.0,1.0
	]);
	
	// Indices of the vertices
	var indices = new Uint8Array([
	0, 1, 2,  0, 2, 3, // front
	4, 5, 6,  4, 6, 7, // right
	8, 9,10,  8,10,11, // up
	12,13,14, 12,14,15, // left
	16,17,18, 16,18,19, // down
	20,21,22, 20,22,23 // back
	]);

	return [vertices,colors,normals,indices,texCoords];
};

function corner(){
	// Create a cube cut diagonally

	var vertices = new Float32Array([   // Coordinates
	-0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5, // v1-v2-v3 front (triangle)
	-0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   -0.5, 0.5,-0.5, // v1-v3-v4-v6 right (square face)
	-0.5, 0.5, 0.5,   -0.5, 0.5,-0.5,   -0.5,-0.5,-0.5,   -0.5,-0.5, 0.5, // v1-v6-v7-v2 left (square face)
	-0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5, // v7-v4-v3-v2 down (square face)
	 0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5  // v4-v7-v6 back (triangle)
	]);


	var colors = new Float32Array([    // Colors
	1, 0, 0,   1, 0, 0,  1, 0, 0,     //v1-v2-v3 front
	1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
	1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
	1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
	1, 0, 0,   1, 0, 0,   1, 0, 0    // v4-v7-v6 back
	]);


	var normals = new Float32Array([    // Normal
	0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v1-v2-v3 front
	1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v1-v3-v4-v6 right
	-1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
	0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
	0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,  // v4-v7-v6-v5 back
	]);
	
	var texCoords = new Float32Array([
	0.5,0.0,   0.5,1.0,   1.0,0.0, //v1,v2,v3
	0.0,0.0,   0.0,1.0,   0.5,1.0,   0.5,0.0, //v1-v3-v4-v6
	0.5,0.0,   0.5,1.0,   1.0,1.0,   1.0,0.0,//v1-v6-v7-v2
	0.5,0.0,   0.5,1.0,   1.0,1.0,   1.0,0.0,//v7-v4-v3-v2
	0.5,0.0,   0.5,1.0,   1.0,0.0, //v4-v7-v6
	]);

	// Indices of the vertices
	var indices = new Uint8Array([
	0, 1, 2, // front
	3, 4, 5,  3, 5, 6, // right
	7,8,9, 7,9,10, // left
	11,12,13, 11,13,14, // down
	15,16,17, // back
	]);

	return [vertices,colors,normals,indices,texCoords];

};