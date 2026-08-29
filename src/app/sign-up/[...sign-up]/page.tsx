import { SignUp } from "@clerk/nextjs";
import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata = { title: "Create account" };

export default function SignUpCatchAllPage() {
  return (
    <AuthScreen title="Create your board">
      <SignUp
        routing="path"
        path="/sign-up"
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
