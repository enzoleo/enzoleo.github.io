---
layout: post
title: "Expected Distance between Rectangles"
author: "Enzo"
categories: resources
tags: [tech]
---

Given two rectangles on the Euclidean plane with edges parallel to the axes, how to calculate their expected distance? Specifically, given two points $$(x_1,y_1),(x_2,y_2)$$ as the bottom-left and top-right corners of the first rectangle $$A$$, and similarly $$(u_1,v_1),(u_2,v_2)$$ as those of the second rectangle $$B$$, we are required to calculate the integral

$$\frac{1}{h}\int_{v_1}^{v_2}\int_{u_1}^{u_2}\int_{y_1}^{y_2}\int_{x_1}^{x_2}\sqrt{(x-u)^2+(y-v)^2}\mathrm{d}x\mathrm{d}y\mathrm{d}u\mathrm{d}v,$$

where $$h=(x_2-x_1)(y_2-y_1)(u_2-u_1)(v_2-v_1)$$ is the multiplication of rectangle areas. It seems to be a simple question... However, you may find it very difficult to solve from the above formula.
