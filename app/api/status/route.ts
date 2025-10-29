// app/api/status/route.ts - Ultra simple status check
export async function GET() {
  return Response.json({ 
    status: 'online',
    timestamp: new Date().toISOString(),
    message: 'API is working'
  })
}

