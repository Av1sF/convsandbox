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
        <span className="font-bold">
          Create your own mini 2D Convolutional Neural Network!{" "}
        </span>
        This interactive visualiser allows you to explore the core mathematics
        behind CNNs through creativity and hands-on experimentation. As the
        model is untrained, all inputs and parameters are randomly initialised.
        <br className="block lg:hidden" />
        <br className="block lg:hidden" />
        Designed for students learning fundamental CNN concepts, with a
        background in foundational linear algebra and neural networks, the
        application helps reinforce key equations and ideas through visual and
        interactive exploration.
        <br className="block lg:hidden" />
        <br className="block lg:hidden" />
        Its theory is based on{" "}
        <a
          href="https://udlbook.github.io/udlbook/"
          className="transition hover:[-webkit-text-stroke:1px_currentColor]"
        >
          &quot;Understanding Deep Learning&quot;
        </a>{" "}
        by Simon J. D. Prince. As you build your network, a real CNN is created
        in the background using{" "}
        <a
          href="https://www.tensorflow.org/js"
          className="transition hover:[-webkit-text-stroke:1px_currentColor]"
        >
          TensorFlow.js
        </a>
        , with dynamic animations bringing each stage of the model to life.
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

        </div>
      </MathJaxContext>
    </>
  );
}
