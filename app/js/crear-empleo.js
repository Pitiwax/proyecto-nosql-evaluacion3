window.onload = function () {
    cargarUsuariosEnSelect();
};

// Función para el menú desplegable
async function cargarUsuariosEnSelect() {
    try {
        const response = await fetch('http://localhost:3000/obtenerUsuarios');
        const usuarios = await response.json();

        const select = document.getElementById('selectUsuario');
        usuarios.forEach(user => {
            const opcion = document.createElement('option');
            opcion.value = user._id; 
            opcion.textContent = `${user.nombre} (${user.rut})`;
            select.appendChild(opcion);
        });
    } catch (error) {
        console.log('Error al cargar la lista de usuarios: ', error);
    }
}

// Función para enviar los datos al backend
async function guardarNuevoEmpleo() {
    const formulario = document.getElementById('formularioEmpleo');
    
    
    if (!formulario.checkValidity()) {
        alert('Por favor complete todos los campos obligatorios del empleo.');
        return;
    }

    const dataForm = new FormData(formulario);
    const datos = Object.fromEntries(dataForm.entries());

        try {
        const response = await fetch('http://localhost:3000/guardarEmpleo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        } else {
            
            const data = await response.json();
            
            alert(data.message);
            
            window.location.href = './empleos.html';
        }
    } catch (error) {
        console.error("Error al guardar el empleo:", error);
        alert('Ocurrió un error al procesar el guardado del empleo.');
    }

}
