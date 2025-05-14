import { Donation } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Package, MapPin, Clock, User } from "lucide-react";
import DonationsExport from "./DonationsExport";

type DonationsListProps = {
  donations: Donation[];
  isLoading: boolean;
};

export default function DonationsList({ donations, isLoading }: DonationsListProps) {
  // Get icon class based on donation type
  const getDonationIcon = (tipo: string) => {
    switch (tipo) {
      case "Alimentos":
        return "🍎";
      case "Ropa":
        return "👕";
      case "Muebles":
        return "🪑";
      case "Medicamentos":
        return "💊";
      case "Juguetes":
        return "🧸";
      case "Material Escolar":
        return "📚";
      case "Electrodomésticos":
        return "🔌";
      default:
        return "📦";
    }
  };

  // Get status color class based on donation state
  const getStatusClass = (estado: string) => {
    switch (estado) {
      case "Nuevo":
        return "bg-green-100 text-green-800";
      case "Como nuevo":
        return "bg-blue-100 text-blue-800";
      case "Buen estado":
        return "bg-yellow-100 text-yellow-800";
      case "Usado":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get delivery status badge
  const getDeliveryStatusBadge = (estado?: string | null) => {
    if (!estado) return null;
    
    switch (estado) {
      case "disponible":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Disponible</Badge>;
      case "reservado":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Reservado</Badge>;
      case "entregado":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Entregado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Listado de Donaciones</h2>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mb-3">
            <Skeleton className="w-full h-24 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Listado de Donaciones</h2>
        <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {donations.length} registros
        </span>
      </div>
      
      {/* Botones de exportación */}
      {donations.length > 0 && (
        <DonationsExport donations={donations} />
      )}

      {donations.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Aún no hay donaciones registradas.</p>
          <p className="text-gray-500 text-sm mt-1">Completa el formulario para agregar la primera.</p>
        </div>
      ) : (
        <div className="overflow-auto max-h-[500px] pr-2 space-y-3">
          {donations.map((donation, i) => (
            <div 
              key={i} 
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition duration-150 border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-3">
                    <span className="text-xl">{getDonationIcon(donation.tipo)}</span>
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{donation.tipo}</h3>
                      {getDeliveryStatusBadge(donation.estado_entrega)}
                    </div>
                    <p className="text-sm text-gray-600">{donation.descripcion}</p>
                  </div>
                </div>
                <span 
                  className={`text-xs font-medium rounded-full px-2 py-1 ${getStatusClass(donation.estado)}`}
                >
                  {donation.estado}
                </span>
              </div>
              
              <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-blue-500" />
                  <span>{donation.zona}, {donation.ciudad}</span>
                </span>
                <span className="flex items-center">
                  <BadgeCheck className="h-3 w-3 mr-1 text-blue-500" />
                  <span>Lat: {donation.latitud}, Long: {donation.longitud}</span>
                </span>
                {donation.donante_id && (
                  <span className="flex items-center">
                    <User className="h-3 w-3 mr-1 text-blue-500" />
                    <span>Donante ID: {donation.donante_id}</span>
                  </span>
                )}
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-blue-500" />
                  <span>Creado: {new Date(donation.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
