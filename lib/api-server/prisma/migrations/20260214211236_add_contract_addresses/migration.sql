-- CreateTable
CREATE TABLE "ContractAddress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "network" TEXT NOT NULL DEFAULT 'mainnet',
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ContractAddress_name_key" ON "ContractAddress"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ContractAddress_name_network_key" ON "ContractAddress"("name", "network");
