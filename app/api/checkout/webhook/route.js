import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { grantDiscordAccess } from '@/lib/discord';

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    const event = verifyWebhookSignature(body, signature);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { productId, productType } = session.metadata;

      if (!productId || !productType) {
        console.error('Missing product metadata in webhook');
        return NextResponse.json({ error: 'Missing product metadata' }, { status: 400 });
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: session.customer_email },
      });

      if (!user) {
        console.error('User not found for email:', session.customer_email);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Create purchase record
      const purchase = await prisma.purchase.create({
        data: {
          userId: user.id,
          productId: productId,
          productType: productType,
          amount: session.amount_total,
          stripeSessionId: session.id,
        },
      });

      // Grant Discord access if user doesn't have it yet
      if (!user.hasAccess) {
        await prisma.user.update({
          where: { id: user.id },
          data: { hasAccess: true },
        });

        // Grant Discord access
        try {
          await grantDiscordAccess(user.email);
        } catch (discordError) {
          console.error('Discord access grant failed:', discordError);
          // Don't fail the webhook if Discord fails
        }
      }

      console.log('Purchase completed:', purchase.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
