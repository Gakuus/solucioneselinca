-- CreateEnum
CREATE TYPE "SparePartCategory" AS ENUM ('FILTER', 'LUBRICANT', 'HYDRAULIC', 'ELECTRICAL', 'MECHANICAL', 'TIRE', 'CHEMICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "SparePartUnit" AS ENUM ('UNIT', 'LITER', 'KILOGRAM', 'GALLON', 'METER', 'PACK');

-- CreateEnum
CREATE TYPE "SparePartMovementType" AS ENUM ('IN', 'OUT', 'ADJUST');

-- CreateTable
CREATE TABLE "spare_parts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "SparePartCategory" NOT NULL DEFAULT 'OTHER',
    "unit" "SparePartUnit" NOT NULL DEFAULT 'UNIT',
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "min_stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit_cost" DOUBLE PRECISION,
    "supplier" TEXT,
    "location" TEXT,
    "machine_type_id" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spare_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spare_part_movements" (
    "id" TEXT NOT NULL,
    "spare_part_id" TEXT NOT NULL,
    "type" "SparePartMovementType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit_cost" DOUBLE PRECISION,
    "notes" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spare_part_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "spare_parts_category_idx" ON "spare_parts"("category");

-- CreateIndex
CREATE INDEX "spare_parts_machine_type_id_idx" ON "spare_parts"("machine_type_id");

-- CreateIndex
CREATE INDEX "spare_parts_is_active_idx" ON "spare_parts"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "spare_parts_code_deleted_at_key" ON "spare_parts"("code", "deleted_at");

-- CreateIndex
CREATE INDEX "spare_part_movements_spare_part_id_idx" ON "spare_part_movements"("spare_part_id");

-- CreateIndex
CREATE INDEX "spare_part_movements_type_idx" ON "spare_part_movements"("type");

-- CreateIndex
CREATE INDEX "spare_part_movements_created_at_idx" ON "spare_part_movements"("created_at");

-- AddForeignKey
ALTER TABLE "spare_parts" ADD CONSTRAINT "spare_parts_machine_type_id_fkey" FOREIGN KEY ("machine_type_id") REFERENCES "machine_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spare_part_movements" ADD CONSTRAINT "spare_part_movements_spare_part_id_fkey" FOREIGN KEY ("spare_part_id") REFERENCES "spare_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spare_part_movements" ADD CONSTRAINT "spare_part_movements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
