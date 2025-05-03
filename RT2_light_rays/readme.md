# Solution Description

<<<<<<< HEAD
Following the Phong model introduced in the lecture, we implemented lighting at each ray intersection point by accounting for ambient light on the material, along with the combined contributions of diffuse and specular lighting from each light source.  

Shadow implementation is straightforward, but special attention is needed to avoid shadow acne caused by self-intersections. To mitigate this, we applied an offset of 0.005 multiplied by the light direction, determined empirically by analyzing the generated images to ensure shadow accuracy.  

For reflections, we derived the recursive formula and validated its consistency with the one provided in the HTML exercise handout. After deriving the equation, we refined the approach by limiting the number of reflections. The implementation follows an iterative method, accumulating the contributions of reflected rays to compute the final color of each output pixel. Similar to shadow acne, self-reflection and reflection artifacts needed to be avoided. To mitigate these issues, we applied the same technique used for shadow acne prevention—adding an offset of 0.005 multiplied by the ray direction.

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
