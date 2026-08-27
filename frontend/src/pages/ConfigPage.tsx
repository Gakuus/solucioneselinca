export function ConfigPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex space-x-8">
            <button className="border-b-2 border-blue-600 py-2 text-sm font-medium text-blue-600">
              General
            </button>
            <button className="border-b-2 border-transparent py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              Alertas
            </button>
            <button className="border-b-2 border-transparent py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              Catálogos
            </button>
            <button className="border-b-2 border-transparent py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              Seguridad
            </button>
          </nav>
        </div>
        <p className="text-gray-500 text-center py-12">
          [Configuración del sistema con tabs]
        </p>
      </div>
    </div>
  );
}
