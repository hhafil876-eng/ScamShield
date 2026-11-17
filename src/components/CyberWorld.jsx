import { Canvas } from "@react-three/fiber";
import ScrollScene from "./ScrollScene";

export default function CyberWorld() {
  return (
    <div className="cyber-world">

      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference:
            "high-performance",
        }}
      >

        <ScrollScene />

      </Canvas>

    </div>
  );
}