import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Donation } from "@shared/schema";
import { getStatusClass } from "@/lib/utils";
import { Loader2, Search, Filter, MapPin } from "lucide-react";

type SearchTabProps = {
  donations: Donation[];
  isLoading: boolean;
};

export default function SearchTab({ donations, isLoading }: SearchTabProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    tipo: "",
    estado: "",
    ciudad: "",
  });
  
  // Mutation para solicitar una donación
  const solicitarDonacionMutation = useMutation({
    mutationFn: (data: { donationId: number, mensaje: string }) => {
      return apiRequest('POST', '/api/solicitudes', {
        donation_id: data.donationId,
        solicitante_id: 2, // Por ahora usamos un ID fijo, esto se cambiaría con un sistema de autenticación
        mensaje: data.mensaje
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/donations'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/solicitudes'] });
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud ha sido enviada correctamente.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al enviar la solicitud: ${error instanceof Error ? error.message : 'Ocurrió un error desconocido'}`,
        variant: "destructive",
      });
    },
  });

  // Filtrar las donaciones basadas en los filtros y el término de búsqueda
  const filteredDonations = donations.filter((donation) => {
    // Solo mostrar donaciones disponibles
    if (donation.estado_entrega !== "disponible") return false;
    
    // Filtrar por término de búsqueda (en descripción o tipo)
    const matchesSearch = searchTerm 
      ? donation.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) || 
        donation.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    // Aplicar filtros adicionales
    const matchesTipo = filters.tipo && filters.tipo !== "todos" ? donation.tipo === filters.tipo : true;
    const matchesEstado = filters.estado && filters.estado !== "todos" ? donation.estado === filters.estado : true;
    const matchesCiudad = filters.ciudad && filters.ciudad !== "todos" ? donation.ciudad === filters.ciudad : true;
    
    return matchesSearch && matchesTipo && matchesEstado && matchesCiudad;
  });
  
  // Obtener opciones únicas para los filtros
  const tiposUnicos = Array.from(new Set(donations.map(d => d.tipo)));
  const estadosUnicos = Array.from(new Set(donations.map(d => d.estado)));
  const ciudadesUnicas = Array.from(new Set(donations.map(d => d.ciudad)));
  
  // Manejar la solicitud de una donación
  const handleSolicitarDonacion = (donationId: number) => {
    const mensaje = window.prompt("Por favor, escribe un mensaje para el donante explicando por qué necesitas esta donación:");
    if (mensaje) {
      solicitarDonacionMutation.mutateAsync({ donationId, mensaje });
    }
  };
  
  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      tipo: "todos",
      estado: "todos",
      ciudad: "todos",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle>Buscar Donaciones Disponibles</CardTitle>
          <CardDescription>
            Encuentra donaciones disponibles y solicítalas si las necesitas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar por descripción o tipo..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo-filter">Tipo</Label>
                <Select 
                  value={filters.tipo} 
                  onValueChange={(value) => setFilters({...filters, tipo: value})}
                >
                  <SelectTrigger id="tipo-filter">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tipos</SelectItem>
                    {tiposUnicos.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estado-filter">Estado</Label>
                <Select 
                  value={filters.estado} 
                  onValueChange={(value) => setFilters({...filters, estado: value})}
                >
                  <SelectTrigger id="estado-filter">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    {estadosUnicos.map((estado) => (
                      <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ciudad-filter">Ciudad</Label>
                <Select 
                  value={filters.ciudad} 
                  onValueChange={(value) => setFilters({...filters, ciudad: value})}
                >
                  <SelectTrigger id="ciudad-filter">
                    <SelectValue placeholder="Todas las ciudades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las ciudades</SelectItem>
                    {ciudadesUnicas.map((ciudad) => (
                      <SelectItem key={ciudad} value={ciudad}>{ciudad}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleClearFilters}
            >
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card className="rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle>
            Resultados {filteredDonations.length > 0 && `(${filteredDonations.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron donaciones disponibles con los criterios especificados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDonations.map((donation) => (
                <Card key={donation.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge className={getStatusClass(donation.tipo)}>
                          {donation.tipo}
                        </Badge>
                        <CardTitle className="mt-2 text-lg">
                          {donation.descripcion}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center mb-1">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {donation.zona}, {donation.ciudad}
                      </div>
                      <div>Estado: {donation.estado}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      className="w-full" 
                      onClick={() => handleSolicitarDonacion(donation.id)}
                      disabled={solicitarDonacionMutation.isPending}
                    >
                      {solicitarDonacionMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</>
                      ) : 'Solicitar Donación'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}