<template>
  <div>
    {{description}}
  </div>
</template>

<script>
import MapService from '../MapService.js'

export default {
  name: 'InfoPage',
  data() {
    return {
      description: ''
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
      this.description = response.properties.description
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