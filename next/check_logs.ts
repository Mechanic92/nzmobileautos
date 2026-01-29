
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking Lookup Logs...");
  const logs = await prisma.lookupLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  console.log(JSON.stringify(logs, null, 2));

  console.log("Checking Vehicle Cache for KRB400...");
  const cache = await prisma.vehicleCache.findFirst({
    where: { plate: "KRB400" }
  });
  console.log(JSON.stringify(cache, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
