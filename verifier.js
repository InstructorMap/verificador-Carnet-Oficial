// Lógica de Verificación v2.3
// Ahora muestra los logos y firmas de avales.

document.addEventListener('DOMContentLoaded', async () => {
    const resultContainer = document.getElementById('result-container');
    const params = new URLSearchParams(window.location.search);
    const matriculaId = params.get('id');

    resultContainer.innerHTML = `<h1 class="text-2xl font-bold text-gray-800">Verificando...</h1>`;

    if (!matriculaId) {
        displayError('No se proporcionó un ID de carnet.');
        return;
    }
    
    const API_ENDPOINT = 'https://carnet-api-green.vercel.app/api/handler';
    const verificationUrl = `${API_ENDPOINT}?id=${matriculaId}`;

    try {
        const response = await fetch(verificationUrl);
        const result = await response.json();

        if (response.ok && result.success) {
            displaySuccess(result.data);
        } else {
            displayError(result.message || 'Carnet no encontrado o inválido.');
        }
    } catch (error) {
        console.error('Error fetching verification data:', error);
        displayError('No se pudo conectar con el servidor de verificación.');
    }
});

function displaySuccess(data) {
    const resultContainer = document.getElementById('result-container');
    const coursesList = data.cursos.split(', ').map(curso => `<li class="ml-5 list-disc">${curso}</li>`).join('');
    const isActivo = data.status === 'Activo';
    const statusColorClass = isActivo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const statusIcon = isActivo 
        ? `<svg class="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
        : `<svg class="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

    // URL de la imagen de avales construida con tu nombre de archivo
    const avalesImageUrl = 'https://instructormap.github.io/verificador-Carnet-Oficial/fondo%20carnet%20vuelta.png'; 

    resultContainer.innerHTML = `
        <div class="flex justify-center mb-4">
            ${statusIcon}
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Carnet Válido y Oficial</h1>
        
        <div class="mt-4 p-3 rounded-lg ${statusColorClass}">
            <p class="font-bold text-lg">Estado: ${data.status}</p>
        </div>

        <div class="text-left mt-6 space-y-2 text-gray-700">
            <p><strong>Nombre:</strong> ${data.nombre}</p>
            <p><strong>DNI:</strong> ${data.dni}</p>
            <p><strong>Matrícula:</strong> ${data.matricula}</p>
            <p><strong>Vence:</strong> <span class="font-bold">${data.vence}</span></p>
            <div class="mt-4">
                <p><strong>Historial de Cursos/Especialidades:</strong></p>
                <ul class="mt-1">${coursesList}</ul>
            </div>
        </div>

        <!-- NUEVA SECCIÓN DE AVALES Y FIRMAS -->
        <div class="mt-8 border-t pt-6">
            <h2 class="text-lg font-semibold text-gray-700 mb-4">Avales y Legalidades</h2>
            <img src="${avalesImageUrl}" alt="Logos y firmas de avales" class="w-full h-auto rounded-md">
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

