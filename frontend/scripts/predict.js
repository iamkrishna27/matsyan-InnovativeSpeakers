async function getPredictions() {
  const url = "http://localhost:5000/api/predict"; // Backend endpoint
  const list = document.getElementById("predictionList");
  list.innerHTML = "Loading...";

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data.predictions)) {
      list.innerHTML = "No prediction data found.";
      return;
    }

    list.innerHTML = "";
    data.predictions.forEach((zone, index) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <strong>Zone ${index + 1}:</strong> ${zone.location}<br/>
        🎯 Score: ${zone.score}<br/>
        🧠 Confidence: ${zone.confidence}%
      `;
      list.appendChild(item);
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = "Error fetching predictions.";
  }
}
