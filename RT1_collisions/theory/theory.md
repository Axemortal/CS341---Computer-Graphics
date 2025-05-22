---
title: Theory Exercise RT1 – Ray-Cylinder Intersection
---

# Theory Exercise Homework 1 (RT1)

## Ray-Cylinder Intersection

![A cylinder with axis $\mathbf{a}$, center $\mathbf{c}$, radius $r$, and height $h$](images/cyl_diagram.png){width="300px"}

<<<<<<< HEAD
\
We want to derive an expression for the intersection of a ray with a finite, open cylinder.

### Cylinder Equation

A key property of the cylinder is that all points on its surface are equidistant from its axis. This implies the following:

$$
\begin{equation}
||\vec{x} \times \vec{a}|| = ||\vec{x}|| \; ||\vec{a}|| \; \sin\theta = ||\vec{x}|| \; \sin\theta = r
\end{equation}
$$

Additionally, to enforce the height restriction of the cylinder, we require that the point $\vec{x}$ lies within the vertical bounds of the cylinder:

$$
\begin{equation}
(\vec{x} \cdot \vec{a})^2 \leq \left(\frac{h}{2}\right)^2
\end{equation}
$$

### Ray Equation and Substitution

An intersection point between a ray and a cylinder can be described by:

$$
\begin{equation}
\vec{x} = \vec{o} + t \vec{d} - \vec{c}
\end{equation}
$$

where $\vec{o}$ is the ray's origin, $\vec{d}$ is the direction of the ray, $t$ is the parameter, and $\vec{c}$ is the cylinder's center.

Furthermore, the equation must satisfy the aforementioned conditions, which gives us:

$$
\begin{equation}
((\vec{o} + t\vec{d} - \vec{c}) \times \vec{a})^2 = r^2
\end{equation}
$$

$$
\begin{equation}
((\vec{o} + t\vec{d} - \vec{c}) \cdot \vec{a})^2 \leq \left(\frac{h}{2}\right)^2
\end{equation}
$$

### Finding the Intersection Points

$$
\begin{equation}
((\vec{o} + t\vec{d} - \vec{c}) \times \vec{a})^2
\end{equation}
$$

$$
\begin{equation}
= ((\vec{o} - \vec{c}) \times \vec{a} + t (\vec{d} \times \vec{a}))^2
\end{equation}
$$

$$
\begin{equation}
= ||(\vec{o} - \vec{c}) \times \vec{a}||^2 + 2((\vec{o} - \vec{c}) \times \vec{a}) \cdot (\vec{d} \times \vec{a})t + ||\vec{d} \times \vec{a}||^2 t^2 = r^2
\end{equation}
$$\


This is a quadratic equation in $t$:

$$
\begin{equation}
At^2 + Bt + C = 0
\end{equation}
$$

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
=======
**Solution:**

We want to find the intersection between a ray and an **open cylinder** (with no end caps). The cylinder is defined by:
- **Center:** $\mathbf{c}$ (midpoint along the axis)
- **Axis:** $\mathbf{a}$ (unit vector, so $\|\mathbf{a}\|=1$)
- **Radius:** $r$
- **Height:** $h$ (extending from $\mathbf{c}-\tfrac{h}{2}\mathbf{a}$ to $\mathbf{c}+\tfrac{h}{2}\mathbf{a}$)

A **ray** in space is described parametrically as

$$
\mathbf{p}(t) = \mathbf{O} + t\,\mathbf{d},\quad t \ge 0,
$$

where $\mathbf{O}$ is the ray's origin point and $\mathbf{d}$ is its direction vector.

### 1. Infinite Cylinder Equation

A point $\mathbf{x}$ lies on an infinite cylinder (with center $\mathbf{c}$, axis $\mathbf{a}$, and radius $r$) if the distance from $\mathbf{x}$ to the cylinder’s axis is exactly $r$. In other words,

$$
\left\|
(\mathbf{x} - \mathbf{c})
-\left[(\mathbf{x} - \mathbf{c}) \cdot \mathbf{a}\right]\mathbf{a}
\right\| = r.
$$


### 2. Inserting the Ray Equation

Substitute $\mathbf{x} = \mathbf{O} + t\,\mathbf{d}$:
$$
\left\|
(\mathbf{O} - \mathbf{c}) + t\,\mathbf{d}
-\left[((\mathbf{O} - \mathbf{c}) + t\,\mathbf{d})\cdot \mathbf{a}\right]\mathbf{a}
\right\| = r.
$$

Define the perpendicular components:

$$
\mathbf{w}_0 = (\mathbf{O} - \mathbf{c}) - \left[(\mathbf{O} - \mathbf{c}) \cdot \mathbf{a}\right]\mathbf{a},
$$

$$
\mathbf{v} = \mathbf{d} - (\mathbf{d}\cdot \mathbf{a})\,\mathbf{a}.
$$

Then the expression becomes:

$$
\|\mathbf{w}_0 + t\,\mathbf{v}\| = r.
$$

Squaring both sides gives:

$$
(\mathbf{w}_0 + t\,\mathbf{v})\cdot(\mathbf{w}_0 + t\,\mathbf{v}) = r^2.
$$

Expanding the dot product:

$$
(\mathbf{v}\cdot\mathbf{v})\,t^2 + 2\,(\mathbf{w}_0\cdot\mathbf{v})\,t + \left(\mathbf{w}_0\cdot\mathbf{w}_0 - r^2\right) = 0.
$$

Let

$$
a = \mathbf{v}\cdot\mathbf{v},\quad b = 2\,(\mathbf{w}_0\cdot\mathbf{v}),\quad c = \mathbf{w}_0\cdot\mathbf{w}_0 - r^2.
$$

Thus, we have the quadratic equation:

$$
a\,t^2 + b\,t + c = 0.
$$


### 3. Solving the Quadratic

Define the discriminant 

$$
\Delta = b^2 - 4ac.
$$ 

Then:
- If $\Delta < 0$, there is no real intersection.
- If $\Delta \ge 0$, the solutions are

$$
t = \frac{-b \pm \sqrt{\Delta}}{2a}.
$$

### 4. Clipping to the Open Cylinder

We must ensure that the intersection lies within the finite cylinder height. For a valid intersection:
- $t \ge 0$, and
- The projection of the hit point onto the axis must satisfy

$$
-\frac{h}{2} \le \left[(\mathbf{O} - \mathbf{c}) + t\,\mathbf{d}\right] \cdot \mathbf{a} \le \frac{h}{2}.
$$

### 5. Computing the Cylinder Normal

For a valid intersection at $t$, the intersection point is

$$
\mathbf{p}(t) = \mathbf{O} + t\,\mathbf{d}.
$$

The normal vector (pointing outward) is the direction from the cylinder axis to $\mathbf{p}(t)$, given by:

$$
\mathbf{N} = \frac{(\mathbf{p}(t) - \mathbf{c}) - \left[(\mathbf{p}(t) - \mathbf{c}) \cdot \mathbf{a}\right]\mathbf{a}}{\left\|(\mathbf{p}(t) - \mathbf{c}) - \left[(\mathbf{p}(t) - \mathbf{c}) \cdot \mathbf{a}\right]\mathbf{a}\right\|}.
$$

Or, equivalently, using our defined vectors:

$$
\mathbf{N} = \frac{\mathbf{w}_0 + t\,\mathbf{v}}{\|\mathbf{w}_0 + t\,\mathbf{v}\|}.
$$

---
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
