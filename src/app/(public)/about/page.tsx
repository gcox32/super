import PageLayout from '@/components/layout/PageLayout';

export default function AboutPage() {
  return (
    <PageLayout
      breadcrumbHref="/"
      breadcrumbText="Home"
      title="About"
      subtitle="The philosophy behind the system."
    >
      <section className="px-4 md:px-6 py-6 space-y-12 max-w-3xl mx-auto">
        {/* Intro */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Aegis exists to tell the truth about effort, outcome, and cause.
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We reject the idea that progress can be understood through isolated signals.
            Training, sleep, nutrition, recovery, and body composition do not operate in parallel; they act upon one another. Insight emerges only when they are examined together.
          </p>
        </div>

        {/* System */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">Aegis treats the human being as a system.</h3>
          <p className="text-muted-foreground leading-relaxed">
            We believe that data without context misleads, and motivation without feedback decays. Logging is not the goal. Formation is. The purpose of measurement is not validation, but correction.
          </p>
        </div>

        {/* Action over Intent */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">Aegis privileges what is done over what is intended.</h3>
          <p className="text-muted-foreground leading-relaxed">
            Work performed matters more than effort claimed. Consistency matters more than intensity. Longitudinal truth matters more than single moments. The system does not flatter, and it does not scold. It reflects.
          </p>
        </div>

        {/* Individual Standard */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">Aegis compares you only to yourself.</h3>
          <p className="text-muted-foreground leading-relaxed">
            There are no borrowed standards, no anonymous averages, and no external judgments. Progress is measured against your own history, your own structure, and your stated aims. The only question that matters is whether your capacity is increasing.
          </p>
        </div>

        {/* Perception vs Reality */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">Aegis assumes that perception is fallible.</h3>
          <p className="text-muted-foreground leading-relaxed">
            How you feel is real, but it is not always accurate. Strength, leanness, fatigue, and readiness must be tested against evidence. Where belief and measurement diverge, Aegis resolves the difference with clarity.
          </p>
        </div>

        {/* Feedback Loop */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">Aegis exists to shorten the feedback loop.</h3>
          <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc pl-4">
            <li>When progress accelerates, it shows why.</li>
            <li>When progress stalls, it shows where.</li>
            <li>When actions contradict outcomes, it makes the contradiction visible.</li>
          </ul>
          <p className="text-foreground font-medium pt-2">
            This is not punishment. It is instruction.
          </p>
        </div>

        {/* Information vs Command */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">Aegis does not command. It informs.</h3>
          <p className="text-muted-foreground leading-relaxed">
            It narrows the decision space by revealing causal relationships, then returns agency to the user. Responsibility is not removed; it is sharpened.
          </p>
        </div>

        {/* Discipline */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">Discipline is not assumed. It is trained.</h3>
          <p className="text-muted-foreground leading-relaxed">
            Consistency is observable. Compliance is measurable. The will is not a feeling, but a faculty—strengthened through repetition and restraint. Desire follows structure, not the other way around.
          </p>
        </div>

        {/* Conclusion */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">Aegis is a mirror.</h3>
          <div className="space-y-2 text-muted-foreground leading-relaxed">
            <p>It does not tell you who to be.</p>
            <p>It shows you what your system is becoming.</p>
          </div>
          <p className="text-xl font-semibold text-foreground pt-2">
            Adjust accordingly.
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
