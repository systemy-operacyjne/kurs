(() => {
  "use strict";

  const course = window.COURSE_DATA;
  if (!course) return;

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const escapeHTML = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const compact = (value = "") => String(value).replace(/\s+/g, " ").trim();
  const storageKey = "inf02-laboratorium-progress-v1";
  const progressCookie = "inf02_progress_v1";
  const consentCookie = "inf02_progress_consent";
  const consentFallbackKey = "inf02_progress_consent_fallback";
  const themeKey = "inf02-laboratorium-theme-v1";
  const profileKey = "systemy-operacyjne-profile-v1";

  const audienceMeta = {
    inf02: { short: "I", label: "Technik informatyk · INF.02", className: "inf02" },
    inf11: { short: "C", label: "Technik cyberbezpieczeństwa · INF.11", className: "inf11" },
    both: { short: "I + C", label: "Wspólne dla obu kierunków", className: "both" },
  };

  function courseBlock(text, style = null, audience = "both") {
    return { type: "paragraph", text, style, outline: null, list: null, images: [], audience };
  }

  function cyberLesson(id, title, intro, outcomes, concepts, steps, checks, practice, exampleCode = "") {
    return {
      id,
      title,
      audience: "inf11",
      blocks: [
        courseBlock(intro, null, "inf11"),
        courseBlock("Po tej lekcji potrafisz", "Heading3", "inf11"),
        ...outcomes.map(text => courseBlock(text, null, "inf11")),
        courseBlock("Co trzeba wiedzieć", "Heading3", "inf11"),
        ...concepts.map(text => courseBlock(text, null, "inf11")),
        courseBlock("Konfiguracja krok po kroku", "Heading3", "inf11"),
        ...steps.map(text => courseBlock(text, null, "inf11")),
        ...(exampleCode ? [courseBlock("Przykład do wykonania w laboratorium", "Heading3", "inf11"), courseBlock(exampleCode, "Kod", "inf11")] : []),
        courseBlock("Sprawdzenie poprawności", "Heading3", "inf11"),
        ...checks.map(text => courseBlock(text, null, "inf11")),
        courseBlock("Ćwiczenie INF.11", "Heading3", "inf11"),
        courseBlock(practice, "Ćwiczenie", "inf11"),
      ],
    };
  }

  function appendCyberSecurityContent(courseData) {
    if (courseData.modules.some(module => module.id === "cyber-inf11")) return;

    courseData.modules.forEach(module => module.units.forEach(unit => { unit.audience = unit.audience || "both"; }));
    [
      "1-1-jak-rozwiązywać-zadania-praktyczne-inf-02",
      "6-2-serwer-wydruku-i-kolejka-drukowania",
      "6-8-serwer-ftp-w-iis",
      "6-10-wds-pxe-i-współczesne-ograniczenia-wdrażania-windows",
      "9-5-próbne-zadania-egzaminacyjne-inf-02-i-strategia-powtórki",
      "końcowa-checklista-przed-egzaminem",
    ].forEach(id => {
      const unit = courseData.modules.flatMap(module => module.units).find(item => item.id === id);
      if (unit) unit.audience = "inf02";
    });

    const sourceOrientation = courseData.modules.flatMap(module => module.units).find(unit => unit.id === "środowisko-referencyjne");
    if (sourceOrientation) sourceOrientation.audience = "inf02";
    const startModule = courseData.modules.find(module => module.id === "start");
    if (startModule) startModule.units.push(cyberLesson(
      "c-0-start-inf11",
      "C.0. Start ścieżki INF.11",
      "Ta ścieżka rozszerza kurs o kwalifikację INF.11: Zarządzanie bezpieczeństwem systemów i sieci komputerowych. Najpierw ćwiczysz administrację systemem, potem oceniasz i wzmacniasz jego bezpieczeństwo — zawsze na własnych maszynach laboratoryjnych.",
      ["rozpoznać oznaczenia I, C i I + C", "wybrać właściwą ścieżkę w menu kursu", "przygotować laboratorium do bezpiecznych ćwiczeń"],
      ["I — materiał dla technika informatyka, przede wszystkim INF.02.", "C — rozszerzenie dla technika cyberbezpieczeństwa, kwalifikacja INF.11.", "I + C — fundament wspólny dla obu kierunków, potrzebny przed dalszymi ćwiczeniami."],
      ["W lewym menu kursu wybierz przycisk C — Cyberbezpieczeństwo INF.11. Kurs ukryje lekcje przeznaczone wyłącznie dla technika informatyka, ale pozostawi wspólne podstawy Windows, Linuxa, sieci i wirtualizacji.", "Zwracaj uwagę na plakietki przy każdym temacie: I oznacza informatyk, C oznacza cyberbezpieczeństwo, a I + C oznacza materiał obowiązujący obie klasy.", "Przed pracą włącz wyłącznie maszyny wirtualne wskazane przez nauczyciela. Sprawdź, czy są w sieci wewnętrznej LAB-INF11 i czy masz dla nich migawki bazowe.", "Jeżeli polecenie wymaga testu usługi, wykonaj go tylko z jednej maszyny LAB do drugiej. Nie skanuj, nie zmieniaj i nie testuj urządzeń szkolnych ani cudzych kont."],
      ["Wybrany profil C pokazuje moduł INF.11 w menu.", "Uczeń potrafi wyjaśnić znaczenie trzech plakietek.", "Maszyny testowe są odizolowane w sieci LAB."],
      "Wybierz profil C, odszukaj moduł INF.11 i utwórz notatkę zawierającą: nazwy maszyn, ich adresy laboratoryjne, nazwę sieci oraz datę wykonania migawki bazowej.",
    ));

    const addExtension = (unitId, title, paragraphs) => {
      const unit = courseData.modules.flatMap(module => module.units).find(item => item.id === unitId);
      if (!unit) return;
      unit.blocks.push(
        courseBlock(`C · INF.11 — ${title}`, "Heading3", "inf11"),
        ...paragraphs.map(text => courseBlock(text, null, "inf11")),
      );
    };

    addExtension("1-4-sieci-wirtualne-nat-mostek-host-only-i-sieć-wewnętrzna", "segmentacja laboratorium", [
      "Dla ćwiczeń bezpieczeństwa zostaw wyłącznie sieć wewnętrzną LAB-INF11 między maszynami. Nie wybieraj trybu Mostkowany, gdy testujesz zaporę, DHCP lub błędną konfigurację — dzięki temu laboratorium nie dotknie szkolnej sieci.",
      "Nadaj kartom czytelne nazwy i zapisz je w notatce: NAT służy tylko do aktualizacji, a LAB-INF11 do komunikacji testowej. Po skończonych aktualizacjach wyłącz NAT na maszynach, które go nie potrzebują.",
    ]);
    addExtension("2-2-sterowniki-aktualizacje-i-informacje-o-systemie", "aktualny i znany system", [
      "W Menedżerze urządzeń nie instaluj sterownika tylko dlatego, że ma nowszy numer. Najpierw porównaj identyfikator sprzętu, producenta i podpis cyfrowy; nieznany pakiet może obniżyć bezpieczeństwo stacji.",
      "Po aktualizacji zanotuj datę, nazwę poprawki i wynik restartu. W INF.11 ważne jest nie tylko kliknięcie „Aktualizuj”, ale też umiejętność udowodnienia, co zostało zmienione.",
    ]);
    addExtension("2-3-lokalne-konta-i-grupy-interfejs-graficzny-cmd-i-powershell", "najmniejsze potrzebne uprawnienia", [
      "Utwórz oddzielne konto standardowe do codziennej pracy i nie dodawaj go do grupy Administratorzy. Konto administracyjne używaj tylko, gdy system wyświetli pytanie UAC albo gdy świadomie otwierasz narzędzie jako administrator.",
      "Usuń z grupy Administratorzy nieużywane konta testowe. Przed usunięciem zrób zrzut listy członków — raport „przed i po” jest dowodem wykonania pracy.",
    ]);
    addExtension("2-4-lokalne-zasady-zabezpieczeń-i-edytor-zasad-grupy", "lokalna polityka haseł i audyt", [
      "Wpisz w Start „Zasady zabezpieczeń lokalnych” i otwórz wynik. Przejdź do Zasady konta → Zasady haseł; w laboratorium ustaw minimalną długość hasła zgodnie z poleceniem nauczyciela, a następnie zatwierdź zmianę.",
      "W tym samym oknie otwórz Zasady lokalne → Zasady inspekcji. Włączaj tylko te kategorie, które masz później odczytać w Podglądzie zdarzeń; nadmiar logów utrudnia analizę.",
    ]);
    addExtension("3-6-zapora-windows-i-microsoft-defender", "zasada domyślnej odmowy", [
      "Twórz regułę zapory dopiero wtedy, gdy umiesz podać jej program lub port, kierunek i powód. W regule wpisz opis, np. „LAB-INF11: test HTTPS”, aby później wiedzieć, dlaczego istnieje.",
      "Po teście wyłącz lub usuń tymczasową regułę. Reguła dodana „na chwilę” i pozostawiona bez opisu jest częstą przyczyną niepotrzebnego ryzyka.",
    ]);
    addExtension("3-7-pulpit-zdalny-kopie-zapasowe-usługi-i-dzienniki", "odtwarzalna kopia i ślad zdarzeń", [
      "W kopii bezpieczeństwa zapisuj poza testowaną maszyną przynajmniej jeden plik kontrolny. Następnie celowo usuń jego kopię z katalogu roboczego i odtwórz ją — kopia jest wartościowa dopiero po udanym odtworzeniu.",
      "W Podglądzie zdarzeń zapisz źródło, identyfikator zdarzenia i czas. Nie interpretuj pojedynczego komunikatu bez sprawdzenia, co działo się bezpośrednio przed nim i po nim.",
    ]);
    addExtension("4-4-kopie-zapasowe-monitorowanie-i-dzienniki-serwera", "monitorowanie serwera", [
      "Ustal prostą listę kontrolną serwera: wolne miejsce na dysku, stan usługi, ostatnia kopia, nieudane logowania i błędy systemowe. Otwieraj Menedżer serwera → Narzędzia → Podgląd zdarzeń i sprawdzaj ją zawsze w tej samej kolejności.",
      "Nie kasuj dzienników po znalezieniu błędu. Najpierw wyeksportuj potrzebny fragment lub zanotuj identyfikatory zdarzeń; to pozwoli odtworzyć przyczynę problemu.",
    ]);
    addExtension("5-9-domenowa-polityka-haseł-lokalne-zabezpieczenia-i-windows-laps", "ochrona kont uprzywilejowanych", [
      "Dla każdej zasady haseł zapisz, do jakiej grupy lub jednostki organizacyjnej ją stosujesz i jak zweryfikujesz efekt na stacji. Nie zmieniaj polityki całej domeny podczas ćwiczeń bez migawki kontrolera domeny.",
      "Windows LAPS traktuj jak narzędzie do bezpiecznego przechowywania lokalnego hasła administratora: uprawnienie do odczytu przydzielaj tylko osobom, które naprawdę go potrzebują.",
    ]);
    addExtension("6-11-zapora-audyt-i-diagnostyka-ról-windows-server", "minimalna powierzchnia usług", [
      "Po instalacji roli serwera sprawdź, jakie usługi uruchomiła. W Menedżerze serwera lub services.msc zostaw włączone tylko usługi potrzebne do zadania; nigdy nie wyłączaj usługi „na próbę” bez zapisania jej nazwy i aktualnego stanu.",
      "Testuj usługę z maszyny klienckiej w LAB-INF11. Jeżeli nie działa, sprawdzaj kolejno: adres IP, nazwę DNS, stan usługi, port i regułę zapory — nie wyłączaj zapory jako pierwszej reakcji.",
    ]);
    addExtension("7-7-pakiety-repozytoria-i-aktualizacje-przez-zypper", "zaufane źródła pakietów", [
      "Przed dodaniem repozytorium sprawdź jego adres i właściciela. Nie kopiuj losowego polecenia z internetu do konta root; w laboratorium korzystaj z repozytoriów wskazanych przez nauczyciela i zapisuj, co zostało dodane.",
      "Po aktualizacji uruchom ponownie system, jeśli zaktualizowano jądro. Potem wpisz uname -r i zypper patches, aby potwierdzić wersję oraz brak oczekujących poprawek.",
    ]);
    addExtension("7-10-użytkownicy-grupy-hasła-i-sudo", "bezpieczne sudo", [
      "Dodaj użytkownika do grupy uprawnionej do sudo tylko, gdy wymaga tego scenariusz. Przed zmianą wpisz id nazwa_użytkownika, a po zmianie wyloguj się i zaloguj ponownie, aby zobaczyć nowy skład grup.",
      "Nie pracuj stale jako root. Użyj zwykłego konta i poprzedzaj pojedyncze polecenia administracyjne przez sudo; dzięki temu polecenia są widoczne w historii i łatwiej ograniczyć pomyłkę.",
    ]);
    addExtension("7-11-uprawnienia-właściciele-umask-i-acl", "ochrona danych w Linuxie", [
      "Przed zmianą praw wpisz ls -ld nazwa_katalogu oraz ls -l nazwa_pliku. Zapisz właściciela i aktualne prawa, aby po ćwiczeniu móc porównać stan przed i po.",
      "Przyznawaj prawo tylko temu użytkownikowi lub grupie, które go potrzebują. Po ustawieniu ACL sprawdź getfacl nazwa_pliku i zaloguj się kontem testowym, aby zweryfikować rzeczywisty dostęp.",
    ]);
    addExtension("8-3-firewalld-strefy-oraz-zdalne-zarządzanie-ssh", "bezpieczny dostęp zdalny", [
      "Najpierw pozostaw otwarte bieżące połączenie SSH. W drugim oknie terminala zmieniaj reguły firewalld, a po każdej zmianie sprawdzaj nowe połączenie — w razie pomyłki nie odetniesz sobie dostępu.",
      "W SSH używaj konta zwykłego i logowania kluczem w laboratorium, gdy nauczyciel je przygotuje. Nie udostępniaj prywatnego klucza ani nie wysyłaj go przez komunikator.",
    ]);
    addExtension("9-3-bezpieczeństwo-systemów-klienckich-i-serwerowych", "bazowa kontrola bezpieczeństwa", [
      "Zrób krótką kontrolę bazową: aktualizacje, konta administratorów, aktywne usługi, reguły zapory, kopia zapasowa i ostatnie błędy w logach. Każdy punkt oznacz jako „zgodny”, „do poprawy” albo „nie dotyczy”.",
      "Wynik zapisuj jako raport dla maszyny, nie jako ocenę człowieka. Celem jest znalezienie konfiguracji do poprawy, a nie szukanie winnego.",
    ]);

    const cyberModule = {
      id: "cyber-inf11",
      number: "C",
      title: "INF.11 — bezpieczeństwo systemów i sieci",
      displayTitle: "INF.11 — cyberbezpieczeństwo systemów",
      navTitle: "INF.11 - cyberbezpieczeństwo",
      audience: "inf11",
      leadBlocks: [],
      units: [
        cyberLesson(
          "c-1-bezpieczne-laboratorium-i-etyka-testow",
          "C.1. Bezpieczne laboratorium i etyka testów",
          "Praca w cyberbezpieczeństwie zaczyna się od zgody, zakresu i odizolowanego laboratorium. Ta lekcja nie uczy atakowania — uczy, jak nie zaszkodzić prawdziwym użytkownikom ani szkolnej sieci.",
          ["odróżnić laboratorium od infrastruktury produkcyjnej", "opisać zakres ćwiczenia i bezpieczny punkt powrotu", "zatrzymać ćwiczenie, gdy pojawia się ryzyko wyjścia poza LAB"],
          ["Zakres — lista maszyn, adresów i działań, na które masz wyraźną zgodę.", "Migawka — punkt powrotu maszyny wirtualnej; nie zastępuje niezależnej kopii plików.", "Najmniejsze uprawnienia — dostęp tylko w takim zakresie, jaki jest potrzebny do zadania."],
          ["W VirtualBox zaznacz maszynę laboratoryjną i kliknij Ustawienia → Sieć. Dla ćwiczeń wybierz Podłączona do: Sieć wewnętrzna i wpisz nazwę LAB-INF11. Zrób to samo na maszynie klienckiej.", "Sprawdź, czy opcja Mostkowana nie jest zaznaczona. Mostkowana karta łączy maszynę bezpośrednio z prawdziwą siecią i nie służy do eksperymentów bezpieczeństwa.", "Wyłącz maszynę. W VirtualBox otwórz Migawki, kliknij ikonę plusa i nazwij migawkę BAZA-CZYSTA-INF11. W opisie wpisz datę oraz co już działa.", "W notatce zapisz nazwy maszyn, adresy IP, nazwę sieci LAB-INF11, cel ćwiczenia oraz co wolno zmienić. Jeśli czegoś nie ma na liście, najpierw zapytaj nauczyciela.", "Przed rozpoczęciem sprawdź ping tylko między maszynami laboratoryjnymi. Nie skanuj adresów spoza własnego LAB i nie testuj cudzych urządzeń."],
          ["Obie maszyny mają kartę Sieć wewnętrzna o nazwie LAB-INF11.", "Istnieje migawka BAZA-CZYSTA-INF11.", "Notatka zawiera zakres i plan cofnięcia zmian."],
          "Przygotuj dwie maszyny w sieci LAB-INF11, utwórz migawki bazowe i zapisz półstronicowy zakres ćwiczenia. Pokaż nauczycielowi ustawienia sieci przed dalszą pracą.",
        ),
        cyberLesson(
          "c-2-windows-bezpieczna-konfiguracja-poczatkowa",
          "C.2. Windows — bezpieczna konfiguracja początkowa",
          "Bezpieczna stacja nie powstaje przez zainstalowanie jednego programu. To zestaw małych, sprawdzalnych ustawień: aktualnego systemu, właściwych kont, ochrony i działającej zapory.",
          ["utworzyć listę bazowych ustawień stacji Windows", "sprawdzić ochronę systemu bez wyłączania zabezpieczeń", "udokumentować stan przed i po zmianie"],
          ["Stan bazowy — zapis konfiguracji, z którym porównuje się kolejne kontrole.", "UAC — mechanizm pytający o zgodę przy wymagających uprawnień administratora czynnościach.", "Ochrona w czasie rzeczywistym — sprawdzanie plików podczas ich używania przez system."],
          ["Kliknij Start → Ustawienia → Windows Update. Kliknij Sprawdź aktualizacje, poczekaj na wynik i zainstaluj dostępne poprawki. Jeśli system prosi o restart, zapisz pracę i uruchom ponownie komputer.", "Po restarcie wróć do Windows Update i ponownie kliknij Sprawdź aktualizacje. Zapisz datę oraz informację, czy pozostały poprawki wymagające restartu.", "Kliknij Start i wpisz Zabezpieczenia Windows. Otwórz wynik, wybierz Ochrona przed wirusami i zagrożeniami, a następnie sprawdź, czy ochrona w czasie rzeczywistym jest włączona. Nie wyłączaj jej, aby „przyspieszyć” ćwiczenie.", "W Zabezpieczeniach Windows otwórz Zapora i ochrona sieci. Otwórz kolejno aktywny profil i sprawdź, czy zapora jest włączona. Zapisz nazwę aktywnego profilu.", "Kliknij Start → Ustawienia → Konta → Inni użytkownicy. Sprawdź, czy do codziennej pracy istnieje konto standardowe; nie zmieniaj roli konta bez uzgodnienia z nauczycielem."],
          ["Windows Update nie oczekuje na restart.", "Ochrona w czasie rzeczywistym i zapora dla aktywnego profilu są włączone.", "Notatka zawiera datę kontroli i nazwę aktywnego profilu sieci."],
          "Wykonaj kontrolę bazową Windows w maszynie LAB. Zapisz trzy zrzuty lub notatki: Windows Update, stan ochrony i stan zapory. Nie zmieniaj ustawień poza własną maszyną wirtualną.",
        ),
        cyberLesson(
          "c-3-windows-konta-uprzywilejowane-i-audyt",
          "C.3. Windows — konta uprzywilejowane i audyt",
          "Konto administratora ma większą moc, dlatego jego użycie trzeba ograniczać i umieć później wyjaśnić. W tej lekcji konfigurujesz prosty, odwracalny model kont w VM.",
          ["rozpoznać, kto ma prawa administratora", "oddzielić konto codzienne od konta administracyjnego", "odszukać podstawowy ślad zdarzenia w Podglądzie zdarzeń"],
          ["Administrator lokalny — konto mogące zmieniać ustawienia całego komputera.", "Grupa Administratorzy — lista kont z prawami administracyjnymi.", "Dziennik zdarzeń — zapis czynności i komunikatów systemu, pomocny przy wyjaśnianiu problemu."],
          ["Kliknij Start, wpisz Zarządzanie komputerem i uruchom wynik jako administrator. Rozwiń Użytkownicy i grupy lokalne → Grupy, a następnie otwórz Administratorzy.", "Zapisz listę członków grupy Administratorzy. Nie usuwaj wbudowanego konta ani własnego jedynego konta administracyjnego — w VM możesz wtedy stracić możliwość zarządzania systemem.", "Wróć do Użytkownicy i grupy lokalne → Użytkownicy. Utwórz konto testowe o nazwie uczen_standard i pozostaw je poza grupą Administratorzy. Nadaj hasło zgodne z zasadą obowiązującą w laboratorium.", "Wyloguj się z konta administratora i zaloguj na uczen_standard. Otwórz Ustawienia; przy czynności wymagającej wyższych praw zobaczysz prośbę UAC zamiast pełnego dostępu.", "Kliknij Start i wpisz Podgląd zdarzeń. Otwórz Dzienniki systemu Windows → System, posortuj zdarzenia po dacie i zapisz jedno zdarzenie: jego źródło, identyfikator i czas."],
          ["Lista członków Administratorzy została zapisana przed zmianą.", "Konto uczen_standard nie należy do grupy Administratorzy.", "W notatce jest źródło, identyfikator i czas jednego zdarzenia systemowego."],
          "Przygotuj tabelę „konto — rola — uzasadnienie”. Dodaj do niej konto administracyjne oraz uczen_standard, a potem pokaż nauczycielowi ich członkostwo w grupach.",
        ),
        cyberLesson(
          "c-4-linux-utwardzanie-kont-i-aktualizacji",
          "C.4. Linux — aktualizacje, konta i sudo",
          "W Linuxie wiele ważnych ustawień wykonuje się w terminalu. Pracuj spokojnie: przed poleceniem sprawdź, na jakim koncie jesteś, a po nim odczytaj wynik.",
          ["sprawdzić bieżące konto i jego grupy", "bezpiecznie wykonać aktualizację openSUSE", "zweryfikować dostęp sudo na koncie testowym"],
          ["root — konto o pełnych prawach; nie używa się go do zwykłej pracy.", "sudo — jednorazowe wykonanie polecenia z uprawnieniami administratora po podaniu własnego hasła.", "Repozytorium — zdefiniowane źródło pakietów systemu."],
          ["Otwórz menu aplikacji → System → Terminal. Wpisz whoami i naciśnij Enter. Następnie wpisz id; zapisz nazwę konta oraz grupy, do których należy.", "Wpisz sudo zypper refresh i podaj hasło bieżącego użytkownika, gdy terminal o nie poprosi. Sprawdź, czy źródła pakietów odświeżyły się bez błędów podpisu.", "Wpisz sudo zypper patch. Przeczytaj listę zmian; gdy terminal zapyta o potwierdzenie, wpisz y tylko wtedy, gdy pracujesz w swojej maszynie LAB.", "Jeżeli aktualizacja dotyczy jądra, wykonaj restart poleceniem sudo systemctl reboot. Po ponownym zalogowaniu wpisz uname -r i zapisz wynik.", "Wpisz sudo -l. Odczytaj, czy bieżące konto ma prawo użyć sudo. Nie dopisuj siebie do dodatkowych grup bez polecenia nauczyciela."],
          ["whoami pokazuje konto inne niż root podczas zwykłej pracy.", "zypper refresh i zypper patch zakończyły się bez błędu.", "Po restarcie zapisano wynik uname -r oraz sudo -l."],
          "W VM utwórz notatkę z czterema wynikami: whoami, id, uname -r i sudo -l. Podkreśl, które konto jest zwykłe, a które ma prawo do administracji.",
        ),
        cyberLesson(
          "c-5-linux-bezpieczny-ssh",
          "C.5. Linux — bezpieczny dostęp SSH",
          "SSH pozwala zarządzać serwerem zdalnie. Zanim zmienisz dostęp, przygotuj drugi terminal i przeprowadzaj test po każdej małej zmianie, aby nie zablokować sobie serwera.",
          ["sprawdzić, czy usługa SSH działa", "dopuścić SSH tylko w sieci laboratoryjnej", "zweryfikować nowe połączenie bez utraty bieżącego"],
          ["SSH — szyfrowane połączenie do zdalnego terminala.", "Usługa — program działający w tle, zarządzany w openSUSE przez systemd.", "Strefa zapory — zestaw reguł przypisany do interfejsu sieciowego."],
          ["Na serwerze openSUSE otwórz Terminal i wpisz sudo systemctl status sshd. Odszukaj w wyniku active (running); jeżeli usługa nie działa, najpierw pokaż wynik nauczycielowi.", "W drugim terminalu na kliencie laboratoryjnym wpisz ssh nazwa_użytkownika@adres_IP_serwera. Po pierwszym połączeniu porównaj odcisk klucza hosta z informacją podaną przez nauczyciela, a następnie wpisz yes tylko w LAB.", "Na serwerze wpisz sudo firewall-cmd --get-active-zones. Zapisz nazwę strefy przypisanej do karty LAB-INF11.", "Jeżeli nauczyciel poleci otworzyć SSH, dodaj usługę wyłącznie do aktywnej strefy laboratoryjnej i od razu z drugiego terminala sprawdź nowe połączenie. Nie zamykaj pierwszej sesji, dopóki druga nie zadziała.", "Po ćwiczeniu zapisz adres serwera, nazwę konta i wynik systemctl status sshd. Nie zapisuj haseł ani prywatnych kluczy w notatce."],
          ["systemctl status sshd pokazuje active (running).", "Połączenie SSH działa między maszynami LAB-INF11.", "W dokumentacji nie ma hasła ani prywatnego klucza."],
          "Połącz się z klienta LAB do serwera przez SSH i przygotuj mini-raport: adres serwera, nazwa użytego konta, status sshd, strefa zapory oraz wynik testu połączenia.",
        ),
        cyberLesson(
          "c-6-zapora-i-segmentacja-lab",
          "C.6. Zapora i segmentacja sieci laboratoryjnej",
          "Zapora nie jest przeszkodą, którą trzeba wyłączyć, gdy coś nie działa. Jest kontrolą: określa, kto może połączyć się z konkretną usługą i z jakiego miejsca.",
          ["odróżnić test łączności od otwierania usługi", "sprawdzić stan zapory Windows lub firewalld", "usunąć tymczasową regułę po ćwiczeniu"],
          ["Port — numer logicznego wejścia usługi sieciowej.", "Reguła przychodząca — warunek, na jakim serwer przyjmie połączenie.", "Segmentacja — oddzielenie części sieci tak, aby problem w jednej nie rozchodził się automatycznie na inne."],
          ["W VirtualBox potwierdź, że klient i serwer są tylko w LAB-INF11. Zapisz ich adresy IP i nie używaj do testu adresów z sieci szkolnej.", "Na Windows kliknij Start i wpisz Zapora Windows Defender z zabezpieczeniami zaawansowanymi. Otwórz Monitorowanie → Zapora, aby sprawdzić stan profili.", "Na openSUSE wpisz sudo firewall-cmd --state, a potem sudo firewall-cmd --get-active-zones. Zapisz wynik obu poleceń.", "Jeżeli w zadaniu musisz udostępnić usługę, zapisz najpierw jej nazwę, port, kierunek i maszynę klienta. Dodaj najmniejszą regułę konieczną do testu, a nie szerokie zezwolenie „dla wszystkich”.",
            "Z klienta wykonaj tylko test do własnego serwera LAB. Gdy test się skończy, wyłącz albo usuń regułę tymczasową i ponów kontrolę stanu zapory."],
          ["Adresy testu należą do LAB-INF11.", "Stan zapory został zapisany przed i po ćwiczeniu.", "Tymczasowa reguła ma opis lub została usunięta po teście."],
          "Wykonaj kartę reguły dla jednej usługi laboratoryjnej: nazwa usługi, port, kierunek, źródło, cel, uzasadnienie, metoda testu i decyzja po zakończeniu testu.",
        ),
        cyberLesson(
          "c-7-logi-i-audyt-systemu",
          "C.7. Logi i audyt systemu",
          "Log nie jest automatycznym dowodem ataku. To ślad, który trzeba połączyć z czasem, użytkownikiem i zmianą w systemie. Uczysz się czytać go bez pochopnych wniosków.",
          ["odszukać wpis w dzienniku Windows i Linux", "zebrać podstawowe dane zdarzenia", "odróżnić obserwację od wniosku"],
          ["Źródło zdarzenia — program lub usługa, która zapisała komunikat.", "Identyfikator zdarzenia — numer pomagający rozpoznać rodzaj wpisu.", "Kontekst — informacje potrzebne do interpretacji: czas, host, konto i zdarzenia sąsiednie."],
          ["Na Windows kliknij Start i wpisz Podgląd zdarzeń. Otwórz Dzienniki systemu Windows → System, kliknij kolumnę Data i godzina, aby najnowsze wpisy były na górze.", "Kliknij jedno zdarzenie informacyjne i w dolnym panelu zapisz: poziom, źródło, identyfikator, datę oraz krótki opis. Nie kopiuj danych osobowych ani haseł do raportu.", "Na openSUSE otwórz Terminal i wpisz journalctl -p warning -b. Polecenie pokazuje ostrzeżenia z bieżącego uruchomienia; zapisz jeden wiersz wraz z czasem i nazwą usługi.", "Jeżeli wpis wygląda niepokojąco, sprawdź kilka zdarzeń przed i po nim oraz stan usługi. W raporcie napisz „wymaga weryfikacji”, zamiast od razu nazywać go incydentem.", "Zapisz raport w formacie: czas — host — źródło/usługa — identyfikator lub komunikat — co sprawdzono dalej."],
          ["Raport zawiera wymagane pola dla jednego wpisu Windows i jednego Linux.", "W raporcie oddzielono fakt zapisany w logu od własnego przypuszczenia.", "Nie zapisano haseł ani danych wrażliwych."],
          "Zbierz jedno zwykłe zdarzenie z Windows i jedno ostrzeżenie lub informację z journalctl. Ułóż z nich krótką tabelę i dopisz, jaki bezpieczny test wykonałeś, aby je wyjaśnić.",
        ),
        cyberLesson(
          "c-8-kopia-zapasowa-i-odtwarzanie",
          "C.8. Kopia zapasowa i odtwarzanie po błędzie",
          "Dobra kopia bezpieczeństwa ma znaną zawartość, jest oddzielona od testowanej maszyny i została przynajmniej raz sprawdzona przez odtworzenie. To ćwiczenie wykonujesz na własnym pliku kontrolnym.",
          ["przygotować plik kontrolny i kopię w bezpiecznym miejscu", "przetestować odtworzenie bez ryzyka dla danych", "zapisać wynik testu odtwarzania"],
          ["Kopia zapasowa — dodatkowa kopia danych pozwalająca wrócić po błędzie lub awarii.", "Odtwarzanie — przywrócenie danych i sprawdzenie, czy da się je użyć.", "Plik kontrolny — nieważny produkcyjnie plik utworzony tylko po to, by bezpiecznie sprawdzić procedurę."],
          ["W swojej maszynie LAB utwórz mały plik tekstowy KONTROLA-ODTWARZANIA.txt i wpisz do niego datę oraz dowolne zdanie. Nie używaj pliku z prawdziwymi danymi.", "Skopiuj plik do drugiej lokalizacji, która nie jest tym samym katalogiem roboczym. W VM możesz użyć osobnego wirtualnego dysku lub lokalizacji wskazanej przez nauczyciela.", "Otwórz kopię i porównaj jej zawartość z oryginałem. Zapisz ścieżkę oryginału, ścieżkę kopii, datę kopiowania oraz rozmiar pliku.", "Usuń wyłącznie oryginalny plik kontrolny z katalogu roboczego. Następnie skopiuj go z miejsca kopii z powrotem i otwórz przywrócony plik.", "Dopisz do raportu „odtworzenie udane” tylko wtedy, gdy otwarty plik ma tę samą treść. Na końcu możesz przywrócić migawkę laboratorium."],
          ["Kopia znajduje się poza katalogiem źródłowym.", "Przywrócony plik otwiera się i ma właściwą treść.", "Raport zawiera datę oraz wynik testu odtwarzania."],
          "Wykonaj pełny test na pliku KONTROLA-ODTWARZANIA.txt. Pokaż nauczycielowi oryginał po odtworzeniu oraz cztery informacje: źródło, miejsce kopii, czas i rezultat.",
        ),
        cyberLesson(
          "c-9-reagowanie-na-incydent-w-lab",
          "C.9. Reagowanie na incydent w laboratorium",
          "Reagowanie na incydent to uporządkowane działanie: zatrzymanie ryzyka, zachowanie informacji, ocena i bezpieczne przywrócenie. W ćwiczeniu nie udajesz ataku — analizujesz kontrolowany objaw.",
          ["zastosować prostą kolejność reakcji", "zachować informacje przed zmianą konfiguracji", "sporządzić zwięzłą notatkę z działania"],
          ["Izolacja — ograniczenie połączeń zagrożonej maszyny, aby problem nie rozprzestrzeniał się.", "Dowód roboczy — zapis stanu potrzebny do wyjaśnienia zdarzenia, np. czas, log, zrzut konfiguracji.", "Przywrócenie — powrót do znanego dobrego stanu po ocenie sytuacji."],
          ["Załóż scenariusz laboratoryjny: usługa testowa przestała działać po zmianie reguły zapory. Nie usuwaj od razu wszystkich reguł i nie wyłączaj zapory.", "Zapisz godzinę zauważenia problemu, nazwę maszyny, nazwę usługi i objaw widoczny na kliencie. Wykonaj zrzut lub notatkę konfiguracji przed zmianą.", "Ogranicz ryzyko w VM: zatrzymaj tylko testową usługę albo odłącz kartę LAB-INF11, jeśli nauczyciel poleci izolację. Nie zmieniaj ustawień hosta ani szkolnej sieci.", "Sprawdź w kolejności: adres IP, łączność w LAB, stan usługi, ostatnie wpisy logu i regułę zapory. Po każdym punkcie zapisuj wynik, zamiast robić wiele zmian naraz.", "Przywróć pojedynczą znaną zmianę lub migawkę BAZA-CZYSTA-INF11. Wykonaj test usługi z klienta i opisz, czy problem zniknął."],
          ["Notatka zawiera czas, host, objaw, wykonane testy i rezultat.", "Zmieniono lub przywrócono tylko element potrzebny do usunięcia problemu.", "Test po przywróceniu potwierdza działanie usługi w LAB."],
          "W parach odegrajcie scenariusz „usługa HTTP w LAB nie odpowiada po zmianie zapory”. Jedna osoba czyta objaw, druga prowadzi notatkę reakcji. Nie wykonujcie żadnych testów poza własnymi maszynami wirtualnymi.",
        ),
        cyberLesson(
          "c-10-raport-kontroli-bezpieczenstwa",
          "C.10. Raport kontroli bezpieczeństwa",
          "Administrator bezpieczeństwa musi umieć nie tylko ustawić system, ale też jasno wyjaśnić, co sprawdził, czego nie sprawdził i co należy poprawić. Końcowy raport ma być krótki, sprawdzalny i bezpieczny.",
          ["zbudować listę kontrolną dla Windows i Linux", "udokumentować wynik bez ujawniania sekretów", "wskazać priorytet poprawy w laboratorium"],
          ["Ustalenie — fakt potwierdzony testem lub obserwacją.", "Ryzyko — możliwy niekorzystny skutek, gdy ustawienie pozostaje błędne.", "Rekomendacja — konkretna, możliwa do wykonania poprawa z metodą weryfikacji."],
          ["Przygotuj tabelę z kolumnami: obszar, co sprawdzono, wynik, dowód, rekomendacja i data. Nie wpisuj do niej haseł, kluczy ani pełnych danych osobowych.", "Dla Windows sprawdź co najmniej: aktualizacje, stan ochrony, stan zapory, członków grupy Administratorzy oraz jedno zdarzenie systemowe.", "Dla openSUSE sprawdź co najmniej: aktualizacje, konto bieżące, prawo sudo, stan sshd, aktywną strefę zapory i jeden wpis z journalctl.", "Przy każdym wyniku oznacz: zgodne, do poprawy albo nie dotyczy. Gdy czegoś nie sprawdziłeś, wpisz „nie sprawdzono” zamiast zgadywać.", "Dla jednej pozycji „do poprawy” zapisz dokładny następny krok i test końcowy. Przykład: „sprawdzić aktualizacje po restarcie — wynik: brak oczekujących poprawek”."],
          ["Tabela obejmuje Windows i Linux.", "Każde ustalenie ma dowód lub metodę sprawdzenia.", "Raport nie zawiera haseł, kluczy prywatnych ani danych spoza LAB."],
          "Przygotuj jednokartkowy raport bezpieczeństwa dla dwóch własnych maszyn VM. Wskaż trzy wyniki zgodne i jedną poprawę do wykonania; po poprawie dopisz wynik testu końcowego.",
        ),
      ],
    };

    const bonusIndex = courseData.modules.findIndex(module => module.id === "sciagi");
    courseData.modules.splice(bonusIndex < 0 ? courseData.modules.length : bonusIndex, 0, cyberModule);
  }

  appendCyberSecurityContent(course);

  function appendFullInf11Programme(courseData) {
    if (courseData.modules.some(module => module.id === "cyber-inf11-foundations")) return;

    const systemModule = courseData.modules.find(module => module.id === "cyber-inf11");
    if (systemModule) {
      systemModule.number = "C.4";
      systemModule.title = "INF.11 — utwardzanie systemów Windows i Linux";
      systemModule.displayTitle = "INF.11 — utwardzanie Windows i Linux";
      systemModule.navTitle = "INF.11 - utwardzanie systemów";
      systemModule.units.forEach((unit, index) => {
        unit.title = `C.4.${index + 1}. ${unit.title.replace(/^C\.\d+\.\s*/, "")}`;
      });
    }

    const foundations = {
      id: "cyber-inf11-foundations", number: "C.1", audience: "inf11",
      title: "INF.11 — podstawy cyberbezpieczeństwa", displayTitle: "INF.11 — fundamenty cyberbezpieczeństwa", navTitle: "INF.11 - fundamenty", leadBlocks: [],
      units: [
        cyberLesson("c11-1-cia-zakres-i-ryzyko", "C.1.1. CIA, zakres i ryzyko", "Cyberbezpieczeństwo to ochrona poufności, integralności i dostępności danych. Zanim wykonasz jakiekolwiek ćwiczenie, określasz zasoby, zgodę i możliwe skutki zmiany.", ["wyjaśnić triadę CIA na przykładzie szkolnego serwera", "odróżnić zagrożenie, podatność i ryzyko", "przygotować bezpieczny zakres ćwiczenia"], ["Poufność oznacza dostęp tylko dla uprawnionych osób.", "Integralność oznacza brak nieuprawnionej zmiany danych.", "Dostępność oznacza możliwość użycia usługi wtedy, gdy jest potrzebna.", "Ryzyko łączy zagrożenie, podatność i możliwy skutek."], ["W notatce utwórz tabelę z kolumnami: zasób, właściciel, dozwolone działanie, zagrożenie i test końcowy.", "Wpisz wyłącznie maszyny z własnego laboratorium, np. WIN11-LAB i LINUX-LAB. Nie wpisuj prawdziwych systemów szkoły, do których nie masz pisemnej zgody.", "Dla pliku KONTROLA-ODTWARZANIA.txt zapisz przykład dla CIA: poufność — prawo odczytu, integralność — suma kontrolna, dostępność — kopia i test odtworzenia.", "Przed zmianą konfiguracji utwórz migawkę BAZA-CZYSTA. W tabeli zapisz, jak wrócisz do tego stanu, gdy test nie powiedzie się.", "Po ćwiczeniu dopisz rzeczywisty wynik testu. Nie wpisuj „działa”, lecz konkretny dowód, np. nazwa polecenia i jego rezultat."], ["Tabela wskazuje wyłącznie zasoby LAB.", "Dla każdego zasobu podano jeden test i sposób cofnięcia zmiany.", "Uczeń potrafi wskazać po jednym przykładzie dla poufności, integralności i dostępności."], "Przygotuj kartę ryzyka dla usługi SSH w laboratorium: zasób, zagrożenie, podatność, możliwy skutek, zabezpieczenie i sposób weryfikacji."),
        cyberLesson("c11-2-zagrozenia-i-socjotechnika", "C.1.2. Zagrożenia i socjotechnika", "Większość incydentów zaczyna się od próby nakłonienia człowieka do szybkiej, nieprzemyślanej decyzji. Uczeń uczy się rozpoznawać sygnały ostrzegawcze, nie tworzyć fałszywych wiadomości.", ["rozpoznać typowe sygnały phishingu", "wybrać bezpieczny sposób weryfikacji prośby", "opisać różnicę między zdarzeniem a potwierdzonym incydentem"], ["Phishing to podszywanie się pod zaufaną osobę lub instytucję.", "Spear phishing jest celowany w konkretną osobę albo organizację.", "Niezależny kanał to np. samodzielnie wyszukany numer telefonu, a nie numer z podejrzanej wiadomości."], ["Otwórz przygotowany przez nauczyciela przykład wiadomości szkoleniowej. Nie klikaj linku i nie otwieraj załącznika, nawet gdy wygląda znajomo.", "Sprawdź nadawcę: odczytaj pełny adres, a nie tylko nazwę wyświetlaną w programie pocztowym. Zapisz, co budzi wątpliwość.", "Najedź kursorem na link bez klikania i odczytaj adres docelowy. Porównaj domenę z domeną instytucji, którą rzekomo reprezentuje nadawca.", "Oceń presję czasu, prośbę o hasło, kod MFA, przelew lub nietypowy załącznik. Każdy z tych elementów wpisz do listy sygnałów ostrzegawczych.", "Przygotuj bezpieczną odpowiedź: nie odpowiadaj na podejrzaną wiadomość, lecz skontaktuj się z instytucją niezależnym kanałem i zgłoś przykład nauczycielowi."], ["Lista zawiera nadawcę, domenę linku, prośbę i sposób weryfikacji.", "Uczeń nie kliknął linku ani nie użył prawdziwych danych logowania.", "Wniosek opisuje obserwację, a nie oskarża konkretnej osoby."], "Oceń trzy przygotowane przez nauczyciela przykłady komunikatów. Dla każdego wpisz: sygnał ostrzegawczy, bezpieczny następny krok i komu go zgłosić."),
        cyberLesson("c11-3-tozsamosc-mfa-i-rbac", "C.1.3. Tożsamość, MFA i RBAC", "Identyfikacja odpowiada na pytanie „kto to jest”, uwierzytelnianie „czy potrafi to udowodnić”, a autoryzacja „na co ma pozwolenie”. W INF.11 uczysz się nie mylić tych pojęć.", ["rozróżnić identyfikację, uwierzytelnianie i autoryzację", "zaprojektować prosty model ról", "uzasadnić użycie MFA i najmniejszych uprawnień"], ["MFA łączy co najmniej dwa niezależne czynniki, np. hasło oraz kod z aplikacji.", "RBAC przyznaje prawa grupie roli, a nie pojedynczym osobom.", "Zasada najmniejszych uprawnień ogranicza skutki błędu lub przejęcia konta."], ["W notatce utwórz trzy role: Uczeń, Nauczyciel i Administrator-LAB. Przy każdej wpisz tylko zasoby niezbędne do jej zadania.", "Dla roli Uczeń wpisz pracę na koncie standardowym; dla Administrator-LAB wpisz administrację wyłącznie własną maszyną wirtualną. Nie przypisuj roli Administrator do konta codziennego.", "Na Windows otwórz Zarządzanie komputerem → Użytkownicy i grupy lokalne → Grupy. Otwórz Administratorzy i porównaj listę członków z projektem ról.", "Na openSUSE w Terminalu wpisz id nazwa_użytkownika. Odczytaj UID oraz grupy, ale nie zmieniaj ich bez polecenia laboratorium.", "Przy każdym koncie zapisz, czy MFA byłoby wymagane i dlaczego. Nigdy nie proś drugiej osoby o kod jednorazowy MFA."], ["Projekt ról nie daje wszystkim kontom praw administratora.", "W dokumentacji rozróżniono konto, metodę logowania i przyznane uprawnienie.", "Lista członków grup została zweryfikowana na maszynie LAB."], "Narysuj mapę RBAC dla małego laboratorium: trzy role, trzy zasoby i po jednym dozwolonym działaniu dla każdej roli. Pokaż, dlaczego Uczeń nie potrzebuje roli Administrator-LAB."),
        cyberLesson("c11-4-kryptografia-skrót-i-certyfikat", "C.1.4. Skróty, klucze i certyfikaty", "Kryptografia pomaga wykryć zmianę pliku, potwierdzić tożsamość serwera i chronić dane. W tej lekcji wykonujesz tylko operacje na własnym pliku laboratoryjnym.", ["obliczyć i porównać sumę SHA-256", "wyjaśnić różnicę między skrótem a szyfrowaniem", "odczytać podstawowe pola certyfikatu"], ["Funkcja skrótu tworzy krótki odcisk danych; zmiana danych zmienia skrót.", "Szyfrowanie ma chronić treść przed odczytem bez klucza.", "Certyfikat wiąże tożsamość z kluczem publicznym i ma wystawcę oraz okres ważności."], ["Na Windows utwórz plik kontrola.txt z jednym zdaniem. Otwórz PowerShell i wpisz Get-FileHash .\\kontrola.txt -Algorithm SHA256. Skopiuj wynik do notatki.", "Zmień w pliku jeden znak, zapisz go i ponownie wykonaj to samo polecenie. Porównaj oba skróty — muszą być różne.", "Na openSUSE utwórz taki sam plik i wpisz sha256sum kontrola.txt. Zapisz wynik oraz nazwę pliku.", "W przeglądarce otwórz dowolną stronę szkoleniową HTTPS i kliknij ikonę kłódki. Otwórz informacje o certyfikacie i odczytaj podmiot, wystawcę oraz datę ważności; nie eksportuj certyfikatu z cudzej usługi.", "W notatce opisz, co odpowiada za integralność pliku, a co za poufność jego treści."], ["Po zmianie jednego znaku skrót SHA-256 jest inny.", "Uczeń umie wskazać wystawcę i datę ważności certyfikatu.", "Notatka rozróżnia skrót, szyfrowanie i certyfikat."], "Utwórz raport „integralność pliku”: nazwa pliku, pierwszy skrót, dokonana zmiana, drugi skrót i wniosek. Dodaj trzy pola odczytane z certyfikatu strony HTTPS."),
        cyberLesson("c11-5-polityka-ryzyko-i-incydent", "C.1.5. Polityka, ryzyko i incydent", "Polityka bezpieczeństwa mówi, jak postępujemy; procedura opisuje kolejne kroki. Dobra reakcja na incydent opiera się na faktach, nie na domysłach.", ["utworzyć prostą politykę dla laboratorium", "ocenić ryzyko w skali niskie–krytyczne", "przygotować zgłoszenie incydentu bez ujawniania sekretów"], ["Zdarzenie jest obserwacją, a incydent oznacza potwierdzone lub uzasadnione naruszenie.", "Eskalacja to przekazanie sprawy osobie lub zespołowi z odpowiednimi uprawnieniami.", "Dowód roboczy to np. czas, host, log i opis obserwacji — nie jest nim hasło użytkownika."], ["W notatce wpisz trzy zasady LAB: testy tylko na własnych VM, zakaz używania cudzych poświadczeń i obowiązek migawki przed zmianą.", "Dodaj procedurę zgłoszenia: zauważenie, zapis czasu i hosta, ograniczenie ryzyka tylko w LAB, zebranie logów, przekazanie nauczycielowi.", "Przygotuj przykładowe zgłoszenie dla problemu „trzy nieudane logowania do konta testowego”. Wpisz czas, host, konto testowe, źródło logu i stan sprawy.", "Oceń ryzyko: niskie, średnie, wysokie lub krytyczne. Uzasadnij skalę skutkiem oraz prawdopodobieństwem, nie samym strachem przed zagrożeniem.", "Sprawdź zgłoszenie przed zapisaniem: usuń hasła, kody MFA, klucze prywatne oraz dane osób, których nie potrzebujesz do ćwiczenia."], ["Polityka zawiera granice laboratorium.", "Zgłoszenie ma czas, host, źródło informacji i następny krok.", "Raport nie zawiera haseł ani kodów MFA."], "Przygotuj jedną stronę procedury dla ucznia, który zauważa nietypowe logowanie w VM. Dopisz, czego nie wolno robić samodzielnie."),
      ],
    };

    const python = {
      id: "cyber-inf11-python", number: "C.2", audience: "inf11",
      title: "INF.11 — Python i automatyzacja", displayTitle: "INF.11 — Python dla cyberbezpieczeństwa", navTitle: "INF.11 - Python", leadBlocks: [],
      units: [
        cyberLesson("c11-6-python-srodowisko", "C.2.1. Python, terminal i środowisko projektu", "Python w INF.11 służy między innymi do porządkowania logów i tworzenia raportów. Zaczynasz od własnego katalogu projektu, nie od uruchamiania cudzych skryptów z internetu.", ["sprawdzić wersję Pythona", "utworzyć katalog i środowisko wirtualne", "uruchomić prosty program z terminala"], ["Interpreter wykonuje kod Pythona.", "Środowisko wirtualne oddziela pakiety jednego projektu od innych projektów.", "Plik .py jest tekstem źródłowym programu, który można otworzyć i przeczytać przed uruchomieniem."], ["Otwórz Terminal w openSUSE. Wpisz python3 --version i zapisz wynik. Jeżeli polecenie nie działa, nie instaluj przypadkowego pakietu — sprawdź z nauczycielem źródło pakietu.", "Wpisz mkdir -p ~/inf11/python, następnie cd ~/inf11/python oraz python3 -m venv .venv. Powstanie katalog projektu oraz oddzielne środowisko.", "Aktywuj środowisko poleceniem source .venv/bin/activate. W wierszu terminala pojawi się zwykle nazwa .venv.", "Otwórz edytor tekstu i utwórz plik hello_inf11.py. Wpisz prostą instrukcję print, zapisz plik w katalogu projektu.", "W Terminalu wpisz python3 hello_inf11.py. Porównaj wyświetlony tekst z treścią pliku, a potem zakończ pracę poleceniem deactivate."], ["python3 --version pokazuje wersję interpretera.", "W katalogu ~/inf11/python istnieje plik .py i folder .venv.", "Program uruchamia się bez pobierania dodatkowego kodu."], "Utwórz własny katalog projektu INF.11 i program wyświetlający nazwę laboratorium oraz datę. Do raportu wklej tylko wynik python3 --version, bez danych osobowych.", "print(\"Laboratorium INF.11 gotowe\")\nprint(\"Pracuję tylko na własnych danych testowych.\")"),
        cyberLesson("c11-7-python-walidacja-danych", "C.2.2. Python — walidacja danych wejściowych", "Bezpieczny program zakłada, że dane mogą być puste, błędne albo mieć nieoczekiwany format. Walidacja ma odrzucić problem spokojnie, zamiast zakończyć program błędem.", ["użyć try/except do obsługi błędu", "sprawdzić zakres liczby", "wyjaśnić, dlaczego eval i exec nie są rozwiązaniem dla danych użytkownika"], ["Walidacja sprawdza, czy dane mają oczekiwany typ i zakres.", "Wyjątek jest sygnałem błędu, który program może obsłużyć.", "eval i exec wykonują tekst jako kod; nie stosuje się ich do danych wejściowych użytkownika."], ["W katalogu projektu utwórz plik port_check.py. Skopiuj przykład z tej lekcji i przeczytaj każdą linijkę przed uruchomieniem.", "Uruchom program przez python3 port_check.py. Wpisz kolejno 443, 0, 70000 i tekst abc; obserwuj osobne komunikaty zamiast błędu programu.", "W kodzie znajdź funkcję int. Ona próbuje zamienić tekst na liczbę; blok except reaguje, gdy to się nie uda.", "Zmień komunikat, aby przypominał, że numer portu ma zakres od 1 do 65535. Nie dodawaj funkcji, które łączą się z nieznanymi hostami.", "Zapisz w raporcie trzy przypadki testowe: prawidłowy numer, numer poza zakresem i tekst."], ["Program nie kończy się błędem dla abc.", "Port 443 jest akceptowany, a 0 i 70000 odrzucone.", "Uczeń umie wskazać blok try oraz except."], "Dodaj własny warunek, który odrzuca pustą odpowiedź. Przetestuj go i wpisz oczekiwany oraz rzeczywisty wynik.", "try:\n    port = int(input(\"Podaj port testowy: \"))\n    if 1 <= port <= 65535:\n        print(f\"Port {port} ma poprawny zakres.\")\n    else:\n        print(\"Port musi być od 1 do 65535.\")\nexcept ValueError:\n    print(\"Wpisz liczbę, a nie tekst.\")"),
        cyberLesson("c11-8-python-logi-csv", "C.2.3. Python — bezpieczne czytanie logu CSV", "Automatyzacja w cyberbezpieczeństwie często zaczyna się od liczenia i filtrowania własnych danych testowych. Program w tej lekcji czyta lokalny plik CSV, nie łączy się z żadną siecią.", ["utworzyć mały plik CSV w LAB", "wczytać dane modułem csv", "zliczyć wpisy według pola status"], ["CSV to zwykły plik tabelaryczny z wartościami rozdzielonymi przecinkiem.", "Nagłówek opisuje znaczenie kolumn.", "Dane testowe nie mogą zawierać prawdziwych haseł, tokenów ani danych wrażliwych."], ["W katalogu ~/inf11/python utwórz plik zdarzenia.csv. W pierwszym wierszu wpisz nagłówki czas,host,status, a poniżej trzy własne, fikcyjne wpisy testowe.", "Utwórz plik count_status.py i wklej przykład. Zwróć uwagę na with open: plik zostanie zamknięty automatycznie po zakończeniu pracy.", "Uruchom python3 count_status.py. Program odczyta tylko plik zdarzenia.csv z bieżącego katalogu i policzy wartości pola status.", "Zmień jeden status z ZABLOKOWANO na DOZWOLONO, zapisz CSV i uruchom program ponownie. Porównaj wynik przed i po zmianie.", "W raporcie zapisz liczbę wpisów oraz nazwę pliku, nie wklejaj całej zawartości logu bez potrzeby."], ["CSV zawiera nagłówki i dane testowe.", "Program kończy pracę bez błędu i podaje licznik statusów.", "Zmiana jednej wartości w CSV zmienia raport."], "Dodaj piąty wpis testowy i udowodnij, że licznik go uwzględnia. Nie używaj danych z prawdziwych logów szkolnych.", "import csv\nfrom collections import Counter\n\ncounts = Counter()\nwith open(\"zdarzenia.csv\", newline=\"\", encoding=\"utf-8\") as file:\n    for row in csv.DictReader(file):\n        counts[row[\"status\"]] += 1\n\nfor status, count in sorted(counts.items()):\n    print(f\"{status}: {count}\")"),
        cyberLesson("c11-9-python-json-i-raport", "C.2.4. Python — JSON i raport techniczny", "Format JSON jest wygodny do zapisu prostego raportu. Uczeń tworzy raport o własnym laboratorium, bez sekretów i bez automatycznego wysyłania go do internetu.", ["zapisać słownik Pythona jako JSON", "odczytać i sprawdzić pola raportu", "rozpoznać, których danych nie wolno umieszczać w raporcie"], ["JSON przechowuje dane jako pary klucz–wartość.", "Raport techniczny powinien umożliwiać sprawdzenie wyniku bez ujawniania sekretów.", "Sekrety to m.in. hasła, tokeny, klucze prywatne i kody odzyskiwania."], ["W katalogu projektu utwórz report_lab.py i wklej przykład. Zmień tylko nazwę hosta na fikcyjną nazwę swojej maszyny LAB.", "Uruchom python3 report_lab.py. Powstanie plik raport_lab.json w tym samym katalogu.", "Otwórz raport_lab.json w edytorze. Sprawdź, czy ma pola host, zakres, wynik i data.", "Usuń z przykładu każde pole, które mogłoby zawierać hasło, adres spoza LAB albo dane innej osoby. Raport ma opisywać wynik kontroli, nie przechowywać sekrety.", "Wykonaj drugie uruchomienie po zmianie wyniku z zgodne na do_poprawy i porównaj plik JSON."], ["Plik JSON otwiera się jako czytelny tekst.", "Raport zawiera wymagane pola i nie ma sekretów.", "Zmiana wyniku jest widoczna po ponownym uruchomieniu programu."], "Utwórz JSON z wynikiem kontroli zapory własnej VM. W polu dowod wpisz nazwę polecenia lub ekran ustawień, nie wklejaj pełnego logu.", "import json\nfrom datetime import date\n\nreport = {\n    \"host\": \"LINUX-LAB\",\n    \"zakres\": \"własna maszyna wirtualna\",\n    \"wynik\": \"zgodne\",\n    \"dowod\": \"firewall-cmd --state\",\n    \"data\": str(date.today())\n}\nwith open(\"raport_lab.json\", \"w\", encoding=\"utf-8\") as file:\n    json.dump(report, file, ensure_ascii=False, indent=2)"),
        cyberLesson("c11-10-python-testy-i-zaleznosci", "C.2.5. Python — testy i zależności", "Kod działający dziś może zawieść po zmianie danych lub pakietu. Testy sprawdzają oczekiwane zachowanie, a lista zależności pozwala odtworzyć środowisko bez zgadywania.", ["uruchomić prosty test jednostkowy", "zapisać listę pakietów środowiska", "wyjaśnić, dlaczego nie używa się nieznanych bibliotek bez weryfikacji"], ["Test jednostkowy sprawdza mały fragment programu.", "Zależność to biblioteka potrzebna programowi.", "requirements.txt opisuje pakiety projektu i ich wersje."], ["W aktywnym środowisku .venv utwórz plik test_port.py i wklej przykład z unittest. Przeczytaj, jakie wartości są uznawane za poprawne.", "Uruchom python3 -m unittest test_port.py. Zapisz liczbę testów oraz wynik OK albo komunikat błędu.", "Jeżeli test nie przejdzie, popraw tylko własną funkcję testową. Nie wyłączaj testu, aby uzyskać zielony wynik.", "Wpisz python3 -m pip list i zapisz krótką listę użytych pakietów. Gdy projekt ma zewnętrzne pakiety, zapisuj je do requirements.txt dopiero po sprawdzeniu źródła i potrzebności.", "Zakończ pracę poleceniem deactivate. Środowisko projektu pozostaje w katalogu, ale nie zmienia globalnych pakietów systemu."], ["Test kończy się wynikiem OK po poprawnej implementacji.", "Uczeń umie wskazać, co sprawdza test.", "Lista zależności nie zawiera pakietów dodanych bez uzasadnienia."], "Napisz jeden dodatkowy test dla wartości 65536. Opisz, dlaczego wynik powinien być fałszywy."),
      ],
    };

    const databases = {
      id: "cyber-inf11-databases", number: "C.3", audience: "inf11",
      title: "INF.11 — dane i relacyjne bazy danych", displayTitle: "INF.11 — bezpieczeństwo danych i baz", navTitle: "INF.11 - dane i bazy", leadBlocks: [],
      units: [
        cyberLesson("c11-11-model-danych-i-klasyfikacja", "C.3.1. Dane, klasyfikacja i minimalizacja", "Zanim zaprojektujesz bazę, ustalasz, jakie dane są potrzebne, kto może je odczytać i jak długo powinny być przechowywane. W laboratorium używasz wyłącznie fikcyjnych rekordów.", ["rozróżnić dane jawne, wewnętrzne i wrażliwe", "zaprojektować minimalny zestaw pól", "wyjaśnić zasadę minimalizacji danych"], ["Klasyfikacja danych pomaga dobrać ochronę do ich znaczenia.", "Minimalizacja oznacza zbieranie tylko pól potrzebnych do konkretnego celu.", "Rekord testowy nie powinien zawierać prawdziwego PESEL, hasła ani danych ucznia."], ["W notatce utwórz tabelę „zasób LAB”. Dodaj kolumny: nazwa pola, cel, klasa danych, kto odczytuje, kiedy usuwa się dane.", "Zaprojektuj przykładową tabelę urządzenia z polami identyfikator, nazwa_testowa, system i status. Nie dodawaj nazwisk ani prawdziwych adresów MAC.", "Dla każdego pola napisz, czy jest konieczne. Usuń pola, których nie umiesz uzasadnić celem laboratorium.", "Wskaż, która rola może odczytać każdy typ danych. Uczeń powinien widzieć tylko własne dane testowe, a administrator LAB tylko to, co jest potrzebne do ćwiczenia.", "Zapisz termin usunięcia danych testowych po zakończeniu modułu."], ["Projekt nie zawiera danych osobowych ani sekretów.", "Każde pole ma uzasadniony cel.", "Określono rolę odczytu i termin usunięcia."], "Przygotuj projekt tabeli dla inwentarza pięciu fikcyjnych VM. Oznacz, które pola mogą być publiczne w klasie, a które tylko dla nauczyciela."),
        cyberLesson("c11-12-sqlite-role-i-uprawnienia", "C.3.2. SQLite — baza testowa i role", "SQLite pozwala stworzyć lokalną bazę do nauki bez uruchamiania serwera w sieci. Poznajesz relacje ról jako model dostępu, a nie jako mechanizm do przechowywania haseł.", ["utworzyć lokalną bazę testową", "zaprojektować tabelę użytkowników i ról", "sprawdzić dane poleceniem SELECT"], ["SQLite zapisuje bazę w jednym pliku lokalnym.", "Klucz główny jednoznacznie wskazuje rekord.", "Rola opisuje zestaw uprawnień, a nie tożsamość osoby."], ["W Terminalu przejdź do ~/inf11 i utwórz katalog database: mkdir -p ~/inf11/database. Nie zapisuj bazy w katalogu współdzielonym z prawdziwymi danymi.", "Utwórz plik roles.py i wklej przykład. Program tworzy plik lab.db tylko w bieżącym katalogu.", "Uruchom python3 roles.py. Program wypisze fikcyjne role i przypisania; nie wpisuj prawdziwych nazw kont szkolnych.", "Otwórz plik lab.db tylko jako artefakt laboratoryjny. Zapisz, że w prawdziwej organizacji role i uprawnienia zarządza się przez serwer bazy i politykę dostępu.", "Usuń plik lab.db po zakończeniu ćwiczenia albo przywróć migawkę, jeśli tak wymaga nauczyciel."], ["Powstaje lokalny plik lab.db.", "Wynik zawiera tylko fikcyjne identyfikatory i role.", "Uczeń potrafi wyjaśnić różnicę między użytkownikiem i rolą."], "Dodaj do danych testowych rolę audytor, której zadaniem jest tylko odczyt raportów. Opisz, dlaczego nie potrzebuje roli administrator." , "import sqlite3\n\nwith sqlite3.connect(\"lab.db\") as db:\n    db.execute(\"CREATE TABLE IF NOT EXISTS roles (name TEXT PRIMARY KEY)\")\n    db.execute(\"CREATE TABLE IF NOT EXISTS users (name TEXT PRIMARY KEY, role TEXT)\")\n    db.executemany(\"INSERT OR IGNORE INTO roles VALUES (?)\", [(\"uczen\",), (\"admin_lab\",)])\n    db.executemany(\"INSERT OR REPLACE INTO users VALUES (?, ?)\", [(\"test_ania\", \"uczen\"), (\"test_admin\", \"admin_lab\")])\n    for row in db.execute(\"SELECT name, role FROM users ORDER BY name\"):\n        print(row)"),
        cyberLesson("c11-13-parametryzacja-i-walidacja", "C.3.3. Zapytania parametryzowane i walidacja", "Dane wprowadzane przez użytkownika traktuje się jako dane, nigdy jako fragment polecenia SQL. Parametryzacja oddziela strukturę zapytania od wartości.", ["wyjaśnić zagrożenie wstrzyknięcia SQL bez wykonywania ataku", "użyć znaku zapytania jako parametru sqlite3", "sprawdzić dane przed zapisaniem"], ["Zapytanie parametryzowane przekazuje wartość oddzielnie od tekstu SQL.", "Walidacja ustala, czy wartość ma oczekiwany format.", "Wstrzyknięcie SQL wykorzystuje mieszanie danych użytkownika z kodem zapytania."], ["Otwórz plik query_safe.py w katalogu database i wklej przykład. Przeczytaj znak zapytania w SQL oraz krotkę (name,).", "Uruchom python3 query_safe.py. Program wyszuka tylko fikcyjne konto test_ania w lokalnej bazie.", "Zmień wartość name na inną istniejącą nazwę testową. Nie wpisuj znaków mających zmieniać zapytanie ani nie próbuj testować bazy spoza laboratorium.", "Dopisz warunek sprawdzający, czy nazwa składa się wyłącznie z liter, cyfr i podkreślenia. Jeśli warunek nie przechodzi, program powinien zakończyć się komunikatem, nie zapytaniem SQL.", "W notatce opisz własnymi słowami, dlaczego łączenie tekstów w SQL jest gorsze od parametrów."], ["Zapytanie używa placeholdera ? zamiast łączenia tekstu.", "Niepoprawna nazwa jest odrzucona przed zapytaniem.", "Ćwiczenie dotyczy wyłącznie lokalnej bazy testowej."], "Napisz dwa przykłady nazw akceptowanych i dwa odrzucone przez walidację. Dla każdego podaj oczekiwany rezultat." , "import sqlite3\n\nname = \"test_ania\"\nif not name.replace(\"_\", \"\").isalnum():\n    raise ValueError(\"Nazwa ma niedozwolone znaki\")\n\nwith sqlite3.connect(\"lab.db\") as db:\n    row = db.execute(\"SELECT name, role FROM users WHERE name = ?\", (name,)).fetchone()\n    print(row)"),
        cyberLesson("c11-14-kopia-i-odtworzenie-bazy", "C.3.4. Kopia i odtworzenie bazy", "Kopia bazy ma sens dopiero wtedy, gdy potrafisz odtworzyć ją i sprawdzić zawartość. Ćwiczysz wyłącznie na pliku SQLite z fikcyjnymi danymi.", ["wykonać kopię pliku bazy", "odtworzyć kopię w osobnej lokalizacji", "porównać wynik prostym zapytaniem"], ["Kopia logiczna zapisuje dane w postaci poleceń lub eksportu.", "Kopia plikowa jest kopią samego pliku bazy, gdy usługa jest zatrzymana albo metoda jest bezpieczna dla danego silnika.", "Test odtworzenia jest niezależnym potwierdzeniem, że kopia działa."], ["W katalogu database sprawdź ls -l lab.db. Zapisz rozmiar oraz datę pliku testowej bazy.", "Skopiuj bazę do podkatalogu backup: mkdir -p backup, a następnie cp lab.db backup/lab-backup.db. Używaj wyłącznie pliku lab.db z ćwiczenia.", "Uruchom skrypt z poprzedniej lekcji, zmieniając nazwę pliku bazy na backup/lab-backup.db. Potwierdź, że odczyt zwraca oczekiwane fikcyjne rekordy.", "Usuń tylko oryginalny plik lab.db z katalogu roboczego, a potem skopiuj go z backup/lab-backup.db z powrotem. Nie ćwicz usuwania na realnej bazie.", "Uruchom ponownie query_safe.py i zapisz wynik odtworzenia w raporcie."], ["Istnieje osobna kopia w folderze backup.", "Kopia otwiera się i zwraca oczekiwane dane testowe.", "Raport rozróżnia wykonanie kopii i pomyślne odtworzenie."], "Wykonaj test odtworzenia bazy i wpisz do tabeli: data kopii, lokalizacja, test zapytaniem SELECT i wynik."),
        cyberLesson("c11-15-audyt-danych-i-sekrety", "C.3.5. Audyt danych i bezpieczne sekrety", "Sekretów nie przechowuje się w kodzie, pliku CSV ani zwykłej tabeli. Audyt ma odpowiadać na pytanie kto i kiedy zmienił rekord testowy, bez ujawniania haseł.", ["rozpoznać sekret w projekcie", "zaprojektować minimalny wpis audytowy", "wyjaśnić rolę menedżera sekretów"], ["Sekret obejmuje hasło, token, klucz prywatny i kod odzyskiwania.", "Wpis audytowy zawiera zwykle czas, działanie, obiekt i tożsamość roli, nie tajną wartość.", "Menedżer sekretów przekazuje poświadczenie aplikacji bez wpisywania go w kod."], ["Otwórz własne pliki .py i .json w projekcie. Użyj funkcji szukania edytora dla słów password, token i key.", "Jeżeli w przykładzie znalazłby się sekret, zastąp go tekstem NIE_WPISUJ_SEKRETU i zapisz, że prawdziwa wartość nie powinna trafić do repozytorium.", "W notatce utwórz tabelę audytu z polami czas, rola, działanie, obiekt i wynik. Wpisz fikcyjne działanie: audytor odczytał raport_lab.json.", "Sprawdź, czy tabela audytu nie zawiera hasła, pełnej treści dokumentu ani kodu MFA.", "Zaprojektuj regułę: konto aplikacji ma tylko te uprawnienia, które są potrzebne do odczytu lub zapisu konkretnej tabeli."], ["W plikach szkoleniowych nie ma prawdziwych sekretów.", "Wpis audytowy identyfikuje działanie bez zapisywania tajnej wartości.", "Rola aplikacji ma ograniczony, uzasadniony zakres."], "Przygotuj trzy fikcyjne wpisy audytowe: odczyt raportu, nieudane logowanie i wykonanie kopii. Oznacz, które zdarzenie wymaga dalszej weryfikacji."),
      ],
    };

    const networking = {
      id: "cyber-inf11-networking", number: "C.5", audience: "inf11",
      title: "INF.11 — TCP/IP i bezpieczna sieć", displayTitle: "INF.11 — bezpieczne sieci TCP/IP", navTitle: "INF.11 - sieci TCP/IP", leadBlocks: [],
      units: [
        cyberLesson("c11-16-adresacja-cidr-i-plan", "C.5.1. Adresacja IPv4, CIDR i plan sieci", "Adresacja jest podstawą identyfikacji źródeł ruchu. Uczeń potrafi zaplanować małą podsieć laboratoryjną, nie zmieniając konfiguracji szkolnej sieci.", ["wyznaczyć adres sieci i hosta dla /24", "rozróżnić adres prywatny i publiczny", "przygotować plan adresów LAB"], ["CIDR /24 odpowiada masce 255.255.255.0.", "Adres sieci identyfikuje całą podsieć, a adres hosta konkretne urządzenie.", "Zakresy prywatne IPv4 służą do sieci wewnętrznych."], ["W notatce utwórz sieć LAB-INF11 192.168.56.0/24. Zapisz adres sieci 192.168.56.0, a jako hosty wybierz 192.168.56.10 i 192.168.56.20.", "Wpisz maskę 255.255.255.0 oraz zaznacz, że adres .255 jest rozgłoszeniowy i nie przypisuje się go hostowi.", "Przypisz role: .10 — WIN-LAB, .20 — LINUX-LAB. Nie używaj tych adresów w fizycznej sieci szkolnej, jeśli nie jest to sieć wewnętrzna VM.", "Na Windows wpisz ipconfig /all, a na Linuxie ip addr. Porównaj aktualne adresy z planem tylko wtedy, gdy maszyny są w LAB.", "W raporcie zapisz nazwę maszyny, IP, maskę, bramę (jeśli jest) i rolę."], ["Plan ma dwa różne adresy hostów w tej samej podsieci.", "Uczeń rozróżnia adres sieci, hosta i rozgłoszeniowy.", "Raport nie zawiera adresów urządzeń spoza LAB."], "Zaprojektuj adresację dla trzech VM: klient, serwer Linux i serwer Windows. Dla każdej podaj nazwę, IP i uzasadnienie roli."),
        cyberLesson("c11-17-protokoly-porty-i-uslugi", "C.5.2. TCP, UDP, porty i usługi", "Port wskazuje usługę, a nie „dziurę do internetu”. Bezpieczna konfiguracja wymaga wiedzy, która usługa nasłuchuje, dlaczego i kto ma mieć do niej dostęp.", ["rozróżnić TCP i UDP", "odczytać lokalne usługi nasłuchujące", "powiązać usługę z zasadą zapory"], ["TCP tworzy połączenie i potwierdza dostarczenie danych.", "UDP przesyła datagramy bez zestawiania połączenia.", "Usługa nasłuchująca oczekuje połączeń na określonym porcie."], ["Na Windows otwórz Wiersz polecenia i wpisz netstat -ano. Odszukaj wiersze z LISTENING i zapisz tylko numer portu oraz PID; nie publikuj pełnego zrzutu ekranu z cudzymi danymi.", "Otwórz Menedżer zadań → Szczegóły i odnajdź proces o zapisanym PID. Zapisz nazwę procesu oraz czy jest oczekiwany w Twojej VM.", "Na openSUSE wpisz sudo ss -tulpn. Odszukaj usługi nasłuchujące i zapisz nazwę usługi z własnej VM.", "Dla jednej potrzebnej usługi utwórz kartę: nazwa, protokół, port, klient dozwolony, reguła zapory i test.", "Jeśli usługa nie jest potrzebna do ćwiczenia, nie zatrzymuj jej w ciemno. Najpierw zapisz jej stan i zależności, a zmianę wykonuj tylko zgodnie z zadaniem."], ["Karta usługi zawiera protokół, port, proces i uzasadnienie.", "Uczeń potrafi wskazać różnicę między TCP i UDP.", "Nie wykonano zmian poza maszyną LAB."], "Wybierz usługę SSH lub HTTP z własnego LAB i przygotuj jej kartę ekspozycji. Zapisz, dlaczego dostęp nie powinien być otwarty „dla wszystkich”."),
        cyberLesson("c11-18-segmentacja-vlan-nat", "C.5.3. Segmentacja, VLAN i NAT", "Segmentacja ogranicza zasięg błędu i ułatwia kontrolę ruchu. W VirtualBox uczysz się jej przez oddzielne sieci wewnętrzne, bez ingerencji w szkolne przełączniki.", ["wyjaśnić cel VLAN i segmentacji", "odróżnić NAT od zapory", "utworzyć dwie izolowane sieci wirtualne"], ["VLAN logicznie rozdziela ruch w sieci przełączanej.", "NAT tłumaczy adresy i nie zastępuje świadomej polityki zapory.", "Sieć wewnętrzna VirtualBox daje izolowany segment do ćwiczeń."], ["Wyłącz wszystkie VM przed zmianą sieci. W VirtualBox wybierz WIN-LAB → Ustawienia → Sieć → Karta 1.", "Wybierz Sieć wewnętrzna i nazwij ją LAB-CLIENT. Do LINUX-LAB dodaj drugą kartę w sieci wewnętrznej LAB-SERVER tylko wtedy, gdy scenariusz nauczyciela wymaga dwóch segmentów.", "Nie ustawiaj trybu Mostkowana do ćwiczenia segmentacji. Mostek może połączyć VM z fizyczną siecią i zmienić zakres testu.", "W notatce narysuj dwa segmenty, maszynę pośredniczącą i dozwolony przepływ. Oznacz, że każdy przepływ ma wymagać konkretnej usługi oraz reguły.", "Po uruchomieniu VM sprawdź adresy przez ipconfig /all albo ip addr. Testuj łączność tylko między maszynami, które mają być połączone w danym scenariuszu."], ["Schemat pokazuje co najmniej dwa logiczne segmenty.", "VM nie używają trybu Mostkowana do testu.", "Dla połączenia między segmentami zapisano usługę i uzasadnienie."], "Narysuj politykę „domyślnie brak dostępu”: klient może połączyć się do serwera tylko przez SSH albo HTTP wskazane w poleceniu. Nie konfiguruj routingu bez instrukcji nauczyciela."),
        cyberLesson("c11-19-dns-dhcp-i-zaufanie", "C.5.4. DNS, DHCP i zaufanie do konfiguracji", "DNS i DHCP są wygodne, ale błędna konfiguracja może skierować klienta do niewłaściwej usługi. Uczeń kontroluje, skąd pochodzi adres i odpowiedź DNS.", ["sprawdzić źródło konfiguracji IP", "zweryfikować rozwiązywanie nazwy", "rozpoznać nieoczekiwany serwer DNS"], ["DHCP automatycznie przekazuje adres i inne opcje klientowi.", "DNS tłumaczy nazwę na adres IP.", "Serwer DNS wskazany przez DHCP wpływa na to, gdzie klient szuka nazw."], ["Na Windows otwórz Wiersz polecenia i wpisz ipconfig /all. Zapisz adres IPv4, serwer DHCP i serwery DNS z własnej VM.", "Wpisz nslookup nazwa_testowa. W pierwszych liniach odczytaj, który serwer DNS udzielił odpowiedzi; nie testuj prywatnych nazw szkolnych poza zakresem ćwiczenia.", "Na Linuxie wpisz resolvectl status albo cat /etc/resolv.conf, zależnie od konfiguracji. Zapisz serwer DNS tylko dla interfejsu LAB.", "Porównaj odpowiedź DNS z planem laboratorium. Jeżeli adres lub serwer nie pasuje do planu, nie zmieniaj go losowo — sprawdź najpierw ustawienia karty i DHCP.", "W raporcie wpisz: host, IP, źródło adresu (statyczny/DHCP), DNS i wynik testu nazwy."], ["Raport wskazuje serwer DHCP lub świadome ustawienie statyczne.", "Uczeń potrafi odczytać serwer DNS z wyniku narzędzia.", "Nie zmieniono usługi DHCP poza LAB."], "Dla dwóch VM porównaj konfigurację IP i DNS. Wskaż jedną różnicę, która byłaby błędem bezpieczeństwa, np. nieznany serwer DNS."),
        cyberLesson("c11-20-wireshark-diagnostyka-lab", "C.5.5. Wireshark — obserwacja własnego ruchu LAB", "Wireshark służy do diagnostyki i analizy własnego ruchu. Zbieranie ruchu osób trzecich bez uprawnienia narusza zasady i prywatność, dlatego ćwiczysz na odizolowanej VM.", ["uruchomić przechwytywanie na interfejsie LAB", "zastosować prosty filtr wyświetlania", "zakończyć i opisać przechwycenie"], ["Przechwytywanie zapisuje pakiety widoczne na wybranym interfejsie.", "Filtr wyświetlania ukrywa niepotrzebne pakiety, ale nie zmienia pliku przechwycenia.", "Adres źródłowy i docelowy pomagają zrozumieć kierunek ruchu."], ["Uruchom Wireshark wyłącznie na VM lub interfejsie LAB wskazanym przez nauczyciela. Wybierz interfejs o adresie z planu LAB-INF11, a nie kartę fizycznej sieci szkoły.", "Kliknij płetwę rekina Start capturing packets. Z drugiej maszyny LAB wykonaj jeden dozwolony ping do hosta testowego.", "W polu filtra wpisz icmp i naciśnij Enter. Odszukaj pakiet Echo request oraz Echo reply i porównaj adres źródłowy z docelowym.", "Zatrzymaj przechwytywanie czerwonym przyciskiem Stop. Nie zapisuj pliku pcap z danymi, których nie potrzebujesz; do ćwiczenia wystarczy krótki, własny ruch testowy.", "W notatce zapisz czas, interfejs, filtr, adres źródłowy, cel i wynik. Nie opisuj pakietu jako ataku bez dodatkowych dowodów."], ["Przechwycenie dotyczy tylko interfejsu LAB.", "Widoczne są pakiety żądania i odpowiedzi ICMP.", "Raport zawiera filtr i kierunek ruchu."], "Wykonaj krótki capture własnego ping w LAB i narysuj drogę pakietu: klient → serwer → klient. Dołącz tylko niezbędny zrzut ekranu."),
      ],
    };

    const testing = {
      id: "cyber-inf11-network-testing", number: "C.6", audience: "inf11",
      title: "INF.11 — testowanie bezpieczeństwa sieci", displayTitle: "INF.11 — testowanie sieci TCP/IP w LAB", navTitle: "INF.11 - testowanie sieci", leadBlocks: [],
      units: [
        cyberLesson("c11-21-zakres-i-inwentaryzacja", "C.6.1. Zakres testu i inwentaryzacja", "Test bezpieczeństwa ma zawsze właściciela, zakres, czas i cel. Najpierw tworzysz listę własnych hostów oraz oczekiwanych usług — to punkt odniesienia dla każdego wyniku.", ["spisać dozwolone hosty testowe", "określić oczekiwane usługi", "zdefiniować warunek przerwania testu"], ["Inwentaryzacja to lista zasobów objętych opieką.", "Zakres określa, co wolno testować i czego nie wolno dotykać.", "Warunek przerwania chroni usługę, gdy test powoduje problem."], ["W notatce wpisz zakres: tylko adresy własnych VM w LAB-INF11. Dodaj datę, osobę prowadzącą ćwiczenie i zgodę nauczyciela.", "Dla każdej VM wpisz nazwę, IP, system i oczekiwaną usługę, np. LINUX-LAB, 192.168.56.20, openSUSE, SSH.", "Dodaj listę usług, które celowo nie powinny być dostępne. Przykład: na stacji klienta nie oczekujesz serwera FTP.", "Ustal warunek przerwania: jeśli VM przestaje odpowiadać, kończysz test, zapisujesz czas i przywracasz migawkę tylko po uzgodnieniu.", "Nie uruchamiaj skanowania, dopóki tabela nie zawiera wszystkich adresów dozwolonych i nauczyciel nie potwierdzi zakresu."], ["Tabela zakresu ma hosty, usługi dozwolone i niedozwolone.", "Zakres nie zawiera urządzeń spoza LAB.", "Zapisano warunek przerwania testu."], "Przygotuj inwentarz trzech VM oraz listę po jednej oczekiwanej i nieoczekiwanej usłudze dla każdej."),
        cyberLesson("c11-22-nmap-tylko-lab", "C.6.2. Nmap — inwentaryzacja własnego LAB", "Nmap jest narzędziem do rozpoznania aktywnych hostów i usług. Używaj go wyłącznie na adresach zapisanych w zatwierdzonym zakresie laboratoryjnym.", ["sprawdzić, czy Nmap działa", "wykonać ograniczony test hostów LAB", "porównać wynik ze swoją inwentaryzacją"], ["Skan hostów odpowiada na pytanie, które dozwolone maszyny są aktywne.", "Skan usługi pomaga porównać stan faktyczny z oczekiwanym.", "Wynik skanu nie daje zgody na dalsze działania poza zakresem."], ["W Terminalu openSUSE wpisz nmap --version. Jeżeli polecenie nie istnieje, poproś nauczyciela o instalację z zatwierdzonego repozytorium; nie pobieraj programu z losowej strony.", "Otwórz swoją tabelę zakresu i wybierz jeden dozwolony adres, np. 192.168.56.20. Upewnij się, że adres należy do Twojej VM LAB.", "Wpisz nmap -sn 192.168.56.20. To ograniczony test osiągalności pojedynczego hosta; nie zamieniaj adresu na zakres szkolnej sieci.", "Jeżeli nauczyciel zezwolił na sprawdzenie usługi, wpisz nmap -sV 192.168.56.20 tylko dla tego jednego hosta. Porównaj wykrytą usługę z własną tabelą oczekiwanych usług.", "Zapisz czas, cel, użyte polecenie, wynik oraz decyzję: zgodne, do poprawy albo wymaga weryfikacji. Nie uruchamiaj prób logowania, exploitów ani testów obciążeniowych."], ["Cel skanu jest pojedynczym, dozwolonym hostem LAB.", "Wynik porównano z inwentarzem usług.", "Raport nie zawiera działań wykraczających poza inwentaryzację."], "Wykonaj ograniczone sprawdzenie jednego własnego hosta i przygotuj porównanie „oczekiwano / wykryto / następny krok”.", "# tylko dla własnej maszyny zapisanej w zakresie LAB\nnmap -sn 192.168.56.20\n# wariant po wyraźnej zgodzie nauczyciela\nnmap -sV 192.168.56.20"),
        cyberLesson("c11-23-zapora-i-dostep-z-dozwolonego-hosta", "C.6.3. Weryfikacja zapory i dostępu", "Celem testu zapory jest sprawdzenie polityki: dozwolony klient ma dostęp do dozwolonej usługi, a niepotrzebny dostęp pozostaje zablokowany. Nie wyłącza się zapory „na próbę”.", ["utworzyć test oczekiwany i negatywny", "sprawdzić usługę z klienta LAB", "udokumentować wynik dozwolony albo zablokowany"], ["Test pozytywny sprawdza dozwoloną komunikację.", "Test negatywny sprawdza, czy zakaz rzeczywiście działa.", "Polityka domyślnej odmowy oznacza otwieranie tylko koniecznych usług."], ["W tabeli zakresu wybierz jedną usługę, np. SSH z WIN-LAB do LINUX-LAB. Zapisz IP klienta, IP serwera, port i oczekiwany wynik.", "Na serwerze sprawdź stan usługi: sudo systemctl status sshd. W drugim oknie pozostaw bieżącą sesję administracyjną, aby nie odciąć sobie dostępu po zmianie reguły.", "Na kliencie LAB wykonaj tylko dozwolony test połączenia SSH do serwera. Zapisz, czy połączenie dochodzi do ekranu logowania, nie wpisuj cudzych danych.", "Dla testu negatywnego wybierz usługę, której nie uruchamiałeś, lub host, który nie ma mieć dostępu zgodnie z planem. Zapisz oczekiwane zablokowanie, nie próbuj go obchodzić.", "Na serwerze sprawdź log zapory albo dziennik usługi i zapisz czas testu. Jeśli wynik jest inny niż polityka, oznacz go „do poprawy” i nie rób serii losowych zmian."], ["Test pozytywny i negatywny mają określony oczekiwany wynik.", "Zapora pozostaje włączona podczas testu.", "Raport pokazuje czas, klient, serwer, usługę i status."], "Wykonaj dwa testy dla jednej usługi: dozwolony i zablokowany. W raporcie wyjaśnij, dlaczego oba wyniki są potrzebne."),
        cyberLesson("c11-24-podatnosc-ocena-i-priorytet", "C.6.4. Podatność, ocena i priorytet", "Wykryty otwarty port nie jest automatycznie podatnością. Uczeń uczy się rozdzielać obserwację, możliwy problem oraz rekomendację do zweryfikowania.", ["rozróżnić ekspozycję, podatność i ryzyko", "ocenić wynik w prostej skali", "zapisać bezpieczną rekomendację"], ["Ekspozycja oznacza widoczną usługę lub port.", "Podatność to słabość, którą można wykorzystać w określonych warunkach.", "Ryzyko uwzględnia także znaczenie zasobu oraz istniejące zabezpieczenia."], ["Weź wynik własnego skanu LAB i wybierz jedną usługę oczekiwaną, np. SSH. Wpisz obserwację bez interpretacji: „port 22 wykryty na LINUX-LAB”.", "Sprawdź inwentarz. Jeżeli SSH było oczekiwane, nie zapisuj go jako błąd; opisz warunek bezpiecznego użycia, np. dostęp tylko z LAB i konto zwykłe.", "Dla nieoczekiwanej usługi wpisz „wymaga weryfikacji”. Sprawdź najpierw stan usługi, właściciela procesu, uzasadnienie biznesowe i regułę zapory.", "Oceń priorytet w skali niskie, średnie, wysokie, krytyczne. Uzasadnij skutkiem, prawdopodobieństwem i ekspozycją, nie tylko nazwą usługi.", "Zaproponuj jedną odwracalną poprawę: ograniczenie źródła w zaporze, zatrzymanie niepotrzebnej usługi po sprawdzeniu zależności lub aktualizacja z zaufanego repozytorium."], ["Raport oddziela fakt od oceny.", "Priorytet ma krótkie uzasadnienie.", "Rekomendacja zawiera metodę weryfikacji po zmianie."], "Przygotuj kartę dla jednej usługi LAB: obserwacja, oczekiwany stan, ryzyko, priorytet, rekomendacja i test po poprawie."),
        cyberLesson("c11-25-logi-syslog-i-alert", "C.6.5. Logi sieciowe, syslog i alert", "Logi umożliwiają połączenie zdarzeń z różnych maszyn. Na tym etapie uczysz się, jakie pola są potrzebne do analizy i jak rozpoznać prosty, nietypowy wzorzec.", ["odczytać lokalny log usługi", "zidentyfikować czas, źródło, cel i status", "przygotować prostą regułę obserwacji"], ["Syslog jest standardem przekazywania komunikatów dziennika.", "Alert to sygnał wymagający sprawdzenia, nie automatyczny dowód włamania.", "Korelacja łączy wpisy według czasu, hosta, IP lub identyfikatora."], ["Na openSUSE wpisz sudo journalctl -u sshd --since today. Odszukaj jeden wpis z własnego testu SSH i zapisz czas oraz wynik.", "Na Windows otwórz Podgląd zdarzeń → Dzienniki systemu Windows → Zabezpieczenia, jeśli nauczyciel włączył właściwy audyt. Zapisz tylko identyfikator, czas i ogólny status wpisu testowego.", "W tabeli dodaj kolumny: czas, host, źródło, cel, port/usługa, status i następny krok.", "Zaproponuj prostą regułę obserwacji: „trzy lub więcej nieudanych logowań do konta testowego w krótkim czasie wymaga sprawdzenia”. Nie generuj takich prób samodzielnie na prawdziwych kontach.", "Zapisz, jakie dodatkowe dane byłyby potrzebne przed uznaniem alertu za incydent, np. kontekst użytkownika i zmiany administracyjne."], ["Tabela zawiera czas, host i status.", "Alert jest opisany jako sygnał do weryfikacji.", "Uczeń umie wskazać dane potrzebne do korelacji."], "Utwórz tabelę z dwoma fikcyjnymi wpisami i jednym wpisem z własnego testu LAB. Zaproponuj jeden alert, ale nie nazywaj go jeszcze potwierdzonym incydentem."),
        cyberLesson("c11-26-raport-testu-i-eskalacja", "C.6.6. Raport testu i eskalacja", "Ostatnim krokiem nie jest „znalezienie problemu”, tylko czytelne przekazanie informacji osobie, która może bezpiecznie podjąć decyzję. Raport ma być konkretny i nie zawierać sekretów.", ["sporządzić raport testu sieci", "ocenić potrzebę eskalacji", "odróżnić zalecenie od samodzielnej zmiany produkcyjnej"], ["Dowód to sprawdzalny wynik: czas, komenda, host, status i zrzut ograniczony do potrzeb.", "Eskalacja przekazuje problem wraz z informacją potrzebną do bezpiecznej decyzji.", "Remediacja to poprawa, po której wykonuje się ponowny test."], ["Otwórz szablon raportu i wpisz zakres: nazwy własnych VM, datę, osobę testującą oraz zgodę nauczyciela.", "Dla każdego wyniku zapisz: cel testu, użyte narzędzie lub ekran, wynik oczekiwany, wynik rzeczywisty i dowód. Nie wpisuj haseł, tokenów ani pełnego pliku pcap.", "Jeśli znajdziesz rozbieżność, wpisz priorytet i propozycję odwracalnej poprawy. Nie wykonuj zmiany w infrastrukturze szkolnej — zgłoś ją nauczycielowi lub administratorowi.", "Po poprawie wykonaj ten sam, ograniczony test ponownie. W raporcie pokaż stan przed i po, aby odbiorca widział rezultat.", "Na końcu wpisz decyzję: zamknięte po weryfikacji, wymaga dalszej analizy albo przekazano do eskalacji."], ["Raport ma zakres, czas, wynik i dowód.", "Każda rekomendacja ma test weryfikacyjny.", "Raport nie zawiera sekretów ani działań poza LAB."], "Przygotuj końcowy raport z jednego własnego testu usługi w LAB. Użyj maksymalnie jednej strony i dodaj osobną sekcję „czego nie testowano”."),
      ],
    };

    const currentIndex = courseData.modules.findIndex(module => module.id === "cyber-inf11");
    const insertionIndex = currentIndex < 0 ? courseData.modules.length : currentIndex;
    courseData.modules.splice(insertionIndex, 0, foundations, python, databases);
    const systemIndex = courseData.modules.findIndex(module => module.id === "cyber-inf11");
    courseData.modules.splice(systemIndex + 1, 0, networking, testing);
  }

  appendFullInf11Programme(course);

  function integrateInf11IntoCourse(courseData) {
    const cyberModules = courseData.modules.filter(module => module.id.startsWith("cyber-inf11"));
    const cyberUnits = new Map(cyberModules.flatMap(module => module.units).map(unit => [unit.id, unit]));
    const placed = new Set();
    const addToModule = (moduleId, unitIds) => {
      const target = courseData.modules.find(module => module.id === moduleId);
      if (!target) return;
      const additions = unitIds.map(id => cyberUnits.get(id)).filter(Boolean);
      additions.forEach(unit => placed.add(unit.id));
      target.units.push(...additions);
    };

    // Każdy temat INF.11 trafia obok zagadnienia, z którym uczeń pracuje w praktyce.
    addToModule("modul-1", [
      "c-1-bezpieczne-laboratorium-i-etyka-testow",
      "c11-1-cia-zakres-i-ryzyko",
      "c11-2-zagrozenia-i-socjotechnika",
      "c11-16-adresacja-cidr-i-plan",
      "c11-18-segmentacja-vlan-nat",
    ]);
    addToModule("modul-2", [
      "c-2-windows-bezpieczna-konfiguracja-poczatkowa",
      "c-3-windows-konta-uprzywilejowane-i-audyt",
    ]);
    addToModule("modul-3", [
      "c11-4-kryptografia-skrót-i-certyfikat",
      "c11-17-protokoly-porty-i-uslugi",
      "c11-20-wireshark-diagnostyka-lab",
    ]);
    addToModule("modul-4", [
      "c-7-logi-i-audyt-systemu",
      "c-8-kopia-zapasowa-i-odtwarzanie",
    ]);
    addToModule("modul-5", ["c11-3-tozsamosc-mfa-i-rbac"]);
    addToModule("modul-6", ["c11-19-dns-dhcp-i-zaufanie"]);
    addToModule("modul-7", [
      "c-4-linux-utwardzanie-kont-i-aktualizacji",
      "c-5-linux-bezpieczny-ssh",
    ]);
    addToModule("modul-8", [
      "c-6-zapora-i-segmentacja-lab",
      "c11-21-zakres-i-inwentaryzacja",
      "c11-22-nmap-tylko-lab",
      "c11-23-zapora-i-dostep-z-dozwolonego-hosta",
      "c11-25-logi-syslog-i-alert",
    ]);
    addToModule("modul-9", [
      "c-9-reagowanie-na-incydent-w-lab",
      "c-10-raport-kontroli-bezpieczenstwa",
      "c11-24-podatnosc-ocena-i-priorytet",
      "c11-26-raport-testu-i-eskalacja",
    ]);

    // Kurs obejmuje tylko systemy, usługi i sieci. Python oraz bazy danych są poza jego zakresem.
    const outsideSystemsScope = new Set([
      "c11-6-python-srodowisko",
      "c11-7-python-walidacja-danych",
      "c11-8-python-logi-csv",
      "c11-9-python-json-i-raport",
      "c11-10-python-testy-i-zaleznosci",
      "c11-11-model-danych-i-klasyfikacja",
      "c11-12-sqlite-role-i-uprawnienia",
      "c11-13-sql-parametry-i-walidacja",
      "c11-13-parametryzacja-i-walidacja",
      "c11-14-backup-i-odtwarzanie-bazy",
      "c11-14-kopia-i-odtworzenie-bazy",
      "c11-15-audyt-danych-i-sekrety",
    ]);
    // Zabezpieczenie na przyszłość: nowy temat systemowy INF.11 nie może zniknąć z kursu.
    const remaining = [...cyberUnits.values()].filter(unit => !placed.has(unit.id) && !outsideSystemsScope.has(unit.id));
    const integrationModule = courseData.modules.find(module => module.id === "modul-9");
    if (remaining.length && integrationModule) integrationModule.units.push(...remaining);

    courseData.modules = courseData.modules.filter(module => !module.id.startsWith("cyber-inf11"));
    courseData.modules.flatMap(module => module.units).forEach(unit => {
      unit.title = unit.title.replace(/^C\.(?:\d+\.)?\d+\.\s*/, "");
    });

    const start = courseData.modules.find(module => module.id === "start");
    const inf11Start = start?.units.find(unit => unit.id === "c-0-start-inf11");
    if (inf11Start) inf11Start.title = "Jak korzystać z materiałów INF.11";

    // Podstawy sieci są ważne dla obu kierunków, dlatego są widoczne także dla technika informatyka.
    [
      "c11-16-adresacja-cidr-i-plan",
      "c11-17-protokoly-porty-i-uslugi",
      "c11-18-segmentacja-vlan-nat",
      "c11-19-dns-dhcp-i-zaufanie",
      "c11-20-wireshark-diagnostyka-lab",
    ].forEach(id => {
      const unit = courseData.modules.flatMap(module => module.units).find(item => item.id === id);
      if (!unit) return;
      unit.audience = "both";
      unit.blocks.forEach(block => { block.audience = "both"; });
    });

    const labels = {
      "modul-1": ["Część 1. Podstawy, bezpieczeństwo i VirtualBox", "Podstawy, bezpieczeństwo i VirtualBox"],
      "modul-2": ["Część 2. Windows 11 – administracja i bezpieczeństwo", "Windows 11 - administracja i bezpieczeństwo"],
      "modul-3": ["Część 3. Windows 11 – dyski, sieć i ochrona", "Windows 11 - dyski, sieć i ochrona"],
      "modul-4": ["Część 4. Windows Server – fundamenty i monitoring", "Windows Server - fundamenty i monitoring"],
      "modul-5": ["Część 5. Windows Server – Active Directory i tożsamość", "Windows Server - Active Directory i tożsamość"],
      "modul-6": ["Część 6. Windows Server – usługi i bezpieczna konfiguracja", "Windows Server - usługi i bezpieczna konfiguracja"],
      "modul-7": ["Część 7. openSUSE – administracja i bezpieczeństwo", "openSUSE - administracja i bezpieczeństwo"],
      "modul-8": ["Część 8. openSUSE – sieć, usługi i testy LAB", "openSUSE - sieć, usługi i testy LAB"],
      "modul-9": ["Część 9. Integracja i bezpieczeństwo", "Integracja i bezpieczeństwo"],
    };
    Object.entries(labels).forEach(([id, [title, navTitle]]) => {
      const module = courseData.modules.find(item => item.id === id);
      if (!module) return;
      module.title = title;
      module.displayTitle = title;
      module.navTitle = navTitle;
    });
  }

  integrateInf11IntoCourse(course);
  let selectedProfile = ["inf02", "inf11", "all"].includes(localStorage.getItem(profileKey)) ? localStorage.getItem(profileKey) : "all";

  const allUnits = course.modules.flatMap(module => module.units.map((unit, index) => ({ ...unit, module, index })));
  const unitById = new Map(allUnits.map(unit => [unit.id, unit]));
  const moduleById = new Map(course.modules.map(module => [module.id, module]));
  let cookieChoice = getCookie(consentCookie) || localStorage.getItem(consentFallbackKey);
  const legacyProgress = safeParse(localStorage.getItem(storageKey), null);
  const saved = cookieChoice === "accepted"
    ? safeParse(getCookie(progressCookie) || localStorage.getItem(storageKey), { done: [], moduleId: "start" })
    : safeParse(sessionStorage.getItem(storageKey), legacyProgress || { done: [], moduleId: "start" });
  localStorage.removeItem(storageKey);
  const state = {
    moduleId: moduleById.has(saved.moduleId) ? saved.moduleId : "start",
    done: new Set(saved.done || []),
    activeUnitId: null,
  };
  const expandedModuleIds = new Set([state.moduleId]);

  function safeParse(value, fallback) {
    try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
  }
  function getCookie(name) {
    const match = document.cookie.split("; ").find(entry => entry.startsWith(`${name}=`));
    if (!match) return null;
    try { return decodeURIComponent(match.split("=").slice(1).join("=")); } catch { return null; }
  }
  function setCookie(name, value, days = 365) {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
    return getCookie(name) === value;
  }
  function removeCookie(name) {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
  }
  function saveState() {
    const payload = JSON.stringify({ done: [...state.done], moduleId: state.moduleId });
    if (cookieChoice === "accepted") {
      const cookieSaved = setCookie(progressCookie, payload);
      if (!cookieSaved) localStorage.setItem(storageKey, payload);
    } else {
      sessionStorage.setItem(storageKey, payload);
    }
  }
  function chooseCookiePreference(choice) {
    cookieChoice = choice;
    if (!setCookie(consentCookie, choice)) localStorage.setItem(consentFallbackKey, choice);
    if (choice === "accepted") {
      saveState();
      showToast("Postęp będzie zapamiętany na tym urządzeniu.");
    } else {
      removeCookie(progressCookie);
      localStorage.removeItem(storageKey);
      sessionStorage.setItem(storageKey, JSON.stringify({ done: [...state.done], moduleId: state.moduleId }));
      showToast("Postęp pozostanie tylko do zamknięcia przeglądarki.");
    }
    $("#cookieBanner").hidden = true;
  }
  function initialiseCookieBanner() {
    $("#cookieBanner").hidden = Boolean(cookieChoice);
  }
  function blockCount(module, predicate) {
    const blocks = [...module.leadBlocks, ...visibleUnits(module).flatMap(unit => unit.blocks)].filter(visibleForProfile);
    return blocks.filter(predicate).length;
  }
  function moduleDone(module) {
    const units = visibleUnits(module);
    return units.length > 0 && units.every(unit => state.done.has(unit.id));
  }
  function updateModuleCompletionButton(module) {
    const button = $("#markModuleDone");
    const completed = moduleDone(module);
    button.innerHTML = completed
      ? "Cofnij ukończenie modułu <span>↶</span>"
      : "Ukończ moduł <span>✓</span>";
    button.setAttribute("aria-pressed", String(completed));
  }
  function previewFor(module) {
    const blocks = [...module.leadBlocks, ...visibleUnits(module).flatMap(unit => unit.blocks)].filter(visibleForProfile);
    const text = blocks.find(block => block.type === "paragraph" && block.style === null && compact(block.text));
    return text ? compact(text.text) : course.meta.description;
  }
  function saveTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(themeKey, theme);
  }
  function getTheme() {
    return localStorage.getItem(themeKey) || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  }

  function audienceOf(item) {
    return item?.audience || "both";
  }
  function visibleForProfile(item) {
    const audience = audienceOf(item);
    return selectedProfile === "all" || audience === "both" || audience === selectedProfile;
  }
  function visibleUnits(module) {
    return module.units.filter(visibleForProfile);
  }
  function visibleModules() {
    return course.modules.filter(module => visibleUnits(module).length);
  }
  function audienceBadge(audience = "both") {
    const meta = audienceMeta[audience] || audienceMeta.both;
    return `<span class="audience-badge audience-badge--${meta.className}" title="${escapeHTML(meta.label)}">${escapeHTML(meta.short)}</span>`;
  }
  function profileDescription() {
    if (selectedProfile === "inf02") return "Wyświetlam lekcje dla technika informatyka (I) oraz wspólny fundament systemów operacyjnych.";
    if (selectedProfile === "inf11") return "Wyświetlam materiały INF.11 z zakresu systemów, usług i sieci oraz wspólne fundamenty.";
    return "Widzisz materiał dla obu kierunków. Wybierz klasę, aby ukryć nieobowiązkowe lekcje i dodatki.";
  }
  function renderProfileSelector() {
    $$("[data-profile]").forEach(button => {
      const active = button.dataset.profile === selectedProfile;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    $("#profileHint").textContent = profileDescription();
  }

  function renderModuleNav() {
    const nav = $("#moduleNav");
    nav.innerHTML = visibleModules().map(module => {
      const active = module.id === state.moduleId;
      const done = moduleDone(module);
      const expanded = expandedModuleIds.has(module.id);
      const topics = visibleUnits(module).map((unit, index) => {
        const topicActive = active && unit.id === state.activeUnitId;
        const topicDone = state.done.has(unit.id);
        return `<button type="button" class="module-topic-button ${topicActive ? "is-current" : ""}" data-nav-unit="${escapeHTML(unit.id)}" aria-label="Otwórz temat: ${escapeHTML(unit.title)}">
          <span class="module-topic-number">${topicDone ? "✓" : String(index + 1).padStart(2, "0")}</span>
          <span class="module-topic-label">${escapeHTML(unit.title)} ${audienceBadge(audienceOf(unit))}</span>
        </button>`;
      }).join("");
      return `<section class="module-nav-group ${active ? "is-active" : ""} ${expanded ? "is-expanded" : ""}">
        <button type="button" class="module-button ${active ? "is-active" : ""}" data-toggle-module="${escapeHTML(module.id)}" aria-expanded="${expanded}" aria-controls="topics-${escapeHTML(module.id)}" aria-label="${expanded ? "Zwiń" : "Rozwiń"} tematy modułu: ${escapeHTML(module.navTitle)}">
          <span class="module-num">${escapeHTML(module.number)}</span>
          <span class="module-label">${escapeHTML(module.navTitle)}</span>
          <span class="module-done">${done ? "✓" : ""}</span>
          <span class="module-expand" aria-hidden="true">⌄</span>
        </button>
        <div class="module-topic-list" id="topics-${escapeHTML(module.id)}" aria-label="Tematy: ${escapeHTML(module.navTitle)}" ${expanded ? "" : "hidden"}>${topics}</div>
      </section>`;
    }).join("");
  }

  function renderBlock(block) {
    if (!block) return "";
    if (block.type === "table") return renderTable(block.rows);

    const text = compact(block.text);
    let content = "";
    if (text) {
      if (block.style === "Kod") content = `<pre class="code-block"><code>${escapeHTML(block.text)}</code></pre>`;
      else if (block.style === "Ćwiczenie") content = `<article class="practice-card"><header>ĆWICZENIE PRAKTYCZNE</header><p>${escapeHTML(block.text)}</p></article>`;
      else if (["Uwaga", "Ważne", "Wskazówka", "Sukces"].includes(block.style)) content = renderCallout(block);
      else if (block.style === "Caption") content = `<p class="caption">${escapeHTML(block.text)}</p>`;
      else if (block.style === "Heading1") content = `<h3 class="lead-heading">${escapeHTML(block.text)}</h3>`;
      else content = `<p class="plain-paragraph">${escapeHTML(block.text)}</p>`;
    }

    if (Array.isArray(block.images) && block.images.length) {
      const figures = block.images.map((source, index) => {
        const image = course.media[source];
        if (!image) return "";
        return `<figure class="source-figure"><img src="${image.data}" alt="Ilustracja z podręcznika: ${escapeHTML(block.text || "materiał poglądowy")}" loading="lazy"><figcaption>Materiał poglądowy z podręcznika${block.images.length > 1 ? ` · ${index + 1}` : ""}</figcaption></figure>`;
      }).join("");
      content += figures;
    }
    return content;
  }

  function renderCallout(block) {
    const map = {
      "Uwaga": ["callout-note", "i"],
      "Ważne": ["callout-important", "!"],
      "Wskazówka": ["callout-tip", "↗"],
      "Sukces": ["callout-success", "✓"],
    };
    const [kind, icon] = map[block.style];
    return `<aside class="callout ${kind}"><span class="callout-icon" aria-hidden="true">${icon}</span><p>${escapeHTML(block.text)}</p></aside>`;
  }

  function renderTable(rows = []) {
    if (!rows.length) return "";
    const [first, ...rest] = rows;
    const header = `<thead><tr>${first.map(cell => `<th scope="col">${escapeHTML(cell)}</th>`).join("")}</tr></thead>`;
    const body = rest.length ? `<tbody>${rest.map(row => `<tr>${row.map(cell => `<td>${escapeHTML(cell)}</td>`).join("")}</tr>`).join("")}</tbody>` : "";
    return `<div class="data-table-wrap"><table class="data-table">${header}${body}</table></div>`;
  }

  function splitSections(blocks) {
    const groups = [];
    let current = { label: "", blocks: [], audience: "both" };
    blocks.forEach(block => {
      if (block.style === "Heading3") {
        if (current.blocks.length || current.label) groups.push(current);
        current = { label: compact(block.text), blocks: [], audience: audienceOf(block) };
      } else current.blocks.push(block);
    });
    if (current.blocks.length || current.label) groups.push(current);
    return groups;
  }

  function sectionType(label) {
    const normalized = label.toLocaleLowerCase("pl");
    if (normalized.includes("po tej lekcji")) return "outcomes";
    if (normalized.includes("konfiguracja krok po kroku")) return "steps";
    if (normalized.includes("sprawdzenie poprawności") || normalized.includes("lista kontrolna")) return "checks";
    if (normalized.includes("najczęstsze problemy")) return "problems";
    if (normalized.includes("zadanie praktyczne")) return "challenge";
    if (normalized.includes("pytania kontrolne")) return "questions";
    return "standard";
  }

  function guideForUnit(unit) {
    const title = unit.title.toLocaleLowerCase("pl");
    const guides = [
      {
        match: "serwer dhcp",
        text: "Zacznij od odnalezienia konsoli DHCP. Potem tworzysz „pudełko” z adresami, z którego komputery będą brały swoje numery IP.",
        path: ["Menedżer serwera", "Narzędzia", "DHCP", "nazwa serwera", "IPv4", "prawy przycisk: Nowy zakres…"],
      },
      {
        match: "dhcp w linuxie",
        text: "Tutaj większość pracy odbywa się w Terminalu. Wklejaj polecenia po jednym, a po każdym sprawdź, czy nie pojawił się komunikat o błędzie.",
        path: ["Terminal", "instalacja pakietu", "plik konfiguracji DHCP", "zapisz plik", "uruchom usługę", "sprawdź log"],
      },
      {
        match: "serwer dns",
        text: "Najpierw otwórz miejsce, w którym Windows przechowuje nazwy komputerów. Strefa to po prostu lista nazw i odpowiadających im adresów IP.",
        path: ["Menedżer serwera", "Narzędzia", "DNS", "serwer", "Strefy wyszukiwania do przodu", "Nowa strefa / Nowy rekord"],
      },
      {
        match: "promowanie serwera",
        text: "Po instalacji roli klikniesz małą flagę z powiadomieniem. To ona prowadzi do kreatora, który zamienia zwykły serwer w kontroler domeny.",
        path: ["Menedżer serwera", "flaga powiadomień", "Promuj ten serwer", "Dodaj nowy las", "Dalej", "Zainstaluj"],
      },
      {
        match: "ad ds",
        text: "To przygotowanie do domeny. Najpierw dodaj rolę AD DS — jest jak dołożenie do serwera narzędzi do prowadzenia szkolnej listy użytkowników i komputerów.",
        path: ["Menedżer serwera", "Zarządzaj", "Dodaj role i funkcje", "Usługi domenowe Active Directory", "Dalej", "Zainstaluj"],
      },
      {
        match: "dołączanie windows 11 do domeny",
        text: "Najpierw sprawdź, czy komputer ma jako DNS adres serwera domeny. Dopiero później dołączaj go do domeny — inaczej Windows nie odnajdzie serwera.",
        path: ["Ustawienia", "System", "Informacje", "Zmień nazwę tego komputera (zaawansowane)", "Zmień", "Domena"],
      },
      {
        match: "lokalne konta i grupy",
        text: "Najpierw otwórz listę użytkowników. Tworzysz konto, nadajesz mu nazwę i hasło, a na końcu sprawdzasz, czy pojawiło się na liście.",
        path: ["Start", "Zarządzanie komputerem", "Użytkownicy i grupy lokalne", "Użytkownicy", "prawy przycisk: Nowy użytkownik…"],
      },
      {
        match: "konfiguracja karty sieciowej",
        text: "Klikaj powoli. Adres IP, maska, brama i DNS to cztery pola, które mają mówić komputerowi, gdzie jest i jak znaleźć inne urządzenia.",
        path: ["Ustawienia", "Sieć i Internet", "Zaawansowane ustawienia sieci", "Więcej opcji karty", "Właściwości IPv4"],
      },
      {
        match: "zarządzanie dyskami",
        text: "Najpierw odszukaj czarny albo nieprzydzielony kawałek dysku. Kliknij go prawym przyciskiem i pozwól kreatorowi przeprowadzić Cię przez tworzenie woluminu.",
        path: ["Start", "Zarządzanie dyskami", "nieprzydzielone miejsce", "prawy przycisk", "Nowy wolumin prosty…"],
      },
      {
        match: "udostępnianie folderu",
        text: "Folder jest jak szafka. Najpierw wybierasz szafkę, potem decydujesz, komu wolno ją otworzyć, a na końcu sprawdzasz to z drugiego komputera.",
        path: ["Eksplorator plików", "folder", "Właściwości", "Udostępnianie", "Udostępnianie zaawansowane", "Uprawnienia"],
      },
      {
        match: "instalacja virtualboxa",
        text: "Maszyna wirtualna jest jak komputer w komputerze. Kreator poprosi tylko o nazwę, pamięć RAM, dysk i plik z systemem — nie zmieniaj wielu rzeczy naraz.",
        path: ["VirtualBox", "Nowa", "nazwa i system", "pamięć RAM", "dysk wirtualny", "Utwórz"],
      },
      {
        match: "networkmanager",
        text: "W openSUSE możesz wybrać klikane narzędzie albo Terminal. Jeśli dopiero się uczysz, zacznij od Cockpitu — zobaczysz ustawienia w jednym miejscu.",
        path: ["Cockpit", "Networking", "interfejs sieciowy", "Edit", "IPv4", "Apply"],
      },
      {
        match: "apache2",
        text: "Najpierw instalujesz program serwera WWW, potem go uruchamiasz, a na końcu otwierasz stronę w przeglądarce. To najlepszy test, czy wszystko działa.",
        path: ["Terminal", "zypper install apache2", "systemctl enable --now apache2", "firewalld", "przeglądarka"],
      },
    ];
    return guides.find(guide => title.includes(guide.match)) || {
      text: "Spokojnie — zrób tylko jeden punkt na raz. Najpierw odszukaj wskazane narzędzie lub okno, wykonaj ustawienie, a dopiero później przejdź do kolejnego kroku.",
      path: ["znajdź narzędzie", "wykonaj jeden krok", "zapisz zmianę", "sprawdź rezultat"],
    };
  }

  function renderStepGuide(unit) {
    const guide = guideForUnit(unit);
    return `<aside class="step-guide"><h5>Jak pracować z tą instrukcją</h5><p>${escapeHTML(guide.text)}</p><div class="guide-path" aria-label="Ścieżka wykonania">${guide.path.map(part => `<span>${escapeHTML(part)}</span>`).join("")}</div></aside>`;
  }

  function dhcpWalkthrough() {
    return [
      ["Przygotuj bezpieczne laboratorium", "W VirtualBox sprawdź kartę sieciową serwera i klienta. Obie maszyny muszą być w sieci wewnętrznej LAB-INF02, a nie w trybie Mostkowanym. Dzięki temu serwer DHCP nie rozda adresów urządzeniom w szkolnej sieci."],
      ["Otwórz instalowanie ról", "Na Windows Server kliknij Start, uruchom Menedżer serwera, a potem w prawym górnym rogu wybierz Zarządzaj → Dodaj role i funkcje."],
      ["Dodaj rolę DHCP", "W kreatorze wybierz Instalacja oparta na rolach lub funkcjach, wskaż swój serwer, zaznacz DHCP Server i zaakceptuj dodanie narzędzi zarządzania. Klikaj Dalej, a na końcu Zainstaluj."],
      ["Dokończ konfigurację po instalacji", "Po zakończeniu instalacji kliknij małą flagę z powiadomieniem w Menedżerze serwera, a następnie Complete DHCP configuration. W kreatorze wybierz konto z uprawnieniami do domeny i zatwierdź autoryzację."],
      ["Wejdź do konsoli DHCP", "W Menedżerze serwera wybierz Narzędzia → DHCP. Rozwiń nazwę serwera, kliknij IPv4 prawym przyciskiem myszy i wybierz Nowy zakres…"],
      ["Utwórz pulę adresów", "Nazwij zakres LAB-INF02. W polach Start IP address i End IP address wpisz 192.168.50.100 oraz 192.168.50.150. Maska ma być 255.255.255.0, czyli /24."],
      ["Ustaw wykluczenia i czas dzierżawy", "Jeżeli jakiś adres ma należeć na stałe do serwera lub innego urządzenia, nie może trafić do puli DHCP. Dodaj go jako wykluczenie. Czas dzierżawy zostaw domyślny, chyba że polecenie podaje konkretną wartość."],
      ["Dodaj opcje zakresu", "W kreatorze ustaw DNS server jako 192.168.50.10 (opcja 006), a Domain Name jako szkola.test (opcja 015). Opcję 003 Router wpisuj tylko wtedy, gdy w laboratorium naprawdę działa router."],
      ["Aktywuj zakres i ustaw klienta", "Zakończ kreator z zaznaczoną opcją aktywacji zakresu. Na komputerze Windows 11 otwórz Właściwości IPv4 i wybierz automatyczne pobieranie adresu IP oraz DNS."],
      ["Sprawdź dzierżawę", "Na kliencie uruchom Wiersz polecenia jako zwykły użytkownik. Wpisz kolejno ipconfig /release, ipconfig /renew i ipconfig /all. Szukaj adresu z puli .100–.150 oraz DNS 192.168.50.10."],
      ["Utwórz rezerwację", "W konsoli DHCP wejdź w IPv4 → Scope → Address Leases, odszukaj klienta i skopiuj jego MAC. Potem kliknij Reservations prawym przyciskiem → New Reservation… i wpisz MAC oraz adres, np. 192.168.50.110. Odnów dzierżawę na kliencie, żeby sprawdzić rezultat."],
    ];
  }

  function clickHelpForStep(unit, stepText) {
    const title = unit.title.toLocaleLowerCase("pl");
    const text = `${title} ${stepText}`.toLocaleLowerCase("pl");
    if (/adres.*statycz|ipv4|karta sieciowa|dns|brama/.test(text)) {
      if (/opensuse|linux|networkmanager|nmcli/.test(text)) return "Otwórz menu aplikacji → System → Terminal, albo wejdź do Cockpitu i wybierz Networking. Kliknij kartę sieciową używaną w LAB, potem Edit → IPv4.";
      return "Kliknij Start → Ustawienia → Sieć i Internet → Zaawansowane ustawienia sieci → Więcej opcji karty sieciowej. Kliknij prawym przyciskiem kartę LAB → Właściwości → Internet Protocol Version 4 (TCP/IPv4) → Właściwości.";
    }
    if (/dhcp|zakres|dzierżaw|rezerwac/.test(text)) return "Otwórz Menedżer serwera → Narzędzia → DHCP. Rozwiń nazwę serwera i kliknij IPv4; do zakresu użyj prawego przycisku myszy na IPv4.";
    if (/dns|stref|rekord/.test(text)) return "Otwórz Menedżer serwera → Narzędzia → DNS. Rozwiń nazwę serwera; strefy i rekordy dodajesz prawym przyciskiem myszy w odpowiednim folderze.";
    if (/użytkownik|grup|hasł|konto/.test(text) && /windows/.test(text)) return "Kliknij Start i wpisz Zarządzanie komputerem. Otwórz wynik, rozwiń Użytkownicy i grupy lokalne, a potem kliknij Użytkownicy lub Grupy prawym przyciskiem myszy.";
    if (/domen|active directory|ad ds|jednostk/.test(text)) return "Na Windows Server otwórz Menedżer serwera. Do instalacji roli wybierz Zarządzaj → Dodaj role i funkcje; do kont i jednostek wybierz Narzędzia → Active Directory Users and Computers.";
    if (/dysk|partycj|wolumin|ntfs/.test(text) && /windows/.test(text)) return "Kliknij Start i wpisz Zarządzanie dyskami. W otwartym oknie odszukaj właściwy dysk; większość operacji zaczyna się po kliknięciu prawym przyciskiem na partycji lub nieprzydzielonym miejscu.";
    if (/udostępn|smb|folder/.test(text) && /windows/.test(text)) return "Otwórz Eksplorator plików i odszukaj wskazany folder. Kliknij go prawym przyciskiem → Właściwości; zakładki Udostępnianie i Zabezpieczenia prowadzą odpowiednio do udziału i praw NTFS.";
    if (/zapora|defender|firewall/.test(text)) return /opensuse|linux/.test(text)
      ? "Otwórz Terminal. Polecenia do firewalld wpisuj po jednym, a po każdym naciśnij Enter; aktualny stan sprawdzisz przez sudo firewall-cmd --get-active-zones."
      : "Kliknij Start i wpisz Zapora Windows Defender z zabezpieczeniami zaawansowanymi. Reguły przychodzące i wychodzące znajdziesz po lewej stronie okna.";
    if (/rola|funkcj|iis|ftp|wsus|wds|rras|serwer wydruku|serwer plików/.test(text)) return "Otwórz Menedżer serwera → Zarządzaj → Dodaj role i funkcje. Po instalacji narzędzie do roli znajdziesz w prawym górnym rogu pod Narzędzia.";
    if (/virtualbox|maszyn.*wirtual|migawk|klon/.test(text)) return "Otwórz VirtualBox Manager. Najpierw zaznacz maszynę po lewej stronie; przyciski Nowa, Ustawienia, Migawki i Klonuj są dostępne na górnym pasku albo po kliknięciu prawym przyciskiem na maszynie.";
    if (/zypper|pakiet|repozytor/.test(text)) return "Otwórz menu aplikacji → System → Terminal. Wpisuj pełne polecenie zypper, naciśnij Enter i przeczytaj pytanie o potwierdzenie; gdy pojawi się [y/n], wpisz y i Enter.";
    if (/systemctl|journalctl|usług|proces/.test(text)) return "Otwórz Terminal. Nazwę usługi wpisz na końcu polecenia, np. systemctl status apache2. Wynik czytaj od góry: active (running) oznacza, że usługa działa.";
    if (/plik|katalog|find|archiw|kompres/.test(text) && /opensuse|linux|bash|terminal/.test(text)) return "Otwórz Terminal. Zanim użyjesz polecenia zmieniającego lub usuwającego pliki, wpisz pwd i ls -la — zobaczysz, gdzie jesteś i jakie pliki znajdują się w katalogu.";
    if (/opensuse|linux|bash|terminal|cockpit/.test(text)) return "Otwórz menu aplikacji → System → Terminal. Jeżeli krok dotyczy Cockpitu, w przeglądarce otwórz adres serwera z portem 9090, zaloguj się i wybierz odpowiednią pozycję z lewego menu.";
    if (/windows server/.test(text)) return "Kliknij Start → Menedżer serwera. W tym programie Zarządzaj służy do instalacji ról, a Narzędzia otwierają konsolę konkretnej usługi.";
    return "Najpierw kliknij Start i wpisz nazwę narzędzia wymienioną w kroku. Otwórz wynik o tej samej nazwie; nie zmieniaj kilku ustawień naraz — po każdym kliknięciu sprawdź, czy widzisz opisane okno lub pole.";
  }

  function renderDetailedSteps(blocks, unit) {
    const title = unit.title.toLocaleLowerCase("pl");
    const isWindowsDhcp = title.includes("serwer dhcp");
    const plainSteps = blocks.filter(block => block.type === "paragraph" && !block.style && compact(block.text));
    const extraBlocks = blocks.filter(block => !(block.type === "paragraph" && !block.style && compact(block.text)));
    const steps = isWindowsDhcp
      ? dhcpWalkthrough()
      : plainSteps.map((block, index) => {
        const firstSentence = compact(block.text).split(/(?<=[.!?])\s/, 1)[0];
        const label = firstSentence.length > 76 ? `${firstSentence.slice(0, 73)}…` : firstSentence;
        return [`Krok ${index + 1}: ${label}`, block.text];
      });
    const visibleSteps = steps.map(([heading, text], index) => {
      const clickHelp = isWindowsDhcp ? "" : `<p class="detailed-step-help"><b>Gdzie kliknąć / co otworzyć:</b> ${escapeHTML(clickHelpForStep(unit, text))}</p>`;
      return `<article class="detailed-step"><span class="detailed-step-number">${String(index + 1).padStart(2, "0")}</span><div><h5>${escapeHTML(heading)}</h5>${clickHelp}<p class="detailed-step-action"><b>Co zrobić:</b> ${escapeHTML(text)}</p></div></article>`;
    }).join("");
    const retainedBlocks = isWindowsDhcp ? extraBlocks.map(renderBlock).join("") : extraBlocks.map(renderBlock).join("");
    return `<div class="detailed-steps">${visibleSteps}</div>${retainedBlocks}`;
  }

  function renderSections(blocks, unit) {
    const groups = splitSections(blocks.filter(visibleForProfile));
    return groups.map(group => {
      const type = sectionType(group.label);
      const inner = type === "steps" ? renderDetailedSteps(group.blocks, unit) : group.blocks.map(renderBlock).join("");
      if (!group.label) return `<div class="lesson-intro">${inner}</div>`;
      const guide = type === "steps" ? renderStepGuide(unit) : "";
      const sectionAudience = audienceOf(group);
      const badge = sectionAudience === "both" ? "" : audienceBadge(sectionAudience);
      return `<section class="lesson-section section-${type} section-audience-${sectionAudience}"><h4 class="section-label">${escapeHTML(group.label)}${badge}</h4>${guide}${inner}</section>`;
    }).join("");
  }

  function renderLead(module) {
    const container = $("#moduleLead");
    if (module.id !== "start") {
      container.innerHTML = "";
      return;
    }
    if (selectedProfile === "inf11") {
      container.innerHTML = `<div class="lead-block lead-block--cyber"><span class="eyebrow">MATERIAŁ INF.11 · SYSTEMY I SIECI</span><p>Ten widok pokazuje wspólny fundament systemów operacyjnych oraz lekcje oznaczone <b>C</b>. Dodatki cyberbezpieczeństwa dotyczą bezpiecznej konfiguracji, kont, aktualizacji, zapór, logów, kopii zapasowych i reakcji na incydent — wyłącznie w laboratorium.</p></div>`;
      return;
    }
    const output = [];
    let buffer = [];
    const flush = () => {
      if (buffer.length) output.push(`<div class="lead-block">${buffer.map(renderBlock).join("")}</div>`);
      buffer = [];
    };
    module.leadBlocks.filter(visibleForProfile).forEach(block => {
      if (block.style === "Heading1") {
        flush();
        if (compact(block.text) !== compact(module.title)) output.push(renderBlock(block));
      } else if (["Uwaga", "Ważne", "Wskazówka", "Sukces"].includes(block.style)) {
        flush(); output.push(renderBlock(block));
      } else buffer.push(block);
    });
    flush();
    container.innerHTML = output.join("");
  }

  function renderLessons(module, focusUnitId) {
    const firstOpen = focusUnitId || state.activeUnitId;
    const grid = $("#lessonGrid");
    grid.innerHTML = visibleUnits(module).map((unit, index) => {
      const done = state.done.has(unit.id);
      const opened = unit.id === firstOpen;
      return `<details class="lesson-card ${done ? "is-done" : ""} ${opened ? "is-open" : ""}" id="${escapeHTML(unit.id)}" data-unit="${escapeHTML(unit.id)}" ${opened ? "open" : ""}>
        <summary>
          <span class="lesson-number">${done ? "✓" : String(index + 1).padStart(2, "0")}</span>
          <span class="lesson-title"><small>LEKCJA ${String(index + 1).padStart(2, "0")} ${audienceBadge(audienceOf(unit))}</small><h3>${escapeHTML(unit.title)}</h3></span>
          <span class="lesson-toggle" aria-hidden="true">+</span>
        </summary>
        <div class="lesson-content">
          ${renderSections(unit.blocks, unit)}
          <div class="lesson-footer"><span>LEKCJA / ${escapeHTML(module.number)}.${String(index + 1).padStart(2, "0")}</span><button class="complete-button ${done ? "is-done" : ""}" data-complete="${escapeHTML(unit.id)}">${done ? "✓ Lekcja ukończona" : "Oznacz jako zrobione"}</button></div>
        </div>
      </details>`;
    }).join("");
    $$(".lesson-card", grid).forEach(card => {
      card.addEventListener("toggle", () => {
        card.classList.toggle("is-open", card.open);
        if (card.open) {
          state.activeUnitId = card.dataset.unit;
        }
      });
    });
  }

  function renderHero(module) {
    const moduleOrder = visibleModules().indexOf(module);
    const units = visibleUnits(module);
    const exercises = blockCount(module, block => block.style === "Ćwiczenie");
    $("#moduleIndex").textContent = module.number === "BONUS" ? "PAKIET DODATKOWY" : `MODUŁ ${module.number}`;
    $("#moduleLessonCount").textContent = `${units.length} LEKCJI`;
    $("#moduleTitle").textContent = module.title === "Start kursu" ? course.meta.title : (module.displayTitle || module.navTitle);
    $("#moduleSummary").textContent = module.id === "start" && selectedProfile === "inf11"
      ? "Materiały INF.11 są włączone do odpowiednich tematów Windows, Windows Server, openSUSE i sieci. Szukaj plakietki C przy lekcji albo sekcji — wszystkie ćwiczenia wykonuj wyłącznie w laboratorium."
      : previewFor(module);
    $("#breadcrumb").textContent = module.navTitle;
    $("#missionName").textContent = module.navTitle;
    $("#stageCounter").textContent = `${units.length} TEMATÓW // MODUŁ ${module.number}`;
    $("#heroData").innerHTML = `
      <div class="data-pod"><span>POZYCJA</span><b>${String(moduleOrder + 1).padStart(2, "0")} / ${String(visibleModules().length).padStart(2, "0")}</b></div>
      <div class="data-pod"><span>ĆWICZENIA</span><b>${String(exercises).padStart(2, "0")} ćwiczeń</b></div>`;
    updateModuleCompletionButton(module);
  }

  function updateProgress() {
    const relevantUnits = allUnits.filter(visibleForProfile);
    const total = relevantUnits.length;
    const done = relevantUnits.filter(unit => state.done.has(unit.id)).length;
    const percent = total ? Math.round(done / total * 100) : 0;
    $("#progressNumber").textContent = done;
    $("#lessonCount").textContent = total;
    $("#progressFill").style.width = `${percent}%`;
  }

  function setCurrentModule(moduleId, focusUnitId = null, scrollTop = true) {
    let module = moduleById.get(moduleId);
    if (!module || !visibleModules().includes(module)) module = visibleModules()[0];
    if (!module) return;
    state.moduleId = module.id;
    expandedModuleIds.clear();
    expandedModuleIds.add(module.id);
    state.activeUnitId = focusUnitId || null;
    saveState();
    renderModuleNav();
    renderHero(module);
    renderLead(module);
    renderLessons(module, focusUnitId);
    updateProgress();
    if (scrollTop) window.scrollTo({ top: 0, behavior: "smooth" });
    closeSidebar();
  }

  function jumpToUnit(unitId) {
    const unit = unitById.get(unitId);
    if (!unit) return;
    if (unit.module.id !== state.moduleId) {
      setCurrentModule(unit.module.id, unit.id, false);
      requestAnimationFrame(() => jumpToUnit(unit.id));
      return;
    }
    const card = document.getElementById(unit.id);
    if (!card) return;
    card.open = true;
    state.activeUnitId = unit.id;
    card.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleDone(unitId) {
    if (!unitById.has(unitId)) return;
    if (state.done.has(unitId)) state.done.delete(unitId);
    else state.done.add(unitId);
    saveState();
    const card = document.getElementById(unitId);
    if (card) {
      const done = state.done.has(unitId);
      card.classList.toggle("is-done", done);
      const button = $("[data-complete]", card);
      const number = $(".lesson-number", card);
      button.classList.toggle("is-done", done);
      button.textContent = done ? "✓ Lekcja ukończona" : "Oznacz jako zrobione";
      const unit = unitById.get(unitId);
      number.textContent = done ? "✓" : String(visibleUnits(unit.module).findIndex(item => item.id === unitId) + 1).padStart(2, "0");
    }
    renderModuleNav();
    updateProgress();
    updateModuleCompletionButton(unitById.get(unitId).module);
    showToast(state.done.has(unitId) ? "Lekcja zapisana w Twoim postępie." : "Lekcja wróciła do puli zadań.");
  }

  let toastTimer;
  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function openSidebar() { $("#sidebar").classList.add("is-open"); }
  function closeSidebar() { $("#sidebar").classList.remove("is-open"); }

  const searchIndex = allUnits.map(unit => ({
    moduleId: unit.module.id,
    unitId: unit.id,
    moduleNumber: unit.module.number,
    moduleTitle: unit.module.navTitle,
    title: unit.title,
    audience: audienceOf(unit),
    text: compact(unit.blocks.map(block => block.text || (block.rows || []).flat().join(" ")).join(" ")),
  }));
  function makeSnippet(text, query) {
    const index = text.toLocaleLowerCase("pl").indexOf(query.toLocaleLowerCase("pl"));
    const from = Math.max(0, index - 78);
    const to = Math.min(text.length, index + query.length + 112);
    const raw = `${from ? "…" : ""}${text.slice(from, to)}${to < text.length ? "…" : ""}`;
    const escaped = escapeHTML(raw);
    const pattern = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
    return escaped.replace(pattern, "<mark>$1</mark>");
  }
  function runSearch(value) {
    const query = compact(value);
    const results = $("#searchResults");
    const hint = $("#searchHint");
    if (query.length < 2) {
      hint.textContent = "Wpisz minimum 2 znaki, aby znaleźć temat lub fragment instrukcji.";
      results.innerHTML = "";
      return;
    }
    const matches = searchIndex.filter(visibleForProfile).map(item => {
      const titleHit = item.title.toLocaleLowerCase("pl").includes(query.toLocaleLowerCase("pl"));
      const textHit = item.text.toLocaleLowerCase("pl").includes(query.toLocaleLowerCase("pl"));
      return { item, score: (titleHit ? 10 : 0) + (textHit ? 1 : 0) };
    }).filter(result => result.score).sort((a, b) => b.score - a.score).slice(0, 18);
    hint.textContent = matches.length ? `Znaleziono ${matches.length}${matches.length === 18 ? "+" : ""} wyników.` : "Brak wyników — spróbuj krótszego lub bardziej ogólnego hasła.";
    results.innerHTML = matches.map(({ item }) => `<button class="result-button" data-result-module="${escapeHTML(item.moduleId)}" data-result-unit="${escapeHTML(item.unitId)}"><span class="result-id">${escapeHTML(item.moduleNumber)}</span><span><h3>${audienceBadge(item.audience)} ${escapeHTML(item.title)}</h3><p>${makeSnippet(item.text, query)}</p></span></button>`).join("");
  }
  function openSearch() {
    const dialog = $("#searchDialog");
    if (!dialog.open) dialog.showModal();
    setTimeout(() => $("#searchInput").focus(), 20);
  }
  function closeSearch() { $("#searchDialog").close(); }

  function bindEvents() {
    $("#moduleNav").addEventListener("click", event => {
      const toggle = event.target.closest("[data-toggle-module]");
      if (toggle) {
        const moduleId = toggle.dataset.toggleModule;
        if (expandedModuleIds.has(moduleId)) expandedModuleIds.delete(moduleId);
        else {
          expandedModuleIds.clear();
          expandedModuleIds.add(moduleId);
        }
        renderModuleNav();
        return;
      }
      const topic = event.target.closest("[data-nav-unit]");
      if (topic) {
        event.preventDefault();
        event.stopPropagation();
        jumpToUnit(topic.dataset.navUnit);
        return;
      }
    });
    $("#lessonGrid").addEventListener("click", event => {
      const button = event.target.closest("[data-complete]");
      if (button) { event.preventDefault(); event.stopPropagation(); toggleDone(button.dataset.complete); }
    });
    $("#openSidebar").addEventListener("click", openSidebar);
    $("#closeSidebar").addEventListener("click", closeSidebar);
    $("#openSearch").addEventListener("click", openSearch);
    $("#openSearchTop").addEventListener("click", openSearch);
    $("#closeSearch").addEventListener("click", closeSearch);
    $("#searchInput").addEventListener("input", event => runSearch(event.target.value));
    $("#searchResults").addEventListener("click", event => {
      const button = event.target.closest("[data-result-unit]");
      if (!button) return;
      closeSearch();
      setCurrentModule(button.dataset.resultModule, button.dataset.resultUnit, false);
      requestAnimationFrame(() => jumpToUnit(button.dataset.resultUnit));
    });
    $("#jumpToFirst").addEventListener("click", () => {
      const unit = visibleUnits(moduleById.get(state.moduleId) || { units: [] })[0];
      if (unit) jumpToUnit(unit.id);
      else $("#moduleLead").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    $("#markModuleDone").addEventListener("click", () => {
      const module = moduleById.get(state.moduleId);
      const completed = moduleDone(module);
      visibleUnits(module).forEach(unit => completed ? state.done.delete(unit.id) : state.done.add(unit.id));
      saveState(); renderModuleNav(); updateProgress(); renderLessons(module, state.activeUnitId);
      updateModuleCompletionButton(module);
      showToast(completed ? "Ukończenie modułu zostało cofnięte." : "Cały moduł oznaczony jako ukończony.");
    });
    $("#modeSwitch").addEventListener("click", () => {
      const theme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      saveTheme(theme); showToast(theme === "light" ? "Włączono jasny motyw." : "Włączono nocny motyw.");
    });
    $("#acceptCookies").addEventListener("click", () => chooseCookiePreference("accepted"));
    $("#declineCookies").addEventListener("click", () => chooseCookiePreference("rejected"));
    $("#profileSelector").addEventListener("click", event => {
      const button = event.target.closest("[data-profile]");
      if (!button) return;
      selectedProfile = button.dataset.profile;
      localStorage.setItem(profileKey, selectedProfile);
      state.activeUnitId = null;
      renderProfileSelector();
      setCurrentModule(state.moduleId, null, false);
      showToast(selectedProfile === "all" ? "Wyświetlam oba kierunki." : `Włączono materiał: ${selectedProfile === "inf02" ? "technik informatyk" : "technik cyberbezpieczeństwa"}.`);
    });
    document.addEventListener("keydown", event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); }
      if (event.key === "Escape") closeSidebar();
    });
  }

  saveTheme(getTheme());
  bindEvents();
  initialiseCookieBanner();
  renderProfileSelector();
  setCurrentModule(state.moduleId, null, false);
})();
