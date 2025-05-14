import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Donation } from "@shared/schema";
import { ChartPie, Users, MapPin, Activity, BarChart } from "lucide-react";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Sector
} from 'recharts';
import StatisticsExport from "./StatisticsExport";

// Colores para los gráficos
const COLORS = [
  '#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', 
  '#3f51b5', '#009688', '#ffeb3b', '#795548', '#607d8b'
];

type RankingTabProps = {
  donations: Donation[];
  isLoading: boolean;
};

export default function RankingTab({ donations, isLoading }: RankingTabProps) {
  const [rankingField, setRankingField] = useState<string>("ciudad");
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [activePieIndex, setActivePieIndex] = useState(0);

  // Get ranking data based on selected field
  const getRanking = () => {
    const count: Record<string, number> = {};
    donations.forEach((d) => {
      const key = (d[rankingField as keyof Donation] as string) || 'No especificado';
      count[key] = (count[key] || 0) + 1;
    });
    return Object.entries(count).sort((a, b) => b[1] - a[1]);
  };

  // Convertir datos para Recharts
  const getChartData = () => {
    return getRanking().map(([name, value]) => ({
      name,
      value,
      percent: Math.round((value / donations.length) * 100)
    }));
  };

  // Get unique count for a field
  const getUniqueCount = (field: keyof Donation) => {
    const unique = new Set(donations.map(d => d[field]));
    return unique.size;
  };

  // Get human-readable field label
  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      'tipo': 'Tipo de Donación',
      'estado': 'Estado',
      'zona': 'Zona',
      'ciudad': 'Ciudad',
      'estado_entrega': 'Estado de Entrega'
    };
    return labels[field] || field;
  };

  const ranking = getRanking();
  const chartData = getChartData();

  // Renderizado de etiqueta personalizada para el gráfico de pastel
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="#333" fontSize={14} fontWeight="bold">
          {payload.name}
        </text>
        <text x={cx} y={cy} textAnchor="middle" fill="#666">
          {`${value} donaciones`}
        </text>
        <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#999" fontSize={12}>
          {`(${(percent * 100).toFixed(0)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-lg">
        <CardContent className="space-y-4 py-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-lg">
      <CardContent className="space-y-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col justify-start">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-md p-4 mb-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-center">
                <ChartPie className="mr-2 h-5 w-5 text-green-600" />
                Opciones de Visualización
              </h3>
              
              <div className="mt-4 space-y-4">
                <div>
                  <Label className="block mb-2">Agrupar por:</Label>
                  <Select value={rankingField} onValueChange={setRankingField}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar campo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tipo">Tipo de Donación</SelectItem>
                      <SelectItem value="estado">Estado</SelectItem>
                      <SelectItem value="zona">Zona</SelectItem>
                      <SelectItem value="ciudad">Ciudad</SelectItem>
                      <SelectItem value="estado_entrega">Estado de Entrega</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block mb-2">Tipo de gráfico:</Label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setChartType('bar')}
                      className={`px-3 py-2 rounded flex items-center text-sm ${
                        chartType === 'bar' 
                          ? 'bg-green-100 text-green-700 border border-green-200 font-medium' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <BarChart className="h-4 w-4 mr-1" />
                      Barras
                    </button>
                    <button 
                      onClick={() => setChartType('pie')}
                      className={`px-3 py-2 rounded flex items-center text-sm ${
                        chartType === 'pie' 
                          ? 'bg-green-100 text-green-700 border border-green-200 font-medium' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <ChartPie className="h-4 w-4 mr-1" />
                      Pastel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-center">
                <Users className="mr-2 h-5 w-5 text-green-600" />
                Resumen General
              </h3>
              
              <div className="space-y-2 mt-4">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-gray-600">Total donaciones:</span>
                  <span className="font-semibold">{donations.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-gray-600">Tipos de donación:</span>
                  <span className="font-semibold">{getUniqueCount('tipo')}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-gray-600">Zonas:</span>
                  <span className="font-semibold">{getUniqueCount('zona')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Ciudades:</span>
                  <span className="font-semibold">{getUniqueCount('ciudad')}</span>
                </div>
              </div>
            </div>

            {/* Volunteer image */}
            <div className="hidden lg:block mt-4">
              <img 
                src="https://images.unsplash.com/photo-1579208570378-8c970854bc23?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80" 
                alt="Voluntarios registrando donaciones" 
                className="w-full h-auto rounded-lg shadow-md" 
              />
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {donations.length === 0 ? (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg p-8 text-center">
                <div>
                  <ChartPie className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No hay datos suficientes para generar estadísticas.</p>
                  <p className="text-gray-500 text-sm mt-1">Agrega algunas donaciones para ver los resultados aquí.</p>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-green-600" />
                    Distribución por {getFieldLabel(rankingField)}
                  </h3>
                  
                  {/* Exportar estadísticas */}
                  <StatisticsExport 
                    donations={donations} 
                    rankingField={rankingField} 
                    rankingData={ranking}
                  />
                </div>
                
                {/* Recharts Chart */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
                  <ResponsiveContainer width="100%" height={350}>
                    {chartType === 'bar' ? (
                      <RechartsBarChart
                        data={chartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 70,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          tick={{ fontSize: 11 }}
                          height={70}
                          interval={0}
                          tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} donaciones (${chartData.find(d => d.value === value)?.percent}%)`,
                            'Cantidad'
                          ]}
                        />
                        <Legend />
                        <Bar 
                          dataKey="value" 
                          name="Cantidad" 
                          fill="#4caf50"
                          radius={[4, 4, 0, 0]}
                        />
                      </RechartsBarChart>
                    ) : (
                      <PieChart>
                        <Pie
                          activeIndex={activePieIndex}
                          activeShape={renderActiveShape}
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          dataKey="value"
                          onMouseEnter={(_, index) => setActivePieIndex(index)}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${value} donaciones (${props.payload.percent}%)`,
                            props.payload.name
                          ]}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          formatter={(value, entry, index) => {
                            const { payload } = entry as any;
                            return `${payload.name}: ${payload.value} (${payload.percent}%)`;
                          }}
                        />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </div>
                
                {/* Data Table */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Listado Detallado</h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {getFieldLabel(rankingField)}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cantidad
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Porcentaje
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ranking.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item[0]}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item[1]}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div 
                                    className="bg-green-600 h-2.5 rounded-full" 
                                    style={{ width: `${(item[1]/donations.length*100)}%` }}
                                  ></div>
                                </div>
                                <span>{Math.round(item[1]/donations.length*100)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
