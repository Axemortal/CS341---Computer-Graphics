---
title: Theory Exercise RT2 – Lighting and Light Rays
---

# Theory Exercise Homework 2 (RT2)

## Lighting and Light Rays

### Derivation of the Iterative Formula
<<<<<<< HEAD

We are given that the resulting colour for a given pixel $c_b$ is expressed as:

$$
\begin{equation}
c_b = (1-\alpha_0)c_0 + \alpha_0 c^1
\end{equation}
$$

Additionally, the value of $c^1$ is defined by the equation:

$$
\begin{equation}
c^1 = (1-\alpha_1)c_1 + \alpha_1 c^2
\end{equation}
$$

Expanding this recursively, we get

$$
\begin{aligned}
    c_b &= (1-\alpha_0)c_0 + \alpha_0[(1-\alpha_1)c_1 + \alpha_1 c^2] \\
        &= (1-\alpha_0)c_0 + \alpha_0(1-\alpha_1)c_1 + \alpha_0\alpha_1(1-\alpha_2)c_2 + \cdots \\
        &= \sum_{i=0}^{+\infty} (1 - \alpha_i) \left(\prod_{k=0}^{i-1} \alpha_k \right) c_i
\end{aligned}
$$




### Simplification for $N$ Reflections

For $N$ reflections, the resulting colour $c_b$ is given by the following summation:

$$
\begin{equation}
    c_b = \sum_{i=0}^{N} (1 - \alpha_i) \left(\prod_{k=0}^{i-1} \alpha_k \right) c_i
\end{equation}
$$
=======
Write your solution here.

### Simplification for $N$ Reflections
Write your solution here.
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
