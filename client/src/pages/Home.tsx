import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DonationForm from "@/components/DonationForm";
import DonationsList from "@/components/DonationsList";
import RankingTab from "@/components/RankingTab";
import MapTab from "@/components/MapTab";
import SearchTab from "@/components/SearchTab";
import SolicitudesTab from "@/components/SolicitudesTab";
import { Donation } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  
  // Fetch donations from the API
  const { 
    data: donations = [], 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['/api/donations'],
    retry: 1,
  });

  // Mutation for adding a new donation
  const addDonationMutation = useMutation({
    mutationFn: (donationData: any) => {
      return apiRequest('POST', '/api/donations', donationData);
    },
    onSuccess: async () => {
      // Invalidate and refetch donations query to update the UI
      await queryClient.invalidateQueries({ queryKey: ['/api/donations'] });
      toast({
        title: "Donación agregada",
        description: "Tu donación ha sido registrada exitosamente.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al agregar la donación: ${error instanceof Error ? error.message : 'Ocurrió un error desconocido'}`,
        variant: "destructive",
      });
    },
  });

  // Handle adding a new donation
  const handleAddDonation = async (formData: any) => {
    await addDonationMutation.mutateAsync(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-200 text-gray-900 p-6 font-sans">
      <h1 className="text-5xl font-bold text-center mb-2 tracking-wide">CuidáTuComunidad 🌍</h1>
      <p className="text-center mb-6 text-sm font-medium text-gray-700">
        Una solución solidaria desarrollada por <span className="font-semibold text-green-600">Innovatech</span>
      </p>

      <Tabs defaultValue="donaciones" className="w-full max-w-5xl mx-auto">
        <TabsList className="grid grid-cols-5 mb-6 rounded-xl shadow-md overflow-hidden">
          <TabsTrigger value="donaciones">Donar</TabsTrigger>
          <TabsTrigger value="buscar">Buscar</TabsTrigger>
          <TabsTrigger value="solicitudes">Solicitudes</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="mapa">Mapa</TabsTrigger>
        </TabsList>

        <TabsContent value="donaciones">
          <Card className="rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DonationForm onAddDonation={handleAddDonation} isSubmitting={addDonationMutation.isPending} />
              <DonationsList donations={donations as Donation[]} isLoading={isLoading} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="buscar">
          <SearchTab donations={donations as Donation[]} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="solicitudes">
          <SolicitudesTab donations={donations as Donation[]} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="ranking">
          <RankingTab donations={donations as Donation[]} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="mapa">
          <MapTab donations={donations as Donation[]} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      <footer className="mt-12 text-center text-gray-600 text-sm">
        <p>© 2023 CuidáTuComunidad - Desarrollado con ❤️ por Innovatech</p>
        <p className="mt-1">Versión 1.0.0 - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}
