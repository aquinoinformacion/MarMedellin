// netlify/functions/googleProxy.js
// Función proxy para manejar comunicación con Google Apps Script

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxGGJhHOxQjjSug5mLu1Pkr7dNHsoKRrjfCGIo8gpgqRRvrW7wzbZaDeupKij9MEUPh/exec'; 
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

    try {
        console.log(`[PROXY] Método: ${event.httpMethod}`);
        console.log(`[PROXY] Body:`, event.body);

        let requestData;

        // Parsear datos según el método
        if (event.httpMethod === 'POST') {
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
        } else {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ 
                    success: false,
                    error: 'Method not allowed. Use POST.' 
                })
            };
        }

        console.log(`[PROXY] Enviando a Google Apps Script...`);
        
        // Usar AbortController para timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, TIMEOUT_MS);

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData),
                signal: controller.signal,
                redirect: 'follow' // Importante para manejar redirecciones de Google
            });

            clearTimeout(timeoutId);

            console.log(`[PROXY] Respuesta recibida: ${response.status}`);

            // Google Apps Script puede devolver 302 y luego 200
            if (!response.ok && response.status !== 302) {
                const errorText = await response.text();
                console.error(`[PROXY] Error response: ${response.status} - ${errorText}`);
                
                return {
                    statusCode: response.status,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: `Google Apps Script error: ${response.status}`,
                        details: errorText.substring(0, 500)
                    })
                };
            }

            const responseData = await response.text();
            console.log(`[PROXY] Respuesta exitosa, tamaño: ${responseData.length} caracteres`);

            // Verificar que sea JSON válido
            try {
                const jsonData = JSON.parse(responseData);
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(jsonData)
                };
            } catch (e) {
                // Si no es JSON, devolver como texto
                console.log('[PROXY] Respuesta no es JSON, devolviendo como texto');
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'Datos enviados correctamente',
                        rawResponse: responseData.substring(0, 200)
                    })
                };
            }

        } catch (fetchError) {
            clearTimeout(timeoutId);
            
            if (fetchError.name === 'AbortError') {
                console.error(`[PROXY] Timeout después de ${TIMEOUT_MS}ms`);
                return {
                    statusCode: 504,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: `Request timeout after ${TIMEOUT_MS}ms`
                    })
                };
            }

            console.error('[PROXY] Fetch error:', fetchError);
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
        console.error('[PROXY] General error:', error);
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
