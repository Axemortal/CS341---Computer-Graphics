---
title: RT2 - Lighting and Light Rays
---

<figure id="castle-full"><img src="doc/castle_BlinnPhong_full.png"></img></figure>
<figcaption>
The `castle` scene involves the rendering effects you will implement in this homework assignment: ambient, diffuse, and specular lighting, shadows, and reflections. 

This reference image was rendered using the `Blinn-Phong` shading strategy with `4` reflections.
</figcaption>
</figure>

In this assignment, you will implement the Phong lighting model and learn how to compute reflections. 
The framework code for this assignment extends the one from last week.
After downloading `RT2_light_rays.zip` from Moodle, you will need to port your implementation of the plane and cylinder intersections into `tracer.frag.glsl`. 

You will test your implementation on the provided scenes.
As usual, we invite you to design your own test scenes.
The [figure above](#castle-full) shows what the `castle` scene should look like if you implement all the tasks of this homework correctly.

## Tasks

You will start by implementing the Phong and Blinn-Phong lighting models, and then add shadows and reflections.

### Lighting Models

#### Phong

<figure id="fig-phong" class="captioned"><img src="doc/phong_diagram.png"></img>
<figcaption>Reflected direction $\mathbf{r}$ in Phong lighting model.</figcaption></figure>

The goal of the first part of this assignment is to implement the Phong lighting model. So far, we colored objects in the scene according to their normals. Phong model enables having more realistic scenes at a relatively low cost. We recall the corresponding empirical formula (see lecture slides for more details):

$$\mathbf{I}_{\text{Phong}} = \mathbf{I}_a*\mathbf{m}_a + 
\sum_{\mbox{light} \; l} \left[
	\mathbf{I}_l*(\mathbf{m}_d.(\mathbf{n}^T\mathbf{l}) + \mathbf{m}_s.(\mathbf{r}^T\mathbf{v})^s) 
\right] $$

The notation used for the vectors is shown in the above [diagram](#fig-phong). Note that:

* The symbol $*$ denotes component-wise multiplication,
* $\mathbf{I}$ is the global intensity at an intersection point (a `vec3` containing the RGB components), 
* $\mathbf{I}_a$ is the ambient intensity (global constant `light_color_ambient` in the code), and
* $\mathbf{I}_l$ is the light intensity (`light.color` in the code). 
* The material properties are given by: $\mathbf{m}_a$ the RGB ambient coefficients, $\mathbf{m}_d$ the RGB diffuse coefficients, $\mathbf{m}_s$ the RGB specular coefficients, and $s$ the shininess. Such coefficients can be recovered in the code by multiplying `material.color` (a 3D vector) and `material.*` (a float), where `*` needs to be replaced by the relevant coefficient name. 
* The light source is a point-light located at `light.position`.

<div class="box hint">

##### Hint 1

The ambient contribution should be added only once, so it is convenient to do so in the main `render_light` function.

You can then add the contribution from each light in the `lighting` function, which is called multiple times within `render_light`.

</div>


#### Blinn-Phong

<figure id="fig-BlinnPhong" class="captioned"><img src="doc/BlinnPhong_diagram.png"></img>
<figcaption>Half vector $\mathbf{h}$ in Blinn-Phong lighting model.</figcaption></figure>

$$\mathbf{I}_{\text{Blinn-Phong}} = \mathbf{I}_a*\mathbf{m}_a + 
\sum_{\mbox{light}\; l} \left[
	\mathbf{I}_l*(\mathbf{m}_d.(\mathbf{n}^T\mathbf{l}) + \mathbf{m}_s.(\mathbf{h}^T\mathbf{n})^s)
\right]$$

The Blinn-Phong lighting model is a historical evolution and simplification over Phong model.
The specular component is determined by the product of surface normal $\mathbf{n}$ and the half-vector $\mathbf{h}$, raised to the power of shininess $s$. The half vector is the intermediate direction between viewing direction $\mathbf{v}$ and direction to light $\mathbf{l}$:

$$\mathbf{h} = \frac{\mathbf{v}+\mathbf{l}}{||\mathbf{v}+\mathbf{l}||}$$

<div class="box task">

#### Task RT2.1: Implement Lighting Models
* In `tracer.frag.glsl`:

	* Fill in the method `render_light`. If the current ray intersects an object:
		* Compute the ambient contribution to the total intensity.
		* Compute the intensity contribution from each light in the scene in the `lighting` function and add them to the resulting light intensity.
	
	* Implement the diffuse component in the `lighting` function:
		* Compute the diffuse component. 
		* Make sure that the light is located on the correct side of the object.

	* Compute the specular light components in the `lighting` function according to Blinn-Phong and Phong models:
		* Implement the Blinn-Phong shading model. Compute the half vector and resulting specular component.
		* Implement the Phong shading model. Make sure that the reflected light shines towards the camera and compute the resulting specular component.

<div class="box hint">

##### Hint 2

When implementing lighting models, a good idea is to start implementing the diffuse component, which is the same for both Phong and Blinn-Phong.
Going from flat colors to diffuse lighting allows us to clearly see the shapes of objects. 

<figure class="col2">
	<img src="doc/castle_Color.png"></img>
	<img src="doc/castle_Diffuse.png"></img>
	<figcaption>Flat colors.</figcaption>
	<figcaption>Diffuse lighting.</figcaption>
</figure>
You should obtain a similar result with your own implementation.

The specular component of Phong and Blinn-Phong gives us shiny surfaces.
You may notice that the specular highlights are by default bigger in the Blinn-Phong version. 
Try modifying the shininess $s$ and check that the change you see in the rendered images matches your expectations.

<figure class="col2">
	<img src="doc/castle_BlinnPhong_norays.png"></img>
	<img src="doc/castle_Phong_norays.png"></img>
	<figcaption>Blinn-Phong shading.</figcaption>
	<figcaption>Phong shading.</figcaption>
</figure>

</div>


<div class="box hint">

##### Hint 3

You can use existing methods for `vec3` objects such as `dot`, `normalize` and `length`.

</div>

<div class="box hint">

##### Hint 4

In the scene `shading_lights`, two distinct red and green lights should be visible. Check the file `scenes.js` for more details on the definition of the scene. Play with the parameters that set the material properties and light colors to validate that your implementation is correct.
</div>

</div>


### Shadows

<figure id="columns_shadows" class="captioned"><img src="doc/columns_BlinnPhong.png"></img>
<figcaption>Example of shadows in the `columns` scene. This reference image was rendered using the `Blinn-Phong` shading strategy with `0` reflections.</figcaption></figure>

Some objects in the scene might occlude light sources, which we want to account for.

<div class="box task">

#### Task RT2.2: Implement Shadows

* Fill in the method `lighting` in `tracer.frag.glsl`:
	* Shoot a shadow ray from the intersection point to the light.
	* Check whether it intersects an object from the scene.
	* Update the lighting accordingly.

<div class="box hint">

##### Hint 5

Do not forget to prevent shadow acne as described in the lecture.

</div>

</div>

### Reflections

<figure id="mirror_creature" class="captioned"><img src="doc/mirror_creature_Phong.png"></img>
<figcaption>Example of reflections in the `mirror_creature` scene. This reference image was rendered using the `Phong` shading strategy with `4` reflections.</figcaption></figure>


The last part of this assignment is about adding reflections to your scene. 
The resulting color for a given pixel $\mathbf{c}_b$, is obtained from the color at the first intersection without reflections $\mathbf{c}_0$, and the color $\mathbf{c}^1$ due to further reflections using the following relation:

$$\mathbf{c}_b = (1 - \alpha_0) \mathbf{c}_0 + \alpha_0 \mathbf{c}^1,$$

where $\alpha_0\in[0, 1]$ represents how reflective the first material we intersect is, and can be accessed as `materials.mirror` in the code. 
The color $\mathbf{c}^1$ can be computed by recursively following the reflected ray. 
Denoting by $\mathbf{c}^2$ the color obtained by blending colors after 2 reflections, we have:

$$\mathbf{c}^1 = (1 - \alpha_1) \mathbf{c}_1 + \alpha_1 \mathbf{c}^2.$$

Again, $\mathbf{c}_1$ corresponds to the color obtained at the intersection of the first reflected ray without considering reflections, and $\alpha_1$ is the reflection coefficient of the material that is being intersected with the first reflected ray. 
To simplify the notation, we assume that if intersection number $i$ does not occur, the corresponding color obtained without reflection at this intersection is $\mathbf{c}_i=0$. 

Computing reflections as described above is based on ray tracing, which is an inherently recursive procedure. 
Unfortunately, recursive calls are not supported in WebGL. 
We will then opt for rephrasing the reflection computations using a `for` loop.
You will first prove how the procedure detailed above can be unraveled into an iterative procedure. 
You will then implement this procedure in glsl.

<div class="box task">

#### Task RT2.3.1: Derive Iterative Formula

* Show that we have the following:

$$\mathbf{c}_b =  \sum_{i=0}^{+\infty} (1 - \alpha_i) \left(\prod_{k=0}^{i-1} \alpha_k \right) \mathbf{c}_i.$$

* Give a simplification of the above formula assuming that we consider at most $N$ reflections.

</div>

Write your solution in `theory.md` and compile it to `theory.html`.
You can find template files in the `RT2_theory/` directory.
Please refer to the previous handout for more details.

Now that you know how to change the recursive strategy into an iterative one, you can implement it into your raytracer.

<div class="box task">

#### Task RT2.3.2: Implement Reflections

* Fill in the method `render_light` in `tracer.frag.glsl`:
	* Create an outer loop over the number of reflections.
	* Compute lighting with the current ray (consider that it might have been reflected).
	* Use the above formula for blending the current pixel color with the reflected one.
	* Update the ray origin and direction.
* Experiment with selecting different numbers of reflections in the UI.

<div class="box hint">

##### Hint 6

The maximum number of reflections, denoted by $N$ in this handout, corresponds to the variable `NUM_REFLECTIONS` in `tracer.frag.glsl`. 

</div>

<div class="box hint">

##### Hint 7

Do not forget to offset intersection points to avoid reflection artifacts the same way as you did for shadow acne in the previous task.

</div>

</div>

### Blender Exercises (Optional)

Here are some optional exercises you can do to get more familiar with the Blender interface and the scene description in `regl`.
These are not graded, but they can be useful to get more comfortable with the tools you will use in subsequent homework assignments, and in the final project.

<div class="box project">

#### Project Preparation

You will use the provided template file `RT_scenes.blend` to edit and add lights and materials, and to analyze the definition of camera objects.

Please refer to last week's handout for more details on the scene export procedure.

* From Blender GUI, move the existing lights around. Check the preview of the generated shadow in Blender, and compare it to the one you obtain with your implementation. To get a fully shaded preview in Blender, including shadows, remember to select the *Render Preview* mode for the *Viewport Shading* option at the top right (see screenshot).

<figure style="width: 60%;"><img src="doc/viewport_shading.png"></img></figure>

* Try to understand how the position of the camera is specified in the scene description. You can move the camera object in Blender GUI and check how the camera position changes in the scene description. Check the export script to see which Blender parameter is mapped to which scene description parameter. Camera movement will be the subject of a future homework assignment: starting building some knowledge and intuition about it will be helpful.

* Add a new light. Note that the name of the light object should follow a given formatting rule to be correctly exported. Read the Python script to understand how the light object is identified and exported, and make sure the expected convention is respected.

* Place the new light in such a way that it creates interesting shadow overlaps in the scene. Try having some regions in your scene that are hit by all the lights, and some that are only lighted by two or one (see the screenshot below). Is the shading behavior as expected? Make sure you understand how the light intensity is specified in the scene description. If you noticed any inconsistencies in the shading, can you explain what happened?

<figure style="width: 60%;"><img src="doc/scene_3_lights.png"></img></figure>

* Assign a material to the objects currently in the scene. You can do this by:
	* Selecting an object in the scene.
	* Going to the *Object Properties* tab in the right panel (orange square).
	* Scrolling all the way down to *Custom Properties*.
	* Clicking on *New*.
	* Clicking on the gear icon to edit the newly added property.
	* Selecting *String* as *Type*.
	* Writing *material* in *Property Name*.
	* Exiting the edit menu (gear icon), and writing the name of the material you want to assign (for example: *black*) to the object in place of the default value, which is usually *1.0*.
	Try exporting the scene. Make sure the material name you specify is listed among the ones defined in the python Blender script.

<figure style="width: 90%;"><img src="doc/blender_material.png"></img></figure>

* Add a new material definition in the Blender file and assign it to one of the objects in the scene. Export the scene and check that the material is correctly rendered in the browser.

Remember that the provided export script is just a starting point for exploration.
Blender, has much more advanced features that can be useful to design you own scene.
For example, different kinds of lights exist (can you understand the difference between a point and a spot light sources? Try playing with these two in the Blender GUI, and check the [docs](https://docs.blender.org/manual/en/latest/render/lights/light_object.html) if interested), as well as much more advanced material models.

Our simple script is only exporting a small subset of the object properties that Blender can handle.
This is because our `regl` framework does not currently support more advanced rendering techniques either.
Some optional features you can decide to implement in the project will go in the direction of extending the capabilities of the `regl` pipeline.
Learning the basics of Blender is then a good way to start getting an idea about which aspects of rendering you find interesting, and maybe want to implement in the final project.

Note that many advanced rendering techniques, especially for what concerns ray tracing, are not object of this course and are taught in [CS-440 Advanced Computer Grahpics](https://edu.epfl.ch/coursebook/en/advanced-computer-graphics-CS-440).

</div>

## Grading

Each task of this assignment are graded as follow:

* Ambient contribution: 5%
* Diffuse contribution: 15%
* Specular Phong contribution: 10%
* Specular Blinn-Phong contribution: 10%
* Sum of light sources 5%
* Shadows: 25%
* Reflections (theory): 10%
* Reflections (implementation): 20%


## What to Hand in

Please edit the file `readme.md` adding a brief description (approximately 10 to 20 lines) of how you solved the proposed exercises. 
In the same file, report individual contributions following this scheme (sciper in parentheses):

	Name1 Surname1 (000001): 1/3
	Name2 Surname2 (000002): 1/3
	Name3 Surname3 (000003): 1/3

We ask you to only report global contributions, there is no need to provide additional details for each sub-task. 
The three contributions should add up to 1.

Make sure the `theory.md` and `theory.html` files containing the solution to task RT2.3.1 are in the `RT2_light_rays/RT2_theory/` directory.

Compress the directory with all the files it contains – the source code with your solution, the source code you did not modify, the libraries, the readme, etc. – into a `.zip` archive. Rename the zipped file into `Exercise2-Group<GX>.zip`, where `<GX>` is your group number, according to the group you enrolled in on Moodle.

Note that it is your responsibility to check that all the components necessary to run the code are included. **We will run your web app to generate the results. These results will determine your grade**.
