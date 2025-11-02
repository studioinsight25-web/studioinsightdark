# ✅ Payment Flow Checklist - Alles is Geconfigureerd

## 🎯 Complete Payment Flow voor Nieuwe Orders

### 1. **Checkout Proces** ✅
- [x] User voegt producten toe aan cart
- [x] User gaat naar checkout pagina
- [x] Checkout pagina toont correcte prijzen (centen → euros conversie)
- [x] Checkout API valideert user sessie (email + userId fallback)
- [x] Order wordt aangemaakt in database met status `PENDING`
- [x] Mollie payment wordt aangemaakt met metadata (orderId, userId, products)
- [x] **Payment ID wordt opgeslagen in order** (`payment_id` kolom)
- [x] User wordt doorgestuurd naar Mollie checkout

### 2. **Mollie Betaling** ✅
- [x] User betaalt via Mollie
- [x] Mollie stuurt webhook naar `/api/payment/webhook`

### 3. **Webhook Handler** ✅
- [x] Webhook ontvangt payment ID
- [x] Webhook haalt payment status op van Mollie
- [x] **Order wordt gevonden via `payment_id`** (`getOrderByPaymentId`)
- [x] Order status wordt geupdate naar `PAID`
- [x] **Payment ID wordt opnieuw opgeslagen** (voor zekerheid)
- [x] `paid_at` timestamp wordt gezet
- [x] **Cart wordt automatisch geleegd** na succesvolle betaling

### 4. **Payment Success Page** ✅
- [x] User wordt doorgestuurd naar `/payment/success?orderId=xxx`
- [x] Order details worden geladen via `/api/orders/[orderId]`
- [x] **Cart wordt ook client-side geleegd** (dubbele zekerheid)
- [x] Success melding wordt getoond
- [x] Links naar dashboard en gekochte producten

### 5. **Dashboard & Product Access** ✅
- [x] `/api/user/purchases` haalt alle PAID orders op
- [x] Order status check (zowel 'paid' als 'PAID' worden herkend)
- [x] Gekochte producten worden getoond in dashboard
- [x] Download/access knoppen verschijnen voor gekochte producten
- [x] Digital product security: alleen gekochte producten zijn downloadbaar

## 🔧 Technische Details

### Order Creation Flow:
```
Checkout Page → POST /api/checkout/create-payment
  ├─ Validate session (email + userId)
  ├─ Get products from database
  ├─ Create order (status: PENDING)
  ├─ Create Mollie payment
  └─ Save payment_id to order ✅
```

### Webhook Flow:
```
Mollie → POST /api/payment/webhook
  ├─ Get payment status from Mollie
  ├─ Find order by payment_id ✅
  ├─ Update order status to PAID ✅
  └─ Clear cart ✅
```

### Dashboard Flow:
```
Dashboard → GET /api/user/purchases
  ├─ Get all orders for user
  ├─ Filter only PAID orders ✅
  └─ Return purchased products
```

## ✅ Alles is Goed Geconfigureerd!

Je kunt nu een test doen met een echte betaling. De flow is volledig geautomatiseerd:

1. **Order wordt aangemaakt** tijdens checkout
2. **Payment ID wordt opgeslagen** direct na Mollie payment creation
3. **Webhook vindt order** op basis van payment_id
4. **Order wordt gemarkeerd als PAID** automatisch
5. **Cart wordt geleegd** automatisch
6. **Producten verschijnen in dashboard** automatisch
7. **Download/access knoppen** verschijnen automatisch

## 📝 Test Checklist

Tijdens je test, controleer:
- [ ] Order verschijnt in database met status `PENDING` direct na checkout
- [ ] Order heeft `payment_id` ingevuld
- [ ] Na betaling wordt order status geupdate naar `PAID`
- [ ] Cart is leeg na betaling
- [ ] Product verschijnt in dashboard
- [ ] Download knop is beschikbaar voor ebook/course

## 🐛 Troubleshooting

Als er iets misgaat:
- Check Vercel logs voor webhook calls
- Check `/api/debug-order?email=xxx` om orders te zien
- Check `/api/admin/find-missing-orders?paymentId=xxx` om payment te verifiëren
- Gebruik `/api/admin/fix-missing-order` om ontbrekende orders te repareren

