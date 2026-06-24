import { Button } from "@heroui/react";
import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <SearchX className="w-16 h-16 text-default-400" />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-default-500">Page not found.</p>
      <Button as={Link} to="/dashboard" color="primary">
        Back to Home
      </Button>
    </main>
  );
}
