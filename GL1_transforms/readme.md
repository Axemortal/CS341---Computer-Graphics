# Solution Description

**GL1.1**: To determine the new position of the blue triangle, we simply add the `mouse_offset` to its previous position. The moving triangles were a bit trickier, but by carefully considering the order of translation and rotation matrices, and after some trial and error, we were able to achieve the expected result.  

**GL1.2.1**: Handling the MVP matrix was straightforward—we just needed to multiply the given matrices and apply the transformation to the scene’s vertices.  

**GL1.2.2**: From the documentation, we learned that `mat4.lookAt` generates a transformation matrix based on the camera’s position in world coordinates. The numerical values for the camera position were intuitive with the provided diagram, but some trial and error was needed to match the sign conventions used in the reference example.  

**GL1.2.3**: This task was simple once we understood the approach. Recognizing how certain objects orbit and translate was key. Implementing scaling and rotation along the z-axis was straightforward.  

*P.S. Appreciate the quick and practical tutorial—it really helped us get familiar with different stages of the rasterization pipeline and understand the role of vertex and fragment shaders.*

# Contributions

Yifan Wu (402391): 1/3

Eunice Lee (402359): 1/3

Howell Chan (402360): 1/3