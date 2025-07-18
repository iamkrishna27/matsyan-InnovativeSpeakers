// public/scripts/map.js

// Initialize the Leaflet map
const map = L.map('map').setView([10.0, 76.5], 10);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© SmartNavFish'
}).addTo(map);

// Marker for user location
let userMarker;

// Locate button functionality
document.getElementById('locateBtn')?.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup("📍 You are here")
      .openPopup();
    map.setView([latitude, longitude], 13);
  });
});

// Load and display fishing zones
async function loadFishingZones() {
  try {
    const response = await fetch('http://localhost:5000/api/fishing/zones');
    const zones = await response.json();

    zones.forEach(zone => {
      console.log("Zone coordinates for", zone.name, ":", zone.coordinates);

      // Determine zone color based on fish density
      const avgDensity = Object.values(zone.fishDensity).reduce((a, b) => a + b, 0) / Object.keys(zone.fishDensity).length;
      let color = avgDensity >= 0.6 ? 'green' : avgDensity >= 0.3 ? 'orange' : 'red';

      // Filter out zones with less than 3 coordinates
      if (zone.coordinates.length >= 3) {
        const polygon = L.polygon(zone.coordinates, {
          color,
          fillOpacity: 0.4
        }).addTo(map);

        let fishInfo = "";
        for (const [fish, density] of Object.entries(zone.fishDensity)) {
          fishInfo += `${fish}: ${density * 100}%<br>`;
        }

        polygon.bindPopup(`
          <b>${zone.name}</b><br>
          <strong>Fish Density</strong><br>${fishInfo}
          <strong>Restrictions:</strong><br>${zone.restrictions.join(", ") || "None"}
        `);
      }
    });
  } catch (err) {
    console.error("Error loading zones:", err);
  }
}

loadFishingZones();