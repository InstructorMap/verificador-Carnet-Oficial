    // El "cerebro" de la aplicación v2.3
    // Ahora calcula el estado (Activo/Vencido) y permite renovaciones.

    const { GoogleSpreadsheet } = require('google-spreadsheet');

    // Función para parsear fechas en formato DD/MM/YYYY
    function parseDate(dateString) {
        const [day, month, year] = dateString.split('/');
        return new Date(year, month - 1, day);
    }

    // Función principal que se ejecuta en Vercel
    export default async function handler(request, response) {
        // ---- CONFIGURACIÓN DE SEGURIDAD ----
        const allowedOrigins = ['https://instructormap.github.io'];
        const origin = request.headers.origin;
        if (allowedOrigins.includes(origin)) {
            response.setHeader('Access-Control-Allow-Origin', origin);
        }
        
        // Se añade PATCH a los métodos permitidos para las renovaciones
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (request.method === 'OPTIONS') {
            return response.status(200).end();
        }

        const doc = new GoogleSpreadsheet(process.env.SHEET_ID);
        try {
            await doc.useServiceAccountAuth(JSON.parse(process.env.GOOGLE_CREDENTIALS));
            await doc.loadInfo();
            const sheet = doc.sheetsByIndex[0];

            // --- RUTA 1: VERIFICAR O BUSCAR (Método GET) ---
            if (request.method === 'GET') {
                const { id, query } = request.query;
                const rows = await sheet.getRows();

                // Sub-ruta A: Verificación por matrícula exacta
                if (id) {
                    const record = rows.find(row => row.matricula === id);
                    if (record) {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0); // Normalizar a medianoche
                        const expirationDate = parseDate(record.vence);
                        
                        // NUEVA LÓGICA: Calcular el estado
                        const status = expirationDate >= today ? 'Activo' : 'Vencido';

                        return response.status(200).json({ 
                            success: true, 
                            data: {
                                nombre: record.nombre, dni: record.dni, matricula: record.matricula,
                                cursos: record.cursos, vence: record.vence,
                                status: status // Devuelve el nuevo estado
                            }
                        });
                    } else {
                        return response.status(404).json({ success: false, message: 'Carnet no encontrado.' });
                    }
                }

                // Sub-ruta B: Búsqueda por nombre o DNI
                if (query) {
                    const searchTerm = query.toLowerCase();
                    const results = rows
                        .filter(row => 
                            row.nombre.toLowerCase().includes(searchTerm) || 
                            row.dni.toLowerCase().includes(searchTerm)
                        )
                        .map(row => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const expirationDate = parseDate(row.vence);
                            const status = expirationDate >= today ? 'Activo' : 'Vencido';
                            return {
                                nombre: row.nombre, dni: row.dni, matricula: row.matricula,
                                cursos: row.cursos, vence: row.vence, status: status
                            };
                        });
                    
                    return response.status(200).json({ success: true, data: results });
                }

                return response.status(400).json({ success: false, message: 'Falta el ID o el término de búsqueda.' });
            }

            // --- RUTA 2: CREAR UN NUEVO CARNET (Método POST) ---
            if (request.method === 'POST') {
                // (Lógica de creación de carnet con reCAPTCHA - sin cambios)
                const recaptchaToken = request.body['g-recaptcha-response'];
                if (!recaptchaToken) {
                     return response.status(400).json({ success: false, message: 'Falta el token de reCAPTCHA.' });
                }
                const secretKey = process.env.RECAPTCHA_SECRET_KEY;
                const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
                const recaptchaRes = await fetch(verificationUrl, { method: 'POST' });
                const recaptchaJson = await recaptchaRes.json();
                if (!recaptchaJson.success) {
                    return response.status(403).json({ success: false, message: 'Verificación de reCAPTCHA fallida.' });
                }
                const rows = await sheet.getRows();
                const { nombre, dni, cargo2, vence, titulo, cargo1 } = request.body;
                if (!nombre || !dni || !cargo2) {
                    return response.status(400).json({ success: false, message: 'Faltan datos requeridos.' });
                }
                let existingRow = rows.find(row => row.dni === dni);
                let matricula;
                if (existingRow) {
                    matricula = existingRow.matricula;
                    const existingCourses = existingRow.cursos ? existingRow.cursos.split(', ') : [];
                    if (!existingCourses.includes(cargo2)) {
                        existingCourses.push(cargo2);
                        existingRow.cursos = existingCourses.join(', ');
                    }
                    await existingRow.save();
                } else {
                    matricula = `${String(Math.floor(1000 + Math.random() * 9000))}-${String(Math.floor(100000 + Math.random() * 900000))}`;
                    await sheet.addRow({
                        nombre, dni, matricula, cursos: cargo2, vence, titulo, cargo1,
                        fecha_creacion: new Date().toLocaleDateString('es-AR')
                    });
                }
                return response.status(200).json({ success: true, matricula });
            }

            // --- RUTA 3: RENOVAR UN CARNET (Método PATCH) ---
            if (request.method === 'PATCH') {
                const { matricula, nuevaFechaVencimiento } = request.body;
                if (!matricula || !nuevaFechaVencimiento) {
                    return response.status(400).json({ success: false, message: 'Faltan datos para la renovación.' });
                }
                const rows = await sheet.getRows();
                const rowToUpdate = rows.find(row => row.matricula === matricula);
                if (rowToUpdate) {
                    rowToUpdate.vence = nuevaFechaVencimiento;
                    await rowToUpdate.save();
                    return response.status(200).json({ success: true, message: 'Carnet renovado exitosamente.' });
                } else {
                    return response.status(404).json({ success: false, message: 'No se encontró el carnet para renovar.' });
                }
            }

        } catch (error) {
            console.error('Error procesando la solicitud:', error);
            return response.status(500).json({ success: false, message: 'Error interno del servidor.' });
        }
    }
    

