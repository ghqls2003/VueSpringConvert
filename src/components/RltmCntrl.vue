<template>
  <div>
    <!-- 지도 -->
    <div id="app">
      <div id="mapContainer" ref="map"></div>
    </div>

    <div id="mainApp" class="container mapType" style="z-index:auto; padding:0px; overflow-y:hidden;"><!-- container start --> 
      <div id="map" class="map" style="width:100%; height:100%; align-content: center; z-index:0;"></div>
      <!-- 실시간 이동차량 -->
      <div class="mpop01">
        <div class="mpopHeader">
          <span id="btnTest">실시간 이동차량</span>
          <div class="btnAlim" id="btnAlim" ref="btnAlim" @click="btnAlert()">
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
                  <li v-for="(list, i) in carTotal2" :key="i" :id='"list"+list.idStr' :class='"sts0"+list.stsCd' @click="detlInfoSelect(list.idStr, 'N')" :evtAcc="list.currEvtAcc" :onOff="list.attrOnOff">
                    <span>{{ list.carRegNo }}</span>
                    <div class='btn'>
                      <a href='javascript:void(0)' :class='list.classOnOff' @click="messageMiniBtn(event, list.idStr)">
                        <img :src="require('@/assets/ptsimages/ico/ico_sns01.png')" />
                      </a>
                      <a href='javascript:void(0)' :class='list.classOnOff' @click="callMiniBtn(event, list.idStr, clist.arRegNo, list.trnsprtPlanNo)">
                        <img :src="require('@/assets/ptsimages/ico/ico_sns02.png')" />
                      </a>
                    </div>
                  </li>
                </ul>
              </dd>
              <dt id="normalSub">정상운행</dt>
              <dd>
                <ul id="normalCarList">
                  <li v-for="(list, i) in carTotal3" :key="i" :id='"list"+list.idStr' :class='"sts0"+list.stsCd' @click="detlInfoSelect(list.idStr, 'N')" :evtAcc="list.currEvtAcc" :onOff="list.attrOnOff">
                    <span>{{ list.carRegNo }}</span>
                    <div class='btn'>
                      <a href='javascript:void(0)' :class='list.classOnOff' @click="messageMiniBtn(event, list.idStr)">
                        <img :src="require('@/assets/ptsimages/ico/ico_sns01.png')" />
                      </a>
                      <a href='javascript:void(0)' :class='list.classOnOff' @click="callMiniBtn(event, list.idStr, list.carRegNo, list.trnsprtPlanNo)">
                        <img :src="require('@/assets/ptsimages/ico/ico_sns02.png')" />
                      </a>
                    </div>
                  </li>
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
        <div class="mpopCont" ref="carMpopCont">
          <div style="margin-left:25px;margin-top:5px;color:red;">사고 및 사고접수 차량은 필터조건에 관계없이 항상 표시됩니다.</div>
          <table class="wTable01" style="margin-top: 5px !important;">
            <tr>
              <th>운행 상태</th>
              <td>
                <div class="chkBox">
                  <input type="checkbox" id="chkStatus01" ref="chkStatus01" @click="statusTotal($event);" />
                  <label for="chkStatus01">전체</label>
                </div>
                <div class="chkBox">
                  <input type="checkbox" id="chkStatus03" ref="chkStatus03" @click="status($event);" checked />
                  <label for="chkStatus03">이상</label>
                </div>
                <div class="chkBox">
                  <input type="checkbox" id="chkStatus04" ref="chkStatus04" @click="status($event);" />
                  <label for="chkStatus04">정상</label>
                </div>
              </td>
            </tr>
            <tr>
              <th>차량 상태</th>
              <td>	
                <div class="chkBox">
                  <input type="checkbox" id="carState01"  name="carState01" ref="carState01" checked @click="carStateTotal($event);" />
                  <label for="carState01">전체</label>
                </div>
                <div class="chkBox">
                  <input type="checkbox" id="carState02"  name="carState02" ref="carState02" @click="carState($event);"/>
                  <label for="carState02">Online</label>
                </div>
                <div class="chkBox">
                  <input type="checkbox" id="carState03" name="carState03" ref="carState03" @click="carState($event);"/>
                  <label for="carState03">Offline</label>
                </div>
              </td>
            </tr>
            <tr>
              <th>사전운송계획</th>
              <td>
                <div class="chkBox">
                  <input type="checkbox" id="carPlan01"  name="carPlan01" ref="carPlan01" checked @click="carPlanTotal($event);"/>
                  <label for="carPlan01">전체</label>
                </div>
                <div class="chkBox">
                  <input type="checkbox" id="carPlan02"  name="carPlan02" ref="carPlan02" @click="carPlan($event);"/>
                  <label for="carPlan02">등록</label>
                </div>
                <div class="chkBox">
                  <input type="checkbox" id="carPlan03" name="carPlan03" ref="carPlan03" @click="carPlan($event);"/>
                  <label for="carPlan03">미등록</label>
                </div>
              </td>
            </tr>
            <tr>
              <th>주무 부처</th>
              <td>
                <v-select class="rltmSelect" id="org" ref="org" v-model="orgResult" :items="orgList" item-text="name" item-value="value" outlined hide-details></v-select>
              </td>
            </tr>
            <tr>
              <th>지역별</th>
              <td>
                <v-select class="rltmSelect" id="area" ref="area" v-model="areaResult" :items="areaList" item-text="name" item-value="value" outlined hide-details @change="areaView"></v-select>
              </td>
            </tr>
            <tr>
              <th>물질 조회</th>
              <td>
                <div class="inpSearch">
                  <input type="text" class="inp01" id="matterName" ref="matterName" style="width: calc( 90% )" />
                </div>
              </td>
            </tr>
            <tr>
              <th>적재량</th>
              <td>
                <input type="text" class="inp01" id="quantityLow" ref="quantityLow" value="0" style='ime-mode:disabled;' numberOnly @keyup="chkrow()" />
                <span class="etxt">~</span>
                <input type="text" class="inp01" id="quantityHigh" ref="quantityHigh" value="9999" style='ime-mode:disabled;' numberOnly @keyup="chkhigh()" />
                <span class="etxt">kg</span>
              </td>
            </tr>
          </table>

          <div class="pbtnBox">
            <a href="javascript:void(0)" class="btype01" id="filterReset" @click="filterReset()">
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
      <div v-show="this.auth == 'M' || this.auth == 'S'" class="accident" id="reportAccidentList" style="display: none">
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
          <a v-show="this.auth == 'M' || this.auth == 'S'" href="javascript:void(0)" id="allMsgBtn" class="allMsgBtn"></a>
        </li>
      </ul>
  
      <div class="mpZoominList">
        <a href="javascript:void(0)" class="btnPlus" id="zoomPlus" @click="zoomPlus()"><img src="@/assets/ptsimages/ico/ico_plus01.png" /></a>
        <a href="javascript:void(0)" class="btnMius" id="zoomMius" @click="zoomMinus()"><img src="@/assets/ptsimages/ico/ico_mius01.png" /></a>
      </div>

      <div class="mpBottomBox">
        <div class="box">
        <a href="javascrtip:void(0)" class="mpToggle on" id="mpToggle">&nbsp;</a>
        <div v-show="this.rowBox == true" class="mpbHeader">
          <span class="tit"  style="line-height:30px;">
            <div style="line-height:20px; margin-top:12px;">운송등록번호: <span id="detlPlanNo"></span>
            </div>
            <div>이상운행유형: <span id="abnormalDetl"></span>
            </div>
          </span>
          <ul>
            <li v-show="this.auth == 'M' || this.auth == 'S'" id="trmnlNotice">단말기 알림</li>
            <li v-show="this.auth == 'M' || this.auth == 'S'" id="driverCall">운전자 통화</li>
            <li v-show="this.auth == 'M' || this.auth == 'S'" id="orgSpread">상황 전파</li>
            <li v-show="this.auth == 'M' || this.auth == 'S'" id="regitAccident">사고 전환</li>
            <li v-show="this.auth != 'M' || this.auth != 'S'" id="reportAccident">사고 신고</li>
            <li v-show="this.auth == 'M' || this.auth == 'S'" id="situationEnd" ref="situationEnd">상황 종료</li>
          </ul>
        </div>
        <div v-show="this.rowBox == true" class="mpbCont">
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
      <div id="driverCallPop"></div>      <!-- 운전자 통화 팝업 -->
      <div id="orgSpreadPop"></div>       <!-- 관계기관 전파 -->
      <div id="situationEndPop"></div>    <!-- 상황종료 팝업 -->
      <div id="regitAccidentPop"></div>   <!-- 사고전환 팝업 -->
      <div id="reportAccidentPop"></div>  <!-- 사고신고 팝업 -->
      <div id="reportEndPop"></div>       <!-- 사고신고 해제 팝업 -->
      <div id="bangjaePop"></div>         <!-- 방재팝업 -->
      <div id="legendBtnPop"></div>       <!-- 범례 -->
      <div id="befPlanListPop"></div>     <!-- 이전운송계획 조회 -->
    </div><!-- container end -->

    <audio id="myAudio" src="@/assets/audio/siren_01.mp3"></audio>
    <div id="viewport" ref="viewport"></div>
  </div>
</template>

<script>
import '@/assets/css/ptscommon.css'
import '@/assets/css/ptscustom.css'
import '@/assets/css/ptsdefault.css'
import '@/assets/css/clusterpies.css'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet/dist/leaflet-src.js'
import axios from 'axios'
import nvl from 'nvl'
import 'leaflet.markercluster/dist/leaflet.markercluster-src.js'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import d3 from '@/assets/js/d3.v3.min.js'
import moment from '@/assets/js/moment.min.js'

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
    orgResult: '',
    orgList: [],  // 주무부처 리스트
    areaResult: '',
    areaList: [],  // 지역 리스트
    areaCdList: [],  // 지역 코드 목록
    sidoAreaPolygonGroup: [],
    preReportAccNumber: 0,  //이전 사고신고 시퀀스 번호
    markerGroup: [],
    cluster: '',
    accMarkerGroup: [],
    markerPopOnOff: new Map(),  // marker 팝업 여부
    carList: [],  // 차량리스트
    currSelectCarId: '',
    geojson: '',
    layerGroup: [],
    routeMarkerGroup: [],
    locErrorFlag: '1',
    sirenCnt: 0,
    accCnt: 0,
    firstViewNoPopup: 'NOPOPUP',
    rmax: 35,  //Maximum radius for cluster pies
    accidentState: [],
    bounceTarget: '',
    currTrnsprtPlanNo: '',
    auth: '',
    eventSource: new EventSource("/vc/selectRealTimeCarInfo"),
    rowBox: false,  // default: false
    carTotal2: [],
    carTotal3: [],
  }),
  setup() {},
  created() {
  },
  mounted() {
    this.map = L.map('mapContainer', { center: this.latlng, zoom: 8, layers: [this.tiles]});
    L.control.scale({maxWidth: 200, imperial: false, position: 'bottomleft'}).addTo(this.map);
    this.selectDgstOrgList();  // 주무부처 리스트 조회
    this.selectAreaSidoList();  // 시도 리스트 조회
    this.eventSource.addEventListener('message', this.sseCall);
    this.eventSource.addEventListener('myevent', function(e) {
      console.log(e)
    }, false);
    this.cluster = L.markerClusterGroup({
      maxClusterRadius: 80,
      iconCreateFunction: this.defineClusterIcon
    })
  },
  unmounted() {
  },
  beforeDestroy() {
    if (this.map) {
      this.map.remove();
    }
    this.eventSource.removeEventListener('message', this.sseCall)
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
          var arr = [];
          var arrTotal = [];
          arr[0] = {name: "전체", value: "00"};
          arrTotal.push(arr[0]);
          for (var i=0; i<data.length; i++) {
            var item = data[i];
            arr[i+1]={name: item.cdDc, value: item.cdId};
            arrTotal.push(arr[i+1]);
          }
          this.orgResult = arr[0];
          this.orgList = arrTotal;
        }
      })
      .catch(error => {
        console.log(error);
      })
    },
    // 시도 리스트 조회
    selectAreaSidoList() {
      axios('/cmmn/vueSelectAreaSidoList', {
        data: {}
      })
      .then(response => {
        if(response != null) {
          var data = response.data;
          this.areaCdList = data;
          var arr = [];
          var arrTotal = [];
          arr[0] = {name: "전체", value: "00"};
          arrTotal.push(arr[0]);
          for (var i=0; i<data.length; i++) {
            var item = data[i];
            arr[i+1]={name: item.sidoNm, value: item.sidoCd};
            arrTotal.push(arr[i+1]);
          }
          this.areaResult = arr[0];
          this.areaList = arrTotal;
        }
        // 	// 지자체 권한 지역필터
        // 	if (auth == "Z") {
        // 		var areaDrop = $("#area").data("kendoDropDownList");
        // 		areaDrop.select(function(dataItem) {
        // 		    return dataItem.sidoCd === ldong;
        // 		});
        // 		$("#area").attr("disabled", true);
        // 		areaDrop.enable(false);
        // 		document.getElementById('area').onchange();
        // 	} else {
        // 		var areaDrop = $("#area").data("kendoDropDownList");
        // 		areaDrop.select(0);
        // 	}
      })
      .catch(error => {
        console.log(error);
      });
    },
    //필터 물질용량 검색범위 확인(최소값)
    chkrow() {
      this.$refs.quantityLow.value=this.$refs.quantityLow.value.replace(/[^0-9]/g,"");
      var low = this.$refs.quantityLow.value;
      var high = this.$refs.quantityHigh.value;
      if (parseInt(low) > parseInt(high)) {
        alert("최소값은 최대값보다 클 수 없습니다.");
        this.$refs.quantityLow.value="0";
        this.$refs.quantityHigh.value="9999";
      }
    },
    //필터 물질용량 검색범위 확인(최대값)
    chkhigh() {
      this.$refs.quantityHigh.value=this.$refs.quantityHigh.value.replace(/[^0-9]/g,"");
      var low = this.$refs.quantityLow.value;
      var high = this.$refs.quantityHigh.value;
      if (parseInt(low) > parseInt(high)) {
        alert("최소값은 최대값보다 클 수 없습니다.");
        this.$refs.quantityLow.value="0";
        this.$refs.quantityHigh.value="9999";
      }
    },
    // 필터링 조건 시/도 변경 이벤트 
    areaView(a) {
      // 시도 경계 초기화
      for (var i=0, len=this.sidoAreaPolygonGroup.length; i<len; i++) {
        this.map.removeLayer(this.sidoAreaPolygonGroup[i]);
      }
      this.sidoAreaPolygonGroup=[];
      if (a == "00") {  // 전체
        console.log("전체")
      } else {
        axios.get('/vc/vueSelectSidoArea', {
          data: {},
          params: {
            sido_cd: a
          }
        })
        .then(response => {
          if(response != null) {
            var data = response.data;
            var polygon = L.geoJSON(data,{
              style: function() {
                return {
                  weight: 3,
                  opacity: 1,
                  color: "red",
                  dashArray:"5",
                  fillOpacity:0.05
                };
              }
            }).addTo(this.map);
            this.sidoAreaPolygonGroup[this.sidoAreaPolygonGroup.length] = polygon;
            this.map.fitBounds(polygon.getBounds());
          }
        })
        .catch(error => {
          console.log(error);
        });
      }
    },
    // 필터 초기화 버튼 클릭 시
    filterReset() {
      // 운행상태
      this.$refs.chkStatus01.checked = true;
      this.$refs.chkStatus03.checked = false;
      this.$refs.chkStatus04.checked = false;
      // 차량상태
      this.$refs.carState01.checked = true;
      this.$refs.carState02.checked = false;
      this.$refs.carState03.checked = false;
      // 사전운송계획
      this.$refs.carPlan01.checked = true;
      this.$refs.carPlan02.checked = false;
      this.$refs.carPlan03.checked = false;

      // 주무부처
      this.$refs.org.value = '00';

      // // 지자체 권한 지역필터
      // if (this.auth == "Z") {
      //   var areaDrop = $("#area").data("kendoDropDownList");
      //   areaDrop.select(function(dataItem) {
      //     return dataItem.sidoCd === ldong;
      //   });
      //   $("#area").attr("disabled", true);
      //   areaDrop.enable(false);
      //   document.getElementById('area').onchange();
      // } else {
      //   areaDrop.select(0);
      // }
        
      // 시도 경계 초기화
      for (var i=0, len= this.sidoAreaPolygonGroup.length; i<len; i++) {
        this.map.removeLayer(this.sidoAreaPolygonGroup[i]);
      }
      this.$refs.area.value = '00';
      this.sidoAreaPolygonGroup=[];

      // 물질
      this.$refs.matterName.value="";
      // 적재량
      this.$refs.quantityLow.value="0";
      this.$refs.quantityHigh.value="9999";
    },
    // 필터 운행상태 전체선택
    statusTotal(event){
      if(event.target.checked == true) {
        this.$refs.chkStatus03.checked = false;
        this.$refs.chkStatus04.checked = false;
      }
    },
    // 필터 운행상태 개별선택
    status(event){
      if(event.target.checked == true) {
        this.$refs.chkStatus01.checked = false;
      }
    },
    // 필터 차량상태 전체선택
    carStateTotal(event){
      if(event.target.checked == true) {
        this.$refs.carState02.checked = false;
        this.$refs.carState03.checked = false;
      }
    },
    // 필터 차량상태 개별선택
    carState(event){
      if(event.target.checked == true) {
        this.$refs.carState01.checked = false;
      }
    },
    // 필터 사전운송계획 전체선택
    carPlanTotal(event){
      if (event.target.checked == true) {
        this.$refs.carPlan02.checked = false;
        this.$refs.carPlan03.checked = false;
      }
    },
    // 필터 사전운송계획 개별선택
    carPlan(event){
      if ( event.target.checked == true ) {
        this.$refs.carPlan01.checked = false;
      }
    },
    // sseCall
    sseCall(e) {
      var orgResult      = JSON.parse(e.data);
      var result         = orgResult.data;
      var reportAccident = orgResult.reportAccident;
      var carDataLen     = result.length;
      var todLen         = orgResult.today.length;
      var todayIng       = 0;
      var todayEnd       = 0;
      var todayCnt       = 0;

      // 상단 오늘 내일 운송정보 표출
      for (var i=0, len=todLen; i<len; i++) {
        var temp = orgResult.today[i];
        todayCnt += temp.cnt;
        
        if (temp.opratCd == "300" || temp.opratCd == "400") {
          todayIng += temp.cnt;
        } else if (temp.opratCd == "900") {
          todayEnd += temp.cnt;
        }
      }

      document.getElementById("todayIng").innerHTML = todayIng;	// 운송중
      document.getElementById("todayEnd").innerHTML = todayEnd;	// 운송종료
      document.getElementById("todayCnt").innerHTML = todayCnt;	// 운송계획
      document.getElementById("tomorrowCnt").innerHTML = nvl(orgResult.tomorrow.cnt);

      // if (auth == "M" || auth == "S") {  // 관제요원 권한
      //   // 사고신고 건수
      //   document.getElementById("reportAccdintCnt").innerHTML = reportAccident.length;
      //   // 함수 가져와서 this.추가하기
      //   reportAccidentList(reportAccident);
        
      //   if (reportAccident.length > 0) {
      //     if (this.preReportAccNumber < reportAccident[0].acdntSttemntSn) {
      //       this.sirenPlay();
      //     }

      //     this.preReportAccNumber = reportAccident[0].acdntSttemntSn;
      //   }
      // }

      var abnormalCnt = 0;	// 이상
      var normalCnt = 0;	// 정상
      var alimCnt = 0;	// 이상운행
      var acCnt = 0;	// 사고

      for (var m=0; m<this.markerGroup.length; m++) {  // 이상/정상 마커 제거
        // 루프 톨면서 지우기
        this.map.removeLayer(this.markerGroup[m]);
        this.cluster.removeLayer(this.markerGroup[m]);
      }
	
      for (var j=0; j<this.accMarkerGroup.length; j++) {  // 사고 마커 제거
        this.map.removeLayer(this.accMarkerGroup[j]);
      }
      
      this.map.removeLayer(this.markerGroup);
      this.map.removeLayer(this.layerGroup);
	
      var east = this.map.getBounds().getEast();
      var west = this.map.getBounds().getWest();
      var north = this.map.getBounds().getNorth();
      var south = this.map.getBounds().getSouth();
	
      this.map.addLayer(this.cluster);

      // eslint-disable-next-line
      this.markerPopOnOff.forEach(function (item, key, mapObj) { // 조회 전 현재값 여부 N으로 초기화
        item.set("curr", "N");
      });

      this.carList = result;  //차량리스트 정보를 전역변수에 담는다.

      for (var k=0; k<carDataLen; k++) {
        var targetItem = result[k];

        // 사고,이상 건수 카운팅
        if (targetItem.evtType != "--" || targetItem.accCode != "--") { 
          alimCnt++;
          if (targetItem.accCode != "--") {
            acCnt++;
          }
        }
        var filterYn = this.carFiltering(targetItem);
        
        // 사고접수차량 별도 처리
        for (var t=0; t<reportAccident.length; t++) {
          if (reportAccident[t].carRegNo == targetItem.carRegNo) {
            filterYn = "N";
            break;
          }
        }

        if (filterYn=="Y") {  // 필터 여부
          if (targetItem.id == this.currSelectCarId) {
            this.currSelectCarId = "";
            var ck = this.$el.querySelector('mpToggle').classList.contains('on');
            if (!ck) { // 상세창 떠 있을 때
              this.$el.querySelector('mpToggle').classList.add('on'); 
              this.$el.querySelector('mpbCont mpbHeader').hide();
            }
          }
          if (document.getElementById("list"+targetItem.id) != null) {
            var child = document.getElementById("list"+targetItem.id);
            child.classList.remove('on');
            child.style.display="none";
          }
        } else {
          var stsCd;
          var id = targetItem.id;
          var y;
          var x;

          if (targetItem.coord==undefined) {
            y="0";
            x="0";
          } else {
            y = targetItem.coord.y == "--" ? "0" : targetItem.coord.y;
            x = targetItem.coord.x == "--" ? "0" : targetItem.coord.x;
          }

          var angle = parseInt(targetItem.az / 45) + 1;
          // az가 360이 넘는 경우를 위한 처리
          if (targetItem.az >= 360) {
            angle = (parseInt(targetItem.az / 45) % 8) + 1;
          }
          
          var prevEvtAcc = "default";
          var evt_cd = targetItem.evtType == null ? "" : targetItem.evtType;
          var acc_cd = targetItem.accCode == null ? "" : targetItem.accCode;
          var currEvtAcc = evt_cd+acc_cd;
          var evt_time = targetItem.evtTime;
          var event_dt="";
          if (evt_time != undefined){
            if (evt_time.length > 10) {
              event_dt = "20" + evt_time.substring(0,2) + "." + evt_time.substring(2,4) + "." + evt_time.substring(4,6) + " " + evt_time.substring(6,8) + ":" + evt_time.substring(8,10);
            }
          }

          if ( x == "") x = "0";
          if ( y == "") y = "0";
          if ( x.substring(0, 1) == ".") x = "0";
          if ( y.substring(0, 1) == ".") y = "0";
          if (evt_cd == "--" && acc_cd == "--") { // 정상
            stsCd = "3";
            normalCnt++;
          } else if (acc_cd!="--") {  // 사고운행
            stsCd = "1";
            abnormalCnt++;
          } else { // 이상
            stsCd = "2";
            abnormalCnt++;
          }
          
          if (document.getElementById("list"+targetItem.id) != null) {
            prevEvtAcc = document.getElementById("list"+id).getAttribute("evtAcc");
          }
          this.realCarInfoList(targetItem, stsCd);

          if (stsCd != "1") {  // 사고가 아닐때만
            if (x > west && x < east) {
              if ( y > south && y < north) {

                var geoText = '{"type": "Feature","geometry": {"type": "Point","coordinates": [' + x + ', ' + y + ']},"properties": {"type": "' + stsCd + '", "angle": "' + angle + '", "carRegNo": "' + targetItem.carRegNo + '", "eventDt": "' + event_dt + '", "id": "' + id + '", "org": "' + targetItem.org + '"}}';
                try {
                  this.geojson = JSON.parse(geoText);
                } catch (e) {
                  if (e instanceof SyntaxError) {
                    console.log(e);
                  }
                }

                var markers = L.geoJSON(this.geojson, {
                  pointToLayer: this.defineFeature,
                  onEachFeature: function(feature, layer) {
                    var type = feature.properties.type;
                    var carRegNo = feature.properties.carRegNo;
                    var eventDt = feature.properties.eventDt;
                    var id = feature.properties.id;
                    var contents = '';
                    
                    if (type=="3"){  // 정상운행
                      contents = '<div class="tooltipbox1 type03">(정상)'+carRegNo+'</div>';
                    } else if (type=="2") {  //이상운행
                      contents = '<div class="tooltipbox1 type02">(이상)'+carRegNo+'<br />'+eventDt+'</div>';
                    }

                    layer.bindPopup(contents, {
                      offset: L.point(1, -2),
                      closeOnClick: false,
                      autoClose: false,
                      autoPan: false
                    }).on('click', function (e) {
                      this.markerClick(id,e);
                    });
                    this.layerGroup = layer;
                  }
                });

                if (this.map.getZoom() > 17) {
                  markers.addTo(this.map);
                } else {
                  if (x > 0 && y > 0) {
                    this.cluster.addLayer(markers);
                  }
                }
                this.markerGroup[this.markerGroup.length] = markers;
              }
            }
          }

          if (this.currSelectCarId != "") {   //하단 실시간위치 표시
            if (this.routeMarkerGroup != null && this.routeMarkerGroup.length == 0) { // 경로보기 상태가 아닐 때만
              if ( id == this.currSelectCarId ) {
                var cur_trnsprtPlanNo = this.isUndefined(targetItem.trnsprtPlanNo);

                if (!document.getElementById("list" + id).classList.contains('on')) {
                  this.$el.querySelectorAll('mpop01 mpopCont dl dd ul li').classList.remove('on');
                  document.getElementById("list" + id).classList.add('on');
                }

                if (currEvtAcc != prevEvtAcc) {  // 이상코드나 사고코드가 바뀌었을 경우 상세창 다시조회
                  this.currSelectCarId = "";
                  this.detlInfoSelect(id, 'N');
                } else {
                  if (this.currTrnsprtPlanNo != cur_trnsprtPlanNo) {  // 운송계획번호가 바뀌었을 경우 다시조회
                    this.currSelectCarId = "";
                    this.detlInfoSelect(id, 'N');
                  }
                }
                
                var matchDt = targetItem.infoOccDt.match(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d*)/)
                  
                  if (matchDt != null) {
                    if (parseInt(matchDt[2]) <= 12 ) {
                      document.getElementById("detl_occ_dt").innerHTML = this.isUndefined("20" + matchDt[1] + "/" + matchDt[2] + "/" + matchDt[3] + " " + matchDt[4] + ":" + matchDt[5] + ":" + matchDt[6]);
                    } else {
                      document.getElementById("detl_occ_dt").innerHTML = this.isUndefined(matchDt[1] + matchDt[2] + "/" + matchDt[3] + "/" + matchDt[4] + " " + matchDt[5] + ":" + matchDt[6] + ":" + matchDt[7]);
                    }
                  }
                  document.getElementById("detl_y").innerHTML=this.isUndefined(y);
                  document.getElementById("detl_x").innerHTML=this.isUndefined(x);
                  document.getElementById("detl_speed").innerHTML=this.isUndefined(targetItem.spd);
                  document.getElementById("detl_onoff").innerHTML = '엔진상태: '+(targetItem.onOff==null?"":targetItem.onOff.toUpperCase());

                if (x > 0 && y > 0) {
                  // 현재위치로 포커스 이동
                  this.map.setView(new L.latLng(y, x), this.map.getZoom());
                  this.locErrorFlag = "1";
                } else {
                  if (this.locErrorFlag == "1") {
                    alert("위치좌표가 유효하지 않습니다.");
                  }
                  this.locErrorFlag = "2";
                }
              }
            }
          }
        }
      }

      // marker 팝업 여부 상태값 저장
      for (i=0, len=this.layerGroup.length; i< len;  i++) {
        var hasLayerResult = this.map.hasLayer(this.layerGroup[i]);
        if (hasLayerResult){
          var tempId = this.layerGroup[i].feature.properties.id;
          //현재 선택된 차량만 팝업을 노출한다.
          if (this.currSelectCarId == tempId) {
            this.layerGroup[i].openPopup();
          }
        }
      }

      // eslint-disable-next-line
      this.markerPopOnOff.forEach(function (item, key, mapObj) {
        if(item.get("curr")== "N"){  // 데이터가 안그려져서 N으로 남아있으면 상태값 삭제
          this.markerPopOnOff.delete(key);
        }
      });
	
      if (alimCnt > 0) {
        this.$refs.btnAlim.classList.add('on');
        document.getElementById("btnAlim").innerHTML='<span>'+alimCnt+'</span>';
      } else {
        this.$refs.btnAlim.classList.remove('on');
      }
      if (this.accCnt < acCnt) {  // 사고차량 갯수가 늘었을 때
        this.sirenPlay();
      }

      this.sirenCnt = alimCnt;
      this.accCnt = acCnt;
        document.getElementById("abnormalSub").innerHTML="이상운행 ("+abnormalCnt+"대)";
        document.getElementById("normalSub").innerHTML="정상운행 ("+normalCnt+"대)";
      this.firstViewNoPopup="POPUPYES";
    },
    // defineClusterIcon
    defineClusterIcon(cluster) {
      var children = cluster.getAllChildMarkers(),
          categoryField = 'type',
          metadata = JSON.parse('{"fields": {"type": {"lookup": {"1": "사고", "2": "이상", "3": "정상"}}}}'),
          n = children.length, //Get number of markers in cluster
          strokeWidth = 1, //Set clusterpie stroke width
          r = this.rmax-2*strokeWidth-(n<10?12:n<100?8:n<1000?4:0), //Calculate clusterpie radius...
          iconDim = (r+strokeWidth)*2, //...and divIcon dimensions (leaflet really want to know the size)
          data = d3.nest() //Build a dataset for the pie chart
            .key(function(d) { return d.feature.properties[categoryField] })
            .entries(children, d3.map),
          //bake some svg markup
          html = this.bakeThePie({data: data,
                              valueFunc: function(d){return d.values.length;},
                              strokeWidth: 1,
                              outerRadius: r,
                              innerRadius: r-35,
                              pieClass: 'cluster-pie',
                              pieLabel: n,
                              pieLabelClass: 'marker-cluster-pie-label',
                              pathClassFunc: function(d){return "category-"+d.data.key;},
                              pathTitleFunc: function(d){return metadata.fields[categoryField].lookup[d.data.key]+' ('+d.data.values.length+' 건)';}
                            }),
          //Create a new divIcon and assign the svg markup to the html property
          myIcon = new L.DivIcon({
              html: html,
              className: 'marker-cluster', 
              iconSize: new L.Point(iconDim, iconDim)
          });
      return myIcon;
    },
    // 실시간 차량 정보 필터링
    carFiltering(item) {
      var delYn = "N";
      var accYn = 'N';
      var accIndex;
      var accLen = this.accidentState.length;

      for (var i = 0, len= accLen; i<len; i++){   // 이미 사고로 저장되어 있는지 확인
        if (this.accidentState[i] == item.id){
          accYn = 'Y';
          accIndex = i;
        }
      }

      // 사고 발생 시 초점 이동
      if (item.accCode != '--') {
        var evt_time = item.evtTime;
        var event_dt="";
        if (evt_time!=undefined){
          if (evt_time.length >10) {
            event_dt = "20"+evt_time.substring(0,2)+"."+evt_time.substring(2,4)+"."+evt_time.substring(4,6)+" "+evt_time.substring(6,8)+":"+evt_time.substring(8,10);
          }
        }
        var contents = '<div class="tooltipbox1 type01">(사고)'+item.carRegNo+'<br />'+event_dt+'</div>';

        var angle = parseInt(item.az / 45)+1;
        
        // az가 360이 넘는 경우를 위한 처리
        if (item.az >= 360) {
          angle = (parseInt(item.az / 45) % 8) + 1;
        }
        
        var accIcon = L.icon({  // 사고
          iconUrl: '@/assets/tpsimages/ico/red'+this.getOrgImgIcon(item.org)+'_'+angle+'.png',
          iconSize:   [55, 55]
        });

        var xx = item.coord.x=="--"?"0":item.coord.x;
        var yy = item.coord.y=="--"?"0":item.coord.y;
        
        if (xx > 0 && yy > 0) {
          var marker = L.marker(new L.latLng(yy, xx), {
            icon: accIcon,
            keyboard: false
          }).bindPopup(contents, {
            closeOnClick: false,
            autoClose: false,
            autoPan: false
          }).addTo(this.map).on('click', function (e) {
            this.markerClick(item.id, e);
          });	//지도에 마커 추가
          var marker2 = L.marker(new L.latLng(127.541242, 36.451632), {
            icon: accIcon,
            keyboard: false
          }).bindPopup(contents, {
            closeOnClick: false,
            autoClose: false,
            autoPan: false
          }).addTo(this.map).on('click', function (e) {
            this.markerClick(item.id, e);
          });	//지도에 마커 추가

          // marker 팝업 여부 상태값 저장
          var tempId = item.id;

          //현재 선택된 차량만 팝업을 노출한다.
          if(this.currSelectCarId == tempId) {
            marker.openPopup();
          }

          this.accMarkerGroup[this.accMarkerGroup.length] = marker;
          this.accMarkerGroup[this.accMarkerGroup.length] = marker2;
        }

        if ( accYn == 'N') {  // 사고 상태로 저장되어 있지 않은 것만
          if (xx > 0 && yy > 0) {
            this.locErrorFlag = "1";
            this.map.setView(new L.latLng(yy, xx), 15);
          } else {
            if(this.locErrorFlag == "1") {
              alert("위치좌표가 유효하지 않습니다.");
            }
            
            this.locErrorFlag = "2";
          }

          this.accidentState[this.accidentState.length] = item.id;
          this.currSelectCarId = "";

          if (this.firstViewNoPopup == "NOPOPUP") {  // 화면 진입 시 이미 사고인 차량은 사고팝업 안띄움
            this.detlInfoSelect(item.id, 'N');
          } else {
            this.detlInfoSelect(item.id, 'Y');
          }

          var ck = this.$el.querySelector('mpToggle').classList.contains('on'); 
          if(ck){
            this.$el.querySelector('mpToggle').classList.remove('on');
            this.$el.querySelector('mpbCont mpbHeader').show();
          }
        }

        if (this.currSelectCarId != "") {   // 현재 선택된 차량
          if (this.routeMarkerGroup != null && this.routeMarkerGroup.length == 0) { // 경로보기 상태가 아닐 때만
            if ( item.id == this.currSelectCarId ) {
              if (this.locErrorFlag == "1") {		// 좌표값이 정상이 아니면
                marker.setZIndexOffset(1000);
                
                if (this.bounceTarget != item.id) {
                  marker.setBouncingOptions({
                    bounceHeight: 20,    // height of the bouncing
                    bounceSpeed: 90,    // bouncing speed coefficient
                    exclusive: true,  // if this marker bouncing all others must stop
                  }).bounce(2);
                  this.bounceTarget = item.id;
                }
              }
            }
          }
        }
      } else {
        if (accYn == 'Y') {  // 사고났다가 정상으로 바뀌었을 때 배열에서 제거, 마커 제거
          this.accidentState.splice(accIndex, 1);
        }
      }
      
      // 운행상태
      if ( document.getElementById("chkStatus01").checked ) {  //전체
      } else if (document.getElementById("chkStatus03").checked && document.getElementById("chkStatus04").checked) {  //이상,정상 선택(전체)
      } else {  //전체는 아닐경우
        if (item.accCode == "--" && item.evtType == "--") {  // 정상
          if (!document.getElementById("chkStatus04").checked){
            return "Y"
          }
        } else {  // 이상
          if (!document.getElementById("chkStatus03").checked) {
            return "Y"
          }
        }
      }

      // 차량상태
      if (document.getElementById("carState01").checked) {  //전체
      } else if (document.getElementById("carState02").checked && document.getElementById("carState03").checked) {  //온라인,오프라인 선택(전체)
        if (item.onOff!=null) {
          if (item.onOff.toUpperCase() != "OFF" && item.onOff.toUpperCase() != "ON") {
            return "Y"
          }
        } else {
          return "Y"
        }
      } else if (document.getElementById("carState02").checked && !document.getElementById("carState03").checked) {  //온라인만 선택
        if (item.onOff!=null) {
          if (item.onOff.toUpperCase() != "ON") {
            return "Y"
          }
        } else {
          return "Y"
        }
      } else if (!document.getElementById("carState02").checked && document.getElementById("carState03").checked) {  //오프라인만 선택
        if (item.onOff!=null) {
          if (item.onOff.toUpperCase() != "OFF") {
            return "Y"
          }
        } else {
          return "Y"
        }
      } else {
        return "Y"
      }

      // 사전운송계획
      if (document.getElementById("carPlan01").checked) {  //전체
      } else if (document.getElementById("carPlan02").checked && document.getElementById("carPlan03").checked) {  //등록,미등록 선택(전체)
        if (item.planYn!=null) {
          if (item.planYn.toUpperCase() != "Y" && item.planYn.toUpperCase() != "N") {
            return "Y"
          }
        } else {
          return "Y"
        }
      } else if (document.getElementById("carPlan02").checked && !document.getElementById("carPlan03").checked) {  //등록만 선택
        if (item.planYn!=null) {
          if (item.planYn.toUpperCase() != "Y") {
            return "Y"
          }
        } else {
          return "Y"
        }
      } else if (!document.getElementById("carPlan02").checked && document.getElementById("carPlan03").checked) {  //미등록만 선택
        if (item.planYn!=null) {
          if (item.planYn.toUpperCase() != "N") {
            return "Y"
          }
        } else {
          return "Y"
        }
      } else {
        return "Y"
      }

      // 주무 부처
      if (document.getElementById("org").value == "00") { // 전체
      } else {
        // 청약정보에 따른 부처 선택
        var mttrty = nvl(item.mttrty);
        
        if (mttrty == "" || mttrty == "--" || mttrty != this.$refs.org.value) {
          return "Y"
        } else {
          console.log("NO : " + item.carRegNo + ", Mttr : " + item.mttrty);
        }
      }

      // 지역별
      if (document.getElementById("area").value == "00") { // 전체
      } else {
        if (item.area != document.getElementById("area").value){
          return "Y"
        }
      }

      // 물질명
      if (document.getElementById("matterName").value == "") { // 전체
      } else {
        var matFlag = 0;
        if (item.matterInfo != null) {
          for (var k=0; i<item.matterInfo.length; i++){
            if (item.matterInfo[k].name != null) {
              if (item.matterInfo[k].name.indexOf(document.getElementById("matterName").value) != -1){
                matFlag++;
              }
            }
          }
          if ( matFlag == 0) {
            return "Y"
          }
        } else {
          return "Y"
        }
      }

      //적재량
      var quantity = item.quantity;

      if (quantity == null) {
        quantity = "--";
      }

      if (quantity != null) {
        if (document.getElementById("quantityLow").value == "0" && document.getElementById("quantityHigh").value == "9999") { //전체
        } else if (!document.getElementById("quantityLow").value == "" && document.getElementById("quantityHigh").value == "") { //최저값만 있을때
          if (quantity < document.getElementById("quantityLow").value){
            return "Y"
          }
        } else if (document.getElementById("quantityLow").value == "" && !document.getElementById("quantityHigh").value == "") { //최대값만 있을때
          if (quantity > document.getElementById("quantityHigh").value){
            return "Y"
          }
        } else if (!document.getElementById("quantityLow").value == "" && !document.getElementById("quantityHigh").value == "") { //둘다 있을때
          if (quantity < document.getElementById("quantityLow").value || quantity > document.getElementById("quantityHigh").value){
            return "Y"
          }
        }
      }

      // 상세검색
      if(document.getElementById("detlSearch").value != ""){
        var tmpFlag = 0;
        if(item.carRegNo.indexOf(document.getElementById("detlSearch").value) == -1) {
          if (item.matterInfo != null) {
            for (var j=0; j<item.matterInfo.length; j++){
              if (item.matterInfo[j].name != null) {
                if (item.matterInfo[j].name.indexOf(document.getElementById("detlSearch").value) != -1){
                  tmpFlag++;
                }
              }
            }
            if ( tmpFlag == 0) {
              return "Y"
            }
          } else {
            return "Y"
          }
        }
      }
      return delYn;
    },
    // // 실시간 이동 차량 데이터 표출
    // realCarInfoList(item, stsCd) {
    //   var evt_cd = item.evtType==null?"":item.evtType;
    //   var acc_cd = item.accCode==null?"":item.accCode;
    //   var currEvtAcc = evt_cd+acc_cd;
    //   var classOnOff = item.onOff==null?"":item.onOff.toLowerCase();
    //   var attrOnOff = item.onOff==null?"":item.onOff.toUpperCase();

    //   var normal = document.getElementById("normalCarList");
    //   var abnormal = document.getElementById("abnormalCarList");
    //   var acc = document.getElementById("accCarList");
    //   var addStr = "";

    //   var extElem = null;
    //   var idStr = item.id.match(/[A-z0-9]+/);

    //   if (idStr == null) {
    //     return false;
    //   }

    //   extElem = document.getElementById("list" + idStr.toString());

    //   if (extElem == null) {

    //     addStr += "<li id='list"+idStr+"' class='sts0"+stsCd+"' @click=\"detlInfoSelect('"+idStr+"', 'N')\" style='cursor:pointer' evtAcc='"+currEvtAcc+"' onOff='"+attrOnOff+"'>";
    //     addStr += "<span>"+item.carRegNo+"</span>";
    //     addStr += "<div class='btn'>";

    //     if (this.auth == "M" || this.auth == "S" ) {  // 관리자 및 관제요원 권한
    //       addStr += "<a href='javascript:void(0)' class='"+classOnOff+"' @click=\"messageMiniBtn(event, '"+idStr+"');\">";
    //     } else {
    //       addStr += "<a href='javascript:void(0)' class='"+classOnOff+"' >";
    //     }

    //     addStr += "<img src="+ require('../assets/ptsimages/ico/ico_sns01.png') +" />";
    //     addStr += "</a>";

    //     if(this.auth == "M" || this.auth == "S") {  // 관리자 및 관제요원 권한
    //       addStr += "<a href='javascript:void(0)' class='" + classOnOff + "' @click=\"callMiniBtn(event, '" + idStr + "', '" + item.carRegNo + "', '" + item.trnsprtPlanNo + "');\">";
    //     }else{
    //       addStr += "<a href='javascript:void(0)' class='"+classOnOff+"' >";
    //     }

    //     addStr += "<img src="+ require('../assets/ptsimages/ico/ico_sns02.png') +" />" +
    //     "</a>" +
    //     "</div>" +
    //     "</li>";

    //     if (stsCd=="3") {
    //       normal.insertAdjacentHTML('afterbegin',addStr);
    //     } else if (stsCd=="2") { //이상
    //       abnormal.insertAdjacentHTML('afterbegin',addStr);
    //     } else {  //사고
    //       acc.insertAdjacentHTML('afterbegin',addStr);
    //     }
    //   } else if (extElem.getAttribute("evtAcc") != currEvtAcc) { // 이상/사고/정상 상태가 바뀌었을 때
    //     extElem.parentNode.removeChild(extElem);

    //     addStr = "<li id='list"+ idStr +"' class='sts0"+stsCd+"' @click=\"detlInfoSelect('"+ idStr +"', 'N')\" style='cursor:pointer' evtAcc='"+currEvtAcc+"' onOff='"+attrOnOff+"'>" +
    //       "<span>"+item.carRegNo+"</span>" +
    //       "<div class='btn'>" +
    //       "<a href='javascript:void(0)' class='"+classOnOff+"' @click=\"messageMiniBtn(event, '"+ idStr +"');\">" +
    //       "<img src="+ require('@/assets/ptsimages/ico/ico_sns01.png') +" />" +
    //       "</a>" +
    //       "<a href='javascript:void(0)' class='"+classOnOff+"' @click=\"callMiniBtn(event, '"+ idStr+"', '"+item.carRegNo+"', '"+item.trnsprtPlanNo+"');\">" +
    //       "<img src="+ require('@/assets/ptsimages/ico/ico_sns02.png') +" />" +
    //       "</a>" +
    //       "</div>" +
    //       "</li>";
    //     if (stsCd=="3") {
    //       normal.insertAdjacentHTML('afterbegin',addStr);
    //     } else if (stsCd=="2") { //이상
    //       abnormal.insertAdjacentHTML('afterbegin',addStr);
    //     } else {  //사고
    //       acc.insertAdjacentHTML('afterbegin',addStr);
    //     }
    //   } else {
    //     extElem.style.display="block";

    //     if (extElem.getAttribute("onOff") != attrOnOff) {  // on/off 상태가 바뀌었을 때
    //       var nm = extElem.getElementsByTagName("div");
    //       var first = nm[0].getElementsByTagName("a")[0];
    //       var second = nm[0].getElementsByTagName("a")[1];

    //       first.classList.remove('on');
    //       first.classList.remove('off');
    //       second.classList.remove('on');
    //       second.classList.remove('off');
    //       first.classList.add(classOnOff);
    //       second.classList.add(classOnOff);
    //       extElem.setAttribute("onOff", attrOnOff);
    //     }
    //   }
    // },
    // 실시간 이동 차량 데이터 표출
    realCarInfoList(item, stsCd) {
      var evt_cd = item.evtType==null?"":item.evtType;
      var acc_cd = item.accCode==null?"":item.accCode;
      var currEvtAcc = evt_cd+acc_cd;
      var classOnOff = item.onOff==null?"":item.onOff.toLowerCase();
      var attrOnOff = item.onOff==null?"":item.onOff.toUpperCase();

      var extElem = null;
      var idStr = item.id.match(/[A-z0-9]+/);

      if (idStr == null) {
        return false;
      }

      extElem = document.getElementById("list" + idStr.toString());
      
      var seList = {'idStr':idStr, 'stsCd':stsCd, 'currEvtAcc':currEvtAcc, 'attrOnOff':attrOnOff, 'carRegNo':item.carRegNo, 'classOnOff':classOnOff, 'trnsprtPlanNo':item.trnsprtPlanNo};
      if (extElem == null) {
        if(stsCd == 2){
          this.carTotal2.push(seList);
        } else if(stsCd == 3){
          this.carTotal3.push(seList);
        }
        
      } else if (extElem.getAttribute("evtAcc") != currEvtAcc) { // 이상/사고/정상 상태가 바뀌었을 때
        extElem.parentNode.removeChild(extElem);
        if(stsCd == 2){
          this.carTotal2.push(seList);
        } else if(stsCd == 3){
          this.carTotal3.push(seList);
        }

      } else {
        extElem.style.display="block";

        if (extElem.getAttribute("onOff") != attrOnOff) {  // on/off 상태가 바뀌었을 때
          var nm = extElem.getElementsByTagName("div");
          var first = nm[0].getElementsByTagName("a")[0];
          var second = nm[0].getElementsByTagName("a")[1];

          first.classList.remove('on');
          first.classList.remove('off');
          second.classList.remove('on');
          second.classList.remove('off');
          first.classList.add(classOnOff);
          second.classList.add(classOnOff);
          extElem.setAttribute("onOff", attrOnOff);
        }
      }
    },
    // defineFeature
    defineFeature(feature, latlng) {
      var angle = feature.properties.angle;
        var type = feature.properties.type;
        var org = feature.properties.org;
        var id = feature.properties.id;
        var markerIcon;
        
        if (type=="3"){  // 정상운행
          markerIcon = L.icon({  // 정상
            iconUrl: require('@/assets/ptsimages/ico/green'+this.getOrgImgIcon(org)+'_'+angle+'.png'),
            iconSize:   [55, 55]
        });
        } else if (type=="2") {  //이상운행
          markerIcon = L.icon({  // 이상
            iconUrl: require('@/assets/ptsimages/ico/yellow'+this.getOrgImgIcon(org)+'_'+angle+'.png'),
            iconSize:   [55, 55]
          });
        }

      if (this.currSelectCarId != "") {   //하단 실시간위치 표시
        if (this.routeMarkerGroup != null && this.routeMarkerGroup.length == 0) { // 경로보기 상태가 아닐 때만
          if (id == this.currSelectCarId) {
            if (this.bounceTarget != id) {
              this.bounceTarget = id;
              return L.marker(latlng, {icon: markerIcon, zIndexOffset: 1000}).setBouncingOptions({
                bounceHeight: 20,    // height of the bouncing
                bounceSpeed: 40,    // bouncing speed coefficient
                exclusive: true,   // if this marker bouncing all others must stop
              }).bounce(2);
            }
            return L.marker(latlng, {icon: markerIcon, zIndexOffset: 1000});
          }
        }
      }
      return L.marker(latlng, {icon: markerIcon});
    },
    // 마커 클릭 시 팝업
    // eslint-disable-next-line
    markerClick(id, e) {
      if (id != this.currSelectCarId) {
        this.$el.querySelector('mpop01, mpopCont dl dd ul li').classList.remove('on');
        // $("#carLists").mCustomScrollbar("scrollTo", target);  //해당 차량으로 스크롤이동
        this.detlInfoSelect(id, 'N');
        this.currSelectCarId = id;
        this.$el.querySelector('mpToggle').classList.remove('on');
        this.$el.querySelector('mpbCont, mpbHeader').show();
      } else {
        this.$el.querySelector('mpop01, mpopCont dl dd ul li').classList.remove('on');
        this.map.closePopup();
        this.currSelectCarId = "";
        this.$el.querySelector('mpToggle').classList.add('on');
        this.$el.querySelector('mpbcont, mpbHeader').hide();
      }
    },
    // 하단 개별차량 상세정보 조회 및 표출
    detlInfoSelect(id) {
      if (id == this.currSelectCarId) {
        this.currSelectCarId = "";
        this.bounceTarget = "";		// 바운스 타겟 제거
      } else {
        this.currSelectCarId = id;
        var arg = {};
        
        arg.id = id.toString()

        axios.get('/vc/vueSelectMongoById', {
          data: {},
          params: {
            id: arg.id
          }
        })
        .then(response => {
          if(response != null) {
            var result = response.data;
            var evt_time = result.evtTime;
            var event_dt="";

            if (evt_time!=undefined){
              if (evt_time.length >10) {
                event_dt = "20" + evt_time.substring(0,2)+"."+evt_time.substring(2,4)+"."+evt_time.substring(4,6)+" "+evt_time.substring(6,8)+":"+evt_time.substring(8,10);
              }
            }

            arg.car_reg_no = result.carRegNo;
            document.getElementById("orgSpread").setAttribute("vin", this.isUndefined(result.id));
            document.getElementById("orgSpread").setAttribute("car_reg_no", this.isUndefined(result.carRegNo));
            document.getElementById("orgSpread").setAttribute("plan_yn", result.planYn==null?"":result.planYn.toUpperCase());
            document.getElementById("orgSpread").setAttribute("on_off", result.onOff==null?"":result.onOff.toUpperCase());
            document.getElementById("regitAccident").setAttribute("acc_code", result.accCode);
            document.getElementById("regitAccident").setAttribute("evt_type", result.evtType);
            document.getElementById("regitAccident").setAttribute("event_dt", '20' + evt_time.substring(0, 12));
            document.getElementById("detl_speed").innerHTML = this.isUndefined(result.spd);
            document.getElementById("detl_onoff").innerHTML = '엔진상태: '+(result.onOff==null?"":result.onOff.toUpperCase());
            document.getElementById("orgSpread").setAttribute("area", result.area);

            this.currTrnsprtPlanNo = this.isUndefined(result.trnsprtPlanNo);
            
            var tr_plan_no = this.isUndefined(result.trnsprtPlanNo);

            if (tr_plan_no != "" && tr_plan_no != "--") {
              document.getElementById("detlPlanNo").innerHTML = tr_plan_no;
            } else {
              document.getElementById("detlPlanNo").innerHTML = "미등록";
            }
            
            if (result.accCode=="--" && result.evtType=="--") {  // 정상일때
              document.getElementById("abnormalDetl").innerHTML="없음";
            } else {
              document.getElementById("abnormalDetl").innerHTML=(result.abnormalInfo==null?"코드없음":result.abnormalInfo)+(result.evtTime==null?"":" ("+event_dt+")");
            }
            
            if (this.auth == "M") {
              if (result.accCode=="--" && result.evtType=="--") {  // 정상일때
                this.$refs.situationEnd.hide();  // 수정필요함
              } else {
                this.$refs.situationEnd.show();  // 수정필요함
              }
            }

            var rsltX = result.coord.x;
            var rsltY = result.coord.y;
            
            if (!isNaN(rsltX) && !isNaN(rsltY)) {
              if (rsltX > 0 && rsltY > 0) {
                this.vcCoord2Addr(rsltX, rsltY);		// 좌표기반 주소 가져오기
                this.map.setView(new L.latLng(rsltY, rsltX), 18); // 현재위치로 포커스 이동
                this.locErrorFlag = "1";
              } else {
                if(this.locErrorFlag=="1") {
                  alert("위치좌표가 유효하지 않습니다.");
                }
                this.locErrorFlag = "2";
              }
            }
            컨트롤러vueSelectDetlInfo에 request 어떻게 주입할지 계속확인하기
            arg.vin = this.isUndefined(result.id);
            arg.trnsprt_plan_no = tr_plan_no;

            axios.get('/vc/vueSelectDetlInfo', {
              data: {},
              params: {
                vin: arg.vin,
                trnsprt_plan_no: arg.trnsprt_plan_no
              }
            })
            .then(response => {
              if(response != null) {
                var data = response.data;
                console.log(data)
                var idMpToggle = document.getElementById('mpToggle');
                var ck = idMpToggle.classList.contains('on');

                if(ck){ 
                  idMpToggle.classList.remove('on');
                  this.rowBox = true;
                }
                  
                //사업자등록정보
                document.getElementById("orgSpread").setAttribute("bizrno", data.bizrno);

                // 차량정보
                var detl_car = data.carInfo;
                document.getElementById("detl_car_reg_no").innerHTML=this.isUndefined(result.carRegNo);

                if (detl_car != null){
                  document.getElementById("detl_vhcty").innerHTML=this.isUndefined(detl_car.vhcty);
                  document.getElementById("detl_yridnw").innerHTML=this.isUndefined(detl_car.yridnw)+"년식, "+this.isUndefined(detl_car.div);
                  document.getElementById("detl_brwdnm").innerHTML=this.isUndefined(detl_car.brwdnm);
                  document.getElementById("detl_cmpny_nm").innerHTML=this.isUndefined(detl_car.cmpnyNm);
                } else {
                  document.getElementById("detl_vhcty").innerHTML="";
                  document.getElementById("detl_yridnw").innerHTML="";
                  document.getElementById("detl_brwdnm").innerHTML="";
                  document.getElementById("detl_cmpny_nm").innerHTML="";
                }

                document.getElementById("detl_id").innerHTML=this.isUndefined(result.id);
                  
                // 단말기정보
                var detl_trmnl = data.trmnlInfo;
                if (detl_trmnl!=null){
                  document.getElementById("detl_telecomCd").innerHTML=this.isUndefined(detl_trmnl.telecomCd);
                  document.getElementById("detl_trmnlNo").innerHTML=this.isUndefined(detl_trmnl.trmnlNo);
                  document.getElementById("detl_makr").innerHTML=this.isUndefined(detl_trmnl.trmnlMakr);
                  document.getElementById("detl_model").innerHTML=this.isUndefined(detl_trmnl.trmnlModelNm);
                } else {
                  document.getElementById("detl_telecomCd").innerHTML="";
                  document.getElementById("detl_trmnlNo").innerHTML="";
                  document.getElementById("detl_makr").innerHTML="";
                  document.getElementById("detl_model").innerHTML="";
                }
                  
                // 실시간 위치/상태 정보
                var matchDt = result.infoOccDt.match(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d*)/)
                  
                if (matchDt != null) {
                  if (parseInt(matchDt[2]) <= 12 ) {
                    document.getElementById("detl_occ_dt").innerHTML = this.isUndefined("20" + matchDt[1] + "/" + matchDt[2] + "/" + matchDt[3] + " " + matchDt[4] + ":" + matchDt[5] + ":" + matchDt[6]);
                  } else {
                    document.getElementById("detl_occ_dt").innerHTML = this.isUndefined(matchDt[1] + matchDt[2] + "/" + matchDt[3] + "/" + matchDt[4] + " " + matchDt[5] + ":" + matchDt[6] + ":" + matchDt[7]);
                  }
                }
                  
                document.getElementById("detl_y").innerHTML = this.isUndefined(result.coord.y);
                document.getElementById("detl_x").innerHTML = this.isUndefined(result.coord.x);
                  
                // 물질, 운전자 초기화
                document.getElementById("matterTb").innerHTML='<colgroup><col width="40" /><col width="60" /><col width="" /><col width="100" /><col width="100" /><col width="70" /><col width="70" /></colgroup>';
                document.getElementById("driverInfoTb").innerHTML = '<colgroup><col width="40" /><col width="100" /><col width="100" /></colgroup>';
                
                if (data.trnsprtPlan != null) { // 현재보다 이틀 이전의 날짜로 운송중인 차량의 운송계획을 표시하지 않기 위한 임시조치
                  if (data.trnsprtPlan.startPrarnde.replace(/\D/g, '').substr(0, 8) >= moment(new Date()).add('-2', 'd').format('YYYYMMDD')) {
                      
                    // (계획)운송물질
                    var detl_matterInfo = data.matterInfo;
                      
                    if (detl_matterInfo != null) {
                      var arr=[];
                      for (var i=0; i<detl_matterInfo.length; i++) {
                        var item = detl_matterInfo[i];
                        arr[i]="<tr>" +
                        "<td>"+item.groupSn+"-"+item.sn+"</td>" +
                        "<td>"+item.mttrClNm+"</td>" +
                        "<td class='mttrNm'>"+this.isUndefinedMatt(item.mttrNm)+"</td>" +
                        "<td>"+this.isUndefinedMatt(item.casNo)+"</td>" +
                        "<td>"+this.isUndefinedMatt(item.unNo)+"</td>" +
                        "<td class='ldg'>"+item.ldg+item.cdNm+"</td>" +
                        "<td class='ldg'>"+item.cont+"</td>" +
                        "</tr>";
                      }
                      document.getElementById("matterTb").innerHTML += arr.join("");
                    }
            
                    // (계획)운전자
                    var detl_driverInfo = data.driverInfo;
                    if (detl_driverInfo!=null) {
                      var arr2=[];
                      for (var j=0; j<detl_driverInfo.length; j++) {
                        var item2 = detl_driverInfo[j];
                        arr2[j]="<tr>" +
                          "<td>"+(j+1)+"</td>" +
                          "<td>"+this.isUndefinedMatt(item2.drverNm)+"</td>" +
                          "<td>"+this.isUndefinedMatt(item2.drverTelno)+"</td>" +
                          "</tr>";
                      }
                      document.getElementById("driverInfoTb").innerHTML += arr2.join("");
                    }
                  }
                } 

                // 경고 (이상알림)
                var detl_abnormalHis = data.abnormalHis;
                document.getElementById("abnormalHisList").innerHTML = "";
                  
                for (i=0; i<detl_abnormalHis.length; i++) {
                  var item3 = detl_abnormalHis[i];
                  document.getElementById("abnormalHisList").innerHTML +="<li>"+this.this.isUndefined(item3.occdt)+" "+this.isUndefined(item3.abnrmlNm)+"</li>";
                }
                  
                //운송경로보기 버튼에 사용할 계획번호 초기화
                document.getElementById("routeBtn").setAttribute("plan_no","");
                //운송사업자정보
                document.getElementById("detl_cmpy").innerHTML = "";
                document.getElementById("detl_chgrNm").innerHTML = "";
                document.getElementById("detl_bsnmTel").innerHTML = "";
                document.getElementById("detl_bsnmAddr").innerHTML = "";
                //운송일시
                document.getElementById("detl_startDt").innerHTML = "";
                document.getElementById("detl_arvlDt").innerHTML = "";
                //운송경로
                document.getElementById("detl_startNm").innerHTML = "";
                document.getElementById("detl_startAddr").innerHTML = "";
                document.getElementById("detl_dstnNm").innerHTML = "";
                document.getElementById("detl_dstnAddr").innerHTML = "";
                
                // 운송계획정보
                var detl_trnsprtPlan = data.trnsprtPlan;

                if (detl_trnsprtPlan != undefined) { // 현재보다 이틀 이전의 날짜로 운송중인 차량의 운송계획을 표시하지 않기 위한 임시조치
                  if (detl_trnsprtPlan.startPrarnde.replace(/\D/g, '').substr(0, 8) >= moment(new Date()).add('-2', 'd').format('YYYYMMDD')) {
                    //운송경로보기 버튼에 사용할 계획번호
                    document.getElementById("routeBtn").setAttribute("plan_no",this.isUndefined(detl_trnsprtPlan.trnsprtPlanNo));
                    //운송사업자정보
                    document.getElementById("detl_cmpy").innerHTML=this.isUndefined(detl_trnsprtPlan.trnsprtBsnmNm);
                    document.getElementById("detl_chgrNm").innerHTML=this.isUndefined(detl_trnsprtPlan.trnsprtChgrNm);
                    document.getElementById("detl_bsnmTel").innerHTML=this.isUndefined(detl_trnsprtPlan.trnsprtChgrTelno);
                    document.getElementById("detl_bsnmAddr").innerHTML=this.isUndefined(detl_trnsprtPlan.trnsprtBsnmAddr)+" "+this.isUndefined(detl_trnsprtPlan.trnsprtBsnmDetailAddr);
                    // 운송일시
                    document.getElementById("detl_startDt").innerHTML=this.isUndefined(detl_trnsprtPlan.startPrarnde);
                    document.getElementById("detl_arvlDt").innerHTML=this.isUndefined(detl_trnsprtPlan.arvlPrarnde);
                    // 운송경로
                    document.getElementById("detl_startNm").innerHTML=this.isUndefined(detl_trnsprtPlan.strtpntNm);
                    document.getElementById("detl_startAddr").innerHTML=this.isUndefined(detl_trnsprtPlan.startAddr)+" "+this.isUndefined(detl_trnsprtPlan.startDetailAddr);
                    document.getElementById("detl_dstnNm").innerHTML=this.isUndefined(detl_trnsprtPlan.dstnNm);
                    document.getElementById("detl_dstnAddr").innerHTML=this.isUndefined(detl_trnsprtPlan.dstnAddr)+" "+this.isUndefined(detl_trnsprtPlan.dstnDetailAddr);
                  }
                }
              } else {
                  console.log("수신된 데이터가 없습니다.");
              }
            })
            .catch(error => {
              console.log(error);
            })
          }
        })
        .catch(error => {
          console.log(error);
        });
      }
    },
    // 마커 중앙에 표시할 주무부처 아이콘 파일명을 리턴
    getOrgImgIcon(org) {
      var returnTxt = "";
      
      if (org == "환경부 화학물질안전원") {
        returnTxt = "02";  // 화학물질
      } else if (org == "소방청 소방산업기술원") {
        returnTxt = "01";  // 소방청
      } else if (org == "산자부 한국가스안전공사") {
        returnTxt = "04";  // 고압가스 이미지
      } else if (org == "환경부 한국환경공단") {
        returnTxt = "03";  // 지정폐기물
      } else {
        returnTxt = "05";  // 빈 이미지
      }
      return returnTxt;
    },
    // 좌표값 -> 주소 변환
    async vcCoord2Addr(x, y) {
        // var deferred = $.Deferred();

        // try {
            // var data = {
            //     service: 'address',
            //     request: 'getAddress',
            //     key: 'ABB0EA1C-589F-3D7A-B4D4-AD66CA5F58B0',
            //     type: 'PARCEL',
            //     point: x + "," + y
            // }

            await axios.get('/req/address', {
              data: {},
              params: {
                service: 'address',
                request: 'getAddress',
                key: 'ABB0EA1C-589F-3D7A-B4D4-AD66CA5F58B0',
                type: 'PARCEL',
                point: x + "," + y
              }
            })
            .then(response => {
              if(response != null) {
                console.log('주소'+response)
              }
            })
            .catch(error => {
              console.log(error);
              // deferred.reject(error);
            })
            // $.ajax({
            //     url: "https://api.vworld.kr/req/address",
            //     cache: false,
            //     dataType: "jsonp",
            //     jsonp: "callback",
            //     contentType: "application/json",
            //     data: data,
            //     type: 'POST',
            //     beforeSend: function () {
            //     },
            //     complete: function (xhr, status) {
            //     },
            //     success: function (jsonObj) {
            //       if (typeof jsonObj == "object" && jsonObj != null && jsonObj != "undefined") {
            //         $("#detl_addr").text(nvl(jsonObj.response.result[0].text, "-"));
            //         }
            //     },
            //     error: function (jxhr, textStatus) {
            //       $("#detl_addr").text("-");
            //     }
            // });

        // } catch (err) {
            // deferred.reject(err);
        // }

        // return deferred.promise();
    },

    // generates a svg markup for the pie chart
    bakeThePie(options) {
        /*data and valueFunc are required*/
        if (!options.data || !options.valueFunc) {
          return '';
        }
        var data = options.data,
            valueFunc = options.valueFunc,
            r = options.outerRadius?options.outerRadius:28, //Default outer radius = 28px
            rInner = options.innerRadius?options.innerRadius:r-10, //Default inner radius = r-10
            strokeWidth = options.strokeWidth?options.strokeWidth:1, //Default stroke is 1
            pathClassFunc = options.pathClassFunc?options.pathClassFunc:function(){return '';}, //Class for each path
            pathTitleFunc = options.pathTitleFunc?options.pathTitleFunc:function(){return '';}, //Title for each path
            pieClass = options.pieClass?options.pieClass:'marker-cluster-pie', //Class for the whole pie
            pieLabel = options.pieLabel?options.pieLabel:d3.sum(data,valueFunc), //Label for the whole pie
            pieLabelClass = options.pieLabelClass?options.pieLabelClass:'marker-cluster-pie-label',//Class for the pie label
            origo = (r+strokeWidth), //Center coordinate
            w = origo*2, //width and height of the svg element
            h = w,
            donut = d3.layout.pie(),
            arc = d3.svg.arc().innerRadius(rInner).outerRadius(r);
            
        //Create an svg element
        var svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
        //Create the pie chart
        var vis = d3.select(svg)
            .data([data])
            .attr('class', pieClass)
            .attr('width', w)
            .attr('height', h);

        var arcs = vis.selectAll('g.arc')
            .data(donut.value(valueFunc))
            .enter().append('svg:g')
            .attr('class', 'arc')
            .attr('transform', 'translate(' + origo + ',' + origo + ')');
        
        arcs.append('svg:path')
            .attr('class', pathClassFunc)
            .attr('stroke-width', strokeWidth)
            .attr('d', arc)
            .append('svg:title')
              .text(pathTitleFunc);
                    
        vis.append('text')
            .attr('x',origo)
            .attr('y',origo)
            .attr('class', pieLabelClass)
            .attr('text-anchor', 'middle')
            /*IE doesn't seem to support dominant-baseline, but setting dy to .3em does the trick*/
            .attr('dy','.3em')
            .text(pieLabel);
        //Return the svg-markup rather than the actual element
        return this.serializeXmlNode(svg);
    },
    // Helper function
    serializeXmlNode(xmlNode) {
      if (typeof window.XMLSerializer != "undefined") {
        return (new window.XMLSerializer()).serializeToString(xmlNode);
      } else if (typeof xmlNode.xml != "undefined") {
        return xmlNode.xml;
      }
      return "";
    },
    // 경고음을 플레이한다.
    sirenPlay() {
      var agent = navigator.userAgent.toLowerCase();
      if (agent.indexOf("chrome") != -1) {
        var weaList = '<iframe style="width:0px; height:0px;" src="@/assets/audio/siren_01.mp3" allow="autoplay">'
        this.$refs.viewport.html(weaList)  // 수정해야됨 이거 아님
      } else {
        document.getElementById("myAudio").play();
      }
    },
  //   //차량리스트 선택 이벤트
  //   document.body.on("click", ".mpop01 .mpopCont dl dd ul li", function() {
	// 	if($(this).hasClass("on")){  // 같은걸 또 눌렀을 때 선택 해지됨
	// 		$(".mpop01 .mpopCont dl dd ul li").removeClass("on");
	// 		var ck = $(".mpToggle").hasClass("on");
	// 		if(!ck){ // 상세창 떠 있을 때
	// 			$(".mpToggle").addClass("on");
	// 			$(".mpbCont, .mpbHeader").hide();
	// 		}
	// 	} else {
	// 		$(".mpop01 .mpopCont dl dd ul li").removeClass("on");
	// 		$(this).addClass("on");
	// 	}
	// })
    // isUndefined
    isUndefined(txt) {
      var result=txt;
      if (result == undefined) {
        result="";
      }
      return result;
    },
    // isUndefinedMatt
    isUndefinedMatt(txt) {
      var result=txt;
      if (result == undefined) {
        result="-";
      }
      return result;
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