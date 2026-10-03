import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function AvatarViewer({ signSequence = [] }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;

    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#11100e");

    const camera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );

    camera.position.set(0, 0.5, 8);
    camera.lookAt(0, -0.3, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight("#ffffff", "#444444", 2);
    scene.add(light);

    const frontLight = new THREE.DirectionalLight("#ffffff", 2);
    frontLight.position.set(2, 4, 4);
    scene.add(frontLight);

    const clock = new THREE.Clock();
    const loader = new GLTFLoader();

    let mixer = null;
    let animationTimer = null;

    loader.load(
      "/avatar/RobotExpressive.glb",
      (gltf) => {
        const model = gltf.scene;

        model.position.set(0, -1.5, 0);
        model.scale.set(0.8, 0.8, 0.8);

        scene.add(model);

        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);

          const animations = {};

          gltf.animations.forEach((clip) => {
            animations[clip.name.toUpperCase()] = clip;
          });

          console.log(
            "Available avatar animations:",
            gltf.animations.map((clip) => clip.name)
    );

          const placeholderMap = {
            FIRE: "PUNCH",
            DANGER: "NO",
            LEAVE: "WALKING",
            HELP: "THUMBSUP",
            STOP: "NO",
            HELLO: "WAVE",
            YES: "YES",
            NO: "NO",
          };

          const sequence =
            signSequence.length > 0 ? signSequence : ["IDLE"];

          let currentIndex = 0;

          const playNextAnimation = () => {
            if (!mixer || currentIndex >= sequence.length) {
              const idleClip = animations["IDLE"];

              if (idleClip) {
                mixer.stopAllAction();
                mixer.clipAction(idleClip).reset().play();
              }

              return;
            }

            const sign = sequence[currentIndex].toUpperCase();
            const animationName = placeholderMap[sign] || "IDLE";
            const clip = animations[animationName];

            if (clip) {
              mixer.stopAllAction();

              const action = mixer.clipAction(clip);
              action.reset();
              action.setLoop(THREE.LoopOnce);
              action.clampWhenFinished = true;
              action.play();
            }

            currentIndex += 1;
            animationTimer = setTimeout(playNextAnimation, 2500);
          };

          playNextAnimation();
        }
      },
      undefined,
      (error) => {
        console.error("Error loading avatar:", error);
      }
    );

    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      if (mixer) {
        mixer.update(delta);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;

      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(animationTimer);
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [signSequence]);

  return <div ref={mountRef} className="avatar-placeholder" />;
}

export default AvatarViewer;