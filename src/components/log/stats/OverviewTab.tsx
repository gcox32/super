'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import type { UserStats, UserProfile, TapeMeasurement } from '@/types/user';
import { fetchJson } from '@/lib/train/helpers';
import { getRatiosForGender } from './ratiosConfig';

function getDaysAgo(date: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function formatStaleness(daysAgo: number): string {
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return '1 day ago';
  if (daysAgo < 7) return `${daysAgo} days ago`;
  if (daysAgo < 30) {
    const weeks = Math.floor(daysAgo / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  const months = Math.floor(daysAgo / 30);
  return `${months} ${months === 1 ? 'month' : 'months'} ago`;
}

function getStalenessColor(daysAgo: number): string {
  if (daysAgo <= 7) return 'text-green-500';
  if (daysAgo <= 30) return 'text-yellow-500';
  return 'text-red-500';
}


export default function OverviewTab() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, profileRes] = await Promise.all([
        fetchJson<{ stats: UserStats[] }>('/api/me/stats?latest=true'),
        fetchJson<{ profile: UserProfile }>('/api/me/profile'),
      ]);
      // Convert date strings to Date objects
      const statsWithDates = (statsRes.stats || []).map(stat => ({
        ...stat,
        date: new Date(stat.date),
        tapeMeasurements: stat.tapeMeasurements ? {
          ...stat.tapeMeasurements,
          date: stat.tapeMeasurements.date ? new Date(stat.tapeMeasurements.date) : undefined,
        } : undefined,
      }));

      setStats(statsWithDates);
      setProfile(profileRes.profile);

    } catch (err: any) {
      console.error('Failed to load stats overview', err);
      setError(err.message || 'Failed to load stats overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card p-6 border border-border rounded-lg">
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  // Get latest stats entry
  const latestStats = stats.length > 0 ? stats[0] : null;
  const latestDate = latestStats?.date ? new Date(latestStats.date) : null;
  const daysAgo = latestDate ? getDaysAgo(latestDate) : null;

  // Calculate gender-specific ratios
  const gender = profile?.gender;
  const tape = latestStats?.tapeMeasurements;
  const ratios = getRatiosForGender(gender, tape);

  return (
    <div className="space-y-6">
      {/* Anthropomorphic Ratios */}
      {ratios.length > 0 && (
        <div className="bg-card p-6 border border-border rounded-(--radius)">
          <div className="mb-6">
            <h3 className="mb-1 font-display font-semibold text-foreground text-xl">Anthropomorphic Ratios</h3>
            <p className="text-muted-foreground text-xs">
              Body proportion measurements based on ideal ratios
            </p>
          </div>
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {ratios.map((ratio, idx) => {
              const hasTarget = ratio.perspective !== undefined;
              const hasValue = ratio.value !== null;
              
              // Calculate percentage difference from target
              let percentFromTarget = 0;
              let progress = 0;
              let progressColor = 'text-muted-foreground';
              let progressBg = 'bg-white/5';
              
              if (hasValue && hasTarget && ratio.value !== null && ratio.perspective !== undefined) {
                // Calculate absolute percentage difference from target
                const diff = Math.abs(ratio.value - ratio.perspective);
                percentFromTarget = (diff / ratio.perspective) * 100;
                
                // Calculate progress for visual bar (inverted - lower difference = higher progress)
                const maxDiff = ratio.perspective * 0.2; // 20% variance is considered "far"
                progress = Math.max(0, Math.min(100, 100 - (diff / maxDiff) * 100));
                
                // Color coding based on percentage difference
                if (percentFromTarget <= 5) {
                  progressColor = 'text-success';
                  progressBg = 'bg-success/20';
                } else if (percentFromTarget <= 10) {
                  progressColor = 'text-brand-primary';
                  progressBg = 'bg-brand-primary/20';
                } else {
                  progressColor = 'text-brand-accent';
                  progressBg = 'bg-brand-accent/20';
                }
              }

              return (
                <div
                  key={idx}
                  className="group relative bg-background/30 hover:bg-background/50 p-5 border border-border/50 hover:border-border rounded-(--radius) transition-all duration-300"
                >
                  
                  <div className="space-y-3">
                    {/* Label */}
                    <div className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      {ratio.label}
                    </div>
                    
                    {/* Value */}
                    {hasValue && ratio.value !== null ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <p className="font-display font-bold text-foreground text-3xl tracking-tight">
                            {ratio.value.toFixed(2)}
                          </p>
                          {hasTarget && (
                            <span className={`text-xs font-medium ${progressColor}`}>
                              {percentFromTarget.toFixed(1)}% from target
                            </span>
                          )}
                        </div>
                        
                        {/* Target and Progress Bar */}
                        {hasTarget && ratio.perspective !== undefined && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground text-xs">
                                Target: <span className="font-medium text-foreground">{ratio.perspective.toFixed(3)}</span>
                              </span>
                              <span className={`text-xs font-medium ${progressColor}`}>
                                {ratio.value > ratio.perspective ? '↑' : ratio.value < ratio.perspective ? '↓' : '✓'}
                              </span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full ${progressBg} transition-all duration-500 ease-out`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            
                            {/* Difference indicator */}
                            <div className="text-muted-foreground text-xs">
                              {Math.abs(ratio.value - ratio.perspective).toFixed(3)} {ratio.value > ratio.perspective ? 'above' : 'below'} target
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-2">
                        <p className="font-bold text-muted-foreground text-2xl">—</p>
                        <p className="mt-1 text-muted-foreground text-xs">
                          Requires tape measurements
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Latest Measurements */}
      <div className="bg-card p-6 border border-border rounded-(--radius)">
        <h3 className="mb-4 font-semibold text-lg">Latest Measurements</h3>
        
        {latestDate && daysAgo !== null && (
          <div className="bg-background/50 mb-4 p-3 border border-border rounded-(--radius)">
            <div className="flex items-center gap-2">
              <AlertCircle className={`w-4 h-4 ${getStalenessColor(daysAgo)}`} />
              <p className="text-sm">
                Last updated: <span className={getStalenessColor(daysAgo)}>{formatStaleness(daysAgo)}</span>
              </p>
            </div>
          </div>
        )}

        <div className="flex">
          {/* Body Weight */}
          <div className="flex-1">
            <p className="mb-1 text-muted-foreground text-sm">Body Weight</p>
            {latestStats?.weight ? (
              <>
                <p className="mb-1 font-display font-bold text-foreground text-3xl tracking-tight">
                  {latestStats.weight.value} {latestStats.weight.unit}
                </p>
                {latestDate && (
                  <p className="mt-1 text-muted-foreground text-xs">
                    {formatStaleness(getDaysAgo(latestDate))}
                  </p>
                )}
              </>
            ) : (
              <p className="font-bold text-muted-foreground text-2xl">—</p>
            )}
          </div>

          {/* Body Fat */}
          <div className="flex-1">
            <p className="mb-1 text-muted-foreground text-sm">Body Fat</p>
            {latestStats?.bodyFatPercentage ? (
              <>
                <p className="mb-1 font-display font-bold text-foreground text-3xl tracking-tight">
                  {latestStats.bodyFatPercentage.value.toFixed(1)}%
                </p>
                {latestDate && (
                  <p className="mt-1 text-muted-foreground text-xs">
                    {formatStaleness(getDaysAgo(latestDate))}
                  </p>
                )}
              </>
            ) : (
              <p className="font-bold text-muted-foreground text-2xl">—</p>
            )}
          </div>

          {/* Muscle Mass */}
          {latestStats?.muscleMass && (
            <div className="flex-1">
              <p className="mb-1 text-muted-foreground text-sm">Muscle Mass</p>
              <p className="font-bold text-2xl">
                {latestStats.muscleMass.value} {latestStats.muscleMass.unit}
              </p>
              {latestDate && (
                <p className="mt-1 text-muted-foreground text-xs">
                  {formatStaleness(getDaysAgo(latestDate))}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Tape Measurements */}
        {tape && (
          <div className="mt-6">
            <h4 className="mb-4 font-semibold text-foreground text-base">Tape Measurements</h4>
            
            <div className="space-y-3">
              {/* Neck - Single row */}
              {tape.neck && (
                <div className="bg-background/50 hover:shadow-sm p-3 border border-border/50 hover:border-border rounded-lg transition-all">
                  <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Neck
                  </p>
                  <p className="font-semibold text-foreground text-base">
                    {tape.neck.value} <span className="font-normal text-muted-foreground text-sm">{tape.neck.unit}</span>
                  </p>
                </div>
              )}

              {/* Shoulders - Single row */}
              {tape.shoulders && (
                <div className="bg-background/50 hover:shadow-sm p-3 border border-border/50 hover:border-border rounded-lg transition-all">
                  <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Shoulders
                  </p>
                  <p className="font-semibold text-foreground text-base">
                    {tape.shoulders.value} <span className="font-normal text-muted-foreground text-sm">{tape.shoulders.unit}</span>
                  </p>
                </div>
              )}

              {/* Chest - Single row */}
              {tape.chest && (
                <div className="bg-background/50 hover:shadow-sm p-3 border border-border/50 hover:border-border rounded-lg transition-all">
                  <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Chest
                  </p>
                  <p className="font-semibold text-foreground text-base">
                    {tape.chest.value} <span className="font-normal text-muted-foreground text-sm">{tape.chest.unit}</span>
                  </p>
                </div>
              )}

              {/* Arms - Two items side by side */}
              {(tape.leftArm || tape.rightArm) && (
                <div className="gap-3 grid grid-cols-2">
                  {tape.leftArm && (
                    <div className="bg-background/50 hover:shadow-sm p-3 border border-border/50 hover:border-border rounded-lg transition-all">
                      <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                        L. Arm
                      </p>
                      <p className="font-semibold text-foreground text-base">
                        {tape.leftArm.value} <span className="font-normal text-muted-foreground text-sm">{tape.leftArm.unit}</span>
                      </p>
                    </div>
                  )}
                  {tape.rightArm && (
                    <div className="bg-background/50 hover:shadow-sm p-3 border border-border/50 hover:border-border rounded-lg transition-all">
                      <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                        R. Arm
                      </p>
                      <p className="font-semibold text-foreground text-base">
                        {tape.rightArm.value} <span className="font-normal text-muted-foreground text-sm">{tape.rightArm.unit}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Forearms - Two items side by side */}
              {(tape.leftForearm || tape.rightForearm) && (
                <div className="gap-3 grid grid-cols-2">
                  {tape.leftForearm && (
                    <div className="bg-background/50 hover:shadow-sm p-3 border border-border/50 hover:border-border rounded-lg transition-all">
                      <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                        L. Forearm
                      </p>
                      <p className="font-semibold text-foreground text-base">
                        {tape.leftForearm.value} <span className="font-normal text-muted-foreground text-sm">{tape.leftForearm.unit}</span>
                      </p>
                    </div>
                  )}
                  {tape.rightForearm && (
                    <div className="bg-background/50 hover:shadow-sm p-3 border border-border/50 hover:border-border rounded-lg transition-all">
                      <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                        R. Forearm
                      </p>
                      <p className="font-semibold text-foreground text-base">
                        {tape.rightForearm.value} <span className="font-normal text-muted-foreground text-sm">{tape.rightForearm.unit}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Waist - Single row */}
              {tape.waist && (
                <div className="bg-background/50 hover:shadow-sm p-3 border border-border/50 hover:border-border rounded-lg transition-all">
                  <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Waist
                  </p>
                  <p className="font-semibold text-foreground text-base">
                    {tape.waist.value} <span className="font-normal text-muted-foreground text-sm">{tape.waist.unit}</span>
                  </p>
                </div>
              )}

              {/* Hips - Single row */}
              {tape.hips && (
                <div className="bg-background/50 hover:shadow-sm p-3 border border-border/50 hover:border-border rounded-lg transition-all">
                  <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Hips
                  </p>
                  <p className="font-semibold text-foreground text-base">
                    {tape.hips.value} <span className="font-normal text-muted-foreground text-sm">{tape.hips.unit}</span>
                  </p>
                </div>
              )}

              {/* Legs - Two items side by side */}
              {(tape.leftLeg || tape.rightLeg) && (
                <div className="gap-3 grid grid-cols-2">
                  {tape.leftLeg && (
                    <div className="bg-background/50 hover:shadow-sm p-3 border border-border/50 hover:border-border rounded-lg transition-all">
                      <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                        L. Leg
                      </p>
                      <p className="font-semibold text-foreground text-base">
                        {tape.leftLeg.value} <span className="font-normal text-muted-foreground text-sm">{tape.leftLeg.unit}</span>
                      </p>
                    </div>
                  )}
                  {tape.rightLeg && (
                    <div className="bg-background/50 hover:shadow-sm p-3 border border-border/50 hover:border-border rounded-lg transition-all">
                      <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                        R. Leg
                      </p>
                      <p className="font-semibold text-foreground text-base">
                        {tape.rightLeg.value} <span className="font-normal text-muted-foreground text-sm">{tape.rightLeg.unit}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Calves - Two items side by side */}
              {(tape.leftCalf || tape.rightCalf) && (
                <div className="gap-3 grid grid-cols-2">
                  {tape.leftCalf && (
                    <div className="bg-background/50 hover:shadow-sm p-3 border border-border/50 hover:border-border rounded-lg transition-all">
                      <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                        L. Calf
                      </p>
                      <p className="font-semibold text-foreground text-base">
                        {tape.leftCalf.value} <span className="font-normal text-muted-foreground text-sm">{tape.leftCalf.unit}</span>
                      </p>
                    </div>
                  )}
                  {tape.rightCalf && (
                    <div className="bg-background/50 hover:shadow-sm p-3 border border-border/50 hover:border-border rounded-lg transition-all">
                      <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                        R. Calf
                      </p>
                      <p className="font-semibold text-foreground text-base">
                        {tape.rightCalf.value} <span className="font-normal text-muted-foreground text-sm">{tape.rightCalf.unit}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {tape.date && (
              <div className="mt-4 pt-4 border-border/50 border-t">
                <p className="text-muted-foreground text-xs">
                  Measured {formatStaleness(getDaysAgo(new Date(tape.date)))}
                </p>
              </div>
            )}
          </div>
        )}

        {!latestStats && (
          <div className="py-8 text-muted-foreground text-sm text-center">
            No measurements logged yet. Use the Log tab to create your first entry.
          </div>
        )}
      </div>
    </div>
  );
}

