/**
 * ==============================================
 * HEADERS DE SEGURANÇA HTTP
 * ==============================================
 * Configuração de headers de segurança para proteção
 * contra ataques web comuns.
 */

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; form-action 'self';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

/**
 * Aplica headers de segurança à resposta HTTP
 */
function applySecurityHeaders(response) {
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    response.setHeader(header, value);
  });
}

/**
 * Verifica se a requisição é segura
 */
function isSecureRequest(request) {
  const userAgent = request.headers['user-agent'] || '';
  const origin = request.headers.origin || '';
  const referer = request.headers.referer || '';
  
  // Bloquear user agents suspeitos
  const suspiciousAgents = [
    /bot/i,
    /crawler/i,
    /scanner/i,
    /curl/i,
    /wget/i
  ];
  
  if (suspiciousAgents.some(agent => agent.test(userAgent))) {
    return false;
  }
  
  // Verificar origem (em produção)
  if (origin && !origin.includes('localhost') && !origin.includes('skullbjj.com')) {
    return false;
  }
  
  return true;
}

/**
 * Middleware de segurança para Express.js (exemplo)
 */
function securityMiddleware(req, res, next) {
  // Aplicar headers de segurança
  applySecurityHeaders(res);
  
  // Verificar segurança da requisição
  if (!isSecureRequest(req)) {
    return res.status(403).json({ error: 'Acesso negado por segurança' });
  }
  
  // Rate limiting (básico)
  const clientIP = req.ip || req.connection.remoteAddress;
  if (!rateLimitMap.has(clientIP)) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: Date.now() + 60000 });
  } else {
    const client = rateLimitMap.get(clientIP);
    if (Date.now() > client.resetTime) {
      client.count = 1;
      client.resetTime = Date.now() + 60000;
    } else {
      client.count++;
      if (client.count > 100) { // 100 requisições por minuto
        return res.status(429).json({ error: 'Too many requests' });
      }
    }
  }
  
  next();
}

// Para uso em ambiente Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SECURITY_HEADERS,
    applySecurityHeaders,
    isSecureRequest,
    securityMiddleware
  };
}

// Rate limiting storage
const rateLimitMap = new Map();
