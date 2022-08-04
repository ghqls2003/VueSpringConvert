<template>
  <div>
    <div class="container">
      <ul class="location">
        <li>포털관리</li>
        <li>OJT전용</li>
      </ul> 
    </div>
		<!-- 지도 -->
    <div id="app">
      <l-map id="mapContainer" ref="map"
        :zoom='7'
        :minZoom='8'
        :maxZoom='18'
        :center="[36.176267, 126.976912]"
      >
        <l-tile-layer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
      </l-map>
    </div>
    <!-- container start -->
    <div>
      <div style="z-index: auto; overflow-y: hidden;">
        <!-- 현재시간 -->
        <div class="timeSatel">
          <div id="time" class="timeBox">기준 : 0000-00-00 00:00:00</div>
          <!--  지도설정 -->
          <div class="legend set">
            <div class="legendCon">
              <div id="legendset" class="legendSet">
                <ul >
                  <li id="satelliteMap" class="satellite">
                    <a href="javascript:void(0)"></a>
                    <p>위성지도</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <!--  지도설정 end-->
        </div>
        <!-- 실시간 이동차량 -->
        <div class="mpop03" ref="opac">
          <div class="mpopHeader">
            <div class="mform">
              <v-flex xs12>
                <p style="text-align:center; margin-bottom:0px;">투명도 조절</p>
                <v-slider
                  v-model="slider.val"
                  :color="slider.color"
                  :min="40"
                  :max="100"
                  thumb-label
                  value="opacity"
                  hide-details
                ></v-slider>
              </v-flex>
            <v-btn ref="totalSearch" @click="totalSearch($event)" class="btnon">
              도로 종합 검색
            </v-btn>
            <v-btn ref="detailSearch" @click="detailSearch($event)">
              도로 상세 검색
            </v-btn>
              <v-card>
                <v-container fluid>
                  <v-row v-if="searchCk == 1" align="center">
                    <v-col cols="12" sm="12">
                      <v-select
                        v-model="value"
                        :items="items"
                        chips
                        label="roadTy"
                        multiple
                        outlined
                        hide-details
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="12">
                      <v-select
                        v-model="value2"
                        :items="items2"
                        chips
                        label="roadGrad"
                        multiple
                        outlined
                        hide-details
                      ></v-select>
                    </v-col>
                  </v-row>
                  <v-row v-if="searchCk == 0" align="center">
                    <div class="inpSearch ent1" style="overflow: hidden; margin-bottom: 5px;">
                      <span tabindex="-1" role="presentation" class="k-widget k-autocomplete k-header inp k-autocomplete-clearable k-state-default">
                        <input type="text" class="inp k-input" id="dstrctCd" placeholder="권역코드" />
                      </span>
                      <span tabindex="-1" role="presentation" class="k-widget k-autocomplete k-header inp k-autocomplete-clearable k-state-default">
                        <input type="text" class="inp k-input" id="deptCd" placeholder="관리기관코드" />
                      </span>
                      <span tabindex="-1" role="presentation" class="k-widget k-autocomplete k-header inp k-autocomplete-clearable k-state-default">
                        <input type="text" class="inp" id="roadNm" name="roadNm" placeholder="도로명"/>
                      </span>
                      <span tabindex="-1" role="presentation" class="k-widget k-autocomplete k-header inp k-autocomplete-clearable k-state-default">
                        <input type="text" class="inp k-input" id="linkId" placeholder="링크ID" />
                      </span>
                      <a href="javascript:$opratRcord.event.search();" class="k-icon k-i-search" style="top: 8px;">&nbsp;</a>
                    </div>
                  </v-row>
                </v-container>  
              </v-card>
              <div style="display: flex; align-items: center;">
                <table class="wTable" style="height: 100%; width: 100%; border-top: 0px;">
                  <colgroup>
                    <col width="50%">
                    <col width="30%">
                    <col width="20%">
                  </colgroup>
                  <tbody>
                    <tr>
                      <th style="border: 0px; background: #f2f2f2;">조회건수</th>
                      <td id="roadCnt" style="text-align: right; border: 0px; background: #f2f2f2;">0</td>
                      <td style="border: 0px; background: #f2f2f2;">건</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>	
          </div>
          <div class="mpopCont">
            <div class="mContForm">
              <div class="scrolls" id="carLists"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { LMap, LTileLayer } from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet/dist/leaflet-src.js'
import '@/assets/css/common.css'
import '@/assets/css/default.css'
import '@/assets/css/nodeLink.css'

export default {
  name: 'LeafletView',
  components: {
    LMap,
    LTileLayer,
  },
  data: () =>({
    slider: {
      val: 100, color: 'lime darken-4'
    },
    searchCk: 1,
    items: ['foo', 'bar', 'fizz', 'buzz'],
    value: ['foo', 'bar', 'fizz', 'buzz'],
    items2: ['foo', 'bar', 'fizz', 'buzz'],
    value2: ['foo', 'bar', 'fizz', 'buzz'],
  }),
  mounted() {
  },
  updated() {
    // 투명 슬라이더
    this.$refs.opac.style.opacity= this.slider.val/100;
  },
  methods: {
    totalSearch(event) {
      event.target.classList.add('btnon');
      this.$refs.detailSearch.classList.remove('btnon');
      // 여기에 css를 줄까???
      this.searchCk = 1;
    },
    detailSearch(event) {
      event.target.classList.add('btnon');
      this.$refs.totalSearch.classList.remove('btnon');
      this.searchCk = 0;
    },
    getData() {
      axios.get('/vc/selectRealTimeCarInfo')
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
    },
  }
}
</script>
