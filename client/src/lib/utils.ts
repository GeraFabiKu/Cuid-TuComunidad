import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDonationIcon(tipo: string) {
  const icons: Record<string, string> = {
    'Alimentos': 'fa-utensils',
    'Ropa': 'fa-tshirt',
    'Muebles': 'fa-couch',
    'Medicamentos': 'fa-pills',
    'Juguetes': 'fa-gamepad',
    'Material Escolar': 'fa-book',
    'Electrodomésticos': 'fa-blender'
  };
  return icons[tipo] || 'fa-box';
}

export function getStatusClass(estado: string) {
  const classes: Record<string, string> = {
    'Nuevo': 'bg-green-100 text-green-800',
    'Como nuevo': 'bg-blue-100 text-blue-800',
    'Buen estado': 'bg-yellow-100 text-yellow-800',
    'Usado': 'bg-gray-100 text-gray-800'
  };
  return classes[estado] || 'bg-gray-100 text-gray-800';
}

export function getMarkerColor(tipo: string) {
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
}
