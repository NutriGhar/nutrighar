import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const contact = await prisma.websiteContent.findUnique({ where: { section: 'contact' } });
    if (contact) {
      const data = contact.data as any;
      data.phone = '+91 79761 19153';
      data.whatsapp = '+91 79761 19153';
      data.email = 'Nutrighar2917@gmail.com';
      await prisma.websiteContent.update({ where: { section: 'contact' }, data: { data } });
      console.log('Updated contact content (phone + email) in db');
    }
    const footer = await prisma.websiteContent.findUnique({ where: { section: 'footer' } });
    if (footer) {
      const data = footer.data as any;
      data.whatsappUrl = 'https://wa.me/917976119153';
      await prisma.websiteContent.update({ where: { section: 'footer' }, data: { data } });
      console.log('Updated footer content in db');
    }
    console.log('Done DB update');
  } catch (e: any) {
    console.log('DB error (might be offline/mock mode):', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
