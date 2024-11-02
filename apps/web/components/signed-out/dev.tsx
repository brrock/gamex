import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignedDevSignUp() {
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Join Our Developer Program
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Sign up to access exclusive tools, resources, and support to help you
          build amazing products.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full">Join Now</Button>
      </CardContent>
    </Card>
  );
}
