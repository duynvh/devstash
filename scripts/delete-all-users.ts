import 'dotenv/config';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function getCountSummary() {
  const [users, items, collections, accounts, sessions, verificationTokens] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.collection.count(),
    prisma.account.count(),
    prisma.session.count(),
    prisma.verificationToken.count(),
  ]);
  return { users, items, collections, accounts, sessions, verificationTokens };
}

async function main() {
  const before = await getCountSummary();

  console.log('\n⚠️  DELETE ALL USERS\n');
  console.log('The following records will be permanently deleted:');
  console.log(`  Users:                ${before.users}`);
  console.log(`  Items:                ${before.items}`);
  console.log(`  Collections:          ${before.collections}`);
  console.log(`  Accounts (OAuth):     ${before.accounts}`);
  console.log(`  Sessions:             ${before.sessions}`);
  console.log(`  Verification Tokens:  ${before.verificationTokens}`);
  console.log('\nNote: System item types and tags are NOT deleted.\n');

  if (before.users === 0) {
    console.log('✅ No users found. Nothing to delete.');
    return;
  }

  const rl = readline.createInterface({ input, output });
  const answer = await rl.question('Type "yes" to confirm: ');
  rl.close();

  if (answer.trim().toLowerCase() !== 'yes') {
    console.log('\n❌ Aborted.');
    return;
  }

  console.log('\n🗑️  Deleting...');

  await prisma.$transaction([
    prisma.verificationToken.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.itemCollection.deleteMany(),
    prisma.item.deleteMany(),
    prisma.collection.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const after = await getCountSummary();

  console.log('\n✅ Done. Remaining records:');
  console.log(`  Users:       ${after.users}`);
  console.log(`  Items:       ${after.items}`);
  console.log(`  Collections: ${after.collections}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
