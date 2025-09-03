    // Lógica de Verificación v2.1
    // Ahora se comunica de forma segura con la API en Vercel.

    document.addEventListener('DOMContentLoaded', async () => {
        const resultContainer = document.getElementById('result-container');
        const params = new URLSearchParams(window.location.search);
        const matriculaId = params.get('id');

        // Muestra un estado de carga inicial
        resultContainer.innerHTML = `<h1 class="text-2xl font-bold text-gray-800">Verificando...</h1>`;

        if (!matriculaId) {
            displayError('No se proporcionó un ID de carnet.');
            return;
        }
        
        // La URL del "cerebro" en Vercel
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
        // Transforma la lista de cursos en elementos de lista HTML
        const coursesList = data.cursos.split(', ').map(curso => `<li class="ml-5 list-disc">${curso}</li>`).join('');

        resultContainer.innerHTML = `
            <div class="flex justify-center mb-4">
                <svg class="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-800">Carnet Válido y Oficial</h1>
            <div class="text-left mt-6 space-y-2 text-gray-700">
                <p><strong>Nombre:</strong> ${data.nombre}</p>
                <p><strong>DNI:</strong> ${data.dni}</p>
                <p><strong>Matrícula:</strong> ${data.matricula}</p>
                <p><strong>Vence:</strong> <span class="font-bold text-red-600">${data.vence}</span></p>
                <div class="mt-4">
                    <p><strong>Historial de Cursos/Especialidades:</strong></p>
                    <ul class="mt-1">${coursesList}</ul>
                </div>
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
    

