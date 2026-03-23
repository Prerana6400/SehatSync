import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AboutHeaderProps = {
  title: string;
  description: string;
  highlights: string[];
};

export function AboutHeader({ title, description, highlights }: AboutHeaderProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">{description}</p>

        <div className="space-y-2">
          <p className="text-sm font-medium">Key benefits</p>
          <ul className="grid gap-2 md:grid-cols-2">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">{h}</span>
              </li>
            ))}
          </ul>
        </div>

      </CardContent>
    </Card>
  );
}

