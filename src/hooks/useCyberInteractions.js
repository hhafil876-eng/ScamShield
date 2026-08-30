import { useEffect } from "react";

export default function useCyberInteractions() {
  useEffect(() => {
    const coarsePointer =
      window.matchMedia("(pointer: coarse)").matches;

    const handlePointerMove = (event) => {
      document.documentElement.style.setProperty(
        "--cursorX",
        `${event.clientX}px`
      );

      document.documentElement.style.setProperty(
        "--cursorY",
        `${event.clientY}px`
      );

      if (coarsePointer) return;

      /* =========================================
         3D CARD TILT
         ========================================= */

      const card =
        event.target.closest?.(".tilt-card");

      if (card) {
        const rect =
          card.getBoundingClientRect();

        const x =
          event.clientX - rect.left;

        const y =
          event.clientY - rect.top;

        const centerX =
          rect.width / 2;

        const centerY =
          rect.height / 2;

        const rotateX =
          ((y - centerY) / centerY) * -4;

        const rotateY =
          ((x - centerX) / centerX) * 5;

        card.style.setProperty(
          "--rotateX",
          `${rotateX}deg`
        );

        card.style.setProperty(
          "--rotateY",
          `${rotateY}deg`
        );

        card.style.setProperty(
          "--mouseX",
          `${x}px`
        );

        card.style.setProperty(
          "--mouseY",
          `${y}px`
        );
      }

      /* =========================================
         MAGNETIC BUTTONS
         ========================================= */

      const magnetic =
        event.target.closest?.(".magnetic");

      if (magnetic) {
        const rect =
          magnetic.getBoundingClientRect();

        const x =
          event.clientX -
          rect.left -
          rect.width / 2;

        const y =
          event.clientY -
          rect.top -
          rect.height / 2;

        magnetic.style.setProperty(
          "--magneticX",
          `${x * 0.09}px`
        );

        magnetic.style.setProperty(
          "--magneticY",
          `${y * 0.11}px`
        );
      }
    };

    const handlePointerOut = (event) => {
      if (coarsePointer) return;

      const card =
        event.target.closest?.(".tilt-card");

      if (
        card &&
        !card.contains(event.relatedTarget)
      ) {
        card.style.setProperty(
          "--rotateX",
          "0deg"
        );

        card.style.setProperty(
          "--rotateY",
          "0deg"
        );
      }

      const magnetic =
        event.target.closest?.(".magnetic");

      if (
        magnetic &&
        !magnetic.contains(event.relatedTarget)
      ) {
        magnetic.style.setProperty(
          "--magneticX",
          "0px"
        );

        magnetic.style.setProperty(
          "--magneticY",
          "0px"
        );
      }
    };

    document.addEventListener(
      "pointermove",
      handlePointerMove
    );

    document.addEventListener(
      "pointerout",
      handlePointerOut
    );

    return () => {
      document.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      document.removeEventListener(
        "pointerout",
        handlePointerOut
      );
    };
  }, []);
}