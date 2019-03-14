//Butler Building WebGL main program

//textures
var grass;

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
	"	if(u_isLighting){\n" +
	"		vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n" +
	"		gl_FragColor = vec4(diffuse, v_Color.a);\n" +
	"	}else{\n" +
	"		gl_FragColor = v_Color;\n" +
	"	}\n" +
	"	if(u_isTextured){\n" +
	"		vec4 texColor = texture2D(u_Sampler, v_TexCoords);\n" +
	"		vec3 diffuse = u_LightColor * texColor.rgb * nDotL;\n" +
	"		gl_FragColor = vec4(diffuse, texColor.a);\n" +
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
			gl.generateMipmap(gl.TEXTURE_2D);
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
	
	var gl = getWebGLContext(canvas);
	if(!gl){
		console.log("Failed to get the rendering context for WebGL");
		return;
	}
	
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
		console.log("Failed to intialize shaders.");
		return;
	}
	
	grass = loadTexture(gl, "./img/grass-metal.png");
	yellowBrick = loadTexture(gl, "./img/yellowBrick.jpg");
	brownBrick = loadTexture(gl, "./img/brownBrick.jpg");
	wood = loadTexture(gl, "./img/wood.jpg");
	
	//viewport settings
	//gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.64, 0.64, 0.64, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	var u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
	var u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
	var u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");
	var u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
	var u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
	var u_LightDirection = gl.getUniformLocation(gl.program, "u_LightDirection");
	var u_isLighting = gl.getUniformLocation(gl.program, "u_isLighting");
	var u_isTextured = gl.getUniformLocation(gl.program, "u_isTextured");
	var u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
	
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
	
	// calculate the view matrix and projection matrix
	viewMatrix.setLookAt(0, 0, 50, 0, 0, -100, 0, 1, 0);
	projMatrix.setPerspective(50, canvas.width/canvas.height, 1, 100);
	// Pass the view and projection matrix to u_ViewMatrix, u_ProjMatrix
	gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
	
	//allows for camera rotation
	document.onkeydown = function(ev){
		keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting,u_isTextured, u_Sampler);
	};
	 
	draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting, u_isTextured, u_Sampler);
	
};

function keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting,u_isTextured ,u_Sampler) {
	switch (ev.keyCode) {
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
	//redraw the scene
	draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting,u_isTextured, u_Sampler);
};

function initVertexBuffers(gl,shape,u_isTextured) {
	//cube() returns [vertices,colors,normals,indices]
	var data;
	switch(shape)
	{
		case "cube":
			data = cube();
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
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

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
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
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

function draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting, u_isTextured, u_Sampler) {
	// Clear color and depth buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.uniform1i(u_isLighting, false); // Will not apply lighting

	// Set the vertex coordinates and color (for the x, y axes)

	var n = initAxesVertexBuffers(gl);
	if (n < 0) {
		console.log("Failed to set the vertex information");
		return;
	}

	// Calculate the view matrix and the projection matrix
	modelMatrix.setTranslate(0, 0, 0);  // No Translation
	// Pass the model matrix to the uniform variable
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

	// Draw x and y axes
	gl.drawArrays(gl.LINES, 0, n);

	gl.uniform1i(u_isLighting, true); // Will apply lighting
	gl.uniform1i(u_isTextured, false); // Will not apply textures until changed
	

	// Set the vertex coordinates and color (for the cube)
	var n = reintVertexBuffers(gl,"octagon",u_isTextured); //CHANGE TO CUBE
	// Rotate, and then translate
	modelMatrix.setTranslate(0, 0, 0);  // Translation (No translation is supported here)
	modelMatrix.rotate(g_yAngle, 0, 1, 0); // Rotate along y axis
	modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis
	
	// ************* MAIN DRAWS *************
	gl.activeTexture(gl.TEXTURE3);
	gl.bindTexture(gl.TEXTURE_2D, wood);
	gl.uniform1i(u_Sampler, 3);
	// Model building base - split into 2 halves
	pushMatrix(modelMatrix);
	modelMatrix.scale(10.0, 1.0, 10.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	/*
	//front base of building
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, yellowBrick);
	gl.uniform1i(u_Sampler, 0);
	// Model building base - split into 2 halves
	pushMatrix(modelMatrix);
	modelMatrix.translate(-5.0, 0, 0);  // Translation
	modelMatrix.scale(10.0, 5.0, 20.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	//rear base of building
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, brownBrick);
	gl.uniform1i(u_Sampler, 1);
	pushMatrix(modelMatrix);
	modelMatrix.translate(5.0, 0, 0);  // Translation
	modelMatrix.scale(10.0, 5.0, 20.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	
	//main building roof
	n = reintVertexBuffers(gl,"corner",u_isTextured);
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, grass);
	gl.uniform1i(u_Sampler, 2);
	pushMatrix(modelMatrix);
	modelMatrix.translate(0, 5.0, 0);  // Translation
	modelMatrix.scale(20.0, 5.0, 20.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	*/
}

function reintVertexBuffers(gl,shape,u_isTextured){
	var n = initVertexBuffers(gl,shape,u_isTextured);
	if (n < 0) {
		console.log("Failed to set the vertex information");
		return;
	}
	return n;
};

function drawbox(gl, u_ModelMatrix, u_NormalMatrix, n) {
	pushMatrix(modelMatrix);

	// Pass the model matrix to the uniform variable
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

	// Calculate the normal transformation matrix and pass it to u_NormalMatrix
	g_normalMatrix.setInverseOf(modelMatrix);
	g_normalMatrix.transpose();
	gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

	// Draw
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

	modelMatrix = popMatrix();
}