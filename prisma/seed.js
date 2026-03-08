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

  // Create courses
  const courses = [
    {
      title: 'Podcast Starter Cursus',
      slug: 'podcast-starter',
      description: 'Leer de basis van podcasting in deze uitgebreide cursus. Van opname tot publicatie, alles komt aan bod.',
      content: JSON.stringify({
        chapters: [
          { title: 'Introductie', duration: '5 min' },
          { title: 'Equipment keuze', duration: '15 min' },
          { title: 'Opname technieken', duration: '20 min' },
          { title: 'Audio editing', duration: '25 min' },
          { title: 'Publicatie', duration: '10 min' },
        ]
      }),
      price: 9900, // €99.00
      imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=600&fit=crop',
    },
    {
      title: 'Audio Editing Pro',
      slug: 'audio-editing-pro',
      description: 'Word een expert in audio editing met deze professionele cursus. Leer alle ins en outs van moderne editing software.',
      content: JSON.stringify({
        chapters: [
          { title: 'Software overzicht', duration: '10 min' },
          { title: 'Basis editing', duration: '30 min' },
          { title: 'Geavanceerde technieken', duration: '45 min' },
          { title: 'Mixing en mastering', duration: '35 min' },
          { title: 'Workflow optimalisatie', duration: '20 min' },
        ]
      }),
      price: 14900, // €149.00
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    },
    {
      title: 'Content Strategy voor Ondernemers',
      slug: 'content-strategy',
      description: 'Ontwikkel een winnende content strategie voor je business. Van planning tot uitvoering en meting.',
      content: JSON.stringify({
        chapters: [
          { title: 'Strategie fundamenten', duration: '15 min' },
          { title: 'Doelgroep analyse', duration: '20 min' },
          { title: 'Content planning', duration: '25 min' },
          { title: 'Uitvoering en productie', duration: '30 min' },
          { title: 'Meting en optimalisatie', duration: '20 min' },
        ]
      }),
      price: 12900, // €129.00
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {},
      create: course,
    });
  }

  console.log('✅ Courses created');

  // Create e-books
  const ebooks = [
    {
      title: 'Audio Editing Pro - Complete Gids',
      slug: 'audio-editing-pro-guide',
      description: 'Een uitgebreide gids voor audio editing. Van basis tot geavanceerde technieken, alles wat je moet weten.',
      fileUrl: 'ebooks/audio-editing-pro-guide.pdf',
      price: 1999, // €19.99
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    },
    {
      title: 'Podcast Equipment Gids 2024',
      slug: 'podcast-equipment-guide-2024',
      description: 'De meest actuele gids voor podcast equipment. Reviews, vergelijkingen en aanbevelingen voor elke budget.',
      fileUrl: 'ebooks/podcast-equipment-guide-2024.pdf',
      price: 1499, // €14.99
      coverUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=600&fit=crop',
    },
    {
      title: 'Content Marketing voor Audio Creators',
      slug: 'content-marketing-audio',
      description: 'Leer hoe je je audio content effectief promoot en een trouwe audience opbouwt.',
      fileUrl: 'ebooks/content-marketing-audio.pdf',
      price: 2499, // €24.99
      coverUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=600&fit=crop',
    },
  ];

  for (const ebook of ebooks) {
    await prisma.ebook.upsert({
      where: { slug: ebook.slug },
      update: {},
      create: ebook,
    });
  }

  console.log('✅ E-books created');

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
      content: 'De Shure SM7B is al jaren de standaard voor podcasters en radio DJs. Deze dynamische microfoon biedt een warme, natuurlijke geluidskwaliteit die perfect is voor spraak. De cardioid polar pattern zorgt voor uitstekende feedback rejection, terwijl de ingebouwde pop filter en windscreen zorgen voor een schone opname. De microfoon is zeer robuust gebouwd en gaat jarenlang mee. Het enige nadeel is dat de microfoon veel gain vereist, dus een goede audio interface of preamp is essentieel.',
      affiliateUrl: 'https://amazon.nl/dp/B0002E4Z8M?tag=studioinsight-21',
      imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9452e6b?w=800&h=600&fit=crop',
    },
    {
      title: 'Rode PodMic Review - Budgetvriendelijke Podcast Microfoon',
      slug: 'rode-podmic-review',
      productName: 'Rode PodMic',
      brand: 'Rode',
      rating: 4,
      pros: 'Goede prijs-kwaliteit verhouding, solide bouw, goede geluidskwaliteit',
      cons: 'Vereist veel gain, geen ingebouwde pop filter',
      content: 'De Rode PodMic is een uitstekende keuze voor podcasters die op zoek zijn naar een betaalbare microfoon met professionele kwaliteit. Deze dynamische microfoon biedt een warme, natuurlijke geluidskwaliteit die perfect is voor spraak. De cardioid polar pattern zorgt voor goede feedback rejection. De microfoon is solide gebouwd en heeft een professionele uitstraling. Het enige nadeel is dat de microfoon veel gain vereist en geen ingebouwde pop filter heeft, dus je hebt een goede audio interface en externe pop filter nodig.',
      affiliateUrl: 'https://amazon.nl/dp/B07M9B5W5N?tag=studioinsight-21',
      imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9452e6b?w=800&h=600&fit=crop',
    },
    {
      title: 'Audio-Technica AT2020 Review - Condenser Microfoon voor Beginners',
      slug: 'audio-technica-at2020-review',
      productName: 'Audio-Technica AT2020',
      brand: 'Audio-Technica',
      rating: 4,
      pros: 'Betaalbaar, goede geluidskwaliteit, plug-and-play',
      cons: 'Vereist phantom power, gevoelig voor omgevingsgeluid',
      content: 'De Audio-Technica AT2020 is een uitstekende keuze voor beginners die op zoek zijn naar een betaalbare condenser microfoon. Deze microfoon biedt een heldere, gedetailleerde geluidskwaliteit die perfect is voor spraak en zang. De cardioid polar pattern zorgt voor goede feedback rejection. De microfoon is plug-and-play en werkt direct met de meeste audio interfaces. Het enige nadeel is dat de microfoon phantom power vereist en gevoelig is voor omgevingsgeluid, dus een stille omgeving is belangrijk.',
      affiliateUrl: 'https://amazon.nl/dp/B0006H92QK?tag=studioinsight-21',
      imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9452e6b?w=800&h=600&fit=crop',
    },
    {
      title: 'Focusrite Scarlett Solo Review - Perfecte Audio Interface voor Beginners',
      slug: 'focusrite-scarlett-solo-review',
      productName: 'Focusrite Scarlett Solo',
      brand: 'Focusrite',
      rating: 5,
      pros: 'Uitstekende geluidskwaliteit, plug-and-play, goede prijs-kwaliteit verhouding',
      cons: 'Slechts één XLR ingang, geen MIDI',
      content: 'De Focusrite Scarlett Solo is een uitstekende audio interface voor beginners en semi-professionals. Deze interface biedt uitstekende geluidskwaliteit met 24-bit/192kHz opname. De interface is plug-and-play en werkt direct met de meeste DAW software. De ingebouwde preamp zorgt voor schone, heldere opnames. De interface heeft één XLR ingang en één instrument ingang, wat perfect is voor solo podcasters. Het enige nadeel is dat er geen MIDI aansluiting is, maar voor podcasting is dit geen probleem.',
      affiliateUrl: 'https://amazon.nl/dp/B07QR6Z1J7?tag=studioinsight-21',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    },
    {
      title: 'Beyerdynamic DT 770 Pro Review - Professionele Studio Headphones',
      slug: 'beyerdynamic-dt770-pro-review',
      productName: 'Beyerdynamic DT 770 Pro',
      brand: 'Beyerdynamic',
      rating: 5,
      pros: 'Uitstekende geluidskwaliteit, comfortabel, robuuste bouw',
      cons: 'Geen in-line volume control, kabel niet vervangbaar',
      content: 'De Beyerdynamic DT 770 Pro is een van de meest populaire studio headphones ter wereld. Deze closed-back headphones bieden uitstekende geluidsisolatie en een neutrale, gedetailleerde geluidskwaliteit. De headphones zijn zeer comfortabel om langdurig te dragen en hebben een robuuste bouw. De verschillende impedantie versies (32, 80, 250 ohm) maken ze geschikt voor verschillende toepassingen. Het enige nadeel is dat de kabel niet vervangbaar is en er geen in-line volume control is.',
      affiliateUrl: 'https://amazon.nl/dp/B0006NL5SM?tag=studioinsight-21',
      imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9452e6b?w=800&h=600&fit=crop',
    },
    {
      title: 'Zoom PodTrak P4 Review - All-in-One Podcast Recorder',
      slug: 'zoom-podtrak-p4-review',
      productName: 'Zoom PodTrak P4',
      brand: 'Zoom',
      rating: 4,
      pros: 'All-in-one oplossing, goede geluidskwaliteit, draagbaar',
      cons: 'Beperkte editing mogelijkheden, kleine display',
      content: 'De Zoom PodTrak P4 is een all-in-one podcast recorder die perfect is voor podcasters die een eenvoudige, draagbare oplossing zoeken. Deze recorder heeft vier XLR ingangen, ingebouwde preamps, en een SD kaart slot voor opname. De geluidskwaliteit is uitstekend en de recorder is zeer draagbaar. De ingebouwde monitoring en headphone uitgang maken het perfect voor live podcasting. Het enige nadeel is dat de editing mogelijkheden beperkt zijn en het display vrij klein is, maar voor de meeste podcasters is dit voldoende.',
      affiliateUrl: 'https://amazon.nl/dp/B08G9PRS1K?tag=studioinsight-21',
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

  // Create sample purchases for test user
  const samplePurchases = [
    {
      userId: testUser.id,
      productId: courses[0].slug, // First course
      productType: 'course',
      amount: courses[0].price,
      stripeSessionId: 'cs_test_sample_1',
    },
    {
      userId: testUser.id,
      productId: ebooks[0].slug, // First ebook
      productType: 'ebook',
      amount: ebooks[0].price,
      stripeSessionId: 'cs_test_sample_2',
    },
  ];

  for (const purchase of samplePurchases) {
    await prisma.purchase.upsert({
      where: { 
        userId_productId: {
          userId: purchase.userId,
          productId: purchase.productId,
        }
      },
      update: {},
      create: purchase,
    });
  }

  console.log('✅ Sample purchases created');

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
