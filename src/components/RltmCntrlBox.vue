<script>

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
var situFlag = "";
var filterFlag = "";
var	routePolyline = "";
var	accChangeFlg = "";

var	ldong = '';
var	flag = "1";  // test 용 flag

var heatLayer = new tsmap.heatLayer();
var poplTnLayer;

var secondLoginHost = "/";

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

	$(".mpbCont, .mpbHeader").hide();

	//검색필터에서 사용할 목록 조회
	selectExitCdList();   // 상황해제코드 목록 조회

	// 이벤트리스너
	// 알람버튼 클릭 이벤트(클릭 시 이상운행 최상단으로 스크롤)
	$("body").on("click", "#btnAlim", function() {
		$("#carLists").mCustomScrollbar("scrollTo", $("#abnormalSub"));
	});
	
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

	// 팝업 창 취소버튼 이벤트
	$("body").on("click","#trmnlNoticeCancle",function(){
		$("#trmnlNoticePop").data("kendoDialog").close();
	});

	//운전자통화 팝업 취소 이벤트
	$("body").on("click","#driverCallCancle",function(){
		$("#driverCallPop").data("kendoDialog").close();
	});
	
	//관계기관전파 팝업 취소 이벤트
	$("body").on("click","#orgSpreadCancle",function(){
		$("#orgSpreadPop").data("kendoDialog").close();
	});
	
	//상황종료 팝업 취소 버튼 클릭 이벤트
	$("body").on("click","#situationEndCancel",function(){
		$("#situationEndPop").data("kendoDialog").close();
	});
	
	// 상황종료 팝업 상황종료 버튼 클릭 이벤트
	$("body").on("click","#situationEndExecute",function() {
		// 이상 상황 조회
		var param = fn_getFormData($("#situationEndForm"));
		param.vin = document.getElementById('orgSpread').getAttribute("vin");
		param.id = document.getElementById('orgSpread').getAttribute("vin");
		
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
		
		ajax(true, contextPath+'/vc/updateAccExit', 'body', '조회중입니다.', param, function (data) {   // 상황종료 이력 및 mongoDB 정상으로 update
			if (data == 1) {  // 정상
				alert("사고 종료 되었습니다.");
				
				$('#situationEndPop').data("kendoDialog").close();
				
				currSelectCarId = "";
				detlInfoSelect(document.getElementById('orgSpread').getAttribute("vin"), 'N');
			}
		});
	});
	
	//사고전환 팝업 취소 이벤트
	$("body").on("click","#regitAccidentCancle",function(){
		$("#regitAccidentPop").data("kendoDialog").close();
	});

	//사고신고 팝업 취소 이벤트
	$("body").on("click","#reportAccidentCancle",function() {
		$("#reportAccidentPop").data("kendoDialog").close();
	});
	
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
	
	// 주변차량 사고 알림 전송 버튼 클릭 시
	$("body").on("click", "#btnAroundAccInfo", function() {
        var arg = {};
        arg.crd_x = $('#detl_x').text();
        arg.crd_y = $('#detl_y').text();
        arg.dist  = 3;	// km
        arg.ntcnCn = $('#txtArndBrd').val();
        
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
		
		arg.ntcnTrnsmisCode = 0; // 알림전송코드
		arg.ntcnCn          = nvl(document.getElementById("noticeMsg").value.trim());		            // 메세지
		ntcnCnLen=$('input:checkbox[name="dlPushMsgArea"]:checked').length;
		arg.areaCd =$('input:checkbox[name="dlPushMsgArea"]').val();


		// check box 항목에 대한 값을 # 구분자로 연결
		if(ntcnCnLen > 0){
			var areaCdArr=new Array();
			for(i=0; i < ntcnCnLen; i++){
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
	});
	
	/**
	 * @description  : 상세보기의 사고접수 버튼을 통한 사고 전환
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
			target01Cont     += '<td id="dlPushMsgArea">';
			target01Cont     += '<input type="button" value=" 지역전체 선택,해제 " id="sendAreaCheckAllbtn" style="cursor:pointer"/>';
			target01Cont     += '	<ul style="list-style:none;">';
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
		}
	});

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

    // 실시간 이동 차량 데이터 표출
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

        addStr += "<li id='list"+idStr+"' class='sts0"+stsCd+"' @click=\"detlInfoSelect('"+idStr+"', 'N')\" style='cursor:pointer' evtAcc='"+currEvtAcc+"' onOff='"+attrOnOff+"'>";
        addStr += "<span>"+item.carRegNo+"</span>";
        addStr += "<div class='btn'>";

        if (this.auth == "M" || this.auth == "S" ) {  // 관리자 및 관제요원 권한
          addStr += "<a href='javascript:void(0)' class='"+classOnOff+"' @click=\"messageMiniBtn(event, '"+idStr+"');\">";
        } else {
          addStr += "<a href='javascript:void(0)' class='"+classOnOff+"' >";
        }

        addStr += "<img src="+ require('../assets/ptsimages/ico/ico_sns01.png') +" />";
        addStr += "</a>";

        if(this.auth == "M" || this.auth == "S") {  // 관리자 및 관제요원 권한
          addStr += "<a href='javascript:void(0)' class='" + classOnOff + "' @click=\"callMiniBtn(event, '" + idStr + "', '" + item.carRegNo + "', '" + item.trnsprtPlanNo + "');\">";
        }else{
          addStr += "<a href='javascript:void(0)' class='"+classOnOff+"' >";
        }

        addStr += "<img src="+ require('../assets/ptsimages/ico/ico_sns02.png') +" />";
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

        addStr = "<li id='list"+ idStr +"' class='sts0"+stsCd+"' @click=\"detlInfoSelect('"+ idStr +"', 'N')\" style='cursor:pointer' evtAcc='"+currEvtAcc+"' onOff='"+attrOnOff+"'>" +
          "<span>"+item.carRegNo+"</span>" +
          "<div class='btn'>" +
          "<a href='javascript:void(0)' class='"+classOnOff+"' @click=\"messageMiniBtn(event, '"+ idStr +"');\">" +
          "<img src="+ require('@/assets/ptsimages/ico/ico_sns01.png') +" />" +
          "</a>" +
          "<a href='javascript:void(0)' class='"+classOnOff+"' @click=\"callMiniBtn(event, '"+ idStr+"', '"+item.carRegNo+"', '"+item.trnsprtPlanNo+"');\">" +
          "<img src="+ require('@/assets/ptsimages/ico/ico_sns02.png') +" />" +
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
    },

</script>