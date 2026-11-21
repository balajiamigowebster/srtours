#!/bin/bash
mkdir -p client/public/images && cd client/public/images
B=https://srtours.net/wp-content/uploads/2026/01
curl -s -o hero.jpeg $B/WhatsApp-Image-2026-01-07-at-1.56.50-PM.jpeg
curl -s -o logo.jpg $B/9884050506-3.jpg
curl -s -o about.png $B/swe-pics1-10.png
curl -s -o t1.jpg $B/Barbados.jpg
curl -s -o t2.jpg $B/Puerto-Escondido-Oaxaca-Mexico-_-Best-Beaches-Hotels-Things-to-Do.jpg
curl -s -o t3.jpg $B/download-10-576x1024.jpg
curl -s -o g1.jpeg $B/WhatsApp-Image-2026-01-12-at-10.31.06-AM.jpeg
curl -s -o g2.jpeg $B/WhatsApp-Image-2026-01-12-at-10.31.05-AM.jpeg
curl -s -o g3.jpeg $B/WhatsApp-Image-2026-01-12-at-10.31.05-AM-1.jpeg
ls -la
