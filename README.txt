Name: Stephen Brown
Email: stephen.p.brown@wsu.edu
Class: CS442
Programming Assignment #4: Texturing a Superquadratic Surface
Due Date: 11/29/16

References: 
I used the "normal mapped torus" example created by Wayne O. Cochran in order to get
started on this project. I also had some collaboration with Tyler Bounds and Chris Hight
on figuring out how to get the non-uniform texturing working. The rest was finished by
referring to the "Programming Project #4" instructions document.

Overview:
For this project, I created and rendered a superquadratic mesh with a 2D texture map modeling
a shaded superellipsoid surface. I initially began the project by creating a mesh using
the parametric equations from section 2. I also generated the surface normals using
section 2. Doing the above was fairly straight forward, and the hardest part of the
project was generating the texture coordinates that minimized distortion. With help from
section 3, and a lot of trial and error, I was finally able to implement texture coordinates
for non-uniform spaced vertices. After this was finished, the superellipsoid can now have
its m and n bulge factors adjusted without distorting the texture.

Files Included:
* README.txt
* matrix.js
* superellipsoid.html
* superellipsoid.js
* earth.png

.idea folder includes:
* Superellipsoid.iml
* modules
* workspace
* jsLibraryMappings