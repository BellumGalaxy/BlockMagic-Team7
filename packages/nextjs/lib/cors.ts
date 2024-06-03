// ../../lib/cors.js
export default async function cors(request: any) {
  // Add CORS headers to allow requests from any origin
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400", // 24 hours
  };

  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  // Continue processing the request if not an OPTIONS request
  return null;
}
