# Solution Description

GL2.1.1: The triangle normal was computed using the cross product of two edge vectors, followed by normalization. The opening angles at each vertex were determined using the vec3.angle() function. Finally, the normal was stored in tri_normals, and the angles were saved in angle_weights.

GL2.1.2: The vertex normals were computed by accumulating weighted triangle normals for each vertex. Each normal was scaled by its corresponding angle weight before being added to the respective vertex normal.

GL2.2.1: The model-view-projection (mat_mvp) matrix is computed by combining the model, view, and projection matrices to correctly position vertices in camera space. A varying variable frag_normal is used to pass vertex normals from the vertex shader to the fragment shader, where they are interpolated. The fragment shader visualizes normals using false color by mapping the normalized normal vector to the 0-1 range. Since interpolation can distort normals, re-normalizing them in the fragment shader ensures accuracy.

GL2.2.2: The mat_normals_to_view matrix is computed by transposing and inverting the model-view matrix. In the vertex shader, normals are transformed using this matrix before being passed to the fragment shader. 

GL2.3: In Gouraud shading, all lighting calculations are performed in the vertex shader. First, we transform each vertex’s position into view space using the model-view matrix, and similarly transform the normals into view space using the inverse-transpose of the model-view matrix. Next, we compute the light vector (from the vertex to the light) and the view vector (from the vertex toward the camera) in view space. Then, we apply the Blinn–Phong lighting model to calculate diffuse and specular components along with an ambient term. Finally, we stored the resulting color in a varying variable that gets interpolated across the surface and passed to the fragment shader for display.

GL2.4: For Phong shading, the vertex shader is used only to transform data and pass interpolated values to the fragment shader. In the vertex shader, compute and output the surface normal, the light vector, and the view vector in view space as varying variables. In the fragment shader, these interpolated values are normalized to correct for interpolation artifacts. Then, the Blinn–Phong lighting formula is computed per pixel using these normalized values. This approach yields smoother and more accurate shading across the surface, particularly on large polygons where per-vertex lighting can cause dark or incorrectly lit areas.

# Contributions

Yifan Wu (402391): 1/3

Eunice Lee (402359): 1/3

Howell Chan (402360): 1/3