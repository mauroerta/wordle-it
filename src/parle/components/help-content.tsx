import { useState } from "react"
import { flushSync } from "react-dom"

export function HelpContent() {
  return (
    <div className="parle-help">
      <p>
        Indovina delle <strong>PARoLE</strong> di 5 lettere in 6 tentativi.
      </p>
      <p>
        PAR🇮🇹LE è una versione italiana (non ufficiale) di{" "}
        <a href="https://www.nytimes.com/games/wordle/index.html">WORDLE</a>
      </p>
      <p>
        Dopo ogni tentativo, i colori delle tessere cambieranno per mostrarti
        quanto vicino sei andato ad indovinare la parola.
      </p>
      <div className="parle-help-examples">
        <div className="parle-help-example">
          <div className="parle-row" style={{ width: 220 }}>
            <ExampleTile letter="b" state="correct" />
            <ExampleTile letter="u" />
            <ExampleTile letter="f" />
            <ExampleTile letter="f" />
            <ExampleTile letter="a" />
          </div>
          <p>
            La lettera <strong>B</strong> è nella parola ed è nel posto giusto.
          </p>
        </div>
        <div className="parle-help-example">
          <div className="parle-row" style={{ width: 220 }}>
            <ExampleTile letter="p" />
            <ExampleTile letter="o" />
            <ExampleTile letter="r" state="present" />
            <ExampleTile letter="t" />
            <ExampleTile letter="o" />
          </div>
          <p>
            La lettera <strong>R</strong> è nella parola ma nel posto sbagliato.
          </p>
        </div>
        <div className="parle-help-example">
          <div className="parle-row" style={{ width: 220 }}>
            <ExampleTile letter="v" />
            <ExampleTile letter="a" />
            <ExampleTile letter="g" />
            <ExampleTile letter="h" state="absent" />
            <ExampleTile letter="i" />
          </div>
          <p>
            La lettera <strong>H</strong> non è nella parola.
          </p>
        </div>
      </div>
      <p>
        <strong>Un nuovo gioco di PAR🇮🇹LE ogni giorno!</strong>
      </p>
    </div>
  )
}

function ExampleTile({
  letter,
  state = "tbd",
}: {
  letter: string
  state?: "tbd" | "correct" | "present" | "absent"
}) {
  const evaluated = state !== "tbd"
  const [animation, setAnimation] = useState<
    "idle" | "pop" | "flip-in" | "flip-out"
  >(evaluated ? "flip-in" : "pop")
  const [shown, setShown] = useState<
    "empty" | "tbd" | "correct" | "present" | "absent"
  >(evaluated ? "empty" : "tbd")
  return (
    <div
      className="parle-tile"
      data-state={shown}
      data-animation={animation}
      onAnimationEnd={(event) => {
        if (event.target !== event.currentTarget) {
          return
        }
        if (event.animationName === "parle-pop") {
          setAnimation("idle")
          return
        }
        if (event.animationName === "parle-flip-in") {
          flushSync(() => {
            setShown(state)
            setAnimation("flip-out")
          })
          return
        }
        if (event.animationName === "parle-flip-out") {
          setAnimation("idle")
        }
      }}
    >
      {letter}
    </div>
  )
}
