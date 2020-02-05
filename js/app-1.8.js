var isCalling = false;

var StringeeSoftPhone = StringeeSoftPhone || {};

function checkIsCallingAndDisableCallBtn() {
	if (isCalling) {
		console.log('dang goi roi');
		return true;
	}

	isCalling = true;
	$('.btnVideoCall').attr('disabled', 'disabled');
	$('.btnVoiceCall').attr('disabled', 'disabled');
	$('.btnCallOut').attr('disabled', 'disabled');

	return false;
}
function enableCallBtn() {
	isCalling = false;
	$('.btnVideoCall').removeAttr('disabled');
	$('.btnVoiceCall').removeAttr('disabled');
	$('.btnCallOut').removeAttr('disabled');
}

$(document).ready(function () {
//	const HOST  = "http://127.0.0.1/stringee/softphone-api/";
	const HOST = "https://v1.stringee.com/softphone-apis/";
//	const HOST = "https://test3.stringee.com/softphone-apis/";

	var accessToken;
	var phone;

	//request new token
	StringeeSoftPhone.on('requestNewToken', function () {
		console.log('requestNewToken+++++++');

		var sessionSoftphone = localStorage.getItem('softphone');
		var objSoftphone = JSON.parse(sessionSoftphone);

		var url = HOST + "public_html/account/getaccesstoken";
		var data = {"token": objSoftphone.token};
		$.ajax({
			type: "POST",
			url: url,
			dataType: "json",
			data: JSON.stringify(data),
			success: function (res) {
				console.log(res);
				if (res.status === 200) {
					localStorage.setItem('softphone', JSON.stringify(res.data));
					connect(res.data.access_token);
				}
			}
		});
	});

	StringeeSoftPhone.on('beforeMakeCall', function (call) {
		console.log('beforeMakeCall: ', call);
		call.custom = JSON.stringify({'app-to-phone': true});
		return true;
	});


	window.onbeforeunload = function (event) {
		return true;
	};

	$('#page-loading').addClass('hide');
	//===============================LOADING====================================//
	$(document).ajaxStart(function () {
		$("#page-loading").addClass("when-load-ajax");
	});
	$(document).ajaxComplete(function () {
		$("#page-loading").removeClass("when-load-ajax");
	});



	var sessionSoftphone = localStorage.getItem('softphone');
	var objSoftphone = JSON.parse(sessionSoftphone);

	console.log('sessionSoftphone', objSoftphone);
	if (Boolean(sessionSoftphone) == false || typeof (sessionSoftphone) === "undefined") {
		$('#page-login').removeClass('hide');
		$('#page-call').addClass('hide');
	} else {
		connect(objSoftphone.access_token);
		$('#page-login').addClass('hide');
		$('#page-call').removeClass('hide');
		showInfoNumber();
	}



	//================================LOGIN====================================//
	$('#btnLogin').on('click', function () {
		phone = $('#phone').val();
		phone = replaceCountryCode(phone);

		if (checkPhoneNumber(phone) == false) {
			console.log('Invalid number');
			$('.showMsg').empty();
			$('.showMsg').append("<div class='notif notif-err mb-10'>Invalid phone number</div>");
			return;
		}
		$('.showMsg').empty();

		//REQUEST API LOGIN
		if (Boolean(localStorage.getItem('accessToken')) === true) {
			console.log(localStorage);
			accessToken = localStorage.getItem('accessToken');
		} else {
			var urlLogin = HOST + "public_html/account/login";
			var dataLogin = {"phone": phone};
			$.ajax({
				type: "POST",
				url: urlLogin,
				dataType: "json",
				data: JSON.stringify(dataLogin),
				success: function (res) {
					console.log(res);
					if (res.status === 200) {
						$('#step1').addClass('hide');
						$('#step2').removeClass('hide');
					} else {
						$('.showMsg').empty();
						$('.showMsg').append("<div class='notif notif-err mb-10'>" + res.message + "</div>");
					}
				}
			});
		}
	});


	//================================CONFIRM CODE==============================//
	$('#btnConfirmCode').on('click', function () {
		var code = $('#code').val();
		var urlConfirm = HOST + "public_html/account/confirm";
		var dataConfirm = {"phone": phone, "code": code};
		if (code.length == 0) {
			$('.showMsg').empty();
			$('.showMsg').append("<div class='notif notif-err mb-10'>Invalid code</div>");
			return;
		}
		$.ajax({
			type: "POST",
			url: urlConfirm,
			dataType: "json",
			data: JSON.stringify(dataConfirm),
			success: function (res) {
				console.log(res);
				if (res.status === 200) {
					localStorage.setItem('softphone', JSON.stringify(res.data));
					
					$('#page-login').addClass('hide');
					$('#step1').removeClass('hide');
					$('#step2').addClass('hide');
					$('#page-call').removeClass('hide');
					connect(res.data.access_token);
					sessionSoftphone = localStorage.getItem('softphone');
					objSoftphone = JSON.parse(sessionSoftphone);
					showInfoNumber();

				} else {
					$('.showMsg').empty();
					$('.showMsg').append("<div class='notif notif-err mb-10'>" + res.message + "</div>");
				}
			}
		});


	});








	$('#checkCall').on('click', function () {
		console.log(call);
	});


	//=====================LOGOUT ============================================//
	$('#btnOpenLogout').on('click', function () {
		$('#modalConfirmLogout').modal('show');
	})
	$('#btnLogout').on('click', function () {
		if (Boolean(sessionSoftphone) == false || typeof (sessionSoftphone) === "undefined") {
			console.log('Dont exist session');
		} else {
			localStorage.removeItem('softphone');
			localStorage.removeItem('phonebook');
			$('#page-login').removeClass('hide');
			$('#page-call').addClass('hide');
			$('#modalConfirmLogout').modal('hide');
			
			StringeeSoftPhone.disconnect();
			StringeeSoftPhone.config({showMode: 'none'});
			
		}
	});






	//=====================FUNCTION CALL ======================================//
	function connect(accessToken) {
		console.log('++++connect+++++');
		if (accessToken) {
			var sessionSoftphone111 = localStorage.getItem('softphone');
			var objSoftphone1 = JSON.parse(sessionSoftphone111);
			
			//========================= from numbers ======================================================= ==>
			var fromNumbers = [];//{alias: 'Huy-1', number: '+84899199586'}, {alias: 'Huy-2', number: '+2222'}
			for (var i = 0; i < objSoftphone1.callOutNumber.length; i++) {
				var number = objSoftphone1.callOutNumber[i];
				var numberObject = {alias: number, number: number};
				fromNumbers.push(numberObject);
			}
			StringeeSoftPhone.config({fromNumbers: fromNumbers, showMode: 'full'});

//			console.log('objSoftphone', objSoftphone.callOutNumber);
//
//			StringeeSoftPhone.config({showMode: 'full'});
			//========================= from numbers ======================================================= <==


			StringeeSoftPhone.connect(accessToken);
		} else {
			console.log('Server khong tra ve access_token, kiem tra lai tai khoan!');
		}

	}

	// TRUE = videocall; FALSE = voicecall

	function checkNumberCallTo(phone1) {
		var phone = replaceCountryCode(phone1);
		if (checkPhoneNumber(phone) == false) {
			console.log('Invalid number');
			$('.showMsgCall').removeClass('hide');
			$('.showMsgCall').empty();
			$('.showMsgCall').append("<div class='notif notif-err mb-10'>Invalid phone number</div>");
			return false;
		}
		$('.showMsgCall').addClass('hide');
		$('.showMsgCall').empty();
		return true
	}








	//======================PHONE PAD=========================================//
	$('.phonenumber-clear').on('click', function () {
		var callTo = $('#callTo').val();
		var str = callTo.substring(0, callTo.length - 1);
		$('#callTo').val(str);
	});
	$('#keypad-container .keypad-key').on('click', function () {
		var key = $(this).attr('data-key');
		var str = $('#callTo').val();
		$('#callTo').val(str + key);
	});


	$(document).on('click', '.phone-option', function () {
		var number = $(this).attr('data-phone');
		updateNumberSelected(number);
		showInfoNumber();
	})



	//=======================FUNCTION CHECK AND FEATURE SUPPORT===============//
	$('#phone').on('keyup', function (e) {
		if (e.keyCode == 13) {
			$('#btnLogin').click();
		}
	});

	$('#code').on('keyup', function (e) {
		if (e.keyCode == 13) {
			$('#btnConfirmCode').click();
		}
	});
	$('#callTo').on('keyup', function (e) {
		if (e.keyCode == 13) {
			var callTo = $('#callTo').val();
			if (!checkNumberCallTo(callTo)) {
				return;
			}
			$('#page-selectcall').removeClass('hide');
		} else {

		}
	});

	$('.panel-number-selector .select').on('click', function () {
		$('.panel-number-selector-popup').toggleClass('hide');
	});
	$('.panel-number-selector-popup .close').on('click', function () {
		$('.panel-number-selector-popup').addClass('hide');
	});
	$('#page-selectcall .close').on('click', function () {
		$('#page-selectcall').addClass('hide');
	});

	$(document).mouseup(function (e)
	{
		var container = $(".panel-number-selector-popup");

		// if the target of the click isn't the container nor a descendant of the container
		if (!container.is(e.target) && container.has(e.target).length === 0)
		{
			container.addClass('hide');
		}
	});









	$(document).on('click', '.showResultFilter p', function () {
		var phone = $(this).attr('data-phone');
		$('#callTo').val(phone);
		$('.showResultFilter').addClass('hide');
	})






	// Display Number Logged in
	// Display Number Callout Selected 
	function showInfoNumber() {
		var option = '';
		if (!objSoftphone.callOutNumberSelected) {
			$(objSoftphone.callOutNumber).each(function (k, v) {
				var checked = '';
				if (objSoftphone.callOutNumber[0] === 0) {
					checked = "<span class='checked'><img src='images/checked.svg' ></span>";
					updateNumberSelected(v);
				}
				option += "<div class='phone-option' data-phone='" + v + "'>" + checked + v + "</div>";
			})
		} else {
			$(objSoftphone.callOutNumber).each(function (k, v) {
				var checked = '';
				if (v == objSoftphone.callOutNumberSelected) {
					checked = "<span class='checked'><img src='images/checked.svg' ></span>";
					updateNumberSelected(v);
				}
				option += "<div class='phone-option' data-phone='" + v + "'>" + checked + v + "</div>";
			});
		}

		$('#phoneLogged').html(objSoftphone.phone);
		$('.panel-number-selector-popup .phone-option').remove();
		$('.panel-number-selector-popup').append(option);
		$('.panel-number-selector .select-number p').html(getNumberSelected());
	}

	function updateNumberSelected(n) {
		objSoftphone.callOutNumberSelected = n;
		var updateSoftphone = JSON.stringify(objSoftphone);
		localStorage.setItem('softphone', updateSoftphone);
		sessionSoftphone = localStorage.getItem('softphone');
		objSoftphone = JSON.parse(sessionSoftphone);
	}

	function getNumberSelected() {
		return objSoftphone.callOutNumberSelected;
	}




	function checkPhoneNumber(phone) {
		var err = false;
		if (phone.length < 10 || phone.length > 12) {
			err = true;
		}
		if (isNaN(phone) == true) {
			err = true;
		}
		if (err == true) {
			return false;
		}

		return true;
	}


	function replaceCountryCode(number) {
		if (number.charAt(0) == 0) {
			number = number.replace(number.charAt(0), 84);
		}
		return number;
	}





});



