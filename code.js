// Make sure Javascript file is linked to HTML
console.log('hello')

// Creating the map object:
const myMap = { // Must be empty arrays & objects to put data into.
    coordinates: [],
    businesses: [],
    map: {},
    markers: {},

    // Create Map:
    buildMap() {
        this.map = L.map('mapContainer', { // Grabs the div id of "mapContainer" from HTML.
        center: this.coordinates,
        zoom: 12,
        });

        // Add Tiles: (from Leaflet documentation)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: '12',
        }).addTo(this.map)

        // Add geolocation marker
        const marker = L.marker(this.coordinates)
        marker.addTo(this.map).bindPopup('<p1><b>This is your location</b></p>').openPopup();
    },

    // Add business markers:
    addMarkers() {
		for (var i = 0; i < this.businesses.length; i++) {
		this.markers = L.marker([
			this.businesses[i].latitude,
			this.businesses[i].longitude,
		])
			.bindPopup(`<p1>${this.businesses[i].name}</p1>`)
			.addTo(this.map)
		}
	},
}


// Load map correctly: (event handler)
window.onload = async () => {
	const coords = await getCoords()
	console.log(coords)
	myMap.coordinates = coords
	myMap.buildMap()
}

// Get user location:
async function getCoords() {
    position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
    return [position.coords.latitude, position.coords.longitude]
}


// Get the five nearest businesses according to form options from foursquare:
async function getFourSquare(business) { // Started with async function with business as the parameter.
const options = { // Got this from foursquare documentation.
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: 'fsq3phrRnXAO/3bb9fuLL2SkcC6Heo2OS6ldeg209Tz1NmQ='
    }
  };
  let limit = 5 // only want to show 5 businesses at a time.
  let latitude = myMap.coordinates[0]
  let longitude = myMap.coordinates[1]
  let response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${latitude}%2C${longitude}`, options) // make response a variable for await fetch url. (using temporary link to work, from CORS, might have to change later...)
  let result = await response.text() 
  let parsedData = JSON.parse(result)
  let businesses = parsedData.results
  return businesses
}

// Process foursquare array:
function processBusinesses(data) {
    let businesses = data.map((element) => {
        let location = {
            name: element.name,
            latitude: element.geocodes.main.latitude,
            longitude: element.geocodes.main.longitude
        };
        return location
    });
    return businesses
}


// Business submit button: (event handler)
document.getElementById('submit').addEventListener('click', async (event) => {
	event.preventDefault()
	let business = document.getElementById('dropDown').value
    let data = await getFourSquare(business)
    myMap.businesses = processBusinesses(data)
    myMap.addMarkers()
	console.log(business)
});