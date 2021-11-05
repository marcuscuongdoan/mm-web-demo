import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import decade_model from "../assets/Decade.fbx";
import decade_texture from "../assets/decade.png";
import select_decade from "../assets/select/decade.png";
import select_woman from "../assets/select/woman.png";
import fortniteChar from "../assets/Idle.fbx";
import textures from "./character.texture";

function CharacterSelect() {
  const [characterList, setCharacterList] = useState([]);
  const ref = useRef();

  useEffect(() => {
    let mixers = [];

    let camera;

    let characters = [];
    let selectors = [];

    const manager = new THREE.LoadingManager();
    const clock = new THREE.Clock();

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 0);

    let scene;
    let decade, fortniteCharacter;

    const current = ref.current;

    let width = current.clientWidth; // or window.innerWidth;
    let height = 600; // = window.innerHeight for full screen
    camera = new THREE.PerspectiveCamera(20, width / height, 1, 100);

    const init = () => {
      scene = new THREE.Scene();
      camera.position.set(0, 2.5, 4);
      // camera.position.multiplyScalar(2);

      camera.rotation.set(50, 0, 0);

      renderer.shadowMap.enabled = true;
      // renderer.outputEncoding = THREE.sRGBEncoding;
      // renderer.setClearColor(0xffffff, 0);
      // scene.background = new THREE.Color(0x999999);

      // scene.background = new THREE.Color().setHSL(0.6, 0, 1);
      renderer.setSize(width, height);
      // document.body.appendChild( renderer.domElement );
      // use ref as a mount point of the Three.js scene instead of the document.body
      current.appendChild(renderer.domElement);

      // add light

      // scene.fog = new THREE.Fog(0xa0a0a0, 1, 2000);
      scene.fog = new THREE.Fog(scene.background, 1, 20000);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
      hemiLight.position.set(0, 2, 0);
      hemiLight.position.multiplyScalar(1000000);
      // hemiLight.color.setHSL(0.6, 0.6, 0.6);
      // hemiLight.groundColor.setHSL(0.095, 1, 0.75);
      scene.add(hemiLight);

      // add to show light helper
      const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
      scene.add(hemiLightHelper);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1);
      dirLight.color.setHSL(0.1, 1, 0.95);
      dirLight.position.multiplyScalar(30);

      const d = 200;
      dirLight.position.set(1, 2, 1);
      dirLight.position.multiplyScalar(1000);

      dirLight.castShadow = true;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      // dirLight.shadow.camera.near = 0.1;
      // dirLight.shadow.camera.far = 100;

      dirLight.shadow.camera.far = 35000;
      dirLight.shadow.bias = -0.0001;
      scene.add(dirLight);

      // add to show light helper
      // const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
      // scene.add(dirLightHelper);

      // const groundGeo = new THREE.PlaneGeometry(100000, 100000);
      // const groundMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      // groundMat.color.setHSL(0.095, 1, 0.75);

      // const ground = new THREE.Mesh(groundGeo, groundMat);
      // ground.rotation.x = -Math.PI / 2;
      // ground.receiveShadow = true;
      // scene.add(ground);

      // load model
      const loader = new FBXLoader(manager);
      const textureLoader = new THREE.TextureLoader(manager);

      // load decade
      loader.load(decade_model, function (object) {
        decade = object;
        const mixer = new THREE.AnimationMixer(decade);
        const action = mixer.clipAction(decade.animations[0]);
        mixers.push(mixer);
        action.play();

        decade.traverse(function (child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            textureLoader.load(decade_texture, (texture) => {
              child.material.map = texture;
              child.material.needsUpdate = true;
            });
          }
        });

        decade.position.set(0.5, 0, 0);

        decade.rotation.set(0, 50, 0);

        decade.name = "decade";

        scene.add(decade);
        addCharacter(decade, select_decade);
      });

      loader.load(fortniteChar, function (object) {
        fortniteCharacter = object;
        const mixer = new THREE.AnimationMixer(fortniteCharacter);
        const action = mixer.clipAction(fortniteCharacter.animations[0]);
        action.play();
        mixers.push(mixer);

        fortniteCharacter.traverse(function (child) {
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

        fortniteCharacter.position.set(0.5, 0, 0);
        fortniteCharacter.rotation.set(0, 50, 0);
        fortniteCharacter.scale.set(0.01, 0.01, 0.01);
        fortniteCharacter.name = "woman";

        scene.add(fortniteCharacter);
        fortniteCharacter.visible = false;
        addCharacter(fortniteCharacter, select_woman);
      });
    };

    init();
    // enable to add control
    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.minDistance = 0.1;
    // controls.maxDistance = 3000;
    // controls.update();

    manager.onLoad = () => {
      characters.forEach((character) => {
        let characterSelector = document.getElementById(character.name);
        characterSelector.addEventListener("click", changeCharacter, false);
        characterSelector.model = character;
        if (character.visible) characterSelector.classList.add("active");
        selectors.push(characterSelector);
      });
      animate();
    };

    // animate
    const animate = function () {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      for (let i = 0; i < mixers.length; i++) {
        mixers[i].update(delta);
      }
      render();
    };

    const hideAllChar = () => {
      fortniteCharacter.visible = false;
      decade.visible = false;
      selectors.forEach((selector) => {
        selector.classList.remove("active");
      });
    };

    const addCharacter = (char, img) => {
      characters.push(char);
      setCharacterList((characterList) => [
        ...characterList,
        { name: char.name, img: img },
      ]);
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

    const changeCharacter = (event) => {
      let characterSelector = event.currentTarget;
      hideAllChar();
      characterSelector.classList.add("active");
      characterSelector.model.visible = true;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      // Callback to cleanup three js, cancel animationFrame, etc

      window.removeEventListener("resize", handleResize);
      current.removeChild(renderer.domElement);

      if (characters.length) {
        characters.forEach((char) => scene.remove(char));
        characters = [];
        setCharacterList([]);
      }
    };
  }, []);

  return (
    <div ref={ref} className="character-select">
      <div className="text">
        <p className="title">Play as your Favorite NFT Characters</p>
        <p className="description">
          Rumble Worlds will enable players to login with their wallets and just
          play!
        </p>
      </div>
      <div className="row">
        {characterList.map((char) => (
          <div className="character" key={char.name} id={char.name}>
            <div className="character-name">{char.name}</div>
            <div className="select-button">
              <img src={char.img} alt={char.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CharacterSelect;
