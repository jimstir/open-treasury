-- CreateTable
CREATE TABLE "Reserve" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "contract_address" TEXT NOT NULL,
    "governance_token_name" TEXT NOT NULL,
    "governance_token_symbol" TEXT NOT NULL,
    "treasury_token_name" TEXT NOT NULL,
    "treasury_token_symbol" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DeployedTreasury" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "token_name" TEXT NOT NULL,
    "token_symbol" TEXT NOT NULL,
    "token_address" TEXT NOT NULL,
    "vault_address" TEXT NOT NULL,
    "owner_address" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reserve_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "proposer" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "proposal_type" TEXT,
    "contract_proposal_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "start_time" DATETIME,
    "end_time" DATETIME,
    CONSTRAINT "Proposal_reserve_id_fkey" FOREIGN KEY ("reserve_id") REFERENCES "Reserve" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proposal_id" INTEGER NOT NULL,
    "voter" TEXT NOT NULL,
    "vote_type" TEXT NOT NULL,
    "weight" DECIMAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "Proposal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReserveMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reserve_id" INTEGER NOT NULL,
    "member_address" TEXT NOT NULL,
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_owner" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ReserveMember_reserve_id_fkey" FOREIGN KEY ("reserve_id") REFERENCES "Reserve" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReserveBalance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reserve_id" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "token_type" TEXT NOT NULL,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ReserveBalance_reserve_id_fkey" FOREIGN KEY ("reserve_id") REFERENCES "Reserve" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Reserve_contract_address_key" ON "Reserve"("contract_address");

-- CreateIndex
CREATE UNIQUE INDEX "DeployedTreasury_token_address_key" ON "DeployedTreasury"("token_address");

-- CreateIndex
CREATE UNIQUE INDEX "DeployedTreasury_vault_address_key" ON "DeployedTreasury"("vault_address");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_proposal_id_voter_key" ON "Vote"("proposal_id", "voter");

-- CreateIndex
CREATE UNIQUE INDEX "ReserveMember_reserve_id_member_address_key" ON "ReserveMember"("reserve_id", "member_address");

-- CreateIndex
CREATE UNIQUE INDEX "ReserveBalance_reserve_id_address_token_type_key" ON "ReserveBalance"("reserve_id", "address", "token_type");
