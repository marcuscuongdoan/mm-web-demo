import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import model from "../assets/planet_animated.fbx";
import textures from "./world.texture";

function World() {
  const ref = useRef();

  useEffect(() => {
    let world, mixer;
    let width, height;
    const current = ref.current;
    const manager = new THREE.LoadingManager();
    const clock = new THREE.Clock();

    const scene = new THREE.Scene();
    width = ref.current.clientWidth; // or window.innerWidth;
    height = 600; // = window.innerHeight for full screen
    const camera = new THREE.PerspectiveCamera(90, width / height, 1, 1500);

    camera.position.set(1, 75, 75);

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(width, height);
    // document.body.appendChild( renderer.domElement );
    // use ref as a mount point of the Three.js scene instead of the document.body
    ref.current.appendChild(renderer.domElement);

    // add light

    scene.fog = new THREE.Fog(0xa0a0a0, 1, 3000);
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 100);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(5, 10, 7.5);
    dirLight.castShadow = true;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    scene.add(dirLight);

    // const geometry = new THREE.BufferGeometry();
    // const vertices = [];

    // for (let i = 0; i < 10000; i++) {
    //   vertices.push(THREE.MathUtils.randFloatSpread(2000)); // x
    //   vertices.push(THREE.MathUtils.randFloatSpread(2000)); // y
    //   vertices.push(THREE.MathUtils.randFloatSpread(2000)); // z
    // }

    // geometry.setAttribute(
    //   "position",
    //   new THREE.Float32BufferAttribute(vertices, 3)
    // );

    // const particles = new THREE.Points(
    //   geometry,
    //   new THREE.PointsMaterial({ color: 0x888888 })
    // );
    // scene.add(particles);

    // load model
    const loader = new FBXLoader(manager);
    const textureLoader = new THREE.TextureLoader(manager);

    loader.load(model, function (object) {
      world = object;
      mixer = new THREE.AnimationMixer(world);

      const action = mixer.clipAction(world.animations[0]);
      action.play();

      world.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          textures.forEach((item) => {
            if (child.material.name === item.name) {
              textureLoader.load(item.texture, (texture) => {
                child.material.map = texture;
                child.material.needsUpdate = true;
                // render(); // only if there is no render loop
              });
            }
          });
        }
      });

      scene.add(world);
    });

    manager.onLoad = () => {
      animate();
    };

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 0.1;
    controls.maxDistance = 300;
    controls.update();

    // animate
    const animate = function () {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      mixer.update(delta);
      render();
    };

    const render = () => {
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      width = ref.current.clientWidth;
      // height = 500;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      // Callback to cleanup three js, cancel animationFrame, etc

      window.removeEventListener("resize", handleResize);
      current.removeChild(renderer.domElement);

      scene.remove(world);
      // scene.remove(particles);
      scene.remove(hemiLight);
      scene.remove(dirLight);
      // geometry.dispose();
    };
  }, []);

  return (<div className="world-wrapper">
    <div className="text">
      Try to rotate World!
    </div>
    <div className="world" ref={ref} />
  </div>);

  // return (
  //   <div className="App">
  //   </div>
  // );
}

export default World;
