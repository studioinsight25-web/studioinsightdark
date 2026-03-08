const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const hashedPassword = await bcrypt.hash('TestPassword123', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@studioinsight.nl' },
    update: {},
    create: {
      email: 'test@studioinsight.nl',
      passwordHash: hashedPassword,
      hasAccess: true,
    },
  });

  console.log('✅ Test user created:', testUser.email);

  // Create reviews
  const reviews = [
    {
      title: 'Shure SM7B Review - De Koning van Podcast Microfoons',
      slug: 'shure-sm7b-review',
      productName: 'Shure SM7B',
      brand: 'Shure',
      rating: 5,
      pros: 'Uitstekende geluidskwaliteit, robuuste bouw, perfecte voor spraak',
      cons: 'Hoge prijs, vereist veel gain',
      content: 'De Shure SM7B is al jaren de standaard voor podcasters en radio DJs.',
      affiliateUrl: 'https://amazon.nl/dp/B0002E4Z8M?tag=studioinsight-21',
      imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9452e6b?w=800&h=600&fit=crop',
    },
    {
      title: 'Rode PodMic Review - Budgetvriendelijke Podcast Microfoon',
      slug: 'rode-podmic-review',
      productName: 'Rode PodMic',
      brand: 'Rode',
      rating: 4,
      pros: 'Goede prijs-kwaliteit verhouding, solide bouw',
      cons: 'Vereist veel gain',
      content: 'De Rode PodMic is een uitstekende keuze voor podcasters.',
      affiliateUrl: 'https://amazon.nl/dp/B07M9B5W5N?tag=studioinsight-21',
      imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9452e6b?w=800&h=600&fit=crop',
    },
  ];

  for (const review of reviews) {
    await prisma.review.upsert({
      where: { slug: review.slug },
      update: {},
      create: review,
    });
  }

  console.log('✅ Reviews created');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
