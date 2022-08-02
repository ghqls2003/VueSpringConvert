<template>
  <div>
    <input type="text" class="inp" ref="srtDt" placeholder="검색시작일자">
    <span class="etxt">~</span>
    <input type="text" class="inp" ref="endDt" placeholder="검색종료일자">
  </div>
</template>

<script>
import Litepicker from "litepicker";

export default {
  name: "TestLightpick",
  data: () => ({
    container: null,
    picker: null
  }),
  mounted() {
    this.picker = new Litepicker({
      element: this.$refs.srtDt,
      elementEnd: this.$refs.endDt,
      format: "YYYY-MM-DD",
      lang: "ko-KR",
      singleMode: false,
      startDate: new Date().setMonth(new Date().getMonth()-1),
      endDate: new Date()
    });
  }
};
</script>