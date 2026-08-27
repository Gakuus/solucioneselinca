export function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Máquinas</h3>
          <p className="text-3xl font-bold text-blue-600">45</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Mantenimientos del Mes</h3>
          <p className="text-3xl font-bold text-green-600">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Alertas Activas</h3>
          <p className="text-3xl font-bold text-red-600">8</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Técnicos Disponibles</h3>
          <p className="text-3xl font-bold text-gray-600">6</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Mantenimientos por Tipo</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            [Gráfico de barras]
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Tendencia (Últimos 6 meses)</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            [Gráfico de línea]
          </div>
        </div>
      </div>
    </div>
  );
}
