# Gift cards, in plain English

A gift card is money one person pays us now, so another person can spend it on a
30 Sundays holiday later. Nothing more clever than that.

The money does not sit on a plastic card and it is not cash. Once the person
receiving it accepts the card, the amount turns into **travel credit** in their
wallet. They spend that credit on any 30 Sundays package, against any instalment.
They cannot withdraw it, send it to a bank account, or pass it on again.

## Who buys one, and why

- **Wedding shagun.** The commonest case. You are going to give money anyway, so
  give it in a form that turns into their honeymoon instead of into an envelope.
- **Anniversary or birthday.** You want to give a trip but you do not want to pick
  the dates, the hotel, or the destination for them.
- **A group that cannot agree.** Four friends each send a card. The couple ends up
  with one credit balance and no coordination problem. (A proper shared pool for
  this is the gift registry, which is a separate thing.)
- **Buying for yourself, sort of.** Some people buy a card and hold it, because
  they want to hand something over in person on the day.

## What the buyer does

Two screens.

**One, the card.** Pick the occasion, pick one of six designs, pick the amount
(₹2,500, ₹5,000, ₹10,000 or a figure of your own), write a line. Every design is a real destination photograph, so the card looks like
a holiday rather than a voucher. The card on screen updates as they type, so what
they see is what gets sent.

**Two, who it is for.** Their name, and the buyer's name. Then one box:

> Send it to them on WhatsApp now

- **Box ticked.** They type the recipient's mobile number, and optionally an email.
  The moment payment clears, we send it. This cannot be recalled, so the screen says
  so plainly and the number is theirs to check.
- **Box left off.** Nothing is sent to anyone. The buyer gets the card, the link and
  the code, and hands it over whenever they like. This is the default, because the
  person paying can obviously see their own card, and because it removes the
  wrong-number risk entirely.

Then they pay. Amount and button sit in a bar at the bottom of the screen, so the
price is visible while they fill the form in.

## What the buyer gets afterwards

One screen with everything needed to hand the gift over:

- The finished card.
- A WhatsApp button that opens WhatsApp with the message, the link, the code and
  the PIN already written out.
- Three rows with a copy button each: the **link**, the **gift code**, and the
  **PIN**.
- Two lines explaining how the other person adds it.

## How the recipient gets the money

There are two routes in, and both end at the same place.

### Route one: the link

The link looks like `30sundays.club/g/<code>`. Tapping it opens the card, with the
code already filled in. They tap "Add to my wallet", we text a one time code to
their own phone number, they type it, and the amount appears in their credit
balance.

The phone check is the important bit. A WhatsApp message gets forwarded, screenshot
and re-shared. Without a check, whoever ends up holding the link holds the money.
With it, the money can only land in a wallet attached to a phone that person
controls. It is one extra tap and it closes the obvious hole.

The link opens in a browser, so the card shows there straight away, whether or not
they have the app.

### Route two: type it in

Wallet, then "Add a gift card", then the sixteen character code and the four digit
PIN from the message. This is for someone who was sent a screenshot, or who lost the
message, or who was given the card verbally.

The same drawer also takes a pasted link. Inside the app you are already signed in,
so a pasted link is added straight away with no PIN needed.

Five wrong PINs lock that code for twenty four hours. That stops someone guessing
their way into a stranger's card.

## The rules

| | |
|---|---|
| Amount | ₹2,500, ₹5,000, ₹10,000, or any figure you type |
| Limits | ₹1,500 minimum, ₹50,000 maximum on one card |
| Designs | Six, all destination photography |
| Delivery | Instant on payment. WhatsApp, with SMS as backup, plus email if given |
| Cancelling | Not possible once paid |
| Claiming | Once, and within 365 days. After that the code and PIN stop working |
| What it becomes | Travel credit, which never expires |
| Where it can be spent | Any 30 Sundays package, any instalment, no cap |
| Cash out | Never, for the buyer or the recipient |
| Stamps | Cannot buy a gift card. Buying one earns none, and spending gifted credit earns none |
| Who it belongs to | One person. No joint cards, no splitting |
| The buyer | Is told the moment it is claimed |

## The 365 day rule

A card has to be **claimed within 365 days of being bought**. After that the code
lapses. It cannot be claimed, cannot be reissued, and is not refunded to the buyer.

Once it is claimed, the amount becomes travel credit, and **credit never expires**.
So the year is a deadline to accept the gift, not a deadline to take the holiday.

That split is the important bit, and every screen says it that way. Two reasons for
drawing the line there:

- **Money cannot sit unclaimed forever.** An open-ended liability is a problem for
  the accounts and a problem for support, and a card nobody has touched in a year is
  almost certainly a wrong number or a forgotten message.
- **It matches the gift registry**, where an unclaimed pool already lapses after a
  year. One rule across both is easier to explain than two.

The alternatives were considered and rejected. Expiring the **credit** a year after
claiming, which is what most retail wallets do, would break the promise the wallet
makes on every screen and turn a gift into a countdown. No expiry at all leaves the
liability open. So: the card expires, the money does not.

What the buyer sees: every unclaimed card shows the days remaining, in red under
thirty days. A lapsed card is labelled **Expired**, with the date, and the code and
PIN are hidden because they no longer work.

## Telling whether it was used

Every card the buyer has bought is listed with one plain label.

- **Not redeemed.** Nobody has accepted it yet. The code, PIN and link are all still
  live and still visible to the buyer, so they can re-share. The days left to claim
  are shown next to it.
- **Redeemed.** The amount is now sitting in someone's credit wallet. The date it
  happened is shown, and the code and PIN are hidden, because they no longer work.
- **Expired.** Nobody claimed it inside 365 days. The code is dead and the money is
  not coming back.

We deliberately do not claim to know whether the buyer has passed the link on. We
cannot see that, so we do not say it.

## Why it was built this way

- **Photos, not gradients.** A coloured gradient with an emoji on it reads like a
  discount coupon. A photograph of an overwater villa reads like a holiday. The
  itinerary screen already sells trips with photography, so the gift card matches it.
- **White screens.** Pink is kept for one button per screen, small labels and icons.
  A pink background makes the brand louder and the content harder to read.
- **Two steps, not six.** Everything about the card is one screen, everything about
  the person is the next. There is no separate preview step, because the card is
  visible the whole way through.
- **The buyer keeps the card by default.** Most people want to hand a gift over
  themselves. Making instant delivery the exception rather than the rule also removes
  the single worst failure in this product, which is money sent to a mistyped number.
- **One checkbox, not two.** The old flow asked the buyer to tick that they had
  checked the number, which is a box everybody ticks without reading. The terms are
  now a plain line above the pay button instead.

## Deliberately left out

- **Personalising the card with your own photo.** Future scope. It is the single most
  requested feature in this category and worth doing properly, with a crop tool and a
  layout that gives the photo real space, rather than a small corner inset.
- **Bulk orders.** Not built.
- **Corporate gifting.** Not built.
- **Physical or posted cards, gift boxes, envelopes.** Not built. Everything here is
  digital.
- **Scheduled delivery.** Not built. If you want it to arrive on the day, hold the
  link and send it on the day.

## Decided

These were open. They are not any more.

1. **A forwarded link is acceptable.** The phone check means the money lands with a
   real account holder, even if that holder turns out not to be the cousin it was
   meant for. We are not going to chase that. The check is there to stop a stranger
   cashing a leaked link, not to police who in a family opens it.
2. **The buyer is told when it is used.** A notification the moment it is claimed,
   and the card in their list flips to redeemed with the date. If nobody claims it,
   they get a nudge at thirty days and again at seven days before it lapses.
3. **Stamps and gift cards do not mix, in either direction.** Stamps cannot buy a
   gift card, buying a gift card earns no stamps, and a booking paid for with gifted
   credit earns no stamps either. Stamps stay a marketing reward on money the customer
   spent themselves.
4. **The amounts are ₹2,500, ₹5,000, ₹10,000 or your own figure.** The ₹1,500 floor
   and the ₹50,000 ceiling stay, and above the ceiling we point people at a gift
   registry. Good enough for now, and worth revisiting once there is real data on what
   people actually pick.
5. **A card belongs to one person.** No joint card, no card addressed to a couple, no
   splitting. It lands in the wallet of whoever claims it. Anyone who wants to give to
   a pair sends two cards or uses a gift registry.

   One thing to be aware of: the wallet has its own separate rule where credit is
   shared once two people are linked on a trip. So a gift claimed by one person can
   still end up spendable by their partner through that route. If gifted credit should
   be exempt from that, it needs saying.

## Still open

Three left, and all three are finance and legal rather than design.

1. **What happens to the money on a lapsed card.** The 365 day rule stops a card being
   claimed, but it does not say where the amount goes. Today it stays with us. Whether
   that is defensible, whether it has to be offered back to the buyer, and how it is
   recognised in the accounts all need answering.
2. **Money held on account.** We hold money for a service not yet chosen. Depending on
   volume this touches prepaid instrument rules, GST timing, and how the balance
   appears in the accounts. This one wants looking at early, because the answer could
   change the product.
3. **Refunds on a trip paid with gift credit.** The credit half returns to the wallet.
   Back to the person who spent it, or the person who was gifted it? Today they are the
   same wallet, so it does not bite. A linked partner makes it ambiguous.

## Where the screens are

| Screen | Route |
|---|---|
| Gift cards, and the cards you have sent | `/gift-cards` |
| Buying one | `/gift-cards/buy` |
| What the recipient opens | `/g/:code` (also `/gift/:code`) |
| Adding one to your wallet | `/wallet`, Credit tab, "Add a gift card" |

Prototype shortcuts: every one time code is `1234`. `GS-4KX2-9PLM` with PIN `4821`
is a live ₹11,000 card from Meera Nair. `GS-7TQ1-2MNB` with PIN `1109` is already
claimed, so it shows that message. `GS-3RVW-8KDL` with PIN `6034` was bought more than
a year ago, so it shows the expired state.
