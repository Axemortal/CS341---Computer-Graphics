
const SCENES = [
{
	name: "castle",
	camera: { position: [24.186, -55.742, 26.689], up: [-0.136, 0.305, 0.943], target: [20.357, -47.128, 23.352], fov: 50 },
	materials: [
		{name: "default", color: [0.6, 0.6, 0.6], ambient: 0.2, diffuse: 0.8, specular: 0.4, shininess: 2.0, mirror: 0.02},
		{name: "wall", color: [0.6, 0.6, 0.6], ambient: 0.2, diffuse: 0.9, specular: 0.05, shininess: 2.0, mirror: 0.0},
		{name: "grass", color: [0.1, 0.3, 0.1], ambient: 0.2, diffuse: 0.5, specular: 0.1, shininess: 2.0, mirror: 0.0},
		{name: "gold", color: [0.7, 0.6, 0.0], ambient: 0.2, diffuse: 0.4, specular: 0.8, shininess: 4.0, mirror: 0.4},
		{name: "water", color: [0.6, 0.8, 1.0], ambient: 0.2, diffuse: 0.1, specular: 1.0, shininess: 4.0, mirror: 0.7},
		{name: "sky", color: [0.4, 0.4, 0.9], ambient: 0.2, diffuse: 0.9, specular: 0.0, shininess: 8.0, mirror: 0.0},
		{name: "cloud", color: [1.0, 1.0, 1.0], ambient: 0.4, diffuse: 0.7, specular: 0.0, shininess: 2.0, mirror: 0.0}
	],
	lights: [
		{ position: [10.539, -61.862, 55.018], color: [1.0, 0.719, 0.413] },
	],
	spheres: [
		{ center: [0.0, 0.0, -21.682], radius: 23.973, material: "grass" },
		{ center: [-1.002, 1.805, 11.07], radius: 2.039, material: "gold" },
		{ center: [-1.002, 1.805, 13.068], radius: 1.349, material: "gold" },
		{ center: [-1.002, 1.805, 14.636], radius: 0.836, material: "gold" },
		{ center: [3.601, -2.688, 14.475], radius: 0.836, material: "gold" },
		{ center: [3.601, -2.688, 12.907], radius: 1.349, material: "gold" },
		{ center: [3.601, -2.688, 10.908], radius: 2.039, material: "gold" },
		{ center: [5.703, 3.276, 6.737], radius: 2.63, material: "gold" },
		{ center: [17.552, 30.95, -21.236], radius: 21.337, material: "grass" },
		{ center: [-30.014, -18.202, -21.937], radius: 21.337, material: "grass" },
		{ center: [24.793, -17.593, -21.636], radius: 21.337, material: "grass" },
		{ center: [5.641, 3.409, 9.028], radius: 1.349, material: "gold" },
		{ center: [-11.228, -2.638, 25.215], radius: 1.922, material: "cloud" },
		{ center: [-12.143, -3.811, 23.235], radius: 2.309, material: "cloud" },
		{ center: [-13.484, -2.399, 26.174], radius: 2.086, material: "cloud" },
		{ center: [-13.333, -7.328, 22.772], radius: 4.715, material: "cloud" },
		{ center: [-18.142, -7.591, 23.955], radius: 2.309, material: "cloud" },
		{ center: [-14.456, -5.548, 19.708], radius: 2.309, material: "cloud" },
		{ center: [-9.43, -4.96, 23.767], radius: 2.309, material: "cloud" },
		{ center: [-17.206, -9.675, 20.389], radius: 3.484, material: "cloud" },
		{ center: [-20.278, -11.128, 19.47], radius: 1.387, material: "cloud" },
		{ center: [-7.209, 15.244, 32.023], radius: 1.7, material: "cloud" },
		{ center: [-4.279, 16.884, 29.314], radius: 4.27, material: "cloud" },
		{ center: [4.687, 21.667, 23.143], radius: 2.83, material: "cloud" },
		{ center: [0.993, 15.483, 26.507], radius: 2.83, material: "cloud" },
		{ center: [-0.934, 19.277, 32.479], radius: 2.83, material: "cloud" },
		{ center: [0.438, 20.004, 26.602], radius: 5.779, material: "cloud" },
		{ center: [-2.997, 14.757, 24.082], radius: 2.556, material: "cloud" },
		{ center: [4.947, 19.405, 26.02], radius: 2.83, material: "cloud" },
		{ center: [7.271, 21.35, 26.198], radius: 2.355, material: "cloud" },
		{ center: [-36.502, 109.578, -75.372], radius: 99.621, material: "grass" },
		{ center: [-34.709, 42.001, 43.469], radius: 3.682, material: "cloud" },
		{ center: [-38.342, 38.96, 43.191], radius: 4.424, material: "cloud" },
		{ center: [-50.761, 31.694, 40.16], radius: 3.996, material: "cloud" },
		{ center: [-45.391, 39.897, 44.099], radius: 9.034, material: "cloud" },
		{ center: [-47.535, 38.76, 53.288], radius: 4.424, material: "cloud" },
		{ center: [-44.523, 32.829, 43.951], radius: 4.424, material: "cloud" },
		{ center: [-38.748, 42.497, 38.692], radius: 4.424, material: "cloud" },
		{ center: [-52.766, 35.019, 48.34], radius: 6.676, material: "cloud" },
		{ center: [-57.347, 32.455, 52.575], radius: 2.658, material: "cloud" }],
	planes: [
		{ center: [0.0, 0.0, -1.033], normal: [0.0, 0.0, 1.0], material: "water" },
		{ center: [-33.708, 150.082, 43.878], normal: [0.299, -0.79, -0.535], material: "sky" },
	],
	cylinders: [
		{ center: [-1.002, 1.805, 6.025], axis: [0.0, 0.0, 1.0], height: 9.192, radius: 1.556, material: "wall" },
		{ center: [2.889, 1.183, 1.254], axis: [0.0, 0.0, 1.0], height: 6.552, radius: 5.08, material: "wall" },
		{ center: [3.517, -2.667, 4.98], axis: [0.0, 0.0, 1.0], height: 9.192, radius: 1.556, material: "wall" },
		{ center: [5.673, 3.25, -1.256], axis: [0.0, 0.0, 1.0], height: 14.513, radius: 2.456, material: "wall" },
	],
}
,
{
	name: 'shading_lights',
	camera: {
		position: [0, -4, 0], target: [0, 0, 0], up: [0, 0, 1], fov: 70,
	},
	lights: [
		{position: [3, 0, 3], color: [0.0, 1.0, 0.0]},
		{position: [-3, 0, 3], color: [1.0, 0.0, 0.0]},
	],
	materials: [
		{name: 'floor', color: [0.9, 0.9, 0.9], ambient: 0.1, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.2},
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.1, diffuse: 0.9, specular: 0.1, shininess: 8., mirror: 0.0},
		{name: 'shiny', color: [0.9, 0.3, 0.1], ambient: 0.1, diffuse: 0.3, specular: 0.9, shininess: 10., mirror: 0.2},
	],
	spheres: [
		{center: [0, 0, 0], radius: 1, material: 'white'},
		// {center: [-2, 0, 0.1], radius: 0.6, material: 'shiny'},
	],
	cylinders: [
		// {center: [2, 0, 2], axis: [1, 0, 0], radius: 0.5, height: 4, material: 'shiny'},
		// {center: [-2, 0, 2], axis: [1, 0, 0], radius: 0.6, height: 4, material: 'white'},
	],
	planes: [
		{center: [0, 4, 0], normal: [0, -1, 0], material: 'white'},
		{center: [0, 0, -1], normal: [0, 0, 1], material: 'floor'},
	],
},
{
	name: 'shading_speculars',
	camera: {
		position: [0, -4, 0], target: [0, 0, 0], up: [0, 0, 1], fov: 70,
	},
	lights: [
		{position: [0, 0, 0], color: [1.0, 0.9, 0.5]},
	],
	materials: [
		{name: 'floor', color: [0.9, 0.9, 0.9], ambient: 0.1, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.2},
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.1, diffuse: 0.9, specular: 0.1, shininess: 2., mirror: 0.0},
		{name: 'shiny', color: [0.9, 0.3, 0.1], ambient: 0.1, diffuse: 0.3, specular: 0.9, shininess: 10., mirror: 0.2},
	],
	spheres: [
		{center: [2, 0, 0.1], radius: 0.6, material: 'white'},
		{center: [-2, 0, 0.1], radius: 0.6, material: 'shiny'},
	],
	cylinders: [
		{center: [2, 0, 2], axis: [1, 0, 0], radius: 0.5, height: 4, material: 'shiny'},
		{center: [-2, 0, 2], axis: [1, 0, 0], radius: 0.6, height: 4, material: 'white'},
	],
	planes: [
		{center: [0, 4, 0], normal: [0, -1, 0], material: 'white'},
		{center: [0, 0, -1], normal: [0, 0, 1], material: 'floor'},
	],
},
{
	name: 'columns',
	camera: {
		position: [0, -8, 6], target: [0, 0, 0], up: [0, 0, 1], fov: 70,
	},
	lights: [
		{position: [0, 1, 2], color: [0.0, 0.7, 0.9]},
		{position: [20, -3, 0], color: [1, 0.2, 0.1]},
	],
	materials: [
		{name: 'floor', color: [0.9, 0.9, 0.9], ambient: 0.1, diffuse: 0.5, specular: 0.4, shininess: 4., mirror: 0.4},
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.1, diffuse: 0.9, specular: 0.1, shininess: 2., mirror: 0.0},
		{name: 'shiny', color: [0.9, 0.3, 0.1], ambient: 0.1, diffuse: 0.3, specular: 0.9, shininess: 10., mirror: 0.2},
	],
	spheres: [
	],
	cylinders: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { 
		const a = i * Math.PI * 2 / 8 + 0.123
		const r = 3
		return { center: [r*Math.cos(a), r*Math.sin(a), 0], axis: [0, 0, 1], radius: 0.25, height: 4, material: 'shiny' }
	}),
	planes: [
		{center: [0, 0, -1], normal: [0, 0, 1], material: 'floor'},
	],
},
{
	name: 'desk',
	camera: {
		position: [0., 0., -1.], target: [0., 0, 0.], up: [0, 1, 0], fov: 65,
	},
	materials: [
		{name: 'wall', color: [0.9, 0.9, 0.9], ambient: 0.1, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.},
		{name: 'table', color: [0.49, 0.49, 0.38], ambient: 0.1, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.03},
		{name: 'pot', color: [0.76, 0.76, 0.68], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
		{name: 'pen', color: [1., 0.65, 0.17], ambient: 0.1, diffuse: 0.9, specular: 1.0, shininess: 8., mirror: 0.03},
		{name: 'rubber', color: [0.60, 0.30, 0.24], ambient: 0.2, diffuse: 0.5, specular: 0., shininess: 4., mirror: 0.1},
		{name: 'metal', color: [0.85, 0.85, 0.85], ambient: 0.2, diffuse: 0.5, specular: 1.0, shininess: 4., mirror: 0.3},
	],
	lights: [
		{position: [0.3, 0.35, -0.15], color: [0.9, 0.8, 0.7]},
	],
	spheres: [
		{center: [-0.588, 0.096, 0.324], radius: 0.01, material: 'rubber'},
	],
	planes: [
		{center: [0., 0., 1.5], normal: [0., 0., 1.], material: 'wall'},
		{center: [0., -0.4, 0.], normal: [0., 1., 0.], material: 'table'},
	],
	cylinders: [
		{center: [-0.2, -0.25, 0.1], radius: 0.2, height: 0.3, axis: [0., 1., 0.], material: 'pot'},
		{center: [-0.304, -0.15, 0.16], radius: 0.01, height: 0.7, axis: [-0.693, 0.6, 0.4], material: 'pen'},
		{center: [-0.564, 0.075, 0.31], radius: 0.011, height: 0.05, axis: [-0.693, 0.6, 0.4], material: 'metal'},
		{center: [ 0.42, 0.425, -0.165], radius: 0.2, height: 0.5, axis: [0.8, 0.5, -0.1], material: 'metal'},
	],
},
{
	name: 'mirror1',
	camera: {
		position: [0.5, -2, 0.4], target: [0.5, 0, 0.4], up: [0, 0, 1], fov: 65,
	},
	materials: [
		{name: 'floor', color: [0.9, 0.9, 0.9], ambient: 0.1, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.2},
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
		{name: 'mirror', color: [0.9, 0.9, 0.9], ambient: 0., diffuse: 0., specular: 1.0, shininess: 8., mirror: 0.9},
		{name: 'particleR', color: [0.9, 0.3, 0.1], ambient: 0.2, diffuse: 0.5, specular: 0.9, shininess: 10., mirror: 0.1},
		{name: 'particleB', color: [0.1, 0.3, 0.9], ambient: 0.2, diffuse: 0.5, specular: 0.9, shininess: 10., mirror: 0.1},

	],
	lights: [
		{position: [2.5, 2.5, 4], color: [1.0, 0.8, 0.5]},
		{position: [0.5, -2.5, -0.1], color: [0.5, 0.8, 1.0]},
	],
	spheres: [
		{center: [2, 2, 0.1], radius: 0.5, material: 'particleR'},
		{center: [2, 4, 0.1], radius: 0.5, material: 'particleB'},
		{center: [2, 4, 2.1], radius: 0.5, material: 'particleR'},
	],
	planes: [
		{center: [0, 0, -1], normal: [0, 0, 1], material: 'floor'},
	],
	cylinders: [
		{center: [-2, 4, 0.0], radius: 2, height: 4, axis: [0, 0, 1], material: 'mirror'},
		{center: [2, 3, 0.1], radius: 0.1, height: 2, axis: [0, 1, 0], material: 'white'},
		{center: [2, 4, 1.1], radius: 0.1, height: 2, axis: [0, 0, 1], material: 'white'},
	],
},
{
	name: 'mirror2',
	camera: {
		position: [0.5, -2, 0.4], target: [0.5, 0, 0.4], up: [0, 0, 1], fov: 65,
	},
	materials: [
		{name: 'floor', color: [0.9, 0.9, 0.9], ambient: 0.1, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.2},
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
		{name: 'mirror', color: [0.9, 0.9, 0.9], ambient: 0., diffuse: 0., specular: 1.0, shininess: 8., mirror: 0.9},
		{name: 'particleR', color: [0.9, 0.3, 0.1], ambient: 0.2, diffuse: 0.5, specular: 0.9, shininess: 10., mirror: 0.1},
		{name: 'particleB', color: [0.1, 0.3, 0.9], ambient: 0.2, diffuse: 0.5, specular: 0.9, shininess: 10., mirror: 0.1},
	],
	lights: [
		{position: [2.5, 2.5, 4], color: [1.0, 0.8, 0.5]},
		{position: [0.5, -2.5, -0.1], color: [0.5, 0.8, 1.0]},
	],
	spheres: [
		{center: [2, 2, 0.1], radius: 0.5, material: 'particleR'},
		{center: [2, 4, 0.1], radius: 0.5, material: 'particleB'},
		{center: [2, 4, 2.1], radius: 0.5, material: 'particleR'},
	],
	planes: [
		{center: [0, 0, -1], normal: [0, 0, 1], material: 'floor'},
		{center: [-5, 5, 0], normal: [-2, 1, 0], material: 'mirror'},
		{center: [ 5, 5, 0], normal: [2, 1, 0], material: 'mirror'},

	],
	cylinders: [
		{center: [2, 3, 0.1], radius: 0.1, height: 2, axis: [0, 1, 0], material: 'white'},
		{center: [2, 4, 1.1], radius: 0.1, height: 2, axis: [0, 0, 1], material: 'white'},
	],
},
{
	name: "mirror_creature",
	camera: { position: [6.699, 11.065, 5.12], up: [-0.223, -0.22, 0.949], target: [-0.059, 4.396, 1.981], fov: 45 },
	materials: [
		{name: "default", color: [0.6, 0.6, 0.6], ambient: 0.2, diffuse: 0.8, specular: 0.4, shininess: 2.0, mirror: 0.02},
		{name: "grass", color: [0.1, 0.7, 0.01], ambient: 0.2, diffuse: 0.9, specular: 0.3, shininess: 2.0, mirror: 0.02},
		{name: "fuzzy", color: [0.3, 0.4, 0.6], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 2.0, mirror: 0.02},
		{name: "white_shiny", color: [0.9, 0.9, 0.9], ambient: 0.2, diffuse: 0.9, specular: 0.8, shininess: 8.0, mirror: 0.3},
		{name: "black", color: [0.1, 0.1, 0.1], ambient: 0.1, diffuse: 0.5, specular: 0.8, shininess: 1.0, mirror: 0.5},
		{name: "mirror", color: [0.9, 0.9, 0.9], ambient: 0.0, diffuse: 0.0, specular: 1.0, shininess: 8.0, mirror: 0.9},
	],
	lights: [
		{ position: [-3.177, 12.593, 5.118], color: [1.0, 1.0, 1.0] },
		{ position: [9.328, 6.822, 2.304], color: [1.0, 1.0, 1.0] }
	],
	spheres: [
		{ center: [0.0, 0.991, 0.0], radius: 1.0, material: "fuzzy" },
		{ center: [0.0, -2.351, 0.0], radius: 1.0, material: "fuzzy" },
		{ center: [0.0, 2.461, 2.368], radius: 1.112, material: "fuzzy" },
		{ center: [-0.443, 3.42, 2.752], radius: 0.253, material: "white_shiny" },
		{ center: [-0.331, 3.586, 2.795], radius: 0.084, material: "black" },
		{ center: [0.583, 3.614, 2.785], radius: 0.084, material: "black" },
		{ center: [0.474, 3.458, 2.756], radius: 0.253, material: "white_shiny" },
		{ center: [0.0, -3.439, 0.64], radius: 0.46, material: "fuzzy" },
	],
	planes: [
		{ center: [46.385, -38.198, -6.889], normal: [0.999, 0.0, 0.043], material: "default" },
		{ center: [-5.624, 0.917, 8.321], normal: [0.999, 0.0, 0.043], material: "default" },
	],
	cylinders: [
		{ center: [-8.383, -0.726, 30.007], axis: [-0.027, 0.0, 1.0], height: 93.688, radius: 3.822, material: "mirror" },
		{ center: [-8.383, 4.768, 30.007], axis: [-0.014, 0.0, 1.0], height: 93.688, radius: 3.822, material: "mirror" },
		{ center: [-8.383, -6.673, 30.007], axis: [-0.026, 0.0, 1.0], height: 93.688, radius: 3.822, material: "mirror" },
		{ center: [0.0, -0.726, 0.0], axis: [0.0, -1.0, -0.0], height: 3.463, radius: 1.0, material: "fuzzy" },
		{ center: [0.0, 1.754, 1.159], axis: [0.0, -0.538, -0.843], height: 1.418, radius: 0.409, material: "default" },
		{ center: [0.667, 1.957, 3.476], axis: [-0.241, 0.551, -0.799], height: 0.791, radius: 0.228, material: "default" },
		{ center: [-0.674, 1.934, 3.473], axis: [-0.241, -0.551, 0.799], height: 0.791, radius: 0.228, material: "default" },
		{ center: [0.762, -2.491, -1.279], axis: [0.172, -0.087, -0.981], height: 1.53, radius: 0.193, material: "default" },
		{ center: [-0.708, -2.49, -1.266], axis: [0.172, 0.087, 0.981], height: 1.53, radius: 0.193, material: "default" },
		{ center: [-0.708, 1.156, -1.266], axis: [0.172, -0.155, 0.973], height: 1.53, radius: 0.193, material: "default" },
		{ center: [0.762, 1.158, -1.279], axis: [0.172, 0.155, -0.973], height: 1.53, radius: 0.193, material: "default" },
		{ center: [15.761, -0.629, 32.113], axis: [1.0, 0.0, -0.0], height: 68.535, radius: 34.268, material: "default" },
	],
},
{
	name: "primitives",
	camera: {
		position: [0, 0, 0], target: [0, 0, 1], up: [0, 1, 0], fov: 75,
	},
	materials: [
		{name: 'green', color: [0.3, 1., 0.4], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.},
		{name: 'black', color: [0.3, 0.3, 0.3], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 1., mirror: 0.},
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.6, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
		{name: 'mirror', color: [0.9, 0.9, 0.9], ambient: 0., diffuse: 0., specular: 0., shininess: 0., mirror: 1.},
	],
	lights: [
		{position: [3., 0, -0.5], color: [1.0, 0.4, 0.2]},
		{position: [-3., -0.8, 3], color: [0.2, 0.4, 0.9]},
	],
	spheres: [
		{center: [0.0, 1.5, 4.0], radius: 1.0, material: 'mirror'},
	],
	planes: [
		{center: [0.0, -1., 0.], normal: [0., 1., 0.], material: 'white'}, // bottom
		{center: [-2, -1., 0.], normal: [0.3939193 , 0.91914503, 0.], material: 'green'}, // left
		{center: [2, -1., 0.], normal: [0.3939193 , -0.91914503, 0.], material: 'green'}, // right
		{center: [0.0, 0., 50.], normal: [0., 0, -1], material: 'green'}, // front
	],
	cylinders: [
		{center: [0.0, -0.8, 4.0], radius: 1, height: 0.4, axis: [0., 1., 0.], material: 'green'},
	],
},
{
	name: "empty",
	camera: {
		position: [0, 0, 0], target: [0, 0, 1], up: [0, 1, 0], fov: 75,
	},
	materials: [
		{name: 'green', color: [0.3, 1., 0.4], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.},
	],
	lights: [
		{position: [0, 0, 0.1], color: [1.0, 0.4, 0.2]},
	],
	spheres: [],
	planes: [],
	cylinders: [],
},
{
	name: "floor",
	camera: {
		position: [-2, 0, 1], target: [0, 0, 0], up: [1, 0, 0.75], fov: 75,
	},
	materials: [
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.6, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
	],
	lights: [],
	spheres: [],
	planes: [
		{center: [0.0, 0., -0.5], normal: [0, 0, 1], material: 'white'}, // floor
	],
	cylinders: [],
},
{
	name: "corner1",
	camera: {
		position: [0, 0.5, 0], target: [0, 0.5, 1], up: [0, 1, 0], fov: 75,
	},
	materials: [
		{name: 'green', color: [0.3, 1., 0.4], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.},
	],
	lights: [
		{position: [0., 0., 0.1], color: [1.0, 0.4, 0.2]},
	],
	spheres: [],
	planes: [
		{center: [0.0, 0., 1.], normal: [0., 0., 1.], material: 'green'},
		{center: [0.0, 0., 0.], normal: [0., 1., 0.], material: 'green'},
		{center: [-0.3, 0., 0.], normal: [1., 0., 0.], material: 'green'},
	],
	cylinders: [],
},
{
	name: "corner2",
	camera: {
		position: [-0.43, -0.35, 0.415], target: [0, -0.55, 0.], up: [0, 1, 0], fov: 70,
	},
	materials: [
		{name: 'wall', color: [0.655, 0.831, 0.608], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.},
		{name: 'mesh', color: [0.714, 0.427, 0.051], ambient: 0.6, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
	],
	lights: [
		{position: [0., -0.45, 1.5], color: [0.5, 0.5, 0.5]},  // I
		{position: [-1.5, -0.4, 0.], color: [0.5, 0.5, 0.5]},  // C
		{position: [-0.1, 1., 0.], color: [0.5, 0.5, 0.5]},      // G
	],
	spheres: [],
	planes: [
		{center: [0., 0., -0.4], normal: [0., 0., 1.], material: 'wall'}, // I
		{center: [0.35, 0., 0.], normal: [1., 0., 0.], material: 'wall'}, // C
		{center: [0., -0.8, 0.], normal: [0., 1., 0.], material: 'wall'}, // G
	],
	cylinders: [],
},
{
	name: "barrel",
	camera: {
		position: [0, 0, 0], target: [0, 0, 1], up: [0, 1, 0], fov: 75,
	},
	materials: [
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.6, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
	],
	lights: [
		{position: [0., 0., -0.2], color: [1.0, 0.4, 0.2]},
	],
	spheres: [
		{center: [0, 0, 7], radius: 1, material: 'white'},
	],
	planes: [],
	cylinders: [
		{center: [0.0, 0.0, 0.0], radius: 0.1, height: 0.5, axis: [0., 0., 1.], material: 'white'},
	],
},
{
	name: "cylinders",
	camera: {
		position: [0, 3, 8], target: [0, 1, 0], up: [0, 1, 0], fov: 45,
	},
	materials: [
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.6, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
	],
	lights: [
		{position: [20, 50, 0], color: [1.0, 0.4, 0.2]},
		{position: [50, 50, 50], color: [0.2, 0.4, 0.9]},
		{position: [-50, 50, 50], color: [0.2, 0.8, 0.2]},
	],
	spheres: [],
	planes: [],
	cylinders: [
		{center: [-1.5, 1.0, 0.0], radius: 0.5, height: 1.5, axis: [-1, 1, 1], material: 'white'},
		{center: [ 0.0, 1.0, 0.0], radius: 0.5, height: 1.5, axis: [0, 1, 1], material: 'white'},
		{center: [ 1.5, 1.0, 0.0], radius: 0.5, height: 1.5, axis: [1, 1, 1], material: 'white'},
	],
},
]
	

export async function load_scenes() {

	const SCENES_BY_NAME = Object.fromEntries(SCENES.map((sc) => [sc.name, sc]))

	return {
		SCENES,
		SCENES_BY_NAME,
	}
}
