import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const donationFormSchema = z.object({
  tipo: z.string().min(1, "El tipo es obligatorio"),
  descripcion: z.string().min(1, "La descripción es obligatoria"),
  estado: z.string().min(1, "El estado es obligatorio"),
  zona: z.string().min(1, "La zona es obligatoria"),
  ciudad: z.string().min(1, "La ciudad es obligatoria"),
  latitud: z.string()
    .min(1, "La latitud es obligatoria")
    .refine(val => !isNaN(parseFloat(val)), "Debe ser un número válido")
    .refine(val => parseFloat(val) >= -90 && parseFloat(val) <= 90, "Debe estar entre -90 y 90"),
  longitud: z.string()
    .min(1, "La longitud es obligatoria")
    .refine(val => !isNaN(parseFloat(val)), "Debe ser un número válido")
    .refine(val => parseFloat(val) >= -180 && parseFloat(val) <= 180, "Debe estar entre -180 y 180"),
  donante_id: z.number().optional(),
});

type DonationFormProps = {
  onAddDonation: (formData: any) => void;
  isSubmitting: boolean;
};

export default function DonationForm({ onAddDonation, isSubmitting }: DonationFormProps) {
  const { toast } = useToast();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const form = useForm<z.infer<typeof donationFormSchema>>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      tipo: "",
      descripcion: "",
      estado: "",
      zona: "",
      ciudad: "",
      latitud: "",
      longitud: "",
      donante_id: 1, // Usuario de prueba
    },
  });

  const handleSubmit = (values: z.infer<typeof donationFormSchema>) => {
    onAddDonation(values);
    if (!isSubmitting) {
      form.reset();
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Tu navegador no soporta geolocalización",
        variant: "destructive",
      });
      return;
    }
    
    setIsGettingLocation(true);
    
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("latitud", position.coords.latitude.toFixed(6));
        form.setValue("longitud", position.coords.longitude.toFixed(6));
        toast({
          title: "Ubicación obtenida",
          description: "Las coordenadas se han actualizado correctamente",
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMsg = "Error desconocido al obtener la ubicación";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Permiso denegado para acceder a la ubicación";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Ubicación no disponible en este momento";
            break;
          case error.TIMEOUT:
            errorMsg = "La solicitud de ubicación ha expirado";
            break;
        }
        
        toast({
          title: "Error de geolocalización",
          description: errorMsg,
          variant: "destructive",
        });
        setIsGettingLocation(false);
      },
      options
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Nueva Donación</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Alimentos">Alimentos</SelectItem>
                      <SelectItem value="Ropa">Ropa</SelectItem>
                      <SelectItem value="Muebles">Muebles</SelectItem>
                      <SelectItem value="Medicamentos">Medicamentos</SelectItem>
                      <SelectItem value="Juguetes">Juguetes</SelectItem>
                      <SelectItem value="Material Escolar">Material Escolar</SelectItem>
                      <SelectItem value="Electrodomésticos">Electrodomésticos</SelectItem>
                      <SelectItem value="Otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Nuevo">Nuevo</SelectItem>
                      <SelectItem value="Como nuevo">Como nuevo</SelectItem>
                      <SelectItem value="Buen estado">Buen estado</SelectItem>
                      <SelectItem value="Usado">Usado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 10kg de arroz, 5 latas de conserva..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zona"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zona</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Norte, Sur, Centro..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ciudad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Bilbao, Madrid..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="latitud"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitud</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 43.263" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="longitud"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitud</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: -2.935" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agregando...
                </>
              ) : "Agregar Donación"}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              className="flex items-center"
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Obteniendo ubicación...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Usar Mi Ubicación
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
