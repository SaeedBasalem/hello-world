import { useState, useEffect } from 'react'
import { CheckCircle2, Zap, Target, Trophy } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { todayStr } from '../lib/dates'
import {
  getTodaysChallenges,
  TIER_META,
  type Challenge,
  type ChallengeTier,
  getXpLevel,
  getXpProgress,
  xpToNextLevel,
} from '../lib/xp'
import type { ChallengeCompletion } from '../lib/types'
import { Spinner } from '../components/ui'

export default function Challenges() {
  const { user } = useAuth()
  const { profile, awardXp } = useProfile()
  const [completions, setCompletions] = useState<ChallengeCompletion[]>([])
  const [completing, setCompleting] = useState<string | null>(null)
  const [justCompleted, setJustCompleted] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  const today = todayStr()
  const challenges = getTodaysChallenges(today)

  useEffect(() => {
    if (!user) return
    supabase
      .from('sc_challenge_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('day', today)
      .then(({ data }) => {
        setCompletions((data as ChallengeCompletion[]) ?? [])
        setLoadingData(false)
      })
  }, [user, today])

  const isCompleted = (key: string) => completions.some(c => c.challenge_key === key)

  const complete = async (challenge: Challenge) => {
    if (!user || isCompleted(challenge.key) || completing) return
    setCompleting(challenge.key)

    const { data, error } = await supabase
      .from('sc_challenge_completions')
      .insert({ user_id: user.id, challenge_key: challenge.key, day: today, xp_earned: challenge.xp })
      .select('*')
      .single()

    if (data && !error) {
      setCompletions(prev => [...prev, data as ChallengeCompletion])
      await awardXp(challenge.xp)
      setJustCompleted(challenge.key)
      setTimeout(() => setJustCompleted(null), 2200)
    }
    setCompleting(null)
  }

  const xpToday = completions.reduce((sum, c) => sum + c.xp_earned, 0)
  const doneCount = completions.length
  const allDone = doneCount === 3

  const xp = profile?.xp ?? 0
  const level = getXpLevel(xp)
  const progress = getXpProgress(xp)
  const toNext = xpToNextLevel(xp)

  if (loadingData) return <Spinner label="Loading challenges…" />

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-ink dark:text-slate-100 flex items-center gap-2">
            <Target className="h-6 w-6 text-brand-500" />
            Daily Challenges
          </h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">
            Complete missions to earn XP and grow your streak.
          </p>
        </div>
        <span className="chip bg-slate-100 dark:bg-slate-800 text-ink-soft dark:text-slate-400 text-xs">
          {doneCount}/3 done
        </span>
      </div>

      {/* XP status card */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${level.colorClass}`}>
              Lv {level.level} · {level.title}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-brand-600 dark:text-brand-400">
            <Zap className="h-4 w-4" />
            {xp} XP total
          </div>
        </div>
        <div className="space-y-1">
          <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-2.5 rounded-full bg-gradient-to-r ${level.barColor} transition-all duration-700`}
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="text-xs text-ink-faint dark:text-slate-500">
            {level.maxXp === 99999
              ? 'Max level reached 🎉'
              : `${toNext} XP to Level ${level.level + 1}`}
          </p>
        </div>
        {xpToday > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-brand-50 dark:bg-brand-900/20 px-3 py-2">
            <Trophy className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0" />
            <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
              +{xpToday} XP earned today
              {allDone && ' · All challenges complete! 🎉'}
            </span>
          </div>
        )}
      </div>

      {/* Challenge cards */}
      {(['bronze', 'silver', 'gold'] as ChallengeTier[]).map(tier => {
        const challenge = challenges[tier]
        const meta = TIER_META[tier]
        const done = isCompleted(challenge.key)
        const busy = completing === challenge.key
        const justDone = justCompleted === challenge.key

        return (
          <div
            key={tier}
            className={`card border transition-all duration-300 ${meta.borderClass} ${
              done ? 'opacity-80' : ''
            } ${justDone ? 'animate-pop' : 'animate-slide-up'}`}
          >
            <div className="p-5">
              {/* Tier + XP badges */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`chip ${meta.bgClass} ${meta.textClass} font-bold text-xs`}>
                  {meta.emoji} {meta.label}
                </span>
                <span className="chip bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold text-xs">
                  +{challenge.xp} XP
                </span>
                {done && (
                  <span className="chip bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs ml-auto">
                    ✓ Done
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className={`font-bold text-base leading-snug ${
                done
                  ? 'line-through text-ink-faint dark:text-slate-500'
                  : 'text-ink dark:text-slate-100'
              }`}>
                {challenge.emoji} {challenge.text}
              </h3>

              {/* Detail */}
              <p className="mt-1.5 text-sm text-ink-soft dark:text-slate-400 leading-relaxed">
                {challenge.detail}
              </p>

              {/* Action */}
              {!done ? (
                <button
                  className="btn-primary mt-4 w-full"
                  onClick={() => complete(challenge)}
                  disabled={!!busy}
                >
                  {busy ? (
                    <>Marking complete…</>
                  ) : (
                    <><CheckCircle2 className="h-4 w-4" /> Mark Complete</>
                  )}
                </button>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Completed · +{challenge.xp} XP earned
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Footer */}
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-4 text-center">
        <p className="text-sm text-ink-soft dark:text-slate-400">
          🌙 New challenges refresh every day at midnight
        </p>
        <p className="mt-1 text-xs text-ink-faint dark:text-slate-500">
          Challenges are chosen to match your current goals. Completing all 3 earns {30 + 50 + 75} XP.
        </p>
      </div>
    </div>
  )
}
