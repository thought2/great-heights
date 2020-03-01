import { useState } from "react";
import * as React from "react";
import * as THREE from "three";
import { NonEmptyArray, head } from "fp-ts/lib/NonEmptyArray";
import { Texture } from "three";

const materialWhite = new THREE.MeshBasicMaterial({ color: "white" });
const materialBlack = new THREE.MeshBasicMaterial({ color: "black" });

export const Picture = ({
  rotation = 0,
  position = [0, 0, 0],
  scale = [1, 1, 1],
  textures = []
}: {
  rotation?: number;
  position?: Array<number>;
  scale?: Array<number>;
  textures?: Array<Texture>;
}) => {
  const [nthCycle, setNthCycle] = useState<number>(-1);
  const [texture, setTexture] = useState<null | Texture>(null);

  const newNthCycle = Math.floor(rotation / Math.PI);

  if (newNthCycle !== nthCycle) {
    setNthCycle(newNthCycle);

    const texturesNew = textures.filter(x => x.uuid !== texture?.uuid);

    const randomIndex = Math.floor(Math.random() * (texturesNew.length - 1));

    setTexture(texturesNew[randomIndex]);
  }

  return (
    <mesh
      position={position}
      scale={scale}
      rotation={new THREE.Euler(rotation, 0, 0)}
    >
      <boxBufferGeometry
        attach="geometry"
        args={[1, Math.abs(Math.sin(rotation)) * 6, 1]}
      />
      <meshBasicMaterial
        key="color"
        attach="material"
        map={texture}
        color={!texture ? (nthCycle % 2 === 0 ? "red" : "green") : undefined}
      />
    </mesh>
  );
};
