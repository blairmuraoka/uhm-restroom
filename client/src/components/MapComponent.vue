<template>
  <v-container class="map_content" fluid="true">
    <v-row class="map_content" justify="center">
      <v-col class="map_content" lg="9" md="9" sm="12" xs="12">
        <div id="map_wrapper">
          <!-- Filter Buttons -->
          <div class="filter_select">
            <v-combobox
              v-model="filterSelections.gender"
              :items="filterItems"
              label="Filters"
              chips
              clearable
              multiple
              solo
              v-on:click:append="drawerHandler"
              ref="filterDrawer"
              :menu-props="{ bottom: true, offsetY: true }"
            >
              <template v-slot:selection="{ attrs, item, select, selected }">
                <v-chip
                  v-bind="attrs"
                  :input-value="selected"
                  close
                  @click="select"
                  @click:close="remove(item)"
                >{{ item }}&nbsp;</v-chip>
              </template>
            </v-combobox>
          </div>

          <!-- <v-btn class="primary filter_button_grp">Test</v-btn> -->

          <!-- Map -->
          <gmap-map ref="mapRef" :center="center" :zoom="18" style="height: 100%">
            <gmap-marker
              :key="index"
              v-for="(m,index) in filtered"
              :animation="3"
              :position="m.position"
              :title="m.title"
              :icon="{ url: require(`../assets/${m.gender}.png`)}"
              @click="panToHelper(m.position.lat, m.position.lng);openInfoWindow(m)"
            ></gmap-marker>
            <gmap-marker
              :animation="3"
              :position="currentPlace"
              :icon="{ url: require('../assets/blue-dot.png')}"
            >{{ currentPlace }}</gmap-marker>
            <!-- InfoWindow -->
            <gmap-info-window
              :options="{maxWidth: 400, maxHeight: 300}"
              :position="infoWindow.position"
              :opened="infoWindow.open"
              @closeclick="infoWindow.open=false"
            >
              <!-- Restroom card -->
              <v-card class="elevation-16 mx-auto">
                <v-card-title primary-title>{{infoWindow.title}}</v-card-title>
                <v-card-subtitle class="justify-space-between">
                  {{infoWindow.floor}}F
                  {{infoWindow.gender}}
                  <v-icon small color="yellow darken-2">star</v-icon> ({{infoWindow.rating.toFixed(1)}})
                </v-card-subtitle>
                <v-card-text>
                  <a :href="'#/restroom/' + infoWindow.id">Restroom Page</a>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions class="pa-2">
                  <v-rating
                    v-model="rating"
                    color="yellow darken-3"
                    background-color="grey darken-1"
                    dense
                    half-increments
                    hover
                    size="18"
                  ></v-rating>
                  <span class="grey--text text--lighten-2 caption mr-2">({{ rating.toFixed(1) }})</span>
                  <v-spacer></v-spacer>
                  <v-btn @click="addRating" class="primary" text>Rate it!</v-btn>
                </v-card-actions>
              </v-card>
              <!-- End restroom card -->
            </gmap-info-window>
            <!-- End InfoWindow -->
          </gmap-map>
          <v-btn @click="geolocate" class="primary geolocate_button" text-color="primary">Geolocate</v-btn>
        </div>
      </v-col>
    </v-row>
    <v-row justify="center" class="footer_item">
      <span v-if="closestMarker.distance !== null">
        <span
          class="d-flex d-sm-none"
        >{{ closestMarker.text }} | {{ closestMarker.distance.toFixed(1) }} m</span>
        <span
          class="d-none d-sm-flex"
        >{{ closestMarker.text }} | {{ closestMarker.distance.toFixed(1) }} m</span>
      </span>
    </v-row>
  </v-container>
</template>

<script>
import MapService from "../MapService.js";

export default {
  name: "Maps",
  data() {
    return {
      center: { lat: 21.299569, lng: -157.820495 },
      locations: [],
      markers: [],
      places: [],
      currentPlace: null,
      closestMarker: {
        distance: null,
        text: ""
      },
      rating: 0,
      infoWindow: {
        position: { lat: 0, lng: 0 },
        open: false,
        title: "",
        rating: 0,
        template: "",
        gender: "",
        id: "",
        floor: 0
      },
      filterSelections: { gender: ["Male", "Female", "Unisex"] },
      filterItems: ["Male", "Female", "Unisex"]
    };
  },
  async mounted() {
    try {
      this.locations = await MapService.getMaps();
      this.generateMarkers();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  },
  computed: {
    filtered: function() {
      const options = {
        gender: this.filterSelections.gender.map(option =>
          option[0].toLowerCase()
        )
      };
      const filterKeys = Object.keys(options);

      return this.markers.filter(marker => {
        return filterKeys.every(key => {
          return options[key].includes(marker[key]);
        });
      });
    }
  },
  methods: {
    /* Translates information from API into a better defined structure*/
    generateMarkers() {
      for (let i = 0; i < this.locations.length; i++) {
        var coords = this.locations[i].geometry.coordinates;
        const marker = {
          lat: coords[1],
          lng: coords[0]
        };
        var ratings = this.locations[i].properties.rating;
        var rating = this.calculateNewRating(ratings);

        this.markers.push({
          id: this.locations[i]._id,
          title: this.locations[i].properties.description,
          floor: this.locations[i].properties.floor,
          gender: this.locations[i].properties.gender,
          ratings: this.locations[i].properties.rating,
          rating: rating,
          position: marker
        });
      }
    },
    /*
     * geolocate() : uses Google Maps JS API to watch the position of the device,
     * given the user has allowed permission for location services. After getting location,
     * it will calculate the distance to the closest restroom. (and name)
     */
    geolocate() {
      navigator.geolocation.getCurrentPosition(position => {
        this.panToHelper(position.coords.latitude, position.coords.longitude);
        this.setPlace({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        this.closestMarker = this.findNearestMarker({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    },
    /* Set the current location. Usage in geolocate() */
    setPlace(place) {
      this.currentPlace = place;
    },
    /*
     * openInfoWindow(marker) : function run upon click on marker,
     * this will bring up a small card with details of the marker.
     * Since there can only be one info window open at a time, I have set
     * infoWindow with values from the marker for html parsing.
     * This function does not have any functionality but rather helps format
     * the card displayed.
     */
    openInfoWindow(marker) {
      this.infoWindow.id = marker.id;
      this.infoWindow.title = marker.title;
      this.infoWindow.rating = marker.rating;
      this.rating = this.infoWindow.rating;
      this.infoWindow.floor = marker.floor;
      var gender;
      if (marker.gender == "m") {
        gender = "Male";
      } else if (marker.gender == "f") {
        gender = "Female";
      } else {
        gender = "Unisex";
      }
      this.infoWindow.gender = gender;
      this.infoWindow.template = `${marker.floor}F  ${gender} Rating: ${marker.rating}
        <a href="#/restroom/${marker.id}">Restroom Page</a>`;
      this.infoWindow.position.lat = marker.position.lat + 0.000095;
      this.infoWindow.position.lng = marker.position.lng;
      this.infoWindow.open = true;
    },
    /*
     * panToHelper(lat, lng) : recenters the map to the marker that is clicked.
     * This is different than setting a center in Google Maps API as this pans over to
     * the coordinates, rather than moving instantly there (no animation).
     */
    panToHelper(latitude, longitude) {
      this.$refs.mapRef.$mapPromise.then(map => {
        map.panTo({ lat: latitude, lng: longitude });
      });
    },
    /*
     * findNearestMarker(loc) : used when geolocating, this will
     * calculate the nearest marker to the user, and return the distance
     * and marker details. This function utilizes the haversine formula to calculate
     * distance between two lat/lng coordinate pairs, and goes thru the list of markers.
     */
    findNearestMarker(myLoc) {
      var R = 6371; // Radius of earth in km
      var lat = myLoc.lat;
      var lng = myLoc.lng;
      var distances = [];
      var closest = -1;
      for (var i = 0; i < this.filtered.length; i++) {
        var mlat = this.filtered[i].position.lat;
        var mlng = this.filtered[i].position.lng;
        var dLat = this.deg2rad(mlat - lat);
        var dLng = this.deg2rad(mlng - lng);
        var a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(this.deg2rad(lat)) *
            Math.cos(this.deg2rad(mlat)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        distances[i] = d;
        if (closest == -1 || d < distances[closest]) {
          closest = i;
        }
      }
      var closestMarker = this.filtered[closest];
      var gender;
      if (closestMarker.gender === "m") {
        gender = "Male";
      } else if (closestMarker.gender === "f") {
        gender = "Female";
      } else {
        gender = "Unisex";
      }
      var parsedText = `${closestMarker.title} ${closestMarker.floor}F ${gender}`;
      return { distance: distances[closest] * 1000, text: parsedText };
    },
    /*
     * addRating() : function that does the following:
     * calls updateRating (documented below)
     * updates the info window instance variables for updates (v-model)
     * calculates the new rating with calculateNewRating
     */
    addRating() {
      this.updateRating();
      for (var i = 0; i < this.markers.length; i++) {
        if (this.markers[i].id === this.infoWindow.id) {
          this.markers[i].ratings.push(this.rating);
          this.markers[i].rating = this.calculateNewRating(
            this.markers[i].ratings
          );
          this.infoWindow.rating = this.markers[i].rating;
        }
      }
    },
    /*
     * calculateNewRating(ratings) : takes an array and returns the average
     * after summing up all the values. Returns 0 if array is empty
     */
    calculateNewRating(ratings) {
      var n = ratings.length;
      if (n == 0) {
        return 0;
      } else {
        return (
          ratings.reduce(function(m, n) {
            return m + n;
          }, 0) / n
        );
      }
    },
    /*
     * updateRating() : makes an axios put call and sends this data to the backend
     * which will handle the updating of the database
     */
    async updateRating() {
      await MapService.updateRating({
        id: this.infoWindow.id,
        rating: this.rating
      });
    },
    /*
     * deg2rad(degree) : helper function converting degress to radians
     * used in Haversine formula
     */
    deg2rad(deg) {
      return deg * (Math.PI / 180);
    },
    
    remove(item) {
      this.filterSelections.gender.splice(
        this.filterSelections.gender.indexOf(item),
        1
      );
    },
    drawerHandler() {
      const drawer = this.$refs.filterDrawer;
      if (drawer.isMenuActive) {
        this.$refs.filterDrawer.isMenuActive = false;
        drawer.blur();
      } else {
        this.$refs.filterDrawer.isMenuActive = true;
        drawer.focus();
      }
    }
  }
};
</script>

<style scoped>
html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

.map_content {
  padding: 0;
  background-color: #e3e3e3;
}

#map_wrapper {
  position: relative;
  height: 80vh;
  margin: 0 auto;
}

.filter_select {
  width: 100%;
  position: absolute;
  z-index: 1;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
}

@media only screen and (min-width: 600px) {
  .filter_select {
    width: 60%;
    top: 1%;
  }
  #map_wrapper {
    position: relative;
    height: 90vh;
    margin: 0 auto;
  }
}

@media only screen and (min-width: 960px) {
  .filter_select {
    width: 50%;
    top: 1%;
  }
}

.geolocate_button {
  position: absolute;
  z-index: 1;
  margin-top: 1%;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  bottom: 5%;
}
</style>