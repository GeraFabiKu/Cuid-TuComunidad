import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Donation, Solicitud } from "@shared/schema";
import { getStatusClass } from "@/lib/utils";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

type SolicitudesTabProps = {
  donations: Donation[];
  isLoading: boolean;
};

export default function SolicitudesTab({ donations, isLoading }: SolicitudesTabProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("enviadas");
  
  // Obtener las solicitudes
  const { 
    data: solicitudes = [], 
    isLoading: isLoadingSolicitudes,
  } = useQuery<Solicitud[]>({
    queryKey: ['/api/solicitudes'],
    retry: 1,
  });
  
  // Obtener usuarios
  const { 
    data: users = [], 
    isLoading: isLoadingUsers,
  } = useQuery<any[]>({
    queryKey: ['/api/users'],
    retry: 1,
  });
  
  // Mutation para actualizar el estado de una solicitud
  const actualizarSolicitudMutation = useMutation({
    mutationFn: (data: { id: number, estado: string }) => {
      return apiRequest('PUT', `/api/solicitudes/${data.id}/estado`, { estado: data.estado });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/solicitudes'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/donations'] });
      toast({
        title: "Solicitud actualizada",
        description: "El estado de la solicitud ha sido actualizado correctamente.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar la solicitud: ${error instanceof Error ? error.message : 'Ocurrió un error desconocido'}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutation para actualizar el estado de una donación
  const actualizarDonacionMutation = useMutation({
    mutationFn: (data: { id: number, estado: string, solicitanteId?: number }) => {
      return apiRequest('PUT', `/api/donations/${data.id}/estado`, { 
        estado: data.estado, 
        solicitanteId: data.solicitanteId 
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/donations'] });
      toast({
        title: "Donación actualizada",
        description: "El estado de la donación ha sido actualizado correctamente.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar la donación: ${error instanceof Error ? error.message : 'Ocurrió un error desconocido'}`,
        variant: "destructive",
      });
    },
  });
  
  // Filtrar solicitudes para el usuario actual (solicitante)
  const misSolicitudes = solicitudes.filter((solicitud) => solicitud.solicitante_id === 2); // ID del usuario actual
  
  // Filtrar solicitudes para mis donaciones (donante)
  const solicitudesAMisDonaciones = solicitudes.filter((solicitud) => {
    const donacion = donations.find(d => d.id === solicitud.donation_id);
    return donacion && donacion.donante_id === 1; // ID del usuario actual como donante
  });
  
  // Encontrar nombre del usuario por ID
  const getUserName = (userId: number) => {
    const user = users.find((u: any) => u.id === userId);
    return user ? user.nombre : 'Usuario desconocido';
  };
  
  // Encontrar donación por ID
  const getDonacion = (donationId: number) => {
    return donations.find(d => d.id === donationId);
  };
  
  // Manejar la aprobación de una solicitud
  const handleAprobarSolicitud = async (solicitud: Solicitud) => {
    try {
      // Primero actualizamos el estado de la solicitud
      await actualizarSolicitudMutation.mutateAsync({
        id: solicitud.id,
        estado: "aprobada"
      });
      
      // Luego actualizamos el estado de la donación
      await actualizarDonacionMutation.mutateAsync({
        id: solicitud.donation_id,
        estado: "reservado",
        solicitanteId: solicitud.solicitante_id
      });
    } catch (error) {
      console.error("Error al aprobar solicitud:", error);
    }
  };
  
  // Manejar el rechazo de una solicitud
  const handleRechazarSolicitud = async (solicitud: Solicitud) => {
    try {
      await actualizarSolicitudMutation.mutateAsync({
        id: solicitud.id,
        estado: "rechazada"
      });
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
    }
  };
  
  // Manejar la confirmación de entrega
  const handleConfirmarEntrega = async (solicitud: Solicitud) => {
    try {
      await actualizarDonacionMutation.mutateAsync({
        id: solicitud.donation_id,
        estado: "entregado"
      });
    } catch (error) {
      console.error("Error al confirmar entrega:", error);
    }
  };
  
  // Renderizar el estado de la solicitud con el icono adecuado
  const renderEstadoSolicitud = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Badge variant="outline" className="flex items-center"><Clock className="mr-1 h-3 w-3" /> Pendiente</Badge>;
      case "aprobada":
        return <Badge className="flex items-center bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3" /> Aprobada</Badge>;
      case "rechazada":
        return <Badge variant="destructive" className="flex items-center"><XCircle className="mr-1 h-3 w-3" /> Rechazada</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const isLoading2 = isLoading || isLoadingSolicitudes || isLoadingUsers;

  return (
    <div className="space-y-6">
      <Card className="rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle>Gestión de Solicitudes</CardTitle>
          <CardDescription>
            Administra tus solicitudes de donaciones y las solicitudes que has recibido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="enviadas">Mis Solicitudes</TabsTrigger>
              <TabsTrigger value="recibidas">Solicitudes Recibidas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="enviadas">
              {isLoading2 ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : misSolicitudes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No has enviado ninguna solicitud aún.
                </div>
              ) : (
                <div className="space-y-4">
                  {misSolicitudes.map((solicitud: Solicitud) => {
                    const donacion = getDonacion(solicitud.donation_id);
                    if (!donacion) return null;
                    
                    return (
                      <Card key={solicitud.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge className={getStatusClass(donacion.tipo)}>
                                {donacion.tipo}
                              </Badge>
                              <CardTitle className="mt-2 text-lg">
                                {donacion.descripcion}
                              </CardTitle>
                            </div>
                            <div>
                              {renderEstadoSolicitud(solicitud.estado)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="text-sm">
                            <p><strong>Donante:</strong> {getUserName(donacion.donante_id || 0)}</p>
                            <p><strong>Ubicación:</strong> {donacion.zona}, {donacion.ciudad}</p>
                            <p><strong>Mensaje:</strong> {solicitud.mensaje || 'Sin mensaje'}</p>
                            <p><strong>Fecha de solicitud:</strong> {solicitud.fecha_solicitud}</p>
                            {solicitud.fecha_respuesta && (
                              <p><strong>Fecha de respuesta:</strong> {solicitud.fecha_respuesta}</p>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                          {solicitud.estado === "aprobada" && donacion.estado_entrega === "reservado" && (
                            <Button 
                              className="w-full" 
                              onClick={() => handleConfirmarEntrega(solicitud)}
                              disabled={actualizarDonacionMutation.isPending}
                            >
                              {actualizarDonacionMutation.isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</>
                              ) : 'Confirmar Recepción'}
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recibidas">
              {isLoading2 ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : solicitudesAMisDonaciones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No has recibido ninguna solicitud todavía.
                </div>
              ) : (
                <div className="space-y-4">
                  {solicitudesAMisDonaciones.map((solicitud: Solicitud) => {
                    const donacion = getDonacion(solicitud.donation_id);
                    if (!donacion) return null;
                    
                    return (
                      <Card key={solicitud.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge className={getStatusClass(donacion.tipo)}>
                                {donacion.tipo}
                              </Badge>
                              <CardTitle className="mt-2 text-lg">
                                {donacion.descripcion}
                              </CardTitle>
                            </div>
                            <div>
                              {renderEstadoSolicitud(solicitud.estado)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="text-sm">
                            <p><strong>Solicitante:</strong> {getUserName(solicitud.solicitante_id)}</p>
                            <p><strong>Ubicación de la donación:</strong> {donacion.zona}, {donacion.ciudad}</p>
                            <p><strong>Mensaje:</strong> {solicitud.mensaje || 'Sin mensaje'}</p>
                            <p><strong>Fecha de solicitud:</strong> {solicitud.fecha_solicitud}</p>
                            {solicitud.fecha_respuesta && (
                              <p><strong>Fecha de respuesta:</strong> {solicitud.fecha_respuesta}</p>
                            )}
                          </div>
                        </CardContent>
                        {solicitud.estado === "pendiente" && (
                          <CardFooter className="pt-2 flex justify-between space-x-2">
                            <Button 
                              variant="default"
                              className="flex-1" 
                              onClick={() => handleAprobarSolicitud(solicitud)}
                              disabled={actualizarSolicitudMutation.isPending}
                            >
                              {actualizarSolicitudMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : 'Aprobar'}
                            </Button>
                            <Button 
                              variant="destructive"
                              className="flex-1" 
                              onClick={() => handleRechazarSolicitud(solicitud)}
                              disabled={actualizarSolicitudMutation.isPending}
                            >
                              {actualizarSolicitudMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : 'Rechazar'}
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}