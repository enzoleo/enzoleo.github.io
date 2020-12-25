---
layout: post
title: "Expected Distance between Rectangles"
author: "Enzo"
categories: resources
tags: [tech]
---

Given two rectangles on the Euclidean plane with edges parallel to the axes, how to calculate their expected distance? Specifically, given two points $$(x_1,y_1),(x_2,y_2)$$ as the bottom-left and top-right corners of the first rectangle $$A$$, and similarly $$(u_1,v_1),(u_2,v_2)$$ as those of the second rectangle $$B$$, we are required to calculate the integral

$$\frac{1}{h}\int_B\int_A\|\boldsymbol{x}-\boldsymbol{y}\|_2\mathrm{d}\boldsymbol{x}\mathrm{d}\boldsymbol{y},$$

where $$h$$ is the multiplication of rectangle areas. It seems to be a simple question... However, you may find it very difficult to solve from the above formula. This kind of problems called **line picking** between rectangles is an interesting but very hard puzzle. Specifically, what we are discussing here is [hypercube line picking](https://mathworld.wolfram.com/HypercubeLinePicking.html) problem. The integral form can be reformulated as follows,

$$\iint_{\Omega}\sqrt{r^2+s^2}p_1(r)p_2(s)\mathrm{d}r\mathrm{d}s,$$

where $$r,s$$ denote the horizontal and vertical distance between $$\boldsymbol{x},\boldsymbol{y}$$, respectively. Notations $$p_1(r),p_2(s)$$ denote the corresponding density functions. The integration region $$\Omega$$ is a rectangle. In two-dimensional cases, we can transform the complicated representation into a double integral by this method.

## Numerical Integration

Consider this problem as a [numerical integration](https://en.wikipedia.org/wiki/Numerical_integration), there are a bunch of approaches to accomplish this task, *e.g.* [trapezoidal rule](https://en.wikipedia.org/wiki/Trapezoidal_rule), [Simpson's rule](https://en.wikipedia.org/wiki/Simpson%27s_rule), [Newton–Cotes formulas](https://en.wikipedia.org/wiki/Newton%E2%80%93Cotes_formulas), [Romberg's method](https://en.wikipedia.org/wiki/Romberg%27s_method). If someone prefers [Monte-Carlo methods](https://en.wikipedia.org/wiki/Monte_Carlo_method), it is indeed feasible, however the result might be very imprecise.

Let us apply the [Simpson's rule](https://en.wikipedia.org/wiki/Simpson%27s_rule) as an example. Let function $$p(r,s)$$ denote the integrand

$$p(r,s)=\sqrt{r^2+s^2}p_1(r)p_2(s).$$

The numerical integration can be conducted in this way,

$$\iint_{\Omega}p(r,s)\mathrm{d}r\mathrm{d}s=\int_{s_{\min}}^{s_{\max}}\int_{r_{\min}}^{r_{\max}}p(r,s)\mathrm{d}r\mathrm{d}s,$$

$$\int_{s_{\min}}^{s_{\max}}\int_{r_{\min}}^{r_{\max}}p(r,s)\mathrm{d}r\mathrm{d}s\approx\frac{\Delta r\Delta s}{9mn}\mathrm{tr}(\boldsymbol{w}_n\boldsymbol{w}_m^{\top}\boldsymbol{F}),$$

where $$\Delta r=r_{\max}-r_{\min},\Delta s=s_{\max}-s_{\min}$$, $$m,n$$ are the number of grids in horizontal and vertical direction, respectively. Vector $$\boldsymbol{w}_k$$ for even number $$k>0$$ is defined as

$$\boldsymbol{w}_k=[1,4,2,4,\cdots,2,4,1]^\top\in\mathbb{R}^{k+1}.$$

The matrix $$\boldsymbol{F}$$ is the function value

$$\boldsymbol{F}=\begin{bmatrix}

p(r_0,s_0)&p(r_0,s_1)&\cdots&p(r_0,s_n)\\

p(r_1,s_0)&p(r_1,s_1)&\cdots&p(r_1,s_n)\\

\vdots&\vdots&\ddots&\vdots\\

p(r_m,s_0)&p(r_m,s_1)&\cdots&p(r_m,s_n)\\

\end{bmatrix},$$

where $$r_i,s_j$$ denote the $$i,j$$-th grid points in the horizontal and vertical direction, respectively. One can implement this [Simpson's rule](https://en.wikipedia.org/wiki/Simpson%27s_rule) to calculate the integral numerically. By enlarging $$m,n$$ the numerical result will be very precise.