-- AlterTable
ALTER TABLE "invoice" ADD COLUMN IF NOT EXISTS     "stripeCustomerId" VARCHAR(255),
ADD COLUMN IF NOT EXISTS     "stripeInvoiceId" VARCHAR(255),
ADD COLUMN IF NOT EXISTS     "stripeSubscriptionId" VARCHAR(255);

-- CreateTable
CREATE TABLE IF NOT EXISTS "stripe_customer" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "stripeCustomerId" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stripe_customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "stripe_connected_account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50),
    "capabilities" JSONB,
    "requirements" JSONB,
    "detailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stripe_connected_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "subscription" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "stripeSubscriptionId" VARCHAR(255) NOT NULL,
    "stripePriceId" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "payment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "stripePaymentIntentId" VARCHAR(255),
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "status" VARCHAR(50) NOT NULL,
    "providerAccountId" VARCHAR(255),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "stripe_customer_companyId_key" ON "stripe_customer"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "stripe_customer_stripeCustomerId_key" ON "stripe_customer"("stripeCustomerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "stripe_customer_companyId_idx" ON "stripe_customer"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "stripe_connected_account_userId_key" ON "stripe_connected_account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "stripe_connected_account_accountId_key" ON "stripe_connected_account"("accountId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "stripe_connected_account_userId_idx" ON "stripe_connected_account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "subscription_stripeSubscriptionId_key" ON "subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "subscription_companyId_idx" ON "subscription"("companyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "subscription_stripeCustomerId_idx" ON "subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "payment_stripePaymentIntentId_key" ON "payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "payment_invoiceId_idx" ON "payment"("invoiceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "payment_providerAccountId_idx" ON "payment"("providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "invoice_stripeInvoiceId_key" ON "invoice"("stripeInvoiceId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'payment_invoiceId_fkey' 
    AND table_name = 'payment'
  ) THEN
    ALTER TABLE "payment" ADD CONSTRAINT "payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
