<template>
  <v-container>
    {{marker.properties.description}} {{marker.properties.floor}}F {{gender}} | Rating: {{rating.toFixed(2)}}
  </v-container>
</template>

<script>
import MapService from '../MapService.js'

export default {
  name: 'InfoPage',
  data() {
    return {
      marker: null,
      rating: 0,
      gender: null
    }
  },
  mounted() {
    this.getMarker()
  },
  methods: {
    async getMarker() {
      const response = await MapService.getMarker({
        id: this.$route.params.id
      })
      this.marker = response
      this.gender = this.getGender(this.marker.properties.gender)
      this.rating = this.calculateRating(this.marker.properties.rating)
    },
    calculateRating(ratings) {
      var n = ratings.length
      return ratings.reduce( (m,n) => m+n )/n
    },
    getGender(gender) {
      if (gender === 'm') {
        return 'Male'
      } else if (gender === 'f') {
        return 'Female'
      } else {
        return 'Unisex'
      }
    }
  }
}
</script>

<style scoped>
html,body {
  margin: 0;
  padding: 0;
}
</style>