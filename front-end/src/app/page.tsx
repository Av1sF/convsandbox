import Visualiser from "@/components/Visualiser/Visualiser";

export default function Home() {
  return (
    <div className="flex flex-col p-1 justify-center items-center text-stroke">
      {/* Simulator */}
      <Visualiser />
    </div>
  );
}
