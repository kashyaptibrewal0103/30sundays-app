# Gift cards and gift registry

Two features on one currency. Travel Credit is real money someone paid in.
Stamps stay what they were: a marketing reward. The wallet shows both and never
adds them together.

## Where to look

| Screen | Route |
|---|---|
| Wallet (stamps + credit, top up, add a gift card) | `/wallet` |
| Gift cards landing and the cards you have sent | `/gift-cards` |
| Buy a gift card, two steps | `/gift-cards/buy` |
| What the recipient opens | `/g/:code` (also `/gift/:code`) |
| Gift registry landing | `/registry` |
| Set one up | `/registry/new?for=couple` or `?for=us` |
| A registry page | `/registry/:id` |

All three are reachable from Account. The wallet row now opens its own screen
instead of a sheet.

Gift cards have their own write up in `README-gift-cards.md`: the logic, the two
ways to redeem, what was left out, and the questions still open.

## Where the design comes from

The wallet is the live screen from the Flutter app at `../30-sundays-app`
(`lib/features/user_wallet`), rebuilt here: the dotted balance card, the orange
ticket stub hanging off it, the stamp mark, the earned and redeemed split, the
View Transaction History row and the Ways to Earn Coins tiles. Its stamp SVG and
background wash were copied across as `public/icons/stamp-icon.svg` and
`public/background-gradient.png`. Text sizes follow the app's theme roles.

Credit is a second tab on that same card, so the two balances sit side by side
and never add up into one number.

## Demo data

Seeded into local storage on first load, under `30s_gift_v4`. Clear that key to
start over.

- The account is Priya Sharma, phone 9123456780, partner Karan Sharma.
- Credit starts at ₹11,000 with a short history.
- Two gift cards already sent, one claimed and one delivered.
- `reg_us`: Nikhil Sharma set up a registry for Priya and Karan. Unclaimed, so
  the claim flow is one tap away from `/registry`.
- `reg_mine`: Priya set one up for Ishaan and Tara, kept as a surprise, so the
  Reveal control is live.

Codes that work in **Add a gift card**:

- `GS-4KX2-9PLM` with PIN `4821`, ₹11,000 from Meera Nair. Any other PIN counts
  down the five attempts, then locks the code for a day.
- `GS-7TQ1-2MNB` with PIN `1109` is already claimed, so it shows that message.

Every one time password in the prototype is `1234`.

## Things worth clicking

- **Role switch on a registry page.** The pill in the top right flips between
  organiser, couple, contributor and public link. Individual amounts only show
  to the first two.
- **A gift card link.** The sent screen has copy buttons for the link, the code
  and the PIN. Pasting the link into **Add a gift card** works too.
- **The claim page has an App / Web toggle.** The web view is what someone
  without the app lands on: the whole card first, install underneath.
- **Failed payments.** Both payment sheets have a quiet link that shows the
  failure state.
- **Duplicate registries.** Setting one up for 9900112233 warns that Ishaan and
  Tara already have one.

## Decisions taken in the build

These went past what the PRDs said, and are worth checking before it ships.

- **The beneficiary number cannot be edited.** The PRD allowed the organiser to
  change it while unclaimed, which contradicted the rule that they can never
  redirect the pool. Support handles a wrong number.
- **An unclaimed pool lapses after a year.** Held, then gone, no refunds. Note
  this differs from credit in a wallet, which never expires.
- **No cap on a single contribution**, only the ₹5,00,000 registry total.
- **Credit is shared with a linked partner**, so a gift meant for a couple is
  usable by both.
- **A couple can decline a registry** set up in their name. It stops taking
  gifts and support contacts the people who gave.
- **Contributors can leave their name off.** Their gift still counts towards the
  total and shows as "Someone".
- **Email is an optional second delivery channel**, alongside WhatsApp and SMS.
- **A gift card is not sent unless the buyer asks for it.** By default the link
  comes to the buyer, who passes it on. See `README-gift-cards.md`.
- **Topping up your own credit** is in the wallet. Neither PRD covered it, and
  it is a bigger legal question than a gift card, so it needs its own check.
