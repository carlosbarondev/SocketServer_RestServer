var URLdomain = window.location.host; // Para pruebas del despliegue: Guardar en local o en heroku
let direccion = "";
if (URLdomain.includes("localhost")) {
    direccion = 'http://localhost:8080/api/auth/';
} else {
    direccion = 'https://restserver-node-cbar.herokuapp.com/api/auth/';
}

const miFormulario = document.querySelector('form');
miFormulario.addEventListener('submit', ev => {

    ev.preventDefault();

    const formData = {};

    for (let el of miFormulario.elements) {
        if (el.name.length > 0)
            formData[el.name] = el.value;
    }

    fetch(direccion + 'login', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(resp => resp.json())
        .then(({ msg, token }) => {
            if (msg) {
                return console.error(msg);
            }
            localStorage.setItem('token', token);
            window.location = 'chat.html';
        })
        .catch(err => {
            console.log(err);
        })

});

function handleCredentialResponse(response) {
    // Google Token : ID_TOKEN
    //console.log('id_token', response.credential);

    const body = { id_token: response.credential };

    fetch(direccion + 'google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(resp => resp.json())
        .then(({ token }) => {
            console.log(token);
            localStorage.setItem('token', token);
            window.location = 'chat.html';
        })
        .catch(console.warn);
}

const button = document.getElementById("google_signout");
button.onclick = () => {
    console.log(google.accounts.id);
    google.accounts.id.disableAutoSelect();
    google.accounts.id.revoke(localStorage.getItem('email'), done => {
        localStorage.clear();
        location.reload();
    });
}