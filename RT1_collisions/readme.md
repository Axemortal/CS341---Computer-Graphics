# Solution Description

RT1.1 is straightforward to implement once you determine an effective way to represent the plane. With the right representation, you can ignore all points parallel to the plane and simply solve for the intersection using the plane and ray equations.  

RT1.2.1 is a bit more challenging. While it's clear that a cylinder's surface consists of points equidistant from its axis, finding a suitable parameter *t* that satisfies both the ray and cylinder equations requires more effort.  

RT1.2.2 is relatively easy to implement since the mathematical groundwork was already established in RT1.2.1. However, the implementation was slightly more complex than RT1.1 due to the need to track multiple variables efficiently and avoid redundant calculations.


# Contributions

Yifan Wu (000001): 1/3

Eunice Lee (000002): 1/3

Howell Chan (000003): 1/3