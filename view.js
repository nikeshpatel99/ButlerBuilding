"use strict";
//Butler Building WebGL main program

//textures
var grassCombo;
var grass;
var wood;
var yellowBrick;
var brownBrick;
var glassPane;
var brickRoad;

var n;
var gl;
var u_ModelMatrix;
var u_NormalMatrix;
var u_isLighting;
var u_Sampler;
var u_isTextured;

var VSHADER_SOURCE =
	"attribute vec4 a_Position;\n" +
	"attribute vec4 a_Color;\n" +
	"attribute vec4 a_Normal;\n" +
	"attribute vec2 a_TexCoords;\n" +
	"uniform mat4 u_ModelMatrix;\n" +
	"uniform mat4 u_NormalMatrix;\n" +
	"uniform mat4 u_ViewMatrix;\n" +
	"uniform mat4 u_ProjMatrix;\n" +
	"varying vec4 v_Color;\n" +
	"varying vec2 v_TexCoords;\n" +
	"varying vec3 v_Normal;\n" +
	"varying vec3 v_Position;\n" +
	"void main() {\n" +
	"	gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n" +
	"	v_Position = vec3(u_ModelMatrix * a_Position);\n" +
	"	v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n "+
	"	v_Color = a_Color;\n" +
	"	v_TexCoords = a_TexCoords;\n" +
	"}\n";

var FSHADER_SOURCE=
	"#ifdef GL_ES\n" +
	"precision mediump float;\n" +
	"#endif\n" +
	"uniform sampler2D u_Sampler;\n" +
	"uniform vec3 u_LightColor;\n" +
	"uniform vec3 u_AmbientLight;\n" +
	"uniform vec3 u_LightDirection;\n" +
	"uniform bool u_isTextured;\n" +
	"uniform bool u_isLighting;\n" +
	"varying vec3 v_Normal;\n" +
	"varying vec3 v_Position;\n" +
	"varying vec4 v_Color;\n" +
	"varying vec2 v_TexCoords;\n" +
	"void main() {\n" +
	"	vec3 normal = normalize(v_Normal);\n" +
	"	float nDotL = max(dot(u_LightDirection, normal) , 0.0);\n" +
	"	if(u_isTextured && u_isLighting){\n" +
	"		vec4 texColor = texture2D(u_Sampler, v_TexCoords);\n" +
	"		vec3 diffuse = u_LightColor * texColor.rgb * nDotL;\n" +
	"		vec3 ambient = u_AmbientLight * texColor.rgb;\n" +
	"		gl_FragColor = vec4(diffuse + ambient, texColor.a);\n" +
	"	}\n" +
	"	else if(u_isLighting){\n" +
	"		vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n" +
	"		gl_FragColor = vec4(diffuse, v_Color.a);\n" +
	"	}else{\n" +
	"		gl_FragColor = v_Color;\n" +
	"	}\n" +

	"}\n";

var viewMatrix = new Matrix4();　// The view matrix
var projMatrix = new Matrix4();// The projection matrix
var modelMatrix = new Matrix4();  // The projection matrix
var g_normalMatrix = new Matrix4();  // Coordinate transformation matrix for normals

var ANGLE_STEP = 3.0;  // The increments of rotation angle (degrees)
var g_xAngle = 0.0;    // The rotation x angle (degrees)
var g_yAngle = 0.0;    // The rotation y angle (degrees)

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL - credit
function loadTexture(gl, s) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	//image takes time to load - we use single pixel until its finished loading, then we slap the texture on the object
	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
				width, height, border, srcFormat, srcType,
				pixel);

	const image = new Image();
	image.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
					  srcFormat, srcType, image);

		// WebGL1 has different requirements for power of 2 images
		// vs non power of 2 images so check if the image is a
		// power of 2 in both dimensions.
		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
			// Yes, it"s a power of 2. Generate mips.
			//gl.generateMipmap(gl.TEXTURE_2D);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			console.log("Image is 2^x");
		} else {
			// Not a power of 2. Turn off mips and set
			// wrapping to clamp to edge
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			console.log("Image is not 2^x");
		}
	};
	image.src = s;

	return texture;
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}


function main(){
	var canvas = document.getElementById("webgl");
	
	gl = getWebGLContext(canvas);
	if(!gl){
		console.log("Failed to get the rendering context for WebGL");
		return;
	}
	
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
		console.log("Failed to intialize shaders.");
		return;
	}
	
	grassCombo = loadTexture(gl, "./img/grass-metal.png");
	yellowBrick = loadTexture(gl, "./img/yellowBrick.jpg");
	brownBrick = loadTexture(gl, "./img/brownBrick.jpg");
	wood = loadTexture(gl, "./img/wood.jpg");
	glassPane = loadTexture(gl, "./img/glassPane.jpg");
	grass = loadTexture(gl, "./img/grass.png");
	brickRoad = loadTexture(gl, "./img/brickRoad.jpg");
	
	//viewport settings
	//gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.64, 0.64, 0.64, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
	var u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
	var u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");
	u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
	var u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
	var u_LightDirection = gl.getUniformLocation(gl.program, "u_LightDirection");
	u_isLighting = gl.getUniformLocation(gl.program, "u_isLighting");
	u_isTextured = gl.getUniformLocation(gl.program, "u_isTextured");
	u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
	var u_AmbientLight = gl.getUniformLocation(gl.program, "u_AmbientLight");
	
	if (!u_ModelMatrix || !u_ViewMatrix || !u_NormalMatrix || !u_ProjMatrix || !u_LightColor || !u_LightDirection || !u_isLighting) { 
		console.log("Failed to get the storage location of one of the matrices in this wonderful program");
		return;
	}
	
	// lighting
	// Set the light color (white)
	gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
	// Set the light direction (in the world coordinate)
	var lightDirection = new Vector3([0.5, 3.0, 4.0]);
	lightDirection.normalize(); // Normalize
	gl.uniform3fv(u_LightDirection, lightDirection.elements);
	//set ambient light colour
	var ambientLight = new Vector3([0.255, 0.250, 0.158]);
	gl.uniform3fv(u_AmbientLight, ambientLight.elements);
	// calculate the view matrix and projection matrix
	viewMatrix.setLookAt(0, 20, 70, 0, 0, -100, 0, 1, 0);
	projMatrix.setPerspective(70, canvas.width/canvas.height, 1, 120);
	// Pass the view and projection matrix to u_ViewMatrix, u_ProjMatrix
	gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
	
	gl.uniform1i(u_isTextured, true); // Will apply textures until changed
	
	//allows for camera rotation
	document.onkeydown = function(ev){
		keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting,u_isTextured, u_Sampler);
	};
	 
	draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting, u_isTextured, u_Sampler);
};
var animating = false;
var key = -1;
function keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting,u_isTextured ,u_Sampler) {
	switch (ev.keyCode) {
		case 70:
			if(!animating){
				renderLoop();
				animating = true;
			}
			break;
		case 40: // Up arrow key -> the positive rotation of arm1 around the y-axis
			g_xAngle = (g_xAngle + ANGLE_STEP) % 360;
			break;
		case 38: // Down arrow key -> the negative rotation of arm1 around the y-axis
			g_xAngle = (g_xAngle - ANGLE_STEP) % 360;
			break;
		case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
			g_yAngle = (g_yAngle + ANGLE_STEP) % 360;
			break;
		case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
			g_yAngle = (g_yAngle - ANGLE_STEP) % 360;
			break;
		default: return; // Skip drawing at no effective action
	}
	if(animating && (ev.keyCode === 40 || ev.keyCode === 38 || ev.keyCode === 39 || ev.keyCode === 37)){
		key = ev.keyCode;
	}
	else{
		//redraw the scene
		draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting,u_isTextured, u_Sampler);
		key = -1;
	}
};

function initVertexBuffers(gl,shape,u_isTextured) {
	//cube() returns [vertices,colors,normals,indices]
	var data;
	switch(shape)
	{
		case "brick":
			data = brick();
			break;
		case "cube":
			data = cube();
			break;
		case "flat":
			data = flat();
			break;
		case "corner":
			data = corner();
			break;
		case "octagon":
			data = octagon();
			break;
		default:return -1;//not a valid shape to render
	}
	var vertices = data[0];
	var colors = data[1];
	var normals = data[2];
	var indices = data[3];
	var texCoors = data[4];
	
	if(!texCoors){
		gl.uniform1i(u_isTextured, false);
	}
	else{//texture mapping
		gl.uniform1i(u_isTextured, true);
		if (!initArrayBuffer(gl, "a_TexCoords", texCoors, 2, gl.FLOAT)) return -1;
	}

	// Write the vertex property to buffers (coordinates, colors and normals)
	if (!initArrayBuffer(gl, "a_Position", vertices, 3, gl.FLOAT)) return -1;
	if (!initArrayBuffer(gl, "a_Color", colors, 3, gl.FLOAT)) return -1;
	if (!initArrayBuffer(gl, "a_Normal", normals, 3, gl.FLOAT)) return -1;

	// Write the indices to the buffer object
	var indexBuffer = gl.createBuffer();
	if (!indexBuffer) {
		console.log("Failed to create the buffer object");
		return false;
	}

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.DYNAMIC_DRAW);

	return indices.length;
};

function initArrayBuffer (gl, attribute, data, num, type) {
	// Create a buffer object
	var buffer = gl.createBuffer();
	if (!buffer) {
		console.log("Failed to create the buffer object");
		return false;
	}
	// Write date into the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
	// Assign the buffer object to the attribute variable
	var a_attribute = gl.getAttribLocation(gl.program, attribute);
	if (a_attribute < 0) {
		console.log("Failed to get the storage location of " + attribute);
		return false;
	}
	gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
	// Enable the assignment of the buffer object to the attribute variable
	gl.enableVertexAttribArray(a_attribute);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return true;
}

function initAxesVertexBuffers(gl) {
	var verticesColors = new Float32Array([
	// Vertex coordinates and color (for axes)
	-20.0,  0.0,   0.0,  1.0,  1.0,  1.0,  // (x,y,z), (r,g,b) 
	 20.0,  0.0,   0.0,  1.0,  1.0,  1.0,
	 0.0,  20.0,   0.0,  1.0,  1.0,  1.0, 
	 0.0, -20.0,   0.0,  1.0,  1.0,  1.0,
	 0.0,   0.0, -20.0,  1.0,  1.0,  1.0, 
	 0.0,   0.0,  20.0,  1.0,  1.0,  1.0 
	]);
	var n = 6;

	// Create a buffer object
	var vertexColorBuffer = gl.createBuffer();  
	if (!vertexColorBuffer) {
		console.log("Failed to create the buffer object");
		return false;
	}

	// Bind the buffer object to target
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

	var FSIZE = verticesColors.BYTES_PER_ELEMENT;
	//Get the storage location of a_Position, assign and enable buffer
	var a_Position = gl.getAttribLocation(gl.program, "a_Position");
	if (a_Position < 0) {
		console.log("Failed to get the storage location of a_Position");
		return -1;
	}
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
	gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

	// Get the storage location of a_Position, assign buffer and enable
	var a_Color = gl.getAttribLocation(gl.program, "a_Color");
	if(a_Color < 0) {
		console.log("Failed to get the storage location of a_Color");
		return -1;
	}
	gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
	gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

	// Unbind the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return n;
}


var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
	var m2 = new Matrix4(m);
	g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
	return g_matrixStack.pop();
}
/*
	######  ######     #    #     #    ####### #     # #     #  #####  #######
	#     # #     #   # #   #  #  #    #       #     # ##    # #     #    #
	#     # #     #  #   #  #  #  #    #       #     # # #   # #          #
	#     # ######  #     # #  #  #    #####   #     # #  #  # #          #
	#     # #   #   ####### #  #  #    #       #     # #   # # #          #
	#     # #    #  #     # #  #  #    #       #     # #    ## #     #    #
	######  #     # #     #  ## ##     #        #####  #     #  #####     #
*/

function draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting, u_isTextured, u_Sampler){
	// Clear color and depth buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//bind textures to buffers
	// 0 = yellowBrick, 1 = brownBrick, 2 = grassCombo, 3 = wood, 4 = glass, 5 = grass, 6 = brickRoad
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, yellowBrick);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, brownBrick);
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, grassCombo);
	gl.activeTexture(gl.TEXTURE3);
	gl.bindTexture(gl.TEXTURE_2D, wood);
	gl.activeTexture(gl.TEXTURE4);
	gl.bindTexture(gl.TEXTURE_2D, glassPane);
	gl.activeTexture(gl.TEXTURE5);
	gl.bindTexture(gl.TEXTURE_2D, grass);
	gl.activeTexture(gl.TEXTURE6);
	gl.bindTexture(gl.TEXTURE_2D, brickRoad);
	
	gl.uniform1i(u_isLighting, true); // Will apply lighting
	
	// Rotate, and then translate
	modelMatrix.setTranslate(0, 0, 0);  // Translation (No translation is supported here)
	modelMatrix.rotate(g_yAngle, 0, 1, 0); // Rotate along y axis
	modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis
	// ************* MAIN DRAWS *************
	n = reintVertexBuffers(gl,"cube",u_isTextured);
	//front door - ANIMATABLE
	if(!animating){
		gl.activeTexture(gl.TEXTURE4);
		gl.uniform1i(u_Sampler, 4);
		pushMatrix(modelMatrix);
		modelMatrix.translate(-20,-1,-2);
		modelMatrix.scale(0.1, 8, 4); // Scale
		pushMatrix(modelMatrix);
		modelMatrix.translate(0,0,1);
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
		modelMatrix = popMatrix();
		///modelMatrix.translate(0,0,0);
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
		modelMatrix = popMatrix();
	}	
	//back door
	if(!animating){
		gl.activeTexture(gl.TEXTURE4);
		gl.uniform1i(u_Sampler, 4);
		pushMatrix(modelMatrix);
		modelMatrix.translate(20,-1,-2);
		modelMatrix.scale(0.1, 8, 4); // Scale
		pushMatrix(modelMatrix);
		modelMatrix.translate(0,0,1);
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
		modelMatrix = popMatrix();
		///modelMatrix.translate(0,0,0);
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
		modelMatrix = popMatrix();
	}
	
	//left side door - ANIMATABLE
	if(!animating){
		gl.activeTexture(gl.TEXTURE4);
		gl.uniform1i(u_Sampler, 4);
		pushMatrix(modelMatrix);
		//modelMatrix.translate(-20,-1,-12);
		modelMatrix.translate(-20,-1,-15.8);
		modelMatrix.scale(0.1, 8, 4); // Scale
		pushMatrix(modelMatrix);
		modelMatrix.translate(0,0,1);
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
		modelMatrix = popMatrix();
		//modelMatrix.translate(0,0,0);
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
		modelMatrix = popMatrix();
	}	
	// ***FLOOR***
	//road part
	n = reintVertexBuffers(gl,"flat",u_isTextured);
	gl.activeTexture(gl.TEXTURE6);
	gl.uniform1i(u_Sampler, 6);
	pushMatrix(modelMatrix);
	modelMatrix.translate(0,-5.5,0);
	modelMatrix.scale(80.0, 0.5, 80.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	// ***FLOOR***
	// ***TABLE***
	n = reintVertexBuffers(gl,"cube",u_isTextured);
	pushMatrix(modelMatrix);
	modelMatrix.scale(0.6,0.6,0.6);
	modelMatrix.translate(0, -4.0, 0);
	modelMatrix.translate(50.0, 0, -25.0);  // Origin offest for the table
	drawTable(gl, u_ModelMatrix, u_NormalMatrix, u_isTextured, u_Sampler);
	modelMatrix.translate(0, 0, 55.0);  // Origin offest for the table
	drawTable(gl, u_ModelMatrix, u_NormalMatrix, u_isTextured, u_Sampler);
	modelMatrix = popMatrix();
	// ***TABLE***
	
	// *** PILLARS ***
	gl.activeTexture(gl.TEXTURE0);
	gl.uniform1i(u_Sampler, 0);
	pushMatrix(modelMatrix);
	modelMatrix.translate(-20.4,0,-19);  // Translation
	modelMatrix.scale(1.0, 10.0, 1.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	pushMatrix(modelMatrix);
	modelMatrix.translate(-20.4,0,-8.4);  // Translation
	modelMatrix.scale(1.0, 10.0, 1.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	pushMatrix(modelMatrix);
	modelMatrix.translate(-20.4,0,8.4);  // Translation
	modelMatrix.scale(1.0, 10.0, 1.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	pushMatrix(modelMatrix);
	modelMatrix.translate(-20.4,0,19);  // Translation
	modelMatrix.scale(1.0, 10.0, 1.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	// *** PILLARS ***
	
	// *** BROWN PANELLING ***
	gl.uniform1i(u_isTextured, false);
	pushMatrix(modelMatrix);
	modelMatrix.translate(-20.4,10.6,0);  // Translation
	modelMatrix.scale(1.0, 3.75, 40.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	gl.uniform1i(u_isTextured, true);
	// *** BROWN PANELLING ***
	
	// *** WINDOWS ***
	gl.activeTexture(gl.TEXTURE4);
	gl.uniform1i(u_Sampler, 4);
	// front windows
	for(var i=-18; i<19;i+=4){
		pushMatrix(modelMatrix);
		modelMatrix.translate(-20.4,6.8,i);  // Translation
		modelMatrix.scale(1.0, 3.7, 4); // Scale
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
		modelMatrix = popMatrix();
	}
	//rear windows
	let pos = [-15,-8,8,15];
	for(var i in pos){
		pushMatrix(modelMatrix);
		modelMatrix.translate(20.4,1.0,pos[i]);  // Translation
		modelMatrix.scale(0.4, 3.7, 4); // Scale
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
		modelMatrix = popMatrix();
	}
	//left windows
	pos = [-17,-8,-6,2,4,6,8,10,17]
	for(var i in pos){
		pushMatrix(modelMatrix);
		modelMatrix.translate(pos[i],1.0,-20);  // Translation
		modelMatrix.scale(1.0, 5, 0.6); // Scale
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
		modelMatrix = popMatrix();
	}
	
	//right windows
	pos = [17,8,6,-2,-4,-6,-8,-10,-17]
	for(var i in pos){
		pushMatrix(modelMatrix);
		modelMatrix.translate(pos[i],1.0,20);  // Translation
		modelMatrix.scale(1.0, 5, 0.6); // Scale
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
		modelMatrix = popMatrix();
	}
	// *** WINDOWS ***
	
	// *** MAIN BUILDING ***
	// Model building base - split into 2 halves
	//front base of building
	//n = reintVertexBuffers(gl,"cube",u_isTextured);
	// Model building base - split into 2 halves
	n = reintVertexBuffers(gl,"brick",u_isTextured);
	gl.activeTexture(gl.TEXTURE0);
	gl.uniform1i(u_Sampler, 0);
	pushMatrix(modelMatrix);
	modelMatrix.translate(-17.3, 0, 0);  // Translation
	modelMatrix.scale(5.0, 10.0, 40.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	//rear base of building
	n = reintVertexBuffers(gl,"cube",u_isTextured);
	gl.activeTexture(gl.TEXTURE1);
	gl.uniform1i(u_Sampler, 1);
	pushMatrix(modelMatrix);
	modelMatrix.translate(2.5, 0, 0);  // Translation
	modelMatrix.scale(35.0, 10.0, 40.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	//main building roof
	n = reintVertexBuffers(gl,"corner",u_isTextured);
	gl.activeTexture(gl.TEXTURE2);
	gl.uniform1i(u_Sampler, 2);
	pushMatrix(modelMatrix);
	modelMatrix.translate(0, 10.0, 0);  // Translation
	modelMatrix.scale(40.0, 10.0, 40.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	// *** MAIN BUILDING ***
}

function drawTable(gl, u_ModelMatrix, u_NormalMatrix, u_isTextured, u_Sampler){
	//draw table octagon
	var n;
	n = reintVertexBuffers(gl,"octagon",u_isTextured);
	gl.activeTexture(gl.TEXTURE3);
	gl.uniform1i(u_Sampler, 3);
	pushMatrix(modelMatrix);
	modelMatrix.scale(10.0, 1.0, 10.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	//draw table connector 1
	n = reintVertexBuffers(gl,"cube",u_isTextured);
	pushMatrix(modelMatrix);
	modelMatrix.translate(0, -1, 0);  // Translation
	modelMatrix.scale(17.0, 1.0, 1.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	//draw (2) seats
	pushMatrix(modelMatrix);
	modelMatrix.rotate(90,0,1,0);
	modelMatrix.scale(8.0, 1.0, 2.0); // Scale
	modelMatrix.translate(0, -0.5, 3.75);  // Translation
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix.translate(0, 0, -7.5);  // Translation
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	//draw table connector 2
	pushMatrix(modelMatrix);
	modelMatrix.rotate(90,0,1,0);
	modelMatrix.translate(0, -1, 0);  // Translation
	modelMatrix.scale(17.0, 1.0, 1.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	//draw (2) seats
	pushMatrix(modelMatrix);
	modelMatrix.scale(8.0, 1.0, 2.0); // Scale
	modelMatrix.translate(0, -0.5, 3.75);  // Translation
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix.translate(0, 0, -7.5);  // Translation
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	//draw stand
	pushMatrix(modelMatrix);
	modelMatrix.rotate(90,0,0,1);
	modelMatrix.translate(-3.0, 0, 0);  // Translation
	modelMatrix.scale(6.0, 1.0, 1.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();

};

function reintVertexBuffers(gl,shape,u_isTextured){
	var n = initVertexBuffers(gl,shape,u_isTextured);
	if (n < 0) {
		console.log("Failed to set the vertex information");
		return;
	}
	return n;
};

function drawbox(gl, u_ModelMatrix, u_NormalMatrix, n) {
	//pushMatrix(modelMatrix);

	// Pass the model matrix to the uniform variable
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

	// Calculate the normal transformation matrix and pass it to u_NormalMatrix
	g_normalMatrix.setInverseOf(modelMatrix);
	g_normalMatrix.transpose();
	gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

	// Draw
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

	//modelMatrix = popMatrix();
}

var framesRendered = 0;
const step = 60;
function renderLoop(now){
	//check for keypress, if so, set base modelMatrix.
	switch (key) {
		case 40: // Up arrow key -> the positive rotation of arm1 around the y-axis
		case 38: // Down arrow key -> the negative rotation of arm1 around the y-axis
		case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
		case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
			// Rotate, and then translate
			modelMatrix.setTranslate(0, 0, 0);  // Translation (No translation is supported here)
			modelMatrix.rotate(g_yAngle, 0, 1, 0); // Rotate along y axis
			modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis
			break;
		default: break; // no need to apply rotation.
	}
	//render static objects
	draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting, u_isTextured, u_Sampler);
	//render frame for each animatable.
	animateDoor1(framesRendered);
	animateDoor2(framesRendered);
	//animateDoor3(framesRendered);
	//increment frame counter
	framesRendered++;
	if(framesRendered != 120){
		window.requestAnimationFrame(renderLoop);
	}
	else{
		framesRendered = 0;
		animating = false;
	}
};

var door1Out = true;
function animateDoor1(frame){
	const distance = 1;
	const translateDistance = (distance + (frame%60)) / step;
	//draw stuff
	n = reintVertexBuffers(gl,"cube",u_isTextured);
	gl.activeTexture(gl.TEXTURE4);
	gl.uniform1i(u_Sampler, 4);
	pushMatrix(modelMatrix);
	modelMatrix.translate(-20,-1,-2);
	modelMatrix.scale(0.1, 8, 4); // Scale
	pushMatrix(modelMatrix);
	if(door1Out){//left door
		modelMatrix.translate(0,0,1+translateDistance);
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
		modelMatrix = popMatrix();
		modelMatrix.translate(0,0,0-translateDistance);
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	}
	else{
		modelMatrix.translate(0,0,1+distance-translateDistance);
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
		modelMatrix = popMatrix();
		modelMatrix.translate(0,0,0-distance+translateDistance);
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	}
	modelMatrix = popMatrix();
	if(frame == 59 || frame == 119){
		door1Out = !door1Out;
	}
};

var door2Out = true;
function animateDoor2(frame){
	const distance = 0.4;
	const translateDistance = (distance + (frame%60)) / step;
	//draw stuff
	n = reintVertexBuffers(gl,"cube",u_isTextured);
	gl.activeTexture(gl.TEXTURE4);
	gl.uniform1i(u_Sampler, 4);
	pushMatrix(modelMatrix);
	modelMatrix.translate(20,-1,-2);
	modelMatrix.scale(0.1, 8, 4); // Scale
	pushMatrix(modelMatrix);
	if(door2Out){//left door
		modelMatrix.translate(0,0,1+translateDistance);
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
		modelMatrix = popMatrix();
		modelMatrix.translate(0,0,0-translateDistance);
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	}
	else{
		modelMatrix.translate(0,0,1+distance-translateDistance);
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
		modelMatrix = popMatrix();
		modelMatrix.translate(0,0,0-distance+translateDistance);
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	}
	modelMatrix = popMatrix();
	if(frame == 59 || frame == 119){
		door2Out = !door2Out;
	}
};

var door3Out = true;
function animateDoor3(frame){
	const degree = 90;
	const angle = ((degree/step)*59)%90;
	console.log(angle);
	//draw stuff
	n = reintVertexBuffers(gl,"cube",u_isTextured);
	gl.activeTexture(gl.TEXTURE4);
	gl.uniform1i(u_Sampler, 4);
	pushMatrix(modelMatrix);
	modelMatrix.translate(-25,-1,-12);
	modelMatrix.scale(0.1, 8, 4); // Scale
	pushMatrix(modelMatrix);
	if(door3Out){//left door
		modelMatrix.translate(0,0,1);
		modelMatrix = popMatrix();
		modelMatrix.rotate(-45,0,1,0);
		drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
		
		
	}
	else{

	}
	modelMatrix = popMatrix();
	if(frame == 59 || frame == 119){
		door3Out = !door3Out;
	}
};