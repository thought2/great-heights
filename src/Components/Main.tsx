import * as ReactDOM from "react-dom";
import { useRef, useState, useEffect } from "react";
import * as React from "react";
import { Canvas, useFrame, stateContext, useLoader } from "react-three-fiber";
import * as THREE from "three";
import { TextureLoader, MeshPhysicalMaterial, Texture } from "three";
import * as WikimediaCommons from "../WikimediaCommons";
import { Picture } from "./Picture";
import { Composition } from "./Composition";
import { Loading } from "./Loading";

const constants = {
  texturesCount: 20,
  refetch: 3000,
  apiLimit: 50
};

export const Main = ({}) => {
  const [textures, setTextures] = useState<Array<THREE.Texture>>([]);

  useInterval(() => {
    const fetchCount =
      textures.length === constants.texturesCount
        ? 1
        : constants.texturesCount - textures.length;

    fetchTextures(fetchCount).then(newTextures => {
      const countOld = textures.length - newTextures.length;
      setTextures([...newTextures, ...textures.slice(0, countOld)]);
    });
  }, constants.refetch);

  useEffect(() => {
    fetchTextures(constants.texturesCount).then(setTextures);
  }, []);

  return !textures.length ? <Loading /> : <Composition textures={textures} />;
};

const fetchTextures = (n: number): Promise<Array<Texture>> =>
  WikimediaCommons.getRandomImageResources({ limit: constants.apiLimit }).then(
    imageResources => {
      const filteredImageResources: Array<Promise<Texture>> = imageResources
        .reduce((accum, imageResource) => {
          const url = WikimediaCommons.toUrl(800, imageResource);
          return url ? [...accum, url] : accum;
        }, [] as Array<string>)
        .filter(url => /.jpe?g$/.test(url))
        .slice(0, n)
        .map(
          url =>
            new Promise((resolve, reject) => {
              const loader = new THREE.TextureLoader();
              loader.load(url, resolve, () => {}, reject);
            })
        );

      return Promise.all(filteredImageResources);
    }
  );

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
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
