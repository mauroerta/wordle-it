import { PageChrome } from "../../chrome/page-chrome"

export const REPO_URL = "https://github.com/mauroerta/wordle-it"
export const X_URL = "https://x.com/mauro_erta"

const UPSTREAM_URL = "https://pietroppeter.github.io/wordle-it/"
const UPSTREAM_REPO_URL = "https://github.com/pietroppeter/wordle-it"
const WORDLE_URL = "https://www.nytimes.com/games/wordle/index.html"

export function CreditsPage() {
  return (
    <PageChrome heading="Crediti" back={{ to: "/", label: "Gioco" }}>
      <section className="parle-groups-section">
        <h1>Par🇮🇹le</h1>
        <p className="parle-screen-text">
          Par🇮🇹le è la versione italiana di Wordle creata da{" "}
          <ExternalLink href={UPSTREAM_REPO_URL}>
            Pietro Peterlongo
          </ExternalLink>
          . Grazie, Pietro: senza il tuo{" "}
          <ExternalLink href={UPSTREAM_URL}>gioco originale</ExternalLink> tutto
          questo non esisterebbe.
        </p>
        <p className="parle-screen-text">
          Siamo così ossessionati da questo gioco che abbiamo voluto correggere
          i bug noti e portarlo a un nuovo livello con i gruppi: classifiche
          private tra amici, giorno dopo giorno.
        </p>
        <p className="parle-screen-text">
          Il codice di questa versione è su{" "}
          <ExternalLink href={REPO_URL}>GitHub</ExternalLink>.
        </p>
      </section>
      <section className="parle-groups-section">
        <h1>Wordle</h1>
        <p className="parle-screen-text">
          Il gioco originale è{" "}
          <ExternalLink href={WORDLE_URL}>Wordle</ExternalLink>, ideato da Josh
          Wardle e oggi pubblicato dal New York Times. Questa versione non è
          affiliata al New York Times.
        </p>
      </section>
    </PageChrome>
  )
}

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}
