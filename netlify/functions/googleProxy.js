// netlify/functions/googleProxy.js
// Función proxy para manejar comunicación con Google Apps Script

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwoVv2FNdzL18WOm_H2Y6k45uAjSL2mV288IkCshGpotR6TQrkQH0T0m-bpPbReyD4T/exec'; 
const TIMEOUT_MS = 25000; // 25 segundos (menor que el timeout de Netlify de 26s)

exports.handler = async (event, context) => {
    // Configurar CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Manejar preflight OPTIONS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Solo aceptar POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ 
                success: false,
                error: 'Method not allowed. Use POST.' 
            })
        };
    }

    try {
        console.log(`[PROXY] Método: ${event.httpMethod}`);
        console.log(`[PROXY] Body:`, event.body);

        let requestData;
        
        // Parsear datos del POST
        try {
            requestData = JSON.parse(event.body || '{}');
        } catch (e) {
            console.error('[PROXY] Error parsing POST body:', e);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false,
                    error: 'Invalid JSON in request body' 
                })
            };
        }

        console.log(`[PROXY] Enviando a Google Apps Script...`);
        console.log(`[PROXY] URL: ${GOOGLE_SCRIPT_URL}`);
        console.log(`[PROXY] Data:`, JSON.stringify(requestData));
        
        // Hacer la petición a Google Apps Script
        try {
            // Usar fetch nativo (Node 18+)
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain', // Cambiar a text/plain
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData),
                redirect: 'follow' // Seguir redirecciones automáticamente
            });

            console.log(`[PROXY] Respuesta recibida: ${response.status}`);
            console.log(`[PROXY] Headers:`, response.headers);

            const responseData = await response.text();
            console.log(`[PROXY] Respuesta raw (primeros 200 chars):`, responseData.substring(0, 200));

            // Intentar parsear como JSON
            try {
                const jsonData = JSON.parse(responseData);
                console.log(`[PROXY] Respuesta parseada como JSON exitosamente`);
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(jsonData)
                };
            } catch (parseError) {
                console.log('[PROXY] No es JSON válido, verificando si es HTML de error');
                
                // Si contiene HTML, es probable que sea un error de autenticación
                if (responseData.includes('<!DOCTYPE') || responseData.includes('<html')) {
                    console.error('[PROXY] Respuesta HTML detectada - posible error de autenticación');
                    return {
                        statusCode: 401,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Authentication error from Google Apps Script',
                            mensaje: 'El script necesita ser re-desplegado con permisos públicos',
                            solucion: 'En Google Apps Script: Deploy > Manage Deployments > Edit > Who has access: Anyone'
                        })
                    };
                }
                
                // Si no es JSON pero tampoco HTML, devolver el texto
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'Respuesta recibida pero no es JSON',
                        rawResponse: responseData.substring(0, 500)
                    })
                };
            }

        } catch (fetchError) {
            console.error('[PROXY] Error en fetch:', fetchError);
            console.error('[PROXY] Stack:', fetchError.stack);
            
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Failed to connect to Google Apps Script',
                    details: fetchError.message
                })
            };
        }

    } catch (error) {
        console.error('[PROXY] Error general:', error);
        console.error('[PROXY] Stack:', error.stack);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal proxy error',
                details: error.message
            })
        };
    }
};
