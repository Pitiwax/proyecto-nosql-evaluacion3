window.onload = function () {
    cargarPaises();
};

function validarFormulario() {
    let inputNombre = document.getElementById('inputNombre');
    let inputRut = document.getElementById('inputRut');
    let inputEmail = document.getElementById('inputEmail');
    let inputContrasena = document.getElementById('password');
    let inputRepetirContrasena = document.getElementById('passwordRepetir');
    let inputComuna = document.getElementById('inputComuna');
    let inputCalle = document.getElementById('inputCalle');
    let formularioValido = true;

    if (!validarInput(inputNombre)) {
        formularioValido = false;
    }
    if (!validarRut(inputRut)) {
        formularioValido = false;
    }
    if (!validarEmail(inputEmail)) {
        formularioValido = false;
    }
    if (!validarContrasena(inputContrasena)) {
        formularioValido = false;
    }
    if (!validarInput(inputRepetirContrasena)) {
        formularioValido = false;
    }
    if (!validarRepetirContrasena(inputRepetirContrasena)) {
        formularioValido = false;
    }
    if (!validarInput(inputComuna)) {
        formularioValido = false;
    }
    if (!validarInput(inputCalle)) {
        formularioValido = false;
    }

    if (formularioValido) {
        const formulario = document.getElementById('formularioRegistro');
        const dataForm = new FormData(formulario);

        const direccion = {
            comuna: dataForm.get('comuna'),
            calle: dataForm.get('calle'),
            numero: dataForm.get('numero'),
            departamento: dataForm.get('departamento')
        };
        dataForm.set('direccion', JSON.stringify(direccion));

        const datos = Object.fromEntries(dataForm.entries());

        const enviarFormulario = async () => {
            try {
                const response = await fetch('http://localhost:3000/guardarUsuario', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datos)
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                } else {
                    window.location.href = './index.html';
                }

                const data = await response.json();
                console.log("Datos recibidos:", data);
            } catch (error) {
                console.error("Error:", error);
            }
        };
        enviarFormulario();
    } else {
        alert('Debe completar los campos resaltados para enviar el formulario');
    }
};

function validarInput(input) {
    return input.value !== '' ? inputValido(input) : inputInvalido(input);
}

function validarEmail(input) {
    if (validarInput(input)) {
        const expresionEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return expresionEmail.test(input.value) ? inputValido(input) : inputInvalido(input);
    }
}

function validarContrasena(input) {
    if (validarInput(input)) {
        const expresionContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])([A-Za-z\d$@$!%*?&]|[^ ]){8,15}$/;
        return expresionContrasena.test(input.value) ? inputValido(input) : inputInvalido(input);
    }
}

function validarRepetirContrasena(input) {
    if (validarInput(input)) {
        let inputContrasena = document.getElementById('password');
        return input.value === inputContrasena.value ? inputValido(input):inputInvalido(input);
    }
}

function validarRut(inputRut) {
    if (validarInput(inputRut)) {
        rutCompleto = inputRut.value
        rutCompleto = rutCompleto.replaceAll('.', '');
        if (/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rutCompleto)) {
            const tmp = rutCompleto.split('-');
            const digv = tmp[1];
            const rut = tmp[0];
            if (digv == 'K') digv = 'k';
            return digitoVerificador(rut) != digv ? inputInvalido(inputRut) : inputValido(inputRut);

        } else {
            return inputInvalido(inputRut);
        }
    }
}

function digitoVerificador(T) {
    let M = 0, S = 1;
    for (; T; T = Math.floor(T / 10))
        S = (S + T % 10 * (9 - M++ % 6)) % 11;
    return S ? S - 1 : 'k';
}

function inputInvalido(input) {
    input.classList.add('alerta');
    input.classList.add('is-invalid');
    return false
};

function inputValido(input) {
    input.classList.remove('alerta');
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    return true
};

async function cargarPaises() {
    try {
        const response = await fetch('http://localhost:3000/obtenerPaises');
        const paises = await response.json();

        const select = document.getElementById('selectNacionalidad');
        paises.forEach(pais => {
            const opcion = document.createElement('option');
            opcion.value = pais.iso2;
            opcion.textContent = pais.nameES;
            select.appendChild(opcion);
        })
    } catch (error) {
        console.log('Ha ocurrido un error al cargar los datos: ', error);
    }
};