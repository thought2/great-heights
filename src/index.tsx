import * as ReactDOM from "react-dom";
import { useRef, useState, useEffect } from "react";
import * as React from "react";
import { Canvas, useFrame, stateContext, useLoader } from "react-three-fiber";
import * as THREE from "three";
import { TextureLoader, MeshPhysicalMaterial } from "three";
import * as WikimediaCommons from "./WikimediaCommons";

const Picture = (props: {
  rotation?: number;
  position?: Array<number>;
  scale?: Array<number>;
  textures?: Array<THREE.Texture>;
}) => {
  const nth = Math.floor((props.rotation || 0) / Math.PI);

  const texture = props.textures && props.textures[nth % props.textures.length];

  return (
    <mesh
      position={props.position || [0, 0, 0]}
      scale={props.scale || [1, 1, 1]}
      rotation={new THREE.Euler(props.rotation || 0, 0, 0)}
    >
      <boxBufferGeometry
        attach="geometry"
        args={[1, Math.abs(Math.sin(props.rotation || 0)) * 6, 1]}
      />

      {texture ? (
        <meshBasicMaterial attach="material" map={texture} />
      ) : (
        <meshBasicMaterial attach="material" color="red" />
      )}
    </mesh>
  );
};

const Box = (props: {
  position: Array<number>;
  tick: number;
  img: THREE.Texture;
}) => {
  const mesh = useRef();

  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  return (
    <mesh
      position={props.position}
      ref={mesh}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      onClick={e => setActive(!active)}
      onPointerOver={e => setHover(true)}
      onPointerOut={e => setHover(false)}
      rotation={new THREE.Euler(props.tick / 2000, 0, 0)}
    >
      <boxBufferGeometry attach="geometry" args={[1, 1, 0.05]} />

      <meshBasicMaterial attach="material" map={props.img} />
    </mesh>
  );
};

const Loading = ({}) => <div>Loading...</div>;

const Graphics = (props: { textures: Array<THREE.Texture> }) => {
  const [tick, setTick] = useState(0);

  const [grid, setGrid] = useState<null | Array<{
    x: number;
    y: number;
    speed: number;
  }>>(null);

  const configX = { start: -6, end: 6, n: 6 };

  const configY = { start: -0.5, end: 0.5, n: 1 };

  const lengthX = ((configX.end - configX.start) / configX.n) * 0.8;

  const lengthY = ((configY.end - configY.start) / configY.n) * 0.8;

  useEffect(() => {
    setGrid(
      linSpace(configX.start, configX.end, configX.n).flatMap(x =>
        linSpace(configY.start, configY.end, configY.n).map(y => ({
          x,
          y,
          speed: Math.random()
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
            rotation={tick * 0.001 * speed}
            position={[x, y, 0]}
            scale={[1, 1, 1]}
            textures={props.textures}
          />
        ))}
    </Canvas>
  );
};

const Main = ({}) => {
  const [textures, setTextures] = useState<null | Array<THREE.Texture>>(null);

  useEffect(() => {
    fetchTextures().then(setTextures);
  }, []);

  return !textures ? <Loading /> : <Graphics textures={textures} />;
};

const main = () => ReactDOM.render(<Main />, document.getElementById("root"));

const linSpace = (start: number, end: number, n: number): Array<number> => {
  const dist = end - start;
  const step = dist / (n + 1);

  const out: Array<number> = [];
  for (let i = 1; i <= n; i++) {
    out.push(start + i * step);
  }
  return out;
};

const filterResults = (
  width: number,
  results: Array<WikimediaCommons.ImageResource>
): Array<THREE.Texture> => {
  const textures: Array<THREE.Texture> = [];

  results.forEach(imageRes => {
    if (!/.jpe?g$/.test(imageRes.urlTemplate.suffix)) return;

    const url = WikimediaCommons.toUrl(width, imageRes);
    if (!url) return;

    const loader = new THREE.TextureLoader();
    const texture = loader.load(url);

    if (textures.length >= 6) return;

    textures.push(texture);
  });

  return textures;
};

const fetchTextures = (): Promise<Array<THREE.Texture>> =>
  WikimediaCommons.getRandomImageResources({ limit: 50 }).then(xs => {
    return Promise.resolve(filterResults(800, xs));
  });

main();
