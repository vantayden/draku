$( document ).ready(function() {
    if(!get('session'))
        window.location.replace("./login");
    $('.modal').modal();
    doGet('api/user/info', result=>{
        if(result.error)
            logout();
        $('#name').html('<i class="fa fa-user"></i> ' + result.name);
       set('name', result.name);
       set('email', result.email);
    });
    doGet('api/wallet/all', result=>{
        $('#wallet_name').html(result.wallet[0].name);
        $('#wallet_balance').html(moneyFormat(result.wallet[0].balance)+' '+result.wallet[0].currency);
    });
});
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
function logout(){
    remove('session');
    remove('name');
    remove('email');
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
