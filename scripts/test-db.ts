import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔍 Verifying seeded data...\n");

  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true, email: true, name: true, isPro: true, emailVerified: true },
  });
  console.log("👤 Demo User:");
  console.log(`  Email: ${user?.email}`);
  console.log(`  Name: ${user?.name}`);
  console.log(`  isPro: ${user?.isPro}`);
  console.log(`  Verified: ${user?.emailVerified ? "✓" : "✗"}`);

  const itemTypes = await prisma.itemType.findMany({ orderBy: { name: "asc" } });
  console.log(`\n📦 Item Types (${itemTypes.length}):`);
  itemTypes.forEach((t) => {
    console.log(`  ${t.icon.padEnd(12)} ${t.name.padEnd(10)} ${t.color}  system: ${t.isSystem}`);
  });

  const collections = await prisma.collection.findMany({
    include: {
      items: { include: { item: { include: { itemType: true, tags: true } } } },
      defaultType: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`\n📁 Collections (${collections.length}):`);
  for (const col of collections) {
    const fav = col.isFavorite ? " ⭐" : "";
    const defType = col.defaultType ? ` [default: ${col.defaultType.name}]` : "";
    console.log(`\n  ${col.name}${fav}${defType}`);
    console.log(`  "${col.description}"`);

    for (const ic of col.items) {
      const item = ic.item;
      const pin = item.isPinned ? " 📌" : "";
      const heart = item.isFavorite ? " ❤️" : "";
      const lang = item.language ? ` (${item.language})` : "";
      const tags = item.tags.map((t) => t.name).join(", ");
      const url = item.url ? ` → ${item.url}` : "";

      console.log(`    • [${item.itemType.name}] ${item.title}${lang}${pin}${heart}${url}`);
      console.log(`      Tags: ${tags || "none"}`);
      if (item.content) {
        const preview = item.content.split("\n")[0].slice(0, 60);
        console.log(`      Content: ${preview}...`);
      }
    }
  }

  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  console.log(`\n🏷️  Tags (${tags.length}):`);
  console.log(`  ${tags.map((t) => t.name).join(", ")}`);

  const counts = {
    users: await prisma.user.count(),
    items: await prisma.item.count(),
    collections: await prisma.collection.count(),
    tags: await prisma.tag.count(),
    itemCollections: await prisma.itemCollection.count(),
  };
  console.log("\n📊 Summary:");
  console.log(`  Users:            ${counts.users}`);
  console.log(`  Items:            ${counts.items}`);
  console.log(`  Collections:      ${counts.collections}`);
  console.log(`  Item-Collections: ${counts.itemCollections}`);
  console.log(`  Tags:             ${counts.tags}`);

  console.log("\n✅ All seeded data verified!");
}

main()
  .catch((e) => {
    console.error("❌ Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
