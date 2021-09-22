let keycloakUrl = 'https://accounts.test.oneacrefund.org/auth'
let keycloakJsSrc = keycloakUrl + "/js/keycloak.js";

var script = document.createElement('script');
script.type = 'text/javascript';
script.src = keycloakJsSrc;
document.getElementsByTagName('head')[0].appendChild(script);

window.onload = function () {
    window.keycloak = new Keycloak({
        url: keycloakUrl,
        realm: 'OAF',
        clientId: 'operations',
        scope: 'openid email phone'
    });

    // Workaround for KEYCLOAK-14414
    window.keycloak._login = window.keycloak.login;
    window.keycloak.login = function (options) {
        if (options) {
            //options.scope="openid email";
            options.scope = "openid email phone";
        }
        return window.keycloak._login.apply(window.keycloak, [options]);
    };

    keycloak.init({
        // onLoad: 'login-required',
        onLoad: 'check-sso',
        checkLoginIframe: true,
        checkLoginIframeInterval: 1,
        pkceMethod: 'S256'
    }).success(function () {

        if (keycloak.authenticated) {
            $('#loginBtn').addClass('hide');
            $('#logoutBtn').removeClass('hide');
            $('#welcome').addClass('hide');
            $('.content-nav').removeClass('hide');
            showProfile();
        } else {
            $('.content-nav').addClass('hide');
            $('#welcome').removeClass('hide');
        }
    });


    keycloak.onAuthLogout = showWelcome;
};



function logout() {
    keycloak.logout();
    $('#loginBtn').toggleClass('hide');
    $('#logoutBtn').toggleClass('hide');
}

function showMenu() {
    select('.menu').style.display = 'block';
}

function showWelcome() {
    show('#welcome');
}

function showProfile() {
    $('.content-nav button').removeClass('active');
    let firstname = keycloak.tokenParsed['given_name'];
    let lastname = keycloak.tokenParsed['family_name'];
    let email = keycloak.tokenParsed['email'];

    if (firstname) {
        select('#firstName').innerHTML = firstname;
    }
    if (lastname) {
        select('#lastName').innerHTML = lastname;
    }
    if (email) {
        select('#email').innerHTML = email;
    }
    $('.profileBtn').addClass('active')
    show('#profile');
}

function showToken() {
    $('.content-nav button').removeClass('active');
    select('#token-content').innerHTML = prettyPrintJson(keycloak.tokenParsed);
    $('.tokenBtn').addClass('active')
    show('#token');
}

function showIdToken() {
    $('.content-nav button').removeClass('active');
    select('#idToken-content').innerHTML = prettyPrintJson(keycloak.idTokenParsed);
    $('.idTokenBtn').addClass('active')
    show('#idToken');
}

function showUserInfo() {
    $('.content-nav button').removeClass('active');
    keycloak.loadUserInfo().then(userinfo => {
        select('#userinfo-content').innerHTML = prettyPrintJson(userinfo);
        $('.userInfo').addClass('active')
        show('#userinfo');
    });
}

function prettyPrintJson(obj) {
    return JSON.stringify(obj, null, ' \t');
}

function show(selector) {
    $('#welcome').addClass('hide')
    $('#profile').addClass('hide')
    $('#token').addClass('hide')
    $('#idToken').addClass('hide')
    $('#userinfo').addClass('hide')
    $(selector).toggleClass('hide');
}

function select(selector) {
    return document.querySelector(selector);
}