---
title: Theory Exercise RT1 – Ray-Cylinder Intersection
---

# Theory Exercise Homework 1 (RT1)

## Ray-Cylinder Intersection

![A cylinder with axis $\mathbf{a}$, center $\mathbf{c}$, radius $r$, and height $h$](images/cyl_diagram.png){width="300px"}

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