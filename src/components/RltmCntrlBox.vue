<script>

new Vue({
		el: '#mainApp',
		methods: {
			// 알람버튼 클릭 이벤트(클릭 시 이상운행 최상단으로 스크롤)
			btnAlert() {
				$("#carLists").mCustomScrollbar("scrollTo", $("#abnormalSub"));
			},
			// 팝업 창 취소버튼 이벤트
			trmnlNoticeCancle() {
				$("#trmnlNoticePop").data("kendoDialog").close();
			},
			//운전자통화 팝업 취소 이벤트
			driverCallCancle() {
				$("#driverCallPop").data("kendoDialog").close();
			},
			//관계기관전파 팝업 취소 이벤트
			orgSpreadCancle() {
				$("#orgSpreadPop").data("kendoDialog").close();
			},
			//상황종료 팝업 취소 버튼 클릭 이벤트
			situationEndCancel() {
				$("#situationEndPop").data("kendoDialog").close();
			},
			//사고전환 팝업 취소 이벤트
			regitAccidentCancle() {
				$("#regitAccidentPop").data("kendoDialog").close();
			},
			//사고신고 팝업 취소 이벤트
			reportAccidentCancle() {
				$("#reportAccidentPop").data("kendoDialog").close();
			},
			//상수원보호구역 버튼 클릭 시
			waterSource() {
				var ck = $('#waterSource').children().hasClass("on");
				if (ck) {
					$('#waterSource').children().removeClass("on");
					waterSourceLayer.remove();
				} else {
					$('#waterSource').children().addClass("on");
					ajax(true, contextPath+'/vc/selectLmttZone', 'body', '조회중입니다.', null, function (data) {
						if (data != null) {
							waterSourceLayer = tsmap.geoJSON(data, {
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
									layer.bindTooltip("<div class=\"tooltipbox2 type01\"><h4>" + feature.properties.spotNm + "</h4>(" + feature.properties.clCdNm + ")</div>", { closeOnClick: false, autoClose: false, autoPan: false });
								}
							}).addTo(map);
						}
					});
				}
			},
			//통행제한도로 버튼 클릭 시
			trafficRestriction() {
				var ck = $('#trafficRestriction').children().hasClass("on");
				if (ck) {
					$('#trafficRestriction').children().removeClass("on");
					trRestrictLayer.remove();
					trRestRoadData = null;
				} else {
					if (map.getZoom() < trRestRdMinZoom) {
						map.setZoom(trRestRdMinZoom);
					}
					$('#trafficRestriction').children().addClass("on");
					ajax(true, contextPath+'/vc/selectLmttRoad', 'body', '조회중입니다.', null, function (data) {
						if (data != null) {
							trRestRoadData = data;
							dispRestRoad();
						}
					});
				}
			},
			//대응기관 버튼 클릭 시
			corInstt() {
				var ck = $('#corInstt').children().hasClass("on");
				if (ck) {
					$('#corInstt').children().removeClass("on");
					insttMarkers.clearLayers();
				} else {
					$('#corInstt').children().addClass("on");
					dispInsttPOI();
				}
			},
		}
	})
/**
 * 실시간 관제화면에 대한 클래스
 *
 * history : 네이버시스템(주), 1.0, 2018/09/05  초기 작성
 * author : 김보민
 * version : 1.0
 */

var areaCdList = [];	// 지역 코드 목록

var abnExitSttnCdList = [];	// 이상 해제 상황 코드 목록
var abnExitMthdCdList = [];	// 이상 해제 확인방법 코드 목록
var abnExitResnCdList = [];	// 이상 해제 사유 코드 목록
var abnSttusCdList    = [];	// 이상 상태 코드

var rprExitSttnCdList = [];	// 신고 해제 상황 코드 목록
var rprExitMthdCdList = [];	// 신고 해제 확인방법 코드 목록
var rprExitResnCdList = [];	// 신고 해제 사유 코드 목록

var acdExitMthdCdList = [];	// 사고 해제 상태 코드 목록

var regltZonePolygonGroup = [];
var lmttZonePolygonGroup  = [];
var sidoAreaPolygonGroup  = [];
var toggleFlag = "";
var situFlag = "";
var filterFlag = "";
var accidentState = [];
var map = '';
var firstViewNoPopup = "NOPOPUP";
var	markerGroup = [];
var	layerGroup =  [];
var	markerPopOnOff =  new Map();  // marker 팝업 여부
var	routeMarkerGroup = [];
var	accMarkerGroup = [];
var	currSelectCarId =  "";
var	currTrnsprtPlanNo = "";
var	routePolyline = "";
var	accChangeFlg = "";
var	bounceTarget = "";
var trRestRoadData = null;	// 통행제한도로 데이터
var vlTunnelData   = null;	// 장대터널 데이터
var trRestRdMinZoom = 10;	// 통행제한도로 표시 시작 레벨

var	rmax = 35; //Maximum radius for cluster pies
var	cluster = tsmap.markerClusterGroup({
	// disableClusteringAtZoom: 5,
	maxClusterRadius: 80,
	iconCreateFunction: defineClusterIcon //this is where the magic happens
});

var metadata = JSON.parse('{"fields": {"type": {"lookup": {"1": "사고", "2": "이상", "3": "정상"}}}}');
var	categoryField = 'type'; //This is the fieldname for marker category (used in the pie and legend)
var	geojson = '';
var	locErrorFlag = "1";
var	sirenCnt = 0;
var	accCnt = 0;
var	auth = '';
var	ldong = '';
var	flag = "1";  // test 용 flag

var heatLayer = new tsmap.heatLayer();
var poplTnLayer;
var waterSourceLayer;	// 상수원보호구역
var trRestrictLayer;	// 통행제한도로
var vlTunnelLayer;		// 장대터널
var insttMarkers = tsmap.layerGroup();	// 대응기관 POI

var carList = []; 		//차량리스트 저장
var preReportAccNumber = 0;  //이전 사고신고 시퀀스 번호
var secondLoginHost = "/";

var eventSource = new EventSource(contextPath + "/vc/selectRealTimeCarInfo");

$(function() {
	var seLogin = getAuth2();
	
	if (seLogin == "pi") {
		onInit();
	} else {
		// default.js
		if (withoutSecondLoginMode) {
			onInit();
		} else {
			secondLoginModalPop();
		}
	}
});

function onInit() {
	// 초기화
	auth = getAuth();
	ldong = getLdong();

	if (auth == "M" || auth == "S") {    // 관제요원 권한
		$("#reportAccident").hide();     // 사고신고
		$("#reportAccidentList").show(); // 사고접수현황
		$("#allMsgBtn").show();          // 단말 전체푸시
	} else {
		// $("#regltZoneBtn").hide();    // 단속지역
		$("#trmnlNotice").hide();        // 단말기 알림
		$("#driverCall").hide();         // 운전자통화
		$("#orgSpread").hide();          // 관계기관전파
		$("#regitAccident").hide();      // 사고전환
		$("#situationEnd").hide();       // 상황종료
		$("#allMsgBtn").hide();          // 단말 전체푸시
	}

	$(".mpbCont, .mpbHeader").hide();

	// 실시간 조회 이벤트 등록(SSE 호출)
	//sseCall();
    
	//검색필터에서 사용할 목록 조회
	selectAreaSidoList(); // 시도 리스트 조회
	selectDgstOrgList();  // 주무부처 리스트 조회
	selectExitCdList();   // 상황해제코드 목록 조회

	// // 이벤트리스너
	// // 알람버튼 클릭 이벤트(클릭 시 이상운행 최상단으로 스크롤)
	// $("body").on("click", "#btnAlim", function() {
	// 	$("#carLists").mCustomScrollbar("scrollTo", $("#abnormalSub"));
	// });
	
    //차량리스트 선택 이벤트
	$("body").on("click", ".mpop01 .mpopCont dl dd ul li", function() {
		if($(this).hasClass("on")){  // 같은걸 또 눌렀을 때 선택 해지됨
			$(".mpop01 .mpopCont dl dd ul li").removeClass("on");
			var ck = $(".mpToggle").hasClass("on");
			if(!ck){ // 상세창 떠 있을 때
				$(".mpToggle").addClass("on");
				$(".mpbCont, .mpbHeader").hide();
			}
		} else {
			$(".mpop01 .mpopCont dl dd ul li").removeClass("on");
			$(this).addClass("on");
		}
	});

	//메뉴 이벤트
	$("body").on("click",".btnTotalMenu, .btnLnbControll",function() {  // 지도 resize
		var ck = $(this).hasClass("on");
		
		if(ck){
			map.invalidateSize();
		}
	});

	// // 팝업 창 취소버튼 이벤트
	// $("body").on("click","#trmnlNoticeCancle",function(){
	// 	$("#trmnlNoticePop").data("kendoDialog").close();
	// });

	// //운전자통화 팝업 취소 이벤트
	// $("body").on("click","#driverCallCancle",function(){
	// 	$("#driverCallPop").data("kendoDialog").close();
	// });
	
	// //관계기관전파 팝업 취소 이벤트
	// $("body").on("click","#orgSpreadCancle",function(){
	// 	$("#orgSpreadPop").data("kendoDialog").close();
	// });
	
	// //상황종료 팝업 취소 버튼 클릭 이벤트
	// $("body").on("click","#situationEndCancel",function(){
	// 	$("#situationEndPop").data("kendoDialog").close();
	// });
	
	// 상황종료 팝업 상황종료 버튼 클릭 이벤트
	$("body").on("click","#situationEndExecute",function() {
		// 이상 상황 조회
		var param = fn_getFormData($("#situationEndForm"));
		param.vin = document.getElementById('orgSpread').getAttribute("vin");
		param.id = document.getElementById('orgSpread').getAttribute("vin");
		
		//ajax(true, contextPath+'/vc/situationEndExecute', 'body', '조회중입니다.', arg, function (data) {   // mongoDB 실시간 데이터를 정상으로 update
		ajax(true, contextPath+'/vc/updateAbnormalExit', 'body', '조회중입니다.', param, function (data) {   // 상황종료 이력 및 mongoDB 정상으로 update
			if (data == 1) {  // 정상
				alert("상황종료 되었습니다.");
				
				$('#situationEndPop').data("kendoDialog").close();
				
				currSelectCarId = "";
				detlInfoSelect(document.getElementById('orgSpread').getAttribute("vin"), 'N');
			}
		});
	});
	
	// 사고종료 팝업 상황종료 버튼 클릭 이벤트
	$("body").on("click","#accEndExecute",function() {
		// 이상 상황 조회
		var param = fn_getFormData($("#situationEndForm"));
		param.vin = document.getElementById('orgSpread').getAttribute("vin");
		param.id = document.getElementById('orgSpread').getAttribute("vin");
		
		//ajax(true, contextPath+'/vc/situationEndExecute', 'body', '조회중입니다.', arg, function (data) {   // mongoDB 실시간 데이터를 정상으로 update
		ajax(true, contextPath+'/vc/updateAccExit', 'body', '조회중입니다.', param, function (data) {   // 상황종료 이력 및 mongoDB 정상으로 update
			if (data == 1) {  // 정상
				alert("사고 종료 되었습니다.");
				
				$('#situationEndPop').data("kendoDialog").close();
				
				currSelectCarId = "";
				detlInfoSelect(document.getElementById('orgSpread').getAttribute("vin"), 'N');
			}
		});
	});
	
	// //사고전환 팝업 취소 이벤트
	// $("body").on("click","#regitAccidentCancle",function(){
	// 	$("#regitAccidentPop").data("kendoDialog").close();
	// });

	// //사고신고 팝업 취소 이벤트
	// $("body").on("click","#reportAccidentCancle",function() {
	// 	$("#reportAccidentPop").data("kendoDialog").close();
	// });
	
	//사고 신고 해제 버튼 클릭 이벤트
	$("body").on("click","#reportEndExecute", function(){
		var param = fn_getFormData($("#reportEndForm"));
		
		ajax(true, contextPath+'/vc/updateReportAccidentExit', 'body', '조회중입니다.', param, function (data) {
			if (data != null) {
				alert("신고 해제되었습니다.");
				$("#situationEndPop").data("kendoDialog").close();
			}
		});
	});
	
	// 필터링 조건 시/도 변경 이벤트 
	document.getElementById('area').onchange = function() {
		// 시도 경계 초기화
		for (var i=0, len=sidoAreaPolygonGroup.length; i<len; i++) {
			map.removeLayer(sidoAreaPolygonGroup[i]);
		}
		sidoAreaPolygonGroup=[];

		if (document.getElementById("area").value == "00") {  // 전체
		} else {
			var arg = {};
			arg.sido_cd = document.getElementById("area").value;
			ajax(true, contextPath+'/vc/selectSidoArea', 'body', '조회중입니다.', arg, function (data) {   // 시도 경계 조회
				if (data != null) {

					var polygon = tsmap.geoJSON(data,{
						style: function() {
							return {
								weight: 3,
								opacity: 1,
								color: "red",
								dashArray:"5",
								fillOpacity:0.05
							};
						},
						onEachFeature: function(feature, layer) {
							//layer.bindPopup(feature.properties.Description);
						}
					}).addTo(map);
					sidoAreaPolygonGroup[sidoAreaPolygonGroup.length] = polygon;
					map.fitBounds(polygon.getBounds());
				}
			});
		}
	};

	//방재정보 물질 변경 이벤트
	$("body").on("change","#matterS",function() {
		var arg = {};
		arg.cas_no = document.getElementById("matterS").value;
		ajax(true, contextPath+'/vc/selectMtChncksprvnbeInfo', 'body', '조회중입니다.', arg, function (data) {
			var target05Cont ="";
			if (data != null) {
				target05Cont     = '<table class="orgtable">';
				target05Cont     += '<colgroup><col width="120" /><col width="240" /></colgroup>';
				target05Cont     += '<tr><td>항목</td><td>내용</td></tr>';
				target05Cont     += '<tr><td>물질명</td><td>'+isUndefined(data.dgstNm)+'</td></tr>';
				target05Cont     += '<tr><td>물질영문명</td><td>'+isUndefined(data.dgstEngNm)+'</td></tr>';
				target05Cont     += '<tr><td>CAS번호</td><td>'+isUndefined(data.casNo)+'</td></tr>';
				target05Cont     += '<tr><td>소화방법</td><td>'+isUndefined(data.digstnMth)+'</td></tr>';
				target05Cont     += '<tr><td>소화제 및 장비</td><td>'+isUndefined(data.digstnEqpmn)+'</td></tr>';
				target05Cont     += '<tr><td>연소생성물</td><td>'+isUndefined(data.cmbsMttr)+'</td></tr>';
				target05Cont     += '<tr><td>일반적대처요령</td><td>'+isUndefined(data.prvnbeInfo)+'</td></tr>';
				target05Cont     += '<tr><td>방제약품 및 장비</td><td>'+isUndefined(data.prvnbeEqpmn)+'</td></tr>';
				target05Cont     += '<tr><td>초기이격거리</td><td>'+isUndefined(data.eryyGapDist)+'</td></tr>';
				target05Cont     += '<tr><td>방호활동거리</td><td>'+isUndefined(data.prvnbeDist)+'</td></tr>';
				target05Cont     += '<tr><td>누출방지 및 개인보호구역</td><td>'+isUndefined(data.indvdlPrtcEqpmn)+'</td></tr>';
				target05Cont     += '</table>';
			} else {
				target05Cont     += '해당 물질 관련 정보가 없습니다.';
			}
			$("#bj_cont").html(target05Cont);
		});
	});
	
	//필터 물질용량 검색범위 확인
	document.getElementById('quantityLow').onkeyup = function() {
		document.getElementById('quantityLow').value=document.getElementById('quantityLow').value.replace(/[^0-9]/g,"");
		var low = document.getElementById("quantityLow").value;
		var high = document.getElementById("quantityHigh").value;
		if (parseInt(low) > parseInt(high)) {
			alert("최소값은 최대값보다 클 수 없습니다.");
			document.getElementById("quantityLow").value="0";
			document.getElementById("quantityHigh").value="9999";
		}
	};

	//필터 물질용량 검색범위 확인
	document.getElementById('quantityHigh').onkeyup = function() {
		document.getElementById('quantityHigh').value=document.getElementById('quantityHigh').value.replace(/[^0-9]/g,"");
		var low = document.getElementById("quantityLow").value;
		var high = document.getElementById("quantityHigh").value;
		if (parseInt(low) > parseInt(high)) {
			alert("최소값은 최대값보다 클 수 없습니다.");
			document.getElementById("quantityLow").value="0";
			document.getElementById("quantityHigh").value="9999";
		}
	};
	
	// 주변차량 사고 알림 전송 버튼 클릭 시
	$("body").on("click", "#btnAroundAccInfo", function() {
        var arg = {};
        arg.crd_x = $('#detl_x').text();
        arg.crd_y = $('#detl_y').text();
        arg.dist  = 3;	// km
        arg.ntcnCn = $('#txtArndBrd').val();
        //arg.ntcnCn = "반경 " + arg.dist + "km 내 화물차 사고 발생. 주의운전 하시기 바랍니다.";
        //arg.ntcnCn = "주의운전 하시기 바랍니다. 반경 3km 내 화물차 사고가 발생했습니다."; 
        
        var sendConfirm = confirm('사고차량 근접 차량 단말로 사고 메세지를 전송합니다.');
	   
        if (sendConfirm) {
			ajax(true, contextPath + '/vc/selectAroundAccInfo', 'body', '처리중입니다.', arg, function (data) {
				if (data > 0) {  // 정상
					alert(data + "건 전송 되었습니다.");
				} else {
					alert("전송 조건에 맞는 대상이 없습니다.");
				}
			});
        }
	});
	
	// 차량 목록 전체 단말기 알림 전송 버튼 클릭 시
	$("body").on("click", "#sendNoticeAll",function() {
        var arg = {};
        //var selSidoItem = $("#dlPushMsgArea").data("kendoDropDownList");
		
		arg.ntcnTrnsmisCode = 0; // 알림전송코드
		arg.ntcnCn          = nvl(document.getElementById("noticeMsg").value.trim());		            // 메세지
		ntcnCnLen=$('input:checkbox[name="dlPushMsgArea"]:checked').length;
		arg.areaCd =$('input:checkbox[name="dlPushMsgArea"]').val();


		// check box 항목에 대한 값을 # 구분자로 연결
		if(ntcnCnLen > 0){
			var areaCdArr=new Array();
			for(i=0; i < ntcnCnLen; i++){
				//console.log( $('input:checkbox[name="dlPushMsgArea"]:checked').eq(i).val() );
				areaCdArr.push($('input:checkbox[name="dlPushMsgArea"]:checked').eq(i).val());
			}
			console.log(areaCdArr);
			arg.areaCd		= areaCdArr.join(','); //selSidoItem.value();
		}
		
		if (ntcnCnLen < 1) {
			alert("지역을 선택 바랍니다.");
			return false;
		}
		
		if (arg.ntcnCn == "") {
			alert("알림 내용을 입력하세요");
			return false;
		}
		
        //var sendConfirm = confirm("[" + selSidoItem.text() + '] 지역 운행 차량 단말로 메세지를 전송합니다.');
		var sendConfirm = confirm('선택된 지역 운행 차량 단말로 메세지를 전송합니다.');
	   
        if (sendConfirm) {
			ajax(true, contextPath + '/vc/sendNoticeAll', 'body', '처리중입니다.', arg, function (data) {
				if (data > 0) {  // 정상
					alert(data + "건 전송 되었습니다.");
					$('#trmnlNoticePop').data("kendoDialog").close();
				} else {
					alert("전송조건에 맞는 대상이 없습니다.");
				}
			});
        }
	});
	
	// 차량 상세창에서 단말기 알림 전송 버튼 클릭 시
	$("body").on("click", "#sendNotice",function() {	
		var arg = {};
		
		arg.sndmth          = $('input[name="sndmth"]:checked').val();  // P:push (default), S:sms
		// push
		arg.trmnlNo         = document.getElementById("detl_trmnlNo").innerHTML;            // 단말번호
		arg.ntcnTrnsmisCode = 0; // 알림전송코드
		arg.ntcnCn          = document.getElementById("noticeMsg").value;		            // 메세지
		
		// sms
		arg.mpno            = document.getElementById("detl_trmnlNo").innerHTML;         	// 단말번호
		arg.trnsprt_plan_no = document.getElementById('routeBtn').getAttribute("plan_no");
		arg.cntrmsr_div_cd  = '100';
		arg.sms_msg         = '20'+document.getElementById("noticeMsg").value;        		// 메세지
		
		if (document.getElementById("detl_driverNm")) {
			arg.rcverNm     = nvl(document.getElementById("detl_driverNm").innerHTML, '-');  // 운전자명
		} else {
			arg.rcverNm     = '위험물단말';  // 운전자명
		}
		
		arg.car_reg_no      = document.getElementById('orgSpread').getAttribute("car_reg_no");
		arg.vin             = document.getElementById('orgSpread').getAttribute("vin");

		ajax(true, contextPath+'/vc/sendNotice', 'body', '처리중입니다.', arg, function (data) {
			if (data == 1) {  // 정상
				alert("전송 되었습니다.");
				$('#trmnlNoticePop').data("kendoDialog").close();
			}
		});
	});

	// 차량 리스트에서 단말기 알림 전송 버튼 클릭 시
	$("body").on("click", "#sendNoticeMini", function() {
		var arg = {};
		
		arg.sndmth          = $('input[name="sndmth"]:checked').val();  // P:push (default), S:sms
		arg.trmnlNo         = document.getElementById("detl_trmnlNoMini").innerHTML;         // 단말번호
		arg.ntcnTrnsmisCode = 0;         // 알림전송코드
		arg.ntcnCn          = document.getElementById("noticeMsgMini").value;                // 메세지
		
		arg.mpno            = document.getElementById("detl_trmnlNoMini").innerHTML;         // 단말번호
		arg.trnsprt_plan_no = document.getElementById("planNoMini").innerHTML;
		arg.cntrmsr_div_cd  = '100';
		arg.sms_msg         = '20' + document.getElementById("noticeMsgMini").value;         // 메세지
		arg.rcverNm         = '-';   // 운전자명
		arg.car_reg_no      = document.getElementById("carRegNoMini").innerHTML;
		arg.vin             = document.getElementById("vinMini").innerHTML;
		
		ajax(true, contextPath+'/vc/sendNotice', 'body', '처리중입니다.', arg, function (data) {
			if (data == 1) {  // 정상
				alert("전송 되었습니다.");
				$('#trmnlNoticePop').data("kendoDialog").close();
			}
		});
	});
	
	// 관계기관전파 팝업의 '관계기관전파' 버튼 이벤트 리스너
	$("body").on("click", "#sendOrgSpread",function() {
		var arg = [];
		
		var msg_cont = $('#spreadMsg').val();
		var checkBox = $("input[name='chkOrg']:checked");
		var arg = [];
		
		checkBox.each(function(i) {
	        var tr  = checkBox.parent().parent().eq(i);
	        var td  = tr.children();
	        var row = {};
	        
	        row.sms_msg  = msg_cont;
	        row.orgNm    = td.eq(1).text();
	        row.rcverNm  = td.eq(2).text();
	        row.mpno     = td.eq(3).text();
	        row.destInfo = row.rcverNm + '^' + row.mpno;
	        
	        arg.push(row);
		});
	    
        //var scnt = 0; 
		ajax(true, contextPath + '/vc/sendAccInfo', 'body', '처리중입니다.', {smsList: arg}, function (data) {
			if (data >= 1) {  // 정상
				// scnt += 1;
				alert("전송 되었습니다.");
				$('#orgSpreadPop').data("kendoDialog").close();
			};
		});

		
		/*
		arg.mpno = document.getElementById("detl_trmnlNoMini").innerHTML;         // 휴대폰번호
		arg.trnsprt_plan_no = document.getElementById("planNoMini").innerHTML;
		arg.cntrmsr_div_cd = '100';
		arg.sms_msg = document.getElementById("spreadMsg").value;        // 메세지
		arg.rcverNm = ''   // 운전자명
		arg.car_reg_no = document.getElementById("carRegNoMini").innerHTML;
		arg.vin = document.getElementById("vinMini").innerHTML;
		*/
		
	});
	
	/**
	 * @name         : regitAccidentExecuteClickHandler
	 * @description  : 상세보기의 사고접수 버튼을 통한 사고 전환
	 * @date         : 2020. 03. 24.
	 * @author	     : 이우철
	 */
	$("body").on("click", "#regitAccidentExecute", function(e) {

		// 사고 전환 처리
		var arg = {};
		
		arg.vin                 = document.getElementById('orgSpread').getAttribute("vin");   // id
		arg.acdntTyCd           = document.getElementById("accCd").value;
		arg.acdntSttemntSttusCd = 1;
		arg.carRegNo            = document.getElementById('orgSpread').getAttribute("car_reg_no");
		arg.bizrno              = document.getElementById('orgSpread').getAttribute("bizrno");
		arg.xCrd                = document.getElementById("detl_x").innerHTML;
		arg.yCrd                = document.getElementById("detl_y").innerHTML;
		arg.trnsprtPlanNo       = document.getElementById("routeBtn").getAttribute("plan_no");
		arg.trnsprtPlanYn       = (document.getElementById("orgSpread").getAttribute("plan_yn") == 'Y' ? 'Y' : 'N');

		ajax(true, contextPath+'/vc/regitAccidentExecute', 'body', '해당 차량을 사고 상태로 전환합니다.', arg, function (data) {
			if (data != null) {
				accChangeFlg = document.getElementById('orgSpread').getAttribute("vin");
				alert("사고 전환되었습니다.");
				$('#regitAccidentPop').data("kendoDialog").close();	// 사고전환 팝업 닫음
			}
		});
	});

	// 사고 신고 버튼 클릭시
	$("body").on("click", "#reportAccidentExecute",function() {

		var arg = {};
		arg.vin = document.getElementById('orgSpread').getAttribute("vin");
		arg.car_reg_no = document.getElementById('orgSpread').getAttribute("car_reg_no");
		arg.acdnt_ty_cd = document.getElementById("reportAccCd").value;
		arg.acdnt_dc = document.getElementById("reportAccDc").value;

		ajax(true, contextPath+'/vc/reportAccidentExecute', 'body', '신고중입니다.', arg, function (data) {
			if (data != null) {
				accChangeFlg = document.getElementById('orgSpread').getAttribute("vin");
				alert("사고신고가 접수 되었습니다.");
				$('#reportAccidentPop').data("kendoDialog").close();
			}
		});
	});
	
	//$("#sendAreaCheckAllbtn",function() {
	$("body").on("click", "#sendAreaCheckAllbtn",function() {
		var chkcnt=$('input:checkbox[name="dlPushMsgArea"]:checked').length;
		var checkedval=false;
		console.log(chkcnt);
		if(chkcnt < 1 ){
			checkedval=true;
		}
		$('input:checkbox[name="dlPushMsgArea"]').each(function() {
		      this.checked = checkedval; //checked 처리
		});
	});
	
	// 전체 차량 푸시 메세지 전송 버튼 클릭 시
	document.getElementById("allMsgBtn").addEventListener("click", function() {

		var ck = $(this).hasClass("on");

		if (ck) {
			$('#trmnlNoticePop').data("kendoDialog").close();
			$(".allMsgBtn").removeClass("on");
		} else {
			$(".allMsgBtn").addClass("on");
			
			allPopupClose();

			var target01Cont  = '<table class="wTable t01">';
			target01Cont     += '<colgroup><col width="70"><col width=""></colgroup>';
			target01Cont     += '<tbody>';
			target01Cont     += '<tr><td>지역:</td>';
			//target01Cont     += '<td><select id="dlPushMsgArea" class="select"></select></td>';
			target01Cont     += '<td id="dlPushMsgArea">';
			target01Cont     += '<input type="button" value=" 지역전체 선택,해제 " id="sendAreaCheckAllbtn" style="cursor:pointer"/>';
			target01Cont     += '	<ul style="list-style:none;">';
			//target01Cont     += '<input type="checkbox" name="" value="01">지역명';
			for(i=0; i < areaCdList.length;i++){
				target01Cont     += '<li style="width:100px;margin:3px 0 3px 0;float:left">';
				target01Cont     += '<input type="checkbox" name="dlPushMsgArea" id="dlPushMsgArea'+i+'" value="'+areaCdList[i].sidoCd+'">';
				target01Cont     += '<label for="dlPushMsgArea'+i+'" style="cursor:pointer;margin:0 0 0 3px">'+areaCdList[i].sidoNm+'</label>';
				target01Cont     += '</li>';				
			}

			target01Cont     += '</ul></td>';
			target01Cont     += '</tr>';
			target01Cont     += '<tr><td>내용:</td><td><textarea id="noticeMsg" class="textarea"></textarea></td></tr>';
			target01Cont     += '</tbody></table>';
			
			target01Cont     += '<div class="pbtnBox">';
			target01Cont     += '<a href="javascript:void(0)" class="btype01" id="trmnlNoticeCancle" @click="trmnlNoticeCancle()"><span>취소</span></a>';
			target01Cont     += '<a href="javascript:void(0)" class="btype02" id="sendNoticeAll" style="width:100px;"><span>단말기 알림 전송</span></a>';
			target01Cont     += '</div>';

			$("#trmnlNoticePop").kendoDialog({
				width: "700px",
				title: "전체 단말기 알림 전송",
				closable: true,
				modal: false,
				content: target01Cont,
				close: function(){
					$(".allMsgBtn").removeClass("on");
				}
			});
			
			$("#trmnlNoticePop").data("kendoDialog").open();
			/*
			  
			$("#dlPushMsgArea").kendoDropDownList({				
	            optionLabel: {
	            	sidoNm: "전체",
	            	sidoCd: "00"
	            },
	            autoWidth: true,
	            dataTextField: "sidoNm",
	            dataValueField: "sidoCd",
	            dataSource: areaCdList
			});
			*/
		}
	});
	
	// //상수원보호구역 버튼 클릭 시
	// document.getElementById("waterSource").addEventListener("click", function() {
	// 	var ck = $(this).children().hasClass("on");

	// 	if (ck) {
	// 		$(this).children().removeClass("on");
	// 		waterSourceLayer.remove();
	// 	} else {
	// 		$(this).children().addClass("on");

	// 		ajax(true, contextPath+'/vc/selectLmttZone', 'body', '조회중입니다.', null, function (data) {
	// 			if (data != null) {
	// 				waterSourceLayer = tsmap.geoJSON(data, {
	// 					style: function() {
	// 						return {
	// 							weight: 2,
	// 							opacity: 1,
	// 							color: "#FF5A5A",
	// 							dashArray:"3",
	// 							fillOpacity:0.7
	// 						};
	// 					},
	// 					onEachFeature: function(feature, layer){
	// 						//layer.bindPopup(feature.properties.Description);
	// 						layer.bindTooltip("<div class=\"tooltipbox2 type01\"><h4>" + feature.properties.spotNm + "</h4>(" + feature.properties.clCdNm + ")</div>", { closeOnClick: false, autoClose: false, autoPan: false });
	// 					}
	// 				}).addTo(map);
	// 				//map.fitBounds(waterSourceLayer.getBounds());
	// 			}
	// 		});
	// 	}
	// });

	// //통행제한도로 버튼 클릭 시
	// document.getElementById("trafficRestriction").addEventListener("click", function() {
	// 	var ck = $(this).children().hasClass("on");

	// 	if (ck) {
	// 		$(this).children().removeClass("on");
	// 		trRestrictLayer.remove();
	// 		trRestRoadData = null;
	// 	} else {
	// 		if (map.getZoom() < trRestRdMinZoom) {
	// 			map.setZoom(trRestRdMinZoom);
	// 		}
			
	// 		$(this).children().addClass("on");

	// 		ajax(true, contextPath+'/vc/selectLmttRoad', 'body', '조회중입니다.', null, function (data) {
	// 			if (data != null) {
	// 				trRestRoadData = data;
	// 				dispRestRoad();
	// 			}
	// 		});
	// 	}
	// });
	
	//장대터널 버튼 클릭 시
	document.getElementById("longTunnel").addEventListener("click", function() {
		var ck = $(this).children().hasClass("on");

		if (ck) {
			$(this).children().removeClass("on");
			vlTunnelLayer.remove();
			vlTunnelData = null;
		} else {
			$(this).children().addClass("on");

			ajax(true, contextPath+'/vc/selectTunnel', 'body', '조회중입니다.', null, function (data) {
				if (data != null) {
					vlTunnelData = data;
					
					vlTunnelLayer = tsmap.geoJSON(data, {
						style: function(){
							return {
								weight: 3,
								opacity: 1,
								color: "#A349A4",
								dashArray:"5",
								fillOpacity:0.4
							};
						},
						onEachFeature: function(feature, layer){
							layer.bindTooltip("<div class=\"tooltipbox2 type01\"><h4>" + feature.properties.tunnelNm + " 터널</h4><br />노선 : " + feature.properties.routeNm + "<br />총 연장 : " + feature.properties.extn + "</div>", { closeOnClick: false, autoClose: false, autoPan: false });
						}
					}).addTo(map);
				}
			});
		}
	});
	
	// //대응기관 버튼 클릭 시
	// document.getElementById("corInstt").addEventListener("click", function() {
	// 	var ck = $(this).children().hasClass("on");

	// 	if (ck) {
	// 		$(this).children().removeClass("on");
	// 		insttMarkers.clearLayers();
	// 	} else {
	// 		$(this).children().addClass("on");
	// 		dispInsttPOI();
	// 	}
	// });

	// 상세보기 단말기 알림 클릭 이벤트
	document.getElementById("trmnlNotice").addEventListener("click", function() {
		allPopupClose();
		var arg = {};
		
		arg.id=document.getElementById("orgSpread").getAttribute("vin");
		ajax(true, contextPath+'/vc/selectMongoById', 'body', '조회중입니다.', arg, function (data) {
			if (data.onOff != null) {
				if (data.onOff.toUpperCase() == "ON") {  // 온라인 일때만
					var target01Cont  = '<div class="pSearchBox t01"> ';
					target01Cont     += '<table class="wTable t01">';
					target01Cont     += '<colgroup><col width="100" /><col width="170" /><col width="100" /><col width="" /></colgroup>';
					target01Cont     += '<tr>';
					target01Cont     += '<th style="line-height: 1em;">단말 번호</th>';
					target01Cont     += '<th style="line-height: 1em;"><strong>'+document.getElementById("detl_trmnlNo").innerHTML+'</strong></th>';
					target01Cont     += '<th style="line-height: 1em;">전송유형 : </th>';
					target01Cont     += '<td style="line-height: 1em;">';
					target01Cont     += '<input type="radio" name="sndmth" checked="checked" value="P" /> PUSH &nbsp; ';
					target01Cont     += '<input type="radio" name="sndmth" value="S" /> SMS';
					target01Cont     += '</td>';
					target01Cont     += '</tr>';
					target01Cont     += '</table></div>';
					target01Cont     += '<table class="wTable t01 mt30">';
					target01Cont     += '<tr><td style="text-align:right; height:1px;"><p id="byteInfoArea" style="display:none;"><span id="byteInfo">0</span>/80Byte</p></td></tr>';
					target01Cont     += '<tr>';
					target01Cont     += '<td><textarea id="noticeMsg" style="width:98%;height:100px;line-height:1.5em;resize:none;">';
					target01Cont     += '</textarea></td>';
					target01Cont     += '</tr>';
					target01Cont     += '</table>';
					target01Cont     += '<div class="pbtnBox">';
					target01Cont     += '<a href="javascript:void(0)" class="btype01" id="trmnlNoticeCancle" @click="trmnlNoticeCancle()"><span>취소</span></a>';
					target01Cont     += '<a href="javascript:void(0)" class="btype02" id="sendNotice" style="width:100px;"><span>단말기 알림 전송</span></a>';
					target01Cont     += '</div>';

					$("#trmnlNoticePop").kendoDialog({
						width: "700px",
						title: "단말기 알림",
						closable: true,
						modal: false,
						content: target01Cont,
						close: function(){
							//alert(1);
						}
					});
					$("#trmnlNoticePop").data("kendoDialog").open();
					
					// 단말 메세지 전송 방식 변경 이벤트 
					$("input[name='sndmth']").change(function() {

						var radioValue = $(this).val();

						if (radioValue == "P") {
							console.log("푸시");
							$('#noticeMsg').off("keyup", msgKeyUpEventListener);
							$('#byteInfoArea').hide();
						} else if (radioValue == "S") {
							console.log("SMS");
							$('#byteInfoArea').show();
							$('#noticeMsg').on("keyup", {dp: 'byteInfo'}, msgKeyUpEventListener);
							$('#noticeMsg').trigger('keyup'); 	// 입력된 글의 바이트 체크를 위해 keyup 이벤트 강제 발생
						}
					});
				} else {
					alert("차량이 오프라인 상태 입니다.");
				}
			} else {
				alert("차량이 오프라인 상태 입니다.");
			}
		});
	});

	// 운전자에게 전화걸기 클릭이벤트
	document.getElementById("driverCall").addEventListener("click", function() {
		var carRegNo = $.trim($("#detl_car_reg_no").text());
		carTelnoPop(carRegNo);
	});
	

	//관계기관전파 버튼 클릭 이벤트
	document.getElementById("orgSpread").addEventListener("click", function() {
		var arg = {};
		allPopupClose();
		
		arg.trnsprt_plan_no = document.getElementById("routeBtn").getAttribute("plan_no");
		arg.area = document.getElementById("orgSpread").getAttribute("area");
	
		var sms_msg = '[한국교통안전공단 위험물질운송안전관리센터] 위험물질 차량 사고 보고(최초)';
		sms_msg     += '(재난사고 보고)\n';
		sms_msg     += '000 주변 000 차량이 0000 사고 발생';
		sms_msg     += '\n- 발생유형 : ' + document.getElementById("abnormalDetl").innerText;
		sms_msg     += '\n- 차량번호 : ' + document.getElementById("detl_car_reg_no").innerText;
		sms_msg     += '\n- 발생일시 : ' + document.getElementById("detl_occ_dt").innerText;
		sms_msg     += '\n- 발생위치 : ' + document.getElementById("detl_addr").innerText;
		sms_msg     += '\n- 운송물질 : ' + $('#matterTb > tbody > tr > td.mttrNm').text().substring(1, 20);
		sms_msg     += '\n- 인명피해 : ';
		sms_msg     += '\n- 취재동향 : ';
		sms_msg     += '\n- 처리사항 : ';
		
		ajax(true, contextPath+'/vc/selectOrgInfo', 'body', '조회중입니다.', arg, function (data) {
			var target03Cont  = '<span class="ml10">차량전파(사고차량주변)</span><table class="orgtable" style="border-bottom: 1px dotted #CCC; margin-bottom: 15px;">';
			target03Cont     += '<tr><td width="450px;" style="border:0;text-align:left;">';
			target03Cont     += '<input id="txtArndBrd" type="text" style="width:100%;border:0;" value="반경 3km 내 화물차 사고 발생. 주의운전 하시기 바랍니다." />';
			target03Cont     += '</td><td style="border:0;"><a href="javascript:void(0)" class="btype02" id="btnAroundAccInfo" style="width:130px; color:#FFF; height:25px; line-height:25px;">주변차량 전파</a>';
			target03Cont     += '</td></tr></table>';
			target03Cont     += '<span class="ml10">전송 메세지</span><table class="orgtable"><tr><td>';
			target03Cont     += '<textarea id="spreadMsg">' + sms_msg + '</textarea>';
			target03Cont     += '</td></tr>';
			target03Cont     += '</table><br />';
			target03Cont     += '<span class="ml10">관계기관 담당자</span><table class="orgtable" id="orgListTable">';
			target03Cont     += '<colgroup><col width="100" /><col width="160" /><col width="100" /><col width="150" />';
			target03Cont     += '<tr><td>발송여부</td><td>기관명</td><td>담당자</td><td>연락처</td>';
			target03Cont     += '</tr>';

			for(var i=0, len=data.length; i<len; i++) {
				target03Cont     += '<tr>';
				target03Cont     += '<td><input type="checkbox" name="chkOrg" /></td>';
				target03Cont     += '<td>' + data[i].crdnsNm   + '</td>';
				target03Cont     += '<td>' + data[i].chargerNm + '</td>';
				target03Cont     += '<td>' + data[i].mbtlnum   + '</td>';
				target03Cont     += '</tr>';
			}
			
			target03Cont     += '</table>';
			target03Cont     += '<div class="pbtnBox"><a href="javascript:void(0)" class="btype01" id="orgSpreadCancle" @click="orgSpreadCancle()"><span>취소</span></a><a href="javascript:void(0)" class="btype02" id="sendOrgSpread" style="width:100px;"><span>관계기관 전파</span></a></div>';

			$('#orgSpreadPop').kendoDialog({
				width: "700px",
				title: "상황(사고) 전파",
				closable: true,
				modal: false,
				content: target03Cont,
				close: function() {
					//alert(1);
				}
			});

			$('#orgSpreadPop').data("kendoDialog").open();
		});
	});
	
	//상황종료 이벤트 팝업
	document.getElementById("situationEnd").addEventListener("click", function(e) {

		allPopupClose();
		
		var accType = document.getElementById("regitAccident").getAttribute("acc_code");
		var evtType = document.getElementById("regitAccident").getAttribute("evt_type");
		var evtTime = document.getElementById("regitAccident").getAttribute("event_dt");
		var popWinHtml  = '<div class="pSearchBox t01"> ';
		
		if (evtTime.length <= 12) {
			evtTime = '20' + evtTime;
		}
		
		if ( accType != "--") {
			// 사고에 대한 상황종료 팝업 생성
			popWinHtml     += '<table class="wTable t01">';
			popWinHtml     += '<colgroup><col width="150" /><col width="" /></colgroup>';
			popWinHtml     += '<tr>';
			popWinHtml     += '<th>사고상황 내역</th>';
			popWinHtml     += '<td id="abnSummary">' + $('#abnormalDetl').text() + '</td>';
			popWinHtml     += '</tr>';
			popWinHtml     += '</table></div>';
			popWinHtml     += '<form id="situationEndForm">';
			popWinHtml     += '<input type="hidden" name="infoOccDt" value="' + evtTime + '">';
			popWinHtml     += '<input type="hidden" name="acdntTyCd"  value="' + (accType != '--' ? accType : evtType) + '">';
			popWinHtml     += '<table class="wTable t01 mt30">';
			popWinHtml     += '<colgroup><col width="150"><col width="200"><col width=""></colgroup><tbody>';
			popWinHtml     += '<tr>';
			popWinHtml     += '<td>';
			popWinHtml     += '차량번호';
			popWinHtml     += '</td>';
			popWinHtml     += '<td colspan="2">';
			popWinHtml     += '<input name="carRegNo" type="text" class="inp" value="' + document.getElementById('orgSpread').getAttribute("car_reg_no") + '" readonly />';
			popWinHtml     += '<input name="vin" type="hidden" value="' + '차대번호' + '">';
			popWinHtml     += '</td>';
			popWinHtml     += '</tr>';
			popWinHtml     += '<tr>';
			popWinHtml     += '<td>';
			popWinHtml     += '사고처리결과';
			popWinHtml     += '</td>';
			popWinHtml     += '<td>';
			popWinHtml     += '<select id="dlAcdntExitResn" name="acdntEndCd" class="select"></select>';
			popWinHtml     += '</td>';
			popWinHtml     += '<td>';
			popWinHtml     += '<input id="txtAcdntExitResnEtc" name="acdntEndEtc" type="text" class="inp" disabled>';
			popWinHtml     += '</td>';
			popWinHtml     += '</tr>';
			popWinHtml     += '<tr>';
			popWinHtml     += '<td>';
			popWinHtml     += '참고사항';
			popWinHtml     += '</td>';
			popWinHtml     += '<td colspan="2">';
			popWinHtml     += '<textarea id="txtRemark" name="acdntRelisReferCn" class="textarea" style="height:40px; color:#010101;"></textarea>';
			popWinHtml     += '</td>';
			popWinHtml     += '</tr>';
			popWinHtml     += '</tbody></table></form>';
			popWinHtml     += '<div class="pbtnBox">';
			popWinHtml     += '<a href="javascript:void(0)" class="btype01" id="situationEndCancel" @click="situationEndCancel()"><span>취소</span></a>';
			popWinHtml     += '<a href="javascript:void(0)" class="btype02" id="accEndExecute"><span>상황 종료</span></a>';
			popWinHtml     += '</div>';

			$("#situationEndPop").kendoDialog({
				width: "700px",
				title: "사고 상황 종료",
				closable: true,
				modal: false,
				content: popWinHtml,
				close: function() {
					//alert(1);
				}
			});
			
			$("#situationEndPop").data("kendoDialog").open();
			
			$("#dlAcdntExitResn").kendoDropDownList({
		        autoWidth: true,
		        dataTextField: "cdNm",
		        dataValueField: "cdId",
		        dataSource: acdExitMthdCdList,
		        template: "<div><span>${sortOrdr}</span>.<span>${cdNm}</span></div>",
		    	change: function(e) {
		    	    var selText = this.text();
		    	    
		    	    if (selText == "기타") {
		    	    	$('#txtAcdntExitResnEtc').get(0).disabled = false;
		    	    } else {
		    	    	$('#txtAcdntExitResnEtc').get(0).disabled = true;
		    	    }
		    	 }
			});
			
			$("#dlAcdntExitResn").parent().on("keydown", function(e) {
				var kc = e.keyCode;
				
				if (kc >= 48 && kc <= 57) { /* 0-9 */ 
					$('#dlAcdntExitResn').data('kendoDropDownList').select(kc-49);
					$('#dlAcdntExitResn').data('kendoDropDownList').close();
					$('#dlAcdntExitResn').data('kendoDropDownList').trigger("change");
				}
			});
		} else if ( evtType != "--") {
			// 이상운행에 대한 상황종료 팝업 생성
			popWinHtml     += '<table class="wTable t01">';
			popWinHtml     += '<colgroup><col width="150" /><col width="" /></colgroup>';
			popWinHtml     += '<tr>';
			popWinHtml     += '<th>이상상황 내역</th>';
			popWinHtml     += '<td id="abnSummary">' + $('#abnormalDetl').text() + '</td>';
			popWinHtml     += '</tr>';
			popWinHtml     += '</table></div>';
			popWinHtml     += '<form id="situationEndForm">';
			popWinHtml     += '<input type="hidden" name="infoOccDt" value="' + evtTime + '">';
			popWinHtml     += '<input type="hidden" name="abnrmlCd"  value="' + (accType != '--' ? accType : evtType) + '">';
			popWinHtml     += '<table class="wTable t01 mt30">';
			popWinHtml     += '<colgroup><col width="150"><col width="200"><col width=""></colgroup><tbody>';
			popWinHtml     += '<tr>';
			popWinHtml     += '<td>';
			popWinHtml     += '차량번호';
			popWinHtml     += '</td>';
			popWinHtml     += '<td colspan="2">';
			popWinHtml     += '<input name="carRegNo" type="text" class="inp" value="' + document.getElementById('orgSpread').getAttribute("car_reg_no") + '" readonly />';
			popWinHtml     += '<input name="vin" type="hidden" value="' + '차대번호' + '">';
			popWinHtml     += '</td>';
			popWinHtml     += '</tr>';
			popWinHtml     += '<tr>';
			popWinHtml     += '<td>';
			popWinHtml     += '차량위치';
			popWinHtml     += '</td>';
			popWinHtml     += '<td>';
			popWinHtml     += '<select id="dlAbnExitSttn" name="abnrmlUndstnCd" class="select"></select>';
			popWinHtml     += '</td>';
			popWinHtml     += '<td>';
			popWinHtml     += '<input id="txtAbnExitSttnEtc" name="abnrmlUndstnEtc" type="text" class="inp" disabled>';
			popWinHtml     += '</td>';
			popWinHtml     += '</tr>';
			popWinHtml     += '<tr>';
			popWinHtml     += '<td>';
			popWinHtml     += '확인방법';
			popWinHtml     += '</td>';
			popWinHtml     += '<td>';
			popWinHtml     += '<select id="dlAbnExitMthd" name="abnrmlNtcnCnfirmCd" class="select"></select>';
			popWinHtml     += '</td>';
			popWinHtml     += '<td>';
			popWinHtml     += '<input id="txtAbnExitMthdEtc" name="abnrmlNtcnCnfirmEtc" type="text" class="inp" disabled>';
			popWinHtml     += '</td>';
			popWinHtml     += '</tr>';
			popWinHtml     += '<tr>';
			popWinHtml     += '<td>';
			popWinHtml     += '해제사유';
			popWinHtml     += '</td>';
			popWinHtml     += '<td>';
			popWinHtml     += '<select id="dlAbnExitResn" name="abnrmlNtcnRelisCd" class="select"></select>';
			popWinHtml     += '</td>';
			popWinHtml     += '<td>';
			popWinHtml     += '<input id="txtAbnExitResnEtc" name="abnrmlNtcnRelisEtc" type="text" class="inp" disabled>';
			popWinHtml     += '</td>';
			popWinHtml     += '</tr>';
			popWinHtml     += '<tr>';
			popWinHtml     += '<td>';
			popWinHtml     += '참고사항';
			popWinHtml     += '</td>';
			popWinHtml     += '<td colspan="2">';
			popWinHtml     += '<textarea id="txtRemark" name="relisReferCn" class="textarea" style="height:40px; color:#010101;"></textarea>';
			popWinHtml     += '</td>';
			popWinHtml     += '</tr>';
			popWinHtml     += '</tbody></table></form>';
			popWinHtml     += '<div class="pbtnBox">';
			popWinHtml     += '<a href="javascript:void(0)" class="btype01" id="situationEndCancel" @click="situationEndCancel()"><span>취소</span></a>';
			popWinHtml     += '<a href="javascript:void(0)" class="btype02" id="situationEndExecute"><span>상황 종료</span></a>';
			popWinHtml     += '</div>';

			$("#situationEndPop").kendoDialog({
				width: "700px",
				title: "이상 상황 종료",
				closable: true,
				modal: false,
				content: popWinHtml,
				close: function(){
					//alert(1);
				}
			});
			
			$("#situationEndPop").data("kendoDialog").open();
			
			$("#dlAbnExitSttn").kendoDropDownList({
		        autoWidth: true,
		        dataTextField: "cdNm",
		        dataValueField: "cdId",
		        dataSource: abnExitSttnCdList,
		        template: "<div><span>${sortOrdr}</span>.<span>${cdNm}</span></div>",
		    	change: function(e) {
		    	    var selText = this.text();
		    	    
		    	    if (selText == "기타") {
		    	    	$('#txtAbnExitSttnEtc').get(0).disabled = false;
		    	    } else {
		    	    	$('#txtAbnExitSttnEtc').get(0).disabled = true;
		    	    }
		    	 }
			});
			
			$("#dlAbnExitMthd").kendoDropDownList({
		        autoWidth: true,
		        dataTextField: "cdNm",
		        dataValueField: "cdId",
		        dataSource: abnExitMthdCdList,
		        template: "<div><span>${sortOrdr}</span>.<span>${cdNm}</span></div>",
		    	change: function(e) {
		    	    var selText = this.text();
		    	    
		    	    if (selText == "기타") {
		    	    	$('#txtAbnExitMthdEtc').get(0).disabled = false;
		    	    } else {
		    	    	$('#txtAbnExitMthdEtc').get(0).disabled = true;
		    	    }
		    	 }
			});
			
			$("#dlAbnExitResn").kendoDropDownList({
		        autoWidth: true,
		        dataTextField: "cdNm",
		        dataValueField: "cdId",
		        dataSource: abnExitResnCdList,
		        template: "<div><span>${sortOrdr}</span>.<span>${cdNm}</span></div>",
		    	change: function(e) {
		    	    var selText = this.text();
		    	    
		    	    if (selText == "기타") {
		    	    	$('#txtAbnExitResnEtc').get(0).disabled = false;
		    	    } else {
		    	    	$('#txtAbnExitResnEtc').get(0).disabled = true;
		    	    }
		    	 }
			});
			
			$("#dlAbnExitSttn").parent().on("keydown", function(e) {
				var kc = e.keyCode;
				
				if (kc >= 48 && kc <= 57) { /*0-9*/ 
					$('#dlAbnExitSttn').data('kendoDropDownList').select(kc-49);
					$('#dlAbnExitSttn').data('kendoDropDownList').close();
					$('#dlAbnExitSttn').data('kendoDropDownList').trigger("change");
				}
			});
			
			$("#dlAbnExitMthd").parent().on("keydown", function(e) {
				var kc = e.keyCode;
				
				if (kc >= 48 && kc <= 57) { /*0-9*/ 
					$('#dlAbnExitMthd').data('kendoDropDownList').select(kc-49);
					$('#dlAbnExitMthd').data('kendoDropDownList').close();
					$('#dlAbnExitMthd').data('kendoDropDownList').trigger("change");
				}
			});
			
			$("#dlAbnExitResn").parent().on("keydown", function(e) {
				var kc = e.keyCode;
				
				if (kc >= 48 && kc <= 57) { /*0-9*/ 
					$('#dlAbnExitResn').data('kendoDropDownList').select(kc-49);
					$('#dlAbnExitResn').data('kendoDropDownList').close();
					$('#dlAbnExitResn').data('kendoDropDownList').trigger("change");
				}
			});
		} else if ( evtType == "--" && accType == "--") {
			// 정상 상태 일때는 상황 종료 팝업 안 뜸
			alert("차량이 정상 상태 입니다.");
		}
	});
	
	//사고전환 이벤트 팝업
	document.getElementById("regitAccident").addEventListener("click", function(){
		allPopupClose();
		if (document.getElementById("regitAccident").getAttribute("acc_code") == '--'){
			var arg={};
			arg.cdCl = 'ACDNT_TY_CD';
			ajax(true, contextPath+'/cmmn/CommonCode', 'body', '조회중입니다.', arg, function (data) {
				var target05Cont = '사고 유형: <select class="select" name="accCd" id="accCd" style="width:230px;">';
				for (var i=0, len=data.length; i<len; i++) {
					var item = data[i];
					if(item.cdId != 'A03' ) {
						target05Cont+="<option value='"+item.cdId+"'>"+item.cdDc+"</option>";
					}
				}
				target05Cont     += '</select>';
				target05Cont     += '<div class="pbtnBox">';
				target05Cont     += '<a href="javascript:void(0)" class="btype01" id="regitAccidentCancle" @click="regitAccidentCancle()"><span>취소</span></a>';
				target05Cont     += '<a href="javascript:void(0)" class="btype02" id="regitAccidentExecute"><span>사고 전환</span></a>';
				target05Cont     += '</div>';
				$("#regitAccidentPop").kendoDialog({
					width: "400px",
					title: "사고 전환",
					closable: true,
					modal: false,
					content: target05Cont,
					close: function() {
						//alert(1);
					}
				});
				$("#regitAccidentPop").data("kendoDialog").open();
			});
		}else{
			alert("선택하신 차량은 사고차량 입니다.");
		}
	});

	//사고신고 이벤트 팝업(사업자)
	document.getElementById("reportAccident").addEventListener("click", function(){
		allPopupClose();
		if (document.getElementById("regitAccident").getAttribute("acc_code") == '--'){
			var arg={};
			arg.cdCl = 'ACDNT_TY_CD';
			ajax(true, contextPath+'/cmmn/CommonCode', 'body', '조회중입니다.', arg, function (data) {

				var target07Cont = '<div class="popupWrap"> ';
				target07Cont     += '<table class="wTable popTable02"> ';
				target07Cont     += '<colgroup><col width="100px" /><col width="" /></colgroup>';
				target07Cont     += '<tbody>';
				target07Cont     += '<tr>';
				target07Cont     += '<th>사고유형</td>';
				target07Cont     += '<td><select class="select" name="reportAccCd" id="reportAccCd">'
				for (var i=0, len=data.length; i<len; i++) {

					var item = data[i];
					if(item.cdId != 'A03' ){
						target07Cont+="<option value='"+item.cdId+"'>"+item.cdDc+"</option>";
					}
				}
				target07Cont     +=	'</select></td>';
				target07Cont     += '</tr>';
				target07Cont     += '<tr>';
				target07Cont     += '<th>설명</td>';
				target07Cont     += '<td><textarea id="reportAccDc"></textarea></td>';
				target07Cont     += '</tr>';
				target07Cont     += '</tbody>';
				target07Cont     += '</table> ';
				target07Cont     += '</div>';
				target07Cont     += '<div class="pbtnBox">';
				target07Cont     += '<a href="javascript:void(0)" class="btype01" id="reportAccidentCancle" @click="reportAccidentCancle()"><span>취소</span></a>';
				target07Cont     += '<a href="javascript:void(0)" class="btype02" id="reportAccidentExecute"><span>사고 신고</span></a>';
				target07Cont     += '</div>';

				$("#reportAccidentPop").kendoDialog({
					width: "700px",
					title: "사고 신고",
					closable: true,
					modal: false,
					content: target07Cont,
					close: function(){
					}
				});

				 $("#reportAccidentPop").data("kendoDialog").open();
			});
		}else{
			alert("선택하신 차량은 사고차량 입니다.");
		}
	});

	//방재정보 팝업
	document.getElementById("bangjaeBtn").addEventListener("click", function() {
		var firstMatter = "";
		var target05Cont  = '<div class="pSearchBox t01"> ';
		target05Cont     += '<table class="wTable t01">';
		target05Cont     += '<colgroup><col width="100" /><col width="" /></colgroup>';
		target05Cont     += '<tr>';
		target05Cont     += '<th style="padding-left:40px;">물질 선택</th>';
		target05Cont     += '<td style="padding: 0 15px;">';
		target05Cont     += '<select class="select" name="matterS" id="matterS">';

		$("#matterTb tr").each(function(index, item) {
			if (index ==0) {
				firstMatter = $(this).find("td").eq(3).html();
			}
			target05Cont     += '<option value="'+$(this).find("td").eq(3).html()+'">'+$(this).find("td").eq(2).html()+'</option>';
		});

		target05Cont     += '</select>';
		target05Cont     += '</td>';
		target05Cont     += '</tr>';
		target05Cont     += '</table></div>';

		if ( firstMatter != "") {
			var arg={};
			arg.cas_no = firstMatter;
			ajax(true, contextPath+'/vc/selectMtChncksprvnbeInfo', 'body', '조회중입니다.', arg, function (data) {
				if (data != null) {
					target05Cont     += '<div class="bangjaeCont" id="bj_cont">';
					target05Cont     += '<table class="orgtable">';
					target05Cont     += '<colgroup><col width="120" /><col width="240" /></colgroup>';
					target05Cont     += '<tr><td>항목</td><td>내용</td></tr>';
					target05Cont     += '<tr><td>물질명</td><td>'+isUndefined(data.dgstNm)+'</td></tr>';
					target05Cont     += '<tr><td>물질영문명</td><td>'+isUndefined(data.dgstEngNm)+'</td></tr>';
					target05Cont     += '<tr><td>CAS번호</td><td>'+isUndefined(data.casNo)+'</td></tr>';
					target05Cont     += '<tr><td>소화방법</td><td>'+isUndefined(data.digstnMth)+'</td></tr>';
					target05Cont     += '<tr><td>소화제 및 장비</td><td>'+isUndefined(data.digstnEqpmn)+'</td></tr>';
					target05Cont     += '<tr><td>연소생성물</td><td>'+isUndefined(data.cmbsMttr)+'</td></tr>';
					target05Cont     += '<tr><td>일반적대처요령</td><td>'+isUndefined(data.prvnbeInfo)+'</td></tr>';
					target05Cont     += '<tr><td>방제약품 및 장비</td><td>'+isUndefined(data.prvnbeEqpmn)+'</td></tr>';
					target05Cont     += '<tr><td>초기이격거리</td><td>'+isUndefined(data.eryyGapDist)+'</td></tr>';
					target05Cont     += '<tr><td>방호활동거리</td><td>'+isUndefined(data.prvnbeDist)+'</td></tr>';
					target05Cont     += '<tr><td>누출방지 및 개인보호구역</td><td>'+isUndefined(data.indvdlPrtcEqpmn)+'</td></tr>';
					target05Cont     += '</table>';
					target05Cont     += '</div>';
				} else {
					target05Cont     += '<div class="bangjaeCont" id="bj_cont">';
					target05Cont     += '해당 물질 관련 정보가 없습니다.';
					target05Cont     += '</div>';
				}

				$("#bangjaePop").kendoDialog({
					width: "700px",
					height: "710px",
					title: "방재 정보 조회",
					closable: true,
					modal: false,
					content: target05Cont,
					close: function(){
						//alert(1);
					}
				});

				$("#bangjaePop").data("kendoDialog").open();
				$("#matterS").kendoDropDownList();

			});
		} else {
			alert("계획된 운송물질이 없습니다.");
		}
	});
	
	// 운송계획 제출 이력 버튼 클릭
	document.getElementById("btnPlanHist").addEventListener("click", function() {
	    var arg = {};
        var crn = $('#detl_car_reg_no').text();

        if (crn != null && crn != "") {
            options.carRegNo = crn;
        } else {
            alert("차량을 선택해 주세요.");
            return;
        }

		var writeBoxCont  = '';
		writeBoxCont     += '<table id="targetGrid05">'; 
		writeBoxCont     += '<colgroup><col width="100" /><col width="80" /><col width="80" /><col width="70" /><col width="80" /><col width="" /><col width="100" /><col width="100" /></colgroup>'; 
		writeBoxCont     += '<thead>'; 
		writeBoxCont     += '<tr>'; 
		writeBoxCont     += '<th data-field="trnsprtPlanNo">운송계획번호</th>';
		writeBoxCont     += '<th data-field="presentnDe">제출일자</th>';
		writeBoxCont     += '<th data-field="stdrDe">출발예정일자</th>';
		writeBoxCont     += '<th data-field="drverNm">운전자</th>';
		writeBoxCont     += '<th data-field="drverTelno">연락처</th>';
		writeBoxCont     += '<th data-field="mttrNm">운송물질</th>';
		writeBoxCont     += '<th data-field="strtpntNm">출발지</th>';
		writeBoxCont     += '<th data-field="dstnNm">도착지</th>';
		writeBoxCont     += '</tr>';
		writeBoxCont     += '</thead>';
		writeBoxCont     += '<tbody id="targetGrid05-body">';
		writeBoxCont     += '<tr>';
		writeBoxCont     += '<td colspan="8" class="emptyRow">데이터가 없습니다.</td>';
		writeBoxCont     += '</tr>';
		writeBoxCont     += '</tbody>';
		writeBoxCont     += '</table>'; 

    	$("#befPlanListPop").kendoDialog({
			width:		"900px",
			title:		"운송계획제출이력(" + crn + ")",
			closable:	true,
			modal:		true,
			content:	writeBoxCont,
			close:		function() { /* alert("닫힘"); */}
		}).data("kendoDialog").open();
    	
		// 그리드 생성
		$("#targetGrid05").kendoGrid({
			dataSource  : {
                transport: {
                    read:{
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        url: contextPath + '/vc/readBeforePlanList',
                        type: "POST",
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader($("meta[name='_csrf_header']").attr("content"), $("meta[name='_csrf']").attr("content"));
                        }
                    },
                    parameterMap: function(options) {
                        options.carRegNo = crn;
                        
                        return JSON.stringify(options);
                    }
                },
				schema: {
                    data: "data",
                    total: "total",
					model: {
						fields: {
							trnsprtPlanNo	: { type: "string" },
							presentnDe		: { type: "string" },
							stdrDe			: { type: "string" },
							drverNm			: { type: "string" },
							drverTelno		: { type: "string" },
							mttrNm			: { type: "string" },
							strtpntNm		: { type: "string" },
							dstnNm			: { type: "string" }
						}
					}
				},
                pageSize: 5,
                serverPaging: true
			},
            pageable: {
                pageSizes: [5, 10, 20],
                buttonCount: 3
            },
			navigatable: true,
			height: 350, 
			editable: false,
			resizable: true,
			selectable  : "row"
		});
	});
	
	// 필터 초기화 버튼 클릭 시
	document.getElementById("filterReset").addEventListener("click", function() {

		// 운행상태
		document.getElementById("chkStatus01").checked = true;
		document.getElementById("chkStatus03").checked = false;
		document.getElementById("chkStatus04").checked = false;
		// 차량상태
		document.getElementById("carState01").checked = true;
		document.getElementById("carState02").checked = false;
		document.getElementById("carState03").checked = false;
		// 사전운송계획
		document.getElementById("carPlan01").checked = true;
		document.getElementById("carPlan02").checked = false;
		document.getElementById("carPlan03").checked = false;

		// 주무부처
		var orgDrop = $("#org").data("kendoDropDownList");
		orgDrop.select(0);
		// 지역
		var areaDrop = $("#area").data("kendoDropDownList");
			// 지자체 권한 지역필터
			if (auth == "Z") {
				var areaDrop = $("#area").data("kendoDropDownList");
				areaDrop.select(function(dataItem) {
				    return dataItem.sidoCd === ldong;
				});
				$("#area").attr("disabled", true);
				areaDrop.enable(false);
				document.getElementById('area').onchange();
			} else {
				areaDrop.select(0);
			}
			// 지자체 권한 지역필터 하단
			
		// 시도 경계 초기화
		for (var i=0, len= sidoAreaPolygonGroup.length; i<len; i++) {
			map.removeLayer(sidoAreaPolygonGroup[i]);
		}
		sidoAreaPolygonGroup=[];

		// 물질
		document.getElementById("matterName").value="";
		// 적재량
		document.getElementById("quantityLow").value="0";
		document.getElementById("quantityHigh").value="9999";
	});
	
	//경로보기 이벤트
	$("body").on("click","#routeBtn",function() {  // 경로보기 버튼
		if (routeMarkerGroup.length > 0) {  // 경로 지움
			for (var i=0, len= routeMarkerGroup.length; i<len; i++) {
				map.removeLayer(routeMarkerGroup[i]);
			}
			map.removeLayer(routePolyline);
			routeMarkerGroup=[];
		} else {
			var trnsprt_plan_no = document.getElementById("routeBtn").getAttribute("plan_no");
			if (trnsprt_plan_no != '' && trnsprt_plan_no!='--') {
				var arg = {};
				arg.trnsprt_plan_no = trnsprt_plan_no;

				var startIcon = tsmap.icon({  // 출발
					iconUrl: contextPath+'/images/ico/start_marker.png',
					iconSize:   [32, 32]
				});
				var destiIcon = tsmap.icon({  // 도착
					iconUrl: contextPath+'/images/ico/arrive_marker.png',
					iconSize:   [32, 32]
				});
				var viaIcon1 = tsmap.icon({  		// 경유 마커1
					iconUrl: contextPath + '/images/ico/way_marker1.png',
					iconSize:   [32, 32]
				});
				var viaIcon2 = tsmap.icon({  		// 경유 마커2
					iconUrl: contextPath + '/images/ico/way_marker2.png',
					iconSize:   [32, 32]
				});
				var viaIcon3 = tsmap.icon({  		// 경유 마커3
					iconUrl: contextPath + '/images/ico/way_marker3.png',
					iconSize:   [32, 32]
				});
				var viaIcon4 = tsmap.icon({  		// 경유 마커4
					iconUrl: contextPath + '/images/ico/way_marker4.png',
					iconSize:   [32, 32]
				});
				var viaIcon5 = tsmap.icon({  		// 경유 마커5
					iconUrl: contextPath + '/images/ico/way_marker5.png',
					iconSize:   [32, 32]
				});

				ajax(true, contextPath+'/vc/selectCoursDetailInfo', 'body', '조회중입니다.', arg, function (data) {
					if (data!=null && data.path != null) {

						var encoded = data.path.geo;
						routePolyline = tsmap.Polyline.fromEncoded(encoded).addTo(map);
						routePolyline.on('click', onPolyClick);
						var latlngs = routePolyline.getLatLngs();
						// 출발지점 마커
						var marker = tsmap.marker(latlngs[0], {icon:startIcon}).addTo(map);
						routeMarkerGroup[routeMarkerGroup.length] = marker;
						// 도착지점 마커
						var arrmarker = tsmap.marker(latlngs[latlngs.length-1], {icon:destiIcon}).addTo(map);

						routeMarkerGroup[routeMarkerGroup.length] = arrmarker;

						var bound_rec = [[data.path.boundLtX, data.path.boundLtY], [data.path.boundRbX, data.path.boundRbY]];
						map.fitBounds(bound_rec);

						if (data.via.length > 0)  {
							for (var i=0; i < data.via.length; i++) {
								var tmpIcon = 'viaIcon'+(i+1);
								var viaMarker = tsmap.marker(new tsmap.latLng(data.via[i].wayY, data.via[i].wayX), {icon:eval(tmpIcon)}).addTo(map);
								routeMarkerGroup[routeMarkerGroup.length] = viaMarker;
							}
						}
					} else {
						alert("경로가 없습니다.");
					}
				});
			} else {
				alert("등록된 운송계획경로가 없습니다.");
			}
		}
	});
}

/**
 * @description  : 통행제한도로 표출
 */
var dispRestRoad = function() {
	if (trRestrictLayer != undefined) {
		trRestrictLayer.clearLayers();
	}
	
	// 폴리라인에 포함된 포인트 다 돌면서 화면 내에 포함된 점이 하나라도 있으면 그림. 
	if (map.getZoom() >= trRestRdMinZoom) {
		var east = map.getBounds().getEast();
		var west = map.getBounds().getWest();
		var north = map.getBounds().getNorth();
		var south = map.getBounds().getSouth();

		// 제한도로 레이어 초기화
		trRestrictLayer = tsmap.geoJSON([], { 
			style: { weight: 5, opacity: 0.7, color: "#60C5F1", dashArray:"5", fillOpacity:0.5 },
			onEachFeature: function(feature, layer) {
				layer.bindTooltip("<div class=\"tooltipbox2 type01\"><h4>통행제한도로</h4><br />요일 : " + feature.properties.day + "<br />대상 : 화물차<br />시간 : " + feature.properties.time + "</div>", { closeOnClick: false, autoClose: false, autoPan: false	});
			}
		}).addTo(map);
		
		// 현재범위 내의 제한도로 표시
		trRestRoadData.features.forEach(function (item, index, array) {
			item.geometry.coordinates.forEach(function (coord) {
				var x = coord[0]; 
				var y = coord[1];
				
				if (x > west && x < east) {
					if (y > south && y < north) {
						trRestrictLayer.addData(item);
						return;
					}
				}
			});
		});
	}
}

// 방재기관 POI 표출
var dispInsttPOI = function() {
	//if (insttLayer != undefined) {
	//	insttLayer.clearLayers();
	//}
	
	ajax(true, contextPath+'/vc/selectInsttInfo', 'body', '조회중입니다.', {}, function (data) {
		insttMarkers.clearLayers();
		
		if (data != null) {			
			var ipIcon = tsmap.icon({  		// 경찰서 마커
				iconUrl: contextPath + '/images/ico/ico_ip.png',
				iconSize:   [34, 34]
			});
			var ifIcon = tsmap.icon({  		// 소방서 마커
				iconUrl: contextPath + '/images/ico/ico_if.png',
				iconSize:   [34, 34]
			});

			if (data.length > 0)  {
				for (var i=0; i < data.length; i++) {
					var insttMaker = null;
					
					if (data[i].sclas == "경찰서") {
						insttMaker = tsmap.marker(new tsmap.latLng(data[i].yCrd, data[i].xCrd), {icon:ipIcon});
						insttMaker.bindTooltip("<div class=\"tooltipbox2 type02\"><h4>" + data[i].spotNm + "</h4>연락처 : " + nvl(data[i].telno) + "</div>", { closeOnClick: false, autoClose: false, autoPan: false });
					} else if (data[i].sclas == "소방서") {
						insttMaker = tsmap.marker(new tsmap.latLng(data[i].yCrd, data[i].xCrd), {icon:ifIcon});
						insttMaker.bindTooltip("<div class=\"tooltipbox2 type01\"><h4>" + data[i].spotNm + "</h4>연락처 : " + nvl(data[i].telno) + "</div>", { closeOnClick: false, autoClose: false, autoPan: false });
					}
					
					if (insttMaker != null) {
						insttMaker.addTo(insttMarkers);
					}
				}
				
				insttMarkers.addTo(map);
			}
		} else {
			alert("조회 결과가 없습니다.");
		}
	});
}

/**
 * @description  : 실시간 이동 차량 데이터 표출
 */
var realCarInfoList = function(item, stsCd) {
	var evt_cd = item.evtType==null?"":item.evtType;
	var acc_cd = item.accCode==null?"":item.accCode;
	var currEvtAcc = evt_cd+acc_cd;
	var classOnOff = item.onOff==null?"":item.onOff.toLowerCase();
	var attrOnOff = item.onOff==null?"":item.onOff.toUpperCase();

	var normal = document.getElementById("normalCarList");
	var abnormal = document.getElementById("abnormalCarList");
	var acc = document.getElementById("accCarList");
	var addStr = "";

	var extElem = null;
	var idStr = item.id.match(/[A-z0-9]+/);

	if (idStr == null) {
		return false;
	}

	extElem = document.getElementById("list" + idStr.toString());

	if (extElem == null) {

		addStr += "<li id='list"+idStr+"' class='sts0"+stsCd+"' onClick=\"detlInfoSelect(\'"+idStr+"\', \'N\');\" style='cursor:pointer' evtAcc='"+currEvtAcc+"' onOff='"+attrOnOff+"'>";
		addStr += "<span>"+item.carRegNo+"</span>";
		addStr += "<div class='btn'>";

		if (auth == "M" || auth == "S" ) {  // 관리자 및 관제요원 권한
		 	 addStr += "<a href='javascript:void(0)' class='"+classOnOff+"' onClick=\"messageMiniBtn(event, \'"+idStr+"\');\">";
		} else {
			addStr += "<a href='javascript:void(0)' class='"+classOnOff+"' >";
		}

		addStr += "<img src='"+contextPath+"/images/ico/ico_sns01.png' />";
		addStr += "</a>";

		if(auth == "M" || auth == "S") {  // 관리자 및 관제요원 권한
			addStr += "<a href='javascript:void(0)' class='" + classOnOff + "' onClick=\"callMiniBtn(event, \'" + idStr + "\', \'" + item.carRegNo + "\', \'" + item.trnsprtPlanNo + "\');\">";
		}else{
			addStr += "<a href='javascript:void(0)' class='"+classOnOff+"' >";
		}

		addStr += "<img src='"+contextPath+"/images/ico/ico_sns02.png' />";
		addStr += "</a>";
		addStr += "</div>";
		addStr += "</li>";

		if (stsCd=="3") {
			normal.insertAdjacentHTML('afterbegin',addStr);
		} else if (stsCd=="2") { //이상
			abnormal.insertAdjacentHTML('afterbegin',addStr);
		} else {  //사고
			acc.insertAdjacentHTML('afterbegin',addStr);
		}
	} else if (extElem.getAttribute("evtAcc") != currEvtAcc) { // 이상/사고/정상 상태가 바뀌었을 때
		extElem.parentNode.removeChild(extElem);

		addStr = "<li id='list"+ idStr +"' class='sts0"+stsCd+"' onClick=\"detlInfoSelect(\'"+ idStr +"\', \'N\');\" style='cursor:pointer' evtAcc='"+currEvtAcc+"' onOff='"+attrOnOff+"'>" +
			"<span>"+item.carRegNo+"</span>" +
			"<div class='btn'>" +
			"<a href='javascript:void(0)' class='"+classOnOff+"' onClick=\"messageMiniBtn(event, \'"+ idStr +"\');\">" +
			"<img src='"+contextPath+"/images/ico/ico_sns01.png' />" +
			"</a>" +
			"<a href='javascript:void(0)' class='"+classOnOff+"' onClick=\"callMiniBtn(event, \'"+ idStr+"\', \'"+item.carRegNo+"\', \'"+item.trnsprtPlanNo+"\');\">" +
			"<img src='"+contextPath+"/images/ico/ico_sns02.png' />" +
			"</a>" +
			"</div>" +
			"</li>";
		if (stsCd=="3") {
			normal.insertAdjacentHTML('afterbegin',addStr);
		} else if (stsCd=="2") { //이상
			abnormal.insertAdjacentHTML('afterbegin',addStr);
		} else {  //사고
			acc.insertAdjacentHTML('afterbegin',addStr);
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
}

/**
 * @description  : 실시간 차량 정보 필터링
 */
var carFiltering = function(item) {

	var delYn = "N";
	var accYn = 'N';
	var accIndex;
	var accLen =  accidentState.length;

	for (var i = 0, len= accLen; i<len; i++){   // 이미 사고로 저장되어 있는지 확인
		if (accidentState[i] == item.id){
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
		
		var accIcon = tsmap.icon({  // 사고
			iconUrl: contextPath+'/images/ico/red'+getOrgImgIcon(item.org)+'_'+angle+'.png',
			iconSize:   [55, 55]
		});

		var xx = item.coord.x=="--"?"0":item.coord.x;
		var yy = item.coord.y=="--"?"0":item.coord.y;
		
		if (xx > 0 && yy > 0) {
			var marker = tsmap.marker(new tsmap.latLng(yy, xx), {
				icon: accIcon,
				keyboard: false
			}).bindPopup(contents, {
				closeOnClick: false,
				autoClose: false,
				autoPan: false
			}).addTo(map).on('click', function (e) {
				markerClick(item.id, e);
			});	//지도에 마커 추가
			var marker2 = tsmap.marker(new tsmap.latLng(127.541242, 36.451632), {
				icon: accIcon,
				keyboard: false
			}).bindPopup(contents, {
				closeOnClick: false,
				autoClose: false,
				autoPan: false
			}).addTo(map).on('click', function (e) {
				markerClick(item.id, e);
			});	//지도에 마커 추가

			// marker 팝업 여부 상태값 저장
			var tempId = item.id;

			//현재 선택된 차량만 팝업을 노출한다.
			if(currSelectCarId == tempId) {
				marker.openPopup();
			}

			accMarkerGroup[accMarkerGroup.length] = marker;
			accMarkerGroup[accMarkerGroup.length] = marker2;
		}

		if ( accYn == 'N') {  // 사고 상태로 저장되어 있지 않은 것만
			if (xx > 0 && yy > 0) {
				locErrorFlag = "1";
				map.setView(new tsmap.latLng(yy, xx), 15);
			} else {
				if(locErrorFlag == "1") {
					alert("위치좌표가 유효하지 않습니다.");
				}
				
				locErrorFlag = "2";
			}

			accidentState[accidentState.length] = item.id;
			currSelectCarId = "";

			if (firstViewNoPopup == "NOPOPUP") {  // 화면 진입 시 이미 사고인 차량은 사고팝업 안띄움
				detlInfoSelect(item.id, 'N');
			} else {
				detlInfoSelect(item.id, 'Y');
			}

			var ck = $(".mpToggle").hasClass("on");
			if(ck){
				$(".mpToggle").removeClass("on");
				$(".mpbCont, .mpbHeader").show();
			}
		}

		if (currSelectCarId != "") {   // 현재 선택된 차량
			if (routeMarkerGroup != null && routeMarkerGroup.length == 0) { // 경로보기 상태가 아닐 때만
				if ( item.id == currSelectCarId ) {
					if (locErrorFlag == "1") {		// 좌표값이 정상이 아니면
						marker.setZIndexOffset(1000);
						
						if (bounceTarget != item.id) {
							marker.setBouncingOptions({
								bounceHeight: 20,    // height of the bouncing
								bounceSpeed: 90,    // bouncing speed coefficient
								exclusive: true,  // if this marker bouncing all others must stop
							}).bounce(2);
							bounceTarget = item.id;
						}
					}
				}
			}
		}
	} else {
		if (accYn == 'Y') {  // 사고났다가 정상으로 바뀌었을 때 배열에서 제거, 마커 제거
			accidentState.splice(accIndex, 1);
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
		
		if (mttrty == "" || mttrty == "--" || mttrty != $("#org option:selected").val()) {
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
			for (var k=0, len=item.matterInfo.length; i<len; i++){
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
				for (var j=0, len=item.matterInfo.length; j<len; j++){
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
}

/**
 * @description  : 시도 리스트 조회
 */
var selectAreaSidoList = function(data) {

	var arr = [];

	ajax(true, contextPath+'/cmmn/selectAreaSidoList', 'body', '처리중입니다.', {}, function (data) {
		areaCdList = data;	// 다른 곳에서도 쓰기 위해 전역변수(areaCdList)에 저장.

		$("#area").kendoDropDownList({
            optionLabel: {
            	sidoNm: "전체",
            	sidoCd: "00"
            },
            autoWidth: true,
            dataTextField: "sidoNm",
            dataValueField: "sidoCd",
            dataSource: areaCdList
		});
			// 지자체 권한 지역필터
			if (auth == "Z") {
				var areaDrop = $("#area").data("kendoDropDownList");
				areaDrop.select(function(dataItem) {
				    return dataItem.sidoCd === ldong;
				});
				$("#area").attr("disabled", true);
				areaDrop.enable(false);
				document.getElementById('area').onchange();
			} else {
				var areaDrop = $("#area").data("kendoDropDownList");
				areaDrop.select(0);
			}
			// 지자체 권한 지역필터 하단		

	});
}

/**
 * @description  : 주무부처 리스트 조회
 */
var selectDgstOrgList = function(data) {

	var arr = [];
	var arg={};
	arg.cdCl = 'DGST_DIV_CD';
	ajax(true, contextPath+'/cmmn/CommonCode', 'body', '조회중입니다.', arg, function (data) {
		arr[0] = "<option value='00'>전체</option>";
		for (var i=0, len=data.length; i<len; i++) {
			var item = data[i];
			arr[i+1]="<option value='"+item.cdId+"'>"+item.cdDc+"</option>";
		}
		document.getElementById("org").innerHTML=arr.join("");
		$("#org").kendoDropDownList();
	});

}

/**
 * @name         : selectExitCdList
 * @description  : 상황해제코드 다중 목록 조회
 * @date         : 2020. 03. 20.
 * @author	     : lwc
 */
var selectExitCdList = function(data) {
	var arr = [];
	var arg={};
	arg.cdClList = ['SRCWTSUP_UNDSTN_CD', 'SRCWTSUP_NTCN_RELIS_CD', 'SRCWTSUP_NTCN_CNFIRM_CD', 'ACDNT_UNDSTN_CD', 'ACDNT_NTCN_RELIS_CD', 'ACDNT_NTCN_CNFIRM_CD', 'ABNRML_NTCN_STTUS_CD', 'ACDNT_END_CD'];
	
	ajax(true, contextPath + '/cmmn/MultiCode', 'body', '조회중입니다.', arg, function (data) {
		if (data != null) {
			abnExitSttnCdList = data.SRCWTSUP_UNDSTN_CD;
			abnExitResnCdList = data.SRCWTSUP_NTCN_RELIS_CD;
			abnExitMthdCdList = data.SRCWTSUP_NTCN_CNFIRM_CD;
			abnSttusCdList    = data.ABNRML_NTCN_STTUS_CD;

			rprExitSttnCdList = data.ACDNT_UNDSTN_CD;
			rprExitResnCdList = data.ACDNT_NTCN_RELIS_CD;
			rprExitMthdCdList = data.ACDNT_NTCN_CNFIRM_CD;
			acdExitMthdCdList = data.ACDNT_END_CD;
		}
	});

}


/**
 * @name         : allPopupClose
 * @description  : 이상/사고 팝업창 전체 닫기
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
allPopupClose = function(data) {
	// 단말기알림
	if ($("#trmnlNoticePop").data("kendoDialog") != undefined) {
		$("#trmnlNoticePop").data("kendoDialog").close();
	}
	// 운전자통화
	if ($("#driverCallPop").data("kendoDialog") != undefined) {
		$("#driverCallPop").data("kendoDialog").close();
	}
	// 관계기관전파
	if ($("#orgSpreadPop").data("kendoDialog") != undefined) {
		$("#orgSpreadPop").data("kendoDialog").close();
	}
	// 상황종료
	if ($("#situationEndPop").data("kendoDialog") != undefined) {
		$("#situationEndPop").data("kendoDialog").close();
	}
	// 사고전환
	if ($("#regitAccidentPop").data("kendoDialog") != undefined) {
		$("#regitAccidentPop").data("kendoDialog").close();
	}
	// 사고신고
	if ($("#reportAccidentPop").data("kendoDialog") != undefined) {
		$("#reportAccidentPop").data("kendoDialog").close();
	}
	// 사고신고 해제
	if ($("#reportEndPop").data("kendoDialog") != undefined) {
		$("#reportEndPop").data("kendoDialog").close();
	}
	// 방재정보
	if ($("#bangjaePop").data("kendoDialog") != undefined) {
		$("#bangjaePop").data("kendoDialog").close();
	}
}

/**
 * @name         : statusTotal
 * @description  : 필터 운행상태 전체선택 이벤트를 처리한다.
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
function statusTotal(chkbox){
	if ( chkbox.checked == true ) {
		document.getElementById("chkStatus03").checked = false;
		document.getElementById("chkStatus04").checked = false;
	}
}

/**
 * @name         : status
 * @description  : 필터 운행상태 개별선택 이벤트를 처리한다.
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
function status(chkbox){
	if ( chkbox.checked == true ) {
		document.getElementById("chkStatus01").checked = false;
	}
}

/**
 * @name         : carStateTotal
 * @description  : 필터 차량상태 전체선택 이벤트를 처리한다.
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
function carStateTotal(chkbox){
	if ( chkbox.checked == true ) {
		document.getElementById("carState02").checked = false;
		document.getElementById("carState03").checked = false;
	}
}

/**
 * @name         : carState
 * @description  : 필터 차량상태 개별선택 이벤트를 처리한다.
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
function carState(chkbox){
	if ( chkbox.checked == true ) {
		document.getElementById("carState01").checked = false;
	}
}

/**
 * @name         : carPlanTotal
 * @description  : 필터 사전운송계획 전체선택 이벤트를 처리한다.
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
function carPlanTotal(chkbox){
	if ( chkbox.checked == true ) {
		document.getElementById("carPlan02").checked = false;
		document.getElementById("carPlan03").checked = false;
	}
}

/**
 * @name         : carPlan
 * @description  : 필터 사전운송계획 개별선택 이벤트를 처리한다.
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
function carPlan(chkbox){
	if ( chkbox.checked == true ) {
		document.getElementById("carPlan01").checked = false;
	}
}

/**
 * @name         : detlInfoSelect
 * @description  : 하단 개별차량 상세정보를 조회 및 표출한다.
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
function detlInfoSelect(id, acdntYn){

	if ( id == currSelectCarId ) {
		currSelectCarId = "";
        bounceTarget = "";		// 바운스 타겟 제거
	} else {
		currSelectCarId = id;
	
		var arg = {};
		arg.id = id;
		
		ajax(true, contextPath+'/vc/selectMongoById', 'body', '조회중입니다.', arg, function (data) {

			var result = data;
			var evt_time = result.evtTime;
			var event_dt="";

			if (evt_time!=undefined){
				if (evt_time.length >10) {
					event_dt = "20" + evt_time.substring(0,2)+"."+evt_time.substring(2,4)+"."+evt_time.substring(4,6)+" "+evt_time.substring(6,8)+":"+evt_time.substring(8,10);
				}
			}

			arg.car_reg_no = result.carRegNo;
			document.getElementById("orgSpread").setAttribute("vin", isUndefined(result.id));
			document.getElementById("orgSpread").setAttribute("car_reg_no", isUndefined(result.carRegNo));
			document.getElementById("orgSpread").setAttribute("plan_yn", result.planYn==null?"":result.planYn.toUpperCase());
			document.getElementById("orgSpread").setAttribute("on_off", result.onOff==null?"":result.onOff.toUpperCase());
			document.getElementById("regitAccident").setAttribute("acc_code", result.accCode);
			document.getElementById("regitAccident").setAttribute("evt_type", result.evtType);
			document.getElementById("regitAccident").setAttribute("event_dt", '20' + evt_time.substring(0, 12));
			document.getElementById("detl_speed").innerHTML = isUndefined(result.spd);
			document.getElementById("detl_onoff").innerHTML = '엔진상태: '+(result.onOff==null?"":result.onOff.toUpperCase());
			document.getElementById("orgSpread").setAttribute("area", result.area);

			currTrnsprtPlanNo = isUndefined(result.trnsprtPlanNo);
			
			var tr_plan_no = isUndefined(result.trnsprtPlanNo);

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
			
			if (auth == "M") {
				if (result.accCode=="--" && result.evtType=="--") {  // 정상일때
					$("#situationEnd").hide();
				} else {
					$("#situationEnd").show();
				}
			}

			var rsltX = result.coord.x;
			var rsltY = result.coord.y;
			
			if (!isNaN(rsltX) && !isNaN(rsltY)) {
				if (rsltX > 0 && rsltY > 0) {
					vcCoord2Addr(rsltX, rsltY);		// 좌표기반 주소 가져오기
					map.setView(new tsmap.latLng(rsltY, rsltX), 18); // 현재위치로 포커스 이동
					locErrorFlag = "1";
				} else {
					if(locErrorFlag=="1") {
						alert("위치좌표가 유효하지 않습니다.");
					}
					locErrorFlag = "2";
				}
			}
			
			arg.vin = isUndefined(result.id);
			arg.trnsprt_plan_no = tr_plan_no;

			ajax(true, contextPath+'/vc/selectDetlInfo', 'body', '조회중입니다.', arg, function (data) {

		    	if (data != null) {

		 			var ck = $(".mpToggle").hasClass("on");

					if(ck){ 
						$(".mpToggle").removeClass("on"); 
						$(".mpbCont, .mpbHeader").show();
					}
		    		
					//사업자등록정보
		    		document.getElementById("orgSpread").setAttribute("bizrno", data.bizrno);

					// 차량정보
		    		var detl_car = data.carInfo;
		    		document.getElementById("detl_car_reg_no").innerHTML=isUndefined(result.carRegNo);

		    		if (detl_car != null){
			    		document.getElementById("detl_vhcty").innerHTML=isUndefined(detl_car.vhcty);
			    		document.getElementById("detl_yridnw").innerHTML=isUndefined(detl_car.yridnw)+"년식, "+isUndefined(detl_car.div);
			    		document.getElementById("detl_brwdnm").innerHTML=isUndefined(detl_car.brwdnm);
			    		document.getElementById("detl_cmpny_nm").innerHTML=isUndefined(detl_car.cmpnyNm);
		    		} else {
			    		document.getElementById("detl_vhcty").innerHTML="";
			    		document.getElementById("detl_yridnw").innerHTML="";
			    		document.getElementById("detl_brwdnm").innerHTML="";
			    		document.getElementById("detl_cmpny_nm").innerHTML="";
		    		}

		    		document.getElementById("detl_id").innerHTML=isUndefined(result.id);
		    		
		    		// 단말기정보
		    		var detl_trmnl = data.trmnlInfo;
		    		if (detl_trmnl!=null){
			    		document.getElementById("detl_telecomCd").innerHTML=isUndefined(detl_trmnl.telecomCd);
			    		document.getElementById("detl_trmnlNo").innerHTML=isUndefined(detl_trmnl.trmnlNo);
			    		document.getElementById("detl_makr").innerHTML=isUndefined(detl_trmnl.trmnlMakr);
			    		document.getElementById("detl_model").innerHTML=isUndefined(detl_trmnl.trmnlModelNm);
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
		    				document.getElementById("detl_occ_dt").innerHTML = isUndefined("20" + matchDt[1] + "/" + matchDt[2] + "/" + matchDt[3] + " " + matchDt[4] + ":" + matchDt[5] + ":" + matchDt[6]);
		    			} else {
		    				document.getElementById("detl_occ_dt").innerHTML = isUndefined(matchDt[1] + matchDt[2] + "/" + matchDt[3] + "/" + matchDt[4] + " " + matchDt[5] + ":" + matchDt[6] + ":" + matchDt[7]);
		    			}
		    		}
		    		
		    		document.getElementById("detl_y").innerHTML = isUndefined(result.coord.y);
		    		document.getElementById("detl_x").innerHTML = isUndefined(result.coord.x);
		    		
		    		// 물질, 운전자 초기화
		    		document.getElementById("matterTb").innerHTML='<colgroup><col width="40" /><col width="60" /><col width="" /><col width="100" /><col width="100" /><col width="70" /><col width="70" /></colgroup>';
					document.getElementById("driverInfoTb").innerHTML = '<colgroup><col width="40" /><col width="100" /><col width="100" /></colgroup>';
					
		    		if (data.trnsprtPlan != null) { // 현재보다 이틀 이전의 날짜로 운송중인 차량의 운송계획을 표시하지 않기 위한 임시조치
			    		if (data.trnsprtPlan.startPrarnde.replace(/\D/g, '').substr(0, 8) >= moment(new Date()).add('-2', 'd').format('YYYYMMDD')) {
			    			
				    		// (계획)운송물질
			    			var detl_matterInfo = data.matterInfo;
			    			
							if (detl_matterInfo != null) {
				    			var arr=[];
					    		for (var i=0, len=detl_matterInfo.length; i<len; i++) {
					    			var item = detl_matterInfo[i];
					    			arr[i]="<tr>" +
										"<td>"+item.groupSn+"-"+item.sn+"</td>" +
										"<td>"+item.mttrClNm+"</td>" +
										"<td class='mttrNm'>"+isUndefinedMatt(item.mttrNm)+"</td>" +
										"<td>"+isUndefinedMatt(item.casNo)+"</td>" +
										"<td>"+isUndefinedMatt(item.unNo)+"</td>" +
										"<td class='ldg'>"+item.ldg+item.cdNm+"</td>" +
										"<td class='ldg'>"+item.cont+"</td>" +
										"</tr>";
					    		}
					    		document.getElementById("matterTb").innerHTML += arr.join("");
				    		}
		
							// (계획)운전자
							var detl_driverInfo = data.driverInfo;
							
							if (detl_driverInfo!=null) {
								var arr=[];
								for (var i=0, len=detl_driverInfo.length; i<len; i++) {
									var item = detl_driverInfo[i];
									arr[i]="<tr>" +
										"<td>"+(i+1)+"</td>" +
										"<td>"+isUndefinedMatt(item.drverNm)+"</td>" +
										"<td>"+isUndefinedMatt(item.drverTelno)+"</td>" +
									//	"<td>"+isUndefinedMatt(item.drverQualfNo)+"</td>" +
										"</tr>";
								}
								document.getElementById("driverInfoTb").innerHTML += arr.join("");
							}
			    		}
		    		} 
		    		
		    		var totAbnormal=0,totAcdnt=0;

		    		// 경고 (이상알림)
		    		var detl_abnormalHis = data.abnormalHis;
		    		document.getElementById("abnormalHisList").innerHTML = "";
		    		
		    		for (i=0, len=detl_abnormalHis.length; i<len; i++) {
		    			var item3 = detl_abnormalHis[i];
		    			document.getElementById("abnormalHisList").innerHTML +="<li>"+isUndefined(item3.occdt)+" "+isUndefined(item3.abnrmlNm)+"</li>";
		    		}
		    		
					//운송경로보기 버튼에 사용할 계획번호 초기화
					document.getElementById("routeBtn").setAttribute("plan_no","");
					//운송사업자정보
					document.getElementById("detl_cmpy"     ).innerHTML = "";
					document.getElementById("detl_chgrNm"   ).innerHTML = "";
					document.getElementById("detl_bsnmTel"  ).innerHTML = "";
					document.getElementById("detl_bsnmAddr" ).innerHTML = "";
					//운송일시
					document.getElementById("detl_startDt"  ).innerHTML = "";
					document.getElementById("detl_arvlDt"   ).innerHTML = "";
					//운송경로
					document.getElementById("detl_startNm"  ).innerHTML = "";
					document.getElementById("detl_startAddr").innerHTML = "";
					document.getElementById("detl_dstnNm"   ).innerHTML = "";
					document.getElementById("detl_dstnAddr" ).innerHTML = "";
					
					// 운송계획정보
		    		var detl_trnsprtPlan = data.trnsprtPlan;

					if (detl_trnsprtPlan != undefined) { // 현재보다 이틀 이전의 날짜로 운송중인 차량의 운송계획을 표시하지 않기 위한 임시조치
						if (detl_trnsprtPlan.startPrarnde.replace(/\D/g, '').substr(0, 8) >= moment(new Date()).add('-2', 'd').format('YYYYMMDD')) {
							//운송경로보기 버튼에 사용할 계획번호
							document.getElementById("routeBtn").setAttribute("plan_no",isUndefined(detl_trnsprtPlan.trnsprtPlanNo));
							//운송사업자정보
							document.getElementById("detl_cmpy").innerHTML=isUndefined(detl_trnsprtPlan.trnsprtBsnmNm);
							document.getElementById("detl_chgrNm").innerHTML=isUndefined(detl_trnsprtPlan.trnsprtChgrNm);
							document.getElementById("detl_bsnmTel").innerHTML=isUndefined(detl_trnsprtPlan.trnsprtChgrTelno);
							document.getElementById("detl_bsnmAddr").innerHTML=isUndefined(detl_trnsprtPlan.trnsprtBsnmAddr)+" "+isUndefined(detl_trnsprtPlan.trnsprtBsnmDetailAddr);
							// 운송일시
							document.getElementById("detl_startDt").innerHTML=isUndefined(detl_trnsprtPlan.startPrarnde);
							document.getElementById("detl_arvlDt").innerHTML=isUndefined(detl_trnsprtPlan.arvlPrarnde);
							// 운송경로
							document.getElementById("detl_startNm").innerHTML=isUndefined(detl_trnsprtPlan.strtpntNm);
							document.getElementById("detl_startAddr").innerHTML=isUndefined(detl_trnsprtPlan.startAddr)+" "+isUndefined(detl_trnsprtPlan.startDetailAddr);
							document.getElementById("detl_dstnNm").innerHTML=isUndefined(detl_trnsprtPlan.dstnNm);
							document.getElementById("detl_dstnAddr").innerHTML=isUndefined(detl_trnsprtPlan.dstnAddr)+" "+isUndefined(detl_trnsprtPlan.dstnDetailAddr);
						}
					}
		    	} else {
		    		console.log("수신된 데이터가 없습니다.");
		    	}
		    });
		});
	}
}

/**
 * 좌표값 -> 주소 변환
 * @param x
 * @param y
 */
function vcCoord2Addr(x, y) {
    var deferred = $.Deferred();

    try {
        var data = {
            service: 'address',
            request: 'getAddress',
            key: 'ABB0EA1C-589F-3D7A-B4D4-AD66CA5F58B0',
            type: 'PARCEL',
            point: x + "," + y
        }

        $.ajax({
            url: "https://api.vworld.kr/req/address",
            cache: false,
            dataType: "jsonp",
            jsonp: "callback",
            contentType: "application/json",
            data: data,
            type: 'POST',
            beforeSend: function () {
            },
            complete: function (xhr, status) {
            },
            success: function (jsonObj) {
            	if (typeof jsonObj == "object" && jsonObj != null && jsonObj != "undefined") {
            		$("#detl_addr").text(nvl(jsonObj.response.result[0].text, "-"));
                }
            },
            error: function (jxhr, textStatus) {
            	$("#detl_addr").text("-");
            }
        });

    } catch (err) {
        deferred.reject(err);
    }

    return deferred.promise();
}


/**
 * @name         : messageMiniBtn
 * @description  : 리스트의 메세지 버튼 클릭 시 단말기 알림 창을 표출한다.
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
var messageMiniBtn = function(event, id) {
	event.stopPropagation();
	allPopupClose();
	var arg = {};
	arg.id=id;

	ajax(true, contextPath+'/vc/selectMongoById', 'body', '조회중입니다.', arg, function (data) {
		var result = data;

		if (result.onOff != null) {

			if ( result.onOff.toUpperCase() == "ON") {   // 온라인 일때만

				arg.vin = result.id;
				arg.trnsprt_plan_no = isUndefined(result.trnsprtPlanNo);
				arg.car_reg_no = result.carRegNo;

				ajax(true, contextPath+'/vc/selectDetlInfo', 'body', '조회중입니다.', arg, function (data) {

			    	if (data != null) {

			    		var detl_trmnl = data.trmnlInfo;
			    		var detl_trnsprtPlan = data.trnsprtPlan;
		    			var trmnlNo = "";
		    			var drverNm = "";
		    			var planNo = "";
		    			
		    			if (detl_trmnl!=undefined){
		    				trmnlNo = detl_trmnl.trmnlNo;
		    			}
		    			
		    			if (detl_trnsprtPlan != undefined) {
		    				drverNm = isUndefined(detl_trnsprtPlan.drverNm);
		    				planNo = isUndefined(detl_trnsprtPlan.trnsprtPlanNo);
		    			} else {
		    				planNo = isUndefined(result.trnsprtPlanNo);
		    			}
		    			
		    			var target01Cont  = '<div class="pSearchBox t01"> '; 
		    	    	target01Cont     += '<table class="wTable t01">'; 
						target01Cont     += '<colgroup><col width="100" /><col width="170" /><col width="100" /><col width="" /></colgroup>'; 
		    	    	target01Cont     += '<tr>';  
		    	    	target01Cont     += '<th style="line-height: 1em;">단말 번호</th>';
		    	    	target01Cont     += '<th style="line-height: 1em;"><strong id="detl_trmnlNoMini">' + trmnlNo + '</strong><strong id="detl_driverNmMini" style="display:none;">'+drverNm+'</strong></th>';
						target01Cont     += '<th style="line-height: 1em;">전송유형 : </th>';
						target01Cont     += '<td style="line-height: 1em;">';
						target01Cont     += '<input type="radio" name="sndmth" checked="checked" value="P" /> PUSH &nbsp; ';
						target01Cont     += '<input type="radio" name="sndmth" value="S" /> SMS';
						target01Cont     += '</td>';
		    	    	target01Cont     += '</tr>'; 
		    	    	target01Cont     += '</table></div>'; 
		    	    	target01Cont     += '<strong id="planNoMini" style="display:none;">' + planNo + '</strong>';
	    	    		target01Cont     += '<strong id="carRegNoMini" style="display:none;">' + result.carRegNo + '</strong>';
	    	    		target01Cont     += '<strong id="vinMini" style="display:none;">' + result.id + '</strong>';
		    	    	target01Cont     += '<table class="wTable t01 mt30">';
		    	    	target01Cont     += '<tr><td style="text-align:right; height:1px;"><p id="byteInfoArea" style="display:none;"><span id="byteInfo">0</span>/80Byte</p></td></tr>';
		    	    	target01Cont     += '<tr>';
		    	    	target01Cont     += '<td><textarea id="noticeMsgMini" style="width:98%;height: 100px;line-height:1.5em;resize:none;">';
		    	    	target01Cont     += '</textarea></td>';
		    	    	target01Cont     += '</tr>'; 
		    	    	target01Cont     += '</table>'; 
		    	    	target01Cont     += '<div class="pbtnBox">';
		    	    	target01Cont     += '<a href="javascript:void(0)" class="btype01" id="trmnlNoticeCancle" @click="trmnlNoticeCancle()"><span>취소</span></a>';
		    	    	target01Cont     += '<a href="javascript:void(0)" class="btype02" id="sendNoticeMini" style="width:100px;"><span>단말기 알림 전송</span></a>'; 
		    	    	target01Cont     += '</div>';

		    	    	$("#trmnlNoticePop").kendoDialog({
			    			width: "700px",
			    			title: "단말기 알림",
			    			closable: true,
			    			modal: false,
			    			content: target01Cont, 
			    			close: function(){
			    				//alert(1);
			    			}
			    		});

		    	    	$("#trmnlNoticePop").data("kendoDialog").open();
		    	    	
						// 단말 메세지 전송 방식 변경 이벤트 
						$("input[name='sndmth']").change(function() {

							var radioValue = $(this).val();

							if (radioValue == "P") {
								console.log("푸시");
								$('#noticeMsgMini').off("keyup", msgKeyUpEventListener);
								$('#byteInfoArea').hide();
							} else if (radioValue == "S") {
								console.log("SMS");
								$('#byteInfoArea').show();
								$('#noticeMsgMini').on("keyup", {dp: 'byteInfo'}, msgKeyUpEventListener);
								$('#noticeMsgMini').trigger('keyup'); 	// 입력된 글의 바이트 체크를 위해 keyup 이벤트 강제 발생
							}
						});
			    	}
				});

			} else {
				alert("차량이 오프라인 상태 입니다.");
			}
		} else {
			alert("차량이 오프라인 상태 입니다.");
		}
	});
}

/**
 * @name         : callMiniBtn
 * @description  : 리스트의 전화걸기 버튼 클릭 시 운전자에게 전화걸기 팝업창을 표출한다.
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
var callMiniBtn = function(event, id) {
	event.stopPropagation();
	allPopupClose();
	var arg = {};
	arg.id = id;
	
	ajax(true, contextPath+'/vc/selectMongoById', 'body', '조회중입니다.', arg, function (data) {
		carTelnoPop(data.carRegNo);
	});
}

function carTelnoPop(carRegNo) {
	var arg = {'carRegNo' : carRegNo};
	
	allPopupClose();
	
	ajax(true, contextPath + '/vc/readCarTelno', 'body', '조회중입니다.', arg, function (data) {
    	if (data != null) {

			var carTelno = data;  //차량별 연락처 정보

			var html = '<div class="popupWrap"> ';
			html+= '<table class="wTable popTable02">';
			html+= '<colgroup><col width="150px" /><col width="" /><col width="150px" /></colgroup>';
			html+= '<tbody>';
			html+= '<tr>';
			
			if (carTelno != null) {
				for (var i=0; i<carTelno.length; i++) {
					html+= '<tr>';
					html+= '<th>' + carTelno[i].nm + '</td>';
					html+= '<td>' + toTelNum(carTelno[i].telno) + '</td>';
				}
			}
			
			html+= '</tr>';
			html+= '</tbody>';
			html+= '</table> ';
			html+= '</div> ';

			$("#driverCallPop").kendoDialog({
				width: "700px",
				title: "운전자 통화",
				closable: true,
				modal: false,
				content: html,
				close: function(){
					//alert(1);
				}
			});

        	$("#driverCallPop").data("kendoDialog").open();
    	} else {
    		alert("연락처 정보가 없습니다.");
    	}
	});
}

// SMS 80바이트 체크 이벤트 핸들러
function msgKeyUpEventListener(e) {
	fnChkByte(this, '80', e.data.dp);
}

/**
 * @name         : fnChkByte
 * @description  : 메세지의 최대 Byte를 체크한다.
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
function fnChkByte(obj, maxByte, dp) {
	var str      = obj.value;
	var str_len  = str.length;
	var rbyte    = 0;
	var rlen     = 0;
	var one_char = "";
	var str2     = "";

	for (var i=0; i<str_len; i++) {
		one_char = str.charAt(i);
		
		if (escape(one_char).length > 4) {
		    rbyte += 2; //한글2Byte
		} else {
		    rbyte++; //영문 등 나머지 1Byte
		}

		if (rbyte <= maxByte) {
		    rlen = i + 1; //return할 문자열 갯수
		}
	}

	if (rbyte > maxByte) {
	    str2 = str.substr(0,rlen); //문자열 자르기
	    obj.value = str2;
	    fnChkByte(obj, maxByte, dp);
	} else {
	    document.getElementById(dp).innerHTML = rbyte;
	}
}

// 실시간 업데이트 관련
eventSource.addEventListener('message', sseCall);

eventSource.addEventListener('myevent', function(e) {
    // 'myevent' 이벤트의 데이터 처리
}, false);

/**
 * @name         : sseCall
 * @description  : Server-Sent Events를 등록하여 실시간 관제정보를 수신하여 처리한다.
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
/* 기존에 sseCall을 통해 sse를 특정 주기로 생성/클로즈를 반복하도록 구현되어 있던 것을
 *  eventsource.js 라이브러리 내 intaval과 bufferSizeLimit을 수정하였음 - 20200210 */
function sseCall(e) {

	var orgResult      = JSON.parse(e.data);
	var result         = orgResult.data;
	var reportAccident = orgResult.reportAccident;
	var carDataLen     = result.length;
	var todLen         = orgResult.today.length;
	var todayIng       = 0;
	var todayEnd       = 0;
	var todayCnt       = 0;

	/* 상단 오늘 내일 운송정보 표출*/
	for (var i=0, len= todLen; i<len; i++) {
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

	if (auth == "M" || auth == "S") {  // 관제요원 권한
		// 사고신고 리스트에서 제외 시 아래 주석 해제
		// 자동감지(A03), 통신단절(A06), 터널미진출(A07) 사고 
		/*
		for (var i = 0; i<reportAccident.length; i++) {
			var item = reportAccident[i];

			if (item.acdntTyCd == 'A06' || item.acdntTyCd == 'A07') {
				reportAccident.splice(i, 1)
				i--;
			}
		}*/
		
		// 사고신고 건수
		document.getElementById("reportAccdintCnt").innerHTML = reportAccident.length;

		reportAccidentList(reportAccident);
		
		if (reportAccident.length > 0) {
			if (preReportAccNumber < reportAccident[0].acdntSttemntSn) {
				sirenPlay();
			}

			preReportAccNumber = reportAccident[0].acdntSttemntSn;
		}
	}

	var abnormalCnt = 0;	// 이상
	var normalCnt   = 0;	// 정상
	var alimCnt     = 0;	// 이상운행
	var acCnt       = 0;	// 사고

	for (var m=0, len=markerGroup.length; m<len; m++) {  // 이상/정상 마커 제거
		// 루프 톨면서 지우기
		map.removeLayer(markerGroup[m]);
		cluster.removeLayer(markerGroup[m]);
	}
	
	for (var j=0, len=accMarkerGroup.length; j<len; j++) {  // 사고 마커 제거
		map.removeLayer(accMarkerGroup[j]);
	}
	
	markerGroup= [];
	layerGroup = [];
	
	var east = map.getBounds().getEast();
	var west = map.getBounds().getWest();
	var north = map.getBounds().getNorth();
	var south = map.getBounds().getSouth();
	
	map.addLayer(cluster);
	
	markerPopOnOff.forEach(function (item, key, mapObj) { // 조회 전 현재값 여부 N으로 초기화
		item.set("curr", "N");
	});

	carList = result;  //차량리스트 정보를 전역변수에 담는다.

	for (var k = 0; k<carDataLen; k++) {
		var targetItem = result[k];

		// 사고,이상 건수 카운팅
		if (targetItem.evtType != "--" || targetItem.accCode != "--") { 
			alimCnt++;
			
			if (targetItem.accCode != "--") {
				acCnt++;
			}
		}
		
		var filterYn = carFiltering(targetItem);
		
		// 사고접수차량 별도 처리
		for (var i = 0; i<reportAccident.length; i++) {
			if (reportAccident[i].carRegNo == targetItem.carRegNo) {
				filterYn = "N";
				break;
			}
		}

		if (filterYn=="Y") {  // 필터 여부

			if (targetItem.id == currSelectCarId) {
				currSelectCarId = "";
				var ck = $(".mpToggle").hasClass("on");
				if (!ck) { // 상세창 떠 있을 때
					$(".mpToggle").addClass("on"); 
					$(".mpbCont, .mpbHeader").hide();
				}
			}

			if (document.getElementById("list"+targetItem.id) != null) {
				var child = document.getElementById("list"+targetItem.id);
				child.classList.remove( 'on' );
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

			realCarInfoList(targetItem, stsCd);

			if (stsCd != "1") {  // 사고가 아닐때만
				if (x > west && x < east) {
					if ( y > south && y < north) {

						var geoText = '{"type": "Feature","geometry": {"type": "Point","coordinates": [' + x + ', ' + y + ']},"properties": {"type": "' + stsCd + '", "angle": "' + angle + '", "carRegNo": "' + targetItem.carRegNo + '", "eventDt": "' + event_dt + '", "id": "' + id + '", "org": "' + targetItem.org + '"}}';

						try {
							geojson = JSON.parse(geoText);
						} catch (e) {
							if (e instanceof SyntaxError) {
								
							}
						}

						var markers = tsmap.geoJson(geojson, {
							pointToLayer: defineFeature,
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
									offset: tsmap.point(1, -2),
									closeOnClick: false,
									autoClose: false,
									autoPan: false
								}).on('click', function (e) {
									markerClick(id,e);
								});

							    layerGroup[layerGroup.length]=layer;
							}
						});

						if (map.getZoom() > 17) {
							markers.addTo(map);
						} else {
							if (x > 0 && y > 0) {
								cluster.addLayer(markers);
							}
						}
						markerGroup[markerGroup.length] = markers;
					}
				}
			}

			if (currSelectCarId != "") {   //하단 실시간위치 표시
				if (routeMarkerGroup != null && routeMarkerGroup.length == 0) { // 경로보기 상태가 아닐 때만
					if ( id == currSelectCarId ) {
						var cur_trnsprtPlanNo = isUndefined(targetItem.trnsprtPlanNo);

						if (!document.getElementById("list" + id).classList.contains( 'on' )) {
							$(".mpop01 .mpopCont dl dd ul li").removeClass("on");
							document.getElementById("list" + id).classList.add( 'on' );
						}

						if (currEvtAcc != prevEvtAcc) {  // 이상코드나 사고코드가 바뀌었을 경우 상세창 다시조회
							currSelectCarId = "";
							detlInfoSelect(id, 'N');
						} else {
							if (currTrnsprtPlanNo != cur_trnsprtPlanNo) {  // 운송계획번호가 바뀌었을 경우 다시조회
								currSelectCarId = "";
								detlInfoSelect(id, 'N');
							}
						}
						
						var matchDt = targetItem.infoOccDt.match(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d*)/)
			    		
			    		if (matchDt != null) {
			    			if (parseInt(matchDt[2]) <= 12 ) {
			    				document.getElementById("detl_occ_dt").innerHTML = isUndefined("20" + matchDt[1] + "/" + matchDt[2] + "/" + matchDt[3] + " " + matchDt[4] + ":" + matchDt[5] + ":" + matchDt[6]);
			    			} else {
			    				document.getElementById("detl_occ_dt").innerHTML = isUndefined(matchDt[1] + matchDt[2] + "/" + matchDt[3] + "/" + matchDt[4] + " " + matchDt[5] + ":" + matchDt[6] + ":" + matchDt[7]);
			    			}
			    		}
						
			    		document.getElementById("detl_y").innerHTML=isUndefined(y);
			    		document.getElementById("detl_x").innerHTML=isUndefined(x);
			    		document.getElementById("detl_speed").innerHTML=isUndefined(targetItem.spd);
			    		document.getElementById("detl_onoff").innerHTML = '엔진상태: '+(targetItem.onOff==null?"":targetItem.onOff.toUpperCase());

						if (x > 0 && y > 0) {
							// 현재위치로 포커스 이동
							map.setView(new tsmap.latLng(y, x), map.getZoom());
							locErrorFlag = "1";
						} else {
							if (locErrorFlag == "1") {
								alert("위치좌표가 유효하지 않습니다.");
							}
							locErrorFlag = "2";
						}

					}
				}
			}
		}
	}

	// marker 팝업 여부 상태값 저장
	var currPopSts = markerPopOnOff;

	for (i=0, len = layerGroup.length; i< len;  i++) {

		var hasLayerResult = map.hasLayer(layerGroup[i]);

		if (hasLayerResult){
			var tempId = layerGroup[i].feature.properties.id;
			// var temp = new Map();

			//현재 선택된 차량만 팝업을 노출한다.
			if (currSelectCarId == tempId) {
				layerGroup[i].openPopup();
			}
		}
	}
	
	markerPopOnOff.forEach(function (item, key, mapObj) {
		if(item.get("curr")== "N"){  // 데이터가 안그려져서 N으로 남아있으면 상태값 삭제
			markerPopOnOff.delete(key);
		}
	});
	
	if ( alimCnt > 0 ) {
		document.getElementById("btnAlim").innerHTML='<img src="'+contextPath+'/images/ico/ico_alimg01_on.png" /><span>'+alimCnt+'</span>';
	} else {
		document.getElementById("btnAlim").innerHTML='<img src="'+contextPath+'/images/ico/ico_alimg01.png" />';
	}
		if (accCnt < acCnt) {  // 사고차량 갯수가 늘었을 때
			sirenPlay();
		}
//	}

	sirenCnt = alimCnt;
	accCnt = acCnt;
    document.getElementById("abnormalSub").innerHTML="이상운행 ("+abnormalCnt+"대)";
    document.getElementById("normalSub").innerHTML="정상운행 ("+normalCnt+"대)";
	firstViewNoPopup="POPUPYES";
}
		
/**
 * @name         : isUndefined
 * @description  : undefined 일 경우 공백을 리턴한다.
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
function isUndefined(txt) {
	var result=txt;
	if (result == undefined) {
		result="";
	}
	return result;
}

/**
 * @name         : isUndefinedMatt
 * @description  : undefined 일 경우 '-'를 리턴한다.
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
function isUndefinedMatt(txt) {
	var result=txt;
	if (result == undefined) {
		result="-";
	}
	return result;
}

/**
 * @name         : markerClick
 * @description  : 마커 클릭 시 팝업 on/off 상태를 수정한다.
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
function markerClick(id, e){

	// var onOff = markerPopOnOff;
	// var temp = new Map();
	// temp.set("curr", "Y");

	var target = document.getElementById("list" + id);  //선택한 차량 리스트
	var ck = $(".mpToggle").hasClass("on");

	if (id != currSelectCarId) {
		$(".mpop01 .mpopCont dl dd ul li").removeClass("on");
		$("#carLists").mCustomScrollbar("scrollTo", target);  //해당 차량으로 스크롤이동
		detlInfoSelect(id, 'N');
		currSelectCarId = id;
		$(".mpToggle").removeClass("on");
		$(".mpbCont, .mpbHeader").show();
	} else {
		$(".mpop01 .mpopCont dl dd ul li").removeClass("on");
		map.closePopup();
		currSelectCarId = "";
		$(".mpToggle").addClass("on");
		$(".mpbCont, .mpbHeader").hide();
	}
}


/**
 * @name         : defineFeature
 * @description  :
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
function defineFeature(feature, latlng) {
	var angle = feature.properties.angle;
    var type = feature.properties.type;
    var org = feature.properties.org;
    var id = feature.properties.id;
    var markerIcon;
    
    if (type=="3"){  // 정상운행
    	markerIcon = tsmap.icon({  // 정상
		    iconUrl: contextPath+'/images/ico/green'+getOrgImgIcon(org)+'_'+angle+'.png',
		    iconSize:   [55, 55]
		});
    } else if (type=="2") {  //이상운행
		markerIcon = tsmap.icon({  // 이상
		    iconUrl: contextPath+'/images/ico/yellow'+getOrgImgIcon(org)+'_'+angle+'.png',
	    	iconSize:   [55, 55]
		});
    }

	if (currSelectCarId != "") {   //하단 실시간위치 표시
		if (routeMarkerGroup != null && routeMarkerGroup.length == 0) { // 경로보기 상태가 아닐 때만
			if ( id == currSelectCarId ) {
				if (bounceTarget != id) {
                    bounceTarget = id;
                    return tsmap.marker(latlng, {icon: markerIcon, zIndexOffset: 1000}).setBouncingOptions({
                        bounceHeight: 20,    // height of the bouncing
                        bounceSpeed: 40,    // bouncing speed coefficient
                        exclusive: true,   // if this marker bouncing all others must stop
                    }).bounce(2);
                }
                return tsmap.marker(latlng, {icon: markerIcon, zIndexOffset: 1000});
			}
		}
	}
    return tsmap.marker(latlng, {icon: markerIcon});
}

/**
 * @name         : bakeThePie
 * @description  : generates a svg markup for the pie chart
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
function bakeThePie(options) {
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
    return serializeXmlNode(svg);
}

/**
 * @name         : serializeXmlNode
 * @description  : Helper function
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
function serializeXmlNode(xmlNode) {
    if (typeof window.XMLSerializer != "undefined") {
        return (new window.XMLSerializer()).serializeToString(xmlNode);
    } else if (typeof xmlNode.xml != "undefined") {
        return xmlNode.xml;
    }
    return "";
}

/**
 * @name         : defineClusterIcon
 * @description  :
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
function defineClusterIcon(cluster) {
    var children = cluster.getAllChildMarkers(),
        n = children.length, //Get number of markers in cluster
        strokeWidth = 1, //Set clusterpie stroke width
        r = rmax-2*strokeWidth-(n<10?12:n<100?8:n<1000?4:0), //Calculate clusterpie radius...
        iconDim = (r+strokeWidth)*2, //...and divIcon dimensions (leaflet really want to know the size)
        data = d3.nest() //Build a dataset for the pie chart
          .key(function(d) { return d.feature.properties[categoryField]; })
          .entries(children, d3.map),
        //bake some svg markup
        html = bakeThePie({data: data,
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
        myIcon = new tsmap.DivIcon({
            html: html,
            className: 'marker-cluster', 
            iconSize: new tsmap.Point(iconDim, iconDim)
        });
    return myIcon;
}

/**
 * @name         : getOrgImgIcon
 * @description  : 마커 중앙에 표시할 주무부처 아이콘 파일명을 리턴한다.
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */
function getOrgImgIcon(org) {
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
}

/**
 * @name         : onPolyClick
 * @description  : 계획경로 PolyLine 선택시 해당 폴리라인을 삭제한다.
 * @date         : 2018. 09. 19.
 * @author	     : kbm
 */

function onPolyClick() {
	if (routeMarkerGroup.length > 0) {
		for (var i=0, len= routeMarkerGroup.length; i<len; i++) {
			map.removeLayer(routeMarkerGroup[i]);
		}
		map.removeLayer(routePolyline);
		routeMarkerGroup=[];
	}
}

/**
 * @name         : displayHeatMap
 * @description  : 열지도를 표출한다.
 * @date         : 2019. 04. 16.
 * @author	     : 이광호
 */
function displayHeatMap(markerObj) {
	//console.log(markerObj);
	var datas = new Array();

	console.log('markerObj = ', markerObj);

	$.each(markerObj, function (i, data) {
		datas.push([data.y, data.x, 1]);
	});

	var heatOptions = {
		minOpacity: 0.8, 		/*최소투명도*/
		maxZoom: 13,    		/*최대로 강렬하게 표출되는 레벨*/
		radius: 12,     		/*각 포인트 반경*/ //$('#sliderRadius').data("kendoSlider").value(),
		blur: 25,        		/*투명도 반경*/ //$('#sliderBlur').data("kendoSlider").value(),
		max: 1,      			/*최대포인트 강도*/
		zoomLevelHeat: false,
		gradient: {
         1.0: '#CD1103',
         0.8: '#D53212',
         0.7: '#DD5321',
         0.6: '#E67430',
         0.5: '#EE953F',
         0.4: '#F6B64E',
         0.3: '#FFD75D'
         }

	};

	heatLayer = tsmap.heatLayer(datas, heatOptions).addTo(map);

	map.setZoom(13);
}

/**
 * @description  : 열지도 초기화한다.
 */
function clearHeatMap() {
	map.removeLayer(heatLayer);
}

/**
 * @description  : 인구밀도 레이어를 표출한다.
 */
function displayPopltn() {

	var latlngs = [];
	var latLngBounds = map.getBounds();

	latlngs.push(latLngBounds.getSouthWest());//bottom left
	latlngs.push(latLngBounds.getSouthEast());//bottom right
	latlngs.push(latLngBounds.getNorthWest());//top left
	latlngs.push(latLngBounds.getNorthEast());//top right

	var geom = "";
	var st ="";

	$.each(latlngs, function(j,result) {
		if(j == 0) {
			st = result.lng + " " + result.lat +", "
		}
		geom += result.lng + " " + result.lat +", ";

	});

	geom = geom+st;
	var geom = geom.substring(0,geom.lastIndexOf(", "));
	var arg = {};
	arg.geom = geom;

	if (poplTnLayer != undefined){
		clearPopltn();
	}

	ajax(false, contextPath+'/vc/selectPoplTn', 'body', '조회중입니다.', arg, function (data) {
		if (data != null) {
			poplTnLayer = tsmap.geoJSON(data,{
				style: function(feature){

					var d = feature.properties.popltn;
					return d >= 5000 ? {color: '#984807', opacity:0.7} :
						d >= 1000  ? {color: '#e46c0a', opacity:0.7} :
							d >= 500  ? {color: '#fac090', opacity:0.7} :
								d >= 200  ? {color: '#fcd5b5', opacity:0.7} :
									d >= 100  ? {color: '#fdeada', opacity:0.7} :
										{color: '#ebf1de', opacity:0.7};
				},
				onEachFeature: function(feature, layer){
				}
			}).addTo(map);
		}
	});
}


/**
 * @description  : 인구밀도 레이어를 초기화한다.
 */
function clearPopltn() {
	poplTnLayer.remove();
}

/**
 * @description  : 사고신고 데이터 표출
 */
var reportAccidentList = function(items) {

	var reportAcc = document.getElementById("reportAcc");
	var currnt = [];

	$('#reportAcc li').each(function () {
		var curId = $(this).attr("id").replace('reportAcclist','')
		currnt.push(curId);
	});

	for (var i = 0; i<items.length; i++) {
		var item = items[i];

		currnt = currnt.filter(function(e) { return e != item.acdntSttemntSn });

		if (document.getElementById("reportAcclist"+item.acdntSttemntSn) == null) {
			var html = '';
			
			html += "<li id=\"reportAcclist" + item.acdntSttemntSn + "\" onclick=\"reAccItemClickHandler(\'" + item.vin + "\')\">";
			html += "<h1>" + item.carRegNo + "</h1>";
			html += "<h2>" + item.acdntTyNm + "</h2>";
			html += "<p>"  + isUndefinedMatt(item.acdntDc) + "</p>";
			html += "<p>"  + item.sttemntDt + "</p>"
			html += "<div class=\"accidentBtn\" data-acdntTyCd=\"" + item.acdntTyCd + "\" data-acdntTyNm=\"" + item.acdntTyNm + "\" data-carRegNo=\"" + item.carRegNo + "\" data-vin=\"" + item.vin + "\"data-sttemntDt=\"" + item.sttemntDt.replace(/\D/g, '') + "\"data-acdntSttemntSn=\"" + item.acdntSttemntSn + "\">"
			
			html += "<button class=\"red\"  name=\"bntRptToAcc\">전환</button>";
			html += "<button class=\"blue\" name=\"btnRptToEnd\">해제</button>";
			html += "</div>";
			html += "</li>";
			
			reportAcc.insertAdjacentHTML('afterbegin', html);
		}
	}

	//해제된 신고 목록 삭제
	currnt.forEach(function (item, index, array) {
		$("#reportAcclist" + item).remove();
	});
	
	//버튼 이벤트 갱신
	$("button[name='bntRptToAcc']").off("click", btnReportAccHandler);
	$("button[name='bntRptToAcc']").on("click", btnReportAccHandler);
	$("button[name='btnRptToEnd']").off("click", btnReportEndHandler);
	$("button[name='btnRptToEnd']").on("click", btnReportEndHandler);
}

// 사고신고 사고전환 버튼 클릭
function btnReportAccHandler(evt) {
	evt.stopPropagation();
	
	var eds =  this.parentElement.dataset;
	
	if (confirm("사고 접수된 내용을 사고로 전환 하시겠습니까?")) {
		updateReportAccidentStats(eds.acdnttycd, eds.vin, eds.acdntsttemntsn, 1);
	}
}

// 사고신고 해제 이벤트 팝업
function btnReportEndHandler(evt) {
	evt.stopPropagation();
	
	allPopupClose();

	var ds = this.parentElement.dataset;
	var target04Cont  = '<div class="pSearchBox t01">';
	
	target04Cont     += '<table class="wTable t01">';
	target04Cont     += '<colgroup><col width="150" /><col width="" /></colgroup>';
	target04Cont     += '<tr>';
	target04Cont     += '<th>접수내역</th>';
	target04Cont     += '<th>접수번호: <span name="acdntSttemntSn">' + ds.acdntsttemntsn + '</span>, 접수유형: ' + ds.acdnttynm + ', 접수일시: ' + ds.sttemntdt + '</th>';
	target04Cont     += '</tr>';
	target04Cont     += '</table></div><form id="reportEndForm">';
	target04Cont     += '<input type="hidden" name="acdntSttemntSn" value="' + ds.acdntsttemntsn + '">';
	target04Cont     += '<table class="wTable t01 mt30">';
	target04Cont     += '<colgroup><col width="150" /><col width="200" /><col width="" /></colgroup>';
	target04Cont     += '<tr>';
	target04Cont     += '<td>';
	target04Cont     += '차량번호';
	target04Cont     += '</td>';
	target04Cont     += '<td colspan="2">';
	target04Cont     += '<input name="carRegNo" type="text" class="inp" value="' + ds.carregno + '" readonly />';
	target04Cont     += '</td>';
	target04Cont     += '</tr>';
	target04Cont     += '<tr>';
	target04Cont     += '<td>';
	target04Cont     += '차량위치';
	target04Cont     += '</td>';
	target04Cont     += '<td>';
	target04Cont     += '<select id="dlRprExitSttn" name="acdntUndstnCd" class="select"></select>';
	target04Cont     += '</td>';
	target04Cont     += '<td>';
	target04Cont     += '<input id="txtRprExitSttnEtc" name="acdntUndstnEtc" type="text" class="inp" disabled>';
	target04Cont     += '</td>';
	target04Cont     += '</tr>';
	target04Cont     += '<tr>';
	target04Cont     += '<td>';
	target04Cont     += '확인방법';
	target04Cont     += '</td>';
	target04Cont     += '<td>';
	target04Cont     += '<select id="dlRprExitMthd" name="acdntNtcnCnfirmCd" class="select"></select>';
	target04Cont     += '</td>';
	target04Cont     += '<td>';
	target04Cont     += '<input id="txtRprExitMthdEtc" name="acdntNtcnCnfirmEtc" type="text" class="inp" disabled>';
	target04Cont     += '</td>';
	target04Cont     += '</tr>';
	target04Cont     += '<tr>';
	target04Cont     += '<td>';
	target04Cont     += '해제사유';
	target04Cont     += '</td>';
	target04Cont     += '<td>';
	target04Cont     += '<select id="dlRprExitResn" name="acdntNtcnRelisCd" class="select"></select>';
	target04Cont     += '</td>';
	target04Cont     += '<td>';
	target04Cont     += '<input id="txtRprExitResnEtc" name="acdntNtcnRelisEtc" type="text" class="inp" disabled>';
	target04Cont     += '</td>';
	target04Cont     += '</tr>';
	target04Cont     += '<tr>';
	target04Cont     += '<td>';
	target04Cont     += '참고사항';
	target04Cont     += '</td>';
	target04Cont     += '<td colspan="2">';
	target04Cont     += '<textarea id="txtRemark" name="relisReferCn" class="textarea" style="height:40px; color:#010101;"></textarea>';
	target04Cont     += '</td>';
	target04Cont     += '</tr>';
	target04Cont     += '</table></form>';
	target04Cont     += '<div class="pbtnBox">';
	target04Cont     += '<a href="javascript:void(0)" class="btype01" id="situationEndCancel" @click="situationEndCancel()"><span>취소</span></a>';
	target04Cont     += '<a href="javascript:void(0)" class="btype02" id="reportEndExecute"><span>신고 해제</span></a>';
	target04Cont     += '</div>';

	$("#situationEndPop").kendoDialog({
		width: "700px",
		title: "사고신고 해제 (접수번호: " + ds.acdntsttemntsn + ")",
		closable: true,
		modal: false,
		content: target04Cont,
		close: function(){
			//alert(1);
		}
	});
	
	$("#situationEndPop").data("kendoDialog").open();
	
	$("#dlRprExitSttn").kendoDropDownList({
        autoWidth: true,
        dataTextField: "cdNm",
        dataValueField: "cdId",
        dataSource: rprExitSttnCdList,
        template: "<div><span>${sortOrdr}</span>.<span>${cdNm}</span></div>",
    	change: function(e) {
    	    var selText = this.text();
    	    
    	    if (selText == "기타") {
    	    	$('#txtRprExitSttnEtc').get(0).disabled = false;
    	    } else {
    	    	$('#txtRprExitSttnEtc').get(0).disabled = true;
    	    }
    	 }
	});
	
	$("#dlRprExitMthd").kendoDropDownList({
        autoWidth: true,
        dataTextField: "cdNm",
        dataValueField: "cdId",
        dataSource: rprExitMthdCdList,
        template: "<div><span>${sortOrdr}</span>.<span>${cdNm}</span></div>",
    	change: function(e) {
    	    var selText = this.text();
    	    
    	    if (selText == "기타") {
    	    	$('#txtRprExitMthdEtc').get(0).disabled = false;
    	    } else {
    	    	$('#txtRprExitMthdEtc').get(0).disabled = true;
    	    }
    	 }
	});
	
	$("#dlRprExitResn").kendoDropDownList({
        autoWidth: true,
        dataTextField: "cdNm",
        dataValueField: "cdId",
        dataSource: rprExitResnCdList,
        template: "<div><span>${sortOrdr}</span>.<span>${cdNm}</span></div>",
    	change: function(e) {
    	    var selText = this.text();
    	    
    	    if (selText == "기타") {
    	    	$('#txtRprExitResnEtc').get(0).disabled = false;
    	    } else {
    	    	$('#txtRprExitResnEtc').get(0).disabled = true;
    	    }
    	 }
	});
	
	$("#dlRprExitSttn").parent().on("keydown", function(e) {
		var kc = e.keyCode;
		
		if (kc >= 48 && kc <= 57) { /*0-9*/ 
			$('#dlRprExitSttn').data('kendoDropDownList').select(kc-49);
			$('#dlRprExitSttn').data('kendoDropDownList').close();
			$('#dlRprExitSttn').data('kendoDropDownList').trigger("change");
		}
	});
	
	$("#dlRprExitMthd").parent().on("keydown", function(e) {
		var kc = e.keyCode;
		
		if (kc >= 48 && kc <= 57) { /*0-9*/ 
			$('#dlRprExitMthd').data('kendoDropDownList').select(kc-49);
			$('#dlRprExitMthd').data('kendoDropDownList').close();
			$('#dlRprExitMthd').data('kendoDropDownList').trigger("change");
		}
	});
	
	$("#dlRprExitResn").parent().on("keydown", function(e) {
		var kc = e.keyCode;
		
		if (kc >= 48 && kc <= 57) { /*0-9*/ 
			$('#dlRprExitResn').data('kendoDropDownList').select(kc-49);
			$('#dlRprExitResn').data('kendoDropDownList').close();
			$('#dlRprExitResn').data('kendoDropDownList').trigger("change");
		}
	});
}

/**
 * @description  : 사고신고리스트 클릭핸들러
 */
function reAccItemClickHandler(i_vin) {
	//$('#list' + i_vin).trigger('click');
	markerClick(i_vin, null);
}

/**
 * @description  : 사고접수 항목의 사고전환
 */
function updateReportAccidentStats(acdntTyCd, vin, sn) {
	var arg = {};
	var carInfo;
	
	// 차량 목록에서 필요 정보 추출하기 위해 선택
	carList.forEach(function (n) {
		if (n.id == vin) {
			carInfo = n;
			return;
		}
	});

	arg.acdntSttemntSn      = sn;	// 사고접수번호
	arg.vin                 = vin;
	arg.acdntTyCd           = acdntTyCd;
	arg.acdntSttemntSttusCd = 1;
	arg.carRegNo            = (carInfo.carRegNo      == "--" ? ""  : carInfo.carRegNo);
	arg.bizrno              = (carInfo.bizrno        == "--" ? ""  : carInfo.bizrno);
	arg.xCrd                = (carInfo.coord.x       == "--" ? ""  : carInfo.coord.x);
	arg.yCrd                = (carInfo.coord.y       == "--" ? ""  : carInfo.coord.y);
	arg.trnsprtPlanNo       = (carInfo.trnsprtPlanNo == "--" ? ""  : carInfo.trnsprtPlanNo);
	arg.trnsprtPlanYn       = (carInfo.planYn        == 'Y'  ? 'Y' : 'N');
	
	ajax(true, contextPath + '/vc/regitAccidentExecute', 'body', '사고 신고 내역을 사고 상태로 전환합니다.', arg, function (data) {
		if (data >= 1) {
			accChangeFlg = vin;
			alert("사고 전환되었습니다.");
			$("#reportAcclist"+sn).remove();	// 사고신고 리스트에서 삭제
		}
	});
}

/**
 * @description  : 경고음을 플레이한다.
 */
var sirenPlay = function() {

	var agent = navigator.userAgent.toLowerCase();
	if (agent.indexOf("chrome") != -1) {
		var weaList = '<iframe style="width:0px; height:0px;" src="'+contextPath+'/audio/siren_01.mp3" allow="autoplay">'
		$('#viewport').html(weaList)
	} else {
		document.getElementById("myAudio").play();
	}

}

/**
 * @description  : 이전운송계획목록 조회
 */
var searchBefPlan = function() {
    var arg = {};

    arg.carRegNo = '';
    
    ajax(true, contextPath + '/tp/readBeforePlanList', 'body', '조회중입니다.', arg, function (data) {
    	if (data != null) {
    		// 데이터 바인딩
    		var grid = $('#targetGrid05').data('kendoGrid');
    		grid.dataSource.data(data);
    		
    		// data 없을 시
    		if (data.length == 0) {
    			if($('#targetGrid05-body')[0].childElementCount == 0) {
    				$('#targetGrid05-body').append('<tr><td colspan="4" class="emptyRow">데이터가 없습니다.</td></tr>');
    			}
    		}
    		
    	} else {
    		console.log("수신된 데이터가 없습니다.");
    	}
    });
}

var createDialog = function(dialog_id) {
	var templateString = "<div id='#: dialog_id #' class='dialog_cls'></div>";
    var template = kendo.template(templateString);
    $(".dialog_cls").remove();
    $("#dialog").html(template({ dialog_id: dialog_id }));
	return $("#" + dialog_id);
}
</script>