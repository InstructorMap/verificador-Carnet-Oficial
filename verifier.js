document.addEventListener('DOMContentLoaded', () => {
    // URL de la hoja de cálculo pública (CSV)
    const googleSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQiG5kg5Sfb6bJRRE94LWtET6phxXgCHkIRK1F8XXdGUyrNRZFOKGWRO7squgM8Op1XtKs1DCJHPxfp/pub?gid=206836531&single=true&output=csv';

    const params = new URLSearchParams(window.location.search);
    const matriculaId = params.get('id');

    if (!matriculaId) {
        displayError('No se proporcionó una matrícula para verificar.');
        return;
    }

    fetch(googleSheetUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar la base de datos.');
            }
            return response.text();
        })
        .then(csvText => {
            const data = parseCSV(csvText);
            // El nombre de la columna debe coincidir EXACTAMENTE con el de tu hoja de cálculo
            const record = data.find(item => item.matricula === matriculaId); 
            
            if (record) {
                displaySuccess(record);
            } else {
                displayError('Matrícula no encontrada en el registro oficial.');
            }
        })
        .catch(error => {
            console.error("Error:", error);
            displayError('Ocurrió un error al conectar con la base de datos.');
        });
});

function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, '')); // Limpia cabeceras
    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(value => value.trim().replace(/"/g, '')); // Limpia valores
        if (values.length === headers.length) {
            let record = {};
            headers.forEach((header, index) => {
                record[header] = values[index];
            });
            records.push(record);
        }
    }
    return records;
}


function displaySuccess(data) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = `
        <div class="flex justify-center mb-4">
            <svg class="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Carnet Válido y Oficial</h1>
        <div class="text-left mt-6 space-y-2 text-gray-700 border-t pt-4">
            <p><strong>Titular:</strong> ${data.nombre || 'No disponible'}</p>
            <p><strong>DNI:</strong> ${data.dni || 'No disponible'}</p>
            <p><strong>Matrícula:</strong> <span class="font-bold">${data.matricula || 'No disponible'}</span></p>
            <p><strong>Especialidad:</strong> ${data.cargo2 || 'No disponible'}</p>
            <p><strong>Vence:</strong> <span class="font-bold text-red-600">${data.vence || 'No disponible'}</span></p>
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
