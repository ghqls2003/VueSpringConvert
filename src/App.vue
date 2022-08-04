<template>
  <v-app>
    <v-app-bar
      app
      color="green"
      dark
    >
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />
        Create<br>By Ryong
      </div>

      <v-spacer/>
      
      <router-link to="/" class="rlink">
        <v-btn class="vbtn" color="lime lighten-4">
          Home
        </v-btn>
      </router-link>
      
      <router-link to="/trtystat" class="rlink">
        <v-btn class="vbtn" color="lime lighten-4">
          운송유형통계
        </v-btn>
      </router-link>
      
      <router-link to="/nodelink" class="rlink">
        <v-btn class="vbtn" color="lime lighten-4">
          노드링크조회
        </v-btn>
      </router-link>

      <router-link to="/colorpicker" class="rlink">
        <v-btn class="vbtn" color="lime lighten-4">
          컬러픽커
        </v-btn>
      </router-link>

      <v-spacer/>

    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  components: {
  },

  data: () => ({
    //
  }),
};
</script>

<style scoped>
.vbtn {
  padding: 5px 10px;
  color: black;
  font-size: 15px;
  font-weight: bold;
}
.rlink {
  margin: 10px;
}
</style>