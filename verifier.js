document.addEventListener('DOMContentLoaded', () => {
    const resultContainer = document.getElementById('result-container');
    const params = new URLSearchParams(window.location.search);
    const matriculaId = params.get('id');

    if (!matriculaId) {
        displayError('No se proporcionó una matrícula para verificar.');
        return;
    }

    // 'carnetDatabase' viene del archivo database.js
    // Usamos setTimeout para simular una pequeña demora, dando tiempo a que todo cargue.
    setTimeout(() => {
        const record = carnetDatabase.find(item => item.matricula === matriculaId);

        if (record) {
            displaySuccess(record);
        } else {
            displayError('Matrícula no encontrada en el registro oficial.');
        }
    }, 500);
});

function displaySuccess(data) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = `
        <div class="flex justify-center mb-4">
            <svg class="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Carnet Válido y Oficial</h1>
        <div class="text-left mt-6 space-y-2 text-gray-700 border-t pt-4">
            <p><strong>Titular:</strong> ${data.nombre}</p>
            <p><strong>DNI:</strong> ${data.dni}</p>
            <p><strong>Matrícula:</strong> <span class="font-bold">${data.matricula}</span></p>
            <p><strong>Especialidad:</strong> ${data.cargo2}</p>
            <p><strong>Vence:</strong> <span class="font-bold text-red-600">${data.vence}</span></p>
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
