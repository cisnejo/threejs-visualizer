import React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, useBox, usePlane, useSphere } from "@react-three/cannon";
import * as THREE from "three";

import { useRef, useEffect, useState } from 'react'

const positions = [
  [10, 1, 0],
  [15, 1, 0],
  [20, 1, 0],
  [25, 1, 0],
  [30, 1, 0],
  [35, 1, 0]
];

const size = [
  [10, 1, 0],
  [15, 1, 0],
  [20, 1, 0],
  [25, 1, 0],
  [30, 1, 0],
  [35, 1, 0]
];









function Marble() {
  const [ref] = useSphere(() => ({
    mass: 10,
    position: [-5, 1, 0]
  }));

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry
        attach="geometry"
        args={[1, 32, 32]}
      ></sphereGeometry>
      <meshStandardMaterial color="white" />
    </mesh>
  );
}

function Box({ rawData, x }) {
  const [ref, api] = useBox(() => ({
    mass: 10,
    position: [(x * 2 - 100), 1, 0],
    args: [2, 2, 2]
  }));
  const velocity = useRef([0, 0, 0])
  useEffect(() => {
    api.velocity.set(0, 0, 0)

  }, [])
  return (
    <mesh ref={ref} castShadow>
      <boxGeometry attach="geometry" args={[1, rawData / 5, .01]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}

const Plane = () => {
  const [ref, api] = usePlane(() => ({
    mass: 1,
    position: [0, 0, 0],
    type: "Static",
    rotation: [-Math.PI / 2, 0, 0]
  }));
  useFrame(({ mouse }) => {
    // api.rotation.set(-Math.PI / 2 - mouse.y * 0.2, 0 + mouse.x * 0.2, 0);
  });
  return (
    <mesh scale={300} ref={ref} receiveShadow>
      <planeGeometry />
      <meshStandardMaterial color="white" side={THREE.DoubleSide} />
    </mesh>
  );
};

export default function App() {

  const [rawData, setRawData] = useState([]);
  const [xpos, setxpos] = useState(0)
  //useEffect(() => { console.log(rawData) }, [rawData])
  useEffect(() => { console.log(xpos) }, [xpos])
  const startFromFile = async () => {
    const res = fetch("/MEGALOVANIA.mp3");
    const byteArray = await (await res).arrayBuffer();

    const context = new AudioContext();
    const audioBuffer = await context.decodeAudioData(byteArray);

    const source = context.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = context.createGain();
    gainNode.gain.value = 0.5; //10%;
    gainNode.connect(context.destination);

    const analyzer = context.createAnalyser();
    analyzer.fftSize = 512 / 2;

    source.connect(analyzer);
    analyzer.connect(gainNode);
    source.start();

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const update = () => {
      analyzer.getByteFrequencyData(dataArray);
      setRawData(Array.from(dataArray));
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  return (
    <Canvas onClick={startFromFile} camera={{ position: [0, 1, 50], fov: 90 }} shadows >

      <color attach="background" args={["#94ebd8"]} />
      {/* <fog attach="fog" args={["#94ebd8", 0, 40]} /> */}
      <ambientLight intensity={0.1} />
      <directionalLight intensity={0.1} castShadow />
      <pointLight
        castShadow
        intensity={3}
        args={[0xff0000, 1, 100]}
        position={[-1, 3, 1]}
      />
      <spotLight
        castShadow
        intensity={1}
        args={["blue", 1, 100]}
        position={[-1, 4, -1]}
        penumbra={1}
      />

      <Physics>
        <Plane />
        {rawData.map((size, idx) => {

          return (

            <Box rawData={size} x={idx} key={idx} />
          )
        })}
      </Physics>
    </Canvas>
  );
}