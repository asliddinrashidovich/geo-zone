import { FeatureGroup, MapContainer, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import L from "leaflet";
import { EditControl } from "react-leaflet-draw";
import { circle } from "leaflet";
import { useEffect, useRef, useState } from "react";

function App() {
  const position = [41.2995, 69.2401];
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const mapRef = useRef(null);
  const drawnItemsRef = useRef(new L.FeatureGroup());
  const [form, setForm] = useState({
    title: "",
    description: "",
    color: "",
    shapeType: "",
  });
  
  function handeChange(e) {
    setForm({...form, [e.target.name]: e.target.value})
  }
  
  const handleShapeChange = (e) => {
    const type = e.target.value;
    let drawer = null;

    if (type === "circle") drawer = new L.Draw.Circle(mapRef.current) 
    else if (type === "polygon") drawer = new L.Draw.Polygon(mapRef.current)
    else if (type === "polyline") drawer = new L.Draw.Polyline(mapRef.current) 
    
    if (drawer) drawer.enable()
  };

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current = L.map("map").setView([41.2995, 69.2401], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);
      mapRef.current.addLayer(drawnItemsRef.current);

      mapRef.current.on(L.Draw.Event.CREATED, (e) => {
        const { layer } = e;
        drawnItemsRef.current.addLayer(layer);
      });
    }
  }, []);

  function handleSubmitForm(e) {
    e.preventDefault()
    if (selectedZoneId) {
      setZones((prev) =>
        prev.map((z) => z.id == selectedZoneId ? { ...z, ...form } : z)
      );

      const zone = zones.find((z) => z.id == selectedZoneId);
      if (zone?.layer && zone.layer.setStyle) {
        zone.layer.setStyle({ color: form.color });
        zone.layer.editing.disable(); 
      }

      setSelectedZoneId(null);
      setForm({ title: "", description: "", color: "", shapeType: "" });
    } else {
      alert("Xaritadan shakl chizing");
    }
  }

  // ==================== CREATE SHAPE =====================
  const _onCreate = (e) => {
    const { layerType, layer } = e;
    const shapeData = layer.toGeoJSON();
    const {title, description, color} = form
    const newZone = {
      id: Date.now(),
      title: title ? title :"untitled",
      description: description ? description : "undescribed", 
      color,
      shapeType: layerType,
      shapeData,
      layer
    };
    layer.options.zoneId = newZone.id;

    if (layer.setStyle) {
      layer.setStyle({ color: form.color });
    }
    setZones([...zones, newZone]);
    setForm({ title: "", description: "" });
  }
  
  // ====================== DELETE SHAPE ======================
  const _onDeleted = (e) => {
    const deletedIds = [];
    e.layers.eachLayer((layer) => {
      deletedIds.push(layer.options.zoneId);
    });
    setZones(zones.filter((z) => !deletedIds.includes(z.id)));
  }

  const handleDeleteZone = (id) => {
    setZones((prevZones) => {
      const zoneToDelete = prevZones.find((z) => z.id === id);
      if (zoneToDelete && zoneToDelete.layer) {
        zoneToDelete.layer.remove(); 
      }
      return prevZones.filter((z) => z.id !== id);
    });
  }
  
  // ====================== EDIT SHAPE =======================
  const _onEdited = (e) => {
    const updated = [];
    e.layers.eachLayer((layer) => {
      const id = layer.options.zoneId;
      const geo = layer.toGeoJSON();
      updated.push({ id, geo });
    });

    setZones((prev) =>
      prev.map((z) => {
        const upd = updated.find((u) => u.id === z.id);
        if (upd) return { ...z, shapeData: upd.geo }
        return z;
      })
    );
  };

  const handleEditZone = (id) => {
     const zone = zones.find(z => z.id === id);
    if (!zone) return;
    
    setSelectedZoneId(id);
    setForm({
      title: zone.title,
      description: zone.description,
      color: zone.color,
      shapeType: zone.shapeType,
    });

    if (zone.layer) {
      zone.layer.editing.enable();
    }
  }

  return (
    <div className="max-w-[100vw] w-full h-[100vh] flex overflow-hidden">
      <div className="w-[200px] md:w-[400px] z-10 bg-gray-300 h-[100%] py-[40px] px-[20px] overflow-y-auto">
        <h1 className="text-[32px] text-center mb-[20px]">Geo Zone</h1>
        <form onSubmit={handleSubmitForm}>
          <label htmlFor="title">
            <span>Title:</span>
            <input placeholder="untitled" value={form.title} name="title" onChange={handeChange} type="text" className="w-full border-[#999] outline-none rounded-[5px] border-[1px] py-[3px] px-[6px] mb-[10px]"/>
          </label>
          <label htmlFor="description">
            <span>Description:</span>
            <input placeholder="undescribed" value={form.description} name="description" onChange={handeChange} type="text" className="w-full border-[#999] outline-none rounded-[5px] border-[1px] py-[3px] px-[6px] mb-[10px]"/>
          </label>
          <label htmlFor="color">
            <span className="w-full block">Color:</span>
            <input value={form.color} name="color" onChange={handeChange} type="color" className="w-[100px] block cursor-pointer h-[40px] border-[#999] outline-none mb-[10px]"/>
          </label>
          <label htmlFor="shapetype">
            <span className="">ShapeType:</span>
            <select   name="shapetype" onChange={handleShapeChange}  id="shapetype" className="cursor-pointer border-[1px] border-[#999] rounded-[6px] px-[10px] ml-[20px] outline-none mb-[10px]">
              <option value="" disabled>
                Shape tanlang
              </option>
              <option value="circle">Circle</option>
              <option value="polygon">Polygon</option>
              <option value="polyline">Polyline</option>
            </select>
          </label>
          {!selectedZoneId && <button className="block w-full text-center rounded-[5px] p-[5px] bg-[blue] cursor-pointer text-[#fff]">Create</button>}
          {selectedZoneId && <button className="block w-full text-center rounded-[5px] p-[5px] bg-[#ffa200] cursor-pointer text-[#000]">Edit</button>}
        </form>
        <hr className="my-[20px] border-[#999]"/>
        <div>
          <h2 className="font-[600] text-[20px]">Zones: {zones.length}</h2>
          <div className="flex flex-col gap-[5px] mt-[10px]">
            {zones.map((zone) => (
              <div key={zone.id} className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-[600]">{zone.title}</h4>
                  <p className="text-[#555] font-[300] text-[15px]">{zone.description}</p>
                </div>
                <div className="flex gap-[10px]">
                  <button onClick={() => handleEditZone(zone.id)} className="text-orange-300 cursor-pointer text-[13px] border-[1px] px-[10px] rounded-[5px]">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteZone(zone.id)} className="text-red-600 cursor-pointer text-[13px] border-[1px] px-[10px] rounded-[5px]">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-[calc(100vw-200px)] md:w-[calc(100vw-400px)]">
        <MapContainer center={position} zoom={13} ref={mapRef}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FeatureGroup>
            <EditControl position="topright" onCreated={_onCreate} onEdited={_onEdited} onDeleted={_onDeleted} draw={{rectangle: false, polyline: true, polygon: true, circle: circle, circlemarker: false, marker: false}}/>
          </FeatureGroup>
        </MapContainer>
      </div>
    </div>
  )
}

export default App