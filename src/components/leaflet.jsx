import { MapContainer, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useState } from "react";

function App() {
  const position = [48.8566, 2.3522];

  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    color: "#3388ff",
    shapeType: "Polygon",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleAddZone = () => {
    const newZone = {
      id: Date.now(),
      ...form,
      // shapeData keyin xaritada chizilganda qo‘shiladi
    };
    setZones([...zones, newZone]);
    setForm({ title: "", description: "", color: "#3388ff", shapeType: "Polygon" });
  };

  const handleDeleteZone = (id) => {
    setZones(zones.filter(z => z.id !== id));
  };

  return (
    <div className="max-w-[100vw] w-full h-[100vh] flex overflow-hidden">
      {/* Left Panel */}
      <div className="w-[400px] z-10 bg-gray-300 h-full py-5 px-4 overflow-y-auto">
        <h1 className="text-2xl font-bold text-center mb-4">Geo Zone</h1>

        {/* Form */}
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="w-full mb-2 p-2 rounded"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full mb-2 p-2 rounded"
        />
        <input
          type="color"
          name="color"
          value={form.color}
          onChange={handleChange}
          className="w-full mb-2"
        />
        <select
          name="shapeType"
          value={form.shapeType}
          onChange={handleChange}
          className="w-full mb-2 p-2 rounded"
        >
          <option value="Polygon">Polygon</option>
          <option value="Circle">Circle</option>
          <option value="Line">Line</option>
        </select>
        <button
          onClick={handleAddZone}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Add Zone
        </button>

        {/* Zones List */}
        <h2 className="text-lg font-semibold mt-4">Zones</h2>
        <ul>
          {zones.map((zone) => (
            <li key={zone.id} className="flex justify-between items-center mb-2">
              <span>{zone.title}</span>
              <button
                onClick={() => handleDeleteZone(zone.id)}
                className="text-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Map */}
      <div className="w-[calc(100vw-400px)]">
        <MapContainer center={position} zoom={13} className="w-full h-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Keyingi qadamda: zonalarni chizish */}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
