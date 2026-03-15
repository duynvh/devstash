import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  const itemTypes = await prisma.itemType.findMany();
  console.log(`Found ${itemTypes.length} item types:`);
  itemTypes.forEach((t) => {
    console.log(`  - ${t.name} (${t.icon}, ${t.color}, system: ${t.isSystem})`);
  });

  const userCount = await prisma.user.count();
  const itemCount = await prisma.item.count();
  const collectionCount = await prisma.collection.count();
  const tagCount = await prisma.tag.count();

  console.log("\nTable counts:");
  console.log(`  Users:       ${userCount}`);
  console.log(`  Items:       ${itemCount}`);
  console.log(`  Collections: ${collectionCount}`);
  console.log(`  Tags:        ${tagCount}`);

  console.log("\n✅ Database connection successful!");
}

main()
  .catch((e) => {
    console.error("❌ Database connection failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
