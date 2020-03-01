import * as ReactDOM from "react-dom";
import { useRef, useState, useEffect } from "react";
import * as React from "react";
import { Canvas, useFrame, stateContext, useLoader } from "react-three-fiber";
import * as THREE from "three";
import { TextureLoader, MeshPhysicalMaterial } from "three";
import * as WikimediaCommons from "../WikimediaCommons";
import { Picture } from "./Picture";
import { Composition } from "./Composition";

const Loading = ({}) => <div>Loading...</div>;

export const Main = ({}) => {
  const [textures, setTextures] = useState<Array<THREE.Texture>>([]);

  const texturesCount = 5;

  useInterval(() => {
    const fetchCount =
      textures.length === texturesCount ? 1 : texturesCount - textures.length;

    fetchTextures(fetchCount).then(newTextures => {
      const countOld = textures.length - newTextures.length;
      setTextures([...newTextures, ...textures.slice(0, countOld)]);
    });
  }, 3000);

  useEffect(() => {
    console.log(1);
    fetchTextures(texturesCount).then(setTextures);
  }, []);

  return !textures.length ? <Loading /> : <Composition textures={textures} />;
};

const fetchTextures = (n: number): Promise<Array<THREE.Texture>> =>
  WikimediaCommons.getRandomImageResources({ limit: 50 }).then(
    imageResources => {
      const filteredImageResources = imageResources
        .reduce((accum, imageResource) => {
          const url = WikimediaCommons.toUrl(800, imageResource);
          return url ? [...accum, url] : accum;
        }, [] as Array<string>)
        .filter(url => /.jpe?g$/.test(url))
        .slice(0, n)
        .map(url => {
          const loader = new THREE.TextureLoader();
          const texture = loader.load(url);
          return texture;
        });

      return Promise.resolve(filteredImageResources);
    }
  );

const useInterval = (callback: (x: void) => void, delay: number) => {
  const savedCallback = useRef<(x: void) => void>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current && savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};
