---
title: Final Project Report CS-341 2025
---

# Cyberpunk City: A Dynamically Evolving Urban Landscape

<div>
<video src="videos/demo_teaser.mp4" height="300px" autoplay loop></video>
</div>
<figcaption style="text-align: center;">A short teaser video, gif, or image showing an overview of the final result.</figcaption>

## Abstract

This project presents an immersive, ever-evolving cyberpunk city. Key features include stylized 3D buildings via Wave Function Collapse (WFC), realistic water reflections using Screen-Space Reflections (SSR), and animated billboards with dynamic textures and bloom effects. These components combine to create a vibrant, self-evolving urban landscape that draws users into a futuristic cyberpunk world.

## Overview

<div style="display: flex; justify-content: space-around; align-items: center;">
<div>
<img src="images/demo_detail.png" height="210px" style="vertical-align: middle;">
</div>
<div>
<video src="videos/demo_detail.mp4" height="210px" autoplay loop style="vertical-align: middle;"></video>
</div>
</div>
<figcaption style="text-align: center;">Some more visuals focusing on interesting details of your scene.</figcaption>

TODO

## Feature validation

<table>
	<caption>Feature Summary</caption>
	<thead>
		<tr>
			<th>Feature</th>
			<th>Adapted Points</th>
			<th>Status</th>
		</tr>
	</thead>
	<!-- <td style="background-color: #cce5ff;">Missing</td> -->
	<!-- <td style="background-color: #e8ebca;">Partially Completed</td> -->
    <tbody>
    	<tr>
    		<td>Runtime-evolving bloom effects on billboards</td>
    		<td>5</td>
    		<td style="background-color: #d4edda;">Completed</td>
    	</tr>
    	<tr>
    		<td>Dynamic billboard texture generation with noise</td>
    		<td>10</td>
    		<td style="background-color: #d4edda;">Completed</td>
    	</tr>
    	<tr>
    		<td>Wave Function Collapse (WFC)</td>
    		<td>15</td>
    		<td style="background-color: #d4edda;">Completed</td>
    	</tr>
    	<tr>
    		<td>Screen-Space Reflections (SSR)</td>
    		<td>20</td>
    		<td style="background-color: #d4edda;">Completed</td>
    	</tr>
    </tbody>

</table>

### Runtime-evolving bloom effects on billboards

#### Implementation

TODO

#### Validation

TODO

### Dynamic billboard texture generation with noise

#### Implementation

TODO

#### Validation

TODO

### Wave Function Collapse (WFC)

#### Implementation

TODO

#### Validation

TODO

### Screen-Space Reflections (SSR)

#### Implementation

For a more in-depth explanation, please refer to the [SSR Guide by David Lettier](#references), which served as the primary inspiration for this feature’s implementation.

Our approach follows these main steps:

1. **Render the base image** without any reflections or shadows into a texture.
2. **Generate a reflection map** to determine which points in the base texture should be sampled for reflections. This involves:
   a. Calculating the position, normal, and reflection vector for each point on a reflective surface.
   b. Using the position and reflection vector to determine the start and end points for ray marching.
   c. Converting these coordinates into screen space for performance efficiency, as ray marching in screen space reduces redundant sampling.
   d. Performing ray marching, with a sampling rate defined by a resolution factor.
   e. Recording hits by checking whether any scene geometry is sufficiently close to the sampled points along the reflection ray.
   f. Refining the hit point to accurately determine where to sample the reflection color.
   g. Applying fade factors based on edge proximity, distance from the reflection plane, and other conditions to create a more natural reflection effect.
3. **Sample reflection colors** from the base texture using the UV indices generated from the ray-marched hits. We also fill in gaps between sample points to reduce visual noise in the reflection.
4. **Apply a blur** to the sampled reflection colors and store the result in a separate texture.
5. **Combine everything** to produce the final reflection output by blending the base image with both the original and blurred reflection textures, using weighting factors for a smooth and realistic result.

#### Validation

<div style="display: flex; justify-content: space-around; align-items: center;">
<div>
<img src="images/ssr_reflection_uv.png" height="210px" style="vertical-align: middle;">
</div>
</div>
<figcaption style="text-align: center;">Visualised UV coordinates sampled for SSR</figcaption>

<div style="display: flex; justify-content: space-around; align-items: center;">
<div>
<img src="images/ssr_validation_1.png" height="210px" style="vertical-align: middle;">
</div>
<div>
<img src="images/ssr_validation_2.png" height="210px" style="vertical-align: middle;">
</div>
</div>
<figcaption style="text-align: center;">Validating SSR implementation on sample scene</figcaption>

<div style="display: flex; justify-content: space-around; align-items: center;">
<div>
<img src="images/ssr_validation_final.png" height="210px" style="vertical-align: middle;">
</div>
</div>
<figcaption style="text-align: center;">Final integration of SSR into the complete project scene</figcaption>

## Discussion

### Additional Components

TODO

### Failed Experiments

TODO

### Challenges

At the start, navigating the codebase was quite challenging, even with the existing guide. To improve clarity and consistency for the entire team, we carried out a major refactor of the codebase — introducing standardized naming conventions and a unified structure for handling vertex and fragment shaders.

In particular, we streamlined the use of vertex shaders by consolidating repeated versions into a single, reusable shader (`pass_through.vert.glsl`), reducing redundancy across different shader renderers.

Furthermore, to streamline the debugging process, we rendered many of the computer-generated images to textures, allowing us to directly choose which texture to render to. This made it much easier to inspect specific texture layers and directly debug individual shader renderers.

## Contributions

<table>
	<caption>Worked hours</caption>
	<thead>
		<tr>
			<th>Name</th>
			<th>Week 1</th>
			<th>Week 2</th>
			<th>Week 3</th>
			<th>Week 4</th>
			<th>Week 5</th>
			<th>Week 6</th>
			<th>Week 7</th>
			<th>Total</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Eunice Lee (402359)</td>
			<td>2</td>
			<td style="background-color: #f0f0f0;">5</td>
			<td>4</td>
			<td>4</td>
			<td>6</td>
			<td>6</td>
			<td>8</td>
			<td>35</td>
		</tr>
		<tr>
			<td>Howell Chan (402360)</td>
			<td>2</td>
			<td style="background-color: #f0f0f0;">5</td>
			<td>6</td>
			<td>6</td>
			<td>6</td>
			<td>6</td>
			<td>6</td>
			<td>37</td>
		</tr>
		<tr>
			<td>Yifan Wu (402391)</td>
			<td>0</td>
			<td style="background-color: #f0f0f0;">20</td>
			<td>4</td>
			<td>4</td>
			<td>4</td>
			<td>2</td>
			<td>2</td>
			<td>36</td>
		</tr>
	</tbody>
</table>

<table>
	<caption>Individual contributions</caption>
	<thead>
		<tr>
			<th>Name</th>
			<th>Contribution</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Eunice Lee (402359)</td>
			<td>1/3</td>
		</tr>
		<tr>
			<td>Howell Chan (402360)</td>
			<td>1/3</td>
		</tr>
		<tr>
			<td>Yifan Wu (402391)</td>
			<td>1/3</td>
		</tr>
	</tbody>
</table>

#### Comments

For this project:

- Eunice focused on generating dynamic textures using noise and contributed to integrating the final scene.
- Howell implemented dynamic building generation using **Wave Function Collapse** and also worked on integrating the final scene.
- Yifan refactored the initial codebase to ensure a consistent and unified implementation, and developed the **Screen-Space Reflection Feature**.

## References

- [SSR Guide by David Lettier](https://github.com/lettier/3d-game-shaders-for-beginners/blob/master/sections/screen-space-reflection.md)
