import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && request.nextUrl.pathname !== '/api/status') {
    return NextResponse.json({message:'Los registros requieren el cliente autenticado de Firestore.'}, {status:410});
  }
  return NextResponse.next();
}
export const config = { matcher: ['/api/:path*'] };
