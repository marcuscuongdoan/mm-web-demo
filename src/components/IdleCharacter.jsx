import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import model from "../assets/Idle.fbx";
import textures from "./character.texture";

function IdleCharacter() {
  const ref = useRef();

  useEffect(() => {
    let character, mixer;
    let width, height;
    const current = ref.current;
    const manager = new THREE.LoadingManager();
    const clock = new THREE.Clock();

    const scene = new THREE.Scene();
    width = ref.current.clientWidth; // or window.innerWidth;
    height = 600; // = window.innerHeight for full screen
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);

    camera.position.set(0, 300, 200);

    camera.rotation.set(150, 0, 0);

    const renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    // renderer.outputEncoding = THREE.sRGBEncoding;
    // renderer.setClearColor(0xffffff, 0);
    scene.background = new THREE.Color(0x999999);

    // scene.background = new THREE.Color().setHSL(0.6, 0, 1);
    renderer.setSize(width, height);
    // document.body.appendChild( renderer.domElement );
    // use ref as a mount point of the Three.js scene instead of the document.body
    ref.current.appendChild(renderer.domElement);

    // add light

    // scene.fog = new THREE.Fog(0xa0a0a0, 1, 2000);
    scene.fog = new THREE.Fog(scene.background, 1, 2000);
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    hemiLight.position.set(0, 2, 0);
    hemiLight.position.multiplyScalar(100);
    hemiLight.color.setHSL(0.6, 0.6, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    scene.add(hemiLight);

    // add to show light helper
    // const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
    // scene.add(hemiLightHelper);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.multiplyScalar(30);

    const d = 200;
    dirLight.position.set(1, 2, 1);
    dirLight.position.multiplyScalar(100);

    dirLight.castShadow = true;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    // dirLight.shadow.camera.near = 0.1;
    // dirLight.shadow.camera.far = 100;

    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = -0.0001;
    scene.add(dirLight);

    // add to show light helper
    // const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
    // scene.add(dirLightHelper);

    // const mesh = new THREE.Mesh(
    //   new THREE.CircleGeometry(200, 48, 0),
    //   new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
    // );
    // mesh.rotation.x = -Math.PI / 2;
    // mesh.receiveShadow = true;
    // scene.add(mesh);

    const groundGeo = new THREE.PlaneGeometry(10000, 10000);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    groundMat.color.setHSL(0.095, 1, 0.75);

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // load model
    const loader = new FBXLoader(manager);
    const textureLoader = new THREE.TextureLoader(manager);

    loader.load(model, function (object) {
      character = object;
      mixer = new THREE.AnimationMixer(character);
      const action = mixer.clipAction(character.animations[0]);
      action.play();

      character.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          textures.forEach((item, index) => {
            if (child.material[index].name === item.name) {
              textureLoader.load(item.texture, (texture) => {
                child.material[index].map = texture;
                child.material[index].needsUpdate = true;
                // render(); // only if there is no render loop
              });
            }
          });
        }
      });

      character.rotation.set(0, 45, 0);

      scene.add(character);
    });

    manager.onLoad = () => {
      animate();
    };

    // enable to add control
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 0.1;
    controls.maxDistance = 3000;
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

      scene.remove(character);
      // world.dispose();
    };
  }, []);

  return <div ref={ref} />;
}

export default IdleCharacter;
