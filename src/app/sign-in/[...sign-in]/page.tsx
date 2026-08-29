import { SignIn } from "@clerk/nextjs";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata = { title: "Sign in" };

export default function SignInCatchAllPage() {
  return (
    <AuthScreen title="Welcome back">
      <SignIn
        routing="path"
        path="/sign-in"
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full shadow-none",
          },
        }}
      />
    </AuthScreen>
  );
}
