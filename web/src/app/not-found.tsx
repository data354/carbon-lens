import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { CircleQuestionMark } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid h-dvh place-content-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleQuestionMark />
          </EmptyMedia>
          <EmptyTitle>Page introuvable</EmptyTitle>
          <EmptyDescription>
            La page que vous recherchez n'existe pas ou a
            été déplacée. Veuillez vérifier l'URL ou revenir
            à la page d'accueil.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            size="sm"
            variant="outline"
            asChild
          >
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
