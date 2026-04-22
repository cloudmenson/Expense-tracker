interface FeatureCardProps {
  title: string;
  description: string;
}

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <article className="glass-card rounded-2xl p-6 transition-transform hover:-translate-y-0.5">
      <div className="glass-pill mb-5 h-11 w-11 rounded-xl" />
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
    </article>
  );
}
