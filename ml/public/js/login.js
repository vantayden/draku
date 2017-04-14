$( document ).ready(function() {
    $('.toggle').on('click', ()=> {
        $('.container').stop().addClass('active');
    });

    $('.close').on('click', ()=> {
        $('.container').stop().removeClass('active');
    });
    
    $('#login').submit(()=>{
        if($('#login_email').val() != '' && $('#login_password').val() != ''){
            doPost('api/user/login', {'email': $('#login_email').val(), 'password': $('#login_password').val()}, result=>{
                if(!result.error) {
                    set('session', result.session);
                    window.location.replace("./");
                }
                noti(result.message);
            });
            $('#login_password').val('');
        }
    });

    $('#register').submit(()=>{
        if($('#register_password').val() != $('#register_password_retype').val()){
            noti("Mật khẩu nhập lại không đúng");
            $('#register_password').val('');
            $('#register_password_retype').val('');
        } else if($('#register_email').val() != '' && $('#register_name').val() != ''){
            doPost('api/user/add', {'email': $('#register_email').val(), 'name': $('#register_name').val(), 'password': $('#register_password').val()}, result=>{
                if(!result.error) {
                    $('.container').stop().removeClass('active');
                    $('#register').reset();
                }
                noti(result.message);
            });
            $('#register_password').val('');
            $('#register_password_retype').val('');
        }
    });
});

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
