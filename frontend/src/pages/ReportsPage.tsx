export function ReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reportes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow">
          <h3 className="font-semibold mb-2">Historial por Máquina</h3>
          <p className="text-gray-500 text-sm">Histórico completo de mantenimientos por máquina</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow">
          <h3 className="font-semibold mb-2">Mantenimientos por Período</h3>
          <p className="text-gray-500 text-sm">Filtrar por rango de fechas</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow">
          <h3 className="font-semibold mb-2">Cumplimiento</h3>
          <p className="text-gray-500 text-sm">Preventivos completados vs programados</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow">
          <h3 className="font-semibold mb-2">Estado de Flota</h3>
          <p className="text-gray-500 text-sm">Resumen del estado actual</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow">
          <h3 className="font-semibold mb-2">Carga de Técnicos</h3>
          <p className="text-gray-500 text-sm">Distribución de trabajo por técnico</p>
        </div>
      </div>
    </div>
  );
}
