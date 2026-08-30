import {
  Canvas,
  useFrame,
} from "@react-three/fiber";

import {
  Float,
  PerspectiveCamera,
  Stars,
  Line,
} from "@react-three/drei";

import {
  useRef,
} from "react";

import * as THREE from "three";

/* =========================================================
   CYBER GRID
   ========================================================= */

function CyberGrid() {
  const grid =
    useRef();

  useFrame(
    (state) => {
      if (!grid.current)
        return;

      const scroll =
        window.scrollY || 0;

      grid.current.position.z =
        scroll * 0.002;

      grid.current.rotation.y =
        Math.sin(
          state.clock.elapsedTime *
            0.08
        ) * 0.025;
    }
  );

  return (
    <group ref={grid}>

      <gridHelper
        args={[
          100,
          100,
          "#28ff78",
          "#0b2b18",
        ]}
        position={[
          0,
          -5,
          0,
        ]}
      />

      <gridHelper
        args={[
          100,
          100,
          "#28ff78",
          "#0b2b18",
        ]}
        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
        position={[
          0,
          0,
          -35,
        ]}
      />

    </group>
  );
}

/* =========================================================
   SECURITY CORE
   ========================================================= */

function SecurityCore() {
  const core =
    useRef();

  const ringOne =
    useRef();

  const ringTwo =
    useRef();

  const ringThree =
    useRef();

  useFrame(
    (state) => {
      const time =
        state.clock.elapsedTime;

      const scroll =
        window.scrollY || 0;

      if (core.current) {
        core.current.rotation.x =
          time * 0.24 +
          scroll * 0.0005;

        core.current.rotation.y =
          time * 0.35;
      }

      if (ringOne.current) {
        ringOne.current.rotation.z =
          time * 0.25;
      }

      if (ringTwo.current) {
        ringTwo.current.rotation.x =
          time * -0.3;
      }

      if (ringThree.current) {
        ringThree.current.rotation.y =
          time * 0.2;
      }
    }
  );

  return (
    <Float
      speed={2}
      rotationIntensity={0.25}
      floatIntensity={0.9}
    >

      <group
        position={[
          0,
          0.5,
          -7,
        ]}
      >

        <mesh ref={ringOne}>

          <torusGeometry
            args={[
              3.7,
              0.028,
              16,
              120,
            ]}
          />

          <meshBasicMaterial
            color="#28ff78"
            transparent
            opacity={0.65}
          />

        </mesh>

        <mesh
          ref={ringTwo}
          rotation={[
            Math.PI / 2,
            0,
            0,
          ]}
        >

          <torusGeometry
            args={[
              3,
              0.023,
              16,
              120,
            ]}
          />

          <meshBasicMaterial
            color="#28ff78"
            transparent
            opacity={0.45}
          />

        </mesh>

        <mesh
          ref={ringThree}
          rotation={[
            0,
            Math.PI / 2,
            0,
          ]}
        >

          <torusGeometry
            args={[
              2.4,
              0.018,
              16,
              100,
            ]}
          />

          <meshBasicMaterial
            color="#00ffc8"
            transparent
            opacity={0.3}
          />

        </mesh>

        <mesh ref={core}>

          <icosahedronGeometry
            args={[
              1.25,
              2,
            ]}
          />

          <meshStandardMaterial
            color="#031008"
            emissive="#28ff78"
            emissiveIntensity={3}
            wireframe
          />

        </mesh>

        <mesh>

          <icosahedronGeometry
            args={[
              0.67,
              2,
            ]}
          />

          <meshBasicMaterial
            color="#28ff78"
            transparent
            opacity={0.07}
          />

        </mesh>

        <pointLight
          color="#28ff78"
          intensity={16}
          distance={17}
        />

      </group>

    </Float>
  );
}

/* =========================================================
   NETWORK
   ========================================================= */

const networkNodes = [
  [-6, 2, -7],
  [-3, 4, -9],
  [0, 2, -11],
  [3, 4, -9],
  [6, 2, -7],

  [-5, -1, -10],
  [-2, -2, -12],
  [2, -2, -12],
  [5, -1, -10],

  [-3, 1, -15],
  [0, 0, -17],
  [3, 1, -15],
];

function ThreatNetwork() {
  const network =
    useRef();

  useFrame(
    (state) => {
      if (!network.current)
        return;

      const time =
        state.clock.elapsedTime;

      network.current.rotation.y =
        Math.sin(
          time * 0.2
        ) * 0.08;

      network.current.position.y =
        Math.sin(
          time * 0.45
        ) * 0.18;
    }
  );

  return (
    <group ref={network}>

      {networkNodes.map(
        (
          position,
          index
        ) => (
          <Float
            key={index}
            speed={
              1 +
              index * 0.03
            }
            floatIntensity={0.3}
          >

            <mesh
              position={
                position
              }
            >

              <sphereGeometry
                args={[
                  0.075,
                  12,
                  12,
                ]}
              />

              <meshBasicMaterial
                color="#28ff78"
              />

            </mesh>

          </Float>
        )
      )}

      {networkNodes
        .slice(
          0,
          networkNodes.length -
            1
        )
        .map(
          (
            node,
            index
          ) => (
            <Line
              key={`line-${index}`}
              points={[
                node,
                networkNodes[
                  index + 1
                ],
              ]}
              color="#28ff78"
              lineWidth={0.4}
              transparent
              opacity={0.2}
            />
          )
        )}

    </group>
  );
}

/* =========================================================
   CAMERA
   ========================================================= */

function CameraController() {
  const camera =
    useRef();

  useFrame(
    (state) => {
      if (!camera.current)
        return;

      const scroll =
        window.scrollY || 0;

      const mouseX =
        state.pointer.x;

      const mouseY =
        state.pointer.y;

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
          mouseX * 0.045,
          0.035
        );

      camera.current.rotation.x =
        THREE.MathUtils.lerp(
          camera.current.rotation.x,
          -mouseY * 0.025,
          0.035
        );
    }
  );

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

/* =========================================================
   SCENE
   ========================================================= */

function Scene() {
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
        intensity={5}
        color="#28ff78"
      />

      <CyberGrid />

      <SecurityCore />

      <ThreatNetwork />

      <Stars
        radius={80}
        depth={60}
        count={1600}
        factor={2}
        saturation={0}
        fade
        speed={0.45}
      />
    </>
  );
}

export default function CyberWorld() {
  return (
    <div className="cyber-world">

      <Canvas
        dpr={[
          1,
          1.7,
        ]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference:
            "high-performance",
        }}
      >

        <Scene />

      </Canvas>

    </div>
  );
}