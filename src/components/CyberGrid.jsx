import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function CyberGrid() {
  const grid =
    useRef();

  useFrame((state) => {
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
  });


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
