-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paystackRef" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "color" TEXT,
ADD COLUMN     "composition" TEXT,
ADD COLUMN     "sizes" TEXT[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "passwordResetExpiry" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "orders_paystackRef_key" ON "orders"("paystackRef");

-- CreateIndex
CREATE UNIQUE INDEX "users_passwordResetToken_key" ON "users"("passwordResetToken");
