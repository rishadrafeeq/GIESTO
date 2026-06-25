# GIESTO — Men's Fashion Shop Website

A modern online catalog for clothing stores. Customers browse products on the website and place orders on **WhatsApp** — no payment gateway, no complicated checkout.

**Live demo:** [https://giesto.vercel.app/](https://giesto.vercel.app/)  
**Admin panel:** [https://giesto.vercel.app/admin](https://giesto.vercel.app/admin)

---

## Who is this for?

This project is built for **small and medium clothing shops** that want:

- A professional website to show their products
- Size-wise stock tracking (S, M, L, XL, etc.)
- Easy ordering through WhatsApp (very common in India and many local markets)
- A simple admin panel — **no coding needed** to add products after setup

Perfect for men's wear, streetwear, formal wear, watches, sunglasses, and mixed fashion stores.

---

## What customers see (Shop website)

| Page | What it does |
|------|----------------|
| **Home** | Hero banner, shop by category, featured / new arrivals |
| **Shop** | All products with category filters (Formal, Casual, Sports, etc.) |
| **Product details** | Photo, price, sale price, description, size buttons with stock count |
| **Order on WhatsApp** | Customer picks a size → opens WhatsApp with a ready-made order message |
| **Lookbook** | Instagram-style inspiration page linked to your Instagram |

Customers do **not** pay online. They message the shop on WhatsApp to confirm and pay (UPI, cash, etc.) — the way many local clothing stores already work.

---

## What the shop owner gets (Admin panel)

Go to `/admin` and log in with your PIN.

### Products tab
- Add, edit, and remove products
- **Barcode scanner support** — plug in a USB barcode scanner; scan to fill product ID automatically
- Set name, category, price, sale price, description, photo
- Manage **sizes and stock** per product (e.g. M: 5, L: 3)
- Mark products as **featured** or **hidden**
- Search products by name or barcode
- Filter by category
- Dashboard stats: in stock, low stock, sold out, hidden items

### Categories tab
- Add new categories (Watches, Sunglasses, Kids wear, etc.)
- **Edit category cover photos** — the images shown on the homepage
- Remove empty categories

### Tools menu
- **Download backup** — save all products and categories as a JSON file
- **Import backup** — restore from a saved file
- **Reset to defaults** — go back to the original sample catalog

---

## Why this is useful for a normal clothing shop

1. **Low cost** — Hosted free on Vercel; no monthly e-commerce platform fees for basic use.
2. **No payment setup** — Skip Razorpay/Stripe if you already sell on WhatsApp.
3. **Real stock control** — Show "3 left" on size M so customers know what is available.
4. **Works on phone** — Customers can browse and order from mobile.
5. **Staff-friendly admin** — Add a new shirt in minutes: scan barcode, set price, upload photo, set sizes.
6. **Professional look** — Clean, modern design that builds trust with customers.

---

## Tech stack

| Technology | Purpose |
|------------|---------|
| [React](https://react.dev/) | User interface |
| [Vite](https://vitejs.dev/) | Fast development and build |
| [React Router](https://reactrouter.com/) | Pages: Home, Shop, Lookbook, Admin |
| [Vercel](https://vercel.com/) | Free hosting and automatic deploys from GitHub |

No database server in the current version — product data is stored in the browser (`localStorage`) for quick setup. Use **Download backup** in admin to save your catalog.

---

## Project structure (simple overview)

```
GIESTO/
├── src/
│   ├── pages/           # Home, Shop, Lookbook, Admin
│   ├── components/      # Header, product cards, admin forms
│   ├── context/         # Products & categories state
│   ├── config/          # Shop name, WhatsApp number, admin PIN
│   └── utils/           # WhatsApp links, product helpers
├── public/
│   ├── assets/          # Default product & category images
│   └── data/            # Default products.json
├── vercel.json          # Makes /admin and other routes work on Vercel
└── package.json
```

---

## Setup (for developers)

### Requirements
- [Node.js](https://nodejs.org/) 18 or newer
- npm

### Run locally

```bash
git clone https://github.com/rishadrafeeq/GIESTO.git
cd GIESTO
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) for the shop and [http://localhost:5173/admin](http://localhost:5173/admin) for admin.

### Build for production

```bash
npm run build
npm run preview
```

---

## Deploy to Vercel (free)

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo.
3. Vercel detects Vite automatically. Click **Deploy**.
4. Every `git push` to `main` redeploys the site automatically.

The included `vercel.json` file ensures routes like `/admin` and `/shop` work when opened directly in the browser.

---

## Shop settings (edit before going live)

Open `src/config/siteConfig.js`:

| Setting | What to change |
|---------|----------------|
| `shopName` | Your store name |
| `whatsappNumber` | Your WhatsApp number with country code (e.g. `919876543210`) |
| `adminPin` | Secret PIN for `/admin` — **change this!** |
| `instagramUrl` | Your Instagram profile link |
| `categories` | Default categories and cover images |

---

## How to use the admin panel (step by step)

1. Open `yoursite.com/admin`
2. Enter your admin PIN
3. **Add a product:** Products → Add product → scan or type barcode → fill details → save
4. **Change a category image:** Categories → Edit cover → upload photo → Save cover
5. **Backup your work:** Tools → Download backup (do this regularly!)
6. To update the live site for all visitors, replace `public/data/products.json` with your backup and redeploy (or import backup in admin on each device)

---

## Admin PIN (default)

The default PIN is set in `siteConfig.js`. Change it before sharing the admin URL with staff.

Admin is **not linked** from the public website footer — only people who know `/admin` can open the login page.

---

## Features at a glance

- Homepage with hero slider and category grid
- Full shop page with category tabs
- Product modal with size selection and stock display
- WhatsApp order message with product name, size, and price
- PIN-protected admin dashboard
- Barcode scanner ready (USB scanners)
- Category cover photo editor
- Sale pricing and featured products
- Low stock and sold-out tracking
- JSON backup import / export
- Mobile-responsive layout
- Instagram lookbook page

---

## Limitations (good to know)

- Product changes in admin are saved in the **browser** on that device until you export/import backup or update `products.json` in the repo.
- There is no online payment — orders go to WhatsApp only.
- No user accounts or order history database yet (can be added in a future version).

---

## License

Private project — contact the owner for reuse permissions.

---

## Author

**Rishad Rafeeq**  
GitHub: [rishadrafeeq/GIESTO](https://github.com/rishadrafeeq/GIESTO)

Built as a practical catalog + WhatsApp ordering solution for local fashion retailers.
