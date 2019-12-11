<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <h3>UHM Restrooms</h3>
      </div>

      <v-spacer class="d-flex d-sm-none"></v-spacer>
      <v-btn text color="primary">
        <router-link :to="{ name: 'MapComponent' }">
          <span class="nav_link" style="color: #fff;">Home</span>
        </router-link>
      </v-btn>
      <v-btn text color="primary">
        <router-link to="#">
          <span style="color: #fff;">About</span>
        </router-link>
      </v-btn>
    </v-app-bar>

    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>

export default {
  name: "App",

  data: () => ({
    //
  })
};
</script>
