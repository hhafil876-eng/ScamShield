import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

export default function SecurityCore() {
  const core =
    useRef();

  const ringOne =
    useRef();

  const ringTwo =
    useRef();

  const ringThree =
    useRef();


  useFrame((state) => {
    const time =
      state.clock.elapsedTime;


    if (core.current) {
      core.current.rotation.x =
        time * 0.24;

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
  });


  return (
    <Float
      speed={1.7}
      rotationIntensity={0.2}
      floatIntensity={0.7}
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
              100,
            ]}
          />

          <meshBasicMaterial
            color="#28ff78"
            transparent
            opacity={0.5}
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
              90,
            ]}
          />

          <meshBasicMaterial
            color="#28ff78"
            transparent
            opacity={0.35}
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
              80,
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
              1.2,
              2,
            ]}
          />

          <meshStandardMaterial
            color="#031008"
            emissive="#28ff78"
            emissiveIntensity={2.4}
            wireframe
          />

        </mesh>


        <pointLight
          color="#28ff78"
          intensity={12}
          distance={15}
        />

      </group>

    </Float>
  );
}
