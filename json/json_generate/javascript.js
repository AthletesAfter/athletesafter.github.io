/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
// @ts-nocheck TODO remove when fixed
let ticker = {
	prev: Date.now(),
  delta: () => {
  	return ret = Date.now() - ticker.prev;
  },
  update: () => {
  	ticker.prev = Date.now();
  },
  prevWait: 500,
  waitTime: () => {
  	if(ticker.delta() > ticker.prevWait) {
    	ticker.update();
    	return 500;
    }
    else{
    	ticker.prevWait += 500;
      return ticker.prevWait;
    }
  }
}
const tickerWait = () => new Promise(r => setTimeout(r, ticker.waitTime()));
const wait = ms => new Promise(r => setTimeout(r, ms));
const geocodeSchool = (geocoder, school, retryCount) => {
	console.log(`Geocoding school rc${retryCount}`, school["School"]);
  return retryCount < 0 ?
    Promise.resolve({
      ...school,
      'loc': null
    }) : geocodeAddr(geocoder, school['City and State']).then(
    loc => ({
      ...school,
      'loc': loc.lat() + ',' + loc.lng()
    })
  )
  .catch(e => e.code == "OVER_QUERY_LIMIT" ?
    tickerWait().then(() => geocodeSchool(geocoder, school, retryCount - 1)) :
    ({
      ...school,
      'loc': null
    })
  );
}
  

function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 2,
    center: {
      lat: 40.731,
      lng: -73.997
    },
  });
  const geocoder = new google.maps.Geocoder();
  const infowindow = new google.maps.InfoWindow();

  document.getElementById("submit").addEventListener("click", () => {
    geocodeLatLng(geocoder, map, infowindow);
  });

  window.d1 = null;

  fetch('https://athletesafter.github.io/json/d3.json')
    .then(response => response.json())
    .then(data => Promise.all(
    	data.map(
    		(school, idx) => tickerWait().then(() => geocodeSchool(geocoder, school, 5))
      )
  	))
    .then(x => console.log(JSON.stringify(x)));
}

function geocodeAddr(geocoder, addr) {
	/* console.log("GEOCODERADDR:", geocoder) */;
  return geocoder.geocode({
      address: addr
    })
    .then((response) => {
      if (response.results[0]) {
        return response.results[0].geometry.location;
      } else {
        throw new Error("No results for geocode of " + addr);
      }
    })
}


function geocodeLatLng(geocoder, map, infowindow) {
  const input = document.getElementById("addr").value;

  geocoder
    .geocode({
      address: input
    })
    .then((response) => {
      if (response.results[0]) {
        map.setZoom(11);

        const marker = new google.maps.Marker({
          position: response.results[0].geometry.location,
          map: map,
        });

        infowindow.setContent(response.results[0].formatted_address);
        infowindow.open(map, marker);
      } else {
        window.alert("No results found");
      }
    })
    .catch((e) => window.alert("Geocoder failed due to: " + e));
}

window.initMap = initMap;
