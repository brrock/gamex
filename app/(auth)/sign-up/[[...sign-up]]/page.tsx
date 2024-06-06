import { ModeToggle } from "@/components/theme-toggle";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
 <><header className="top-0 relative">
      <ModeToggle /></header><SignUp /></>
);
}