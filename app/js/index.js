window.onload = function () {
    obtenerUsuarios();
}

function obtenerUsuarios() {
    const enviarFormulario = async () => {
        try {
            // LLamamos al ENDPOINT para obtener datos de usuarios
            const response = await fetch('http://localhost:3000/obtenerUsuarios');
            const usuarios = await response.json();

            console.log(usuarios);

            new DataTable('#usuarios', {
                data: usuarios,
                columns: [
                    { data: 'nombre' },
                    { data: 'rut' },
                    { data: 'email' },
                    { data: 'paisOrigen[0].nameES' },
                    {
                        data: 'fechaNacimiento',
                        render: function (data, type, row) {
                            if (type === 'sort' || type === 'type') {
                                return data;
                            }

                            if (!data) return '';

                            let date = new Date(data);
                            return date.toLocaleDateString('es-CL', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            });
                        }
                    }
                ]
            });
        } catch (err) {
            console.log('Error al obtener los datos: ', err)
        }
    }
    enviarFormulario();
};