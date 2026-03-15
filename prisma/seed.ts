import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { DEMO_USER, SYSTEM_ITEM_TYPES, COLLECTIONS, type SeedCollection } from "./seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function seedUser() {
  const hashedPassword = await bcrypt.hash(DEMO_USER.rawPassword, 12);
  return prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: {},
    create: {
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      password: hashedPassword,
      isPro: DEMO_USER.isPro,
      emailVerified: new Date(),
    },
  });
}

async function seedItemTypes() {
  const typeMap = new Map<string, string>();
  for (const type of SYSTEM_ITEM_TYPES) {
    const result = await prisma.itemType.upsert({
      where: { name_userId: { name: type.name, userId: "" } },
      update: {},
      create: type,
    });
    typeMap.set(type.name, result.id);
  }
  return typeMap;
}

async function seedTags(tagNames: string[]) {
  const tagMap = new Map<string, string>();
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    tagMap.set(name, tag.id);
  }
  return tagMap;
}

function collectAllTags(): string[] {
  const tags = new Set<string>();
  for (const col of COLLECTIONS) {
    for (const item of col.items) {
      item.tags?.forEach((t) => tags.add(t));
    }
  }
  return [...tags];
}

async function seedCollections(
  userId: string,
  typeMap: Map<string, string>,
  tagMap: Map<string, string>,
) {
  for (const col of COLLECTIONS) {
    const defaultTypeId = col.defaultTypeName
      ? typeMap.get(col.defaultTypeName)
      : undefined;

    const collection = await prisma.collection.create({
      data: {
        name: col.name,
        description: col.description,
        isFavorite: col.isFavorite ?? false,
        userId,
        defaultTypeId: defaultTypeId ?? null,
      },
    });

    for (const item of col.items) {
      const itemTypeId = typeMap.get(item.typeName)!;
      const isLink = item.typeName === "link";

      const created = await prisma.item.create({
        data: {
          title: item.title,
          contentType: isLink ? "URL" : "TEXT",
          content: item.content ?? null,
          url: (item as { url?: string }).url ?? null,
          description: (item as { description?: string }).description ?? null,
          language: (item as { language?: string }).language ?? null,
          isFavorite: item.isFavorite ?? false,
          isPinned: item.isPinned ?? false,
          userId,
          itemTypeId,
          tags: {
            connect: (item.tags ?? []).map((t) => ({ id: tagMap.get(t)! })),
          },
        },
      });

      await prisma.itemCollection.create({
        data: { itemId: created.id, collectionId: collection.id },
      });
    }

    console.log(`  ✓ ${col.name} (${col.items.length} items)`);
  }
}

async function main() {
  console.log("🌱 Seeding database...\n");

  const user = await seedUser();
  console.log(`✓ User: ${user.email}`);

  const typeMap = await seedItemTypes();
  console.log(`✓ Item types: ${typeMap.size}`);

  const allTags = collectAllTags();
  const tagMap = await seedTags(allTags);
  console.log(`✓ Tags: ${tagMap.size}`);

  console.log("\nCollections:");
  await seedCollections(user.id, typeMap, tagMap);

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
