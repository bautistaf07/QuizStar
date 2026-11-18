import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear cuenta | QuizStar",
  description: "Crea tu cuenta en QuizStar.",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
