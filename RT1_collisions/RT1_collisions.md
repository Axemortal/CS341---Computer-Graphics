---
title: RT1 - Planes and Cylinders
---

<figure id="exp-primitives"><img src="doc/expected_primitives.jpg"></img></figure>

In this assignment, you will implement ray intersections with planes and cylinders and compute surface normals at the intersection points. The framework code provided this week is identical to last week's, except we added methods for ray/planes and ray/cylinder intersections in `src/tracer.frag.glsl`.


The above picture shows what we expect you to produce after successfully completing all the tasks. The framework is configured to visualize the surface normals in false color (the normal XYZ components in [-1, 1] are mapped linearly to RGB values in [0, 1]).

Regarding the orientation (sign) of surface normals, the raytracer expects your implementation to always return a normal pointing **towards** the viewer! 
For "non-closed" objects like the plane and open cylinder, where the ray may hit the surface from either side, you must choose the sign appropriately based on the ray direction. Specifically, the normal and view ray should always point in opposite directions.

After successful implementation of all the tasks in this homework, you should get an image that looks like the one above: use it as reference to check your results.

## Tasks

We first want to compute the intersection point between a ray and a plane, as well the normal at that point.
We then want to extend the computations to the case of a ray and a cylinder.

### Ray-Plane Intersection

First, you are asked to implement the intersection of a ray with a plane defined by its normal $\mathbf{n}_p$ (normalized) and offset along its normal $b$. Points $\mathbf{x}$ on this plane therefore verify $\mathbf{x} \cdot \mathbf{n}_p = b$.

<div class="box task">

#### Task RT1.1: Implement Ray-Plane Intersections

* Fill in the method `ray_plane_intersection` in `tracer.frag.glsl`.
	* Compute the intersection between the ray and the plane.
		* If the ray and the plane are parallel there is no intersection.
		* Otherwise, compute intersection data and store it in `normal`, and `t` (distance along ray until intersection).
	* Return whether there is an intersection in front of the viewer (`t > 0`).
* The plane is two-sided, so the normal you return depends on the side from which we view it. 
The normal rendered in the image should not change if the plane normal is flipped.
Test this by negating (setting to minus the same vector) a plane normal in `src/scenes.js` and checking that the resulting image is unchanged.

<div class="box hint">

##### Hint

To test the intersection expression you derived on paper is correct, we provide you with an example of what you should obtain with the following parameters ($\mathbf{n}_p$ is the plane normal, $b$ is the plane offset):

* $\mathbf{o}$ = [0.05, 0.0, 0.0], $\mathbf{d}$ = `normalize`([0.1, 0.1, 1.0])
* $\mathbf{n}_p$ = `normalize`([1.0, 1.0, 1.0]), $b$ = 0.5

You should obtain the following ray parameter $t$, intersection point $\mathbf{i}$, and normal $\mathbf{n}$:

* $t$ = 0.6868, $\mathbf{i}$ = [0.1180, 0.06800, 0.6800], $\mathbf{n}$ = [-0.5773, -0.5773, -0.5773] 

We encourage you to solve the intersection equation with pen and paper and check that the result matches the reference above.

</div>

* Check the image generated in *Normals* mode for the scene named `primitives`. Compare it with the [reference image](#exp-primitives) at the beginning of this handout. You should see the planes appearing in the background. Check that the colors (i.e. the normals) match the reference. Note that you have not yet implemented the ray-cylinder intersection routine, so the cylinder will still be missing.
* Check the images generated in *Normals* mode for scenes `corner1` and `corner2`.

</div>

<br>

<div class="box project">

#### Project Preparation

As it is often the case in real life scenarios, you do not have access to the ground truth for `corner1` and `corner2`. 
Validating your implementation is a crucial part of code development.
In this course, this is an essential skill to succeed in your final project.
Understanding how to test your code is part of the learning goals of this series of assignments.

One way to validate your implementation is to design test scenes where you know the geometry and the expected results.
You can start by analysing the definition of the scene corresponding to `corner1` and `corner2` in `src/scenes.js`, understand how the camera is oriented, and make sure the results you see rendered in the browser are consistent with the geometry specified in the file.

We encourage you to design your own test scenes and to add them to the `src/scenes.js` file.
Convince yourself that the results you obtain are consistent with the geometry you defined before moving forward.

</div>

### Ray-Cylinder Intersection

You are asked to derive an expression for the intersection with an *open* cylinder (i.e. without end caps). You will then implement the ray-cylinder intersection and verify that the resulting image matches the [reference image](#exp-primitives) we provide. 

<figure id="fig-cylinders"><img src="doc/cyl_diagram.png"></img></figure>

<div class="box task">

#### Task RT1.2.1: Derive the Expression for a Ray-Cylinder Intersection

* Derive the intersection between a ray and a cylinder. Discuss how to compute the parameter $t$, which solution to pick in case multiple exist, and how to define the cylinder normal.
* Please use the following notation: the ray has origin $\mathbf{o}$ and direction $\mathbf{d}$. The cylinder has center $\mathbf{c}$, radius $r$, axis $\mathbf{a}$ (normalized) and height $h$ (see [diagram](#fig-cylinders)).

</div>

We ask you to typeset your solution in LaTeX.
If you are not familiar with LaTeX, we suggest you have a look at [Overleaf's quick tutorial](https://www.overleaf.com/learn/latex/Learn_LaTeX_in_30_minutes).
You will need to write your solution in the provided template file `theory.md`, located in the `theory/` directory.
The file is written in Markdown, which is a simple and easy-to-use markup language you can use to format any document.
There is no need for you to learn advanced Markdown syntax: the template we provide is already set up for you to write your solution.
In case you want more information on how to use Markdown, please check the [Markdown Guide](https://www.markdownguide.org/getting-started/).

You can compile the Markdown file to `html` using [`pandoc`](https://pandoc.org/installing.html), which you can download it from the linked website.
To compile `theory.md` into `html` simply run `make` from the `theory/` directory:
```sh
cd theory
make
```
This will generate the `theory.html` file, which you can open in your browser.

<div class="box project">

#### Project Preparation

We will use the same typesetting and compilation framework for the final project.
This exercise is a good opportunity to familiarize yourself with the system, as well as with LaTeX, in case you have not used it before.

</div>


The next step is then to implement your solution.
The approach we recommend for implementing the intersection is to first determine where the ray intersects a version of the cylinder that extends infinitely in each direction (as if $h\rightarrow +\infty$).
Then, from this list of intersection candidates, discard those that fall outside the cylinder's actual extent. 
Finally, choose the intersection closest to the viewer, if multiple exist.

<div class="box task">

#### Task RT1.2.2: Implement Ray-Cylinder Intersections

* Fill in the method `ray_cylinder_intersection` in `tracer.frag.glsl`.
	* Compute the first valid intersection between the ray and the cylinder (valid means in front of the viewer: `t > 0`).
	* Store the intersection point in `intersection_point`.
	* Store the ray parameter in `t`.
	* Store the normal at intersection_point in `normal`.
	* Return whether there is an intersection with `t > 0`.

<div class="box hint">

##### Hint

You can use the `solve_quadratic` function provided in `tracer.frag.glsl`.

</div>

* Check the images generated in *Normals* mode for scenes `cylinders`, `barrel`, and `creature`.

<div class="box hint">

##### Hint

To test the intersection expression you derived on paper is correct, we provide you with an example of what you should obtain with the following parameters:

* $\mathbf{o}$ = [0.05, 0.0, 0.0], $\mathbf{d}$ = `normalize`([0.5, 0.3, 1.0])
* $\mathbf{c}$ = [0.0, 0.0, 0.1], $\mathbf{a}$ = [0.0, 0.0, 1.0], $r$ = 0.1, $h$ = 0.5

You should obtain the following ray parameter $t$, intersection point $\mathbf{i}$, and normal $\mathbf{n}$:

* $t$ = 0.1067, $\mathbf{i}$ = [0.09610, 0.02766, 0.09220], $\mathbf{n}$ = [-0.9610, -0.2766, 0.0]

We encourage you to solve the intersection equation with pen and paper and check that the result matches the reference above.

</div>

</div>

## Grading

Each task of this assignment are graded as follow:

* Ray-plane intersection: 20%
* Ray-cylinder intersection + normal derivation (theory exercise): 25%
* Ray-cylinder intersection implementation: 40%
* Cylinder normal implementation: 15%

## Custom scenes

Composing a scene out of planes, spheres and cylinders can be a creative puzzle.
We invite you to try making your own scenes and share them.
This task is not graded, but it will help you in getting familiar with the design workflow needed for the final project.

<div class="box project">

#### Project Preparation

To create your own scene, you can use the provided template file `RT_scenes.blend`.

We suggest starting with the following simple edits:

* Copy and paste the primitives (`Cylinder`, `Sphere`, `Plane-Floor`, `Plane-Wall`) to make more of them.
	- Note 1: As you paste or create a new primitive, make sure it is added to the `scene_custom` collection by either clicking on the box icon next to the collection name beforehand, or by dragging the new object into the collection. The export script will only export objects in this collection.
	- Note 2: The export script detects the object type based on the object name. Make sure to name your new objects `Cylinder`, `Sphere`, and `Plane` accordingly.
* Move [G], rotate [R] and scale [S] them to arrange your scene.
* You can also move the camera object in the scene. View the current camera placement with [Numpad0] (or [Cmd 0] on Mac). You can set the camera object to align with the current viewport with *Align Active Camera to View* with [Ctrl Alt Numpad0] (or [Option Cmd 0] on Mac).

<figure style="width: 90%;"><img src="doc/blender_custom_scene_1.jpg"></img></figure>

* When the scene is ready, switch to the scripting view and run the script:

<figure style="width: 90%;"><img src="doc/blender_custom_scene_2.jpg"></img></figure>

* The file `export_scene_custom.js` should have been written. Locate it in the root directory and open it with a text editor. Copy the scene description into `src/scenes.js` and add it to the list of existing scenes. Your scene should now be available for rendering.

</div>

## What to Hand in

Please edit the file `readme.md` adding a brief description (approximately 10 to 20 lines) of how you solved the proposed exercises. 
In the same file, report individual contributions following this scheme (sciper in parentheses):

	Name1 Surname1 (000001): 1/3
	Name2 Surname2 (000002): 1/3
	Name3 Surname3 (000003): 1/3

We ask you to only report global contributions, there is no need to provide additional details for each sub-task. 
The three contributions should add up to 1.

Make sure the `theory.md` and `theory.html` files containing the solution to task RT1.2.1 are in the `RT1_collisions` directory.

Compress the directory with all the files it contains – the source code with your solution, the source code you did not modify, the libraries, the readme, etc. – into a `.zip` archive. Rename the zipped file into `Exercise1-Group<GX>.zip`, where `<GX>` is your group number, according to the group you enrolled in on Moodle.

Note that it is your responsibility to check that all the components necessary to run the code are included. **We will run your web app to generate the results. These results we obtain will determine your grade**.