-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "category" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
