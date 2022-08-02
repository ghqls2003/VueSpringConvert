<template>
  <div class="container">
    <div>
      <ul class="location">
        <li>이력통계</li>
        <li>운송유형통계</li>
      </ul>

      <form id="searchForm" name="frm" method="post" action="">
        <div v-if="viewCk == 1" class="searchBox" id="searchBox1">
          <div class="rows">
            <span class="label ml0">조회기간(일자별)</span>
            <input type="text" class="inp" ref="srtDt" placeholder="검색시작일자">
            <span class="etxt">~</span>
            <input type="text" class="inp" ref="endDt" placeholder="검색종료일자">
          </div>
          <v-btn href="#" class="btnSearch" @click="getDaySearch()">
            <img src="@/assets/images/ico/search1x.png" />
          </v-btn>
        </div>
        <div v-else class="searchBox" id="searchBox2">
          <div class="rows">
            <span class="label ml0">조회기간(차량별)</span>
            <input type="text" class="inp" ref="conectDateSt" placeholder="검색시작일자">
            <span class="etxt">~</span>
            <input type="text" class="inp" ref="conectDateEn" placeholder="검색종료일자">
          </div>
          <v-btn href="#" class="btnSearch" @click="getCarSearch()">
            <img src="@/assets/images/ico/search1x.png" />
          </v-btn>
        </div>
      </form>

      <div class="contBox treeType">
        <div class="treeBox" style="width: 100%">
          <ul class="treeTabs" style="padding-left:0px">
            <li style="width: 140px">
              <a href="javascript:void(0)" id="tabBtn01" ref="tabBtn01" @click="tabBtn01($event)" class="on">일자별</a>
            </li>
            <li style="width: 140px">
              <a href="javascript:void(0)" id="tabBtn02" ref="tabBtn02" @click="tabBtn02($event)">차량별</a>
            </li>
          </ul>
          <div v-if="viewCk == 1" class="treeCont" id="tabview1" style="overflow: auto">
            <v-card>
              <v-data-table
                :headers="thead1"
                :items="dayData"
                class="elevation-1"
                :page.sync="page"
                :footer-props="{
                  'items-per-page-options': [5, 10, 20, 30, -1],
                  showFirstLastPage: true,
                }"
                @page-count="pageCount=$event"
              ></v-data-table>
              <div class="text-center pt-2">
                <v-pagination
                  v-model="page"
                  :length="pageCount"
                  :total-visible="10"
                ></v-pagination>
              </div>
            </v-card>
          </div>

          <div v-if="viewCk == 0" class="treeCont" id="tabview2" ref="tabview2" style="overflow: auto">
            <v-card>
              <v-data-table
                :headers="thead2"
                :items="carData"
                :items-per-page="10"
                :footer-props="{
                  'items-per-page-options': [5, 10, 20, 30, -1],
                  showFirstLastPage: true,
                }"
                class="elevation-1"
              ></v-data-table>
              <div class="text-center pt-2">
                <v-pagination
                  v-model="page"
                  :length="pageCount"
                  :total-visible="10"
                ></v-pagination>
              </div>
            </v-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Litepicker from "litepicker";
import '@/assets/css/common.css'
import '@/assets/css/custom.css'
import '@/assets/css/default.css'
import '@/assets/css/style.css'
import axios from 'axios'

export default {
  name: 'TrTyStat',
  components: {
  },
  data: () => ({
    page: 1,
    pageCount: 0,
    container: null,
    picker: null,
    viewCk: 1,
    thead1: [
      { text: '순번', value: 'sn', align: 'center' },
      { text: '발생일자', value: 'dt', align: 'center' },
      { text: '위험물운송', value: 'e13', align: 'center' },
      { text: '일반화물운송', value: 'e12', align: 'center' },
      { text: '공차운행(합계)', value: 'e11Total', align: 'center' },
      { text: '공차운행(선택)', value: 'e11', align: 'center' },
      { text: '공차운행(미선택)', value: 'e11Null', align: 'center' },
      { text: '당일운행댓수', value: 'allTotal', align: 'center' },
    ],
    thead2: [
      { text: '순번', value: 'sn', align: 'center' },
      { text: '차량번호', value: 'car', align: 'center' },
      { text: '위험물운송', value: 'e13', align: 'center' },
      { text: '일반화물운송', value: 'e12', align: 'center' },
      { text: '공차운행(합계)', value: 'e11Total', align: 'center' },
      { text: '공차운행(선택)', value: 'e11', align: 'center' },
      { text: '공차운행(미선택)', value: 'e11Null', align: 'center' },
      { text: '기간운행일수', value: 'allTotal', align: 'center' },
    ],
    dayData: [],
    dayTotal: '',
    carData: [],
    carTotal: '',
    setSrt: '',
    setEnd: ''
  }),
  beforeMount() {
    },
  mounted() {
    this.setSrt = this.toFormatSrt(new Date())
    this.setEnd = this.toFormatEnd(new Date())
    this.getDayData()
    this.getCarData()
    this.picker = new Litepicker({
      element: this.$refs.srtDt,
      elementEnd: this.$refs.endDt,
      format: "YYYY-MM-DD",
      lang: "ko-KR",
      singleMode: false,
      dropdowns: {"minYear":1950,"maxYear":null,"months":true,"years":true},
      startDate: new Date().setMonth(new Date().getMonth()-1),
      endDate: new Date()
    })
  },
  methods: {
    // 일자별, 차량별 탭 기능
    tabBtn01(event) {
      event.target.classList.add('on');
      this.$refs.tabBtn02.classList.remove('on');
      this.viewCk = 1;
    },
    tabBtn02(event) {
      event.target.classList.add('on');
      this.$refs.tabBtn01.classList.remove('on');
      this.viewCk = 0;
    },

    // 초기 날짜 세팅
    leftPad(value) {
      if (value >= 10) {
        return value;
      }
      return '0'+value;
    },
    toFormatSrt(source, delimiter = '-') {
      const year = source.getFullYear();
      const month = this.leftPad(source.getMonth());
      const day = this.leftPad(source.getDate());
      return [year, month, day].join(delimiter);
    },
    toFormatEnd(source, delimiter = '-') {
      const year = source.getFullYear();
      const month = this.leftPad(source.getMonth()+1);
      const day = this.leftPad(source.getDate());
      return [year, month, day].join(delimiter);
    },

    // 일자별 데이터
    async getDayData() {
      await axios.get('/admin/os/vueDayList', {
        data: {},
        params: {
          srtDt: this.setSrt,
          endDt: this.setEnd
        }
      })
      .then(response => {
        const data = response.data
        this.dayData = data.result
        this.dayTotal = data.total
      })
      .catch(error => {
        console.log(error);
      });
    },

    // 차량별 데이터
    async getCarData() {
      await axios.get('/admin/os/vueCarList', {
        data: {},
        params: {
          // 초기 조회는 날짜가 같고, 차량에 대한 날짜의 초기 value값이 받아와지지 않음.
          conectDateSt: this.setSrt,
          conectDateEn: this.setEnd
        }
      })
      .then(response => {
        const data = response.data
        this.carData = data.result
        this.carTotal = data.total
      })
      .catch(error => {
        console.log(error);
      });
    },

    // 검색버튼
    async getDaySearch() {
      await axios.get('/admin/os/vueDayList', {
        params: {
          srtDt: this.$refs.srtDt.value,
          endDt: this.$refs.endDt.value
        }
      })
      .then(response => {
        const data = response.data
        this.dayData = data.result
        this.dayTotal = data.total
      })
      .catch(error => {
        console.log(error);
      });
		},
		async getCarSearch() {
      await axios.get('/admin/os/vueCarList', {
        params: {
          conectDateSt: this.$refs.conectDateSt.value,
          conectDateEn: this.$refs.conectDateEn.value
        }
      })
      .then(response => {
        const data = response.data
        this.carData = data.result
        this.carTotal = data.total
      })
      .catch(error => {
        console.log(error);
      });
		},
  }
}
</script>
