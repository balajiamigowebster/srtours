module.exports = {
  phone: ['9884300373', '9884050506'],
  menu: [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about-us' },
    {
      label: 'Package',
      to: '/packages',
      children: [
        {
          label: 'Temple tours',
          to: '/temple-tours',
          children: [
            'Kanchipuram tours', 'Tirupati tours', 'Tirupati dharsan', 'Vellore tours',
            'Thiruvannamalai tours', 'South india temple tour', 'Sabarimalai dharsan',
            'Kumbakonam temple tour', 'Arupadai veedu', 'Thirunallur temple tour',
            'Rahu kethu temple tour', 'Kasi tour packages',
          ],
        },
        {
          label: 'Leisure tours',
          to: '/leisure-tours',
          children: [
            'SRtours', 'Mahabalipuram tours', 'Pondicherry tours', 'Kodaikanal tours',
            'Kodaikanal Homestay package', 'Kodaikanal Honeymoon package', 'Ooty tour',
            'Yercaud tour', 'Wayanad tours', 'Munnar tour', 'Yelagiri tour',
            'Athirapally tour packages', 'Valparai tour',
          ],
        },
      ],
    },
    { label: 'Vehicle', to: '/vehicle' },
    { label: 'Gallery', to: '/tourdaily-destinations' },
    { label: 'Contact', to: '/contact' },
    { label: 'Tariff', to: '/tariff' },
    { label: 'Blogs', to: '/blogs' },
  ],
  features: [
    'Reliable & Timely Service: Punctual pickups and drop-offs, every time.',
    'Comfortable Vehicles: Clean, well-maintained, and air-conditioned fleet.',
    'Experienced Drivers: Friendly, professional drivers who prioritize your safety.',
    'Affordable Pricing: Competitive rates with no hidden charges.',
  ],
  whyUs: [
    { title: 'Travel without worry', text: 'We handle every step - planning, coordination and support - so you can travel peacefully knowing everything is perfectly arranged and cared for.' },
    { title: 'Comfort every mile', text: 'Experience smooth rides, quiet cabins and cool interiors that transform long drives into soothing moments of calm and complete relaxation.' },
    { title: 'Trust that lasts', text: 'Every interaction builds confidence - from transparent communication to reliable services, we earn your trust mile after mile, trip after trip.' },
  ],
  keyFeatures: [
    { title: 'Complete Travel Solutions', text: 'From rentals and tours to comfortable stays, everything is thoughtfully organized under one roof for a seamless, worry-free travel experience you can trust.' },
    { title: 'Reliable Team', text: 'Our skilled drivers and coordinators ensure punctual, safe and pleasant journeys, delivering service built on care, consistency and genuine hospitality every single time.' },
    { title: 'Flexible Options', text: 'Choose your routes, vehicles and schedules. We tailor every detail around your travel style, timing and comfort for a truly personalized journey.' },
  ],
  packages: [
    { id: 'mahabalipuram-tours', title: 'Mahabalipuram', image: '/images/t1.jpg', category: 'Temple Tour', text: 'Get awed by the magnificence of the Pallava legacy and the UNESCO World Heritage monuments in Mahabalipuram. Take advantage of the relaxing atmosphere of Mudaliarkuppam and engage in water sports to unwind and rekindle your enthusiasm.' },
    { id: 'south-india-temple-tour', title: 'Rameshwaram', image: '/images/t2.jpg', category: 'Temple Tour', text: 'With timeless, legendary temples surrounded by the spiritual aura of ancient shrines and serene shores, our 3-day Rameshwaram-Thiruchendur tour offers a soothing spiritual getaway.' },
    { id: 'tirupati-tours', title: 'Tirupati', image: '/images/t3.jpg', category: 'Temple Tour', text: 'With our daily Tirupati tour packages from Chennai, embark on a visit to one of the most venerated temples and experience its divine wonder.' },
  ],
  gallery: ['/images/g1.jpeg', '/images/g2.jpeg', '/images/g3.jpeg', '/images/t1.jpg', '/images/t2.jpg', '/images/t3.jpg'],
  vehicles: [
    { name: 'Sedan (Dzire / Etios)', seats: '4 + 1', note: 'AC, ideal for couples and small families' },
    { name: 'Innova / Ertiga', seats: '6 - 7', note: 'AC, ideal for family and temple trips' },
    { name: 'Tempo Traveller', seats: '12 - 17', note: 'AC, ideal for groups' },
    { name: 'Mini Bus', seats: '20 - 30', note: 'AC / Non-AC, ideal for large groups' },
  ],
  tariff: [
    { vehicle: 'Sedan', perKm: 'Contact us', minimum: 'Contact us' },
    { vehicle: 'Innova / Ertiga', perKm: 'Contact us', minimum: 'Contact us' },
    { vehicle: 'Tempo Traveller', perKm: 'Contact us', minimum: 'Contact us' },
    { vehicle: 'Mini Bus', perKm: 'Contact us', minimum: 'Contact us' },
  ],
  blogs: [
    { id: 1, title: 'Best time to visit Tirupati from Chennai', excerpt: 'Plan your darshan with our quick guide to timings, crowds and travel tips.' },
    { id: 2, title: 'Top 5 weekend getaways near Chennai', excerpt: 'Mahabalipuram, Pondicherry, Yelagiri and more - easy escapes by road.' },
    { id: 3, title: 'Navagraha temple tour: a practical itinerary', excerpt: 'Cover the Kumbakonam temples comfortably with the right route and vehicle.' },
  ],
};
