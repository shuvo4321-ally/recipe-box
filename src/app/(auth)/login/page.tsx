// src/app/(auth)/login/page.tsx
"use client"; 
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { createClient } from "@/lib/supabase/client"; 

export default function LoginPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    // FIX: The className is now on a single line
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">
      
      {/* Logo Image */}
      <div className="text-center mb-6">
        <Image
          src="/nox.svg" // Path to your saved logo image
          alt="Recipe Box Logo"
          width={400} 
          height={200}
          priority 
        />
        <h2 className="text-3xl font-bold mt-3">
          Log in to Your Recipe Box
        </h2>
      </div>

      {/* Login Button */}
      <button
        onClick={handleGoogleLogin} 
        className="flex items-center justify-center gap-x-3 mt-10 py-3 px-8 bg-green-500 hover:bg-green-600 text-white text-lg font-bold rounded-full transition duration-300 shadow-md hover:shadow-lg"
      >
        <FcGoogle size={24} />
        <span>Login with Google</span>
      </button>

    </main>
  );
}