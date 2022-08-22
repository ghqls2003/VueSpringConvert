<template>
  <div>
		<!-- 지도 -->
    <div id="app">
      <div id="mapContainer" ref="map"></div>
    </div>
    <!-- container start -->
    <div>
      <div style="z-index: auto; overflow-y: hidden;">
        <!-- 현재시간 -->
        <div class="timeSatel">
          <div id="time" ref="time" class="timeBox">{{ timeStamp }}</div>
          <!--  지도설정 -->
          <div class="legend set">
            <div class="legendCon">
              <div id="legendset" class="legendSet mapImg">
                <ul >
                  <li id="satelliteMap" class="satellite">
                    <a href="javascript:void(0)" id="satel" ref="satelliteMap" @click="satel($event)"></a>
                    <p>구글</p>
                  </li>
                  <li id="arcgisSatel" class="satellite">
                    <a href="javascript:void(0)" id="arcgis" ref="arcgisSatel" @click="arcgis($event)"></a>
                    <p>Arcgis</p>
                  </li>
                  <li id="haearuem" class="satellite">
                    <a href="javascript:void(0)" id="hae" ref="haearuem" @click="hae($event)"></a>
                    <p>해아름</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <!--  지도설정 end-->
        </div>
      </div>
    </div>
  </div>
</template>

  <script type="text/javascsript" src="http://www.khoa.go.kr/oceanmap/js/gis/OtmsApi.js"></script>
  <script type="text/javascsript" src="http://www.khoa.go.kr/oceanmap/BASEMAP/otmsBasemapApi.do?ServiceKey=E40074679680B2EC8501F6D35"></script>
<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet/dist/leaflet-src.js'
import '@/assets/css/common.css'
import '@/assets/css/default.css'
import '@/assets/css/nodeLink.css'

export default {
  name: 'MarineMap',
  components: {
  },
  data: () =>({
    map: null,
    tiles: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ minZoom: 8, maxZoom: 18}),  // leaflet 원본
    latlng: L.latLng(36.176267, 127.276912),
    timeStamp: '',  // 실시간
    ck: '',  // 이벤트 주입 확인
    haearuem: 'E40074679680B2EC8501F6D35',
    servieUrl: 'localhost:8080',
    haeUrl: 'http://www.khoa.go.kr/oceanmap/BASEMAP_3857/otmsBasemapApi.do?ServiceKey=E40074679680B2EC8501F6D35'
  }),
  created() {
    setInterval(this.nowTime, 1000);
  },
  mounted() {
    this.map = L.map('mapContainer', { center: this.latlng, zoom: 7, layers: [this.tiles]})
    L.control.scale({maxWidth: 200, imperial: false, position: 'bottomleft'}).addTo(this.map);
  },
  beforeDestroy() {
    if (this.map) {
      this.map.remove()
      this.listText = '';
    }
  },
  methods: {
    // 현재시간
		nowTime() {
			const today = new Date();
      const year = today.getFullYear();
      const month = this.leftPad(today.getMonth()+1);
      const day = this.leftPad(today.getDate());
      const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      const dateTime = '기준 : '+ year+ '-'+ month +'-'+ day +' '+ time;
      this.timeStamp = dateTime;
		},
    // 현재시간 월, 일 0처리
    leftPad(value) {
      if (value >= 10) {
        return value;
      }
      return '0'+value;
    },
    // 구글위성
		satel(event) {
			this.ck = event.target.classList.contains('on');
			if (this.ck) {
				event.target.classList.remove('on');
        this.map.removeLayer(this.tiles);
        this.tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ minZoom: 8, maxZoom: 18})  // leaflet 원본
        this.map.addLayer(this.tiles);
			} else {
        this.$refs.arcgisSatel.classList.remove('on')
        this.$refs.haearuem.classList.remove('on')
        event.target.classList.add('on');
        this.map.removeLayer(this.tiles);
        this.tiles = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', { minZoom: 8, maxZoom: 18, subdomains:['mt0','mt1','mt2','mt3']})
        this.map.addLayer(this.tiles);
			}
		},
    // arcgis위성
		arcgis(event) {
      this.ck = event.target.classList.contains('on');
			if (this.ck) {
        event.target.classList.remove('on');
        this.map.removeLayer(this.tiles);
        this.tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ minZoom: 8, maxZoom: 18})  // leaflet 원본
        this.map.addLayer(this.tiles);
			} else {
        this.$refs.satelliteMap.classList.remove('on')
        this.$refs.haearuem.classList.remove('on')
        event.target.classList.add('on');
        this.map.removeLayer(this.tiles);
        this.tiles = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { minZoom: 8, maxZoom: 18})
        this.map.addLayer(this.tiles);
			}
		},
    // haearuem
		hae(event) {
      this.ck = event.target.classList.contains('on');
			if (this.ck) {
        event.target.classList.remove('on');
        this.map.removeLayer(this.tiles);
        this.tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ minZoom: 8, maxZoom: 18})  // leaflet 원본
        this.map.addLayer(this.tiles);
			} else {
        this.$refs.satelliteMap.classList.remove('on')
        this.$refs.arcgisSatel.classList.remove('on')
        event.target.classList.add('on');
        this.map.removeLayer(this.tiles);
        this.tiles = L.tileLayer('http://www.khoa.go.kr/oceanmap/otmsWmsApi.do?ServiceKey=E40074679680B2EC8501F6D35')
        this.map.addLayer(this.tiles);
			}
		},
  }
}
</script>