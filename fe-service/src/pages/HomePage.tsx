import { Button, Card, CardBody } from "@heroui/react";
import { Rocket } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-md w-full">
        <CardBody className="flex flex-col items-center gap-4 p-8">
          <Rocket className="w-12 h-12 text-primary" />
          <h1 className="text-2xl font-bold">Mergrowth</h1>
          <p className="text-default-500 text-center">
            Your microservice boilerplate is ready. Start building!
          </p>
          <Button color="primary" size="lg">
            Get Started
          </Button>
        </CardBody>
      </Card>
    </main>
  );
}
