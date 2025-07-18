// Enhanced Route Planner with interactive features
let map;
let directionsService;
let directionsRenderer;
let userLocation = null;
let fishingZones = [];
let markers = [];

// Initialize the map with more features
function initMap() {
    // Create map with default view (Kerala coast)
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: { lat: 8.5241, lng: 76.9366 },
        mapTypeId: 'hybrid',
        styles: [
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#0077b6" }]
            }
        ]
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
        polylineOptions: {
            strokeColor: "#0077b6",
            strokeOpacity: 0.8,
            strokeWeight: 4
        }
    });

    // Try to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                addUserMarker();
                map.setCenter(userLocation);
                map.setZoom(13);
            },
            (error) => {
                console.error("Geolocation error:", error);
                // Use default location if geolocation fails
                userLocation = { lat: 8.5241, lng: 76.9366 };
                addUserMarker();
            }
        );
    } else {
        // Browser doesn't support Geolocation
        userLocation = { lat: 8.5241, lng: 76.9366 };
        addUserMarker();
    }

    // Load fishing zones from backend
    loadFishingZones();

    // Set up event listeners
    document.getElementById('calculate-route').addEventListener('click', calculateRoute);
    document.getElementById('save-route').addEventListener('click', saveRoute);
}

// Add user marker with custom icon
function addUserMarker() {
    const userMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "Your Location",
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: new google.maps.Size(40, 40)
        }
    });
    
    // Add info window
    const infoWindow = new google.maps.InfoWindow({
        content: "<strong>Your Location</strong>"
    });
    
    userMarker.addListener("click", () => {
        infoWindow.open(map, userMarker);
    });
}

// Load fishing zones with more details
async function loadFishingZones() {
    try {
        // In a real app, this would fetch from your backend
        // const response = await fetch('http://localhost:5000/api/fishing/zones');
        // fishingZones = await response.json();
        
        // Mock data for demonstration
        fishingZones = [
            {
                id: 1,
                name: "Zone A - High Tuna",
                location: { lat: 8.5245, lng: 76.9400 },
                density: "High",
                fishTypes: ["Tuna", "Mackerel"],
                depth: "30-50m",
                weatherRisk: "Low",
                score: 92
            },
            {
                id: 2,
                name: "Zone B - Sardine Hotspot",
                location: { lat: 8.5260, lng: 76.9450 },
                density: "Medium",
                fishTypes: ["Sardine", "Anchovy"],
                depth: "20-40m",
                weatherRisk: "Medium",
                score: 78
            },
            {
                id: 3,
                name: "Zone C - Deep Water",
                location: { lat: 8.5300, lng: 76.9350 },
                density: "Low",
                fishTypes: ["Grouper", "Snapper"],
                depth: "50-80m",
                weatherRisk: "High",
                score: 65
            }
        ];

        // Populate destination dropdown
        const destinationSelect = document.getElementById('destination');
        fishingZones.forEach(zone => {
            const option = document.createElement('option');
            option.value = zone.id;
            option.textContent = zone.name;
            destinationSelect.appendChild(option);
        });

        // Add zone markers to map
        addZoneMarkers();
    } catch (error) {
        console.error("Error loading fishing zones:", error);
    }
}

// Add markers for fishing zones with custom styling
function addZoneMarkers() {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    fishingZones.forEach(zone => {
        // Custom icon based on fish density
        let iconUrl;
        if (zone.density === "High") {
            iconUrl = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
        } else if (zone.density === "Medium") {
            iconUrl = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
        } else {
            iconUrl = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
        }

        const marker = new google.maps.Marker({
            position: zone.location,
            map: map,
            title: zone.name,
            icon: {
                url: iconUrl,
                scaledSize: new google.maps.Size(32, 32)
            }
        });

        // Create info window content
        const content = `
            <div style="min-width:200px">
                <h3 style="margin:5px 0;color:#0077b6">${zone.name}</h3>
                <div><strong>Fish Density:</strong> ${zone.density}</div>
                <div><strong>Fish Types:</strong> ${zone.fishTypes.join(", ")}</div>
                <div><strong>Depth:</strong> ${zone.depth}</div>
                <div><strong>Weather Risk:</strong> ${zone.weatherRisk}</div>
                <div><strong>Score:</strong> ${zone.score}/100</div>
                <button onclick="calculateRouteToZone(${zone.id})" 
                    style="margin-top:8px;padding:5px 10px;background:#0077b6;color:white;border:none;border-radius:4px;cursor:pointer">
                    Navigate Here
                </button>
            </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
            content: content
        });

        marker.addListener("click", () => {
            infoWindow.open(map, marker);
        });

        markers.push(marker);
    });
}

// Calculate route based on user selections
function calculateRoute() {
    const startPoint = document.getElementById('start-point').value;
    const destinationId = document.getElementById('destination').value;
    const routeType = document.getElementById('route-type').value;
    
    if (!destinationId) {
        alert("Please select a destination zone");
        return;
    }

    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'block';

    // Find selected zone
    const destinationZone = fishingZones.find(zone => zone.id === parseInt(destinationId));
    
    if (!destinationZone) {
        loadingElement.style.display = 'none';
        alert("Invalid destination selected");
        return;
    }

    // Determine start point
    let start;
    if (startPoint === "current") {
        if (!userLocation) {
            alert("Could not determine your current location. Using default start point.");
            start = { lat: 8.5241, lng: 76.9366 };
        } else {
            start = userLocation;
        }
    } else {
        // In a real app, this would be the nearest harbor coordinates
        start = { lat: 8.4800, lng: 76.9200 };
    }

    // Set up route request
    const request = {
        origin: start,
        destination: destinationZone.location,
        travelMode: "DRIVING",
        provideRouteAlternatives: true
    };

    // Add waypoints or optimize based on route type
    if (routeType === "safest") {
        // Add waypoints to avoid risky areas
        request.waypoints = [
            { location: { lat: 8.5100, lng: 76.9300 } }, // Safe passage point
            { location: { lat: 8.5200, lng: 76.9350 } }  // Another safe point
        ];
    } else if (routeType === "most_fish") {
        // Add waypoints through high density areas
        const highDensityZones = fishingZones.filter(z => z.density === "High");
        if (highDensityZones.length > 0) {
            request.waypoints = highDensityZones
                .filter(z => z.id !== destinationZone.id)
                .map(z => ({ location: z.location }));
        }
    }

    // Calculate route
    directionsService.route(request, (response, status) => {
        loadingElement.style.display = 'none';
        
        if (status === "OK") {
            directionsRenderer.setDirections(response);
            
            // Display route info
            const route = response.routes[0];
            updateRouteInfo(route, destinationZone);
            
            // Add weather and fish info
            updateAdditionalInfo(destinationZone);
        } else {
            alert("Route calculation failed: " + status);
        }
    });
}

// Update route information panel
function updateRouteInfo(route, destinationZone) {
    // Get distance and duration
    let distance = 0;
    let duration = 0;
    
    route.legs.forEach(leg => {
        distance += leg.distance.value;
        duration += leg.duration.value;
    });
    
    // Convert to readable format
    const distanceKm = (distance / 1000).toFixed(1);
    const durationHours = Math.floor(duration / 3600);
    const durationMinutes = Math.floor((duration % 3600) / 60);
    
    // Estimate fuel (very rough estimate: 1 liter per 3 km for a fishing boat)
    const fuelEstimate = (distanceKm / 3).toFixed(1);
    
    // Update UI
    document.getElementById('distance').textContent = `${distanceKm} km`;
    document.getElementById('duration').textContent = 
        `${durationHours > 0 ? durationHours + 'h ' : ''}${durationMinutes}m`;
    document.getElementById('fuel').textContent = `${fuelEstimate} liters`;
    document.getElementById('density').textContent = destinationZone.density;
}

// Update weather and other additional info
async function updateAdditionalInfo(destinationZone) {
    try {
        // In a real app, this would fetch from your weather API
        // const weather = await fetchWeatherForLocation(destinationZone.location);
        
        // Mock weather data
        const weather = {
            condition: "Partly Cloudy",
            windSpeed: "12 km/h",
            waveHeight: "1.2 m"
        };
        
        document.getElementById('weather').textContent = 
            `${weather.condition}, Wind: ${weather.windSpeed}, Waves: ${weather.waveHeight}`;
    } catch (error) {
        console.error("Error fetching weather:", error);
        document.getElementById('weather').textContent = "Weather data unavailable";
    }
}

// Save route to favorites
function saveRoute() {
    const destinationId = document.getElementById('destination').value;
    if (!destinationId) {
        alert("No route to save. Please calculate a route first.");
        return;
    }
    
    const destinationZone = fishingZones.find(zone => zone.id === parseInt(destinationId));
    if (!destinationZone) return;
    
    // In a real app, this would save to backend/local storage
    alert(`Route to ${destinationZone.name} saved to favorites!`);
    
    // You would typically have a favorites system here
}

// Global function to calculate route to specific zone
window.calculateRouteToZone = function(zoneId) {
    document.getElementById('destination').value = zoneId;
    calculateRoute();
};