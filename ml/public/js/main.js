let setWallet = true;
let addTransaction = false;
$( document ).ready(function() {
    if(!get('session'))
        window.location.replace("./login");
    $('.modal').modal();
    $("#add_transaction").modal({
		ready: ()=>{
			setWallet = false;
            addTransaction = true;
		},
        complete : ()=>{
            setWallet = true;
            addTransaction = false;
		}
    });
    $("#update_transaction").modal({
        ready: ()=>{
            setWallet = false;
        },
        complete : ()=>{
            setWallet = true;
        }
    });
	$('.modal-addition').modal({
      dismissible: false
    });
    $('.datepicker').pickadate({
        container: 'body',
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 5, // Creates a dropdown of 15 years to control year
        onSet: function( arg ){
            if ( 'select' in arg ){ //prevent closing on selecting month/year
                this.close();
            }
        }
    });
	if(!get('userInfo')){
		doGet('api/user/info', result=>{
			if(result.error)
				logout();
			else{
                set('userInfo', JSON.stringify(result));
                updateUserInfo();
			}
		});
	} else updateUserInfo();
	if(!get('currency') && !get('category')){
		doGet('api/currency/all', result=>{
		   set('currency', JSON.stringify(result));
		});
		doGet('api/category/all', result=>{
		   set('category', JSON.stringify(result));
		   updateCC();
		});
	} else updateCC();
		
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
		let data = {'name' : $('#add_wallet_name').val(), 'currency' : $('#add_wallet_currency_id').val(), 'startAmount' : $('#add_wallet_startAmount').val()};
		if(!!data.name && !!data.currency && !!data.startAmount)
			doPost('api/wallet/add', data, result =>{
				if(!result.error){
					$('#add_wallet').modal('close');
					$('#add_wallet_name').val('');
					$('#add_wallet_currency').val('');
					$('#add_wallet_startAmount').val('');
					updateWallet();
				}
				noti(result.message);
			});
	});
	$('#add_transaction_button').on('click', ()=>{
        let data = {'category' : $('#add_transaction_category_id').val(), 'amount' : $('#add_transaction_amount').val(), 'note' : $('#add_transaction_note').val(),  'date' : $('#add_transaction_date').val(), 'wallet' : $('#add_transaction_wallet_id').val()};
        if(!!data.category && !!data.amount && !!data.date && !!data.wallet && !!data.note)
        	doPost('api/transaction/add', data, result =>{
				if(!result.error){
					$('#add_transaction').modal('close');
					$('#add_transaction_note').val('');
					$('#add_transaction_amount').val('');
					$('#add_transaction_date').val('');
					$('#add_transaction_category').val('');
				}
				noti(result.message);
                getTransaction();
			});
    });
    $('#update_transaction_button').on('click', ()=>{
        let data = {'category' : $('#update_transaction_category_id').val(), 'amount' : $('#update_transaction_amount').val(), 'note' : $('#update_transaction_note').val(),  'date' : $('#update_transaction_date').val(), 'wallet' : $('#update_transaction_wallet_id').val()};
        if(!!data.category && !!data.amount && !!data.date && !!data.wallet && !!data.note)
            doPost('api/transaction/update/'+$('#update_transaction_id').val(), data, result =>{
                if(!result.error){
                    $('#update_transaction').modal('close');
                }
                noti(result.message);
                getTransaction();
            });
    });
    $('#update_transaction_delete').on('click', ()=>{
            doGet('api/transaction/remove/'+$('#update_transaction_id').val(), result =>{
                if(!result.error){
                    $('#update_transaction').modal('close');
                }
                noti(result.message);
                getTransaction();
            });
    });
	updateWallet();
    
});

function getTransaction(){
	let id = $('#current_wallet').val();
    doGet('api/transaction/all/'+id, result=>{
        if(!result.error)
        	if(result.transaction.length == 0) {
                $('#transaction_list').html('<div class="center"><h4>No transactions. Tap <i class="fa fa-plus"></i> to add one</h4></div>');
            } else {
        	let inflow=0, outflow=0, currency = $('.wallet_currency').html(), transaction_list = '';
        	result.transaction.forEach((item, index)=>{
        		if(item.category.type == 0)
        			outflow+=Number(item.amount);
        		else
        			inflow+=Number(item.amount);
        		item.currency=currency;
                transaction_list+=transactionView(item);
			});
                $('#transaction_list').html(overview(inflow, outflow, currency)+'<br>\
                    <br>\
                    <div class="row">\
                    <div class="list-view">\
                    '+transaction_list+'\
                    </div>\
                    </div>');
			}
    });
}

function updateWallet(){
	doGet('api/wallet/all', result=>{
		$('#wallet_list').html('');
		if(!result.error)
			result.wallet.forEach((item, index)=>{
				$('#wallet_list').append('\
	<div class="col s12 wallet" onclick="setCurrent('+item.id+', \''+item.name+'\');">\
        <div class="card-panel grey lighten-5 z-depth-1">\
          <div class="row valign-wrapper">\
            <div class="col s6">\
              <img src="img/wallet.png" alt="wallet" class="circle responsive-img">\
            </div>\
            <div class="col s10">\
              <span class="black-text">\
                <h5>'+item.name+'</h5>\
                <span>'+moneyFormat(item.balance)+' '+item.currency+'</span>\
              </span>\
            </div>\
          </div>\
        </div>\
      </div>');
	  if(item.current == 1){
	  	$('#current_wallet').val(item.id);
	  	getTransaction();
		$('#wallet_name').html(item.name);
		$('#wallet_balance').html(moneyFormat(item.balance)+' <span class="wallet_currency">'+item.currency+'</span>');
		$('#add_transaction_wallet').val(item.name);
		$('#add_transaction_wallet_id').val(item.id);
		$('.wallet_currency').html(item.currency);
	  }
			});
    });
}

function setCurrent(id, name){
    if(setWallet)
        doGet('api/wallet/current/'+id, result =>{
            if(!result.error){
                $('#wallet').modal('close');
                updateWallet();
            }
            noti(result.message);
        });
    else{
    	if(addTransaction){
            $('#add_transaction_wallet').val(name);
            $('#add_transaction_wallet_id').val(id);
		} else {
            $('#update_transaction_wallet').val(name);
            $('#update_transaction_wallet_id').val(id);
		}
        $('#wallet').modal('close');
    }

}
function updateUserInfo(){
	let result = JSON.parse(get('userInfo'));
	$('#name').html('<i class="fa fa-user"></i> ' + result.name);
	$('#my_account_email').val(result.email);
	$('#my_account_name').val(result.name);
}

function updateCC(){
	let result = JSON.parse(get('currency'));
	$('#currency_list').html('');
	result.currency.forEach((item, index)=>{
		$('#currency_list').append('\
		<div class="col s3 center currency" onclick="setCurrency({id:'+item.id+', name:\''+item.name+'\', icon:\''+item.icon+'\'});">\
			<img class="circle responsive-img" src="img/'+item.icon+'.png" alt="'+item.name+'"><br>\
			<span>\
			'+item.short+'\
			</span>\
		</div>\
		');
	});
	result = JSON.parse(get('category'));
	$('#catetgory_list_expense').html('');
	$('#catetgory_list_income').html('');
	result.category.forEach((item, index)=>{
		if(item.type == 0)
			$('#category_list_expense').append('\
			<div class="col s2 center category" onclick="setCategory({id:'+item.id+', name:\''+item.name+'\', icon:\''+item.icon+'\'});">\
				<img class="circle responsive-img" src="img/'+item.icon+'.png" alt="'+item.name+'"><br>\
				<span>\
				'+item.name+'\
				</span>\
			</div>\
			');
		else 
			$('#category_list_income').append('\
			<div class="col s2 center category" onclick="setCategory({id:'+item.id+', name:\''+item.name+'\', icon:\''+item.icon+'\'});">\
				<img class="circle responsive-img" src="img/'+item.icon+'.png" alt="'+item.name+'"><br>\
				<span>\
				'+item.name+'\
				</span>\
			</div>\
			');
	});
}
function setCategory(result){
	if(addTransaction){
        $('#add_transaction_category_id').val(result.id);
        $('#add_transaction_category').val(result.name);
        $('#add_transaction_category_icon').html('').removeClass('fa').removeClass('fa-dollar').append('<img class="circle responsive-img" src="img/'+result.icon+'.png">');
	} else {
        $('#update_transaction_category_id').val(result.id);
        $('#update_transaction_category').val(result.name);
        $('#update_transaction_category_icon').html('').removeClass('fa').removeClass('fa-dollar').append('<img class="circle responsive-img" src="img/'+result.icon+'.png">');
	}
    $('#category').modal('close');
}
function setCurrency(result){
	$('#add_wallet_currency_id').val(result.id);
	$('#add_wallet_currency').val(result.name);
	$('#currency_icon').html('').removeClass('fa').removeClass('fa-dollar').append('<img class="circle responsive-img" src="img/'+result.icon+'.png">');
	$('#currency').modal('close');
	
}
function transactionView(data){
	let status, color;
	if(data.category.type == 1){
		status =  'status--online';
		color = 'blue-text';
	} else {
        status =  'status--away';
        color = 'red-text';
	}

	return '                <div class="list__item user '+status+' z-depth-3">\
        <div class="media media--user">\
        <div class="media__image">\
        <div class="image__overlay"></div>\
        <img src="img/'+data.category.icon+'.png" alt="user" class="img--avatar">\
        </div>\
        <div class="media__bd user__bd">\
        <i class="status-indicator "></i>\
        <br>\
        <div class="user-info row">\
        <div class="col s6">\
    <p class="user__name">'+data.note+'</p>\
    <p class="user__description">'+data.date+'</p>\
    </div>\
        <p class="user__name col s6 right-align '+color+'">'+data.amount+' <span class="wallet_currency">'+data.currency+'</span></p>\
    </div>\
    <div class="actions">\
        <a rel="nofollow" rel="noreferrer" href="#" onclick="updateTransaction(\''+data.id+'\',\''+data.amount+'\',\''+data.note+'\',\''+data.date+'\',\''+data.category.id+'\',\''+data.category.name+'\',\''+data.category.icon+'\',\''+data.wallet.id+'\',\''+data.wallet.name+'\')" class="action__item">\
        <svg style="width:24px;height:24px" viewBox="0 0 24 24">\
        <path fill="#000000" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />\
        </svg>\
        </div>\
        </a>\
        </div>\
        </div>\
        </div>';
}

function updateTransaction(id, amount, note, date, category_id, category_name, category_icon, wallet_id, wallet_name){
    $('#update_transaction_id').val(id);
    $('#update_transaction_amount').val(amount);
    $('#update_transaction_note').val(note);
    $('#update_transaction_date').val(date);
    $('#update_transaction_category').val(category_name);
    $('#update_transaction_category_id').val(category_id);
    $('#update_transaction_category_icon > img').attr('src', 'img/'+category_icon+'.png');
    $('#update_transaction_wallet').val(wallet_name);
    $('#update_transaction_wallet_id').val(wallet_id);
	$('#update_transaction').modal('open');
}

function overview(inflow, outflow, currency){
	let sum = Number(inflow-outflow);
	let textColor = (sum<0)? 'red-text':'blue-text';
	return '\
        <div class="row">\
        <div class="col m6 offset-m3 s12">\
        <div class="card white z-depth-3">\
        <div class="card-content white z-depth-3">\
        <span class="card-title">Overview</span><hr>\
        <p>\
        <div class="row">\
        <div class="col s8 left">Inflow: </div>\
    <div class="col s4 right-align blue-text">'+inflow+' <span class="wallet_currency">'+currency+'</span></div>\
        </div>\
        </p>\
        <p>\
        <div class="row">\
        <div class="col s8 left">Outflow: </div>\
    <div class="col s4 right-align red-text">'+outflow+' <span class="wallet_currency">'+currency+'</span></div>\
        </div>\
        </p>\
        <p>\
        <div class="row">\
        <div class="col s4 offset-s8 right-align '+textColor+'"><hr>'+sum+' <span class="wallet_currency">'+currency+'</span></div>\
        </div>\
        </p>\
        </div>\
        </div>\
        </div>\
        </div>';
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