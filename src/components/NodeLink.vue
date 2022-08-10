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
              <div id="legendset" class="legendSet">
                <ul >
                  <li id="satelliteMap" class="satellite" @click="satelliteMap($event)">
                    <a href="javascript:void(0)" id="satel"></a>
                    <p>위성지도</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <!--  지도설정 end-->
        </div>
        <!-- 창 보이기/숨기기 -->
        <v-btn small elevation="10" class="show" color="primary" @click="hidden = !hidden">
          {{ hidden ? '창 펼치기' : '창 숨기기' }}
        </v-btn>
        <!-- 실시간 이동차량 -->
        <div class="mpop03" ref="opac" v-show="!hidden">
          <div class="mpopHeader">
            <div class="mform">
              <v-flex xs12>
                <p style="text-align:center; margin-bottom:0px; font-weight:bold;">투명도 조절</p>
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
              <v-btn-toggle color="primary" mandatory>
                <v-btn style="width:130px; font-size:15px; font-weight:bold;" id="totalSearch" ref="totalSearch" @click="totalSearch()">도로 종합 검색</v-btn>
                <v-btn style="width:130px; font-size:15px; font-weight:bold;" id="detailSearch" ref="detailSearch" @click="detailSearch()">도로 상세 검색</v-btn>
              </v-btn-toggle>
              <v-card>
                <v-container fluid>
                  <v-row v-if="searchCk == 1" align="center">
                    <v-col cols="12" sm="12">
                      <v-select id="roadTy" ref="roadTy"
                        v-model="roadTyResult"
                        :items="roadTyList"
                        item-text="name"
                        item-value="value"
                        chips
                        label="도로유형"
                        outlined
                        clearable
                        hide-details
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="12">
                      <v-select id="roadGrad" ref="roadGrad"
                        v-model="roadGradResult"
                        :items="roadGradList"
                        item-text="name"
                        item-value="value"
                        chips
                        label="도로등급"
                        outlined
                        clearable
                        hide-details
                      ></v-select>
                    </v-col>
                  </v-row>
                  <v-row v-if="searchCk == 0" align="center">
                    <div @keydown.enter="search()" class="inpSearch ent1" style="overflow: hidden; margin-bottom: 5px;">
                      <input type="text" class="inp k-input forinput" id="dstrctCd" ref="dstrctCd" placeholder="권역코드" />
                      <input type="text" class="inp k-input forinput" id="deptCd" ref="deptCd" placeholder="관리기관코드" />
                      <input type="text" class="inp k-input forinput" id="linkId" ref="linkId" placeholder="링크ID" />
                      <v-col>
                        <v-autocomplete id="roadNm" ref="roadNm" name="roadNm"
                          v-model="roadNmvalue"
                          :items="roadNmitems"
                          dense
                          filled
                          label="도로명 자동완성"
                          clearable
                          hide-details
                          background-color="white"
                        ></v-autocomplete>
                      </v-col>
                    </div>
                  </v-row>
                </v-container>  
              </v-card>
              <v-btn color="primary" large href="#" @click="search()" style="top: 8px; width:100%;">검색</v-btn>
              <div style="position: relative; top:10px; text-align:center;">
                <br>
                <span class="spanCnt" style="margin-right:15px;">조회건수</span>
                <input type="text" disabled id="roadCnt" class="spanCnt" style="width:55px" v-model="this.roadCnt"/>
                <span class="spanCnt">건</span>
              </div>  
            </div>	
          </div>
          <div class="mpopCont">
            <div class="mContForm">
              <div class="scrolls" id="carLists" ref="carLists" v-html="listText"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
// import { LMap, LTileLayer } from 'vue2-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet/dist/leaflet-src.js'
import '@/assets/css/common.css'
import '@/assets/css/default.css'
import '@/assets/css/nodeLink.css'

export default {
  name: 'LeafletView',
  components: {
    // LMap,
    // LTileLayer,
  },
  data: () =>({
    map: null,
    tiles: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 8,
      maxZoom: 18
    }),
    latlng: L.latLng(36.176267, 126.976912),
    timeStamp: '',
    hidden: false,
    slider: {
      val: 100, color: 'lime darken-4'
    },
    searchCk: 1,
    roadTyResult: '',
    roadTyList: [
      { name: '일반도로', value: '000' },
      { name: '고가차도', value: '001' },
      { name: '지하차도', value: '002' },
      { name: '교량', value: '003' },
      { name: '터널', value: '004' }
    ],
    roadGradResult: '',
    roadGradList: [
      { name: '고속국도', value: '101' },
      { name: '도시고속국도', value: '102' },
      { name: '일반국도', value: '103' },
      { name: '특별/광역시도', value: '104' },
      { name: '국가지원지방도', value: '105' },
      { name: '지방도', value: '106' },
      { name: '시/군도' ,value: '107' },
    ],
    roadNmitems: [],
    roadNmvalue: [],
    nodeLinkLayer: [],
    roadCnt: '',
    roadTy: '',
    roadGrad: '',
    dstrctCd: '',
    deptCd: '',
    roadNm: '',
    linkId: '',
    listText: '',
  }),
  created() {
    setInterval(this.nowTime, 1000);
  },
  mounted() {
    this.map = L.map('mapContainer', { center: this.latlng, zoom: 7, layers: [this.tiles]})
    this.getRoadData();
  },
  updated() {
    // 투명 슬라이더
    this.$refs.opac.style.opacity= this.slider.val/100;
  },
  methods: {
    totalSearch() {
      this.searchCk = 1;
    },
    detailSearch() {
      this.searchCk = 0;
    },
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
    //위성지도 버튼 클릭 시
		satelliteMap(event) {
			var ck = event.target.classList.contains('on');
			if (ck) {
				event.target.classList.remove('on');
				// this.switchHMTSTileLayer('기본지도');
			} else {
				event.target.classList.add('on');
				// this.switchHMTSTileLayer('위성지도');
			}
		},
    // // 위성지도 전환
    // switchHMTSTileLayer(layerKey) {
    //   console.log('들어옴')
    //   if (layerKey == '기본지도') {
    //     console.log('기본작동1')
    //     if (!LTileLayer.contains(this.bsUrl)) {
    //       LTileLayer.addLayer(this.bsUrl);
    //     }
    //     if (LTileLayer.contains(this.satelUrl)) {
    //       LTileLayer.removeLayer(this.satelUrl);
    //     }
    //       console.log('중간')
    //   } else if (layerKey == '위성지도') {
    //     console.log('위성작동1')
    //     if (LTileLayer.contains(this.bsUrl)) {
    //           LTileLayer.removeLayer(this.bsUrl);
    //       }
    //     if (!LTileLayer.contains(this.satelUrl)) {
    //       LTileLayer.addLayer(this.satelUrl);
    //     }
    //   }
    // },
    // 도로명 리스트
    getRoadData() {
      axios.get('/admin/bm/roadList')
      .then(response => {
        const data = response.data
        const roadNmList = [];
        for(var i=0; i<data.data.length; i++){
          roadNmList.push(data.data[i].roadNm)
        }
        this.roadNmitems = roadNmList
        this.roadNmvalue = ''
      })
      .catch(error => {
        console.log(error);
      });
    },
    // 검색
    search() {
			// 검색 조건
      // 종합 검색
      if(this.searchCk == 1){
        const ty = this.$refs.roadTy.value;
        const grad = this.$refs.roadGrad.value;
        if(ty == "" && grad == "" || ty != "" && grad == "" || ty == "" && grad != "" || ty == null && grad == null || ty != null && grad == null || ty == null && grad != null) {
          alert("도로유형과 도로등급을 같이 선택해 주시기 바랍니다.");
          return;
        }
        // 도로유형 '000', '003'에 대한 검색 제약
        if(ty == "000" || ty == "003"){
          alert("도로유형 '일반도로'와 '교량'은 데이터가 너무 많아 도로 상세 검색을 이용 바랍니다.");
            return;
        }
      }
      // 상세 검색
      if(this.searchCk == 0){
        const dstrct = this.$refs.dstrctCd.value;
        const dept = this.$refs.deptCd.value;
        const road = this.$refs.roadNm.value;
        const link = this.$refs.linkId.value;
        if(dstrct == "" && dept == "" && road == "" && link == "" || dstrct == "" && dept == "" && road == null && link == "") {
          alert("최소한 한가지 항목은 선택하거나 입력하셔야 합니다.");
          return;
        }
        // 권역코드 제약
        if(dstrct != "" && dept == "" && road == "" && link == ""){
          alert("권역코드는 다른 항목과 같이 검색해주시기 바랍니다.");
          return;
        }
      }

      // 기존 nodeLinkLayer 제거
			if(this.nodeLinkLayer){
				this.map.removeLayer(this.nodeLinkLayer);
			}
       // 기존 list 제거
			this.listText = '';

      if(this.searchCk == 1){
        this.roadTy = this.$refs.roadTy.value;
        this.roadGrad = this.$refs.roadGrad.value;
        this.dstrctCd = '';
        this.deptCd = '';
        this.roadNm = '';
        this.linkId = '';
      } else if(this.searchCk == 0){
        this.roadTy = '';
        this.roadGrad = '';
        this.dstrctCd = this.$refs.dstrctCd.value;
        this.deptCd = this.$refs.deptCd.value;
        this.roadNm = this.$refs.roadNm.value;
        this.linkId = this.$refs.linkId.value;
      }

      axios.get('/admin/bm/vueRcordSearch', {
        data: {},
        params: {
          roadTy : this.roadTy,
          roadGrad : this.roadGrad,
          dstrctCd : this.dstrctCd,
          deptCd : this.deptCd,
          roadNm : this.roadNm,
          linkId : this.linkId
        }
      })
      .then(response => {
        if(response != null){
          const data = response.data;

          this.nodeLinkLayer = L.geoJSON(data, {
            style: function() {
              return {
                weight: 7,
								opacity: 2,
								color: "red",
								dashArray:"3",
								fillOpacity:0.7
							};
						},
						onEachFeature: function(feature, layer){
              layer.bindTooltip("<div class=\"tooltipbox2 type01\"><h2>" + feature.properties.roadNm + "</h2><p>권역코드(" 
							+ feature.properties.dstrctCd + ")</p><p>링크ID("+ feature.properties.linkId +")</p><p>차로수("
							+ feature.properties.cartrkCo +")</p><p>도로번호("+ feature.properties.roadNo +")</p><p>도로등급("
							+ feature.properties.roadGrad +")</p><p>도로유형("+ feature.properties.roadTy +")</p><p>최고제한속도("
							+ feature.properties.topLmttSpd +")</p><p>통과제한차량("+ feature.properties.pasageLmttVhcle +")</p><p>통과제한하중("
							+ feature.properties.pasageLmttLd +")</p><p>통과제한높이("+ feature.properties.pasageLmttHg +")</p></div>", { closeOnClick: false, autoClose: false, autoPan: false });
						}
					}).addTo(this.map);

          const roadCnt = data.features.length;
					this.roadCnt = roadCnt // 총운행건수
					if (this.roadCnt == 0) {
            this.listText = "<div>검색 결과가 없습니다.</div>";
					} else {
            var listItem = [];
						for(var i=0; i<data.features.length; i++){
               const rs = "<div class='result list' value1="+data.features[i].geometry.coordinates[0][1]+" value2="
                +data.features[i].geometry.coordinates[0][0]+"><p>"+data.features[i].properties.rr+":"+data.features[i].properties.roadNm+"</p><p>"
                +data.features[i].properties.deptNm+"</p><p>링크ID : "+data.features[i].properties.linkId+"</p></div>";
              listItem.push(rs);
            }
            this.listText = listItem;
					}
        }else{
          alert("검색결과가 없습니다.");
        }
      })
      .catch(error => {
        console.log(error);
      });
		}
  }
}


  //   var geometry1 = ''; // 선택된 좌표x
  //   var geometry2 = ''; // 선택된 좌표y

  //           // 리스트 클릭시 지도 이동
	// 		$(document).on("click", ".list", function(){
                
	// 			geometry1 = $(this).attr("value1");
	// 			geometry2 = $(this).attr("value2");
	// 				var moveMap = new tsmap.latLng(geometry1, geometry2);
	// 				console.log(geometry1, geometry2);
	// 				map.setView(moveMap, 16);
	// 	    });
</script>
