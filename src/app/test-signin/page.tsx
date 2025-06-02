'use client';

export default function TestSignin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Test Signin</h1>
        <p className="text-center text-gray-600">
          Esta es una página de prueba para verificar que las exportaciones de React funcionan.
        </p>
        <div className="mt-6 text-center">
          <a href="/auth/signin" className="text-blue-600 hover:text-blue-800 underline">
            Ir a página de signin real
          </a>
        </div>
      </div>
    </div>
  );
}
