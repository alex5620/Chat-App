colorsArray = [
    {value1: '#667aff', value2: '#7386ff'},
    {value1: '#f03131', value2: '#f03131ea'},
    {value1: '#28bd03', value2: '#28bd03da'}
];

window.sessionStorage.setItem('colorIndex', 2);
window.sessionStorage.setItem('interface', 1);

function changeStyle(cond)
{
    let colorIndex = window.sessionStorage.getItem('colorIndex');
    if(cond)
    {
        ++colorIndex;
        colorIndex = colorIndex % colorsArray.length;
        window.sessionStorage.setItem('colorIndex', colorIndex);
    }
    let root = document.documentElement;
    root.style.setProperty('--darker-color', colorsArray[colorIndex].value1);
    root.style.setProperty('--lighter-color', colorsArray[colorIndex].value2);
    let register = document.getElementById("register-menu");
    let login = document.getElementById("login-menu");
    if(cond && register)
    {
        if(register.style.opacity == 1)
        {
            register.style.backgroundColor = colorsArray[colorIndex].value1;
        }
        else
        {
            login.style.backgroundColor = colorsArray[colorIndex].value1;
        }
    }
};

changeStyle(false);

function login()
{
    usernameTemp = document.getElementById('username').value;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "login"); 
    xhr.onload = function(event){ 
        if(event.target.status === 401)
        {
            document.getElementById('login-message').innerHTML = "Invalid Credentials.";
        }
        else if(event.target.status === 403)
        {
            document.getElementById('login-message').innerHTML = "You have been banned temporarily.";
        }
        else if(event.target.status === 202)
        {
            document.getElementById('login-message').innerHTML = "You are already logged into this room.";
        }
        else if(event.target.status === 200)
        {
            myStorage = window.sessionStorage;
            sessionStorage.setItem('username', document.getElementById('username').value);
            sessionStorage.setItem('room', document.getElementById('room').value);
            // dupa apelul redirect nu se incarca automat noul fisier..
            window.location.href = '../html/chat.html';
        }
    }; 
    var formData = new FormData(document.getElementById("login-form")); 
    xhr.send(formData);
}

function register()
{
    usernameTemp = document.getElementById('username').value;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "register"); 
    xhr.onload = function(event){ 
        if(event.target.status === 401)
        {
            document.getElementById('register-message').innerHTML = "Passwords does not correspond.";
        }
        else if(event.target.status === 422)
        {
            document.getElementById('register-message').innerHTML = "Password or username too short.";
        }
        else if(event.target.status === 409)
        {
            document.getElementById('register-message').innerHTML = "User exists already.";
        }
        else if(event.target.status === 200)
        {
            document.getElementById('register-message').innerHTML = "Registered Successfully.";
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('password2').value = '';
        }
    }; 
    var formData = new FormData(document.getElementById("register-form")); 
    xhr.send(formData);
}

function loginMenuClicked()
{
    let register = document.getElementById("register-menu");
    let login = document.getElementById("login-menu");
    login.style.backgroundColor = "#000000";
    login.style.opacity = 0.7;
    let element = document.getElementById('chat-header');
    register.style.backgroundColor = window.getComputedStyle( element , null).getPropertyValue('background-color'); 
    register.style.opacity = 1;
    changeContent('../html/login');
}

function registerMenuClicked()
{
    let register = document.getElementById("register-menu");
    let login = document.getElementById("login-menu");
    register.style.backgroundColor = "#000000";
    register.style.opacity = 0.7;
    let element = document.getElementById('chat-header');
    login.style.backgroundColor = window.getComputedStyle( element , null).getPropertyValue('background-color'); 
    login.style.opacity = 1;
    changeContent('../html/register');
}

function changeContent(resource)
{
    const interfaceType = sessionStorage.getItem('interface');
    if((resource.includes('login') && interfaceType == 1) || (resource.includes('register') && interfaceType == 0))
    {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let main = document.getElementById("content");
                if(main!=null) 
                { 
                    main.innerHTML = this.responseText
                };
            }
        };
        xhttp.open('GET', resource+'.html', true);
        xhttp.send();
        window.sessionStorage.setItem('interface', ((parseInt(interfaceType)+1)%2));
    }
}

changeContent('../html/login');

function removeUserInfo()
{
    let myStorage = window.sessionStorage;
    myStorage.removeItem('username');
    myStorage.removeItem('room');
}

window.onclick = function(event) {
    var rulesModal = document.getElementById("rules-modal");
    var modal = document.getElementById("modal");
    if (event.target == rulesModal) {
        closeRulesModal();
    }
    if(event.target == modal)
    {
        closeModal();
    }
}

function openRulesModal()
{
    let modal = document.getElementById("rules-modal");
    modal.style.display = "block";
    let roomName = document.getElementById('rules-room-name');
    roomName.innerHTML = document.getElementById('room-name').innerHTML.replace('(rules)','') + '-Rules';
}

function closeRulesModal()
{
    var modal = document.getElementById("rules-modal");
    modal.style.display = "none";
}
