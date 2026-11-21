# SR Tours & Travels – Production Deployment

This package contains the compiled React frontend (`client/dist`) and the Node.js/Express backend (`server`).

## Quick Start (VPS / cPanel Node.js App / Render / Railway)

1. Extract `srtours-website-build.zip` on your server.
2. Install server dependencies:
   ```bash
   cd server
   npm install --omit=dev
   ```
3. (Optional – for live email delivery from the Contact form) Copy `server/.env.example` to `server/.env` and set your Gmail App Password / SMTP credentials:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=srtravelsrajesh@gmail.com
   SMTP_PASS=your-gmail-app-password
   MAIL_TO=srtravelsrajesh@gmail.com
   SITE_URL=https://srtours.net
   PORT=5050
   ```
4. Start the server:
   ```bash
   node server/index.js
   ```
   (Or run `npm start` from the project root, or use `pm2 start server/index.js --name srtours`.)

## SEO & Google Search Console
- Sitemap: `https://srtours.net/sitemap.xml` (46 URLs including all 11 area-wise blogs)
- Robots: `https://srtours.net/robots.txt`
