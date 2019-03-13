//Butler Building WebGL main program

var VSHADER_SOURCE =
	"attribute vec4 a_Position;\n" +
	"attribute vec4 a_Color;\n" +
	"attribute vec4 a_Normal;\n" +
	"uniform mat4 u_ModelMatrix;\n" +
	"uniform mat4 u_NormalMatrix;\n" +
	"uniform mat4 u_ViewMatrix;\n" +
	"uniform mat4 u_ProjMatrix;\n" +
	"uniform vec3 u_LightColor;\n" +
	"uniform vec3 u_LightDirection;\n" +
	"varying vec4 v_Color;\n" +
	"uniform bool u_isLighting;\n"+
	"void main() {\n" +
	"	gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n" +
	"	if(u_isLighting){\n" +
	"		vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n" +
	"		float nDotL = max(dot(normal, u_LightDirection), 0.0);\n" +
	"		vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n" +
	"		v_Color = vec4(diffuse, a_Color.a);\n" +
	"	}else{\n" +
	"		v_Color = a_Color;\n" +
	"	}\n"+
	"}\n";

var FSHADER_SOURCE=
	"#ifdef GL_ES\n" +
	"precision mediump float;\n" +
	"#endif\n" +
	"varying vec4 v_Color;\n" +
	"void main() {\n" +
	"	gl_FragColor = v_Color;\n" +
	"}\n";

var viewMatrix = new Matrix4();　// The view matrix
var projMatrix = new Matrix4();// The projection matrix
var modelMatrix = new Matrix4();  // The projection matrix
var g_normalMatrix = new Matrix4();  // Coordinate transformation matrix for normals

var ANGLE_STEP = 3.0;  // The increments of rotation angle (degrees)
var g_xAngle = 0.0;    // The rotation x angle (degrees)
var g_yAngle = 0.0;    // The rotation y angle (degrees)

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
		keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
	};
	 
	draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
	
};

function keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting) {
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
	draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
};

function initVertexBuffers(gl) {
	//cube() returns [vertices,colors,normals,indices]
	let data = cube();
	console.log(data);
	var vertices = data[0];
	var colors = data[1];
	var normals = data[2];
	var indices = data[3];

	// Write the vertex property to buffers (coordinates, colors and normals)
	if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
	if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
	if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

	// Write the indices to the buffer object
	var indexBuffer = gl.createBuffer();
	if (!indexBuffer) {
		console.log('Failed to create the buffer object');
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
		console.log('Failed to create the buffer object');
		return false;
	}
	// Write date into the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	// Assign the buffer object to the attribute variable
	var a_attribute = gl.getAttribLocation(gl.program, attribute);
	if (a_attribute < 0) {
		console.log('Failed to get the storage location of ' + attribute);
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
		console.log('Failed to create the buffer object');
		return false;
	}

	// Bind the buffer object to target
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

	var FSIZE = verticesColors.BYTES_PER_ELEMENT;
	//Get the storage location of a_Position, assign and enable buffer
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
	gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

	// Get the storage location of a_Position, assign buffer and enable
	var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	if(a_Color < 0) {
		console.log('Failed to get the storage location of a_Color');
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

function draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting) {

	// Clear color and depth buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.uniform1i(u_isLighting, false); // Will not apply lighting

	// Set the vertex coordinates and color (for the x, y axes)

	var n = initAxesVertexBuffers(gl);
	if (n < 0) {
		console.log('Failed to set the vertex information');
		return;
	}

	// Calculate the view matrix and the projection matrix
	modelMatrix.setTranslate(0, 0, 0);  // No Translation
	// Pass the model matrix to the uniform variable
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

	// Draw x and y axes
	gl.drawArrays(gl.LINES, 0, n);

	gl.uniform1i(u_isLighting, true); // Will apply lighting

	// Set the vertex coordinates and color (for the cube)
	var n = initVertexBuffers(gl);
	if (n < 0) {
		console.log('Failed to set the vertex information');
		return;
	}

	// Rotate, and then translate
	modelMatrix.setTranslate(0, 0, 0);  // Translation (No translation is supported here)
	modelMatrix.rotate(g_yAngle, 0, 1, 0); // Rotate along y axis
	modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis

	// Model building base
	pushMatrix(modelMatrix);
	modelMatrix.scale(20.0, 5.0, 20.0); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	
	/*
	// Model the chair back
	pushMatrix(modelMatrix);
	modelMatrix.translate(0, 1.25, -0.75);  // Translation
	modelMatrix.scale(2.0, 2.0, 0.5); // Scale
	drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
	modelMatrix = popMatrix();
	*/
}

function drawbox(gl, u_ModelMatrix, u_NormalMatrix, n) {
	pushMatrix(modelMatrix);

	// Pass the model matrix to the uniform variable
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

	// Calculate the normal transformation matrix and pass it to u_NormalMatrix
	g_normalMatrix.setInverseOf(modelMatrix);
	g_normalMatrix.transpose();
	gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

	// Draw the cube
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

	modelMatrix = popMatrix();
}
/*
function drawTriangle(gl){
	let n = 3;
	let vertices = new Float32Array([0,0,-1,-1,1,-1]);
	
	let vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) {
		console.log("Failed to create the buffer object");
		return -1;
	}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
	
	var a_Position = gl.getAttribLocation(gl.program, "a_Position");
	if(a_Position < 0) {
		console.log("Failed to get the storage location of a_Position");
		return -1;
	}

	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(a_Position);
	
	var a_Color = gl.getAttribLocation(gl.program,"a_Color");
	if(a_Color < 0) {
		console.log("Failed to get the storage location of a_Color");
		return -1;
	}
	gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Color);
	return n;
};
*/