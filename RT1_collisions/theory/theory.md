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
