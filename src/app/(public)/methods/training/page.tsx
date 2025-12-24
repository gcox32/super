import PageLayout from '@/components/layout/PageLayout';

export default function TrainingMethodsPage() {
  return (
    <PageLayout
      breadcrumbHref="/methods"
      breadcrumbText="Methods"
      title="Training Metrics"
      subtitle="The physics of performance."
    >
      <div className="md:max-w-4xl md:mx-auto pb-12">
        <section className="px-4 md:px-6 py-6 space-y-12">
          
          {/* Work & Power Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Mechanical Work & Power</h2>
            <p className="text-muted-foreground leading-relaxed">
              Most training logs only track "Volume" (Sets × Reps × Weight). This is a useful proxy, but it is physically meaningless. Lifting 100kg for 1 meter is different than lifting 100kg for 0.5 meters, yet "Volume" treats them the same.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Aegis calculates actual <strong className="text-foreground">Mechanical Work (Joules)</strong> and <strong className="text-foreground">Average Power (Watts)</strong> by integrating your body geometry into the equation.
            </p>

            <div className="grid gap-6 md:grid-cols-1 pt-2">
              <div className="space-y-3 p-6 border border-border rounded-lg bg-card/50">
                <h4 className="text-lg font-medium text-foreground">The Physics Model</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                   <p>We apply the fundamental physics definition of Work:</p>
                   <div className="p-3 bg-muted rounded font-mono text-xs md:text-sm">
                     Work = Force × Distance
                   </div>
                   <ul className="list-disc list-inside space-y-2 pt-2">
                     <li>
                       <strong className="text-foreground">Force:</strong> We sum external load + bodyweight (scaled by exercise-specific factors). For example, a squat lifts ~90% of body mass, while a bench press lifts ~0%.
                     </li>
                     <li>
                       <strong className="text-foreground">Distance:</strong> We don't guess. We use your stored <strong className="text-foreground">Limb Lengths</strong> (Arm/Leg length) to calculate the precise range of motion for each rep.
                     </li>
                   </ul>
                </div>
              </div>
            </div>
            
            <p className="text-muted-foreground leading-relaxed text-sm pt-2">
              *For cardio machines (rowers, bikes), we convert caloric output directly to Joules (1 Cal ≈ 4184 J).
            </p>
          </div>

          {/* Projected 1RM Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Projected 1RM & Confidence</h2>
            <p className="text-muted-foreground leading-relaxed">
              Knowing your strength limit is vital for programming, but testing a true 1-Rep Max (1RM) is taxing and risky. Aegis estimates your 1RM from every set you perform.
            </p>
            
            <div className="space-y-6 pt-2">
              <div className="space-y-3">
                 <h3 className="text-xl font-semibold text-foreground">Blended Algorithm</h3>
                 <p className="text-muted-foreground leading-relaxed">
                   We don't rely on a single formula. We blend two industry standards to balance their respective biases:
                 </p>
                 <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                   <li className="p-4 border border-border rounded bg-card/50 space-y-2">
                     <span className="font-semibold text-foreground block">Epley Formula</span>
                     <span className="text-muted-foreground">Standard for general lifting. Tends to be slightly aggressive on high-rep sets.</span>
                   </li>
                   <li className="p-4 border border-border rounded bg-card/50 space-y-2">
                     <span className="font-semibold text-foreground block">Brzycki Formula</span>
                     <span className="text-muted-foreground">More conservative. Often more accurate for lower-rep, higher-intensity work.</span>
                   </li>
                 </ul>
              </div>

              <div className="space-y-3">
                 <h3 className="text-xl font-semibold text-foreground">The Confidence Decay</h3>
                 <p className="text-muted-foreground leading-relaxed">
                   A set of 10 reps is a worse predictor of strength than a set of 3 reps. Aegis mathematically models this uncertainty.
                 </p>
                 <p className="text-muted-foreground leading-relaxed">
                   We apply a <strong className="text-foreground">Logistic Confidence Curve</strong> to every estimate. 
                 </p>
                 <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                   <li>Low reps (1-5) have high confidence (~95%).</li>
                   <li>Medium reps (6-12) have moderate confidence.</li>
                   <li>High reps (15+) have low confidence (~20%), as metabolic fatigue confounds strength expression.</li>
                 </ul>
                 <p className="text-muted-foreground leading-relaxed pt-2">
                   This prevents high-rep burnout sets from artificially inflating your estimated strength levels.
                 </p>
              </div>
            </div>
          </div>

        </section>
      </div>
    </PageLayout>
  );
}
