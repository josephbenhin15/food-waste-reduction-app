import { useState } from "react";
import nitwMap from "../../assets/nitw.jpg";

function CampusMap() {

  const [selected, setSelected] = useState(null);

  // 📍 CAMPUS LOCATIONS WITH STATUS
  const locations = [ 
    {
      name: "Main Mess",
      x: "40%",
      y: "60%",
      status: "open",
      info: "Breakfast: 7-9 AM\nLunch: 12-2 PM\nDinner: 7-9 PM"
    },
    {
      name: "Juice Shop",
      x: "55%",
      y: "65%",
      status: "closed",
      info: "Currently closed ❌"
    },
    {
      name: "Library",
      x: "60%",
      y: "30%",
      status: "open",
      info: "Open: 8 AM - 10 PM"
    },
    {
      name: "Road Work",
      x: "30%",
      y: "40%",
      status: "construction",
      info: "Road under construction 🚧"
    }
  ];

  // 🎨 COLOR BASED ON STATUS
  const getColor = (status) => {
    if (status === "open") return "bg-green-500";
    if (status === "closed") return "bg-red-500";
    return "bg-yellow-500";
  };

  const getLabel = (status) => {
    if (status === "open") return "OPEN";
    if (status === "closed") return "CLOSED";
    return "WORK";
  };

  return (
    <div className="px-10 py-16 text-white relative">

      <h2 className="text-3xl font-bold mb-6">
        🗺️ NITW Smart Campus Map
      </h2>

      {/* 🗺️ MAP */}
      <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-white/10">
      <img
  src={nitwMap}
  className="w-full h-full object-cover"
/> 
        

        {/* 📍 MARKERS */}
        {locations.map((loc, index) => (
          <div
            key={index}
            onClick={() => setSelected(loc)}
            className="absolute cursor-pointer group"
            style={{ top: loc.y, left: loc.x }}
          >
            {/* DOT */}
            <div className={`w-4 h-4 rounded-full ${getColor(loc.status)} animate-pulse`} />

            {/* LABEL */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 hidden group-hover:block">
              <span className={`text-xs px-2 py-1 rounded text-white ${getColor(loc.status)}`}>
                {getLabel(loc.status)}
              </span>
            </div>
          </div>
        ))}

      </div>

      {/* 📦 INFO BOX */}
      {selected && (
        <div className="mt-6 bg-white/10 p-5 rounded-xl max-w-md border border-white/10">

          <h3 className="text-xl font-bold">
            {selected.name}
          </h3>

          {/* STATUS */}
          <span className={`inline-block mt-2 px-3 py-1 rounded text-sm ${
            selected.status === "open"
              ? "bg-green-500"
              : selected.status === "closed"
              ? "bg-red-500"
              : "bg-yellow-500"
          }`}>
            {getLabel(selected.status)}
          </span>

          <p className="text-gray-300 whitespace-pre-line mt-3">
            {selected.info}
          </p>

          <button
            onClick={() => setSelected(null)}
            className="mt-4 bg-red-500 px-4 py-1 rounded hover:bg-red-600"
          >
            Close
          </button>

        </div>
      )}

      {/* 🧭 LEGEND */}
      <div className="absolute top-20 right-10 bg-black/70 p-4 rounded-lg text-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          Open
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          Closed
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          Construction
        </div>
      </div>

      {/* 🔗 GOOGLE MAP LINK */}
      <a
        href="https://www.google.com/maps"
        target="_blank"
        className="inline-block mt-6 bg-green-500 px-4 py-2 rounded hover:bg-green-600"
      >
        Open in Google Maps
      </a>

    </div>
  );
}

export default CampusMap;