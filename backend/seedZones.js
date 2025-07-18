const mongoose = require('mongoose');
require('dotenv').config();
const FishingZone = require('./models/FishingZone');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const zones = [
    {
      name: "Rich Zone Alpha",
      coordinates: [
        [10.15, 76.45],
        [10.25, 76.55],
        [10.15, 76.65]
      ],
      fishDensity: { tuna: 0.8, sardine: 0.4 },
      restrictions: ["No fishing on Sundays"]
    },
    {
      name: "Low Zone Beta",
      coordinates: [
        [9.95, 76.35],
        [10.05, 76.45],
        [9.95, 76.55]
      ],
      fishDensity: { tuna: 0.2, sardine: 0.1 },
      restrictions: []
    },
    {
      name: "Moderate Zone Gamma",
      coordinates: [
        [10.05, 76.60],
        [10.15, 76.70],
        [10.05, 76.80]
      ],
      fishDensity: { tuna: 0.5, sardine: 0.6 },
      restrictions: ["Catch and release only"]
    }
  ];

  await FishingZone.deleteMany({});
  await FishingZone.insertMany(zones);
  console.log('✅ Demo zones seeded');
  mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
