import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Donation } from "@shared/schema";
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FileDown, Printer, FileSpreadsheet } from 'lucide-react';

interface DonationsExportProps {
  donations: Donation[];
  title?: string;
}

export default function DonationsExport({ donations, title = "Listado de Donaciones" }: DonationsExportProps) {
  const printRef = useRef<HTMLDivElement>(null);
  
  // Función para imprimir la tabla
  const handlePrint = useReactToPrint({
    documentTitle: title,
    onAfterPrint: () => console.log('Impresión completada'),
    // @ts-ignore - La API ha cambiado entre versiones, pero esto funciona
    content: () => printRef.current,
  });
  
  // Función para exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(15);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);
    doc.text(`Total registros: ${donations.length}`, 14, 27);
    
    // Crear tabla
    autoTable(doc, {
      head: [['ID', 'Tipo', 'Descripción', 'Estado', 'Zona', 'Ciudad', 'Coordenadas']],
      body: donations.map(donation => [
        donation.id,
        donation.tipo,
        donation.descripcion,
        donation.estado,
        donation.zona,
        donation.ciudad,
        `${donation.latitud}, ${donation.longitud}`,
      ]),
      startY: 35,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [76, 175, 80] },
    });
    
    // Información de pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `CuidáTuComunidad - Plataforma de donaciones - Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2, 
        doc.internal.pageSize.getHeight() - 10, 
        { align: 'center' }
      );
    }
    
    // Guardar archivo
    doc.save(`donaciones_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    // Preparar datos para Excel
    const excelData = donations.map(donation => ({
      ID: donation.id,
      Tipo: donation.tipo,
      Descripción: donation.descripcion,
      Estado: donation.estado,
      Zona: donation.zona,
      Ciudad: donation.ciudad,
      Latitud: donation.latitud,
      Longitud: donation.longitud,
      'Fecha Creación': donation.createdAt,
      'Estado Entrega': donation.estado_entrega || 'No disponible',
    }));
    
    // Crear libro de Excel
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Donaciones");
    
    // Autoajustar columnas
    const colWidths = [
      { wch: 5 }, // ID
      { wch: 15 }, // Tipo
      { wch: 40 }, // Descripción
      { wch: 15 }, // Estado
      { wch: 15 }, // Zona
      { wch: 15 }, // Ciudad
      { wch: 10 }, // Latitud
      { wch: 10 }, // Longitud
      { wch: 20 }, // Fecha Creación
      { wch: 15 }, // Estado Entrega
    ];
    ws['!cols'] = colWidths;
    
    // Guardar archivo
    XLSX.writeFile(wb, `donaciones_${new Date().toISOString().split('T')[0]}.xlsx`);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Button variant="outline" size="sm" onClick={exportToPDF} className="flex items-center">
          <FileDown className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
        <Button variant="outline" size="sm" onClick={exportToExcel} className="flex items-center">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
      </div>
      
      {/* Tabla oculta para impresión */}
      <div className="hidden">
        <div ref={printRef} className="p-6">
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-sm text-gray-500 mb-4">
            Fecha: {new Date().toLocaleDateString()} | Total: {donations.length} registros
          </p>
          
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="border p-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="border p-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="border p-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="border p-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="border p-2 text-left text-xs font-medium text-gray-500 uppercase">Zona</th>
                <th className="border p-2 text-left text-xs font-medium text-gray-500 uppercase">Ciudad</th>
                <th className="border p-2 text-left text-xs font-medium text-gray-500 uppercase">Coordenadas</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {donations.map((donation) => (
                <tr key={donation.id}>
                  <td className="border p-2 text-sm text-gray-500">{donation.id}</td>
                  <td className="border p-2 text-sm">{donation.tipo}</td>
                  <td className="border p-2 text-sm">{donation.descripcion}</td>
                  <td className="border p-2 text-sm">{donation.estado}</td>
                  <td className="border p-2 text-sm">{donation.zona}</td>
                  <td className="border p-2 text-sm">{donation.ciudad}</td>
                  <td className="border p-2 text-sm">{donation.latitud}, {donation.longitud}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>CuidáTuComunidad - Plataforma de gestión de donaciones comunitarias</p>
          </div>
        </div>
      </div>
    </div>
  );
}