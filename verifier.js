document.addEventListener('DOMContentLoaded', () => {
    // URL de tu función sin servidor
    const API_ENDPOINT = 'https://carnet-api-green.vercel.app/api/handler';

    const params = new URLSearchParams(window.location.search);
    const matriculaId = params.get('id');

    if (!matriculaId) {
        displayError('No se proporcionó una matrícula para verificar.');
        return;
    }

    fetch(`${API_ENDPOINT}?id=${matriculaId}`)
        .then(response => {
            if (response.status === 404) {
                throw new Error('Matrícula no encontrada en el registro oficial.');
            }
            if (!response.ok) {
                throw new Error('No se pudo conectar con el servidor de verificación.');
            }
            return response.json();
        })
        .then(data => {
            displaySuccess(data);
        })
        .catch(error => {
            console.error("Error:", error);
            displayError(error.message);
        });
});

function displaySuccess(data) {
    const resultContainer = document.getElementById('result-container');
    
    // Formatear la lista de cursos
    const cursosHtml = (data.cursos || 'Sin cursos registrados')
        .split(',')
        .map(curso => `<li class="bg-indigo-100 text-indigo-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">${curso.trim()}</li>`)
        .join('');

    resultContainer.innerHTML = `
        <div class="flex justify-center mb-4">
            <svg class="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Carnet Válido y Oficial</h1>
        <div class="text-left mt-6 space-y-3 text-gray-700 border-t pt-4">
            <p><strong>Titular:</strong> ${data.nombre || 'No disponible'}</p>
            <p><strong>DNI:</strong> ${data.dni || 'No disponible'}</p>
            <p><strong>Matrícula:</strong> <span class="font-bold text-gray-900">${data.matricula || 'No disponible'}</span></p>
            <div class="pt-2">
                <h3 class="text-md font-semibold mb-2">Historial de Cursos:</h3>
                <ul class="flex flex-wrap gap-2">
                    ${cursosHtml}
                </ul>
            </div>
            <p class="pt-2"><strong>Vence:</strong> <span class="font-bold text-red-600">${data.vence || 'No disponible'}</span></p>
        </div>
    `;
}

function displayError(message) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = `
        <div class="flex justify-center mb-4">
            <svg class="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Carnet Inválido</h1>
        <p class="text-gray-600 mt-2">${message}</p>
    `;
}

