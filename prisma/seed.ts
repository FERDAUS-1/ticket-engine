import { PrismaClient, Role, SeatStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.seat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding admin and user...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      email: 'admin@ticketengine.com',
      password: hashedPassword,
      name: 'System Admin',
      role: Role.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      email: 'user@ticketengine.com',
      password: hashedPassword,
      name: 'Test Customer',
      role: Role.USER,
    },
  });

  console.log('Seeding concert event...');
  const concert = await prisma.event.create({
    data: {
      title: 'Dhaka Rock Fest 2026',
      description: 'Annual underground rock concert in Dhaka.',
      location: 'ICCB, Dhaka',
      date: new Date('2026-11-20T18:00:00Z'),
      totalSeats: 50,
    },
  });

  console.log('Seeding 50 seats for the event...');
  const seatsData: {
    seatNumber: string;
    price: number;
    status: SeatStatus;
    eventId: string;
  }[] = [];

  for (let i = 1; i <= 50; i++) {
    seatsData.push({
      seatNumber: `A-${i.toString().padStart(2, '0')}`,
      price: 1500.0,
      status: SeatStatus.AVAILABLE,
      eventId: concert.id,
    });
  }

  await prisma.seat.createMany({
    data: seatsData,
  });

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });