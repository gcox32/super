import PageLayout from '@/components/layout/PageLayout';

export default function BodyCompMethodsPage() {
  return (
    <PageLayout
      breadcrumbHref="/methods"
      breadcrumbText="Methods"
      title="Body Composition"
      subtitle="Triangulating truth through multiple signals."
    >
      <div className="md:max-w-4xl md:mx-auto pb-12">
        <section className="px-4 md:px-6 py-6 space-y-12">
          
          {/* Philosophy Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">The Composite Approach</h2>
            <p className="text-muted-foreground leading-relaxed">
              No single indirect method of body fat estimation is perfect. Even "gold standard" methods like DEXA or Hydrostatic weighing have error margins. Simple tape measurements are accessible but prone to user error and biological variance.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Aegis rejects reliance on a single formula. Instead, we use a <strong>Composite Estimation</strong> strategy. We run your measurements through multiple proven algorithms independently, then synthesize the results to find the central tendency and calculate a confidence interval.
            </p>
          </div>

          {/* Methods Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground">The Algorithms</h3>
            <div className="grid gap-6 md:grid-cols-1">
              
              {/* Navy */}
              <div className="space-y-3 p-6 border border-border rounded-lg bg-card/50">
                <h4 className="text-lg font-medium text-foreground">1. U.S. Navy Method</h4>
                <p className="text-sm text-muted-foreground">
                  The primary signal. Developed by the Naval Health Research Center, this method uses circumference measurements to estimate body density.
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><span className="text-foreground font-medium">Inputs:</span> Height, Neck, Waist, Hip (Female only)</p>
                  <p><span className="text-foreground font-medium">Strengths:</span> High correlation with hydrostatic weighing; accounts for frame size via neck measurement.</p>
                </div>
              </div>

              {/* BMI / Deurenberg */}
              <div className="space-y-3 p-6 border border-border rounded-lg bg-card/50">
                <h4 className="text-lg font-medium text-foreground">2. Deurenberg BMI Method</h4>
                <p className="text-sm text-muted-foreground">
                  A population-based formula that adjusts BMI for age and gender. While BMI is a poor individual predictor, when contextualized with age, it provides a useful baseline "floor" or "ceiling" for other methods.
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><span className="text-foreground font-medium">Inputs:</span> BMI, Age, Gender</p>
                  <p><span className="text-foreground font-medium">Strengths:</span> Accounts for the natural increase in body fat with age that other linear tape methods might miss.</p>
                </div>
              </div>

              {/* YMCA */}
              <div className="space-y-3 p-6 border border-border rounded-lg bg-card/50">
                <h4 className="text-lg font-medium text-foreground">3. YMCA Formula</h4>
                <p className="text-sm text-muted-foreground">
                  A simpler weight-based formula used by the YMCA for decades. It provides a weight-heavy counter-balance to the circumference-heavy Navy method.
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><span className="text-foreground font-medium">Inputs:</span> Weight, Waist</p>
                  <p><span className="text-foreground font-medium">Strengths:</span> simple, widely used baseline.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Synthesis Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Synthesis & Uncertainty</h3>
            <p className="text-muted-foreground leading-relaxed">
              We don't just average these numbers. We calculate the <strong>Median</strong> to reject outliers (e.g., if one method fails significantly due to body type).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Crucially, we also calculate the <strong>Dispersion</strong> (Standard Deviation) between these methods. This gives us a "Confidence Band."
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2 pt-2">
              <li>If the methods agree closely, the confidence band is narrow (e.g., 15% ± 1%).</li>
              <li>If the methods disagree, the band widens (e.g., 15% ± 4%), signaling that the estimate is less certain.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed pt-2">
              This honesty about uncertainty is vital. It prevents you from chasing "ghosts" in the data—tiny fluctuations that are actually just statistical noise.
            </p>
          </div>

          {/* Sanity Checks */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground">Validation & Sanity Checks</h3>
            <p className="text-muted-foreground text-sm">
              Before computing, Aegis runs the data through a series of biological plausibility checks to catch measurement errors:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50" />
                Waist vs. Neck ratio validation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50" />
                Waist-to-Height Ratio (WHtR) bands
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50" />
                Extreme method disagreement detection
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50" />
                BMI range verification
              </li>
            </ul>
          </div>

        </section>
      </div>
    </PageLayout>
  );
}
