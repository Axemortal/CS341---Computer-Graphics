---
title: CG GL1 - GPU Pipeline - Geometric Transforms
---

<figure class="captioned"><img src="doc/icg_solar_title.jpg"></img></figure>
<figcaption>The model of the solar system you will implement in this assignment.</figcaption></figure>

## Introduction

In this assignment you will implement geometric transforms within the GPU pipeline.

A program based on the GPU pipeline, like our renderer, is divided into different parts.
Some parts run on the CPU, i.e. the processing unit used for many common programming tasks.
*Shaders*, instead, implement routines that run on the GPU.
The GPU is often a completely separate device, with its own memory and hardware instructions.
You will be writing code in both these different environments. 
Keeping this distinction in mind this will make the exercises easier to understand.

* CPU execution - `.js` files using the [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) language, run in the browser.
  * Operations on vectors and matrices are done with the [`gl-matrix`](http://glmatrix.net/) library (more below).
  They generally need an output argument and look something like this:
  ```js
  const a_p_b = vec3.add([0, 0, 0], a, b)
  ```
  * Types are not checked ahead of time, errors happen at runtime. Mistakes in mathematical operations often cause the creation of `NaN` values – if you see them, most probably one of the `gl-matrix` functions did not receive all the needed arguments.
  * You can print messages to the browser console via [`console.log('message', value)`](https://developer.mozilla.org/en-US/docs/Web/API/Console/log).
  * You can use the *Debugger* ([Firefox](https://developer.mozilla.org/en-US/docs/Tools/Debugger), [Chrome](https://developers.google.com/web/tools/chrome-devtools/javascript)) to set breakpoints, i.e. places where the program pauses, and inspect the values of the variables.

* GPU execution - `.glsl` files, using the [GLSL](https://shaderific.com/glsl.html) language.
  * Operations on vectors and matrices are done using [built-in operators and functions](https://en.wikibooks.org/wiki/GLSL_Programming/Vector_and_Matrix_Operations) and look something like this:
  ```c
  vec3 a_p_b = a + b;
  ```
  * The code is compiled before execution, variables are typed and types are checked.
  * The output of the shader is the color of a pixel or position of a vertex.
  * **There is no debugger nor variable printing**.


## Matrix Operations with `gl-matrix`
For matrix and vector operations in JavaScript, we will be using [`gl-matrix`](http://glmatrix.net/). 
The source code of the library is in general quite straight-forward, see for example the [`mat4.js`](https://github.com/toji/gl-matrix/blob/master/src/mat4.js) file.
We primarily use the 4x4 matrices to express transformation in 3D space.
You can check the docs of the `mat4` module implementing 4x4 matrices [here](http://glmatrix.net/docs/module-mat4.html).

Here are some specificities of the `gl-matrix` library:

**Functions instead of operators:** JavaScript does not have operator overloading, so we can not express matrix multiplication with `*`. The `multiply` function should be used instead.

**Printing:** Matrices and vectors are both stored as flat arrays, so a 4x4 matrix is a 16-element array. This array is what you will see if you call `console.log(matrix)`. Use `mat4_to_string(m, decimals)` to format the string in a readable form.

**Output argument:** `gl-matrix` has been designed for fast performance, so it tries to reuse the matrix objects instead of creating new ones.
In nearly all functions, the first argument is the output object to which the result is written.
```js
const M_rotation = mat4.create(); // allocate matrix
// set matrix to 45 deg rotation around Z axis
mat4.fromZRotation(M_rotation, 45 * Math.PI / 180);

const C = mat4.create();
// multiply: C = A * B
mat4.multiply(C, A, B);
```
You should reuse matrices whenever performance is key. In our applications, however, the performance loss is usually negligible, so you can safely allocate new matrix objects.
```js
// allocate a new matrix for the result
const M_rotation = mat4.fromZRotation(mat4.create(), 45 * Math.PI / 180); 
// and
const C = mat4.multiply(mat4.create(), A, B);
```

You can do operations in-place:
```js
mat4.multiply(A, A, B); // A = A*B
```

<div class="box project">

#### Tutorial: `gl-matrix` in the Console

Here are some example commands you can directly run in your browser console to get familiar with some native `mat4` functions.

* Open `index_2d_transform.html` in your browser and open the console.
* Create a translation matrix
```js
let M_translation = mat4.fromTranslation(mat4.create(), [0, 10, 0]);
M_translation.toString()
```
Can you understand what each of the printed values represent?

* Create a rotation matrix
```js
let M_rotation = mat4.fromZRotation(mat4.create(), 90 * Math.PI / 180);
M_rotation.toString()
```
Make sure the values you see are consistent with your interpretation of the 4x4 matrix printout from the previous point.

* Combine the transformations by multiplication
```js
let M_RT = mat4.multiply(mat4.create(), M_translation, M_rotation);
M_RT.toString()
let M_TR = mat4.multiply(mat4.create(), M_rotation, M_translation);
M_TR.toString()
```
* Check the resulting translations.
```js
mat4.getTranslation([0, 0, 0], M_RT)
mat4.getTranslation([0, 0, 0], M_TR)
```
Are they the same? Do you understand why?

</div>

`gl-matrix` is a great library, but it only has rather basic funciontalities. 
We provide some extra utilities in `src/icg_math.js`:

* `matrix.get(row, col)`: Get element (row and col and 0-indexed).
* `matrix.set(row, col, value)`: Set element (row and col and 0-indexed).
* `mat4_matmul_many`: Multiply any number of matrices:
	
	```js
	//out = m1 * m2 * m3 * ...
	mat4_matmul_many(out, m1, m2, m3, ...)
	```
* `vec_to_string(vector, decimals)`: Display a vector with fixed decimal places.

* `matrix.toString()`: Represent a matrix as a human-readable string.

Note that these custom functions are not imported in the console, so if you directly try to call them there you will encounter an error. They are, however, imported in other `.js` files, see for example the beginning of `main_2d_transform.js` for an example of how to import a custom function from another `.js` file.


## GPU Pipeline Recap

Rasterization is performed on the GPU. 
GPUs are specialized in massively parallel processing of mesh geometry and image pixels. 
They operate according to a specific sequence of steps to process the given input data and produce the final image.

The GPU pipeline inputs are:

- *Vertex attributes*: position, normal, texture coordinates, etc.
- *Faces*: mesh triangles, stored as triples of indices.
- *Uniforms*: data globally available to the GPU programs, e.g. textures.

These input values are processed by *shaders* to produce the final output image.
Different types of shaders exists.
In this series of homework assignments we will describe and use *vertex* and *fragment* shaders.

In this section we review the structure of a typical `regl` pipeline.


### `regl` Pipeline

The pipeline is instantiated using all the data that do not change at runtime.
This construction step is expensive and should be done only once.

Values which change in time are marked as `regl.prop('prop_name')`.
We can supply these values when rendering each individual frame by calling `draw({prop_name: ...})`.

Refer to the [commented code snippet](#example) below for an example of a `regl` pipeline definition.


### Shaders

Shaders are programs which run on the GPU.
They have their own language, GLSL, which is quite similar to C, with the added [vector and matrix types](https://en.wikibooks.org/wiki/GLSL_Programming/Vector_and_Matrix_Operations).

The pipeline contains two shader programs:

- *Vertex shader*: program executed for each vertex of the mesh. A vertex shader computes vertex positions in the image, as well as intermediate variables used by the fragment shader.
- *Fragment shader*: program executed for each output pixel of the mesh. A fragment shader computes the output color of the pixels.

#### Vertex Shader
The vertex shader receives as input vertex attributes, which are declared using the `attribute` keyword.

The vertex shader can pass per-vertex data to the fragment shader.
Variables representing such data are declared using the `varying` keyword.

The vertex shader writes the vertex *image* coordinates to `gl_Position` which is a `vec4` in [homogenous coordinates](https://en.wikipedia.org/wiki/Homogeneous_coordinates).

Here is a simple vertex shader. 

```c
// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 position;

// Intermediate value passed on to fragment shader
varying vec2 tex_coord;

void main() {
	// intermediate value passed on to fragment shader
	tex_coord = position.xy;
	// output position [x, y, z, 1]
	gl_Position = vec4(position, 1);	
}
```
The [example](#example) in the next section also provides a simple vertex shader definition in the context of a fully functional pipeline.

#### Fragment Shader
The fragment shader receives data from the vertex shader as `varying` variables.
The `varying` values are interpolated between the triangle vertices by the fragment shader, weighted by barycentric coordinates.

The fragment shader writes the pixel color to `gl_FragColor` as `vec4(Red, Green, Blue, Opacity)`.

Both vertex and fragment shader have access to the global `uniform` values.

Here is a simple fragment shader. 

```c
// numerical precision of calculation
precision mediump float; 

// Intermediate value from vertex shader have to be declared in both shaders
varying vec2 tex_coord;

// Access global values
uniform vec3 color;

void main() {
	// [R, G, B, 1] in 0..1 range
	gl_FragColor = vec4(color, 1.);
}
```

### Example

Here is an example of a simple pipeline drawing a red triangle in the plane.

```js
const regl = createREGL();

// The pipeline is constructed only once!
const draw_triangle = regl({

	// Vertex attributes - properties of each vertex such as 
	// position, normal, texture coordinates, etc.
	attributes: {
		// 3 vertices with 2 coordinates each
		position: [
			[0, 0.2], // [x, y] - vertex 0
			[-0.2, -0.2], // [x, y] - vertex 1
			[0.2, -0.2], // [x, y] - vertex 2
		],
	},

	// Triangles (faces), as triplets of vertex indices
	elements: [
		[0, 1, 2], // a triangle
	],
	
	// Uniforms: global data available to the shader
	uniforms: {
		color: regl.prop('color'),
	},

	/* 
	Vertex shader program
	Given vertex attributes, it calculates the position of the vertex on screen
	and intermediate data ("varying") passed on to the fragment shader
	*/
	vert: `
	// Vertex attributes, specified in the "attributes" entry of the pipeline
	attribute vec2 position;
	
	void main() {
		// [x, y, 0, 1]
		gl_Position = vec4(position, 0, 1);
	}`,
	
	/* 
	Fragment shader program
	Calculates the color of each pixel covered by the mesh.
	The "varying" values are interpolated between the values 
	given by the vertex shader on the vertices of the current triangle.
	*/
	frag: `
	precision mediump float;
	
	uniform vec3 color;

	void main() {
		// [R, G, B, 1]
		gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
	}`,
});

// Function run to draw each frame
regl.frame((frame) => {
	// Reset the canvas to black
	regl.clear({color: [0, 0, 0, 1]});
		
	// Execute the declared pipeline
	draw_triangle({
		color: [1, 0, 0], // provide the value for regl.prop('color') in uniforms.
	})
});
```

Understanding the details of the pipeline definition and execution is key to successfully complete both this series of homework assignments, and the final project.
Before getting started in solving this week's tasks, we suggest you take the time to do the following introductory exercises, and get familiar with all the aspects of the GPU pipeline in the code above. 

<div class="box project">

#### Tutorial: GPU Pipeline

1. We start by setting up the code infrastructure to run the example pipeline in the browser.
- Open the `index_tutorial.html` file in the browser. The file is located in the `tutorial/` directory. You will get a 404 error in the browser console. Make sure you understand what that means.
- To resolve the error, create a new file named `main_tutorial.js`. Check the `html` source in `index_tutorial.html` to understand where `main_tutorial.js` should be located. If the new file is in the correct directory, the 404 error should disappear.
- Copy-paste the example code above into the file. A new error appears. Why is the `createREGL` function not defined? Find a way to fix this import error by checking how resources are handled, e.g., in `src/main.js`.
- After the import error is fixed, you should see a red triangle appearing on the screen.

2. We can now customize the scene definition directly in the JavaScript file.
- Display a blue triangle over a green background.
- Display a square. Which variables do you need to edit? Are quads supported by the GPU pipeline?
- Is the square skewed when displayed on screen, or do all its edges have the same length? Try resizing the browser window. What do you observe?
- Fix the aspect ratio of the canvas so that they are always square. [Here](https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html) is a useful tutorial discussing the (non-trivial) topic of canvas resizing. In general, you can either prescribe a predefined canvas size, e.g. in the `html` file, or you can resize your canvas at runtime. Check the files `main_2d_transform.js` and `index_2d_transform.html` to understand how a `canvas` object defined in the `html` file can be fetched in JavaScript, resized, and passed to the `createREGL` function, in such a way that your canvas are always square.

3. In this last section of the tutorial we focus on shaders.

- Let us briefly zoom into on how resources can be imported in a `regl` pipeline.
	- In this scene, shaders are particularly simple, and are thus defined as text strings directly in the `.js` file. 
	If your shader implementation becomes more complex, it can be convenient to move it to `.glsl` files, as done in previous homework assignments. 
	Try moving the shader definitions to `.glsl` files. 
	We suggest you create a dedicated directory `tutorial/src/shaders`, mimicking the structure of the main `src` directory. 
	Your code to load shaders from file can then be changed to something like the following:

	````js
	// ...

	// Vertex shader
	vert: await (await fetch('./src/shaders/<shader_name>.vert.glsl')).text(), 

	// Fragment shader
	frag: await (await fetch('./src/shaders/<shader_name>.frag.glsl')).text(),

	// ...
	````

	- Note the use of [`fetch` and `await`](https://javascript.info/fetch).
	Right now, you are not required to know more about this topic, but you might need these features later on for your project.
	In `main.js`, a more structured way of loading resources is implemented.
	Please refer to that pipeline if you are curious, and keep it mind as a reference in case you need to load more complex resources in the future. 

- We will now edit the vertex and fragment shaders to render a triangle with colors that smoothly vary between its vertices.
	<figure class="captioned" style="width: 50%;"><img src="doc/triangle_tutorial.png"> </img></figure>
	<figcaption>The expected result after implementing varying colors in the shaders.</figcaption></figure>

	- First, we need to define per-vertex colors in the form of vertex attributes. Until now, we worked with colors defined as uniform variables associated to the whole shape. To define a new attribute, simply add it to the existing `attributes` list. Populate the `color` list with three entries, each representing the color of the corresponding vertex.

		```js
		attributes: {
			position: [
				// ...
			],
			color: [
				// TODO: populate the list
			],
		},
		```

	- All attributes are then readily available in the vertex shader upon declaration of a corresponding variable. Similar to how `attribute vec2 position` declares the `position` variable, add a declaration for the `color` variable in the vertex shader, paying attention to the variable type.
	- Last, we need to define a `varying` variable, shared between the vertex and fragment shader. The vertex shader will be in charge of updating its value for each vertex; the fragment shader will interpolate between these values for each pixel within the triangle. 
		- Add the definition of a `varying` variable named `pixel_color` in both shaders. Again, pay attention to the variable type.
		- Assign the vertex color to `pixel_color` in the vertex shader.
		- Assign `pixel_color` to `gl_FragColor` in the fragment shader.

		Overall, your shaders should look something like:
	
		```c
		// Vertex shader
		precision mediump float;

		attribute vec2 position;
		attribute TODO color;

		varying TODO pixel_color;

		void main() {
			gl_Position = vec4(position, 0.0, 1.0);
			TODO // Pass the color to the fragment shader
		}
		```

		and
		
		```c
		// Fragment shader
		precision mediump float;

		varying TODO pixel_color;

		void main() {
			gl_FragColor = TODO;
		}
		```

	Note that, since the color is now processed as an attribute, the color passed as uniform is redundant, and the corresponding uniform field can be removed.

</div>



## Task GL1.1: 2D Scene

In this part we practice 2D transformations in the GPU pipeline on the example of simple triangles.
You will edit the file `src/main_2d_transform.js`. Run `index_2d_transform.html` to render the results in your browser.
This is the desired result.

<figure><video src="doc/icg_solar_2d_loop.webm" autoplay="true" loop="true" muted="true"> </video></figure>


<div class="box task">

### Task GL1.1.1: 2D Translation in Shader

We draw a blue triangle using the `draw_triangle_with_offset` pipeline.
We want the triangle to be moved when we click and drag with the mouse.
We provide code which tracks the mouse offset and store it in `mouse_offset`.

* **GL1.1.1.1** Edit the *vertex shader* of `draw_triangle_with_offset` to apply translation to vertex position
(no need to use a matrix here).
Any compilation error of the shader program will be shown in the console.

* **GL1.1.1.2** Provide the mouse position and the color to the `draw_triangle_with_offset` call.

</div> 

<div class="box task">

### Task GL1.1.2: 2D Matrix Transform

We draw a green and blue triangles using the `draw_triangle_with_transform` pipeline,
which applies a transformation matrix to the triangle position.

* **GL1.1.2.1** Edit the *vertex shader* of `draw_triangle_with_transform` to apply the transform matrix `mat_transform` to the vertex position vector.
* **GL1.1.2.2** Construct a translation matrix for vector `[0.5, 0, 0]`, and a rotation around Z for angle `(time * 30 deg)`. 
	Multiply the matrices in appropriate order and call the pipeline to draw:
	* A green triangle orbiting the center point
	* A red triangle spinning at `[0.5, 0, 0]`

</div> 



## Task GL1.2: Solar System

In this part we create a 3D solar system visualization.
You will edit the files `src/main.js`, `src/planets.js`, and `src/shaders/unshaded.vert.glsl`. Run `index.html` to render the results in your browser.
If you implement all the tasks correctly, you should see something similar to the following video.

<figure><video src="doc/icg_solar_3d_loop.mp4" autoplay="true" loop="true" muted="true" width="90%"> </video></figure>
<!-- <figure><video src="doc/icg_solar_3d_loop.webm" autoplay="true" loop="true" muted="true"> </video></figure> -->


### Model-View-Projection

The vertex shader transforms the vertex positions from their original place in the model (mesh)
to the final position in the output image.

This is done in several steps:

* Model matrix: transforms model to world coordinates (variable: `actor.mat_model_to_world`, where *actor* is the object holding information about the current model)
* View matrix: transforms world coordinates into coordinates relative to the camera (variable: `frame_info.mat_view`)
* Projection matrix: transforms from camera frame to the homogenous coordinates in the image (variable: `frame_info.mat_projection`).

<figure><img src="doc/mvp_transform.svg"> </img></figure>

Here are some more useful resources on the topic:

* Visualization: [Model View Projection](https://jsantell.com/model-view-projection) by Jordan Santell
* Example matrices:  [World, View and Projection Transformation Matrices](http://www.codinglabs.net/article_world_view_projection_matrix.aspx).

The projection matrix is already given in our code, we ask you to calculate the remaining steps and combine them into the final model-view-projection matrix.

<div class="box task">

### Task GL1.2.1: MVP Matrix

* **GL1.2.1.1** Edit the *vertex shader* `unshaded.vert.glsl` to apply the transform matrix `mat_mvp` to the vertex position vector.
	The solution is the same as **GL1.1.2.1**.
* **GL1.2.1.2** Calculate the MVP matrix `this.mat_mvp` in `planets.js` `SysRenderPlanetsUnshaded.render`.
	The model matrix is given as `actor.mat_model_to_world`, the view matrix is `mat_view` and the projection is `mat_projection`.

</div> 

<div class="box task">

### Task GL1.2.2: View Matrix

Construct the view matrix in the `update_cam_transform` function (in `main.js`) and store it in the variable `frame_info.mat_turntable`.
We are using a "turntable" camera, it always looks at the origin point `[0, 0, 0]` and we can turn it around with the mouse.

* The distance from the camera to `[0, 0, 0]` is `r = cam_distance_base*cam_distance_factor`.
* The angle between the camera's forward-ray and the XY plane is `cam_angle_y`.
* The XY plane is rotated by `cam_angle_z`.

<figure><img src="doc/camera_pos.svg" width="400"> </img></figure>

It is convenient to create a view matrix with the *look-at* function `mat4.lookAt(out, eye, target, up)`.
You should then combine it with appropriate rotations to achieve the turn-table effect.

<div class="box hint">
*Hint*: pay attention to the *left*-hand-based sign convention used for the rotation angles.
</div>

<div class="box hint">
*Hint*: to visualize the world coordinate system, you can press the `F` key.
</div>

</div> 


<div class="box task">

### Task GL1.2.3: Model Matrix

Construct the model matrix in the `SysOrbitalMovement.calculate_model_matrix` function (in `planets.js`) and store it in `actor.mat_model_to_world`.

* Each celestial body spins around its Z axis, the angle of rotation is `sim_time * actor.rotation_speed`.

* The original mesh is a unit sphere, we scale it by `actor.size` to achieve the desired size.

* Planets can orbit around other bodies. The parent body (around which we are orbiting) is stored in `parent = actors_by_name[actor.orbit]`; the Sun's parent is `null`.
	The parent's model matrix is `parent.mat_model_to_world`, the orbit angle is `sim_time * actor.orbit_speed + actor.orbit_phase` and the radius `actor.orbit_radius`. Planets orbit in the XY plane.

</div> 


## Predefined Views

To validate your implementation, you can look at some predefined scenes by pressing keys `1`, `2`, and `3`.
The image for predefined scene `1` is given below: check if your result matches it.

<figure><img src="doc/GL1_predefined_1.png" width="800"> </img></figure>



## Grading

* **10%** Task 1.1: 2D translation in shader 
* **20%** Task 1.2: 2D matrix transform
* **10%** Task 2.1: MVP matrix
* **30%** Task 2.2: View matrix
* **30%** Task 2.3: Model matrix



## What to Hand in

Please edit the file `readme.md` adding a brief description (approximately 10 to 20 lines) of how you solved the proposed exercises. 
In the same file, report individual contributions following this scheme (sciper in parentheses):

	Name1 Surname1 (000001): 1/3
	Name2 Surname2 (000002): 1/3
	Name3 Surname3 (000003): 1/3

We ask you to only report global contributions, there is no need to provide additional details for each sub-task. 
The three contributions should add up to 1.

Compress the directory with all the files it contains – the source code with your solution, the source code you did not modify, the libraries, the readme, etc. – into a `.zip` archive. 
Rename the zipped file into `Exercise3-Group<GX>.zip`, where `<GX>` is your group number, according to the group you enrolled in on Moodle.

Note that it is your responsibility to check that all the components necessary to run the code are included. 
We will run your web app to generate the results. These results will determine your grade.
