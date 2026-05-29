import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Avatar } from './Avatar'
import { CHARACTERS, type Character } from './characters'
import { QUESTIONS, QUESTION_MAP, type Question } from './questions'
import { chooseBotAction, pickRandom } from './ai'
import { parseFreeTextQuestion } from './freeText'
import './App.css'

type Phase =
  | 'setup'
  | 'player-turn'
  | 'player-guessing'
  | 'bot-thinking'
  | 'bot-asking'
  | 'bot-guessing'
  | 'game-over'

interface LogEntry {
  speaker: 'bot' | 'player' | 'system'
  text: string
  result?: 'yes' | 'no'
}

const QUESTION_CATEGORIES: { label: string; ids: string[] }[] = [
  {
    label: 'Identity',
    ids: ['male', 'female', 'young', 'elderly', 'smile'],
  },
  {
    label: 'Skin',
    ids: ['light', 'medium', 'dark'],
  },
  {
    label: 'Hair color',
    ids: ['black', 'brown', 'blonde', 'red', 'grayWhite'],
  },
  {
    label: 'Hair length',
    ids: ['short', 'long', 'bald'],
  },
  {
    label: 'Accessories & features',
    ids: ['glasses', 'hat', 'earrings', 'beard', 'mustache', 'facialHair', 'freckles', 'bigNose'],
  },
]

interface GameState {
  botSecret: Character
  playerSecret: Character | null
  phase: Phase
  log: LogEntry[]
  eliminatedByPlayer: Set<number>
  botCandidates: Set<number>
  botAsked: Set<string>
  pendingBotQuestion: Question | null
  pendingBotGuess: Character | null
  winner: 'player' | 'bot' | null
  turnCount: number
}

function makeInitialState(): GameState {
  const botSecret = pickRandom(CHARACTERS)
  return {
    botSecret,
    playerSecret: null,
    phase: 'setup',
    log: [
      {
        speaker: 'system',
        text: 'Pick a character to be your secret. The bot has already chosen its own.',
      },
    ],
    eliminatedByPlayer: new Set<number>(),
    botCandidates: new Set<number>(CHARACTERS.map((c) => c.id)),
    botAsked: new Set<string>(),
    pendingBotQuestion: null,
    pendingBotGuess: null,
    winner: null,
    turnCount: 0,
  }
}

function App() {
  const [state, setState] = useState<GameState>(() => makeInitialState())
  const logRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll chat to bottom on new entries
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [state.log])

  // Drive the bot's turn through its sub-phases with small delays for feel.
  useEffect(() => {
    if (state.phase === 'bot-thinking') {
      const t = setTimeout(() => {
        setState((s) => {
          if (s.phase !== 'bot-thinking') return s
          const candidateChars = CHARACTERS.filter((c) => s.botCandidates.has(c.id))
          const action = chooseBotAction(candidateChars, s.botAsked)
          if (action.kind === 'question') {
            return {
              ...s,
              phase: 'bot-asking',
              pendingBotQuestion: action.question,
              log: [
                ...s.log,
                {
                  speaker: 'bot',
                  text: action.question.text,
                },
              ],
            }
          } else {
            return {
              ...s,
              phase: 'bot-guessing',
              pendingBotGuess: action.character,
              log: [
                ...s.log,
                {
                  speaker: 'bot',
                  text: `I think your character is ${action.character.name}!`,
                },
              ],
            }
          }
        })
      }, 900)
      return () => clearTimeout(t)
    }

    if (state.phase === 'bot-guessing') {
      const t = setTimeout(() => {
        setState((s) => {
          if (s.phase !== 'bot-guessing' || !s.pendingBotGuess || !s.playerSecret) {
            return s
          }
          const correct = s.pendingBotGuess.id === s.playerSecret.id
          return {
            ...s,
            phase: 'game-over',
            winner: correct ? 'bot' : 'player',
            log: [
              ...s.log,
              {
                speaker: 'system',
                text: correct
                  ? `Right! Your character was ${s.playerSecret.name}. The bot wins!`
                  : `Wrong! Your character was ${s.playerSecret.name}, not ${s.pendingBotGuess.name}. You win!`,
              },
            ],
          }
        })
      }, 1400)
      return () => clearTimeout(t)
    }
  }, [state.phase])

  function startGame(playerSecret: Character) {
    setState((s) => ({
      ...s,
      playerSecret,
      phase: 'player-turn',
      log: [
        ...s.log,
        {
          speaker: 'system',
          text: `You picked ${playerSecret.name}. You go first — ask a question or make a guess!`,
        },
      ],
    }))
  }

  function pickRandomSecret() {
    startGame(pickRandom(CHARACTERS))
  }

  function playerAsksQuestion(qId: string) {
    const q = QUESTION_MAP[qId]
    if (!q) return
    askWithQuestion(q, q.text)
  }

  function playerAsksFreeText(rawText: string) {
    const text = rawText.trim()
    if (!text) return
    const match = parseFreeTextQuestion(text)
    if (!match) {
      // No recognized feature — log a system tip without consuming a turn.
      setState((s) => {
        if (s.phase !== 'player-turn') return s
        return {
          ...s,
          log: [
            ...s.log,
            { speaker: 'player', text },
            {
              speaker: 'system',
              text:
                "Hmm, I didn't spot a feature in that. Try keywords like " +
                "'glasses', 'beard', 'mustache', 'red hair', 'bald', 'hat', " +
                "'freckles', 'big nose', 'earrings', 'man'/'woman', etc.",
            },
          ],
        }
      })
      return
    }
    askWithQuestion(match.question, text)
  }

  function askWithQuestion(q: Question, displayedQuestion: string) {
    setState((s) => {
      if (s.phase !== 'player-turn') return s
      const answer = q.predicate(s.botSecret)
      // Auto-eliminate characters that don't match the answer.
      const newEliminated = new Set(s.eliminatedByPlayer)
      for (const c of CHARACTERS) {
        if (q.predicate(c) !== answer) newEliminated.add(c.id)
      }
      const remaining = CHARACTERS.filter((c) => !newEliminated.has(c.id))
      const baseLog: LogEntry[] = [
        ...s.log,
        { speaker: 'player', text: displayedQuestion },
        {
          speaker: 'bot',
          text: answer ? 'Yes.' : 'No.',
          result: answer ? 'yes' : 'no',
        },
      ]
      // If the answer narrowed the board to a single face, that face must
      // be the bot's secret (bot answers truthfully), so the player wins
      // automatically — no need to make them click Make-my-guess.
      if (remaining.length === 1) {
        const winner = remaining[0]
        return {
          ...s,
          eliminatedByPlayer: newEliminated,
          phase: 'game-over',
          winner: 'player',
          turnCount: s.turnCount + 1,
          log: [
            ...baseLog,
            {
              speaker: 'system',
              text: `Only ${winner.name} is left standing — that must be the bot's character! You win!`,
            },
          ],
        }
      }
      return {
        ...s,
        eliminatedByPlayer: newEliminated,
        phase: 'bot-thinking',
        turnCount: s.turnCount + 1,
        log: baseLog,
      }
    })
  }

  function playerStartsGuess() {
    setState((s) => {
      if (s.phase !== 'player-turn') return s
      return {
        ...s,
        phase: 'player-guessing',
        log: [
          ...s.log,
          {
            speaker: 'system',
            text: 'Click a character on the board to make your final guess.',
          },
        ],
      }
    })
  }

  function cancelGuess() {
    setState((s) => {
      if (s.phase !== 'player-guessing') return s
      return {
        ...s,
        phase: 'player-turn',
        log: [...s.log, { speaker: 'system', text: 'Guess cancelled.' }],
      }
    })
  }

  function playerGuesses(c: Character) {
    setState((s) => {
      if (s.phase !== 'player-guessing') return s
      const correct = c.id === s.botSecret.id
      return {
        ...s,
        phase: 'game-over',
        winner: correct ? 'player' : 'bot',
        log: [
          ...s.log,
          { speaker: 'player', text: `I think your character is ${c.name}!` },
          {
            speaker: 'system',
            text: correct
              ? `Correct! The bot's character was ${s.botSecret.name}. You win!`
              : `Nope — the bot's character was ${s.botSecret.name}, not ${c.name}. Bot wins!`,
          },
        ],
      }
    })
  }

  function toggleEliminate(c: Character) {
    setState((s) => {
      if (s.phase !== 'player-turn' && s.phase !== 'bot-asking') return s
      const next = new Set(s.eliminatedByPlayer)
      if (next.has(c.id)) next.delete(c.id)
      else next.add(c.id)
      const remaining = CHARACTERS.filter((c2) => !next.has(c2.id))
      // If a manual flip leaves only one face on the board during the
      // player's turn, that face must be the bot's secret — declare a
      // win automatically.
      if (remaining.length === 1 && s.phase === 'player-turn') {
        const winner = remaining[0]
        return {
          ...s,
          eliminatedByPlayer: next,
          phase: 'game-over',
          winner: 'player',
          log: [
            ...s.log,
            {
              speaker: 'system',
              text: `Only ${winner.name} is left standing — that must be the bot's character! You win!`,
            },
          ],
        }
      }
      return { ...s, eliminatedByPlayer: next }
    })
  }

  function answerBot(yes: boolean) {
    setState((s) => {
      if (s.phase !== 'bot-asking' || !s.pendingBotQuestion || !s.playerSecret) return s
      const q = s.pendingBotQuestion
      // Trust the player's click — same as the physical board game, the bot
      // has no way to verify. If you lie, you lie.
      const answer = yes
      // Update bot candidates based on the player's answer.
      const newCandidates = new Set<number>()
      for (const id of s.botCandidates) {
        const c = CHARACTERS.find((x) => x.id === id)!
        if (q.predicate(c) === answer) newCandidates.add(c.id)
      }
      const newAsked = new Set(s.botAsked)
      newAsked.add(q.id)
      const baseLog: LogEntry[] = [
        ...s.log,
        {
          speaker: 'player',
          text: answer ? 'Yes.' : 'No.',
          result: answer ? 'yes' : 'no',
        },
      ]
      // If the bot's candidate set is now a single character, skip the
      // 'thinking' pause and have it lock in that guess immediately —
      // matches the player-side auto-win for symmetry.
      if (newCandidates.size === 1) {
        const only = CHARACTERS.find((c) => c.id === [...newCandidates][0])!
        return {
          ...s,
          botCandidates: newCandidates,
          botAsked: newAsked,
          pendingBotQuestion: null,
          pendingBotGuess: only,
          phase: 'bot-guessing',
          turnCount: s.turnCount + 1,
          log: [
            ...baseLog,
            {
              speaker: 'bot',
              text: `That narrows it down — your character must be ${only.name}!`,
            },
          ],
        }
      }
      return {
        ...s,
        botCandidates: newCandidates,
        botAsked: newAsked,
        pendingBotQuestion: null,
        phase: 'player-turn',
        turnCount: s.turnCount + 1,
        log: baseLog,
      }
    })
  }

  function restart() {
    setState(makeInitialState())
  }

  const remainingPlayer = useMemo(
    () => CHARACTERS.filter((c) => !state.eliminatedByPlayer.has(c.id)),
    [state.eliminatedByPlayer],
  )

  const askedSoFar = useMemo(() => {
    // Player-asked questions are those whose answer is now consistent across
    // remaining candidates — but simpler: track which question texts have
    // appeared in the log as player utterances.
    const set = new Set<string>()
    for (const entry of state.log) {
      if (entry.speaker === 'player') {
        const q = QUESTIONS.find((qq) => qq.text === entry.text)
        if (q) set.add(q.id)
      }
    }
    return set
  }, [state.log])

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Guess Who? <span className="subtitle">vs AI</span></h1>
          <p className="tagline">
            Ask yes/no questions to figure out the bot&rsquo;s secret character — before it figures out yours.
          </p>
        </div>
        <button className="restart-btn" onClick={restart} type="button">
          New game
        </button>
      </header>

      {state.phase === 'setup' ? (
        <SetupScreen onPick={startGame} onRandom={pickRandomSecret} />
      ) : (
        <main className="game-grid">
          <section className="board-section">
            <div className="board-header">
              <div className="board-title">
                The Lineup
                <span className="counter-pill">
                  {remainingPlayer.length}/{CHARACTERS.length} left
                </span>
              </div>
              <div className="board-instructions">
                {state.phase === 'player-guessing'
                  ? 'Click your final guess.'
                  : 'Click any face to flip them down (eliminate).'}
              </div>
            </div>
            <div className="board">
              {CHARACTERS.map((c) => {
                const eliminated = state.eliminatedByPlayer.has(c.id)
                const guessing = state.phase === 'player-guessing'
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`character-card ${eliminated ? 'eliminated' : ''} ${guessing ? 'guessable' : ''}`}
                    onClick={() => {
                      if (guessing) playerGuesses(c)
                      else toggleEliminate(c)
                    }}
                    disabled={state.phase === 'game-over'}
                    aria-pressed={eliminated}
                  >
                    <Avatar character={c} size={88} />
                    <div className="character-name">{c.name}</div>
                  </button>
                )
              })}
            </div>
          </section>

          <aside className="side-panel">
            <div className="secret-card">
              <div className="secret-label">Your secret character</div>
              {state.playerSecret && (
                <>
                  <Avatar character={state.playerSecret} size={120} />
                  <div className="secret-name">{state.playerSecret.name}</div>
                </>
              )}
            </div>

            <BotProgress candidates={state.botCandidates} />

            <div className="chat-card">
              <div className="chat-header">
                <span>Chat</span>
                <TurnBadge phase={state.phase} winner={state.winner} />
              </div>
              <div className="chat-log" ref={logRef}>
                {state.log.map((entry, i) => (
                  <div key={i} className={`chat-entry chat-${entry.speaker}`}>
                    <div className="chat-bubble">{entry.text}</div>
                  </div>
                ))}
              </div>

              <div className="chat-actions">
                {state.phase === 'player-turn' && (
                  <PlayerTurnControls
                    onAsk={playerAsksQuestion}
                    onAskFreeText={playerAsksFreeText}
                    onGuess={playerStartsGuess}
                    asked={askedSoFar}
                  />
                )}
                {state.phase === 'player-guessing' && (
                  <button className="btn ghost" type="button" onClick={cancelGuess}>
                    Cancel guess
                  </button>
                )}
                {state.phase === 'bot-thinking' && (
                  <div className="thinking">Bot is thinking…</div>
                )}
                {state.phase === 'bot-asking' && (
                  <div className="bot-answer-controls">
                    <div className="bot-answer-prompt">
                      Answer truthfully about <strong>{state.playerSecret?.name}</strong>:
                    </div>
                    <div className="yn-buttons">
                      <button className="btn yes" type="button" onClick={() => answerBot(true)}>
                        Yes
                      </button>
                      <button className="btn no" type="button" onClick={() => answerBot(false)}>
                        No
                      </button>
                    </div>
                  </div>
                )}
                {state.phase === 'bot-guessing' && (
                  <div className="thinking">Bot is making a guess…</div>
                )}
                {state.phase === 'game-over' && (
                  <div className="game-over">
                    <div className={`result-banner ${state.winner === 'player' ? 'win' : 'lose'}`}>
                      {state.winner === 'player' ? 'You win!' : 'Bot wins!'}
                    </div>
                    <button className="btn primary" type="button" onClick={restart}>
                      Play again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </main>
      )}
    </div>
  )
}

function BotProgress({ candidates }: { candidates: Set<number> }) {
  const remaining = candidates.size
  return (
    <div className="bot-progress-card">
      <div className="bot-progress-header">
        <span className="bot-progress-label">Bot&rsquo;s progress</span>
        <span className="counter-pill bot-pill">
          {remaining}/{CHARACTERS.length} still in play
        </span>
      </div>
      <div className="bot-progress-board">
        {CHARACTERS.map((c) => {
          const inPlay = candidates.has(c.id)
          return (
            <div
              key={c.id}
              className={`bot-progress-cell ${inPlay ? '' : 'eliminated'}`}
              title={`${c.name}${inPlay ? '' : ' \u2014 bot has ruled out'}`}
            >
              <Avatar character={c} size={36} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TurnBadge({ phase, winner }: { phase: Phase; winner: 'player' | 'bot' | null }) {
  if (phase === 'game-over') {
    return <span className={`turn-badge ${winner}`}>{winner === 'player' ? 'You won' : 'Bot won'}</span>
  }
  if (phase === 'player-turn' || phase === 'player-guessing') {
    return <span className="turn-badge player">Your turn</span>
  }
  return <span className="turn-badge bot">Bot&rsquo;s turn</span>
}

function PlayerTurnControls({
  onAsk,
  onAskFreeText,
  onGuess,
  asked,
}: {
  onAsk: (id: string) => void
  onAskFreeText: (text: string) => void
  onGuess: () => void
  asked: Set<string>
}) {
  const [draft, setDraft] = useState('')

  function submit(e?: FormEvent) {
    if (e) e.preventDefault()
    const t = draft.trim()
    if (!t) return
    onAskFreeText(t)
    setDraft('')
  }

  return (
    <div className="player-controls">
      <form className="ask-form" onSubmit={submit}>
        <input
          type="text"
          className="ask-input"
          placeholder="Ask a yes/no question…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Ask a yes/no question in your own words"
        />
        <button className="btn primary" type="submit" disabled={!draft.trim()}>
          Ask
        </button>
      </form>
      <div className="control-row">
        <button className="btn ghost" type="button" onClick={onGuess}>
          Make my guess
        </button>
      </div>
      <div className="question-list-label">Or tap a preset:</div>
      <div className="question-list">
        {QUESTION_CATEGORIES.map((cat) => (
          <div key={cat.label} className="question-category">
            <div className="category-label">{cat.label}</div>
            <div className="question-buttons">
              {cat.ids.map((qid) => {
                const q = QUESTION_MAP[qid]
                if (!q) return null
                const used = asked.has(qid)
                return (
                  <button
                    key={qid}
                    type="button"
                    className={`q-pill ${used ? 'used' : ''}`}
                    onClick={() => !used && onAsk(qid)}
                    disabled={used}
                    title={used ? 'Already asked' : q.text}
                  >
                    {shortLabel(q)}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function shortLabel(q: Question): string {
  // Strip the leading "Does your character " / "Is your character " for compactness.
  return q.text
    .replace(/^Does your character (have |wear )?/i, '')
    .replace(/^Is your character (a |an )?/i, '')
    .replace(/\?$/, '')
    .replace(/^./, (c) => c.toUpperCase())
}

export default App

function SetupScreen({
  onPick,
  onRandom,
}: {
  onPick: (c: Character) => void
  onRandom: () => void
}) {
  return (
    <main className="setup">
      <div className="setup-header">
        <h2>Pick your secret character</h2>
        <p>
          The bot has already chosen one of these in secret. Pick yours, and the
          bot will try to guess it while you try to guess the bot&rsquo;s.
        </p>
        <button className="btn primary" type="button" onClick={onRandom}>
          Pick one randomly for me
        </button>
      </div>
      <div className="board setup-board">
        {CHARACTERS.map((c) => (
          <button
            key={c.id}
            type="button"
            className="character-card guessable"
            onClick={() => onPick(c)}
          >
            <Avatar character={c} size={88} />
            <div className="character-name">{c.name}</div>
          </button>
        ))}
      </div>
    </main>
  )
}
