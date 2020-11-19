var register_btn = document.getElementById('register_btn');
var login_btn = document.getElementById('login_btn');
var error_text = document.getElementById('error_text');
var logout_btn = document.getElementById('logout_btn');

if(localStorage.getItem('user') != null){
    chrome.browserAction.setPopup({popup: 'index.html'}); 
}

if(register_btn){
    register_btn.addEventListener('click',function(e){
        var password = document.getElementById('password').value;
        var fullname = document.getElementById('fullname').value;
        var contact = document.getElementById('contact').value;
        var email = document.getElementById('email').value;
        e.preventDefault();
        
        const req = new XMLHttpRequest();
        const baseUrl = BASE_URL+"/api/register";
       
        const urlParams = {
            "fullname":fullname,
            "email":email,
            "contact":contact,
            "password":password,
        };
    
        req.open("POST", baseUrl);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader( 'Access-Control-Allow-Origin', '*');
        req.send(JSON.stringify(urlParams));
        // req.onload = function(){
        //     if(req.status == 200){
        //         var res = req.response;
        //         var JSONres = JSON.parse(res);
        //         var user = JSONres.user;
        //         localStorage.setItem('user',JSON.stringify(user));
        //         console.log(localStorage.getItem('user'));
        //         location.replace('index.html');
        //     }else{
        //         console.log(req,req.statusText);
        //         error_text.value = req.statusText;
        //         error_text.style.display = 'inline-block';
        //     }
        // }
        // req.onerror = function(){
        //     console.log('This is the error');
        // }
        req.onreadystatechange = function() { 
            console.log("readystate: " + request.readyState);
             if(request.readyState == 4) { 
                   console.log("status: " + request.status);
                    if (request.status == 401) {
                          //navigator.notification.alert("Your login/password is incorrect",null,"Authentication Error","OK");
                          console.log('came insideee');
                          return;
                    }
             }
        } 
        
        req.onreadystatechange = function() { 
            if(req.readyState == 4) { 
                   if (req.status != 200) {
                       var response_error = JSON.parse(req.response);
                       error_text.style.display = 'inline-block';
                       error_text.innerHTML = response_error.error;
                   }else{
                       var res = req.response;
                       var JSONres = JSON.parse(res);
                       var user = JSONres.user;
                       localStorage.setItem('user',JSON.stringify(user));
                       console.log(localStorage.getItem('user'));
                       location.replace('index.html');
                   }
            }
       } 
    })
}

if(login_btn){
    login_btn.addEventListener('click',function(e){
        var email = document.getElementById('email').value;
        var password = document.getElementById('password').value;
        e.preventDefault();
        const req = new XMLHttpRequest();
        const baseUrl = BASE_URL+"/api/login";
       
        const urlParams = {
            "email":email,
            "password":password,
        };
        console.log('came here')
        req.open("POST", baseUrl);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader( 'Access-Control-Allow-Origin', '*');
        req.send(JSON.stringify(urlParams));
    
        req.onreadystatechange = function() { 
             if(req.readyState == 4) { 
                    if (req.status != 200) {
                        var response_error = JSON.parse(req.response);
                        error_text.style.display = 'inline-block';
                        error_text.innerHTML = response_error.error;
                    }else{
                        var res = req.response;
                        var JSONres = JSON.parse(res);
                        var user = JSONres.user;
                        localStorage.setItem('user',JSON.stringify(user));
                        console.log(localStorage.getItem('user'));
                        location.replace('index.html');
                    }
             }
        } 
    })
}

if(logout_btn){
    logout_btn.addEventListener('click',function(){
        localStorage.setItem("user",null);
        location.replace('login.html');
    })
}