$( document ).ready(function() {
    if(!get('session'))
        window.location.replace("./login");
    $('.modal').modal();
	$('#currency').modal({
      dismissible: false
    });
	if(!get('userInfo')){
		doGet('api/user/info', result=>{
			if(result.error)
				logout();
		   set('userInfo', JSON.stringify(result));
			updateUserInfo();
		});
	} else updateUserInfo();
	if(!get('currency')){
		doGet('api/currency/all', result=>{
		   set('currency', JSON.stringify(result));
		   updateCurrency();
		});
	} else updateCurrency();
		
	$('#my_account_button').on('click', ()=>{
		if($('#my_account_new_password').val() != $('#my_account_new_password_retype').val())
			noti('Mật khẩu nhập lại không đúng');
		else if($('#my_account_old_password').val()){
			let data = {'old_password' : $('#my_account_old_password').val()}
			if($('#my_account_name').val())
				data.name = $('#my_account_name').val();
			if($('#my_account_new_password').val())
				data.new_password = $('#my_account_new_password').val();
			doPost('api/user/update', data, result =>{
				if(!result.error)
					$('#my_account').modal('close');
				noti(result.message);
			});
			$('#my_account_old_password').val('');
			$('#my_account_new_password').val('');
			$('#my_account_new_password_retype').val('');
		}
	});		
	$('#add_wallet_button').on('click', ()=>{
		let data = {'name' : $('#add_wallet_name').val(), 'currency' : $('#add_wallet_currency_id').val(), 'startAmount' : $('#add_wallet_startAmount').val()}
		doPost('api/wallet/add', data, result =>{
			if(!result.error){
				$('#add_wallet').modal('close');
				updateWallet();
			}
			noti(result.message);
		});
	});
	updateWallet();
    
});
function updateWallet(){
	doGet('api/wallet/all', result=>{
		$('#wallet_list').html('');
		if(!result.error)
			result.wallet.forEach((item, index)=>{
				$('#wallet_list').append('\
	<div class="col s12 wallet" onclick="setCurrent('+item.id+');">\
        <div class="card-panel grey lighten-5 z-depth-1">\
          <div class="row valign-wrapper">\
            <div class="col s2">\
              <img src="img/wallet.png" alt="wallet" class="circle responsive-img">\
            </div>\
            <div class="col s10">\
              <span class="black-text">\
                <h5>'+item.name+' - <small>'+moneyFormat(item.balance)+' '+item.currency+'</small></h5>\
              </span>\
            </div>\
          </div>\
        </div>\
      </div>');
	  if(item.current == 1){
        $('#wallet_name').html(item.name);
        $('#wallet_balance').html(moneyFormat(item.balance)+' '+item.currency);
	  }
			});
    });
}
function setCurrent($id){
	doGet('api/wallet/current/'+$id, result =>{
		if(!result.error){
			$('#wallet').modal('close');
			updateWallet();
		}
		noti(result.message);
	});
}
// Money Formatting
Number.prototype.formatMoney = function (c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "," : d,
        t = t == undefined ? "." : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

// pass a number in to return a currency formatted string
function moneyFormat(num) {
    num = num.toString();
    if (num === '') {
        num = '0.00';
    } else if (!num.search('$')) {
        num = parseFloat(num).formatMoney(2, '.', ',');
    } else {
        num = parseFloat(num.replace(/[^\d\.-]/g, '')).formatMoney(2, '.', ',');
    }
    return num;
}

// Pass in a currency formatted amount as string to return a number
function unMoneyFormat(amount) {
    return Number(amount.replace(/[^0-9.-]+/g, '')).toFixed(2);
}

function updateUserInfo(){
	let result = JSON.parse(get('userInfo'));
	$('#name').html('<i class="fa fa-user"></i> ' + result.name);
	$('#my_account_email').val(result.email);
	$('#my_account_name').val(result.name);
}

function updateCurrency(){
	let result = JSON.parse(get('currency'));
	$('#currency_list').html('');
	result.currency.forEach((item, index)=>{
		$('#currency_list').append('\
		<div class="col s3 center currency" data-icon="'+item.icon+'" onclick="setCurrency({id:'+item.id+', name:\''+item.name+'\', icon:\''+item.icon+'\'});">\
			<img class="circle responsive-img" src="img/'+item.icon+'.png" alt="'+item.name+'"><br>\
			<span>\
			'+item.short+'\
			</span>\
		</div>\
		');
	});
}
function setCurrency(result){
	$('#add_wallet_currency_id').val(result.id);
	$('#add_wallet_currency').val(result.name);
	$('#currency_icon').html('').removeClass('fa').removeClass('fa-dollar').append('<img class="circle responsive-img" src="img/'+result.icon+'.png">');
	$('#currency').modal('close');
	
}
function logout(){
    remove('session');
    remove('userInfo');
    window.location.replace("./login");
}
function noti(msg){
    Materialize.toast(msg, 4000);
}
function doPost(url, data, callback){
    $.ajax({
        url: url,
        headers: {
            'Session': get('session'),
            'Content-Type':'application/json'
        },
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify(data),
        success: result => {
            callback(result);
        }
    });
}

function doGet(url, callback){
    $.ajax({
        url: url,
        headers: {
            'Session': get('session')
        },
        method: 'GET',
        success: result => {
            callback(result);
        }
    });
}
function set(param, value){
    return localStorage.setItem(param, value);
}

function get(param){
    return localStorage.getItem(param);
}

function remove(param){
    return localStorage.removeItem(param);
}
