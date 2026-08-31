-- CreateTable
CREATE TABLE "maintenance_technician_assignments" (
    "id" TEXT NOT NULL,
    "maintenance_id" TEXT NOT NULL,
    "technician_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_technician_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "maintenance_technician_assignments_maintenance_id_idx" ON "maintenance_technician_assignments"("maintenance_id");

-- CreateIndex
CREATE INDEX "maintenance_technician_assignments_technician_id_idx" ON "maintenance_technician_assignments"("technician_id");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_technician_assignments_maintenance_id_technician_id_key" ON "maintenance_technician_assignments"("maintenance_id", "technician_id");

-- AddForeignKey
ALTER TABLE "maintenance_technician_assignments" ADD CONSTRAINT "maintenance_technician_assignments_maintenance_id_fkey" FOREIGN KEY ("maintenance_id") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_technician_assignments" ADD CONSTRAINT "maintenance_technician_assignments_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;