"use client";
import Visualiser from "@/components/Visualiser/Visualiser";
import { MathJaxContext } from "better-react-mathjax";
import { useState } from "react";

export default function Home() {
  const config = {
    loader: { load: ["[tex]/color"] },
    tex: { packages: { "[+]": ["color"] } },
  };

  const [seed, setSeed] = useState(1);
  const reset = () => {
    setSeed(Math.random());
  };

  return (
    <>
      <p className="text-text p-1 text-2xl font-bold">
        Conv<span className="text-accent-warm">Sandbox</span>.
      </p>
      <p className="text-text-muted px-10 py-4 pb-10">
        Create your own mini 2D Convolutional Neural Network! As the model will
        be untrained, all inputs and parameters are randomly initialised. This
        application aims to connect mathematical CNN concepts with
        interactivity, creativity and visualisation!
      </p>
      <MathJaxContext config={config}>
        <div className="flex flex-col p-1 justify-center items-center text-stroke">
          {/* Simulator */}
            <Visualiser key={seed} />
            <div onClick={reset} className="text-right pt-2 pr-0.5">
              <span className=" cursor-pointer hover:text-accent-warm select-none">
                Reset
              </span>
            </div>

            <p className="text-xs text-text-muted italic pt-80 bg-center">If you have any questions or feedback about the <span className="text-text">Conv</span><span className="text-accent-warm">Sandbox</span>, please feel free to contact us at avis.cl.fung@kcl.ac.uk</p>
        </div>
      </MathJaxContext>
      
      
    </>
  );
}
