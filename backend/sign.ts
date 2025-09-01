import { signWithMPC } from '@arcium-hq/client'

export async function handler(req: Request): Promise<Response> {
  const { message } = await req.json()
  const signature = await signWithMPC(message)
  return new Response(JSON.stringify({ signature }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
