CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "emailVerified" INTEGER,
  "password" TEXT,
  "image" TEXT,
  "role" TEXT NOT NULL DEFAULT 'USER',
  "createdAt" INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  "updatedAt" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "accounts" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "materials" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT,
  "pricePerGram" REAL NOT NULL,
  "available" INTEGER NOT NULL DEFAULT 1,
  "printerType" TEXT NOT NULL DEFAULT 'FDM',
  "createdAt" INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  "updatedAt" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "print_jobs" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "materialId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileSize" REAL NOT NULL,
  "printTime" REAL NOT NULL,
  "materialUsed" REAL NOT NULL,
  "baseCost" REAL NOT NULL,
  "profit" REAL NOT NULL,
  "totalPrice" REAL NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  "updatedAt" INTEGER NOT NULL,
  CONSTRAINT "print_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "print_jobs_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "orders" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "printJobId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "totalAmount" REAL NOT NULL,
  "notes" TEXT,
  "fileUrl" TEXT,
  "phoneNumber" TEXT,
  "createdAt" INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  "updatedAt" INTEGER NOT NULL,
  CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "orders_printJobId_fkey" FOREIGN KEY ("printJobId") REFERENCES "print_jobs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "order_tracking" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "timestamp" INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  CONSTRAINT "order_tracking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "pricing_settings" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
  "taxRate" REAL NOT NULL DEFAULT 0.0,
  "serviceFee" REAL NOT NULL DEFAULT 2.5,
  "scaleMultiplier" REAL NOT NULL DEFAULT 1.0,
  "updatedAt" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "products" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" REAL NOT NULL,
  "imageUrl" TEXT,
  "webpUrl" TEXT,
  "category" TEXT,
  "inStock" INTEGER NOT NULL DEFAULT 1,
  "stockCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  "updatedAt" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "high_scores" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global_top',
  "score" INTEGER NOT NULL DEFAULT 0,
  "playerName" TEXT NOT NULL DEFAULT 'Anonymous',
  "updatedAt" INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
CREATE UNIQUE INDEX IF NOT EXISTS "materials_name_color_key" ON "materials"("name", "color");
CREATE UNIQUE INDEX IF NOT EXISTS "orders_printJobId_key" ON "orders"("printJobId");
