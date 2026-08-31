-- CreateTable
CREATE TABLE "maintenance_type_assignments" (
    "id" TEXT NOT NULL,
    "maintenance_id" TEXT NOT NULL,
    "maintenance_type_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_type_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "maintenance_type_assignments_maintenance_id_idx" ON "maintenance_type_assignments"("maintenance_id");

-- CreateIndex
CREATE INDEX "maintenance_type_assignments_maintenance_type_id_idx" ON "maintenance_type_assignments"("maintenance_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_type_assignments_maintenance_id_maintenance_type_id_key" ON "maintenance_type_assignments"("maintenance_id", "maintenance_type_id");

-- AddForeignKey
ALTER TABLE "maintenance_type_assignments" ADD CONSTRAINT "maintenance_type_assignments_maintenance_id_fkey" FOREIGN KEY ("maintenance_id") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_type_assignments" ADD CONSTRAINT "maintenance_type_assignments_maintenance_type_id_fkey" FOREIGN KEY ("maintenance_type_id") REFERENCES "maintenance_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;