import * as ReactDOM from "react-dom";
import { useRef, useState, useEffect } from "react";
import * as React from "react";
import { Canvas, useFrame, stateContext, useLoader } from "react-three-fiber";
import * as THREE from "three";
import { Picture } from "./Picture";

const constants = {
  countPictures: 6
};

export const Composition = (props: { textures: Array<THREE.Texture> }) => {
  const [tick, setTick] = useState(0);

  const [grid, setGrid] = useState<null | Array<{
    x: number;
    y: number;
    speed: number;
  }>>(null);

  const configX = { start: -6, end: 6, n: constants.countPictures };

  const configY = { start: -0.5, end: 0.5, n: 1 };

  const lengthX = ((configX.end - configX.start) / configX.n) * 0.8;

  const lengthY = ((configY.end - configY.start) / configY.n) * 0.8;

  useEffect(() => {
    setGrid(
      linSpace(configX.start, configX.end, configX.n).flatMap(x =>
        linSpace(configY.start, configY.end, configY.n).map(y => ({
          x,
          y,
          speed: 0.2 + Math.random() * 0.8
        }))
      )
    );
  }, []);

  requestAnimationFrame(t => {
    setTick(t);
  });

  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {grid &&
        grid.map(({ x, y, speed }) => (
          <Picture
            rotation={tick * 0.0005 * speed}
            position={[x, y, 0]}
            scale={[1, 1, 1]}
            textures={props.textures}
          />
        ))}
    </Canvas>
  );
};

const linSpace = (start: number, end: number, n: number): Array<number> => {
  const dist = end - start;
  const step = dist / (n + 1);

  const out: Array<number> = [];
  for (let i = 1; i <= n; i++) {
    out.push(start + i * step);
  }
  return out;
};
