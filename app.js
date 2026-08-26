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
    const blocks = [...module.leadBlocks, ...module.units.flatMap(unit => unit.blocks)];
    return blocks.filter(predicate).length;
  }
  function moduleDone(module) {
    return module.units.length > 0 && module.units.every(unit => state.done.has(unit.id));
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
    const blocks = [...module.leadBlocks, ...module.units.flatMap(unit => unit.blocks)];
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

  function renderModuleNav() {
    const nav = $("#moduleNav");
    nav.innerHTML = course.modules.map(module => {
      const active = module.id === state.moduleId;
      const done = moduleDone(module);
      return `<button class="module-button ${active ? "is-active" : ""}" data-module="${escapeHTML(module.id)}" aria-current="${active ? "page" : "false"}">
        <span class="module-num">${escapeHTML(module.number)}</span>
        <span class="module-label">${escapeHTML(module.navTitle)}</span>
        <span class="module-done">${done ? "✓" : ""}</span>
      </button>`;
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
    let current = { label: "", blocks: [] };
    blocks.forEach(block => {
      if (block.style === "Heading3") {
        if (current.blocks.length || current.label) groups.push(current);
        current = { label: compact(block.text), blocks: [] };
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
    const groups = splitSections(blocks);
    return groups.map(group => {
      const type = sectionType(group.label);
      const inner = type === "steps" ? renderDetailedSteps(group.blocks, unit) : group.blocks.map(renderBlock).join("");
      if (!group.label) return `<div class="lesson-intro">${inner}</div>`;
      const guide = type === "steps" ? renderStepGuide(unit) : "";
      return `<section class="lesson-section section-${type}"><h4 class="section-label">${escapeHTML(group.label)}</h4>${guide}${inner}</section>`;
    }).join("");
  }

  function renderLead(module) {
    const container = $("#moduleLead");
    if (module.id !== "start") {
      container.innerHTML = "";
      return;
    }
    const output = [];
    let buffer = [];
    const flush = () => {
      if (buffer.length) output.push(`<div class="lead-block">${buffer.map(renderBlock).join("")}</div>`);
      buffer = [];
    };
    module.leadBlocks.forEach(block => {
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
    grid.innerHTML = module.units.map((unit, index) => {
      const done = state.done.has(unit.id);
      const opened = unit.id === firstOpen;
      return `<details class="lesson-card ${done ? "is-done" : ""} ${opened ? "is-open" : ""}" id="${escapeHTML(unit.id)}" data-unit="${escapeHTML(unit.id)}" ${opened ? "open" : ""}>
        <summary>
          <span class="lesson-number">${done ? "✓" : String(index + 1).padStart(2, "0")}</span>
          <span class="lesson-title"><small>LEKCJA ${String(index + 1).padStart(2, "0")}</small><h3>${escapeHTML(unit.title)}</h3></span>
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
    const moduleOrder = course.modules.indexOf(module);
    const exercises = blockCount(module, block => block.style === "Ćwiczenie");
    $("#moduleIndex").textContent = module.number === "BONUS" ? "PAKIET DODATKOWY" : `MODUŁ ${module.number}`;
    $("#moduleLessonCount").textContent = `${module.units.length} LEKCJI`;
    $("#moduleTitle").textContent = module.title === "Start kursu" ? course.meta.title : (module.displayTitle || module.navTitle);
    $("#moduleSummary").textContent = previewFor(module);
    $("#breadcrumb").textContent = module.navTitle;
    $("#missionName").textContent = module.navTitle;
    $("#stageCounter").textContent = `${module.units.length} TEMATÓW // MODUŁ ${module.number}`;
    $("#heroData").innerHTML = `
      <div class="data-pod"><span>POZYCJA</span><b>${String(moduleOrder + 1).padStart(2, "0")} / ${String(course.modules.length).padStart(2, "0")}</b></div>
      <div class="data-pod"><span>ĆWICZENIA</span><b>${String(exercises).padStart(2, "0")} ćwiczeń</b></div>`;
    updateModuleCompletionButton(module);
  }

  function updateProgress() {
    const total = allUnits.length;
    const done = [...state.done].filter(id => unitById.has(id)).length;
    const percent = total ? Math.round(done / total * 100) : 0;
    $("#progressNumber").textContent = done;
    $("#lessonCount").textContent = total;
    $("#progressFill").style.width = `${percent}%`;
  }

  function setCurrentModule(moduleId, focusUnitId = null, scrollTop = true) {
    const module = moduleById.get(moduleId);
    if (!module) return;
    state.moduleId = moduleId;
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
      number.textContent = done ? "✓" : String(unitById.get(unitId).index + 1).padStart(2, "0");
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
    const matches = searchIndex.map(item => {
      const titleHit = item.title.toLocaleLowerCase("pl").includes(query.toLocaleLowerCase("pl"));
      const textHit = item.text.toLocaleLowerCase("pl").includes(query.toLocaleLowerCase("pl"));
      return { item, score: (titleHit ? 10 : 0) + (textHit ? 1 : 0) };
    }).filter(result => result.score).sort((a, b) => b.score - a.score).slice(0, 18);
    hint.textContent = matches.length ? `Znaleziono ${matches.length}${matches.length === 18 ? "+" : ""} wyników.` : "Brak wyników — spróbuj krótszego lub bardziej ogólnego hasła.";
    results.innerHTML = matches.map(({ item }) => `<button class="result-button" data-result-module="${escapeHTML(item.moduleId)}" data-result-unit="${escapeHTML(item.unitId)}"><span class="result-id">${escapeHTML(item.moduleNumber)}</span><span><h3>${escapeHTML(item.title)}</h3><p>${makeSnippet(item.text, query)}</p></span></button>`).join("");
  }
  function openSearch() {
    const dialog = $("#searchDialog");
    if (!dialog.open) dialog.showModal();
    setTimeout(() => $("#searchInput").focus(), 20);
  }
  function closeSearch() { $("#searchDialog").close(); }

  function bindEvents() {
    $("#moduleNav").addEventListener("click", event => {
      const button = event.target.closest("[data-module]");
      if (button) setCurrentModule(button.dataset.module);
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
      const unit = moduleById.get(state.moduleId)?.units[0];
      if (unit) jumpToUnit(unit.id);
      else $("#moduleLead").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    $("#markModuleDone").addEventListener("click", () => {
      const module = moduleById.get(state.moduleId);
      const completed = moduleDone(module);
      module.units.forEach(unit => completed ? state.done.delete(unit.id) : state.done.add(unit.id));
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
    document.addEventListener("keydown", event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); }
      if (event.key === "Escape") closeSidebar();
    });
  }

  saveTheme(getTheme());
  bindEvents();
  initialiseCookieBanner();
  setCurrentModule(state.moduleId, null, false);
})();
