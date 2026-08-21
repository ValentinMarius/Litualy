# AGENTS.md — Litualy

Context pentru orice agent AI (Claude Code sau altul) care lucrează la codul acestei aplicații. Citește acest fișier integral înainte de a scrie sau modifica orice cod.

## Ce este Litualy

Aplicație mobilă de tracking și motivație pentru citit, cu UI și mecanici gamificate stil Duolingo (streak, feed social, achievement-uri), adresată cititorilor care deja citesc dar nu au disciplina să o facă zilnic. Ton: jucăuș, family-friendly (general-audience, nu declarată explicit „pentru copii"). Public țintă principal: 16-30 ani.

Proiectul e la început — dezvoltat solo, fără termen calendaristic fix (dedicare completă). Roadmap-ul e organizat pe faze cu criterii de finalizare (Definition of Done), nu pe date. Vezi `04-roadmap.docx` pentru fazele complete.

## Documente sursă (context complet, nu duplica deciziile aici — referă-te la ele)

- `01-features-mvp.docx` — toate feature-urile MVP, cu explicații
- `02-monetizare.docx` — model de abonament, reclame, afiliere
- `03-analiza-piata.docx` — concurență și poziționare
- `04-roadmap.docx` — fazele de dezvoltare și ordinea lor
- `05-cerinte-tehnice.docx` — stack-ul și motivarea deciziilor tehnice

## Stack tehnic (decis, nu renegocia fără discuție explicită cu userul)

- **Mobil:** React Native cu Expo, TypeScript (strict mode activat)
- **Navigare:** React Navigation — `native-stack` + `react-native-screens` (navigation bar nativ real, nu simulat în JS)
- **Backend:** Firebase — Auth, Firestore, Storage, Cloud Messaging (push), Analytics, Crashlytics
- **Abonamente:** RevenueCat (nu implementa direct StoreKit/Google Billing manual)
- **Reclame:** Google AdMob — doar tip rewarded, niciodată interstițiale sau bannere (vezi regulile de mai jos)
- **Date de cărți:** Google Books API (primar), Open Library ca fallback
- **State management:** preferă o soluție ușoară (ex. Zustand) — evită Redux, e complexitate inutilă pentru scara acestei aplicații

## Structură de proiect

```
litualy/
├── app/                        # ecrane, organizate pe rută (Expo Router)
├── components/
│   └── ui/                     # componente reutilizabile (ProgressBar, StreakBadge, Button)
├── features/                   # logică pe domeniu, un folder per arie de business
│   ├── reading/                # check-in, focus timer, sesiuni de citit
│   ├── streak/                 # calcul streak — OBLIGATORIU fus orar local, nu UTC
│   ├── social/                 # feed, prieteni, fallback conținut public
│   └── monetization/           # RevenueCat (abonamente), AdMob (rewarded ads)
├── services/                   # client-side: integrări cu backend-ul gestionat
│   ├── firebase.ts             # init Firebase (Auth, Firestore, Storage)
│   └── booksApi.ts             # Google Books API
├── functions/                  # BACKEND REAL — Firebase Cloud Functions (Node/TS)
│   └── src/
│       ├── scheduledNotifications.ts   # notificare zilnică, declanșată server-side
│       └── revenuecatWebhook.ts        # sursa de adevăr pentru premium status
├── store/                      # state management (zustand)
├── types/                      # tipuri TypeScript comune
├── locales/                    # traduceri (i18n din prima zi — RO + EN minim)
└── assets/
```

**Notă despre backend:** nu există server propriu de administrat — Firebase e backend gestionat (BaaS). `services/` e stratul client care vorbește cu el. `functions/` e singurul loc cu cod care rulează efectiv server-side (Cloud Functions) — folosit doar unde clientul nu poate fi sursă de adevăr: notificarea zilnică (trebuie declanșată chiar dacă userul n-a deschis aplicația de zile) și validarea statusului premium (nu poate fi doar client-side, altfel poate fi falsificat).

## Schema de date (referință rapidă — detalii complete în 05-cerinte-tehnice.docx)

`users`, `books`, `userBooks`, `readingSessions`, `notes`, `achievements`, `friendships`, `feedPosts`.

## Reguli de business — NU le încălca, chiar dacă par simplificări rezonabile

Aceste decizii au fost luate deliberat, după discuții specifice. Un agent de cod NU are voie să le „optimizeze" sau să le simplifice fără să întrebe explicit userul întâi.

- **Niciodată nu limita biblioteca/istoricul de cărți al userului**, la niciun tier. Singura limitare e câte cărți poate avea *active simultan* (2 gratuit / 3-4 premium / nelimitat premium+).
- **Check-in și focus timer cer pagina la care a ajuns userul**, nu câte pagini a citit — nu inversa asta, e o decizie deliberată de UX (evită scăderea mentală).
- **Streak-ul trebuie calculat în fusul orar local al userului**, nu UTC. O greșeală aici sparge încrederea userilor.
- **Feed-ul nu are comentarii** — doar apreciere și distribuire. Nu adăuga comentarii „ca să fie mai complet" fără discuție.
- **Reclame doar de tip rewarded (opționale, cu recompensă)**. Niciodată interstițiale, niciodată bannere pasive, niciodată reclame care întrerup o sesiune activă de citit/focus timer.
- **Fără „watch ad to unlock" pe funcții de bază** — echivalează cu un paywall deghizat, respins explicit.
- **Fără conturi de copil sau funcții declarate „pentru minori"** — aplicația rămâne general-audience/family-friendly. Nu adăuga parental controls sau conturi separate de copil fără discuție explicită (implicații legale COPPA/GDPR-K).
- **Linkurile de afiliere cer mențiune legală vizibilă** de dezvăluire a relației de afiliere.
- **Journey-ul pe capitole e bifat manual de user** — nu implementa scanare OCR/AI automată (e amânată explicit pentru mai târziu).
- **Notificarea zilnică din MVP e LOCALĂ (on-device, `expo-notifications`)**, nu server-side. Cloud Function-ul `sendDailyReadingReminders` din `functions/` e o îmbunătățire de Faza 8 (notificări adaptive), nu o cerință de MVP — nu-l activa/conecta fără discuție.
- **Conturile Apple Developer Program și Google Play Console se creează abia în Faza 6** (pregătire de lansare), nu mai devreme — sunt singurele costuri reale ale proiectului și nu e nevoie de ele pentru dezvoltare/testare pe device propriu (semnare „Personal Team" gratuită în Xcode).
- **Orice picker/selector (dată, oră, ștergere, adăugare) trebuie să fie component nativ iOS** ("Liquid Glass" pe iOS 26+), nu simulat în JS — ex. `@react-native-community/datetimepicker` pentru date/ore, `Alert`/`ActionSheetIOS` pentru confirmări de ștergere, nu componente custom desenate manual. Aceeași logică ca la tab bar: nativ real, nu simulare.

## Ce NU construim acum (amânat — nu implementa fără să fie cerut explicit)

Audiobook-uri · Cluburi de carte/grupuri · Valută virtuală (soft/hard currency) · Scanare OCR+AI a cuprinsului · Sistem XP/nivele · Tier lifetime · Cloud backup dedicat · Priority support · Sugestii personalizate (recomandări) · Sunete ambientale pentru focus timer.

Dacă un task pare să ceară una dintre acestea, oprește-te și întreabă înainte să implementezi.

## Cerințe non-funcționale

- **Offline:** nu e cerință critică — doar cache local minim pentru ultima carte vizualizată.
- **Securitate:** reguli Firestore stricte per user; niciun date de plată nu trece prin cod propriu — totul via RevenueCat.
- **Performanță:** listele lungi (bibliotecă, feed) trebuie paginate/virtualizate de la prima implementare, nu adăugate ulterior.
- **Localizare:** i18n configurat din prima săptămână de cod (RO + EN minim), chiar dacă traducerile complete vin mai târziu.

## Convenții de cod

- TypeScript strict — fără `any` fără justificare într-un comentariu
- Componente funcționale, cu hooks — fără class components
- Un fișier = o responsabilitate clară; preferă fișiere mici, ușor de citit, peste fișiere „god-object"
- Denumire: `camelCase` pentru variabile/funcții, `PascalCase` pentru componente și tipuri
- Comentarii doar unde logica nu e evidentă din cod (ex. calculul de streak, gating-ul premium) — nu comenta evident

## Când ești nesigur

Dacă un task pare să contrazică o decizie din secțiunea „Reguli de business" de mai sus, sau lipsește din documentele sursă, oprește-te și întreabă userul explicit — nu presupune și nu improviza o soluție „rezonabilă" care ar putea contrazice o decizie de business deja luată cu grijă.