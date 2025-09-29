import VisualiserCanvas from "@/components/VisualiserCanvas";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col p-8 justify-center items-center text-stroke">
      <VisualiserCanvas  className="w-full h-[80vh] rounded-md border-1 border-secondary"> 


      </VisualiserCanvas>
    </div>
  );
}
