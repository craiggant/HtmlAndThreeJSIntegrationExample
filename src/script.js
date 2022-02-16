import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as dat from 'lil-gui';
import gsap from 'gsap';

/**
 * Debug
 */
// const gui = new dat.GUI();

const parameters = {
	materialColor: '#ffeded'
};

// gui.addColor(parameters, 'materialColor').onChange(() => {
// 	material.color.set(parameters.materialColor);
// 	particlesMaterial.color.set(parameters.materialColor);
// });

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Models
 */
const objectGroup1 = new THREE.Group();
const objectGroup2 = new THREE.Group();
const objectGroup3 = new THREE.Group();
scene.add(objectGroup1, objectGroup2, objectGroup3);

const gltfLoader = new GLTFLoader();
gltfLoader.load('/models/skeleton/skeleton.gltf', (gltf) => {
	objectGroup1.add(gltf.scene.children[0]);
	// TODO: figure out how to make all child nodes cast shadows
	const skeleton = objectGroup1.children[0];

	// skeleton.position.y = -0.13;
	skeleton.scale.set(0.4, 0.4, 0.4);
	skeleton.castShadow = true;
});

gltfLoader.load('/models/human_dna/scene.gltf', (gltf) => {
	const dna = gltf.scene.children[0];
	dna.rotation.set(Math.PI * 0.25, 0, 0);
	dna.position.set(0, 1, 0);
	dna.scale.set(1.8, 1.8, 1.8);
	objectGroup3.add(dna);
});

/**
 * Objects
 */

const objectsDistance = 4;

objectGroup1.position.x = 2;
// objectGroup3.position.x = 0.7;
objectGroup3.position.x = 1.5;
objectGroup3.position.y = -objectsDistance * 2;

const sectionMeshes = [objectGroup1, objectGroup3];

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
// directionalLight.position.set(5, 3, 0);
// scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 2, 30);
pointLight.position.set(5, 3, 0);
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
	35,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	alpha: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
	scrollY = window.scrollY;
	const newSection = Math.round(scrollY / sizes.height);
	if (newSection != currentSection) {
		currentSection = newSection;
	}
});

/**
 * Cursor
 */
const cursor = { x: 0, y: 0 };

window.addEventListener('mousemove', (e) => {
	cursor.x = e.clientX / sizes.width - 0.5;
	cursor.y = e.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - previousTime;
	previousTime = elapsedTime;
	let scale = 1;
	let yPosition = 0;
	// Animate Camera
	if (currentSection === 0 || currentSection === 1) {
		objectGroup1.visible = true;
		camera.position.x = (scrollY / sizes.height) * 4;
		camera.position.y = 0;
		scale += (scrollY / sizes.height) * 2;
		yPosition += -(scrollY / sizes.height) * 3.2;
		objectGroup1.scale.set(scale, scale, scale);
		objectGroup1.position.y = yPosition;
	} else {
		camera.position.x = 0;
		camera.position.y = (-scrollY / sizes.height) * 4;
		objectGroup1.visible = false;
	}
	const parallaxX = cursor.x * 0.5;
	const parallaxY = -cursor.y * 0.5;

	// Using delta time ensures consistent experience for all users
	cameraGroup.position.x +=
		(parallaxX - cameraGroup.position.x) * 4 * deltaTime;
	cameraGroup.position.y +=
		(parallaxY - cameraGroup.position.y) * 4 * deltaTime;

	// Animate Meshes
	for (const mesh of sectionMeshes) {
		// mesh.rotation.x += deltaTime * 0.1;
		mesh.rotation.y += deltaTime * 0.12;
	}

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
