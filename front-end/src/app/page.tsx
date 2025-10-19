import Visualiser from "@/components/Visualiser/Visualiser";
import { MathJaxContext } from "better-react-mathjax";

export default function Home() {
  return (
    <MathJaxContext>
      <div className="flex flex-col p-1 justify-center items-center text-stroke">
        {/* Simulator */}
        <Visualiser />
      </div>
    </MathJaxContext>
  );
}
