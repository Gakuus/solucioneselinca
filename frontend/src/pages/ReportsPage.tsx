import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { reportsApi, MaintenanceReport, MachineReport, TechnicianReport, CostReport } from '../services/reports';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'maintenance' | 'machine' | 'technician' | 'cost'>('maintenance');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [maintenanceReport, setMaintenanceReport] = useState<MaintenanceReport | null>(null);
  const [machineReport, setMachineReport] = useState<MachineReport[]>([]);
  const [technicianReport, setTechnicianReport] = useState<TechnicianReport[]>([]);
  const [costReport, setCostReport] = useState<CostReport | null>(null);

  const { user } = useAuthStore();
  const canViewReports = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';

  useEffect(() => {
    if (canViewReports) {
      loadReport();
    }
  }, [activeTab, startDate, endDate]);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = { startDate, endDate };

      switch (activeTab) {
        case 'maintenance':
          const maintenanceData = await reportsApi.getMaintenanceReport(params);
          setMaintenanceReport(maintenanceData);
          break;
        case 'machine':
          const machineData = await reportsApi.getMachineReport(params);
          setMachineReport(machineData);
          break;
        case 'technician':
          const technicianData = await reportsApi.getTechnicianReport(params);
          setTechnicianReport(technicianData);
          break;
        case 'cost':
          const costData = await reportsApi.getCostReport(params);
          setCostReport(costData);
          break;
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar reporte');
    } finally {
      setIsLoading(false);
    }
  };

  if (!canViewReports) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Reportes</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-center py-12">
            No tienes permisos para acceder a los reportes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reportes</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Cerrar
          </button>
        </div>
      )}

      {/* Date Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadReport}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Cargando...' : 'Generar Reporte'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`border-b-2 py-4 text-sm font-medium ${
                activeTab === 'maintenance'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Mantenimientos
            </button>
            <button
              onClick={() => setActiveTab('machine')}
              className={`border-b-2 py-4 text-sm font-medium ${
                activeTab === 'machine'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Máquinas
            </button>
            <button
              onClick={() => setActiveTab('technician')}
              className={`border-b-2 py-4 text-sm font-medium ${
                activeTab === 'technician'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Técnicos
            </button>
            <button
              onClick={() => setActiveTab('cost')}
              className={`border-b-2 py-4 text-sm font-medium ${
                activeTab === 'cost'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Costos
            </button>
          </nav>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Cargando reporte...</div>
          ) : (
            <>
              {activeTab === 'maintenance' && maintenanceReport && (
                <MaintenanceReportView report={maintenanceReport} />
              )}
              {activeTab === 'machine' && <MachineReportView data={machineReport} />}
              {activeTab === 'technician' && <TechnicianReportView data={technicianReport} />}
              {activeTab === 'cost' && costReport && <CostReportView report={costReport} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MaintenanceReportView({ report }: { report: MaintenanceReport }) {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold">{report.stats.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{report.stats.byStatus.scheduled}</div>
          <div className="text-sm text-gray-500">Programados</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{report.stats.byStatus.completed}</div>
          <div className="text-sm text-gray-500">Completados</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">${report.stats.totalCost.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Costo Total</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Por Categoría</h3>
          <div className="flex space-x-4">
            <div>
              <span className="text-lg font-bold">{report.stats.byCategory.preventive}</span>
              <span className="text-sm text-gray-500 ml-1">Preventivos</span>
            </div>
            <div>
              <span className="text-lg font-bold">{report.stats.byCategory.corrective}</span>
              <span className="text-sm text-gray-500 ml-1">Correctivos</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Ítems</h3>
          <div className="text-lg font-bold">{report.stats.totalItems}</div>
          <div className="text-sm text-gray-500">Total ítems utilizados</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Máquina</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Técnico</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {report.data.slice(0, 10).map((maintenance) => (
              <tr key={maintenance.id}>
                <td className="px-4 py-3 text-sm">{maintenance.machine?.code}</td>
                <td className="px-4 py-3 text-sm">{maintenance.maintenanceType?.name}</td>
                <td className="px-4 py-3 text-sm">{maintenance.technician?.name}</td>
                <td className="px-4 py-3 text-sm">{new Date(maintenance.receivedDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm">{maintenance.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MachineReportView({ data }: { data: MachineReport[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Mant.</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preventivos</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correctivos</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((machine) => (
            <tr key={machine.id}>
              <td className="px-4 py-3 text-sm font-medium">{machine.code}</td>
              <td className="px-4 py-3 text-sm">{machine.name}</td>
              <td className="px-4 py-3 text-sm">{machine.type}</td>
              <td className="px-4 py-3 text-sm">{machine.status}</td>
              <td className="px-4 py-3 text-sm">{machine.totalMaintenances}</td>
              <td className="px-4 py-3 text-sm">{machine.preventiveCount}</td>
              <td className="px-4 py-3 text-sm">{machine.correctiveCount}</td>
              <td className="px-4 py-3 text-sm">${machine.totalCost.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TechnicianReportView({ data }: { data: TechnicianReport[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Mant.</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completados</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tasa Éxito</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prom. Días</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((tech) => (
            <tr key={tech.id}>
              <td className="px-4 py-3 text-sm font-medium">{tech.name}</td>
              <td className="px-4 py-3 text-sm">{tech.email}</td>
              <td className="px-4 py-3 text-sm">{tech.totalMaintenances}</td>
              <td className="px-4 py-3 text-sm">{tech.completedMaintenances}</td>
              <td className="px-4 py-3 text-sm">{tech.completionRate.toFixed(1)}%</td>
              <td className="px-4 py-3 text-sm">{tech.avgCompletionDays}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CostReportView({ report }: { report: CostReport }) {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold">${report.totalCost.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Costo Total</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">${report.byCategory.preventive.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Preventivos</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">${report.byCategory.corrective.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Correctivos</div>
        </div>
      </div>

      <h3 className="font-medium mb-3">Costos por Proveedor</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Object.entries(report.bySupplier)
              .sort(([, a], [, b]) => b - a)
              .map(([supplier, cost]) => (
                <tr key={supplier}>
                  <td className="px-4 py-3 text-sm">{supplier}</td>
                  <td className="px-4 py-3 text-sm">${cost.toFixed(2)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
