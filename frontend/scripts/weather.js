async function getWeather() {
  const location = document.getElementById("locationInput").value;
  const apiKey = "YOUR_OPENWEATHERMAP_API_KEY";

  if (!location) return alert("Please enter a location!");

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod !== 200) {
      document.getElementById("weatherDisplay").innerText = "Location not found!";
      return;
    }

    const { main, wind, weather, name } = data;

    document.getElementById("weatherDisplay").innerHTML = `
      <strong>${name}</strong><br/>
      🌡️ Temp: ${main.temp}°C<br/>
      💧 Humidity: ${main.humidity}%<br/>
      💨 Wind: ${wind.speed} m/s<br/>
      ☁️ Condition: ${weather[0].description}
    `;
  } catch (err) {
    console.error(err);
    alert("Error fetching weather data.");
  }
}
