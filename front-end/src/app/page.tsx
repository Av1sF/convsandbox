import Visualiser from "@/components/Visualiser/Visualiser";
import { MathJaxContext } from "better-react-mathjax";

export default function Home() {
  const config = {
    loader: { load: ["[tex]/color"] },
    tex: { packages: { "[+]": ["color"] } },
  };
  return (
    <>
    <p className="text-text p-1 text-2xl font-bold">Conv<span className="text-accent-warm">Sandbox</span>.</p>
    <MathJaxContext config={config}>
      <div className="flex flex-col p-1 justify-center items-center text-stroke">
        {/* Simulator */}
        <Visualiser />
      </div>
    </MathJaxContext>
    </>
  );
}
