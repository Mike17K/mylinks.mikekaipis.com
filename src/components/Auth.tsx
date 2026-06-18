import { SignInButton, SignUpButton, UserButton } from "@clerk/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

export default function Auth() {
  return (
    <>
      <AuthLoading>
        <div className="text-gray-400 text-sm">Loading auth...</div>
      </AuthLoading>

      <Unauthenticated>
        <div className="flex items-center gap-2">
          <SignInButton>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all text-sm">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </Unauthenticated>

      <Authenticated>
        <UserButton />
      </Authenticated>
    </>
  );
}