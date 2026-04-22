interface FeatureCardProps {
  title: string;
  description: string;
}

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <article className="surface-card rounded-xl p-6 shadow-sm transition-transform hover:-translate-y-1">
      <div className="mb-5 h-11 w-11 rounded-xl bg-brand-soft" />
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
    </article>
  );
}
