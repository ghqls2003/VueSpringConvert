<template>
  <div>
    <!-- 지도 -->
    <div id="app">
      <div id="mapContainer" ref="map"></div>
    </div>

  <div id="mainApp" class="container mapType" style="z-index:auto; overflow-y:hidden;"><!-- container start --> 
    <div id="map" class="map" style="width:100%; height:100%; align-content: center; z-index:0;"></div>
    <!-- 실시간 이동차량 -->
    <div class="mpop01">
      <div class="mpopHeader">
        <span id="btnTest">실시간 이동차량</span>
        <div class="btnAlim" id="btnAlim" @click="btnAlert()">
        </div>
        <a href="javascript:void(0)" id="btnFilter" class="btnFilter" ref="btnFilter" @click="btnFilter()"><img :src="filterImg" /></a>
      </div>
      <div class="mpopCont">
        <div class="form">
          <div class="inpSearch" style="overflow:hidden;">
            <input type="text" class="inp" id="detlSearch" placeholder="차량번호"/>
          </div>
        </div>
        <div class="scrolls" id="carLists">
          <dl>
            <dt id="abnormalSub">이상운행</dt>
            <dd>
              <ul id="accCarList" class="ac">
              </ul>
              <ul id="abnormalCarList">
              </ul>
            </dd>
            <dt id="normalSub">정상운행</dt>
            <dd>
              <ul id="normalCarList">
              </ul>
            </dd>
          </dl>
        </div>
      </div>
    </div>

    <!-- 차량정보 조회-->
    <div class="mpop02" id="filterPopup" ref="filterPopup" style="display:none;">
      <div class="mpopHeader">
        <span>입력하신 필터링 조건에 따라 차량 정보가 조회됩니다.</span> 
      </div>
      <div class="mpopCont">
        <div style="margin-left:25px;margin-top:5px;color:red;">사고 및 사고접수 차량은 필터조건에 관계없이 항상 표시됩니다.</div>
         <table class="wTable01" style="margin-top: 5px !important;">
          <tr>
            <th>운행 상태</th>
            <td>
              <div class="chkBox">
                <input type="checkbox" id="chkStatus01" onClick="statusTotal(this);" />
                <label for="chkStatus01">전체</label>
              </div>
              <div class="chkBox">
                <input type="checkbox" id="chkStatus03" onClick="status(this);" checked />
                <label for="chkStatus03">이상</label>
              </div>
              <div class="chkBox">
                <input type="checkbox" id="chkStatus04" onClick="status(this);" />
                <label for="chkStatus04">정상</label>
              </div>
            </td>
          </tr>
          <tr>
            <th>차량 상태</th>
            <td>	
              <div class="chkBox">
                <input type="checkbox" id="carState01"  name="carState01" checked onClick="carStateTotal(this);" />
                <label for="carState01">전체</label>
              </div>
              <div class="chkBox">
                <input type="checkbox" id="carState02"  name="carState02" onClick="carState(this);"/>
                <label for="carState02">Online</label>
              </div>
              <div class="chkBox">
                <input type="checkbox" id="carState03" name="carState03" onClick="carState(this);"/>
                <label for="carState03">Offline</label>
              </div>
            </td>
          </tr>
          <tr>
            <th>사전운송계획</th>
            <td>
              <div class="chkBox">
                <input type="checkbox" id="carPlan01"  name="carPlan01" checked onClick="carPlanTotal(this);"/>
                <label for="carPlan01">전체</label>
              </div>
              <div class="chkBox">
                <input type="checkbox" id="carPlan02"  name="carPlan02" onClick="carPlan(this);"/>
                <label for="carPlan02">등록</label>
              </div>
              <div class="chkBox">
                <input type="checkbox" id="carPlan03" name="carPlan03" onClick="carPlan(this);"/>
                <label for="carPlan03">미등록</label>
              </div>
            </td>
          </tr>
          <tr>
            <th>주무 부처</th>
            <td>
              <v-select id="org" ref="org" v-model="orgResult" :items="orgList" item-text="name" item-value="value" outlined hide-details hide-input></v-select>
            </td>
          </tr>
          <tr>
            <th>지역별</th>
            <td>
              <select class="select" name="area" id="area"></select>
            </td>
          </tr>
          <tr>
            <th>물질 조회</th>
            <td>
              <div class="inpSearch">
                <input type="text" class="inp01" id="matterName" style="width: calc( 90% )"/>
              </div>
            </td>
          </tr>
          <tr>
            <th>적재량</th>
            <td>
              <input type="text" class="inp01" id="quantityLow"  value="0" style='ime-mode:disabled;' numberOnly/>
              <span class="etxt">~</span>
              <input type="text" class="inp01" id="quantityHigh" value="9999" style='ime-mode:disabled;' numberOnly/>
              <span class="etxt">kg</span>
            </td>
          </tr>
         </table>

        <div class="pbtnBox">
          <a href="javascript:void(0)" class="btype01" id="filterReset">
            <img src="@/assets/ptsimages/ico/ico_refresh.png" />
            <span>초기화</span>
          </a>
        </div>

      </div>
    </div>
    
    <div class="mpStatusBox">
      <div class="todStatus">
        <dl>
          <dt>오늘</dt>
          <dd>
            <div class="item">
              <span class="t01">운송계획</span>
              <span class="t02"><strong id="todayCnt"></strong> 건</span>
            </div>
            <div class="item">
              <span class="t01">운송중</span>
              <span class="t02"><strong id="todayIng"></strong> 건</span>
            </div>
            <div class="item">
              <span class="t01">운송종료</span>
              <span class="t02"><strong id="todayEnd" ></strong> 건</span>
            </div>
          </dd>
        </dl>
      </div>

      <div class="tomStatus">
        <dl>
          <dt>내일</dt>
          <dd>
            <div class="item">
              <span class="t01">운송계획</span>
              <span class="t02"><strong id="tomorrowCnt"></strong> 건</span>
            </div> 
          </dd>
        </dl>
      </div> 
    </div>

    <!--  지도설정 start-->
    <div id="selectLegend" class="legend set" ref="selectLegend">
      <div class="legendTitle">
        <h1>지도설정 </h1>
      </div>
      <div class="legendCon">
        <div id="legendSet" class="legendSet">
          <ul style="padding-left:0px;">
            <li id="satelliteMap" @click="satelliteMap($event)">
              <a href="javascript:void(0)"></a>
              <p>위성지도</p>
            </li>
            <li id="waterSource" @click="getWaterSource($event)">
              <a href="javascript:void(0)"></a>
              <p>상수원<br/>보호구역</p>
            </li>
            <li id="trafficRestriction" @click="getTrafficRestriction($event)">
              <a href="javascript:void(0)"></a>
              <p>통행제한<br/>도로</p>
            </li>

            <li id="longTunnel" @click="longTunnel($event)">
              <a href="javascript:void(0)"></a>
              <p>장대터널</p>
            </li>
            <li id="corInstt" @click="corInstt($event)">
              <a href="javascript:void(0)"></a>
              <p>대응기관</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!--  지도설정 end-->

    <!--  사고신고 start-->
    <div class="accident" id="reportAccidentList" style="display: none">
      <div class="accidentTitle">
        <h1>사고접수</h1>
        <div class="tbox">
          <strong id="reportAccdintCnt">0</strong><span>건</span>
        </div>
      </div>
      <ul id="reportAcc">
      </ul>
    </div>
    <!--  사고신고 end-->
    
    <ul class="mpSideList">
      <li>
        <a href="javascript:void(0)" id="setMapBtn" class="setBtn" @click="setMapBtn($event)"></a>	<!--  0523 수정 -->
        <a href="javascript:void(0)" class="mapBtn" @click="mapBtn($event)"></a>	<!--  0523 수정 -->
        <a href="javascript:void(0)" id="allMsgBtn" class="allMsgBtn"></a>
      </li>
    </ul>
 
    <div class="mpZoominList">
      <a href="javascript:void(0)" class="btnPlus" id="zoomPlus" @click="zoomPlus()"><img src="@/assets/ptsimages/ico/ico_plus01.png" /></a>
      <a href="javascript:void(0)" class="btnMius" id="zoomMius" @click="zoomMinus()"><img src="@/assets/ptsimages/ico/ico_mius01.png" /></a>
    </div>

    <div class="mpBottomBox">
      <div class="box">
      <a href="javascrtip:void(0)" class="mpToggle on">&nbsp;</a>
      <div class="mpbHeader">
        <span class="tit"  style="line-height:30px;">
          <div style="line-height:20px; margin-top:12px;">운송등록번호: <span id="detlPlanNo"></span>
          </div>
          <div>이상운행유형: <span id="abnormalDetl"></span>
          </div>
        </span>
        <ul>
          <li id="trmnlNotice">단말기 알림</li>
          <li id="driverCall">운전자 통화</li>
          <li id="orgSpread">상황 전파</li>
          <li id="regitAccident">사고 전환</li>
          <li id="reportAccident">사고 신고</li>
          <li id="situationEnd">상황 종료</li>
        </ul>
      </div>
      <div class="mpbCont">
        <a href="javascript:void(0)" class="btnMpbLeft">이전</a>
        <div class="sortArea">
          <ul id="sortable" style="padding-left: 0px;">
            <li>
              <div class="mpbItem">
                <p class="t01">차량</p> 
                <ul>
                  <li><strong id="detl_car_reg_no"></strong></li>
                  <li>차종: <span id="detl_vhcty"></span></li>
                  <li><span id="detl_yridnw" style="margin-left:25px;"></span></li>
                  <li><span id="detl_brwdnm" style="margin-left:25px;"></span></li>
                  <li>소유: <span id="detl_cmpny_nm"></span></li>
                  <li>차대번호: <span id="detl_id"></span></li>
                </ul>
              </div> 
            </li>
            <li>
              <div class="mpbItem">
                <p class="t01">단말기</p>
                <ul>
                  <li>통신사 : <span id="detl_telecomCd"></span></li>
                  <li>단말 번호 : <span id="detl_trmnlNo"></span></li>
                  <li>제조사: <span id="detl_makr"></span></li>
                  <li>모델명: <span id="detl_model"></span></li> 
                </ul>
                <p class="t02" id="detl_onoff">엔진상태: </p>
              </div>
            </li>
            <li>
              <div class="mpbItem">
                <p class="t01">실시간 위치</p>
                <ul>
                  <li>시간: <span id="detl_occ_dt"></span></li>
                  <li>주소: <span id="detl_addr"></span></li>
                  <li>위도: <span id="detl_y"></span></li>
                  <li>경도: <span id="detl_x"></span></li>
                  <li>속도: <span id="detl_speed"></span></li>
                </ul>
              </div>
            </li>
            <li>
              <div class="mpbPlanBox">
                <div class="mh">
                  <span>(계획)운송물질</span>
                  <a href="javascript:void(0)" id="bangjaeBtn">방재정보조회</a> &nbsp;
                  <a href="javascript:void(0)" id="btnPlanHist">운송계획이력</a>
                </div>
                <table>
                  <colgroup>
                    <col width="15%" />
                    <col width="20%" />
                    <col width="20%" />
                    <col width="15%" />
                    <col width="15%" />
                    <col width="15%" />
                    <col width="15%" />
                  </colgroup>
                  <tr id="npbPB">
                    <th v-for="(npb,i) in npbList" :key="i">{{ npb }}</th>
                  </tr>
                </table>
                <div class="scrolls">
                  <table id="matterTb"> 
                  </table>
                </div>
              </div>
            </li>
            <li>
              <div class="mpbItem">
                <p class="t01">(계획) 운송사업자</p>
                <ul>
                  <li><strong><span id="detl_cmpy"></span></strong></li>
                  <li>담당자 : <span id="detl_chgrNm"></span></li>
                  <li>담당자 연락처  :  <span id="detl_bsnmTel"></span></li>
                  <li>사업자 주소  :  <span id="detl_bsnmAddr"></span></li>
                </ul> 
              </div>
            </li>
            <li>
              <div class="mpbPlanBox" style="width:370px;">
                <div class="mh">
                  <span>(계획)운전자</span>
                </div>
                <table>
                  <colgroup>
                    <col width="40" />
                    <col width="100" />
                    <col width="100" />
                  </colgroup>
                  <tr>
                    <th>순번</th>
                    <th>이름</th>
                    <th>휴대전화</th>
                  </tr>
                </table>
                <div class="scrolls">
                  <table id="driverInfoTb">
                  </table>
                </div>
              </div>
            </li>
            <li>
              <div class="mpbItem">
                <p class="t01">(계획) 운송일시</p>
                <ul>
                  <li>출발 : <span id="detl_startDt"></span></li>
                  <li>도착 : <span id="detl_arvlDt"></span></li> 
                </ul> 
              </div>
            </li>
            <li>
              <div class="mpbItem"> 
                <div class="mh">
                  <span>(계획) 운송경로</span>
                  <a href="javascript:void(0)" id="routeBtn">경로보기</a>
                </div>
                <ul>
                  <li>출발 : <span id="detl_startNm"></span></li>
                  <li><span id="detl_startAddr"></span></li> 
                  <li>도착 : <span id="detl_dstnNm"></span> </li>
                  <li><span id="detl_dstnAddr"></span></li> 
                </ul> 
              </div>
            </li>
            <li>
              <div class="mpbItem">
                <p class="t01">경고 (이상알림)</p>
                <ul id="abnormalHisList" style="overflow-y:auto; height:60%;">
                </ul> 
              </div>
            </li>
          </ul>
        </div>
        <a href="javascript:void(0)" class="btnMpbRight">다음</a>
      </div>

      <!--  범례 start-->
      <div class="legend map" ref="legendMap">
        <div class="legendTitle">
          <ul>
            <li class="on tabBtn01">마커 </li>
          </ul>
        </div>
        
        <div class="legendCon h267">
          <div class="legendSet tab01">
            <h1>물질구분 </h1>
            <ul class="mt10" style="padding-left:0px;">
              <li v-for="(list, i) in mattdiv" :key="i">
                <img :src="list.srcUrl" alt=''/>
                <p>{{ list.p }}</p>
              </li>
            </ul>
            <h1 class="mt15">차량상태</h1>
            <ul class="mt10 justify" style="padding-left:0px;">
              <li v-for="(list, i) in cstat" :key="i">
                <img :src="list.srcUrl" alt=''/>
                <p>{{ list.p }}</p>
              </li>
            </ul>
          </div>
          <div class="legendSet tab02">
            <h1>인구밀도(명/km2)</h1>
            <ul>
              <li v-for="(list, i) in pdensity" :key="i">
                <img :src="list.srcUrl" alt=''/>
                <span>{{ list.sp }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!--  범례 end-->
      </div>
    </div>
    <div id="trmnlNoticePop"></div>     <!-- 단말메시지 전송 팝업 -->
    <div id="driverCallPop"></div>      <!-- 운전자 통화 팝업 -->>
    <div id="orgSpreadPop"></div>       <!-- 관계기관 전파 -->>
    <div id="situationEndPop"></div>    <!-- 상황종료 팝업 -->
    <div id="regitAccidentPop"></div>   <!-- 사고전환 팝업 -->
    <div id="reportAccidentPop"></div>  <!-- 사고신고 팝업 -->
    <div id="reportEndPop"></div>       <!-- 사고신고 해제 팝업 -->
    <div id="bangjaePop"></div>         <!-- 방재팝업 -->
    <div id="legendBtnPop"></div>       <!-- 범례 -->
    <div id="befPlanListPop"></div>     <!-- 이전운송계획 조회 -->
  </div><!-- container end -->

  <audio id="myAudio" src="@/assets/audio/siren_01.mp3"></audio>
  <div id="viewport"></div>


  </div>
</template>

<script>
import '@/assets/css/ptscommon.css'
import '@/assets/css/ptscustom.css'
import '@/assets/css/ptsdefault.css'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet/dist/leaflet-src.js'
import axios from 'axios'
import nvl from 'nvl'
import 'leaflet.markercluster/dist/leaflet.markercluster-src.js'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

export default {
  name:'RltmCntrl',
  components: {},
  data: () => ({
    map: null,
    tiles: L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{ minZoom: 8, maxZoom: 18, subdomains:['mt0','mt1','mt2','mt3']}),
    bsUrl: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    sateUrl: 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
    streetUrl: '',
    latlng: L.latLng(36.176267, 127.276912),
    npbList: [
      '물질구분', '물질명', 'CAS no', 'UN no', '용량', '함량(%)'
    ],
    mattdiv: [
      { srcUrl: require('@/assets/ptsimages/ico/ico_map_legend01.png'), p: '위험물'},
      { srcUrl: require('@/assets/ptsimages/ico/ico_map_legend02.png'), p: '유해화학물질'},
      { srcUrl: require('@/assets/ptsimages/ico/ico_map_legend03.png'), p: '고압가스'},
      { srcUrl: require('@/assets/ptsimages/ico/ico_map_legend04.png'), p: '지정폐기물'},
      { srcUrl: require('@/assets/ptsimages/ico/ico_map_legend05.png'), p: '없음'},
    ],
    cstat: [
      { srcUrl: require('@/assets/ptsimages/ico/ico_map_legend01.png'), p: '정상'},
      { srcUrl: require('@/assets/ptsimages/ico/ico_map_legend06.png'), p: '이상'},
      { srcUrl: require('@/assets/ptsimages/ico/ico_map_legend07.png'), p: '사고'},
    ],
    pdensity: [
      { srcUrl: require('@/assets/ptsimages/ico/ico_map_legend08.png'), sp: '5,000명 이상'},
      { srcUrl: require('@/assets/ptsimages/ico/ico_map_legend09.png'), sp: '1,000 ~ 5,000명'},
      { srcUrl: require('@/assets/ptsimages/ico/ico_map_legend10.png'), sp: '500 ~ 1,000명'},
      { srcUrl: require('@/assets/ptsimages/ico/ico_map_legend11.png'), sp: '200 ~ 500명'},
      { srcUrl: require('@/assets/ptsimages/ico/ico_map_legend12.png'), sp: '100 ~ 200명'},
      { srcUrl: require('@/assets/ptsimages/ico/ico_map_legend13.png'), sp: '100명 미만'},
    ],
    filterImg: require("@/assets/ptsimages/ico/ico_filter01.png"),
    filterImg2: require("@/assets/ptsimages/ico/ico_pageList01.png"),
    waterSourceLayer: [],  // 상수원 보호구역
    trRestrictLayer: [],  // 통행제한도로
    trRestRoadData: '',  // 통행제한도로 데이터
    trRestRdMinZoom: 10,  // 통행제한도로 표시 시작 레벨
    vlTunnelLayer: [],  // 장대터널
    vlTunnelData: '',  // 장대터널 데이터
    insttMarkers: L.layerGroup(),  // 대응기관 POI
    orgResult: {name: '전체', value: '00'},
    orgList: '',
  }),
  setup() {},
  created() {},
  mounted() {
    this.map = L.map('mapContainer', { center: this.latlng, zoom: 8, layers: [this.tiles]});
    L.control.scale().addTo(this.map);
    this.selectDgstOrgList();  // 주무부처 리스트 조회
  },
  unmounted() {},
  beforeDestroy() {
    if (this.map) {
      this.map.remove();
    }
  },
  methods: {
    getAuth () {
      var auth = "${auth}";
      return auth;
    },
    getLdong () {
      var ldong = "${ldong}";
      return ldong;
    },
    getAuth2() {
      var seLogin = "${sessionScope.userData.authorLv}";
      return seLogin;
    },
    // 필터 이벤트 팝업
    btnFilter() {
		if (this.$refs.filterPopup.style.display=="none") {
			this.$refs.filterPopup.style.display="block";
			this.filterImg = this.filterImg2;
		} else {
			this.$refs.filterPopup.style.display="none";
			this.filterImg = require("@/assets/ptsimages/ico/ico_filter01.png");
		}
    },
    // 지도설정 버튼 클릭
    setMapBtn(event) {
      var ck = event.target.classList.contains("on");
      if (ck) {
        this.$refs.selectLegend.classList.remove("on")
        event.target.classList.remove("on");
      } else {
        this.$refs.selectLegend.classList.add("on")
        event.target.classList.add("on");
      }
    },
    // 마커설명창
    mapBtn(event) {
      var ck = event.target.classList.contains("on");
      if (ck) {
        this.$refs.legendMap.classList.remove("on");
        event.target.classList.remove("on");
      } else {
        this.$refs.legendMap.classList.add("on");
        event.target.classList.add("on");
      }
    },
    // 위성지도 버튼 클릭 시
    satelliteMap(event) {
			var ck = event.target.classList.contains('on');
			if (ck) {
				event.target.classList.remove('on');
        if(this.tiles._url == this.sateUrl){
          this.map.removeLayer(this.tiles);
          // this.tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ minZoom: 8, maxZoom: 18})   leaflet 원본
          this.tiles = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{ minZoom: 8, maxZoom: 18, subdomains:['mt0','mt1','mt2','mt3']})
          this.map.addLayer(this.tiles);
        }
			} else {
        event.target.classList.add('on');
        if(this.tiles._url == this.bsUrl){
          this.map.removeLayer(this.tiles);
          this.tiles = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', { minZoom: 8, maxZoom: 18, subdomains:['mt0','mt1','mt2','mt3']})
          this.map.addLayer(this.tiles);
        }
			}
		},
    // 상수원보호구역 버튼 클릭 시
		getWaterSource(event) {
			var ck = event.target.classList.contains('on');
			if (ck) {
				event.target.classList.remove('on');
        // 기존 waterSourceLayer 제거
				this.map.removeLayer(this.waterSourceLayer);
			} else {
				event.target.classList.add('on');
				axios.get('/vc/selectLmttZone', {
          data: {},
        })
        .then(response => {
          if(response != null) {
            var data = response.data;
            this.waterSourceLayer = L.geoJSON(data, {
							style: function() {
								return {
									weight: 2,
									opacity: 1,
									color: "#FF5A5A",
									dashArray:"3",
									fillOpacity:0.7
								};
							},
							onEachFeature: function(feature, layer){
								layer.bindTooltip("<div class=\"tooltipbox2 type01\"><h4>"+ feature.properties.spotNm +"</h4>("+ feature.properties.clCdNm +")</div>", { closeOnClick: false, autoClose: false, autoPan: false });
							}
						}).addTo(this.map);
          }
        })
        .catch(error => {
          console.log(error);
        });
      }
		},
    // 통행제한도로 버튼 클릭 시
		getTrafficRestriction(event) {
			var ck = event.target.classList.contains('on');
			if (ck) {
				event.target.classList.remove('on');
				this.map.removeLayer(this.trRestrictLayer);
				this.trRestRoadData = null;
			} else {
				if (this.map.getZoom() < this.trRestRdMinZoom) {
					this.map.setZoom(this.trRestRdMinZoom);
				}
				event.target.classList.add('on');
				axios('/vc/selectLmttRoad', {
          data: {},
        })
        .then(response => {
          if(response != null) {
            var data = response.data;
            this.trRestRoadData = data;
            // 통행제한도로 표출
            if (this.trRestrictLayer != undefined) {
              this.map.removeLayer(this.trRestrictLayer);
            }
            // 폴리라인에 포함된 포인트 다 돌면서 화면 내에 포함된 점이 하나라도 있으면 그림. 
            if (this.map.getZoom() >= this.trRestRdMinZoom) {
              var east = this.map.getBounds().getEast();
              var west = this.map.getBounds().getWest();
              var north = this.map.getBounds().getNorth();
              var south = this.map.getBounds().getSouth();
              // 제한도로 레이어 초기화
              this.trRestrictLayer = L.geoJSON([], { 
                style: function() {
                  return {
                    weight: 5,
                    opacity: 0.7,
                    color: "#60C5F1",
                    dashArray:"5",
                    fillOpacity:0.5
                  };
                },
                onEachFeature: function(feature, layer) {
                  layer.bindTooltip("<div class=\"tooltipbox2 type01\"><h4>통행제한도로</h4><br />요일 : "+ feature.properties.day +"<br />대상 : 화물차<br />시간 : "+ feature.properties.time +"</div>", { closeOnClick: false, autoClose: false, autoPan: false	});
                }
              }).addTo(this.map);
              // 현재범위 내의 제한도로 표시
              this.trRestRoadData.features.forEach(function (item) {
                item.geometry.coordinates.forEach(function (coord) {
                  var x = coord[0]; 
                  var y = coord[1];
                
                  if (x > west && x < east) {
                    if (y > south && y < north) {
                      this.trRestrictLayer.addData(item);
                      return;
                    }
                  }
                });
              });
            }
          }
        })
        .catch(error => {
          console.log(error);
        });
			}
		},
    // 장대터널 버튼 클릭 시
    longTunnel(event) {
      var ck = event.target.classList.contains('on');
      if (ck) {
        event.target.classList.remove('on')
        this.map.removeLayer(this.vlTunnelLayer);
        this.vlTunnelData = null;
      } else {
        event.target.classList.add('on');
        axios('/vc/selectTunnel', {
          data: {}
        })
        .then(response => {
          if(response != null) {
            var data = response.data;
            this.vlTunnelData = data;
            this.vlTunnelLayer = L.geoJSON(data, {
              style: function() {
                return {
                  weight: 3,
                  opacity: 1,
                  color: '#A349A4',
                  dashArray: '5',
                  fillOpacity: 0.4
                };
              },
              onEachFeature: function(feature, layer) {
                layer.bindTooltip("<div class=\"tooltipbox2 type01\"><h4>"+ feature.properties.tunnelNm +" 터널</h4><br />노선 : "+ feature.properties.routeNm +"<br />총 연장 : "+ feature.properties.extn +"</div>", { closeOnClick: false, autoClose: false, autoPan: false });
              }
            }).addTo(this.map);
          }
        })
        .catch(error => {
          console.log(error);
        });
      }
    },
    // 대응기관 버튼 클릭 시
		corInstt(event) {
			var ck = event.target.classList.contains('on');
			if (ck) {
				event.target.classList.remove('on');
				this.map.removeLayer(this.insttMarkers);
			} else {
				event.target.classList.add('on');
				this.dispInsttPOI();
			}
		},
    // 방재기관 POI 표출
    dispInsttPOI() {
      axios('/vc/vueSelectInsttInfo', {
        data: {}
      })
      .then(response => {
        this.map.removeLayer(this.insttMarkers);
        if(response != null) {
          var data = response.data;
          console.log(data)
          var ipIcon = L.icon({  // 경찰서 마커
            iconUrl: require('@/assets/ptsimages/ico/ico_ip.png'),
            iconSize: [34, 34]
          });
          var ifIcon = L.icon({  // 소방서 마커
            iconUrl: require('@/assets/ptsimages/ico/ico_if.png'),
            iconSize: [34, 34]
          });
          if (data.length > 0)  {
            for (var i=0; i<data.length; i++) {
              var insttMaker = null;
              
              if (data[i].sclas == "경찰서") {
                insttMaker = L.marker(new L.latLng(data[i].yCrd, data[i].xCrd), {icon:ipIcon});
                insttMaker.bindTooltip("<div class=\"tooltipbox2 type02\"><h4>"+ data[i].spotNm +"</h4>연락처 : "+ nvl(data[i].telno) +"</div>", { closeOnClick: false, autoClose: false, autoPan: false });
              } else if (data[i].sclas == "소방서") {
                insttMaker = L.marker(new L.latLng(data[i].yCrd, data[i].xCrd), {icon:ifIcon});
                insttMaker.bindTooltip("<div class=\"tooltipbox2 type01\"><h4>"+ data[i].spotNm +"</h4>연락처 : "+ nvl(data[i].telno) +"</div>", { closeOnClick: false, autoClose: false, autoPan: false });
              }
              
              if (insttMaker != null) {
                insttMaker.addTo(this.insttMarkers);
              }
            }
            this.insttMarkers.addTo(this.map);
          }
        } else {
          alert("조회 결과가 없습니다.");
        }
      })
      .catch(error => {
        console.log(error);
      });   
    },
    // 주무부처 리스트 조회
    selectDgstOrgList() {
      axios.get('/cmmn/vueCommonCode', {
        data: {},
        params: {
          cdCl: "DGST_DIV_CD"
        }
      })
      .then(response => {
        if(response != null) {
          var data = response.data;
          console.log(data)
          var arr = [];
          var arrTotal = [];
          arr[0] = {name: "전체", value: "00"};
          arrTotal.push(arr[0]);
          for (var i=0; i<data.length; i++) {
            var item = data[i];
            arr[i+1]={name: item.cdDc, value: item.cdId};
            arrTotal.push(arr[i+1]);
          }
          this.orgList = arrTotal;
        }
      })
      .catch(error => {
        console.log(error);
      })
    },
    // 지도 줌 확대
    zoomPlus() {
      this.map.zoomIn(1);
    },
    // 지도 줌 축소
    zoomMinus() {
      this.map.zoomOut(1);
    },
  }
}
</script>

<style scoped>
  .tsmap-popup-tip-container{display:none;}
  .tsmap-popup-content-wrapper, .tsmap-popup-tip{background:none; box-shadow:none;}
  .tsmap-container a.tsmap-popup-close-button{display:none;}
  .tsmap-touch .tsmap-touch .tsmap-bar{display:none;}
  .wTable.t01 .k-dropdown.select{background:transparent;}
</style>