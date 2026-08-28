(() => {
  "use strict";

  const course = window.COURSE_DATA;
  if (!course) return;

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const studentWording = (value = "") => String(value)
    .replace(/własnego laboratorium/gi, "własnych ćwiczeń")
    .replace(/w laboratorium/gi, "podczas ćwiczenia")
    .replace(/laboratoryjnych/gi, "ćwiczeniowych")
    .replace(/laboratoryjne/gi, "ćwiczeniowe")
    .replace(/laboratoryjnej/gi, "ćwiczeniowej")
    .replace(/laboratoryjny/gi, "ćwiczeniowy")
    .replace(/laboratorium/gi, "środowisko ćwiczeniowe")
    .replace(/scenariusza/gi, "instrukcji")
    .replace(/scenariuszu/gi, "instrukcji")
    .replace(/scenariusz/gi, "instrukcja")
    .replace(/LAB-INF(?:02|11)|LAB-(?:CLIENT|SERVER)/g, "SIEĆ-ĆWICZENIA")
    .replace(/\b(WIN|LINUX)-LAB\b/g, "$1-01")
    .replace(/Administrator-LAB/g, "Administrator techniczny")
    .replace(/\bLAB\b/g, "ćwiczenia");
  const escapeHTML = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const displayHTML = (value = "") => escapeHTML(studentWording(value));
  const compact = (value = "") => String(value).replace(/\s+/g, " ").trim();
  const storageKey = "inf02-laboratorium-progress-v1";
  const progressCookie = "inf02_progress_v1";
  const consentCookie = "inf02_progress_consent";
  const consentFallbackKey = "inf02_progress_consent_fallback";
  const themeKey = "inf02-laboratorium-theme-v1";
  const cyberOptionKey = "systemy-operacyjne-cyber-dodatki-v1";

  const audienceMeta = {
    inf02: { short: "I", label: "Technik informatyk · INF.02", className: "inf02" },
    inf11: { short: "C", label: "Technik cyberbezpieczeństwa · INF.11", className: "inf11" },
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
      ["rozpoznać oznaczenia I i C", "wybrać właściwy kierunek w menu kursu", "przygotować laboratorium do bezpiecznych ćwiczeń"],
      ["I — materiał dla technika informatyka, przede wszystkim INF.02.", "C — materiał dla technika cyberbezpieczeństwa, kwalifikacja INF.11.", "Temat z dwoma osobnymi oznaczeniami I i C jest wspólny dla obu kierunków."],
      ["W lewym menu kursu wybierz przycisk C — Cyberbezpieczeństwo INF.11. Kurs ukryje lekcje przeznaczone wyłącznie dla technika informatyka, ale pozostawi wspólne podstawy Windows, Linuxa, sieci i wirtualizacji.", "Zwracaj uwagę na plakietki przy każdym temacie: I oznacza informatyk, C oznacza cyberbezpieczeństwo; dwa znaczniki obok siebie oznaczają materiał wspólny.", "Przed pracą włącz wyłącznie maszyny wirtualne wskazane przez nauczyciela. Sprawdź, czy są w sieci wewnętrznej LAB-INF11 i czy masz dla nich migawki bazowe.", "Jeżeli polecenie wymaga testu usługi, wykonaj go tylko z jednej maszyny LAB do drugiej. Nie skanuj, nie zmieniaj i nie testuj urządzeń szkolnych ani cudzych kont."],
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
      // NAT i podział sieci są już omawiane w lekcji o sieciach VirtualBox.
      // Nie dublujemy tego materiału jako dawnego tematu 1.09.
      "c11-18-segmentacja-vlan-nat",
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
      "modul-1": ["Część 1. Wirtualizacja i podstawy sieci", "Wirtualizacja i sieci"],
      "modul-2": ["Część 2. Windows 11 — podstawy administracji", "Windows 11 — podstawy"],
      "modul-3": ["Część 3. Windows 11 — dyski, pliki i sieć", "Windows 11 — dyski i sieć"],
      "modul-4": ["Część 4. Windows Server — podstawy administracji", "Windows Server — podstawy"],
      "modul-5": ["Część 5. Windows Server — domena, użytkownicy i uprawnienia", "Windows Server — domena i konta"],
      "modul-6": ["Część 6. Windows Server — usługi sieciowe", "Windows Server — usługi sieciowe"],
      "modul-7": ["Część 7. Linux openSUSE — podstawy administracji", "Linux openSUSE — podstawy"],
      "modul-8": ["Część 8. Linux openSUSE — sieć i usługi", "Linux openSUSE — sieć i usługi"],
      "modul-9": ["Część 9. Łączenie systemów i bezpieczeństwo", "Łączenie systemów i bezpieczeństwo"],
    };
    Object.entries(labels).forEach(([id, [title, navTitle]]) => {
      const module = courseData.modules.find(item => item.id === id);
      if (!module) return;
      module.title = title;
      module.displayTitle = title;
      module.navTitle = navTitle;
    });

    // Pakiet dodatkowy nie jest osobnym modułem: jego ściągi pozostają dostępne
    // jako końcowe materiały w dziale openSUSE.
    const bonus = courseData.modules.find(module => module.number === "BONUS");
    const linuxModule = courseData.modules.find(module => module.id === "modul-8");
    if (bonus && linuxModule) linuxModule.units.push(...bonus.units);

    // Ekran wprowadzający oraz dawny temat 1.1 nie należą do właściwego toku kursu.
    // Pierwsza pozycja po wejściu prowadzi bezpośrednio do materiału dydaktycznego.
    courseData.modules = courseData.modules.filter(module => module.id !== "start" && module.number !== "BONUS");
    const firstModule = courseData.modules.find(module => module.id === "modul-1");
    if (firstModule) {
      firstModule.units = firstModule.units.filter(unit => unit.id !== "1-1-jak-rozwiązywać-zadania-praktyczne-inf-02");

      // Wspólne zasady bezpieczeństwa pozostają dostępne dla obu kierunków,
      // ale kurs zaczyna się od wirtualizacji i podstaw sieci.
      const safeLab = firstModule.units.find(unit => unit.id === "c-1-bezpieczne-laboratorium-i-etyka-testow");
      if (safeLab) {
        safeLab.title = "Zasady bezpiecznej pracy z systemami";
        safeLab.audience = "inf11";
        safeLab.blocks.forEach(block => {
          block.audience = "inf11";
          if (block.text === "Ćwiczenie INF.11") block.text = "Ćwiczenie praktyczne";
        });
      }

      const openingOrder = [
        "1-3-instalacja-virtualboxa-i-tworzenie-maszyny-wirtualnej",
        "1-4-sieci-wirtualne-nat-mostek-host-only-i-sieć-wewnętrzna",
        "1-5-migawki-klony-eksport-i-guest-additions",
        "1-2-adresacja-ip-dns-dhcp-i-najważniejsze-porty",
      ];
      firstModule.units.sort((left, right) => {
        const leftIndex = openingOrder.indexOf(left.id);
        const rightIndex = openingOrder.indexOf(right.id);
        const leftPosition = leftIndex < 0 ? openingOrder.length : leftIndex;
        const rightPosition = rightIndex < 0 ? openingOrder.length : rightIndex;
        return leftPosition - rightPosition;
      });
    }
  }

  integrateInf11IntoCourse(course);

  function focusInf02Course(courseData) {
    // Tematy poboczne nie znikają z danych źródłowych, ale nie rozpraszają ucznia
    // przygotowującego się do podstawowej administracji systemów i sieci w INF.02.
    const outOfFocus = new Set([
      "4-3-zdalny-pulpit-mmc-i-powershell-remoting",
      "5-5-automatyzacja-tworzenia-użytkowników-z-csv",
      "5-7-profile-mobilne-obowiązkowe-i-foldery-macierzyste",
      "6-2-serwer-wydruku-i-kolejka-drukowania",
      "6-5-rras-routing-ipv4-między-dwiema-sieciami",
      "6-6-rras-nat-i-podstawy-zdalnego-dostępu-vpn",
      "6-8-serwer-ftp-w-iis",
      "6-9-wsus-centralne-zarządzanie-aktualizacjami",
      "6-10-wds-pxe-i-współczesne-ograniczenia-wdrażania-windows",
      "8-5-bind-autorytatywny-serwer-dns",
      "8-6-dhcp-w-linuxie-konfiguracja-i-ograniczenia-pakietów-leap-16",
      "8-8-ftp-vsftpd-logi-usług-i-bezpieczna-alternatywa-sftp",
      "9-5-próbne-zadania-egzaminacyjne-inf-02-i-strategia-powtórki",
    ]);
    const keyTopics = new Set([
      "1-2-adresacja-ip-dns-dhcp-i-najważniejsze-porty",
      "1-3-instalacja-virtualboxa-i-tworzenie-maszyny-wirtualnej",
      "1-4-sieci-wirtualne-nat-mostek-host-only-i-sieć-wewnętrzna",
      "1-5-migawki-klony-eksport-i-guest-additions",
      "2-1-instalacja-i-pierwsza-konfiguracja-windows-11",
      "2-2-sterowniki-aktualizacje-i-informacje-o-systemie",
      "2-3-lokalne-konta-i-grupy-interfejs-graficzny-cmd-i-powershell",
      "3-1-zarządzanie-dyskami-partycjami-i-woluminami-ntfs",
      "3-2-uprawnienia-ntfs-dziedziczenie-właściciel-i-dostęp-efektywny",
      "3-3-konfiguracja-karty-sieciowej-w-windows-11",
      "3-4-polecenia-sieciowe-i-metodyczna-diagnostyka",
      "3-5-udostępnianie-folderu-gui-cmd-i-połączenie-z-klienta",
      "3-6-zapora-windows-i-microsoft-defender",
      "4-1-instalacja-windows-server-2025-i-konfiguracja-początkowa",
      "4-2-menedżer-serwera-role-funkcje-i-usługi",
      "5-1-planowanie-domeny-i-instalacja-roli-ad-ds",
      "5-2-promowanie-serwera-do-kontrolera-domeny",
      "5-3-jednostki-organizacyjne-użytkownicy-i-komputery",
      "5-4-grupy-domenowe-i-model-agdlp",
      "5-6-dołączanie-windows-11-do-domeny",
      "5-8-domenowe-zasady-grupy-tworzenie-łączenie-i-diagnostyka",
      "6-1-serwer-plików-udziały-smb-i-dostęp-przez-grupy",
      "6-3-serwer-dhcp-zakres-opcje-wykluczenia-i-rezerwacje",
      "6-4-serwer-dns-strefy-rekordy-forwardery-i-diagnostyka",
      "6-7-iis-instalacja-i-konfiguracja-serwera-www",
      "7-1-instalacja-opensuse-leap-16-0-przez-agama",
      "7-3-terminal-powłoka-bash-i-struktura-systemu-plików",
      "7-4-pliki-katalogi-i-wyszukiwanie-poleceniem-find",
      "7-6-dyski-systemy-plików-montowanie-i-etc-fstab",
      "7-7-pakiety-repozytoria-i-aktualizacje-przez-zypper",
      "7-8-procesy-usługi-systemd-i-dzienniki-journalctl",
      "7-10-użytkownicy-grupy-hasła-i-sudo",
      "7-11-uprawnienia-właściciele-umask-i-acl",
      "8-1-networkmanager-cockpit-nmcli-i-nmtui",
      "8-2-diagnostyka-sieci-w-linuxie",
      "8-3-firewalld-strefy-oraz-zdalne-zarządzanie-ssh",
      "8-4-apache2-serwer-http",
      "8-7-samba-udział-linux-dostępny-z-windows",
    ]);
    courseData.modules.forEach(module => module.units.forEach(unit => {
      if (outOfFocus.has(unit.id)) unit.audience = "none";
      if (keyTopics.has(unit.id)) unit.priority = true;
    }));
  }

  focusInf02Course(course);

  function keepOnlySystemCyberContent(courseData) {
    const systemCyberTopics = new Set([
      "c-1-bezpieczne-laboratorium-i-etyka-testow",
      "c-2-windows-bezpieczna-konfiguracja-poczatkowa",
      "c-3-windows-konta-uprzywilejowane-i-audyt",
      "c-4-linux-utwardzanie-kont-i-aktualizacji",
      "c-5-linux-bezpieczny-ssh",
      "c-6-zapora-i-segmentacja-lab",
      "c-7-logi-i-audyt-systemu",
      "c-8-kopia-zapasowa-i-odtwarzanie",
      "c-9-reagowanie-na-incydent-w-lab",
      "c11-3-tozsamosc-mfa-i-rbac",
      "c11-23-zapora-i-dostep-z-dozwolonego-hosta",
      "c11-25-logi-syslog-i-alert",
    ]);
    const clearerTitles = {
      "c-6-zapora-i-segmentacja-lab": "Zapora systemowa i kontrola dostępu",
      "c-9-reagowanie-na-incydent-w-lab": "Reagowanie na incydent w systemie",
      "c11-25-logi-syslog-i-alert": "Dzienniki systemowe i syslog",
    };
    courseData.modules.forEach(module => module.units.forEach(unit => {
      if (unit.audience === "inf11" && !systemCyberTopics.has(unit.id)) unit.audience = "none";
      if (clearerTitles[unit.id]) unit.title = clearerTitles[unit.id];
    }));
  }

  keepOnlySystemCyberContent(course);
  let showCyber = localStorage.getItem(cyberOptionKey) === "true";

  const defaultModuleId = course.modules[0]?.id || "";
  const allUnits = course.modules.flatMap(module => module.units.map((unit, index) => ({ ...unit, module, index })));
  const unitById = new Map(allUnits.map(unit => [unit.id, unit]));
  const moduleById = new Map(course.modules.map(module => [module.id, module]));
  let cookieChoice = getCookie(consentCookie) || localStorage.getItem(consentFallbackKey);
  const legacyProgress = safeParse(localStorage.getItem(storageKey), null);
  const saved = cookieChoice === "accepted"
    ? safeParse(getCookie(progressCookie) || localStorage.getItem(storageKey), { done: [], moduleId: defaultModuleId })
    : safeParse(sessionStorage.getItem(storageKey), legacyProgress || { done: [], moduleId: defaultModuleId });
  localStorage.removeItem(storageKey);
  const state = {
    moduleId: moduleById.has(saved.moduleId) ? saved.moduleId : defaultModuleId,
    done: new Set(saved.done || []),
    activeUnitId: unitById.has(saved.activeUnitId) ? saved.activeUnitId : null,
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
    const payload = JSON.stringify({ done: [...state.done], moduleId: state.moduleId, activeUnitId: state.activeUnitId });
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
    return localStorage.getItem(themeKey) || "light";
  }

  function audienceOf(item) {
    return item?.audience || "both";
  }
  function visibleForProfile(item) {
    const audience = audienceOf(item);
    return audience === "both" || audience === "inf02" || (audience === "inf11" && showCyber);
  }
  function visibleUnits(module) {
    return module.units.filter(visibleForProfile);
  }
  function visibleModules() {
    return course.modules.filter(module => visibleUnits(module).length);
  }
  function cleanUnitTitle(title) {
    return compact(title)
      .replace(/^(?:[A-Z]\.)?(?:\d+\.){1,2}\s*/i, "")
      .replace(/^C\.\d+(?:\.\d+)?\.\s*/i, "");
  }
  function topicNumber(module, unit) {
    const position = visibleUnits(module).findIndex(item => item.id === unit.id) + 1;
    const modulePart = String(module.number).padStart(2, "0");
    return `${modulePart}.${String(Math.max(position, 1)).padStart(2, "0")}`;
  }
  function audienceBadge(audience = "both") {
    const renderBadge = key => {
      const meta = audienceMeta[key];
      return `<span class="audience-badge audience-badge--${meta.className}" title="${escapeHTML(meta.label)}">${escapeHTML(meta.short)}</span>`;
    };
    return audience === "both" ? renderBadge("inf02") : renderBadge(audience);
  }
  function profileDescription() {
    return showCyber
      ? "Włączono dodatkowe tematy z cyberbezpieczeństwa."
      : "Wyświetlasz materiał dla technika informatyka.";
  }
  function renderProfileSelector() {
    $("#cyberToggle").checked = showCyber;
    $("#profileHint").textContent = profileDescription();
  }

  function renderModuleNav() {
    const nav = $("#moduleNav");
    nav.innerHTML = visibleModules().map(module => {
      const active = module.id === state.moduleId;
      const done = moduleDone(module);
      const expanded = expandedModuleIds.has(module.id);
      const topics = visibleUnits(module).map(unit => {
        const topicActive = active && unit.id === state.activeUnitId;
        const topicDone = state.done.has(unit.id);
        return `<button type="button" class="module-topic-button ${topicActive ? "is-current" : ""}" data-nav-unit="${escapeHTML(unit.id)}" aria-label="Otwórz temat: ${displayHTML(unit.title)}" ${topicActive ? 'aria-current="page"' : ""}>
          <span class="module-topic-number">${topicDone ? "✓" : escapeHTML(topicNumber(module, unit))}</span>
          <span class="module-topic-label">${displayHTML(cleanUnitTitle(unit.title))} ${audienceBadge(audienceOf(unit))}</span>
        </button>`;
      }).join("");
      return `<section class="module-nav-group ${active ? "is-active" : ""} ${expanded ? "is-expanded" : ""}">
        <button type="button" class="module-button ${active ? "is-active" : ""}" data-toggle-module="${escapeHTML(module.id)}" aria-expanded="${expanded}" aria-controls="topics-${escapeHTML(module.id)}" aria-label="${expanded ? "Zwiń" : "Rozwiń"} tematy modułu: ${displayHTML(module.navTitle)}">
          <span class="module-num">${escapeHTML(module.number)}</span>
          <span class="module-label">${displayHTML(module.navTitle)}</span>
          <span class="module-done">${done ? "✓" : ""}</span>
          <span class="module-expand" aria-hidden="true">⌄</span>
        </button>
        <div class="module-topic-list" id="topics-${escapeHTML(module.id)}" aria-label="Tematy: ${displayHTML(module.navTitle)}" ${expanded ? "" : "hidden"}>${topics}</div>
      </section>`;
    }).join("");
  }

  function renderBlock(block) {
    if (!block) return "";
    if (block.type === "table") return renderTable(block.rows);

    const text = compact(block.text);
    let content = "";
    if (text) {
      if (block.style === "Kod") content = `<pre class="code-block"><code>${displayHTML(block.text)}</code></pre>`;
      else if (block.style === "Ćwiczenie") content = `<article class="practice-card"><header>ĆWICZENIE PRAKTYCZNE</header><p>${displayHTML(block.text)}</p></article>`;
      else if (["Uwaga", "Ważne", "Wskazówka", "Sukces"].includes(block.style)) content = renderCallout(block);
      else if (block.style === "Caption") content = `<p class="caption">${displayHTML(block.text)}</p>`;
      else if (block.style === "Heading1") content = `<h3 class="lead-heading">${displayHTML(block.text)}</h3>`;
      else content = `<p class="plain-paragraph">${displayHTML(block.text)}</p>`;
    }

    if (Array.isArray(block.images) && block.images.length) {
      const figures = block.images.map((source, index) => {
        const image = course.media[source];
        if (!image) return "";
        return `<figure class="source-figure"><img src="${image.data}" alt="Ilustracja z podręcznika: ${displayHTML(block.text || "materiał poglądowy")}" loading="lazy"><figcaption>Materiał poglądowy z podręcznika${block.images.length > 1 ? ` · ${index + 1}` : ""}</figcaption></figure>`;
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
    return `<aside class="callout ${kind}"><span class="callout-icon" aria-hidden="true">${icon}</span><p>${displayHTML(block.text)}</p></aside>`;
  }

  function renderTable(rows = []) {
    if (!rows.length) return "";
    const [first, ...rest] = rows;
    const header = `<thead><tr>${first.map(cell => `<th scope="col">${displayHTML(cell)}</th>`).join("")}</tr></thead>`;
    const body = rest.length ? `<tbody>${rest.map(row => `<tr>${row.map(cell => `<td>${displayHTML(cell)}</td>`).join("")}</tr>`).join("")}</tbody>` : "";
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
    if (normalized.includes("co trzeba wiedzieć") || normalized.includes("pojęcia") || normalized.includes("teoria")) return "theory";
    if (normalized.includes("konfiguracja krok po kroku")) return "steps";
    if (normalized.includes("sprawdzenie poprawności") || normalized.includes("lista kontrolna")) return "checks";
    if (normalized.includes("najczęstsze problemy")) return "problems";
    if (normalized.includes("zadanie praktyczne") || normalized.includes("ćwiczenie")) return "practice";
    if (normalized.includes("pytania kontrolne")) return "questions";
    return "standard";
  }

  function lessonContext(unit) {
    const title = unit.title.toLocaleLowerCase("pl");
    if (/dhcp|dns|adresac|tcp|udp|sieć|wireshark|vlan|nat|port/.test(title)) return "Najpierw ustal, które urządzenia i usługi mają ze sobą rozmawiać. Dopiero potem zmieniaj adresację, usługę albo regułę — sieć łatwiej diagnozuje się wtedy krok po kroku.";
    if (/active directory|domen|użytkownik|grup|konto|tożsamo/.test(title)) return "W systemie najważniejsze jest rozdzielenie: kto jest użytkownikiem, do jakiej grupy należy i co naprawdę wolno mu zrobić. Jedna świadoma zmiana jest lepsza niż kilka ustawień wykonanych naraz.";
    if (/windows server|rola|iis|wsus|wds|rras|serwer/.test(title)) return "Usługa serwerowa składa się z roli, uruchomionej usługi, właściwej konfiguracji oraz testu z klienta. Gdy coś nie działa, sprawdzaj te elementy właśnie w tej kolejności.";
    if (/windows|ntfs|dysk|partycj|rejestr/.test(title)) return "Zanim zmienisz ustawienie Windows, poznaj jego miejsce w systemie i zapisz stan początkowy. Dzięki temu łatwo rozpoznasz rezultat oraz cofniesz pomyłkę w maszynie laboratoryjnej.";
    if (/opensuse|linux|bash|zypper|sudo|ssh|firewalld|systemd|plik|katalog/.test(title)) return "W Linuxie polecenie ma sens dopiero wtedy, gdy wiesz, na jakim koncie pracujesz, w jakim katalogu jesteś i jaki wynik powinieneś zobaczyć. Czytaj komunikat po każdym kroku.";
    if (/virtualbox|maszyn.*wirtual|migawk|klon/.test(title)) return "Maszyna wirtualna pozwala bezpiecznie ćwiczyć i wracać do stanu sprzed zmiany. Przed eksperymentem przygotuj właściwą sieć laboratoryjną oraz migawkę.";
    if (/bezpieczeń|zapora|log|kopia|incydent|certyfikat|skrót/.test(title)) return "Bezpieczeństwo nie polega na jednym przełączniku. To świadome ustawienia, ślad w logu i test, który potwierdza, że ochrona rzeczywiście działa.";
    return "Najpierw nazwij element systemu, z którym pracujesz, i określ jego cel. Dzięki temu kolejne kliknięcia nie będą przypadkowe, lecz staną się zrozumiałą konfiguracją.";
  }

  function practicePreparation(unit) {
    const title = unit.title.toLocaleLowerCase("pl");
    if (/sieć|dhcp|dns|tcp|udp|port|wireshark|vlan|nat/.test(title)) return "Uruchom tylko maszyny wskazane w scenariuszu LAB. Sprawdź ich adresy i upewnij się, że nie są połączone z prawdziwą siecią szkolną.";
    if (/opensuse|linux|bash|zypper|sudo|ssh|firewalld|systemd/.test(title)) return "Otwórz Terminal na własnej maszynie Linux. Zanim wpiszesz polecenie zmieniające konfigurację, sprawdź konto poleceniem whoami i bieżący katalog poleceniem pwd.";
    if (/virtualbox|maszyn.*wirtual|migawk|klon/.test(title)) return "Wyłącz maszynę, zapisz jej obecną konfigurację i utwórz migawkę. Dzięki temu po ćwiczeniu możesz bezpiecznie wrócić do stanu początkowego.";
    if (/windows server|domen|active directory|rola|iis|wsus|wds|rras/.test(title)) return "Uruchom własny Windows Server oraz maszynę kliencką, jeśli ćwiczenie wymaga testu z drugiego komputera. Nie wykonuj zmian na szkolnym serwerze produkcyjnym.";
    return "Pracuj na swojej maszynie laboratoryjnej. Zapisz stan przed zmianą — nazwę ustawienia, okno narzędzia albo wynik polecenia — aby móc porównać rezultat.";
  }

  function practicePrompt(unit) {
    const guide = guideForUnit(unit);
    return `Samodzielnie odtwórz główną czynność z lekcji, korzystając z przygotowanego scenariusza. Wykonuj kolejne kroki po jednym, a po zakończeniu sprawdź wynik w narzędziu lub poleceniu opisanym w lekcji. ${guide.text}`;
  }

  function paragraphsFrom(blocks) {
    return blocks
      .filter(block => block.type === "paragraph" && compact(block.text))
      .map(block => compact(block.text));
  }

  function renderOpening(blocks, unit) {
    const inner = blocks.map(renderBlock).join("");
    return `<section class="lesson-opening"><div><span class="lesson-kicker">WPROWADZENIE</span><h4>O co chodzi w tym temacie?</h4>${inner}</div><aside class="lesson-context"><span>NAJPIERW ZROZUM</span><p>${displayHTML(lessonContext(unit))}</p></aside></section>`;
  }

  function renderLearningGoals(group, audience) {
    const goals = paragraphsFrom(group.blocks);
    const badge = audience === "both" ? "" : audienceBadge(audience);
    return `<section class="lesson-section learning-goals section-audience-${audience}"><h4 class="section-label">Po tej lekcji będziesz umieć${badge}</h4><div class="learning-goals-grid">${goals.map((goal, index) => `<p><b>${String(index + 1).padStart(2, "0")}</b>${displayHTML(goal)}</p>`).join("")}</div></section>`;
  }

  function theoryIntroduction(unit) {
    const title = unit.title.toLocaleLowerCase("pl");
    if (/dhcp|adresac|dns|ipv4|tcp|udp|sieć|port/.test(title)) return "Konfiguracja sieci nie jest zestawem przypadkowych liczb. Każde pole odpowiada za konkretną część komunikacji: adres identyfikuje urządzenie, maska określa jego sieć lokalną, brama prowadzi do innych sieci, a DNS pozwala używać nazw zamiast zapamiętywania adresów. Najpierw zrozum rolę tych elementów; dopiero potem wpisuj wartości w oknach konfiguracji.";
    if (/domen|active directory|użytkownik|grup|konto/.test(title)) return "W środowisku domenowym komputer i użytkownik nie są tylko wpisami na liście. Są obiektami, którym administrator przypisuje tożsamość, grupy oraz uprawnienia. Dobra konfiguracja zaczyna się od zaplanowania, kto ma korzystać z zasobu i w jakim zakresie, a kończy się testem na zwykłym koncie użytkownika.";
    if (/dysk|partycj|ntfs|folder|udział/.test(title)) return "Zasoby dyskowe i pliki wymagają dwóch decyzji: gdzie mają być przechowywane oraz kto może z nich korzystać. W systemie Windows ustawienia dysku, systemu plików, udziału sieciowego i uprawnień NTFS działają razem, ale dotyczą różnych warstw. Ich rozdzielenie ułatwia późniejsze szukanie błędów.";
    if (/linux|opensuse|bash|zypper|sudo|systemd|ssh|firewalld/.test(title)) return "Linux jest przewidywalny, jeśli wiesz, na jakim koncie pracujesz, który plik zmieniasz i jaka usługa ma odczytać tę zmianę. Polecenie nie jest zaklęciem: jego wynik mówi, czy operacja się udała, czego brakuje i co należy sprawdzić przed kolejnym krokiem.";
    if (/virtualbox|maszyn.*wirtual|migawk|klon/.test(title)) return "Wirtualizacja pozwala ćwiczyć prawdziwą administrację bez ryzyka dla komputerów szkolnych. Maszyna wirtualna ma własny dysk, pamięć i kartę sieciową, dlatego przed zmianą należy określić jej rolę oraz utworzyć migawkę umożliwiającą bezpieczny powrót do punktu wyjścia.";
    if (/zapora|aktualiz|kopia|log|bezpieczeń|certyfikat/.test(title)) return "Bezpieczeństwo systemu jest procesem: ograniczasz dostęp, zapisujesz ślady działania i potwierdzasz, że zabezpieczenie działa. Samo zaznaczenie opcji nie wystarcza — po konfiguracji zawsze sprawdź jej efekt z perspektywy użytkownika lub innej maszyny laboratoryjnej.";
    return "Każdy element administracji systemem ma określony cel, miejsce konfiguracji i sposób sprawdzenia efektu. Zanim wykonasz procedurę, przeczytaj definicje niżej. Dzięki temu kolejne kroki staną się zrozumiałym działaniem administracyjnym, a nie wyłącznie odtwarzaniem kliknięć.";
  }

  function theoryDeepening(unit) {
    const title = unit.title.toLocaleLowerCase("pl");
    if (/virtualbox|maszyn.*wirtual|migawk|klon|guest additions/.test(title)) return [
      "Komputer fizyczny nazywamy hostem, a system uruchomiony w oknie VirtualBox — gościem. Gość korzysta z przydzielonych mu zasobów hosta, ale ma własny dysk wirtualny, pamięć i ustawienia. Dlatego błąd w systemie gościa zwykle nie niszczy systemu nauczyciela ani ucznia, o ile pracujesz w dobrze przygotowanym laboratorium.",
      "Migawka zapisuje stan maszyny w konkretnym momencie. Nie jest zwykłym przyciskiem „cofnij”: po przywróceniu znikają zmiany wykonane po jej utworzeniu. W praktyce najbezpieczniej tworzyć migawkę przed instalacją roli, zmianą sieci lub eksperymentem z uprawnieniami, a jej nazwą opisać stan, do którego można wrócić.",
    ];
    if (/dhcp|adresac|dns|ipv4|tcp|udp|sieć|port|wireshark|vlan|nat/.test(title)) return [
      "W sieci najpierw powstaje plan, a dopiero potem konfiguracja. Plan odpowiada na proste pytania: które maszyny są w tej samej sieci, jaki adres ma serwer, skąd klient otrzyma ustawienia i jaki wynik testu jest oczekiwany. Gdy zapiszesz te wartości przed pracą, łatwiej odróżnisz błąd adresacji od błędu usługi albo zapory.",
      "Komunikacja działa warstwowo. Najpierw urządzenia muszą się „widzieć” w tej samej sieci lub przez bramę, później system musi znać właściwy adres albo nazwę DNS, a na końcu usługa musi działać na określonym porcie i być dopuszczona przez zaporę. Ta kolejność wyjaśnia, dlaczego przy awarii nie zaczyna się od losowej zmiany wszystkich ustawień.",
    ];
    if (/dysk|partycj|ntfs|folder|udział|samba|acl|uprawnien/.test(title)) return [
      "Dysk, partycja, wolumin i system plików to różne pojęcia. Dysk jest urządzeniem lub jego wirtualnym odpowiednikiem. Partycja wydziela na nim miejsce, wolumin udostępnia je systemowi, a system plików — na przykład NTFS — określa sposób przechowywania plików i praw dostępu. Dzięki temu administrator może rozdzielić dane systemowe, dane użytkowników i kopie zapasowe.",
      "Dostęp do folderu warto sprawdzać na zwykłym koncie, ponieważ administrator może widzieć więcej niż typowy użytkownik. Przy udziale sieciowym obowiązują jednocześnie uprawnienia udziału i uprawnienia systemu plików; użytkownik otrzymuje tylko taki dostęp, na jaki pozwalają oba mechanizmy. To dlatego sama zmiana jednego okna nie zawsze rozwiązuje problem z dostępem.",
    ];
    if (/domen|active directory|użytkownik|grup|konto|tożsamo|gpo|laps/.test(title)) return [
      "Domena porządkuje komputery i konta w jednym środowisku. Kontroler domeny przechowuje informacje o użytkownikach, komputerach i grupach, dzięki czemu nie trzeba tworzyć tych samych kont osobno na każdej stacji. Active Directory nie zastępuje jednak świadomego planowania: przed utworzeniem konta trzeba wiedzieć, do jakiej jednostki organizacyjnej trafi i jakie zadania ma wykonywać jego właściciel.",
      "Uprawnienie najlepiej nadaje się grupie, a nie pojedynczym osobom. Użytkownik trafia do grupy zgodnej ze swoją rolą, a grupa otrzymuje dostęp do zasobu. Taki sposób pracy ułatwia zmiany w klasie lub firmie: przy odejściu użytkownika zmieniasz jego członkostwo, zamiast przeglądać ustawienia każdego folderu i każdej usługi.",
    ];
    if (/windows server|rola|iis|wsus|wds|rras|serwer/.test(title)) return [
      "Rola serwera to zestaw składników potrzebnych do realizacji konkretnego zadania, na przykład wydawania adresów DHCP, obsługi stron WWW albo pracy domeny. Instalacja roli jest dopiero początkiem. Aby usługa była użyteczna, trzeba określić jej ustawienia, sprawdzić stan uruchomienia, dopuścić potrzebny ruch w zaporze i wykonać test z klienta.",
      "Serwer powinien mieć stałą rolę w laboratorium oraz znaną konfigurację. Gdy jedna maszyna pełni kilka funkcji, zapisuj, które usługi zostały włączone i na jakich adresach pracują. Taka dokumentacja pozwala po czasie wyjaśnić, dlaczego klient łączy się z konkretnym serwerem, oraz ułatwia bezpieczne cofnięcie zmian.",
    ];
    if (/linux|opensuse|bash|zypper|sudo|systemd|ssh|firewalld|plik|katalog|find/.test(title)) return [
      "W Linuxie wiele ustawień jest zapisanych w plikach tekstowych, a usługi odczytują je podczas uruchamiania lub przeładowania. Terminal daje precyzyjną kontrolę, ale wymaga uwagi: przed zmianą sprawdź bieżący katalog, nazwę pliku i konto, na którym pracujesz. Komunikat po poleceniu jest informacją zwrotną, a nie ozdobą — warto przeczytać go przed kolejnym krokiem.",
      "Zwykłe konto służy do codziennej pracy, a sudo pozwala wykonać pojedynczą czynność administracyjną po świadomym potwierdzeniu. Takie rozdzielenie ogranicza skutki literówki i zostawia ślad w historii poleceń. Po każdej zmianie usługi sprawdzaj jej stan oraz dziennik: konfiguracja może być zapisana poprawnie, ale usługa nadal może nie działać.",
    ];
    if (/zapora|aktualiz|kopia|log|bezpieczeń|certyfikat|incydent|podatn/.test(title)) return [
      "Bezpieczeństwo systemu tworzą warstwy, które wzajemnie się uzupełniają: aktualny system usuwa znane błędy, konto o ograniczonych prawach zmniejsza skalę pomyłki, zapora ogranicza połączenia, a kopia zapasowa umożliwia powrót po awarii. Żadna z tych warstw nie wystarczy samodzielnie, dlatego w ćwiczeniach sprawdzasz ich działanie w określonej kolejności.",
      "Dziennik zdarzeń zapisuje fakty: czas, usługę, konto lub komunikat. Sam wpis w logu nie jest jeszcze dowodem incydentu. Najpierw porównaj go z tym, co właśnie zmieniono, stanem usługi i wynikiem testu. Dopiero wtedy można zaproponować poprawę oraz ponownie sprawdzić, czy rzeczywiście rozwiązała problem.",
    ];
    return [
      "W administracji systemem każda zmiana ma przyczynę i skutek. Zanim ustawisz wartość, nazwij problem, który ma rozwiązać, oraz zapisz stan początkowy. Po zmianie sprawdź rezultat tym samym narzędziem albo z perspektywy użytkownika. Taka metoda jest wolniejsza tylko pozornie — w rzeczywistości pozwala szybciej znaleźć błąd.",
      "Dobra dokumentacja nie musi być długa. Wystarczy zapisać cel, miejsce konfiguracji, najważniejszą wartość, wynik testu i ewentualną trudność. Dzięki temu po kilku dniach uczeń potrafi odtworzyć własne ćwiczenie, a nauczyciel widzi nie tylko efekt końcowy, lecz także sposób dojścia do niego.",
    ];
  }

  function renderTheory(group, audience, unit) {
    const conceptBlocks = group.blocks.filter(block => block.type === "paragraph" && compact(block.text));
    const extra = group.blocks.filter(block => !(block.type === "paragraph" && compact(block.text))).map(renderBlock).join("");
    const badge = audience === "both" ? "" : audienceBadge(audience);
    const concepts = conceptBlocks.map(block => {
      const [term, ...definition] = compact(block.text).split("—");
      const body = definition.join("—").trim();
      return body
        ? `<article class="textbook-concept"><h5>${displayHTML(term.trim())}</h5><p>${displayHTML(body)}</p></article>`
        : `<article class="textbook-concept"><p>${displayHTML(compact(block.text))}</p></article>`;
    }).join("");
    const deepening = theoryDeepening(unit).map(paragraph => `<p>${displayHTML(paragraph)}</p>`).join("");
    return `<section class="lesson-section theory-section section-audience-${audience}"><h4 class="section-label">Wyjaśnienie zagadnienia${badge}</h4><div class="theory-introduction"><p>${displayHTML(theoryIntroduction(unit))}</p></div><div class="theory-deepening">${deepening}</div><div class="textbook-concepts">${concepts}</div>${extra}</section>`;
  }

  function practiceMethod(unit) {
    const title = unit.title.toLocaleLowerCase("pl");
    if (/sieć|dhcp|dns|adres|port|wireshark|vlan|nat/.test(title)) return "Przed zmianą zapisz adresację obu maszyn. Wykonaj konfigurację na serwerze lub kliencie wskazanym w zadaniu, a następnie potwierdź połączenie z drugiej maszyny. Nie testuj usług poza siecią LAB.";
    if (/domen|active directory|użytkownik|grup|konto/.test(title)) return "Utwórz lub zmień obiekt wyłącznie w swojej domenie laboratoryjnej. Następnie zaloguj się albo sprawdź dostęp na koncie o uprawnieniach zwykłego użytkownika — administrator nie jest wiarygodnym testem ograniczeń.";
    if (/linux|opensuse|bash|zypper|ssh|firewalld|systemd/.test(title)) return "Zapisz polecenie, które wykonałeś, oraz jego wynik. Jeżeli zmieniasz usługę lub zaporę, sprawdź stan po zmianie i przetestuj usługę z dozwolonego klienta. W razie błędu nie przechodź do kolejnego kroku.";
    if (/virtualbox|maszyn.*wirtual|migawk|klon/.test(title)) return "Wykonaj migawkę przed zmianą. Po skonfigurowaniu maszyny uruchom ją i sprawdź wskazaną funkcję. Na końcu opisz, do jakiego stanu można bezpiecznie wrócić.";
    return "Zapisz stan początkowy, wykonaj konfigurację krok po kroku i po każdej większej zmianie sprawdź rezultat. Nie wykonuj dodatkowych ustawień, których nie wymaga polecenie — utrudniają późniejszą diagnostykę.";
  }

  function practiceDocumentation(unit) {
    const title = unit.title.toLocaleLowerCase("pl");
    if (/sieć|dhcp|dns|adres|port|wireshark|vlan|nat/.test(title)) return "Do notatki wpisz nazwę każdej VM, jej adres IP, użyty interfejs, wynik testu oraz jeden zrzut lub wynik polecenia. Zapisz również, która konfiguracja była źródłem adresu: statyczna albo DHCP.";
    if (/linux|opensuse|bash|zypper|ssh|firewalld|systemd/.test(title)) return "W raporcie zapisz użyte polecenie, najważniejszą linię wyniku i nazwę usługi albo pliku, którego dotyczyła zmiana. Nie wklejaj haseł, kluczy ani pełnych danych wrażliwych.";
    return "W raporcie zapisz: cel, wykonane działanie, miejsce konfiguracji, wynik oczekiwany, wynik rzeczywisty oraz dowód w postaci zrzutu ekranu lub krótkiego wyniku polecenia.";
  }

  function renderPracticeWorkshop(unit, practiceGroups, evidenceBlocks) {
    const taskText = paragraphsFrom(practiceGroups.flatMap(group => group.blocks));
    const task = taskText.join(" ") || practicePrompt(unit);
    const evidence = paragraphsFrom(evidenceBlocks).slice(0, 3);
    const result = evidence.length
      ? evidence.join(" ")
      : "Zrzut ekranu albo wynik polecenia powinien potwierdzać poprawność konfiguracji, a nie tylko to, że okno narzędzia zostało otwarte.";
    return `<section class="practice-workshop"><header><span>PRACOWNIA</span><h4>Zadanie praktyczne</h4><p>To samodzielne ćwiczenie wykonujesz po przeczytaniu teorii i instrukcji. Pracuj wolno, zapisuj rezultat każdego etapu i traktuj wynik testu jako część zadania.</p></header><div class="practice-workshop-grid"><article><span>01 · Przygotuj stanowisko</span><p>${escapeHTML(practicePreparation(unit))}</p></article><article><span>02 · Wykonaj zadanie</span><ol><li>${escapeHTML(task)}</li><li>${escapeHTML(practiceMethod(unit))}</li></ol></article><article><span>03 · Zweryfikuj</span><p>${escapeHTML(result)}</p></article><article><span>04 · Udokumentuj</span><p>${escapeHTML(practiceDocumentation(unit))}</p></article></div></section>`;
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
    return `<aside class="step-guide"><h5>Jak pracować z tą instrukcją</h5><p>${displayHTML(guide.text)}</p><div class="guide-path" aria-label="Ścieżka wykonania">${guide.path.map(part => `<span>${displayHTML(part)}</span>`).join("")}</div></aside>`;
  }

  function dhcpProcedure(title, purpose, steps, note = "") {
    return `<section class="configuration-procedure"><header><span>PROCEDURA</span><h5>${displayHTML(title)}</h5><p>${displayHTML(purpose)}</p></header><ol>${steps.map(step => `<li>${displayHTML(step)}</li>`).join("")}</ol>${note ? `<aside class="procedure-note"><b>Dlaczego to ważne:</b> ${displayHTML(note)}</aside>` : ""}</section>`;
  }

  function renderDhcpProcedures() {
    return `<div class="configuration-chapter">
      <p class="configuration-lead">W przykładzie serwer ma adres <b>192.168.50.10</b>, a sieć ma adres <b>192.168.50.0/24</b>. Zanim aktywujesz zakres, sprawdź, że serwer i klient są podłączone do tej samej sieci. W VirtualBox można do tego użyć trybu <b>Sieć wewnętrzna</b> o nazwie <b>SIEĆ-ĆWICZENIA</b>.</p>
      ${dhcpProcedure("Instalacja roli DHCP", "Rola DHCP dodaje do Windows Server usługę, która może automatycznie przekazywać klientom konfigurację IPv4. Instalujesz ją w Menedżerze serwera — programie przeznaczonym do zarządzania rolami serwera.", [
        "Zaloguj się do Windows Server na koncie administratora. Kliknij Start i uruchom Menedżer serwera. Jeśli program otworzył się już po zalogowaniu, pozostaw go na ekranie.",
        "W prawym górnym rogu kliknij Zarządzaj, a następnie wybierz Dodaj role i funkcje. Otworzy się kreator instalacji; każda jego strona opisuje jeden etap.",
        "Na stronie Przed rozpoczęciem kliknij Dalej. Na stronie Typ instalacji pozostaw zaznaczoną opcję Instalacja oparta na rolach lub funkcjach i kliknij Dalej.",
        "Na stronie Wybór serwera z puli serwerów zaznacz nazwę swojego serwera, np. SRV-DC01. Sprawdź jego adres IP w kolumnie po prawej; nie wybieraj przypadkowego serwera, jeśli w puli jest ich więcej.",
        "Na stronie Role serwera znajdź DHCP Server i zaznacz pole wyboru. Windows wyświetli małe okno z pytaniem o narzędzia zarządzania; kliknij Dodaj funkcje, ponieważ będą potrzebne do późniejszego otwarcia konsoli DHCP.",
        "Klikaj Dalej, nie zaznaczając dodatkowych funkcji. Na stronie Potwierdzenie kliknij Zainstaluj. Poczekaj, aż pasek postępu zakończy instalację; nie zamykaj serwera ani kreatora.",
        "Po instalacji kliknij ikonę flagi z powiadomieniem w prawym górnym rogu Menedżera serwera. Wybierz Complete DHCP configuration. W domenie zatwierdź konto z odpowiednimi uprawnieniami, aby autoryzować serwer, a następnie zamknij kreator.",
      ], "Autoryzacja ma znaczenie w domenie Active Directory: pomaga wykrywać niezatwierdzone serwery DHCP. Nie oznacza jednak, że można uruchamiać DHCP w dowolnej sieci — izolacja laboratorium nadal jest konieczna.")}
      ${dhcpProcedure("Konfiguracja zakresu i dzierżawy DHCP", "Zakres jest pulą adresów przeznaczoną dla jednej podsieci. Gdy klient nie ma własnego stałego adresu, serwer wypożycza mu adres z tej puli na określony czas, czyli dzierżawę.", [
        "W Menedżerze serwera kliknij Narzędzia, a potem DHCP. W nowym oknie rozwiń nazwę serwera, np. SRV-DC01, a następnie kliknij prawym przyciskiem IPv4 i wybierz Nowy zakres.",
        "Na stronie powitalnej kreatora kliknij Dalej. W polu Nazwa wpisz LAB-INF02. W opisie możesz dopisać: Zakres dla maszyn wirtualnych 192.168.50.0/24. Nazwa nie zmienia adresacji, ale pozwala później rozpoznać właściwy zakres.",
        "W oknie Zakres adresów wpisz Start IP address: 192.168.50.100 oraz End IP address: 192.168.50.150. Windows sam rozpozna maskę 255.255.255.0. Oznacza to, że klient może dostać jeden z adresów od .100 do .150.",
        "Na stronie Add Exclusions and Delay nie dodawaj adresów .10 ani .20, ponieważ w tym przykładzie nie należą one do puli. Gdyby adres infrastruktury znajdował się wewnątrz puli, wpisz go tutaj jako wykluczenie — wtedy DHCP nigdy go nie wyda klientowi.",
        "Na stronie Lease Duration pozostaw wartość domyślną, jeśli nauczyciel nie podał innej. Dzierżawa nie jest stałym przypisaniem: po jej wygaśnięciu klient może odnowić adres albo otrzymać inny wolny adres z tego samego zakresu.",
        "Wybierz Tak, chcę skonfigurować te opcje teraz, a następnie kliknij Dalej. Kreator przeprowadzi Cię do ustawień routera, DNS i nazwy domeny.",
      ], "Wykluczenie i rezerwacja to różne pojęcia. Wykluczenie usuwa adres z automatycznej puli. Rezerwacja pozwala konkretnemu klientowi otrzymywać zawsze ten sam adres na podstawie jego adresu MAC.")}
      ${dhcpProcedure("Opcje DHCP i rezerwacja dla klienta", "Opcje DHCP przekazują klientowi dodatkowe informacje. Dzięki nim nie trzeba ręcznie wpisywać DNS, domeny ani — jeżeli istnieje — bramy na każdym komputerze.", [
        "Na stronie Router (Default Gateway) wpisz 192.168.50.1 tylko wtedy, gdy w Twoim laboratorium rzeczywiście działa router o takim adresie. Jeśli sieć ma służyć wyłącznie do komunikacji między maszynami wirtualnymi, pozostaw listę pustą i kliknij Dalej.",
        "Na stronie Domain Name and DNS Servers wpisz jako Parent domain nazwę szkola.test. W polu IP address dodaj 192.168.50.10, a następnie kliknij Add. To opcja 006: klient otrzyma adres serwera DNS razem z dzierżawą.",
        "Na stronie WINS Servers nic nie zmieniaj, jeśli scenariusz nie wymaga usługi WINS. Kliknij Dalej, wybierz aktywację zakresu i zakończ kreator przyciskiem Finish.",
        "Aby przygotować rezerwację, uruchom komputer kliencki w tej samej sieci LAB. W Windows 11 otwórz Ustawienia, wybierz Sieć i Internet, następnie Zaawansowane ustawienia sieci i Więcej opcji karty sieciowej. Kliknij prawym przyciskiem kartę LAB, wybierz Właściwości, zaznacz Internet Protocol Version 4 (TCP/IPv4) i kliknij Właściwości.",
        "Zaznacz Uzyskaj adres IP automatycznie oraz Uzyskaj adres serwera DNS automatycznie. Zatwierdź oba okna przyciskiem OK, aby klient zaczął prosić serwer DHCP o konfigurację.",
        "W konsoli DHCP rozwiń IPv4, potem LAB-INF02, a następnie Address Leases. Odszukaj nazwę klienta, kliknij ją prawym przyciskiem i wybierz Add to Reservation. Jeśli tej opcji nie ma, skopiuj jego Client ID/MAC i kliknij prawym przyciskiem folder Reservations → New Reservation.",
        "Wpisz nazwę PC-UCZEN01, adres IP 192.168.50.110 oraz skopiowany adres MAC bez zmieniania cyfr. Wybierz typ DHCP i kliknij Add. Rezerwacja jest gotowa, ale klient musi odnowić dzierżawę, aby odebrać wskazany adres.",
      ], "Opcja 006 przekazuje DNS, a opcja 015 nazwę domeny DNS. W środowisku domenowym klient powinien używać wewnętrznego DNS kontrolera domeny, a nie przypadkowego publicznego serwera DNS.")}
      ${dhcpProcedure("Sprawdzenie dzierżawy i diagnozowanie błędu", "Test wykonujesz na kliencie, ponieważ dopiero wtedy widać, czy serwer rzeczywiście przekazał właściwą konfigurację.", [
        "Na komputerze klienckim kliknij Start, wpisz cmd i otwórz Wiersz polecenia. Nie musisz uruchamiać go jako administrator, aby odczytać konfigurację.",
        "Wpisz ipconfig /release i naciśnij Enter. Następnie wpisz ipconfig /renew. Drugie polecenie powoduje ponowne zwrócenie się klienta do serwera DHCP o adres.",
        "Wpisz ipconfig /all. Przy właściwej karcie LAB sprawdź: IPv4 Address z zakresu 192.168.50.100–192.168.50.150, DHCP Server 192.168.50.10 oraz DNS Servers 192.168.50.10. Po rezerwacji oczekiwanym adresem jest 192.168.50.110.",
        "Wróć do konsoli DHCP i otwórz Address Leases. Powinieneś widzieć klienta, jego adres, identyfikator oraz czas rozpoczęcia i wygaśnięcia dzierżawy.",
        "Jeżeli klient otrzymuje adres 169.254.x.x, nie dostał odpowiedzi DHCP. Sprawdź kolejno: czy obie maszyny są uruchomione, czy używają identycznej nazwy sieci wewnętrznej VirtualBox, czy zakres jest aktywny oraz czy klient ma ustawione automatyczne IPv4.",
      ], "Nie zmieniaj jednocześnie kilku elementów. Po każdej poprawce ponów ipconfig /renew i sprawdź tylko jedną hipotezę — wtedy łatwo ustalisz prawdziwą przyczynę problemu.")}
    </div>`;
  }

  function renderSambaProcedures() {
    return `<div class="configuration-chapter">
      <p class="configuration-lead">W tej lekcji serwer Linux ma nazwę <b>LIN-SRV01</b>, a udział nazywa się <b>materialy</b>. Samba udostępnia pliki w sieci, ale nie zastępuje praw Linux: konto musi mieć dostęp zarówno do udziału Samba, jak i do folderu w systemie plików.</p>
      ${dhcpProcedure("Przygotowanie Samby na serwerze Linux", "Najpierw sprawdzasz, czy obraz openSUSE używany w pracowni zawiera pakiety Samba. Nie instaluj pakietów z przypadkowych repozytoriów ani nie wykonuj zmian na prawdziwym serwerze szkoły.", [
        "Zaloguj się do serwera Linux na koncie, które może używać sudo. Otwórz menu aplikacji, wpisz Terminal i kliknij wynik o tej nazwie. Wpisz whoami i naciśnij Enter, aby sprawdzić bieżące konto.",
        "W Terminalu wpisz sudo zypper search -s samba i naciśnij Enter. Podaj hasło administratora, jeśli system o nie poprosi. Na liście odszukaj pakiet samba; jeżeli nie jest dostępny w obrazie laboratorium, zatrzymaj się i skorzystaj z obrazu lub rozwiązania wskazanego przez nauczyciela.",
        "Jeżeli pakiet jest dostępny, wpisz sudo zypper install samba samba-client i potwierdź instalację literą y, gdy zypper wyświetli pytanie [y/n]. Poczekaj na komunikat o zakończeniu instalacji; nie zamykaj Terminala w trakcie pobierania.",
        "Sprawdź, jakie usługi zostały zainstalowane: wpisz systemctl list-unit-files | grep -E 'smb|nmb'. Zapisz nazwy, które kończą się na .service — w dalszych krokach najczęściej będzie to smb.service, a czasem także nmb.service.",
      ], "W nowszym środowisku DNS jest podstawowym sposobem odnajdywania serwera. Usługa nmb może być potrzebna tylko w scenariuszu, który korzysta ze starszego wyszukiwania nazw NetBIOS.")}
      ${dhcpProcedure("Użytkownicy i folder udziału", "Teraz tworzysz grupę, konta oraz folder. Dzięki temu najpierw działają prawa systemu Linux, a dopiero na nich budujesz dostęp z Windows.", [
        "W tym samym Terminalu wpisz sudo groupadd sambalab i naciśnij Enter. Jeżeli pojawi się komunikat, że grupa już istnieje, nie twórz drugiej — przejdź do następnego kroku.",
        "Dodaj ucznia do grupy poleceniem sudo usermod -aG sambalab uczen1. Aby sprawdzić rezultat, wpisz id uczen1; w wyniku powinna pojawić się grupa sambalab.",
        "Utwórz katalog dla udziału, wpisując sudo install -d -o root -g sambalab -m 2770 /srv/samba/materialy. Polecenie tworzy folder, nadaje mu grupę sambalab i ustawia bit setgid, dzięki któremu nowe pliki będą dziedziczyć tę grupę.",
        "Sprawdź prawa do katalogu poleceniem ls -ld /srv/samba/materialy. W wierszu wyniku odszukaj nazwę grupy sambalab oraz literę s w prawach grupy; oznacza ona działający bit setgid.",
        "Ustaw hasło do Samby, wpisując sudo smbpasswd -a uczen1. Dwa razy wpisz nowe hasło do udziału. Jest to hasło używane przy łączeniu z Windows; konto uczen1 musi wcześniej istnieć także w systemie Linux.",
      ], "Nie używaj konta root do połączenia z udziałem. Zwykłe konto Samba ułatwia sprawdzenie, czy prawa do folderu są rzeczywiście poprawne.")}
      ${dhcpProcedure("Dodanie udziału w pliku smb.conf", "Plik smb.conf jest główną konfiguracją Samby. Najpierw zachowujesz kopię, potem dopisujesz niewielki, czytelny blok udziału i sprawdzasz jego składnię.", [
        "W Terminalu utwórz kopię bezpieczeństwa poleceniem sudo cp /etc/samba/smb.conf /etc/samba/smb.conf.before-lab. Nie pomijaj tego kroku: w razie literówki możesz przywrócić pierwotny plik.",
        "Otwórz plik do edycji poleceniem sudo nano /etc/samba/smb.conf. Przewiń na sam dół pliku, używając strzałek; nie usuwaj istniejących sekcji globalnych, jeśli instrukcja nauczyciela nie mówi inaczej.",
        "W nowej linii wklej blok: [materialy], path = /srv/samba/materialy, browseable = yes, read only = no, valid users = @sambalab, force group = sambalab, create mask = 0660 oraz directory mask = 2770. Każde ustawienie wpisz w osobnej linii; znak @ przed sambalab oznacza grupę Linux.",
        "W nano naciśnij Ctrl+O, aby zapisać plik. Gdy pojawi się nazwa /etc/samba/smb.conf, zatwierdź ją Enterem. Następnie naciśnij Ctrl+X, aby wrócić do Terminala.",
        "Sprawdź konfigurację poleceniem testparm. Jeżeli program pokaże błąd z numerem linii, ponownie otwórz smb.conf, popraw wskazaną literówkę, zapisz plik i uruchom testparm jeszcze raz. Do restartu przechodzisz dopiero po braku błędów.",
      ], "Parametr valid users ogranicza dostęp do grupy sambalab. Parametr read only = no pozwala zapisywać, ale tylko wtedy, gdy konto ma również prawa do folderu /srv/samba/materialy.")}
      ${dhcpProcedure("Uruchomienie usługi i otwarcie dostępu w zaporze", "Po zapisaniu poprawnego pliku uruchamiasz Sambę i dopuszczasz ruch wyłącznie w strefie używanej przez sieć laboratoryjną.", [
        "W Terminalu wpisz sudo systemctl enable --now smb.service. Następnie wpisz systemctl status smb.service. Odszukaj zielony lub tekstowy status active (running); jeśli usługa nie działa, odczytaj pierwsze linie błędu i ponownie sprawdź wynik testparm.",
        "Jeżeli scenariusz wymaga usługi nmb, uruchom ją analogicznie poleceniem sudo systemctl enable --now nmb.service. W przeciwnym razie nie włączaj jej tylko dlatego, że występuje w innych poradnikach.",
        "Sprawdź strefę przypisaną do karty LAB: wpisz sudo firewall-cmd --get-active-zones. Odszukaj nazwę strefy przy interfejsie laboratoryjnym, na przykład internal.",
        "Dodaj usługę Samba do tej strefy poleceniem sudo firewall-cmd --permanent --zone=internal --add-service=samba, zastępując internal nazwą strefy widoczną u Ciebie. Następnie wpisz sudo firewall-cmd --reload.",
        "Potwierdź ustawienie poleceniem sudo firewall-cmd --zone=internal --list-services. Na liście powinna znaleźć się usługa samba. Jeśli laboratorium używa SELinux, sprawdź jego status poleceniem getenforce i wykonaj dodatkowe polecenia dotyczące kontekstu wyłącznie według scenariusza nauczyciela.",
      ], "Nie wyłączaj zapory ani SELinux „dla testu”. Prawidłowe rozwiązanie polega na dopuszczeniu konkretnej usługi w konkretnej strefie, a nie na wyłączaniu ochrony całego serwera.")}
      ${dhcpProcedure("Test udziału na Linuxie i Windows", "Ostatni etap wykonujesz z perspektywy klienta. Wtedy sprawdzasz jednocześnie nazwę serwera, zaporę, hasło Samba i prawa do plików.", [
        "Na serwerze Linux wpisz smbclient -L localhost -U uczen1. Po wpisaniu hasła Samba na liście powinien pojawić się udział materialy. Jeżeli go nie ma, wróć do testparm i sprawdź nazwę sekcji [materialy].",
        "Uruchom komputer z Windows w tej samej sieci LAB co LIN-SRV01. Kliknij ikonę folderu na pasku zadań albo naciśnij Win+E, aby otworzyć Eksplorator plików.",
        "Kliknij pasek adresu u góry okna, wpisz \\\\LIN-SRV01\\materialy i naciśnij Enter. Gdy nazwa serwera nie rozwiązuje się w laboratorium, użyj jego znanego adresu: \\\\adres_IP_serwera\\materialy.",
        "W oknie logowania wpisz nazwę użytkownika LIN-SRV01\\uczen1 albo uczen1 — sposób zależy od konfiguracji serwera — oraz hasło ustawione poleceniem smbpasswd. Zaznacz zapamiętywanie poświadczeń tylko wtedy, gdy nauczyciel tego wymaga.",
        "Utwórz w udziale krótki plik tekstowy, na przykład test-samba.txt. Wróć do Linuxa i wpisz ls -l /srv/samba/materialy oraz getfacl /srv/samba/materialy/test-samba.txt. Sprawdź, czy grupa pliku to sambalab, a uprawnienia odpowiadają założeniom udziału.",
      ], "Jeżeli Windows nadal używa starych danych logowania, otwórz Wiersz polecenia i wpisz net use * /delete. Potwierdź usunięcie sesji, zamknij Eksplorator i połącz się z udziałem jeszcze raz na właściwym koncie.")}
    </div>`;
  }

  function clickHelpForStep(unit, stepText) {
    const title = unit.title.toLocaleLowerCase("pl");
    const text = `${title} ${stepText}`.toLocaleLowerCase("pl");
    const step = stepText.toLocaleLowerCase("pl");

    if (/virtualbox|maszyn.*wirtual|migawk|klon|guest additions/.test(title)) {
      if (/zasob|ram|pamięć|procesor|procesory|rdzeni|cpu/.test(step)) return "W VirtualBox Manager zaznacz maszynę po lewej stronie i kliknij Ustawienia. W lewym menu wybierz System: na karcie Płyta główna ustaw suwak Pamięć bazowa, a następnie przejdź na kartę Procesor i wybierz liczbę procesorów. Na końcu kliknij OK.";
      if (/nowa|utwórz.*maszyn|tworzen.*maszyn/.test(step)) return "W VirtualBox Manager kliknij przycisk Nowa na górnym pasku. W kreatorze wpisz nazwę maszyny, wybierz folder jej zapisu, a niżej wybierz typ Microsoft Windows lub Linux oraz właściwą wersję systemu. Przechodź dalej przyciskiem Dalej.";
      if (/dysk|iso|obraz|nośnik/.test(step)) return "W VirtualBox zaznacz maszynę i kliknij Ustawienia. Dysk konfigurujesz w Pamięć masowa: kliknij ikonę dysku lub napędu optycznego, a po prawej wybierz plik ISO. Parametry dysku wirtualnego ustawiasz w kreatorze Nowa, w kroku Dysk twardy.";
      if (/sieć|nat|mostek|host-only|wewnętrzn/.test(step)) return "W VirtualBox zaznacz maszynę i kliknij Ustawienia → Sieć. Na karcie Karta 1 zaznacz Włącz kartę sieciową, a z listy Podłączona do wybierz wskazany tryb, np. NAT lub Sieć wewnętrzna. Po wpisaniu nazwy sieci kliknij OK.";
      if (/migawk|snapshot/.test(step)) return "Najpierw wyłącz maszynę albo zapisz jej stan zgodnie z poleceniem. W VirtualBox zaznacz ją po lewej, kliknij Migawki, a następnie ikonę plusa lub Utwórz. Wpisz czytelną nazwę migawki i zatwierdź.";
      if (/uruchom|start/.test(step)) return "W VirtualBox zaznacz właściwą maszynę po lewej stronie i kliknij Uruchom na górnym pasku. Gdy pojawi się okno maszyny, kliknij w jego wnętrzu, aby przekazać klawiaturę i mysz do systemu gościa.";
      return "W VirtualBox Manager najpierw zaznacz właściwą maszynę po lewej stronie. Następnie użyj przycisku Ustawienia, Migawki albo Uruchom na górnym pasku — nazwa przycisku odpowiada czynności opisanej w kroku.";
    }
    if (/guest additions/.test(text)) return "Uruchom system gościa w VirtualBox. W górnym pasku okna maszyny kliknij Urządzenia → Włóż obraz płyty z dodatkami gościa. W systemie gościa otwórz ten wirtualny napęd, uruchom instalator odpowiedni dla systemu i po zakończeniu zrestartuj maszynę.";
    if (/instal.*windows|instalator.*windows|oobe|ekran.*instalac|nośnik.*instalacyj/.test(text)) return "Uruchom maszynę z podłączonym obrazem ISO Windows. Na pierwszym ekranie instalatora wybierz język i układ klawiatury, kliknij Dalej → Zainstaluj teraz, a następnie czytaj nazwę każdej strony kreatora przed wybraniem opcji. Do wyboru dysku przejdź dopiero po zaakceptowaniu licencji.";
    if (/windows update|aktualizacj.*windows|aktualizacj.*sterownik/.test(text)) return "Kliknij Start → Ustawienia → Windows Update. Użyj przycisku Sprawdź aktualizacje, a opcjonalne sterowniki znajdziesz w Opcje zaawansowane → Aktualizacje opcjonalne. Po instalacji wykonaj restart tylko wtedy, gdy Windows o niego poprosi.";
    if (/menedżer urządzeń|devmgmt/.test(text)) return "Kliknij prawym przyciskiem Start i wybierz Menedżer urządzeń albo naciśnij Win + R, wpisz devmgmt.msc i zatwierdź Enterem. Właściwości urządzenia otworzysz dwuklikiem na jego nazwie.";
    if (/secpol|zasady haseł|blokad[ay] kont|gpedit|zasad[ay] grupy/.test(text)) return "Naciśnij Win + R, wpisz secpol.msc (dla zasad zabezpieczeń) albo gpedit.msc (dla zasad grupy) i naciśnij Enter. W lewym drzewie rozwiń wskazaną gałąź, a ustawienie otwórz dwuklikiem; wybór zatwierdź przyciskiem Zastosuj, potem OK.";
    if (/regedit|rejestr|hklm|hkcu/.test(text)) return "Kliknij Start, wpisz regedit i otwórz Edytor rejestru. W lewym drzewie rozwijaj kolejne gałęzie ścieżki, a nowy klucz lub wartość dodaj prawym przyciskiem myszy na właściwym folderze. Przed zmianą wyeksportuj tylko klucz wskazany w ćwiczeniu.";
    if (/\bmmc\b|przystawk/.test(text)) return "Naciśnij Win + R, wpisz mmc i naciśnij Enter. W otwartym oknie kliknij Plik → Dodaj/Usuń przystawkę, wybierz potrzebne narzędzie, kliknij Dodaj, a na końcu OK. Konsolę zapiszesz przez Plik → Zapisz jako.";
    if (/adres.*statycz|ipv4|karta sieciowa|dns|brama/.test(text)) {
      if (/opensuse|linux|networkmanager|nmcli/.test(text)) return "Otwórz menu aplikacji → System → Terminal, albo wejdź do Cockpitu i wybierz Networking. Kliknij kartę sieciową używaną w LAB, potem Edit → IPv4.";
      return "Kliknij Start → Ustawienia → Sieć i Internet → Zaawansowane ustawienia sieci → Więcej opcji karty sieciowej. Kliknij prawym przyciskiem kartę LAB → Właściwości → Internet Protocol Version 4 (TCP/IPv4) → Właściwości.";
    }
    if (/dhcp|zakres|dzierżaw|rezerwac/.test(text)) return "Otwórz Menedżer serwera → Narzędzia → DHCP. Rozwiń nazwę serwera i kliknij IPv4; do zakresu użyj prawego przycisku myszy na IPv4.";
    if (/dns|stref|rekord/.test(text)) return "Otwórz Menedżer serwera → Narzędzia → DNS. Rozwiń nazwę serwera; strefy i rekordy dodajesz prawym przyciskiem myszy w odpowiednim folderze.";
    if (/lusrmgr|użytkownik|grup|hasł|konto/.test(text) && !/linux|opensuse|sudo|useradd|groupadd/.test(text)) return "Kliknij Start i wpisz Zarządzanie komputerem albo naciśnij Win + R, wpisz lusrmgr.msc i naciśnij Enter. Rozwiń Użytkownicy i grupy lokalne; nowe konto lub grupę dodasz prawym przyciskiem myszy w folderze Użytkownicy albo Grupy.";
    if (/domen|active directory|ad ds|jednostk/.test(text)) return "Na Windows Server otwórz Menedżer serwera. Do instalacji roli wybierz Zarządzaj → Dodaj role i funkcje; do kont i jednostek wybierz Narzędzia → Active Directory Users and Computers.";
    if (/dysk|partycj|wolumin|ntfs|diskmgmt/.test(text) && !/linux|opensuse|fstab|mount/.test(text)) return "Kliknij Start i wpisz Zarządzanie dyskami albo naciśnij Win + R, wpisz diskmgmt.msc i naciśnij Enter. W dolnej części okna odszukaj właściwy dysk; większość operacji zaczyna się po kliknięciu prawym przyciskiem na partycji lub nieprzydzielonym miejscu.";
    if (/samba|smb/.test(text) && /linux|opensuse|terminal|zypper|systemctl|udział/.test(text)) return "Otwórz menu aplikacji → System → Terminal. Pakiet zainstaluj poleceniem sudo zypper install samba. Ustawienia udziału zapisuje się w pliku /etc/samba/smb.conf, który otworzysz na przykład poleceniem sudo nano /etc/samba/smb.conf; po zapisie sprawdź plik poleceniem testparm i przeładuj usługę przez sudo systemctl restart smb.";
    if (/udostępn|smb|folder/.test(text) && !/linux|opensuse|samba/.test(text)) return "Otwórz Eksplorator plików i odszukaj wskazany folder. Kliknij go prawym przyciskiem → Właściwości; zakładki Udostępnianie i Zabezpieczenia prowadzą odpowiednio do udziału i praw NTFS. Po zmianie kliknij Zastosuj, a następnie OK.";
    if (/zapora|defender|firewall/.test(text)) return /opensuse|linux/.test(text)
      ? "Otwórz Terminal. Polecenia do firewalld wpisuj po jednym, a po każdym naciśnij Enter; aktualny stan sprawdzisz przez sudo firewall-cmd --get-active-zones."
      : "Kliknij Start i wpisz Zapora Windows Defender z zabezpieczeniami zaawansowanymi. Reguły przychodzące i wychodzące znajdziesz po lewej stronie okna.";
    if (/rola|funkcj|iis|ftp|wsus|wds|rras|serwer wydruku|serwer plików/.test(text)) return "Otwórz Menedżer serwera → Zarządzaj → Dodaj role i funkcje. Wybierz Instalacja oparta na rolach lub funkcjach, wskaż bieżący serwer, zaznacz wymaganą rolę i przechodź Dalej aż do przycisku Zainstaluj. Po instalacji narzędzie do roli znajdziesz w prawym górnym rogu pod Narzędzia.";
    if (/zypper|pakiet|repozytor/.test(text)) return "Otwórz menu aplikacji → System → Terminal. Wpisuj pełne polecenie zypper, naciśnij Enter i przeczytaj pytanie o potwierdzenie; gdy pojawi się [y/n], wpisz y i Enter.";
    if (/sudo|uprawnien|chmod|chown|właściciel|grup[ay]/.test(text) && /linux|opensuse|terminal|bash/.test(text)) return "Otwórz Terminal. Najpierw wpisz pwd i ls -l, aby sprawdzić katalog, nazwę pliku, właściciela i uprawnienia. Dopiero potem wpisz polecenie sudo, chmod albo chown dokładnie z nazwą pliku podaną w kroku i potwierdź hasłem administratora, gdy system o nie poprosi.";
    if (/ssh|zdaln.*połączen/.test(text)) return "Otwórz Terminal na komputerze klienckim. Wpisz ssh nazwa_użytkownika@adres_IP_serwera, na przykład ssh uczen@192.168.50.10, i naciśnij Enter. Przy pierwszym połączeniu potwierdź odcisk klucza wyłącznie wtedy, gdy adres serwera zgadza się z planem laboratorium.";
    if (/yast/.test(text)) return "Otwórz menu aplikacji i wpisz YaST. Uruchom wskazany moduł, na przykład Software Management albo Network Settings, wybierz element z lewego menu, wprowadź zmianę i zatwierdź przyciskiem OK lub Zastosuj. Gdy YaST prosi o hasło administratora, wpisz je dopiero po sprawdzeniu nazwy modułu.";
    if (/systemctl|journalctl|usług|proces/.test(text)) return "Otwórz Terminal. Nazwę usługi wpisz na końcu polecenia, np. systemctl status apache2. Wynik czytaj od góry: active (running) oznacza, że usługa działa.";
    if (/plik|katalog|find|archiw|kompres/.test(text) && /opensuse|linux|bash|terminal/.test(text)) return "Otwórz Terminal. Zanim użyjesz polecenia zmieniającego lub usuwającego pliki, wpisz pwd i ls -la — zobaczysz, gdzie jesteś i jakie pliki znajdują się w katalogu.";
    if (/opensuse|linux|bash|terminal|cockpit/.test(text)) return "Otwórz menu aplikacji → System → Terminal. Jeżeli krok dotyczy Cockpitu, w przeglądarce otwórz adres serwera z portem 9090, zaloguj się i wybierz odpowiednią pozycję z lewego menu.";
    if (/windows server/.test(text)) return "Kliknij Start → Menedżer serwera. W tym programie Zarządzaj służy do instalacji ról, a Narzędzia otwierają konsolę konkretnej usługi.";
    if (/powershell/.test(text)) return "Kliknij Start, wpisz Windows PowerShell, kliknij prawym przyciskiem wynik i wybierz Uruchom jako administrator, jeżeli krok zmienia konfigurację systemu. W niebieskim oknie wpisz polecenie dokładnie w jednej linii i zatwierdź klawiszem Enter.";
    if (/cmd|wiersz polecenia/.test(text)) return "Kliknij Start, wpisz cmd i wybierz Wiersz polecenia. Gdy polecenie ma zmieniać ustawienia systemu, kliknij wynik prawym przyciskiem i wybierz Uruchom jako administrator; w przeciwnym razie wystarczy zwykłe otwarcie okna.";
    if (/eksplorator|plik|folder|katalog/.test(text)) return "Otwórz Eksplorator plików z paska zadań albo skrótem Win + E. W pasku adresu wpisz ścieżkę podaną w kroku i naciśnij Enter; właściwości elementu otworzysz po kliknięciu go prawym przyciskiem myszy.";
    return "Otwórz menu Start i wpisz nazwę narzędzia lub ustawienia wymienioną w kroku. Wybierz wynik o tej samej nazwie, odszukaj opisane pole albo przycisk i wprowadzaj tylko wartość podaną w instrukcji. Zatwierdź przyciskiem Zastosuj lub OK, jeżeli okno go wyświetla.";
  }

  function needsStepLocation(stepText, hint, commonLocation) {
    if (hint !== commonLocation) return true;
    const text = stepText.toLocaleLowerCase("pl");
    const alreadyExplained = /→|kliknij|otwórz|wpisz |uruchom (?:cmd|powershell|terminal|[a-z]+\.msc)|prawym przyciskiem|poleceni[ea]/.test(text);
    const changesConfiguration = /\b(utwórz|dodaj|ustaw|wybierz|zainstaluj|włącz|wyłącz|zmień|nadaj|skonfiguruj|przydziel|usuń|odtwórz|rozszerz|zmniejsz|zapisz jako|zapisz ustawienie)\b/.test(text);
    return changesConfiguration && !alreadyExplained;
  }

  function stepAttention(unit, stepText) {
    const title = unit.title.toLocaleLowerCase("pl");
    const text = stepText.toLocaleLowerCase("pl");
    if (/wpisz|podaj|nazwa|adres|maska|brama|hasł|wartoś/.test(text)) return "Wpisuj wartość dokładnie tak, jak podano w scenariuszu: jedna dodatkowa spacja, literówka albo inny adres może zmienić wynik konfiguracji.";
    if (/zainstaluj|dodaj rol|pakiet|funkcj/.test(text)) return "Nie zaznaczaj dodatkowych składników „na zapas”. Po zakończeniu poczekaj na komunikat o powodzeniu i dopiero wtedy przejdź do konfiguracji usługi.";
    if (/uruchom|restart|systemctl|włącz/.test(text)) return "Po uruchomieniu odczytaj komunikat lub stan usługi. Samo zamknięcie okna nie potwierdza, że usługa działa poprawnie.";
    if (/zapisz|zastosuj|ok|finish|zakończ/.test(text)) return "Przed zatwierdzeniem jeszcze raz porównaj widoczne pola z instrukcją. Po kliknięciu przycisku zapisującego wróć do listy lub ustawienia i sprawdź, czy zmiana jest widoczna.";
    if (/usuń|wyłącz|odtwórz|przywróć/.test(text)) return "To działanie może cofnąć wcześniejszą pracę. Sprawdź nazwę obiektu lub migawki przed zatwierdzeniem i wykonuj je wyłącznie w laboratorium.";
    if (/virtualbox|maszyn.*wirtual|migawk/.test(title)) return "Pracuj na właściwej maszynie z listy po lewej stronie VirtualBox. Po zmianie sprawdź jej nazwę i dopiero potem przejdź dalej.";
    if (/linux|opensuse|bash|zypper|systemd|samba/.test(title)) return "W Terminalu wykonuj tylko jedno polecenie naraz. Po naciśnięciu Enter przeczytaj wynik; jeżeli pojawi się błąd, nie wpisuj kolejnego polecenia, dopóki go nie wyjaśnisz.";
    if (/sieć|dhcp|dns|adres|port|wireshark|vlan|nat/.test(title)) return "Porównaj ustawienie z planem adresacji LAB. Nie mieszaj sieci laboratoryjnej z prawdziwą siecią szkolną i nie zmieniaj kilku parametrów jednocześnie.";
    if (/domen|active directory|użytkownik|grup|konto/.test(title)) return "Sprawdź, czy konfigurujesz obiekt w swojej domenie laboratoryjnej i we właściwym folderze lub jednostce organizacyjnej.";
    return "Wykonaj tylko tę jedną czynność, a przed kolejnym krokiem upewnij się, że okno pokazuje oczekiwany efekt. Dzięki temu łatwiej znaleźć ewentualną pomyłkę.";
  }

  function procedureOverview(unit) {
    const title = unit.title.toLocaleLowerCase("pl");
    if (/sieć|adres|dns|dhcp|port|wireshark|vlan|nat/.test(title)) return "Najpierw odczytaj aktualną konfigurację i porównaj ją z planem laboratorium. Dopiero później zmieniaj pola lub uruchamiaj usługę. Po zapisaniu ustawień wykonaj test z drugiej maszyny albo poleceniem diagnostycznym.";
    if (/domen|active directory|użytkownik|grup|konto/.test(title)) return "Wykonuj działania na koncie administracyjnym wyłącznie w swojej maszynie laboratoryjnej. Po utworzeniu obiektu sprawdź jego właściwości, a następnie przetestuj wynik na zwykłym koncie — to pokazuje rzeczywisty efekt konfiguracji.";
    if (/linux|opensuse|bash|zypper|ssh|firewalld|systemd/.test(title)) return "W Terminalu wykonuj polecenia pojedynczo. Po każdym przeczytaj wynik, a przed zmianą pliku sprawdź jego nazwę i lokalizację. Gdy zmieniasz usługę, na końcu sprawdź jej stan oraz log.";
    if (/virtualbox|maszyn.*wirtual|migawk|klon/.test(title)) return "Przed zmianą wyłącz maszynę, gdy instrukcja tego wymaga, i zapisz jej stan początkowy. Wybieraj tylko ustawienia opisane w ćwiczeniu, a po uruchomieniu maszyny potwierdź rezultat prostym testem.";
    return "";
  }

  function procedureFinalCheck(unit) {
    const title = unit.title.toLocaleLowerCase("pl");
    if (/sieć|adres|dhcp|dns|ping|port|wireshark|vlan|nat/.test(title)) return "Na końcu odczytaj konfigurację na maszynie, której dotyczy ćwiczenie, i wykonaj wskazany test łączności. Wynik porównaj z planem adresacji LAB.";
    if (/domen|active directory|użytkownik|grup|konto|uprawnien/.test(title)) return "Na końcu sprawdź właściwości utworzonego obiektu, a uprawnienia potwierdź na koncie zwykłego użytkownika. Nie oceniaj dostępu wyłącznie z konta administratora.";
    if (/linux|opensuse|bash|zypper|ssh|firewalld|systemctl|journalctl/.test(title)) return "Na końcu sprawdź stan usługi lub konfiguracji odpowiednim poleceniem oraz odczytaj ostatnie komunikaty dziennika. Zapisz jedną linię wyniku jako dowód wykonania zadania.";
    if (/virtualbox|maszyn.*wirtual|migawk|klon/.test(title)) return "Na końcu uruchom maszynę i sprawdź rezultat wewnątrz systemu gościa. Potwierdź również, że wybrana karta sieciowa oraz nazwa VM odpowiadają scenariuszowi LAB.";
    return "Na końcu sprawdź, czy ustawienie zostało zapisane, i wykonaj test opisany w zadaniu. Zapisz krótki dowód wyniku, zanim oznaczysz lekcję jako ukończoną.";
  }

  function procedurePlan(unit) {
    const title = unit.title.toLocaleLowerCase("pl");
    if (/virtualbox|maszyn.*wirtual|migawk|klon/.test(title)) return {
      prepare: ["Przygotowanie komputera hosta", "Zanim utworzysz maszynę, sprawdź wymagania hosta i przygotuj bezpieczne miejsce na pliki laboratoryjne."],
      configure: ["Tworzenie i konfiguracja maszyny wirtualnej", "W tej części zakładasz maszynę oraz ustawiasz tylko te zasoby, które są potrzebne w scenariuszu."],
      verify: ["Uruchomienie i kontrola maszyny", "Na końcu sprawdzasz działanie wewnątrz systemu gościa, a nie tylko w oknie ustawień VirtualBox."],
    };
    if (/sieć|adres|dns|dhcp|port|wireshark|vlan|nat/.test(title)) return {
      prepare: ["Przygotowanie planu sieci", "Najpierw ustal urządzenia, interfejsy i wartości adresacji używane wyłącznie w laboratorium."],
      configure: ["Konfiguracja usługi lub interfejsu", "Wprowadź ustawienia zgodne z planem. Zmieniaj jedną warstwę naraz: adresację, usługę albo regułę dostępu."],
      verify: ["Test komunikacji i odczyt konfiguracji", "Po zapisaniu ustawień potwierdź wynik na właściwej maszynie lub z drugiego komputera w sieci LAB."],
    };
    if (/domen|active directory|użytkownik|grup|konto|tożsamo/.test(title)) return {
      prepare: ["Przygotowanie środowiska i konta", "Sprawdź, czy pracujesz we właściwej domenie laboratoryjnej i na koncie z wymaganymi uprawnieniami."],
      configure: ["Tworzenie lub zmiana obiektów", "Wprowadź konfigurację w odpowiedniej konsoli, dbając o nazwę, lokalizację obiektu i przypisane uprawnienia."],
      verify: ["Sprawdzenie efektu z perspektywy użytkownika", "Potwierdź wynik na właściwym obiekcie albo zwykłym koncie użytkownika, nie tylko jako administrator."],
    };
    if (/linux|opensuse|bash|zypper|ssh|firewalld|systemd|apache|plik|katalog/.test(title)) return {
      prepare: ["Przygotowanie terminala i środowiska", "Ustal konto, katalog roboczy oraz plik albo usługę, których dotyczy zadanie, zanim wykonasz zmianę."],
      configure: ["Wprowadzenie konfiguracji", "Wykonuj polecenia pojedynczo lub zapisz zmianę w odpowiednim pliku konfiguracyjnym. Po każdym poleceniu czytaj komunikat zwrotny."],
      verify: ["Uruchomienie usługi i kontrola wyniku", "Sprawdź stan usługi, log albo wynik polecenia diagnostycznego; to potwierdza faktyczny efekt wykonanych czynności."],
    };
    if (/rola|iis|ftp|wsus|wds|rras|serwer/.test(title)) return {
      prepare: ["Przygotowanie serwera", "Sprawdź nazwę serwera, jego adresację i rolę w laboratorium, zanim rozpoczniesz instalację komponentów."],
      configure: ["Instalacja i konfiguracja roli", "Dodaj wymagane składniki, a następnie otwórz konsolę danej roli i skonfiguruj wartości opisane w scenariuszu."],
      verify: ["Test działania usługi", "Po instalacji sprawdź usługę na serwerze i — jeżeli jest to możliwe — wykonaj test z klienta laboratoryjnego."],
    };
    return {
      prepare: ["Przygotowanie do działania", "Zapisz stan początkowy i otwórz właściwe narzędzie. Dzięki temu masz punkt odniesienia przed zmianą."],
      configure: ["Wykonanie konfiguracji", "Wprowadzaj ustawienia pojedynczo, zgodnie z kolejnością scenariusza, a po każdej zmianie upewnij się, że została zapisana."],
      verify: ["Sprawdzenie rezultatu", "Wykonaj opisany test i zapisz wynik. Dopiero pozytywny rezultat potwierdza poprawność konfiguracji."],
    };
  }

  function assignProcedureStage(text, index, total) {
    const value = text.toLocaleLowerCase("pl");
    const verification = /\b(test|sprawdź|weryfik|ping|ipconfig|nslookup|status|journal|log|odnów|uruchom.*klient|zaloguj|otwórz.*przeglądar)/.test(value);
    const preparation = /\b(przygotuj|pobierz|włącz|wyłącz|utwórz migawk|zaplanuj|wybierz.*katalog|sprawdź wirtualizację|odczytaj)/.test(value);
    if (verification && index >= Math.max(1, total - 2)) return "verify";
    if (preparation || index === 0) return "prepare";
    if (verification) return "verify";
    return "configure";
  }

  function renderProcedureStage(stage, plan, steps, commonLocation, unit) {
    if (!steps.length) return "";
    const [heading, description] = plan[stage];
    return `<section class="configuration-procedure procedure-stage"><header><span>ETAP PROCEDURY</span><h5>${displayHTML(heading)}</h5><p>${displayHTML(description)}</p></header><ol>${steps.map((text, index) => {
      const hint = clickHelpForStep(unit, text);
      const localHint = needsStepLocation(text, hint, commonLocation)
        ? hint
        : `Jeżeli wskazane okno nie jest jeszcze otwarte, zacznij tutaj: ${commonLocation}`;
      return `<li class="instruction-step"><div class="instruction-step-content"><span class="instruction-step-number">KROK ${String(index + 1).padStart(2, "0")}</span><p class="instruction-step-action"><b>Co zrobić:</b> ${displayHTML(text)}</p><p class="step-specific-help"><b>Gdzie wejść i co kliknąć:</b> ${displayHTML(localHint)}</p><p class="step-attention"><b>Na co zwrócić uwagę:</b> ${displayHTML(stepAttention(unit, text))}</p></div></li>`;
    }).join("")}</ol></section>`;
  }

  function renderDetailedSteps(blocks, unit) {
    const title = unit.title.toLocaleLowerCase("pl");
    const isWindowsDhcp = title.includes("serwer dhcp");
    const isSamba = /samba/.test(title);
    if (isWindowsDhcp) {
      const codeBlocks = blocks.filter(block => block.style === "Kod").map(renderBlock).join("");
      return `${renderDhcpProcedures()}${codeBlocks ? `<section class="dhcp-powershell"><h5>Wariant PowerShell</h5><p>Jeżeli nauczyciel poleci wykonać konfigurację poleceniami, użyj ich dopiero po zrozumieniu procedury w interfejsie. Polecenia wykonuj na właściwym serwerze i po każdym sprawdź komunikat zwrotny.</p>${codeBlocks}</section>` : ""}`;
    }
    if (isSamba) return renderSambaProcedures();
    const plainSteps = blocks.filter(block => block.type === "paragraph" && !block.style && compact(block.text));
    const extraBlocks = blocks.filter(block => !(block.type === "paragraph" && !block.style && compact(block.text)));
    const plan = procedurePlan(unit);
    const commonLocation = clickHelpForStep(unit, unit.title);
    const stages = { prepare: [], configure: [], verify: [] };
    plainSteps.forEach((block, index) => stages[assignProcedureStage(compact(block.text), index, plainSteps.length)].push(compact(block.text)));
    if (!stages.configure.length && stages.prepare.length > 1) stages.configure.push(stages.prepare.pop());
    const overview = procedureOverview(unit);
    return `<div class="configuration-chapter">${overview ? `<p class="configuration-lead">${displayHTML(overview)}</p>` : ""}<p class="procedure-location"><b>Gdzie pracujesz:</b> ${displayHTML(commonLocation)}</p>${renderProcedureStage("prepare", plan, stages.prepare, commonLocation, unit)}${renderProcedureStage("configure", plan, stages.configure, commonLocation, unit)}${renderProcedureStage("verify", plan, stages.verify, commonLocation, unit)}<aside class="procedure-note"><b>Po zakończeniu procedury:</b> ${displayHTML(procedureFinalCheck(unit))}</aside>${extraBlocks.map(renderBlock).join("")}</div>`;
  }

  function renderSections(blocks, unit) {
    const groups = splitSections(blocks.filter(visibleForProfile));
    const contentGroups = groups.filter(group => {
      const type = sectionType(group.label);
      return !["checks", "questions", "practice"].includes(type) && !group.blocks.some(block => block.style === "Ćwiczenie");
    });
    const sections = contentGroups.map(group => {
      const type = sectionType(group.label);
      const sectionAudience = audienceOf(group);
      if (!group.label) return renderOpening(group.blocks, unit);
      if (type === "outcomes") return "";
      if (type === "theory") return renderTheory(group, sectionAudience, unit);
      const inner = type === "steps" ? renderDetailedSteps(group.blocks, unit) : group.blocks.map(renderBlock).join("");
      const guide = "";
      const badge = sectionAudience === "both" ? "" : audienceBadge(sectionAudience);
      const heading = type === "steps"
        ? (unit.title.toLocaleLowerCase("pl").includes("serwer dhcp") ? "Konfiguracja serwera DHCP" : "Procedura — krok po kroku")
        : group.label;
      return `<section class="lesson-section section-${type} section-audience-${sectionAudience}"><h4 class="section-label">${displayHTML(heading)}${badge}</h4>${guide}${inner}</section>`;
    }).join("");
    return sections;
  }

  function renderLead(module) {
    const container = $("#moduleLead");
    if (module.id !== "start") {
      container.innerHTML = "";
      return;
    }
    if (showCyber) {
      container.innerHTML = `<div class="lead-block lead-block--cyber"><span class="eyebrow">MATERIAŁ INF.11 · SYSTEMY I SIECI</span><p>Ten widok pokazuje wspólny fundament systemów operacyjnych oraz lekcje oznaczone <b>C</b>. Dodatki cyberbezpieczeństwa dotyczą bezpiecznej konfiguracji, kont, aktualizacji, zapór, logów, kopii zapasowych i reakcji na incydent.</p></div>`;
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
    grid.innerHTML = visibleUnits(module).map(unit => {
      const done = state.done.has(unit.id);
      const opened = unit.id === firstOpen;
      const number = topicNumber(module, unit);
      const priority = unit.priority;
      const priorityLabel = priority ? '<span class="priority-label">KLUCZOWY MATERIAŁ INF.02</span>' : "";
      return `<details class="lesson-card ${done ? "is-done" : ""} ${opened ? "is-open" : ""} ${priority ? "is-priority" : ""}" id="${escapeHTML(unit.id)}" data-unit="${escapeHTML(unit.id)}" ${opened ? "open" : ""}>
        <summary>
          <span class="lesson-number">${done ? "✓" : escapeHTML(number)}</span>
          <span class="lesson-title"><small>TEMAT ${escapeHTML(number)} ${audienceBadge(audienceOf(unit))}${priorityLabel}</small><h3>${displayHTML(cleanUnitTitle(unit.title))}</h3></span>
          <span class="lesson-toggle" aria-hidden="true">+</span>
        </summary>
        <div class="lesson-content">
          ${renderSections(unit.blocks, unit)}
          <div class="lesson-footer"><span>TEMAT / ${escapeHTML(number)}</span><button class="complete-button ${done ? "is-done" : ""}" data-complete="${escapeHTML(unit.id)}">${done ? "✓ Lekcja ukończona" : "Oznacz jako zrobione"}</button></div>
        </div>
      </details>`;
    }).join("");
    $$(".lesson-card", grid).forEach(card => {
      card.addEventListener("toggle", () => {
        card.classList.toggle("is-open", card.open);
        if (card.open) {
          setActiveUnit(card.dataset.unit);
        }
      });
    });
  }

  function renderHero(module) {
    const units = visibleUnits(module);
    $("#moduleIndex").textContent = `MODUŁ ${module.number}`;
    $("#moduleLessonCount").textContent = `${units.length} TEMATÓW`;
    $("#moduleTitle").textContent = studentWording(module.displayTitle || module.navTitle);
    $("#stageCounter").textContent = `${units.length} TEMATÓW // MODUŁ ${module.number}`;
  }

  function updateProgress() {
    // Postęp pozostaje zapisany w ciasteczku i przy lekcjach, bez dodatkowego panelu w menu.
  }

  function setActiveUnit(unitId) {
    const unit = unitById.get(unitId);
    if (!unit) return;
    state.activeUnitId = unit.id;
    if (unit.module.id === state.moduleId) {
      expandedModuleIds.clear();
      expandedModuleIds.add(unit.module.id);
    }
    saveState();
    renderModuleNav();
  }

  function setCurrentModule(moduleId, focusUnitId = null, scrollTop = true) {
    let module = moduleById.get(moduleId);
    if (!module || !visibleModules().includes(module)) module = visibleModules()[0];
    if (!module) return;
    state.moduleId = module.id;
    expandedModuleIds.clear();
    expandedModuleIds.add(module.id);
    const rememberedUnit = unitById.get(state.activeUnitId);
    const canKeepRememberedUnit = rememberedUnit
      && rememberedUnit.module.id === module.id
      && visibleForProfile(rememberedUnit);
    state.activeUnitId = focusUnitId || (canKeepRememberedUnit ? state.activeUnitId : null);
    saveState();
    renderModuleNav();
    renderHero(module);
    renderLead(module);
    renderLessons(module, state.activeUnitId);
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
    setActiveUnit(unit.id);
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
      number.textContent = done ? "✓" : topicNumber(unit.module, unit);
    }
    renderModuleNav();
    updateProgress();
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
    moduleNumber: topicNumber(unit.module, unit),
    moduleTitle: unit.module.navTitle,
    title: cleanUnitTitle(unit.title),
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
    results.innerHTML = matches.map(({ item }) => `<button class="result-button" data-result-module="${escapeHTML(item.moduleId)}" data-result-unit="${escapeHTML(item.unitId)}"><span class="result-id">${escapeHTML(item.moduleNumber)}</span><span><h3>${audienceBadge(item.audience)} ${displayHTML(item.title)}</h3><p>${makeSnippet(studentWording(item.text), query)}</p></span></button>`).join("");
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
    $("#modeSwitch").addEventListener("click", () => {
      const theme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      saveTheme(theme); showToast(theme === "light" ? "Włączono jasny motyw." : "Włączono nocny motyw.");
    });
    $("#acceptCookies").addEventListener("click", () => chooseCookiePreference("accepted"));
    $("#declineCookies").addEventListener("click", () => chooseCookiePreference("rejected"));
    $("#cyberToggle").addEventListener("change", event => {
      showCyber = event.target.checked;
      localStorage.setItem(cyberOptionKey, String(showCyber));
      state.activeUnitId = null;
      renderProfileSelector();
      setCurrentModule(state.moduleId, null, false);
      showToast(showCyber ? "Dodano materiał z cyberbezpieczeństwa." : "Ukryto dodatkowy materiał z cyberbezpieczeństwa.");
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
