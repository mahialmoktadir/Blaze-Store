import { NextResponse } from 'next/server';
import { db } from '@/src/db/index.ts';
import { supportTickets, supportMessages } from '@/src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let q = db.select().from(supportTickets);
    if (userId && userId !== 'all') {
      // @ts-expect-error drizzle builder
      q = q.where(eq(supportTickets.userId, userId));
    }
    const tickets = await q.orderBy(desc(supportTickets.createdAt));
    const allMsgs = await db.select().from(supportMessages);

    const result = tickets.map((t) => ({
      ...t,
      messages: allMsgs.filter((m) => m.ticketId === t.id),
    }));

    return NextResponse.json({ success: true, tickets: result });
  } catch (error: any) {
    console.error('API GET /api/support error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, message, senderType, senderName, ...newTicketData } = body;

    if (ticketId) {
      // Add message to existing ticket
      const [msg] = await db
        .insert(supportMessages)
        .values({
          ticketId: parseInt(ticketId),
          senderType: senderType || 'customer',
          senderName: senderName || 'User',
          message,
        })
        .returning();

      // If admin replied, mark ticket in_progress
      if (senderType === 'admin') {
        await db
          .update(supportTickets)
          .set({ status: 'in_progress' })
          .where(eq(supportTickets.id, parseInt(ticketId)));
      }

      return NextResponse.json({ success: true, message: msg });
    } else {
      // Create new ticket
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const ticketNumber = `TKT-${randomNum}`;

      const [ticket] = await db
        .insert(supportTickets)
        .values({
          ticketNumber,
          userId: newTicketData.userId || 'guest',
          customerName: newTicketData.customerName,
          customerEmail: newTicketData.customerEmail,
          customerWhatsapp: newTicketData.customerWhatsapp || null,
          subject: newTicketData.subject,
          message: newTicketData.message,
          priority: newTicketData.priority || 'medium',
          status: 'open',
        })
        .returning();

      // Initial message
      await db.insert(supportMessages).values({
        ticketId: ticket.id,
        senderType: 'customer',
        senderName: newTicketData.customerName,
        message: newTicketData.message,
      });

      return NextResponse.json({ success: true, ticket });
    }
  } catch (error: any) {
    console.error('API POST /api/support error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to submit support request' }, { status: 500 });
  }
}
