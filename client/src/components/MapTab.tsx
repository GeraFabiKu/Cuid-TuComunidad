import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Donation } from "@shared/schema";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { MapPin, FileDown, Printer, Map, Filter, LocateFixed } from "lucide-react";
import L from "leaflet";
import DonationsExport from "./DonationsExport";

type MapTabProps = {
  donations: Donation[];
  isLoading: boolean;
};

// Componente que actualiza la vista del mapa con los marcadores
function MapUpdater({ donations }: { donations: Donation[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (donations.length > 0) {
      const markers = donations.map(d => [d.latitud, d.longitud]);
      
      if (markers.length === 1) {
        map.setView([markers[0][0], markers[0][1]], 13);
      } else {
        map.fitBounds(markers as [number, number][]);
      }
    }
  }, [donations, map]);
  
  return null;
}

// Componente para obtener la ubicación actual
function LocationButton() {
  const map = useMap();
  const [loading, setLoading] = useState(false);
  
  const handleClick = () => {
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 13);
          setLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Error al obtener la ubicación: " + error.message);
          setLoading(false);
        },
        { 
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      alert("Tu navegador no soporta geolocalización");
      setLoading(false);
    }
  };
  
  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: "60px" }}>
      <div className="leaflet-control leaflet-bar">
        <button 
          className="bg-white p-2 shadow-md hover:bg-gray-100 flex items-center justify-center"
          onClick={handleClick}
          title="Mi ubicación"
          disabled={loading}
        >
          <LocateFixed className={`h-5 w-5 ${loading ? 'animate-pulse text-blue-500' : 'text-gray-700'}`} />
        </button>
      </div>
    </div>
  );
}

export default function MapTab({ donations, isLoading }: MapTabProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [filteredType, setFilteredType] = useState<string | null>(null);
  const [filteredStatus, setFilteredStatus] = useState<string | null>(null);
  
  // Filtrar donaciones
  const filteredDonations = donations.filter(d => {
    if (filteredType && d.tipo !== filteredType) return false;
    if (filteredStatus && d.estado_entrega !== filteredStatus) return false;
    return true;
  });

  // Get marker color based on donation type
  const getMarkerColor = (tipo: string) => {
    const typeColors: Record<string, string> = {
      'Alimentos': 'red',
      'Ropa': 'blue',
      'Medicamentos': 'green', 
      'Muebles': 'orange',
      'Juguetes': 'purple',
      'Material Escolar': 'yellow',
      'Electrodomésticos': 'gray'
    };
    return typeColors[tipo] || 'black';
  };

  // Create custom marker icon
  const createMarkerIcon = (tipo: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${getMarkerColor(tipo)}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [16, 16],
    });
  };

  // Obtener tipos únicos para filtros
  const uniqueTypes = Array.from(new Set(donations.map(d => d.tipo)));
  const uniqueStatuses = Array.from(new Set(donations.map(d => d.estado_entrega).filter(Boolean)));

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-lg">
        <CardContent className="py-6">
          <h2 className="text-2xl font-semibold mb-4">Mapa Interactivo</h2>
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-lg">
      <CardContent className="py-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Map className="mr-2 h-5 w-5 text-green-600" />
            <h2 className="text-2xl font-semibold">Mapa Interactivo</h2>
          </div>
          
          <div className="flex items-center gap-2">
            {donations.length > 0 && (
              <>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {filteredDonations.length} ubicaciones
                </span>
                <DonationsExport donations={filteredDonations} title="Mapa de Donaciones" />
              </>
            )}
          </div>
        </div>
        
        {/* Filtros */}
        {donations.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 items-center bg-gray-50 p-3 rounded-lg">
            <Filter className="text-gray-500 h-4 w-4 mr-1" />
            <span className="text-sm font-medium text-gray-600 mr-2">Filtros:</span>
            
            <div className="flex flex-wrap gap-2">
              <select 
                className="text-sm rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={filteredType || ""}
                onChange={(e) => setFilteredType(e.target.value || null)}
              >
                <option value="">Todos los tipos</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <select 
                className="text-sm rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={filteredStatus || ""}
                onChange={(e) => setFilteredStatus(e.target.value || null)}
              >
                <option value="">Todos los estados</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              
              {(filteredType || filteredStatus) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setFilteredType(null);
                    setFilteredStatus(null);
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        )}

        {donations.length === 0 ? (
          <div>
            <img 
              src="https://images.unsplash.com/photo-1580893246395-52aead8960dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80" 
              alt="Mapa comunitario con ubicaciones" 
              className="w-full h-40 object-cover rounded-lg shadow-md mb-4" 
            />
            
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No hay ubicaciones para mostrar en el mapa.</p>
              <p className="text-gray-500 text-sm mt-1">Agrega algunas donaciones para verlas representadas aquí.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <MapContainer 
                center={[40.416775, -3.703790]} 
                zoom={5} 
                style={{ height: "500px", width: "100%" }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                />
                {filteredDonations.map((d, i) => (
                  <Marker 
                    key={i} 
                    position={[d.latitud, d.longitud]}
                    icon={createMarkerIcon(d.tipo)}
                  >
                    <Popup>
                      <div className="p-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{d.tipo}</h3>
                          {d.estado_entrega && (
                            <Badge variant="outline" className="text-xs">
                              {d.estado_entrega}
                            </Badge>
                          )}
                        </div>
                        <p>{d.descripcion}</p>
                        <p><em>{d.estado}</em></p>
                        <p>{d.zona}, {d.ciudad}</p>
                        <div className="mt-1">
                          <p className="text-xs text-gray-500">Lat: {d.latitud}, Lng: {d.longitud}</p>
                          {d.donante_id && (
                            <p className="text-xs text-gray-500">Donante ID: {d.donante_id}</p>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                <MapUpdater donations={filteredDonations} />
                <LocationButton />
              </MapContainer>
            </div>
            
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Leyenda de Marcadores</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-red-500 mr-2"></span>
                  <span className="text-sm text-gray-600">Alimentos</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
                  <span className="text-sm text-gray-600">Ropa</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-green-500 mr-2"></span>
                  <span className="text-sm text-gray-600">Medicamentos</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-purple-500 mr-2"></span>
                  <span className="text-sm text-gray-600">Otros</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
