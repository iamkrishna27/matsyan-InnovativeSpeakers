const API_BASE = 'http://localhost:5000';

export async function sendEmergencyAlert(lat, lng, message) {
  const response = await fetch(`${API_BASE}/api/emergency`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: lat, longitude: lng, message })
  });
  return response.json();
}

export async function getWeather(lat, lng) {
  const response = await fetch(`${API_BASE}/api/weather?lat=${lat}&lng=${lng}`);
  return response.json();
}