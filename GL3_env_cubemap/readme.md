# Solution Description

<<<<<<< HEAD
**GL3.1**: To repeat the pattern, we scale the mapping factor from vertex coordinates to texture coordinates by a factor of 4. Additionally, we adjust the texture load options so that out-of-bounds coordinates are wrapped using the repeat mode. To correctly extract colors based on these coordinates, we also introduce a `texture2D` sampler in the fragment shader.  

**GL3.2**: We define a cube camera projection using the provided parameters. The aspect ratio and field of view (fovy) are derived through basic geometric calculations, aligning the frustum with a cube. Each face's up direction is adjusted to match WebGL conventions. Instead of sampling from a 2D texture, we now sample from a 3D cube environment map using a calculated reflection vector to retrieve the appropriate color.  

**GL3.3**: This merges GL2 and GL3.2, incorporating lighting calculations with additional attenuation terms. A shadow map is utilized to determine whether diffuse and specular components should contribute to each pixel. We also modify the blend settings to ensure that light sources accumulate their contributions rather than overwriting previous values.

# Contributions

Yifan Wu (402391): 1/3

Eunice Lee (402359): 1/3

Howell Chan (402360): 1/3
=======
TODO: add a brief description (approximately 10 to 20 lines) of how you solved the proposed exercises

# Contributions

Name1 Surname1 (000001): 1/3

Name2 Surname2 (000002): 1/3

Name3 Surname3 (000003): 1/3
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
