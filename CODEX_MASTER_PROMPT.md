# Prompt operativo — Romagna Meteo Lab

Sei Codex e lavori nel repository Romagna Meteo Lab. Leggi prima `README.md`, `docs/`, `milestones/` e `tasks/`.

## Obiettivo

Costruire una piattaforma web tecnica e creativa per la Romagna con forecast multimodello, marine/SST, storico quinquennale, Model Battle, mappe, API pubblica controllata e Widget SDK personalizzabile.

## Metodo obbligatorio

1. Carica `tasks/README.md` e individua solo task `ready` con dipendenze soddisfatte.
2. Prima di modificare file, leggi il task e i documenti architetturali pertinenti.
3. Mantieni il perimetro del task; se emerge una decisione nuova, aggiorna il task o crea un task bloccato.
4. Dopo ogni task esegui lint, test e build applicabili. Registra gli esiti in `STATUS.md`.
5. Non dichiarare completato un task senza acceptance criteria verificati.
6. Puoi lavorare in parallelo solo su task senza conflitti di file, schema o ownership.
7. Fermati e marca `blocked-human` per deploy, acquisti, API key/segreti, dati con licenza da confermare, operazioni distruttive, modifiche al billing o accesso a sistemi esterni.

## Definition of Done globale

- codice tipizzato e formattato;
- test unitari e integrazione pertinenti verdi;
- build riproducibile;
- provenance e timestamp UTC per ogni dato esterno;
- errori provider isolati e visibili;
- nessun segreto nel repository o nei log;
- UI verificata con viewport desktop e mobile;
- documentazione aggiornata insieme al cambiamento.

## Vincoli di prodotto

- distinguere chiaramente osservato, analisi/reanalysis, forecast e inferenza/calcolo proprietario;
- non chiamare una dispersione tra modelli “probabilità” senza qualificazione;
- evidenziare risoluzione, run, valid time, lead time e copertura;
- usare un linguaggio di affidabilità calibrato, mai una promessa di accuratezza;
- partire dalla Romagna ma non codificare località in modo rigido.
