import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Donation } from "@shared/schema";
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FileDown, Printer, BarChart, FileSpreadsheet } from 'lucide-react';

interface StatisticsExportProps {
  donations: Donation[];
  rankingField: string;
  rankingData: [string, number][];
}

export default function StatisticsExport({ donations, rankingField, rankingData }: StatisticsExportProps) {
  const printRef = useRef<HTMLDivElement>(null);
  
  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      'tipo': 'Tipo de Donación',
      'estado': 'Estado',
      'zona': 'Zona',
      'ciudad': 'Ciudad'
    };
    return labels[field] || field;
  };
  
  // Función para imprimir
  const handlePrint = useReactToPrint({
    documentTitle: `Estadísticas por ${getFieldLabel(rankingField)}`,
    onAfterPrint: () => console.log('Impresión completada'),
    // @ts-ignore - La API ha cambiado entre versiones, pero esto funciona
    content: () => printRef.current,
  });
  
  // Función para exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(15);
    doc.text(`Estadísticas por ${getFieldLabel(rankingField)}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);
    doc.text(`Total donaciones: ${donations.length}`, 14, 27);
    
    // Crear tabla
    autoTable(doc, {
      head: [[getFieldLabel(rankingField), 'Cantidad', 'Porcentaje']],
      body: rankingData.map(([key, value]) => [
        key,
        value,
        `${Math.round((value / donations.length) * 100)}%`,
      ]),
      startY: 35,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [76, 175, 80] },
    });
    
    // Información de pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `CuidáTuComunidad - Estadísticas - Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2, 
        doc.internal.pageSize.getHeight() - 10, 
        { align: 'center' }
      );
    }
    
    // Guardar archivo
    doc.save(`estadisticas_${rankingField}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    // Preparar datos para Excel
    const excelData = rankingData.map(([key, value]) => ({
      [getFieldLabel(rankingField)]: key,
      'Cantidad': value,
      'Porcentaje': `${Math.round((value / donations.length) * 100)}%`,
    }));
    
    // Crear libro de Excel
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estadísticas");
    
    // Autoajustar columnas
    const colWidths = [
      { wch: 20 }, // Campo
      { wch: 10 }, // Cantidad
      { wch: 10 }, // Porcentaje
    ];
    ws['!cols'] = colWidths;
    
    // Guardar archivo
    XLSX.writeFile(wb, `estadisticas_${rankingField}_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      
      {/* Contenido para impresión */}
      <div className="hidden">
        <div ref={printRef} className="p-6">
          <h1 className="text-2xl font-bold mb-2">Estadísticas por {getFieldLabel(rankingField)}</h1>
          <p className="text-sm text-gray-500 mb-4">
            Fecha: {new Date().toLocaleDateString()} | Total: {donations.length} donaciones
          </p>
          
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="border p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getFieldLabel(rankingField)}</th>
                <th className="border p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th className="border p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Porcentaje</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rankingData.map(([key, value], index) => (
                <tr key={index}>
                  <td className="border p-2 text-sm font-medium text-gray-900">{key}</td>
                  <td className="border p-2 text-sm text-gray-500">{value}</td>
                  <td className="border p-2 text-sm text-gray-500">
                    {Math.round((value / donations.length) * 100)}%
                  </td>
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