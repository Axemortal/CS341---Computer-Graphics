---
title: Theory Exercise RT1 – Ray-Cylinder Intersection
---

# Theory Exercise Homework 1 (RT1)

## Ray-Cylinder Intersection

![A cylinder with axis $\mathbf{a}$, center $\mathbf{c}$, radius $r$, and height $h$](images/cyl_diagram.png){width="300px"}

To define the cylinder equation, we start with an arbitrary point $P$ that passes through the cylinder, and $P\perp$ is the perpendicular component of $P - C$ relative to the axis $a$:

$$
\begin{equation}
P\perp = (P - C) - (a\cdot(P - C))a
\end{equation}
$$

A point $P$ lies on the cylinder if its perpendicular distance from the axis is equal to $r$:

$$
\begin{equation}
||P\perp||^2 = r^2
\end{equation}
$$

A ray is defined as:

$$
\begin{equation}
\mathbf{R}(t) = \mathbf{O} + t\mathbf{d}
\end{equation}
$$

where $\mathbf{O}$ is the ray origin, $\mathbf{d}$ is the ray direction (normalized), $t$ is the parameter to solve for.

Substituting $\mathbf{P} = \mathbf{R}(t) = \mathbf{O} + t \mathbf{d}$ into the cylinder equation:

$$
\begin{equation}
||(\mathbf{O} + t\mathbf{d} - \mathbf{C}) - (\mathbf{a}\cdot(\mathbf{O} + t\mathbf{d} - \mathbf{C}))\mathbf{a}||^2 = \mathbf{r}^2
\end{equation}
$$
Define $\mathbf{V} = \mathbf{O} - \mathbf{C}$, 
$$
\begin{equation}
||(\mathbf{V} + t\mathbf{d}) - (\mathbf{a}\cdot(\mathbf{V} + t\mathbf{d} ))\mathbf{a}||^2 = \mathbf{r}^2
\end{equation}
$$

Factoring: 
$$
\begin{equation}
||(\mathbf{V} -(\mathbf{a}\cdot\mathbf{V})\mathbf{a}) + t(\mathbf{d} -(\mathbf{a}\cdot\mathbf{d})\mathbf{a})||^2 = \mathbf{r}^2
\end{equation}
$$
Define: 
$$
\begin{equation}
\mathbf{V}\perp = (\mathbf{V} -(\mathbf{a}\cdot\mathbf{V})\mathbf{a}), \;\;\;\;\; \mathbf{d}\perp = (\mathbf{d} -(\mathbf{a}\cdot\mathbf{d})\mathbf{a})
\end{equation}
$$
Equation simplifies to: 
$$
\begin{equation}
||\mathbf{V}\perp + \: t \mathbf{d}\perp)||^2 = \mathbf{r}^2
\end{equation}
$$
Expanding: 
$$
\begin{equation}
\mathbf{V}\perp\cdot\mathbf{V}\perp + 2t(\mathbf{V}\perp\cdot\mathbf{d}\perp) + t^2(\mathbf{d}\perp\cdot\mathbf{d}\perp) = \mathbf{r}^2
\end{equation}
$$
Rearrange into Quadratic form:
$$
\begin{equation}
At^2 + Bt + C = 0
\end{equation}
$$
<<<<<<< HEAD
where: 
$$
\begin{equation}
A = \mathbf{d}\perp\cdot\mathbf{d}\perp
\end{equation}
$$
$$
\begin{equation}
B = 2(\mathbf{V}\perp\cdot\mathbf{d}\perp)
\end{equation}
$$
$$
\begin{equation}
C = (\mathbf{V}\perp\cdot\mathbf{V}\perp) - \mathbf{r}^2
\end{equation}
$$
Solve using the Quadratic formula: 
$$
\begin{equation}
t = \frac{-\mathbf{B} \pm \sqrt{\mathbf{B}^2 - 4\mathbf{A}\mathbf{C}}}{2\mathbf{A}}
\end{equation}
$$\
If $\:$ $\mathbf{B}^2 - 4\mathbf{A}\mathbf{C} < 0$, no real solution and therefore no intersection.\
If 2 solution exists, pick the smaller positive t, since the ray moves forward.\
Substitute $t$ into ray equation to get point $P$\
Check that the intersection lies within the height bounds of the cylinder by: 
$$
\begin{equation}
|(\mathbf{P} - \mathbf{C})\cdot\mathbf{a}| \leq \frac{\mathbf{h}}{2}
\end{equation}
$$
To compute the cylinder normal at point $P$,
$$
\begin{equation}
\mathbf{N} = \frac{\mathbf{P}\perp}{||\mathbf{P}\perp||} = \frac{\mathbf{P}\perp}{\mathbf{r}}
\end{equation}
$$
If the dot product of the ray direction and the normal is positive, then the ray is hitting the cylinder from the inside, and we need to flip the normal:
$$
\begin{equation}
(\mathbf{N}\cdot\mathbf{d}) > 0, \;\;\;\mathbf{N} = -\mathbf{N}
\end{equation}
$$
=======

where

$$
\begin{equation}
A = ||\vec{d} \times \vec{a}||^2
\end{equation}
$$

$$
\begin{equation}
B = 2 ((\vec{o} - \vec{c}) \times \vec{a}) \cdot (\vec{d} \times \vec{a})
\end{equation}
$$

$$
\begin{equation}
C = ||(\vec{o} - \vec{c}) \times \vec{a}||^2 - r^2
\end{equation}
$$

Solving this quadratic equation:

$$
\begin{equation}
t = \frac{-B \pm \sqrt{B^2 - 4AC}}{2A}
\end{equation}
$$

#### Case Breakdown:
- If $A = 0$, this implies that the ray is parallel to the cylinder's axis, and no intersection exists unless the ray directly hits the top or bottom of the cylinder.
- If the discriminant $B^2 - 4AC < 0$, there is no real solution, meaning the ray does not intersect the cylinder.
- If the discriminant $B^2 - 4AC \geq 0$, we have one or two real solutions for $t$.
- If $t < 0$, the intersection point lies behind the ray’s origin, so the intersection is considered invalid.

### Enforce Height Condition

Once we find the solutions for $t$, we need to ensure that the intersection points lie within the height of the cylinder. We impose the following condition to ensure the intersection point is within the vertical bounds:

$$
\begin{equation}
((\vec{o} + t \vec{d} - \vec{c}) \cdot \vec{a})^2 \leq \left( \frac{h}{2} \right)^2
\end{equation}
$$

$$
\begin{equation}
\left( (\vec{o} - \vec{c}) \cdot \vec{a} + t (\vec{d} \cdot \vec{a}) \right)^2 \leq \left( \frac{h}{2} \right)^2
\end{equation}
$$

$$
\begin{equation}
\left| (\vec{o} - \vec{c}) \cdot \vec{a} + t (\vec{d} \cdot \vec{a}) \right| \leq \frac{h}{2}
\end{equation}
$$

Thus, the parameter $t$ must lie within the following range to satisfy the height condition:

$$
\begin{equation}
\frac{-\frac{h}{2} - (\vec{o} - \vec{c}) \cdot \vec{a}}{\vec{d} \cdot \vec{a}} \leq t \leq \frac{\frac{h}{2} - (\vec{o} - \vec{c}) \cdot \vec{a}}{\vec{d} \cdot \vec{a}}
\end{equation}
$$

This results in constraints on $t$, ensuring it lies within the valid height range of the cylinder.

#### Case Breakdown:
- **No solution:** If no real solution exists for $t$, the ray does not intersect the finite, open cylinder.
- **One solution:** If there is exactly one solution for $t$, this represents the only intersection point between the ray and the cylinder.
- **Two solutions:** If two solutions exist, we take the smaller value of $t$, as it corresponds to the first intersection point the ray hits.

### Determining the Normal to the Surface

To determine whether the ray intersects the inside or the outside of the cylinder, we first need to compute the surface normal at the intersection point.

The normal vector to the cylinder's surface at any given point can be derived as follows:

1. Calculate the vector from the center of the cylinder to the intersection point:
    $$
    \begin{equation}
    \vec{y} = \vec{o} + t\vec{d} - \vec{c}
    \end{equation}
    $$

2. Extract the component of $\vec{y}$ parallel to the cylinder's axis $\vec{a}$:
    $$
    \begin{equation}
    (\vec{y} \cdot \vec{a}) \vec{a}
    \end{equation}
    $$

3. Subtract the parallel component to obtain the perpendicular component, which gives the surface normal. This normal points outward from the cylinder's surface:
    $$
    \begin{equation}
    \vec{n} = \vec{y} - (\vec{y} \cdot \vec{a}) \vec{a}
    \end{equation}
    $$

Now, to determine whether the ray hits the inside or the outside of the cylinder, we compute the dot product between the ray's direction vector $\vec{d}$ and the normal vector $\vec{n}$.

- If the dot product $\vec{d} \cdot \vec{n}$ is **negative**, the normal vector is pointing away from the ray, indicating that the ray intersects the **outside** of the cylinder.
- If the dot product $\vec{d} \cdot \vec{n}$ is **positive**, the normal vector is pointing toward the ray, meaning the ray hits the **inside** of the cylinder.

If the ray intersects the inside, we adjust the normal vector by flipping its direction to correctly reflect the normal pointing toward the camera.

### Edge Case for $A = 0$: Ray Parallel to the Cylinder's Axis

When $A = 0$, the ray is parallel to the cylinder's axis. In this case, we need to check whether the origin of the ray lies on the surface of the cylinder, which is necessary for the ray to intersect the cylinder at its top and bottom edges. If the ray is parallel but the origin does not lie on the surface, there will be no intersection.

 At $t = 0$, the position vector of the ray is:

$$
\begin{equation}
\vec{x} = \vec{o} + t \vec{d} - \vec{c} = \vec{o} - \vec{c} \quad \text{(for } t = 0\text{)}
\end{equation}
$$

Now, we verify if the origin lies on the surface of the cylinder. This is done by checking if the radial distance from the cylinder’s axis is equal to the radius $r$. This condition is:

$$
\begin{equation}
((\vec{o} - \vec{c}) \times \vec{a})^2 = r^2
\end{equation}
$$

If this condition holds true, the ray’s origin is on the surface of the cylinder. We can now proceed to determine the points of intersection.

### Intersection with the Top and Bottom Edges

These top and bottom edges of the cylinder are located at a distance $\pm \left(\frac{h}{2}\right)$ from the center of the cylinder. 

To find the intersection with the top or bottom, we use the following condition for the dot product with the axis $\vec{a}$, which gives the height of the ray at a particular $t$:

$$
\begin{equation}
(\vec{o} + t \vec{d} - \vec{c}) \cdot \vec{a} = \pm \frac{h}{2}
\end{equation}
$$

Now we solve for $t$ in this equation:

$$
\begin{equation}
t = \frac{\pm \frac{h}{2} - ((\vec{o} - \vec{c}) \cdot \vec{a})}{\vec{d} \cdot \vec{a}}
\end{equation}
$$

Here, the solution for $t$ will give the points where the ray intersects either the top or bottom edges of the cylinder.

If $t < 0$, the intersection point lies behind the ray’s origin, and thus the intersection is considered invalid.

Valid intersections will result in a normal that is the negative of the ray's direction vector.
>>>>>>> origin/main
