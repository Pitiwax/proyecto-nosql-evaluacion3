window.onload = function () {
    obtenerEmpleos();
}

function obtenerEmpleos() {
    const cargarTabla = async () => {
        try {
            // Llamamos al ENDPOINT para obtener datos de los empleos
            const response = await fetch('http://localhost:3000/obtenerEmpleos');
            const empleos = await response.json();

            console.log(empleos);
            new DataTable('#tablaEmpleos', {
                data: empleos,
                columns: [
                    { data: 'empresa' },
                    { data: 'cargo' },
                    { data: 'modalidad' },
                    { 
                        data: 'salario',
                        render: function (data) {
                            if (!data) return '$0';
                            return '$' + data.toLocaleString('es-CL');
                        }
                    },
                    { data: 'datosUsuario[0].rut' },
                    { data: 'datosUsuario[0].nombre' }
                ]
            });
        } catch (err) {
            console.log('Error al obtener los datos de empleos: ', err)
        }
    }
    cargarTabla();
};
