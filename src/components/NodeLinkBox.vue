
(function (W, D, $) {
    // bjlee, IE 10 부터 지원하는 strict mode 선언. 안전하지 않은 액션들에 대해 예외를 발생시킴
    'use strict';

    W.$opratRcord = W.$opratRcord || {};
	
	var map = '';
	var lg2 = null;
    var nodeLinkLayer = [];
    var geometry1 = ''; // 선택된 좌표x
    var geometry2 = ''; // 선택된 좌표y
    
    var pathRes       = [];    // 검색된 경로정보
    var viaMax        = 10;    // 경유지 최대 갯수
    
    $(document).ready(function() {
    	$opratRcord.ui.createMap();
    	$opratRcord.ui.pageLoad();		//최초 페이지 로드 시
    	$opratRcord.event.setUIEvent();
    });

    // jQuery custom function
    // 라이브러리를 사용하는 외부에서 접근할 수 있도록(전역함수) encapsulation
    // 객체 메소드는 jQuery.fn($.fn)으로 정의하여 사용함. jQuery.prototype 의 별칭
    $opratRcord.ui = {

        // 발생지역 목록
        sidoList : [],

        // 검색한 그리드 데이터 목록
        dataList : [],

        /**
         *
         * @name         : pageLoad
         * @description  : 최초 페이지 로드 시 UI에 적용
         * @date         : 2018. 09. 13.
         * @author	     : 이광호
         */
        pageLoad : function() {
			// 현재시간
        	$opratRcord.event.nowTime();

        	// 도로 검색 설정
        	$('#roadTy').kendoDropDownList({
        		dataSource: [
        			{cdNm: "000(일반도로)", cdId:"000"},
        			{cdNm: "001(고가차도)", cdId:"001"},
        			{cdNm: "002(지하차도)", cdId:"002"},
        			{cdNm: "003(교량)", cdId:"003"},
        			{cdNm: "004(터널)", cdId:"004"},
                ],
                optionLabel: "도로유형선택",
                dataTextField:	"cdNm",
                dataValueField:	"cdId",
			 });
        	$('#roadGrad').kendoDropDownList({
        		dataSource: [
        			{cdNm: "101(고속국도)", cdId:"101"},
        			{cdNm: "102(도시고속국도)", cdId:"102"},
        			{cdNm: "103(일반국도)", cdId:"103"},
        			{cdNm: "104(특별/광역시도)", cdId:"104"},
        			{cdNm: "105(국가지원지방도)", cdId:"105"},
        			{cdNm: "106(지방도)", cdId:"106"},
        			{cdNm: "107(시/군도)", cdId:"107"},
                ],
                optionLabel: "도로등급선택",
                dataTextField:	"cdNm",
                dataValueField:	"cdId",
			 });

            // 도로명 자동완성 초기화
	        ajax(true, contextPath + '/bm/readRoadList', 'body', '조회중입니다.', {}, function (data) { 
	        	if (data != null) {
                    $("#roadNm").kendoAutoComplete({
                        dataSource      : data.data,
                        filter          : "contains",
                        minLength       : 2,
                        dataTextField   : "roadNm",
                        placeholder     : "도로명",
                    });
	        	}
	        });
        }, // pageLoad

        /*지도호출*/
        createMap : function(){
        	var trRestRoadData = null;	// 통행제한도로 데이터
        	var mapOptions = {};                        // 맵 옵션
        	map = setHmtsMap(map, "map", mapOptions); // 지도 생성
        	map.setView(new tsmap.latLng(36.341145, 128.396351), 1);
        	map.setZoom(map.getZoom()+2);
            map.on("moveend", function (e) {
                // 드래그 시 통행제한도로 표시
            	if (trRestRoadData != null) {
            		dispRestRoad();
            	}
            });	
			
        } // createMap
       
    };

    //이벤트 정의
    $opratRcord.event = {
        /**
         * @name         : setUIEvent
         * @description  : UI에서 사용하는 이벤트 및 초기설정을 수행한다.
         * @date         : 2018. 09. 05.
         * @author	     : 이광호
         */
        setUIEvent : function() {

            $(document).on("click", ".routeButton", function(e) {
                e.stopPropagation(); // stopPreopagation 부모이벤트는 실행하지 않는다
                var planNo = $(this).val();
                $opratRcord.map.dispRoute(planNo);
            });

            // 도로명 검색 시 안내 경고창(최초 1회만)
            $(document).one("click", "#roadNm", function(){
	            alert("두 글자 이상 작성 시 자동완성 기능이 활성화 되며, \n전체 목록을 보시려면 아무 문자열을 입력하시고 'Backspacebar'로 지우시면 됩니다.");
            });

            //위성지도 버튼 클릭 시
			document.getElementById("satelliteMap").addEventListener("click", function(){
				var ck = $(this).children().hasClass("on");
		
				if (ck) {
					$(this).children().removeClass("on");
					switchHMTSTileLayer(map, '기본지도');
				} else {
					$(this).children().addClass("on");
					switchHMTSTileLayer(map, '위성지도');
				}
			});

            // 리스트 클릭시 지도 이동
			$(document).on("click", ".list", function(){
                
				$opratRcord.event.nowTime(); // 시간갱신
				
				geometry1 = $(this).attr("value1");
				geometry2 = $(this).attr("value2");
					var moveMap = new tsmap.latLng(geometry1, geometry2);
					console.log(geometry1, geometry2);
					map.setView(moveMap, 16);
				
		    });

			$(".ent1").keydown(function(key) {
				// 검색 개선
                if (key.keyCode == 13) {
                	$opratRcord.event.search();
                }
            }); 
            console.log("enter 중복실행 테스트중");

        }, // setUIEvent

		nowTime : function() {
			// 현재시간
			var d = new Date(); 
			$("#time").text("기준 : "+d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" + ("00" + d.getDate()).slice(-2) + " " + ("00" + d.getHours()).slice(-2) + ":" + ("00" + d.getMinutes()).slice(-2) + ":" + ("00" + d.getSeconds()).slice(-2));
		}, // nowTime
		
		search : function() {
			console.log("tesetset");
			var arg = {
				"roadTy" : $("#roadTy").val(),
				"roadGrad" : $("#roadGrad").val(),
				"dstrctCd" : $("#dstrctCd").val(),
				"deptCd" : $("#deptCd").val(),
				"roadNm" : $("#roadNm").val(),
				"linkId" : $("#linkId").val()
			}; // 검색값
			
			// 검색 조건(데이터 양으로 인해 서버 다운 방지)
			if(arg.roadTy == "" && arg.roadGrad == "" && arg.dstrctCd == "" && arg.deptCd == "" && arg.roadNm == "" && arg.linkId == ""){
		        alert("최소한 한가지 항목은 선택하거나 입력하셔야 합니다.");
	            return;
			}
			if(arg.dstrctCd == "" && arg.deptCd == "" && arg.roadNm == "" && arg.linkId == ""){
   			    if(arg.roadTy == "" && arg.roadGrad != "" || arg.roadTy != "" && arg.roadGrad == ""){
			        alert("도로등급과 도로유형 모두 같이 선택해주시기 바랍니다.");
                    return;
			    }
			}
			// 도로유형 '000'에 대한 검색 제약
			if(arg.roadTy == "000" && arg.roadGrad != "" && arg.dstrctCd == "" && arg.deptCd == "" && arg.roadNm == "" && arg.linkId == ""){
			    alert("도로유형 '일반도로'는 데이터가 너무 많아 '권역코드', '기관코드',\n '도로명', '링크ID' 중 한 가지 정보를 더 입력해주시기 바랍니다.");
			    return;
			}
			// 도로유형 '003', 도로등급 '103', '106', '107'에 대한 검색 제약
			if(arg.roadTy == "003" && arg.roadGrad == "103" || arg.roadTy == "003" && arg.roadGrad == "106" || arg.roadTy == "003" && arg.roadGrad == "107"){
				if(arg.dstrctCd == "" && arg.deptCd == "" && arg.roadNm == "" && arg.linkId == "") {
				    alert("도로유형 '교량'에 도로등급 '일반국도', '지방도', '시/군도'는\n데이터가 너무 많아 '권역코드', '기관코드', '도로명', '링크ID' 중\n한 가지 정보를 더 입력해주시기 바랍니다.");
				    return;
                }
			}
			// 권역코드 검색 제약
			if(arg.dstrctCd != "" && arg.deptCd == "" && arg.roadNm == "" && arg.linkId == "" && arg.roadTy == "" && arg.roadGrad == ""){
			    alert("권역코드는 다른 항목과 같이 검색해주시기 바랍니다.");
			    return;
			}
			if(arg.roadNm != "" && arg.roadNm.length < 2){
				alert("도로명은 두 글자 이상 적어주시기 바랍니다.");
				return;
			}
			
			$opratRcord.event.nowTime(); // 시간갱신
			
			if(nodeLinkLayer){  // 기존 nodeLinkLayer 제거
				map.removeLayer(nodeLinkLayer);
			}

			$("#carLists").children().remove(); // 기존결과 제거
			
			ajax(true , contextPath+'/bm/opratRcordSearch', 'body', '조회중입니다.', arg, function (data) {
				// 데이터가 온전히 담기는 경우에만 실행
				if (data != null && !data.features.isEmpty()) {
					nodeLinkLayer = tsmap.geoJSON(data, {
						style: function() {
							return {
								weight: 4,
								opacity: 1,
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
					}).addTo(map);
//					console.log(data.isEmpty());
					console.log(nodeLinkLayer);
					console.log(data.features[0].geometry.coordinates[0][1]+","+ data.features[0].geometry.coordinates[0][0]);

					var roadCnt = data.features.length;
					$("#roadCnt").text(roadCnt); // 총운행건수
					if (roadCnt == 0) {
						// 검색결과가 없을 때
						alret("검색결과가 없습니다.");
					} else {
						$.each(data.features, function(index, item) {
								$("#carLists").append(
									"<div class='result list' value1="+item.geometry.coordinates[0][1]+" value2="
									+item.geometry.coordinates[0][0]+"><p>"+item.properties.rr+":"+item.properties.roadNm+"</p><p>"
									+item.properties.deptNm+"</p><p>링크ID : "+item.properties.linkId+"</p></div>"
								);
						})
					}
				}else{
					alert("검색결과가 없습니다.");
				}
			}); // search/nodelink ajax
		}, // search
        
        getDistanceFromLatLonInKm : function (lat1,lng1,lat2,lng2) {
            function deg2rad(deg) { 
                return deg * (Math.PI/180)
            } 
            
            var R = 6371; // Radius of the earth in km 
            var dLat = deg2rad(lat2-lat1); // deg2rad below 
            var dLon = deg2rad(lng2-lng1); 
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            var d = R * c; // Distance in km 
            return d; 
        }        
    };
}(window, document, jQuery));