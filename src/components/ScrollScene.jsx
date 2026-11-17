import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Stars } from "@react-three/drei";
import * as THREE from "three";
import CyberGrid from "./CyberGrid";
import SecurityCore from "./SecurityCore";
import ThreatNetwork from "./ThreatNetwork";

function CameraController() {
  const camera =
    useRef();


  useFrame((state) => {
    if (!camera.current)
      return;

    const scroll =
      window.scrollY || 0;

    const targetZ =
      12 -
      Math.min(
        scroll * 0.002,
        3
      );

    const targetY =
      2 +
      Math.min(
        scroll * 0.0004,
        1
      );


    camera.current.position.z =
      THREE.MathUtils.lerp(
        camera.current.position.z,
        targetZ,
        0.035
      );


    camera.current.position.y =
      THREE.MathUtils.lerp(
        camera.current.position.y,
        targetY,
        0.035
      );


    camera.current.rotation.y =
      THREE.MathUtils.lerp(
        camera.current.rotation.y,
        state.pointer.x *
        0.04,
        0.035
      );


    camera.current.rotation.x =
      THREE.MathUtils.lerp(
        camera.current.rotation.x,
        -state.pointer.y *
        0.025,
        0.035
      );
  });


  return (
    <PerspectiveCamera
      ref={camera}
      makeDefault
      position={[
        0,
        2,
        12,
      ]}
      fov={55}
    />
  );
}


export default function ScrollScene() {
  return (
    <>
      <CameraController />

      <ambientLight
        intensity={0.12}
      />

      <pointLight
        position={[
          0,
          6,
          5,
        ]}
        intensity={4}
        color="#28ff78"
      />

      <CyberGrid />

      <SecurityCore />

      <ThreatNetwork />

      <Stars
        radius={80}
        depth={60}
        count={1200}
        factor={2}
        saturation={0}
        fade
        speed={0.35}
      />
    </>
  );
}
