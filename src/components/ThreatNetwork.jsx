import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";

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
];


export default function ThreatNetwork() {
  const network =
    useRef();


  useFrame((state) => {
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
  });


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
                  0.07,
                  10,
                  10,
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
          networkNodes.length - 1
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
              opacity={0.18}
            />

          )
        )}

    </group>
  );
}
