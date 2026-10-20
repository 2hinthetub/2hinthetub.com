document.addEventListener('DOMContentLoaded', function () {
  // populated by the campaign-track carousel setup below; re-run whenever a
  // hidden .campaign-list becomes visible (see the browser-window SORT
  // filters section) since a track sitting inside `display:none` measures
  // 0-width for everything, including its own true images, so any earlier
  // pass-count math done while hidden was necessarily wrong.
  var campaignTrackRefreshers = [];

  // Design-page title reveal waits for the visitor to actually scroll —
  // not just for the tab to open — so every project's title (including the
  // first one, already on screen the moment Design opens) starts the same
  // way: sitting at opacity 0 until scrolling begins. page2 sits at
  // `left: var(--tab)` even while "inactive" (that's the sliver of it
  // peeking out as a tab), which is close enough to the viewport that an
  // IntersectionObserver on its hero can fire on page load, well before
  // anyone has scrolled — page2ScrollCallbacks below is what a hero queues
  // itself into if it's asking before that first scroll has happened yet.
  var page2Scrolled = false;
  var page2ScrollCallbacks = [];
  var page2ScrollHost = document.querySelector('.page2 .contents');
  if (page2ScrollHost) {
    page2ScrollHost.addEventListener('scroll', function onFirstPage2Scroll() {
      if (page2Scrolled) return;
      page2Scrolled = true;
      var cbs = page2ScrollCallbacks.slice();
      page2ScrollCallbacks.length = 0;
      cbs.forEach(function (cb) { cb(); });
    });
  }

  // ---------------- language toggle ----------------

  var KO = {
    'bio': '<span class="ko-small">안녕하세요, 박나현 입니다. 디자인을 시작으로 기획과 프로젝트 운영까지 경험의 범위를 넓혀왔습니다. 아이디어가 하나의 결과물로 완성되는 과정과, 그 과정에서 다양한 사람들과 함께 만들어가는 일을 좋아합니다. 분야를 구분하기보다, 더 나은 경험을 만들기 위한 방법을 꾸준히 고민하고 있습니다.</span> <span class="card-trigger" role="button" tabindex="0">명함 받기</span>',
    'about-intro': '안녕하세요, 박나현 입니다.<br>디자인을 시작으로 기획과 프로젝트 운영까지 경험의 범위를 넓혀왔습니다. 아이디어가 하나의 결과물로 완성되는 과정과, 그 과정에서 다양한 사람들과 함께 만들어가는 일을 좋아합니다. 분야를 구분하기보다, 더 나은 경험을 만들기 위한 방법을 꾸준히 고민하고 있습니다.<br><br>제가 생각하는 좋은 디자인은 보는 사람의 마음에 오래 남는 장면을 만드는 것입니다. 사물 하나에 담긴 기억, 잠시 멈춰 선 순간의 온기, &ldquo;이런 것도 하는구나&rdquo; 하는 작은 발견처럼요. 그래서 무엇을 보여줄지보다, 보는 사람이 어떤 마음으로 받아들일지를 먼저 생각합니다.<br><br>모든 일은 사람과의 일이라고 생각합니다. 함께 일하는 사람들에게서 자극과 영감을 얻고, 그 경험을 다시 작업으로 이어 갑니다. 브랜드와 사람, 그리고 함께 만드는 사람들 사이에 좋은 영향을 주고받는 관계를 만드는 것. 그것이 제가 디자인과 기획을 계속하는 이유입니다.',
    'h-career': '경력',
    'career-1': '<span class="ko-small">프로젝트 매니저, 브랜드 커뮤니케이션팀, </span>ideaPLAB',
    'career-2': '<span class="ko-small">브랜드 매니저, </span>You Need My Yogurt',
    'h-history': '프로젝트 히스토리',
    'h-skills': '핵심 역량',
    'h-software': '사용 소프트웨어',
    'h-certificate': '자격증',
    'cert-1': 'GTQ 그래픽기술자격 1급',
    'cert-2': 'GTQi 그래픽기술자격 일러스트 1급',
    'skill-cat-1': '<span class="skill-tag">브랜드 아이덴티티</span><span class="skill-tag">비주얼 디렉션</span><span class="skill-tag">그래픽 디자인</span><span class="skill-tag">콘텐츠 디자인</span>',
    'skill-cat-2': '<span class="skill-tag">소셜미디어 운영</span><span class="skill-tag">콘텐츠 기획</span><span class="skill-tag">콘텐츠 촬영 및 편집</span>',
    'skill-cat-3': '<span class="skill-tag">프로젝트 기획</span><span class="skill-tag">일정 및 리소스 관리</span><span class="skill-tag">클라이언트 커뮤니케이션</span><span class="skill-tag">팀 협업 및 조율</span><span class="skill-tag">현장(오프라인) 관리</span>',
    'design-intro': '그래픽 디자이너로 활동하던 2022–2024년의 브랜딩, 에디토리얼, 웹 디자인 작업입니다.',
    'work-cat-1': 'BX / 그래픽 디자인',
    'work-desc-1': '유기농 그릭요거트 브랜드를 위한 브랜드 아이덴티티입니다. 화이트와 블루 톤에 심플한 타이포그래피와 일러스트레이션을 활용해 포스터, 패키지 라벨, 메뉴보드, 모바일 주문 UI, 엽서까지 확장했습니다.',
    'work-about-1': '브랜드의 시그니처인 요거트 플레이트와 공간의 다양한 요소를 그래픽으로 확장하며, 기존 요거트 브랜드와 차별화된 브랜드 아이덴티티를 구축했습니다.\n\n그릭요거트와 브랜드를 상징하는 화이트 &amp; 블루를 중심으로 유니드마이요거트만의 앤틱하고 따뜻한 무드를 시각화한 그래픽디자인 작업과 콘텐츠 기획을 포함합니다.',
    'work-role-1': '<strong class="work-meta-strong">Brand Manager</strong><br>그래픽 디자인<br>콘텐츠 디자인',
    'work-cat-2': 'BI 디자인<br>제품 디자인',
    'work-desc-2': '‘갈피를 못 잡다’라는 말과 달리, 유영하는 난주의 모습에서 갈피를 찾아가는 이미지를 발견했습니다.\n난주의 움직임에 ‘갈피를 찾는 과정’과 행운의 의미를 담아 책장 사이에서 작은 행운을 발견하는 브랜드를 만들었습니다.\n\n로고, 컬러, 타이포그래피 시스템을 포함한 브랜드 아이덴티티와 실물 책갈피 제품을 디자인했습니다.',
    'work-cat-3': '그래픽 디자인',
    'work-desc-3': 'a PEACE of cake는 우리말로 ‘식은 죽 먹기’, 또는 ‘아주 쉬운 일’ 이라는 뜻의 “a piece of cake” 이라는 말에서 따와 만들어졌습니다.\n\n마음 상태를 평화롭게 만드는 일을 간단한 일로 만들어 줄 수 있도록 내면의 평화를 위해 여러 가지 방안을 제시하고 마음을 잠시 내려놓는 일상의 작은 순간들을 일러스트 카드에 담았습니다.',
    'credits-label': '이미지 출처:',
    'share-personal': '개인작업 <span class="work-share-pct">100%</span>',
    'share-adidas': 'BC팀 <span class="work-share-pct">75%</span>',
    'share-lect': 'BC팀 <span class="work-share-pct">90%</span>',
    'share-chanel': 'BC팀 <span class="work-share-pct">60%</span>',
    'card-draw-hint': '카드를 눌러 한 장 뽑아보세요',
    'work-cat-4': '그래픽 디자인<br>에디토리얼 디자인',
    // project names that switch with the language on the home / index (the detail title stays English)
    'title-ranchu': '난주',
    'title-ranchu-idx': '난주',
    'title-summer': '넌 어떤 여름을 떠올릴까?',
    'title-summer-idx': '넌 어떤 여름을 떠올릴까?',
    'work-desc-4': 'Summer Nostalgia를 전하는 이 프로젝트는 누군가의 지나간 여름을 짧은 글과 일러스트로 엮어낸 에디토리얼 북과, 지금의 여름을 담을 일회용 필름 카메라, 여름의 조각을 모은 스티커로 구성됩니다.\n\n책 속 사진은 오래된 디지털카메라로 찍은 듯한 여름의 장면을 Midjourney로 생성해, 누구의 것인지 모를 기억 속에서 저마다의 여름을 떠올리도록 했습니다.',
    'work-cat-5': '브랜드 캠페인 기획<br>비주얼 디렉션<br>콘텐츠 기획 &amp; 디자인',
    'metiers-role-desc': '26 Métiers d’art 컬렉션의 서울 개최를 맞아, 내부 직원을 위한 공방 컬렉션 교육 프로그램 기획에 참여했습니다. ONE HOUSE Staff Engagement를 뉴욕의 아침에서 서울의 저녁으로 이어지는 여정으로 구성해, 몰입감 있는 경험을 통해 교육에 집중할 수 있도록 구성했습니다.\n\n팀 내부에서 현장 매니지먼트, 영상 비주얼 디렉션, AI 촬영 컨셉 디벨롭, 공간 디테일 디자인, GWP 비주얼 디렉션을 중점적으로 맡았습니다.',
    'work-desc-5': 'AMOMENTO 26FW &amp; 캐시미어 컬렉션의 윈터 시즌 캠페인, Project No.51을 가정한 개인 프로젝트입니다.\n\n캠페인 콘셉트부터 에디토리얼 키비주얼, 티징 영상, 소셜 콘텐츠까지 하나의 톤으로 이어지는 브랜드 콘텐츠를 기획하고 제작했습니다.',
    'ph-1': 'PLAB <span class="ko-small">소셜 채널 운영</span> (Smore Market / LECT House), <span class="role">PM</span>',
    'ph-2': '<span class="ko-small">하우스 오브 토이스토리 성수</span>, <span class="role">PM</span>',
    'ph-3': 'CHANEL M&eacute;tiers d&rsquo;Art <span class="ko-small">내부 교육 프로그램</span>, <span class="role">APM</span>',
    'ph-4': 'Disney+ <span class="ko-small">조각도시 브레이커스 팝업</span>, <span class="role">PM</span>',
    'ph-5': 'Disney <span class="ko-small">디즈니런 애프터파티</span>, <span class="role">APM</span>',
    'ph-6': 'Disney <span class="ko-small">미키 인 리얼라이프 성수</span>, <span class="role">PM</span>',
    'ph-7': 'Disney ESR <span class="ko-small">삼성서울병원</span>, <span class="role">PM</span>',
    'ph-8': 'SSF(Samsung Fire) <span class="ko-small">드림시어터 팝업</span>, <span class="role">APM</span>',
    'ph-9': 'Adidas (KR, OG) <span class="ko-small">소셜 채널 운영</span>, <span class="role">PM</span>',
    'process-kicker': '콘텐츠가 닿기까지',
    'process-headline': '기획 문서 한 장에서 여러분의 인스타그램 피드까지 &mdash; 아디다스 콘텐츠가 모바일로 닿기 전 거치는 모든 과정입니다.',
    'process-1-title': '콘텐츠 플래닝',
    'process-1-desc': 'GTM 및 Social Toolkit 분석',
    'process-2-title': '콘텐츠 디벨롭 및 컨펌',
    'process-2-desc': '이미지 편집 및 카피 작성 &mdash; 디테일/이슈 1:1 소통',
    'process-3-title': 'IRL 콘텐츠 촬영',
    'process-3-desc': '촬영 플래닝: 촬영팀 사전 요청 및 컨택, 실시간 발행 콘텐츠 플래닝(촬영 및 편집 가이드 작성)',
    'process-4-title': '콘텐츠 발행',
    'process-4-desc': 'IG 콘텐츠 발행 및 발행 후 이슈 대응',
    'process-5-title': '데이터 리포트',
    'process-5-desc': '데이터 분석 및 리포트 작성',
    'process-6-title': '뉴스레터',
    'process-6-desc': 'Tracker/Follower Growth, Total IMP/ENG, Finding/Implication, Competitors Social Buzz, Social Trend',
    'campaign-intro-weekend': '아디다스 YEAR END WEEKEND MUSIC LIVE &mdash; WAVE TO EARTH, ZION.T, DJ APRO와 함께한 연말 라이브',
    'campaign-intro-cafe': '아디다스의 첫 F&amp;B 기반 IRL 프로젝트 &mdash; 운동과 문화, 일상이 연결되는 공간에서 펼쳐진 다양한 컬처 프로그램과 사람들의 순간',
    'campaign-intro-jellyfish': 'ADISTAR JELLYFISH의 출시를 기념한 새로운 플레이 공간 &mdash; 빛과 움직임으로 채워진 아케이드에서 펼쳐지는 특별한 플레이',
    'campaign-intro-confirmed': 'A journey of inspiration and discovery &mdash; 아디다스와 맞닿은 다양한 컬처를 발견하는 영감의 여정 &mdash; 아트, 음악, 토크를 통해 각자의 취향과 시선을 공유하는 공간',
    'campaign-intro-original': '오리지널스의 스타일과 헤리티지를 경험하는 주말 &mdash; LIVE MARKET, 아카이브, 라이브 뮤직 등 다양한 프로그램 속에서 발견한 스타일과 에너지',
    'pt-1-tag': '디즈니 &middot; 팝업',
    'pt-1-desc': '토이스토리 세계관을 그대로 옮겨온 오프라인 체험존',
    'pt-2-tag': '샤넬 &middot; 인게이지먼트 액티베이션',
    'pt-2-desc': '샤넬 메티에다르 컬렉션을 위한 관객 참여형 인게이지먼트 저니',
    'pt-3-tag': '디즈니+ &middot; 팝업',
    'pt-3-desc': '디즈니+ 오리지널 시리즈 발매를 기념한 몰입형 체험 팝업',
    'pt-4-tag': '디즈니 &middot; 팝업',
    'pt-4-desc': '성수에서 만나는 미키마우스의 리얼라이프 무드',
    'pt-5-tag': '삼성화재 &middot; 팝업',
    'pt-5-desc': '삼성화재와 함께한 몰입형 드림시어터 체험관',
    'pt-back': '&larr; 전체 프로젝트',
    'pt-h-overview': '개요',
    'pt-h-storyline': '스토리라인',
    'pt-h-images': '이미지',
    'pt-h-results': '결과',
    'pt-1-overview': '개요 내용이 들어갈 자리입니다 &mdash; 실제 브리프 전달 전까지의 임시 텍스트예요.',
    'pt-2-overview': '개요 내용이 들어갈 자리입니다 &mdash; 실제 브리프 전달 전까지의 임시 텍스트예요.',
    'pt-3-overview': '개요 내용이 들어갈 자리입니다 &mdash; 실제 브리프 전달 전까지의 임시 텍스트예요.',
    'pt-4-overview': '개요 내용이 들어갈 자리입니다 &mdash; 실제 브리프 전달 전까지의 임시 텍스트예요.',
    'pt-5-overview': '개요 내용이 들어갈 자리입니다 &mdash; 실제 브리프 전달 전까지의 임시 텍스트예요.',
    'pt-placeholder-story-1': '스토리라인 1단계 &mdash; 임시 텍스트.',
    'pt-placeholder-story-2': '스토리라인 2단계 &mdash; 임시 텍스트.',
    'pt-placeholder-story-3': '스토리라인 3단계 &mdash; 임시 텍스트.',
    'pt-placeholder-result-num': '&mdash;',
    'pt-placeholder-result-label': '결과 라벨',
    'brand-header-adidas': '아디다스 코리아 IG 매니지먼트',
    'adidas-role-sub': 'adidaskr / originals_kr 브랜드 채널 운영',
    'adidas-role-desc': '2024년 11월부터 2026년 2월까지 아디다스 코리아의 소셜 매니지먼트를 맡았습니다. 글로벌 브랜드 캠페인을 한국 계정의 톤앤매너에 맞게 옮겨 전하고, 오프라인 행사와 팝업 현장을 그날의 콘텐츠로 담았습니다.\n\n콘텐츠 플래닝부터 제작, 발행, 데이터 리포트까지 캠페인의 전 과정을 함께하며, 브랜드가 피드 너머로 소비자에게 닿는 방법을 고민했습니다.',
    'lect-role-sub': 'LECT house IG 운영 · 브랜딩',
    'lect-role-desc': 'LECT house의 브랜딩과 소셜 운영을 맡았습니다. 고르고 모은 것들을 오프라인에서 만나는 취향의 공간이라는 브랜드의 방향을 정리하고, 이를 인스타그램 캐러셀의 톤앤매너로 옮겼습니다.\n\n시즌마다 바뀌는 프로젝트에 맞춰 에디토리얼 콘텐츠를 기획하고 제작할 수 있도록 가이드를 만들었으며, 팀이 함께 쓰는 소셜 콘텐츠 캘린더를 만들어 운영 방식으로 정착시켰습니다. 팬들이 좋아하는 브랜드를 더 깊이 알아갈 수 있도록, 공간 너머에서도 이어지는 이야기를 고민했습니다.',
    'ig-story-viewall': '전체보기',
    'ig-story-back': '스토리로 돌아가기'
  };

  var els = document.querySelectorAll('[data-i18n]');
  var EN = {};
  els.forEach(function (el) {
    EN[el.getAttribute('data-i18n')] = el.innerHTML;
  });

  var toggle = document.getElementById('langToggle');
  var STORAGE_KEY = 'site-lang';

  function applyLang(lang) {
    els.forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var dict = lang === 'ko' ? KO : EN;
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });
    document.documentElement.lang = lang;
    if (toggle) {
      toggle.textContent = lang === 'ko' ? 'EN' : 'KR';
    }
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  var savedLang = 'en';
  try { savedLang = localStorage.getItem(STORAGE_KEY) || 'en'; } catch (e) {}
  applyLang(savedLang);

  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = document.documentElement.lang === 'ko' ? 'ko' : 'en';
      applyLang(current === 'ko' ? 'en' : 'ko');
    });
  }

  // ---------------- business card popup ----------------

  var card = document.getElementById('bizcard');
  var cardCloseTimer = null;

  function openCard(trigger) {
    var margin = 12;
    clearTimeout(cardCloseTimer);
    card.hidden = false;
    card.classList.remove('is-visible');
    card.style.left = '0px';
    card.style.top = '0px';

    var triggerRect = trigger.getBoundingClientRect();
    var cardWidth = card.offsetWidth;
    var cardHeight = card.offsetHeight;

    var left = triggerRect.left;
    var top = triggerRect.bottom + 8;

    if (left + cardWidth > window.innerWidth - margin) {
      left = window.innerWidth - margin - cardWidth;
    }
    if (left < margin) {
      left = margin;
    }
    if (top + cardHeight > window.innerHeight - margin) {
      top = triggerRect.top - cardHeight - 8;
    }
    if (top < margin) {
      top = margin;
    }

    card.style.left = left + 'px';
    card.style.top = top + 'px';

    // force a reflow so the opening transition always animates from the
    // closed state, even if the card was just re-opened mid-close.
    void card.offsetWidth;
    card.classList.add('is-visible');
  }

  function closeCard() {
    if (card.hidden) return;
    card.classList.remove('is-visible');
    clearTimeout(cardCloseTimer);
    cardCloseTimer = setTimeout(function () {
      card.hidden = true;
    }, 260);
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.card-trigger');
    if (trigger) {
      openCard(trigger);
      return;
    }
    if (!card.hidden && !card.contains(e.target)) {
      closeCard();
    }
  });

  document.addEventListener('keydown', function (e) {
    var trigger = e.target.closest && e.target.closest('.card-trigger');
    if (trigger && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openCard(trigger);
    } else if (e.key === 'Escape' && !card.hidden) {
      closeCard();
    }
  });

  // ---------------- campaign image carousels : auto-roll every 5s ----------------
  // Advances one image at a time (1,2,3,4 -> 2,3,4,1 -> 2,3,4,1 -> ...), looping
  // forever — for BOTH the auto-roll and the visitor's own manual scrolling
  // (wheel/trackpad/touch drag).
  //
  // How the loop works: each track's images are cloned and appended after
  // the originals, so scrolling past the last real image just keeps
  // revealing clones that look identical to 1, 2, 3... On every 'scroll'
  // event (fired for ANY scroll, ours or the visitor's) we check whether
  // scrollLeft has entered the clone region and, if so, instantly subtract
  // one original-set width — landing back on the real images at the
  // equivalent position with no visible jump.
  //
  // The auto-roll tween is driven entirely by our own rAF loop rather than
  // native `scrollTo(..., {behavior:'smooth'})`: with few images (e.g. a
  // 4-5 slot track), the native smooth-scroll animation was still mid-flight
  // when the instant rebase fired, so the browser kept fighting to reach its
  // now-stale target — the roll would visibly jam after a couple of cycles.
  // Driving scrollLeft ourselves every frame means the rebase (applied only
  // once a tween finishes) never fights an in-progress native animation.
  //
  // A single clone pass isn't always enough width, though: the loop only has
  // room to reach the clone region if the *whole* track (originals + clones)
  // is wider than the visible viewport by at least one full original-set
  // width. On a track with few images (or a wide enough window/monitor —
  // e.g. 5-6 slots fitting on screen at once), one clone pass can leave the
  // browser's max scrollLeft short of the rebase point entirely: the target
  // scrollLeft we ask for gets silently clamped, the rebase condition never
  // becomes true, and every following tick re-targets that same clamped
  // position — the roll reads as permanently jammed partway through the
  // first lap. topUpClones() keeps appending extra clone passes until the
  // track has enough runway regardless of viewport width or image count,
  // and reruns after media loads (and on resize) since intrinsic video/image
  // sizes — and the viewport itself — can both change after first paint.

  document.querySelectorAll('.campaign-track').forEach(function (track) {
    var gap = 8;
    var originals = Array.from(track.children);
    var n = originals.length;
    if (n < 2) return;

    function edges() {
      var arr = [0];
      for (var i = 0; i < track.children.length; i++) {
        arr.push(arr[i] + track.children[i].getBoundingClientRect().width + gap);
      }
      return arr;
    }

    function addClonePass() {
      originals.forEach(function (el) {
        track.appendChild(el.cloneNode(true));
      });
      passCount++;
    }

    // How many clone passes exist beyond the n originals (which always stay
    // the first n children — addClonePass() only ever appends).
    var passCount = 0;

    // Decide the pass count with ONE calculation based only on the n
    // originals' width, never by re-measuring clones we just added: a
    // freshly appended <video> clone hasn't loaded its own copy of the
    // metadata yet (cloneNode copies markup, not the decoded resource), so
    // it renders at ~0 width until that finishes. A while-loop that
    // re-measured after each append kept seeing "0px added" and looping
    // until its guard limit, ending up with 40+ slots of which almost all
    // were still 0px wide. Original elements don't have this problem — script
    // execution happens late enough in page load that their metadata is
    // already in by the time we get here — so basing the math on them alone
    // sidesteps the race instead of fighting it.
    function topUpClones() {
      var originalWidth = edges()[n];
      if (originalWidth < 1) return; // originals not measurable yet; a later retry will catch it
      var passesNeeded = Math.max(1, Math.ceil((track.clientWidth + originalWidth) / originalWidth));
      while (passCount < passesNeeded) {
        addClonePass();
      }
    }

    topUpClones();

    // hover-to-play videos: play only while the cursor is over the clip,
    // pause the instant it leaves (covers every clone pass too, since
    // cloneNode copies the markup but not any listeners).
    function wireHoverVideos() {
      track.querySelectorAll('video.hover-video').forEach(function (video) {
        if (video.dataset.hoverWired) return;
        video.dataset.hoverWired = '1';
        video.addEventListener('mouseenter', function () { video.play(); });
        video.addEventListener('mouseleave', function () { video.pause(); });
      });
    }

    // background-loop videos: the HTML autoplay attribute alone can silently
    // fail to carry over to a cloneNode(true) copy in some browsers, leaving
    // that slot blank. Explicitly kick off playback for every autoplay video
    // (every clone pass) as a fallback; ignore the rejection Safari/iOS
    // throws when a play() call races the browser's own autoplay attempt.
    function playAutoplayVideos() {
      track.querySelectorAll('video[autoplay]').forEach(function (video) {
        var playPromise = video.play();
        if (playPromise && playPromise.catch) { playPromise.catch(function () {}); }
      });
    }

    wireHoverVideos();
    playAutoplayVideos();

    // intrinsic video/image sizes aren't known synchronously on first run,
    // so the initial topUpClones() pass above can undercount. 'loadedmetadata'
    // is unreliable as the sole signal — on a fast local/cached load it can
    // fire before this listener is even attached, since it's a one-time
    // state transition — so it's paired with a few blind re-checks on a
    // timer as a safety net, and again on resize since a wider window can
    // shrink the available scroll runway just as much as too few images can.
    function refresh() {
      topUpClones();
      wireHoverVideos();
      playAutoplayVideos();
    }
    campaignTrackRefreshers.push(refresh);
    track.querySelectorAll('video').forEach(function (video) {
      video.addEventListener('loadedmetadata', refresh);
    });
    [0, 300, 1000, 2500].forEach(function (delay) {
      setTimeout(refresh, delay);
    });
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(topUpClones, 200);
    });

    function rebaseIfNeeded() {
      var originalWidth = edges()[n];
      if (track.scrollLeft >= originalWidth - 1) {
        track.scrollLeft -= originalWidth;
      }
    }

    // true for the *entire* duration of a programmatic (our own) scroll —
    // covers every frame of animateTo(), not just the instant scrollLeft is
    // assigned. Setting scrollLeft fires 'scroll' asynchronously, so a flag
    // that flips back to false synchronously right after the assignment is
    // already false again by the time the event actually arrives — it never
    // suppresses anything. That let the visitor-scroll rebase below fire
    // mid-tween, subtracting originalWidth from a scrollLeft the running
    // rAF loop was about to overwrite anyway on its next frame, which could
    // leave the two rebases fighting and the roll reading as stuck after a
    // couple of cycles. Holding the flag for the whole tween avoids the race.
    var programmatic = false;

    track.addEventListener('scroll', function () {
      if (programmatic) return;
      rebaseIfNeeded();
    });

    // holding/hovering, or actively (manually) scrolling, pauses only this
    // track's auto-roll — the rest keep rolling on their own 5s timers.
    var holding = false;
    ['mouseenter', 'touchstart'].forEach(function (evt) {
      track.addEventListener(evt, function () { holding = true; });
    });
    ['mouseleave', 'touchend', 'touchcancel'].forEach(function (evt) {
      track.addEventListener(evt, function () { holding = false; });
    });

    var userScrolling = false;
    var scrollSettleTimer = null;
    track.addEventListener('scroll', function () {
      if (programmatic) return;
      userScrolling = true;
      clearTimeout(scrollSettleTimer);
      scrollSettleTimer = setTimeout(function () { userScrolling = false; }, 200);
    });

    // data-roll="continuous" opts a track into a steady, unbroken drift
    // instead of the step-and-pause roll below (one slot, then a dead 5s
    // wait) — used for the yogurt plate carousel, which read as too slow/
    // stuttery for that many small square slots. Driven by its own rAF loop
    // rather than reusing animateTo(), since that function's whole point is
    // tweening to a discrete target and settling; continuous motion has no
    // target to settle at. `programmatic` is held true for as long as we're
    // actively advancing (not just per-write) for the same reason noted
    // above — an async 'scroll' event arriving after a premature reset
    // would wrongly read as the visitor scrolling.
    //
    // Deliberately does NOT pause on plain hover (`holding`) — it keeps
    // rolling under the cursor and only yields for an actual manual scroll
    // gesture (wheel/trackpad or a touch drag), detected directly off
    // 'wheel'/'touchmove' rather than the indirect scroll-event trick below,
    // since that trick depends on `programmatic` having gone false at some
    // point to tell our own writes apart from the visitor's — which never
    // happens here, this loop writes every single frame. A short timeout
    // after the last such event resumes the drift from wherever manual
    // scrolling left it.
    if (track.dataset.roll === 'continuous') {
      var pxPerSecond = 55;
      var lastTick = null;
      var manualPause = false;
      var manualPauseTimer = null;
      function pauseForManualScroll() {
        manualPause = true;
        clearTimeout(manualPauseTimer);
        manualPauseTimer = setTimeout(function () { manualPause = false; }, 400);
      }
      track.addEventListener('wheel', pauseForManualScroll, { passive: true });
      track.addEventListener('touchmove', pauseForManualScroll, { passive: true });

      function driftTick(now) {
        if (lastTick === null) lastTick = now;
        var dt = (now - lastTick) / 1000;
        lastTick = now;
        if (manualPause) {
          programmatic = false;
        } else {
          programmatic = true;
          track.scrollLeft += pxPerSecond * dt;
          rebaseIfNeeded();
        }
        requestAnimationFrame(driftTick);
      }
      requestAnimationFrame(driftTick);
      return;
    }

    var animating = false;
    function animateTo(target, duration) {
      animating = true;
      programmatic = true;
      var start = track.scrollLeft;
      var distance = target - start;
      var startTime = null;
      function step(now) {
        if (startTime === null) startTime = now;
        var t = Math.min(1, (now - startTime) / duration);
        var eased = 1 - Math.pow(1 - t, 3);
        track.scrollLeft = start + distance * eased;
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          rebaseIfNeeded();
          animating = false;
          programmatic = false;
        }
      }
      requestAnimationFrame(step);
    }

    setInterval(function () {
      if (holding || userScrolling || animating) return;
      var e = edges();
      var current = 0;
      for (var i = 0; i < e.length - 1; i++) {
        if (e[i] <= track.scrollLeft + 1) { current = i; }
      }
      var next = current + 1 >= n ? n : current + 1;
      animateTo(e[next], 600);
    }, 5000);
  });

  // ---------------- You Need My Yogurt : Instagram Stories viewer ----------------
  // Progress bars + auto-advance for the .ig-story widget (the screenshots
  // themselves already have the IG chrome baked in — this only drives the
  // bars across the top). Timing is rAF-driven off elapsed wall-clock time
  // (storyStart) rather than a CSS transition, specifically so holding to
  // pause can freeze and resume mid-bar without the width-at-pause /
  // remaining-duration math a transition pause would need.
  document.querySelectorAll('.ig-story').forEach(function (widget) {
    var frame = widget.querySelector('.ig-story-frame');
    var slides = Array.prototype.slice.call(widget.querySelectorAll('.ig-story-slide'));
    var bars = Array.prototype.slice.call(widget.querySelectorAll('.ig-story-bar'));
    var fills = bars.map(function (bar) { return bar.querySelector('.ig-story-bar-fill'); });
    var tapPrev = widget.querySelector('.ig-story-tap--prev');
    var tapNext = widget.querySelector('.ig-story-tap--next');
    var toggleBtn = widget.querySelector('.ig-story-toggle');
    var grid = widget.querySelector('.ig-story-grid');
    var n = slides.length;
    if (!frame || !n || bars.length !== n) return;

    var duration = parseInt(widget.dataset.duration, 10) || 4000;
    var current = 0;
    var rafId = null;
    var storyStart = null;
    var pausedAt = null;
    var gridOpen = false;

    // The grid-open label never appears as static HTML (data-i18n only
    // ever holds one string per element at a time — see setToggleLabel),
    // so it's never auto-captured into EN the way the initial "View all"
    // text is. Filled in here instead.
    if (EN['ig-story-back'] === undefined) EN['ig-story-back'] = 'Back to story';

    function setToggleLabel(key) {
      if (!toggleBtn) return;
      toggleBtn.setAttribute('data-i18n', key);
      var lang = document.documentElement.lang === 'ko' ? 'ko' : 'en';
      var dict = lang === 'ko' ? KO : EN;
      if (dict[key] !== undefined) toggleBtn.innerHTML = dict[key];
    }

    function renderBars() {
      bars.forEach(function (bar, i) {
        if (i < current) fills[i].style.width = '100%';
        else if (i > current) fills[i].style.width = '0%';
      });
    }

    function showSlide(i) {
      current = ((i % n) + n) % n;
      slides.forEach(function (s, idx) { s.classList.toggle('is-active', idx === current); });
      renderBars();
      storyStart = null;
      pausedAt = null;
    }

    function tick(now) {
      if (storyStart === null) storyStart = now;
      var elapsed = now - storyStart;
      var pct = Math.min(1, elapsed / duration);
      fills[current].style.width = (pct * 100) + '%';
      if (pct >= 1) {
        showSlide(current + 1);
      }
      rafId = requestAnimationFrame(tick);
    }

    function play() {
      if (rafId !== null || gridOpen) return;
      if (pausedAt !== null && storyStart !== null) {
        storyStart += performance.now() - pausedAt;
        pausedAt = null;
      }
      rafId = requestAnimationFrame(tick);
    }

    function pause() {
      if (rafId === null) return;
      cancelAnimationFrame(rafId);
      rafId = null;
      pausedAt = performance.now();
    }

    ['mousedown', 'touchstart'].forEach(function (evt) {
      frame.addEventListener(evt, pause, { passive: true });
    });
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(function (evt) {
      frame.addEventListener(evt, function () { play(); });
    });

    if (tapPrev) {
      tapPrev.addEventListener('click', function () { showSlide(current - 1); play(); });
    }
    if (tapNext) {
      tapNext.addEventListener('click', function () { showSlide(current + 1); play(); });
    }

    // Hovering the story spawns hearts every ~250-350ms, each one floating
    // up from near the bottom and fading out before it reaches the top.
    // --rise has to be a px distance measured off the frame's real height
    // rather than a %% in the keyframe itself, which would resolve against
    // the heart's own ~26px box and barely move it at all. A fresh
    // getBoundingClientRect() per heart (not cached once) keeps this
    // correct if the frame's rendered size ever changes between spawns —
    // e.g. the browser window being resized while the visitor is hovering.
    var heartTimer = null;
    function spawnHeart() {
      var rect = frame.getBoundingClientRect();
      var heart = document.createElement('div');
      heart.className = 'ig-story-heart';
      heart.style.left = (30 + Math.random() * 40) + '%';
      heart.style.setProperty('--rise', -Math.round(rect.height * (0.55 + Math.random() * 0.2)) + 'px');
      heart.style.setProperty('--drift', Math.round((Math.random() - 0.5) * 50) + 'px');
      var duration = 1400 + Math.random() * 700;
      heart.style.animationDuration = duration + 'ms';
      var img = document.createElement('img');
      img.src = './images/design/yogurt/story/heart.webp';
      img.alt = '';
      heart.appendChild(img);
      heart.addEventListener('animationend', function () { heart.remove(); });
      frame.appendChild(heart);
    }

    // Touch has no hover state to key off, so a real phone never fires
    // 'mouseenter' here at all (modern mobile browsers only synthesize a
    // one-off mouse event after a tap for legacy click handlers, not a
    // sustained hover) — press-and-hold via touchstart/touchend is the
    // touch equivalent, mirroring the pause-on-hold pattern already used
    // for the auto-roll above.
    function startHearts() {
      if (heartTimer) return;
      spawnHeart();
      heartTimer = setInterval(spawnHeart, 280 + Math.random() * 120);
    }
    function stopHearts() {
      clearInterval(heartTimer);
      heartTimer = null;
    }
    frame.addEventListener('mouseenter', startHearts);
    frame.addEventListener('mouseleave', stopHearts);
    frame.addEventListener('touchstart', startHearts, { passive: true });
    frame.addEventListener('touchend', stopHearts);
    frame.addEventListener('touchcancel', stopHearts);

    if (toggleBtn && grid) {
      var gridImgs = Array.prototype.slice.call(grid.querySelectorAll('img'));
      toggleBtn.addEventListener('click', function () {
        gridOpen = !gridOpen;
        frame.hidden = gridOpen;
        grid.hidden = !gridOpen;
        setToggleLabel(gridOpen ? 'ig-story-back' : 'ig-story-viewall');
        if (gridOpen) {
          pause();
        } else {
          showSlide(current);
          play();
        }
      });
      gridImgs.forEach(function (img) {
        img.addEventListener('click', function () {
          gridOpen = false;
          frame.hidden = false;
          grid.hidden = true;
          setToggleLabel('ig-story-viewall');
          showSlide(parseInt(img.dataset.index, 10) || 0);
          play();
        });
      });
    }

    // Pauses while scrolled out of view so the story isn't several frames
    // further along than expected when the visitor scrolls back to it.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { play(); } else { pause(); }
        });
      }, { threshold: 0.4 }).observe(widget);
    } else {
      play();
    }

    showSlide(0);
  });

  // ---------------- Adidas Planning : intro reveal + slide-dot sync ----------------

  var introTargets = document.querySelectorAll('.process-intro');
  if (introTargets.length && 'IntersectionObserver' in window) {
    var introObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          introObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    introTargets.forEach(function (el) { introObserver.observe(el); });
  } else {
    introTargets.forEach(function (el) { el.classList.add('in-view'); });
  }

  // ---------------- Design page : project title reveal + scroll-position dots ----------------
  // The title is a second layer riding on top of the hero image, not glued
  // to it: entrance is a one-off fade-up that plays the first time the
  // visitor scrolls (page2Scrolled, above) while that hero is on screen —
  // never on tab-open by itself, so the very first project's title starts
  // at opacity 0 exactly like every other one instead of popping in on a
  // timer. A CSS transition drives that entrance; once it finishes, control
  // hands off to a scroll listener that fades + drops the title on its own
  // timeline as its hero image scrolls out — the image just scrolls at
  // normal document speed with no JS touching it at all, so the two
  // genuinely move independently instead of in lockstep.

  // Small project title in the header row, centered on the line of
  // "Designer & project manager." — takes over once the big title has
  // faded out on scroll (like the reference site's project pages).
  var topTitle = document.createElement('div');
  topTitle.className = 'work-toptitle';
  topTitle.setAttribute('aria-hidden', 'true');
  document.body.appendChild(topTitle);
  window.addEventListener('hashchange', function () { topTitle.style.opacity = '0'; });

  document.querySelectorAll('.work-hero').forEach(function (hero) {
    var titleEl = hero.querySelector('.work-bigtitle');
    var titleSpan = titleEl && titleEl.querySelector('span');
    if (!titleSpan) return;
    var workEl = hero.closest('.work');

    var revealed = false;
    var entranceDone = false;

    function updateExit() {
      // Fades out early now that wheel scrolling is slowed down: it starts
      // once 10% of this project has scrolled past the top of the detail
      // area and is gone by 20%, whatever the project's length.
      var FADE_START = 0.1;
      var FADE_END = 0.2;
      var pDown = 0;
      if (workEl) {
        var wr = workEl.getBoundingClientRect();
        var host = workEl.closest('.contents');
        var startTop = host
          ? host.getBoundingClientRect().top + parseFloat(getComputedStyle(host).paddingTop)
          : 0;
        var scrolledPct = wr.height > 0 ? (startTop - wr.top) / wr.height : 0;
        pDown = (scrolledPct - FADE_START) / (FADE_END - FADE_START);
        pDown = Math.max(0, Math.min(1, pDown));
      }

      // As the big title fades out, a small copy of it fades into the
      // header row (see .work-toptitle) — for the open work only.
      if (topTitle && workEl && !workEl.hidden) {
        topTitle.textContent = titleSpan.textContent;
        topTitle.style.opacity = String(pDown);
      }

      if (!entranceDone) return;

      // also fades out scrolling the OTHER way, once this project's own
      // block has been scrolled back down past the top of the viewport far
      // enough that we're really back in the previous project — otherwise
      // this fixed title stays at opacity 1 forever while a different
      // project's title fades in underneath it and the two overlap.
      var pUp = 0;
      if (workEl) {
        var workTop = workEl.getBoundingClientRect().top;
        // fixed pixel offsets, not vh-relative — must clear the first
        // project's own natural resting workTop (~272px, the sticky
        // sidebar's `top: 32px` plus page padding plus the first-project
        // scroll-headroom margin) since scrollTop can never go negative to
        // push it any further; only a real scroll back up into a previous
        // project pushes workTop meaningfully past that.
        var upStart = 340;
        var upRange = 300;
        pUp = workTop > upStart ? (workTop - upStart) / upRange : 0;
        pUp = Math.max(0, Math.min(1, pUp));
      }

      var p = Math.max(pDown, pUp);
      titleSpan.style.opacity = String(1 - p);
      titleSpan.style.transform = 'translateY(' + (p * 60) + 'px)';
      titleSpan.style.filter = 'blur(' + (p * 14) + 'px)';
    }

    function finishEntrance() {
      entranceDone = true;
      titleSpan.classList.remove('entering');
      updateExit();
    }

    function playEntrance() {
      titleSpan.classList.add('entering');
      titleEl.classList.add('in-view');
      setTimeout(finishEntrance, 900);
    }

    function reveal() {
      if (revealed) return;
      revealed = true;
      if (!page2Scrolled) {
        page2ScrollCallbacks.push(reveal);
        revealed = false; // allow the queued retry to actually run once scrolling starts
        return;
      }
      playEntrance();
    }

    if ('IntersectionObserver' in window) {
      var heroObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal();
            heroObserver.unobserve(hero);
          }
        });
      // A ratio threshold can never be met by the very tall hero images (a
      // full-project overview can be several viewports high), so those titles
      // never appeared. Instead reveal as soon as any part of the hero is
      // above the 45% line — about where the up-scroll fade below reaches
      // full opacity.
      }, { threshold: 0, rootMargin: '0px 0px -55% 0px' });
      heroObserver.observe(hero);
    } else {
      reveal();
    }

    var scrollHost = document.querySelector('.page2 .contents');
    if (scrollHost) scrollHost.addEventListener('scroll', updateExit);
    window.addEventListener('resize', updateExit);
  });

  // ---------------- per-project scroll indicator : line + draggable thumb ----------------
  // Was one dot per .work-figure before, which meant longer projects (more
  // images) got visibly longer dot stacks — the ask was a track the same
  // length for every project regardless of image count, with a single
  // thumb whose position along it reflects how far scrolled through *that
  // project's own span* (not the whole page), and which can be dragged to
  // scroll too.
  document.querySelectorAll('.work').forEach(function (work) {
    var progress = work.querySelector('.work-progress');
    var scrollHost = document.querySelector('.page2 .contents');
    if (!progress || !scrollHost) return;

    var track = document.createElement('div');
    track.className = 'work-progress-track';
    var thumb = document.createElement('div');
    thumb.className = 'work-progress-thumb';
    track.appendChild(thumb);
    progress.appendChild(track);

    var trackHeight = 0;
    var dragging = false;

    function measure() {
      trackHeight = track.getBoundingClientRect().height;
    }

    // This project's own top/height within the scrollable content's
    // coordinate space (not the viewport's — getBoundingClientRect alone
    // shifts with every scroll tick, so it's measured relative to the
    // scroll host and combined with its current scrollTop).
    function bounds() {
      var workRect = work.getBoundingClientRect();
      var hostRect = scrollHost.getBoundingClientRect();
      return {
        top: workRect.top - hostRect.top + scrollHost.scrollTop,
        height: work.offsetHeight
      };
    }

    function progressFromScroll() {
      var b = bounds();
      if (b.height <= 0) return 0;
      var centerY = scrollHost.scrollTop + scrollHost.clientHeight / 2;
      return Math.max(0, Math.min(1, (centerY - b.top) / b.height));
    }

    function paint(pct) {
      thumb.style.top = (pct * trackHeight) + 'px';
    }

    function updateFromScroll() {
      if (dragging) return;
      paint(progressFromScroll());
    }

    function scrollToPct(pct) {
      pct = Math.max(0, Math.min(1, pct));
      var b = bounds();
      var targetCenterY = b.top + pct * b.height;
      scrollHost.scrollTop = targetCenterY - scrollHost.clientHeight / 2;
      paint(pct);
      return pct;
    }

    // Grab the dot (or anywhere on the line) and drag: the dot stays under
    // the pointer 1:1 along the 160px line, and the page scrolls to the
    // matching point of this project. Pointer events + pointer capture keep
    // the drag alive even when the pointer slides off the thin line.
    var grabOffset = 0;

    function pctAt(clientY) {
      var tr = track.getBoundingClientRect();
      return tr.height > 0 ? (clientY - grabOffset - tr.top) / tr.height : 0;
    }

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      thumb.classList.remove('is-dragging');
    }

    track.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      measure();
      dragging = true;
      thumb.classList.add('is-dragging');
      // grabbing the dot itself keeps it where it was grabbed; pressing the
      // bare line jumps the dot there first
      if (e.target === thumb) {
        var tr = track.getBoundingClientRect();
        grabOffset = e.clientY - (tr.top + (parseFloat(thumb.style.top) || 0));
      } else {
        grabOffset = 0;
      }
      try { track.setPointerCapture(e.pointerId); } catch (err) {}
      scrollToPct(pctAt(e.clientY));
    });

    track.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      scrollToPct(pctAt(e.clientY));
    });

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('lostpointercapture', endDrag);

    measure();
    updateFromScroll();
    scrollHost.addEventListener('scroll', updateFromScroll);
    window.addEventListener('resize', function () {
      measure();
      updateFromScroll();
    });
  });

  document.querySelectorAll('.process-timeline').forEach(function (timeline) {
    var track = timeline.querySelector('.process-track');
    var slides = Array.from(timeline.querySelectorAll('.process-slide'));
    var dots = Array.from(timeline.querySelectorAll('.process-dot'));
    if (!track || !slides.length || !dots.length) return;

    function setActive(index) {
      dots.forEach(function (dot, i) {
        dot.classList.toggle('process-dot--active', i === index);
      });
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
    }

    // slow, deliberate ease to the exact slide boundary once the visitor's
    // own scroll (wheel/trackpad/touch) settles — native snap alone can let
    // a fast fling coast past the nearest slide.
    function settleTo(index) {
      index = Math.max(0, Math.min(slides.length - 1, index));
      var start = track.scrollLeft;
      var target = index * track.clientWidth;
      var distance = target - start;
      if (Math.abs(distance) < 1) { setActive(index); return; }
      var duration = 500;
      var startTime = null;
      function step(now) {
        if (startTime === null) startTime = now;
        var t = Math.min(1, (now - startTime) / duration);
        var eased = 1 - Math.pow(1 - t, 3);
        track.scrollLeft = start + distance * eased;
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          setActive(index);
        }
      }
      requestAnimationFrame(step);
    }

    // ---- scroll-scrubbed transition motion (Apple "Mac Does That" style) ----
    // Directly maps scroll position to motion — no timers, so it can never
    // be "missed": scrub back and forth and the scene scrubs with it.

    var flyMsgs = Array.from(timeline.querySelectorAll('.fly-msg'));
    var flyOffsets = [
      { fx: -150, fy: -60 },
      { fx: 150, fy: -40 },
      { fx: -130, fy: 90 }
    ];
    var postPop = timeline.querySelector('.pm-ig-post--pop');
    var heartReport = timeline.querySelector('.pm-heart--report');
    var growBars = Array.from(timeline.querySelectorAll('.grow-bar'));

    function clamp01(v) { return Math.max(0, Math.min(1, v)); }

    function updateScrollLinked() {
      var pos = track.scrollLeft / track.clientWidth; // continuous slide position

      // step 3 (shoot, index 2) -> step 4 (publish, index 3):
      // meeting notes & shot images fly into the phone, then the post pops in.
      var p1 = clamp01(pos - 2);
      flyMsgs.forEach(function (el, i) {
        var off = flyOffsets[i];
        var lp = clamp01((p1 - i * 0.15) / 0.55);
        var tx = off.fx * (1 - lp);
        var ty = off.fy * (1 - lp);
        var scale = 0.8 - 0.4 * lp;
        var opacity = lp < 0.15 ? lp / 0.15 : (lp > 0.85 ? (1 - lp) / 0.15 : 1);
        el.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
        el.style.opacity = String(opacity);
      });
      if (postPop) {
        var pp = clamp01((p1 - 0.55) / 0.45);
        postPop.style.transform = 'scale(' + (0.88 + 0.12 * pp) + ')';
        postPop.style.opacity = String(0.4 + 0.6 * pp);
      }

      // step 4 (publish, index 3) -> step 5 (report, index 4):
      // a double-tap "like" pop, then the chart climbs.
      var p2 = clamp01(pos - 3);
      if (heartReport) {
        var hs = p2 <= 0.4 ? 1 + 1.5 * (p2 / 0.4) : 2.5 - 1.35 * ((p2 - 0.4) / 0.6);
        heartReport.style.transform = 'scale(' + hs + ')';
        heartReport.style.color = p2 > 0.03 ? 'var(--pb-3)' : '';
      }
      growBars.forEach(function (bar, i) {
        var bp = clamp01((p2 - i * 0.08) / 0.5);
        bar.style.transform = 'scaleY(' + bp + ')';
      });

      // every slide-to-slide crossing: the outgoing scene shrinks/fades away
      // and the incoming one grows/fades in as you scroll past it, so motion
      // shows up between EVERY pair of steps, not just 3->4 and 4->5.
      slides.forEach(function (slide, i) {
        var dist = pos - i;
        var absDist = Math.min(1, Math.abs(dist));
        var hero = slide.querySelector('.process-scene, .phone-mock');
        var bignum = slide.querySelector('.process-bignum');
        var text = slide.querySelector('.process-slide-text');
        if (hero) {
          hero.style.transform = 'scale(' + (1 - 0.3 * absDist) + ')';
          hero.style.opacity = String(1 - 0.6 * absDist);
        }
        if (bignum) {
          bignum.style.transform = 'translate(-50%, -58%) scale(' + (1 + 0.18 * absDist) + ')';
          bignum.style.opacity = String(0.28 * (1 - absDist));
        }
        if (text) {
          text.style.opacity = String(1 - absDist);
          text.style.transform = 'translateY(' + (absDist * 16) + 'px)';
        }
      });
    }

    setActive(0);
    updateScrollLinked();

    var syncTimer = null;
    track.addEventListener('scroll', function () {
      var liveIndex = Math.round(track.scrollLeft / track.clientWidth);
      setActive(liveIndex);
      updateScrollLinked();
      clearTimeout(syncTimer);
      syncTimer = setTimeout(function () {
        var index = Math.round(track.scrollLeft / track.clientWidth);
        settleTo(index);
      }, 120);
    });
  });

  // ---------------- Social : Instagram-style feed -> post carousel ----------------
  // Each feed tile carries its post's slides (data-base + data-slides). A
  // click opens one shared viewer: a horizontal scroll-snap track (so touch
  // swipes natively), prev/next arrows, a "3/11" counter and dots. Video
  // slides play (muted, with controls to unmute) only while they're the
  // visible slide. Esc, the × button or a click on the backdrop closes it.
  (function () {
    var tiles = document.querySelectorAll('.ig-feed-post');
    if (!tiles.length) return;

    var viewer = document.createElement('div');
    viewer.className = 'ig-viewer';
    viewer.hidden = true;
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');
    viewer.innerHTML =
      '<div class="ig-viewer-dialog">' +
        '<div class="ig-viewer-media">' +
          '<div class="ig-viewer-track"></div>' +
          '<button class="ig-viewer-nav ig-viewer-nav--prev" type="button" aria-label="Previous">&lsaquo;</button>' +
          '<button class="ig-viewer-nav ig-viewer-nav--next" type="button" aria-label="Next">&rsaquo;</button>' +
          '<span class="ig-viewer-count"></span>' +
          '<div class="ig-viewer-dots"></div>' +
        '</div>' +
        // the post's caption, Instagram-desktop style beside the images
        '<aside class="ig-viewer-caption">' +
          '<header class="ig-viewer-account"><span class="ig-viewer-avatar"></span><b></b></header>' +
          '<div class="ig-viewer-text"></div>' +
        '</aside>' +
      '</div>' +
      '<button class="ig-viewer-close" type="button" aria-label="Close">&times;</button>';
    document.body.appendChild(viewer);

    var track = viewer.querySelector('.ig-viewer-track');
    var prevBtn = viewer.querySelector('.ig-viewer-nav--prev');
    var nextBtn = viewer.querySelector('.ig-viewer-nav--next');
    var count = viewer.querySelector('.ig-viewer-count');
    var dots = viewer.querySelector('.ig-viewer-dots');
    var caption = viewer.querySelector('.ig-viewer-caption');
    var captionText = viewer.querySelector('.ig-viewer-text');

    // @mentions link to the account; #hashtags get Instagram's link color
    function linkify(text) {
      var esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return esc
        .replace(/(^|\s)@([A-Za-z0-9._]+)/g, function (m, sp, handle) {
          return sp + '<a href="https://www.instagram.com/' + handle.replace(/\.$/, '') + '/" target="_blank" rel="noopener">@' + handle + '</a>';
        })
        .replace(/(^|\s)#([^\s#]+)/g, '$1<span class="ig-viewer-tag">#$2</span>');
    }
    var slideCount = 0;
    var current = 0;
    var lastFocus = null;

    function setActive(i) {
      current = Math.max(0, Math.min(slideCount - 1, i));
      count.textContent = (current + 1) + '/' + slideCount;
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === slideCount - 1;
      Array.prototype.forEach.call(dots.children, function (d, k) {
        d.classList.toggle('is-active', k === current);
      });
      Array.prototype.forEach.call(track.children, function (slide, k) {
        var v = slide.querySelector('video');
        if (!v) return;
        if (k === current) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          v.pause();
        }
      });
    }

    var navigating = false;
    var navTimer = null;
    var media = viewer.querySelector('.ig-viewer-media');
    var dialog = viewer.querySelector('.ig-viewer-dialog');

    // Whole-pixel slide size. Sized by CSS alone, the 3:4 box came out at a
    // fractional width (e.g. 593.6px), so every snapped position landed a
    // fraction off and a 1px sliver of the neighbouring slide / the dialog's
    // white background showed along the edge like a white border.
    function sizeMedia() {
      var w, h;
      if (window.innerWidth <= 812) {
        w = Math.floor(window.innerWidth * 0.92);
        h = Math.round(w * 4 / 3);
        dialog.style.height = '';
      } else {
        var captionW = caption.hidden ? 0 : 340;
        h = Math.floor(Math.min(window.innerHeight * 0.88, (window.innerWidth * 0.92 - captionW) * 4 / 3));
        w = Math.floor(h * 3 / 4);
        h = Math.round(w * 4 / 3);
        dialog.style.height = h + 'px';
      }
      media.style.width = w + 'px';
      media.style.height = h + 'px';
    }

    function slideLeft(i) {
      var slide = track.children[i];
      return slide ? slide.offsetLeft : 0;
    }

    function goTo(i) {
      i = Math.max(0, Math.min(slideCount - 1, i));
      setActive(i);                       // update counter/dots/video right away
      navigating = true;                  // ignore in-between scroll positions while it glides
      clearTimeout(navTimer);
      navTimer = setTimeout(function () {
        navigating = false;
        // land exactly on the slide (whole pixels), whatever the glide did
        if (track.scrollLeft !== slideLeft(current)) track.scrollLeft = slideLeft(current);
      }, 700);
      track.scrollTo({ left: slideLeft(i), behavior: 'smooth' });
    }

    function open(tile) {
      var base = tile.getAttribute('data-base');
      var names = tile.getAttribute('data-slides').split(',');
      track.innerHTML = '';
      dots.innerHTML = '';
      names.forEach(function (name, k) {
        var slide = document.createElement('div');
        slide.className = 'ig-viewer-slide';
        if (/\.mp4$/.test(name)) {
          slide.innerHTML = '<video src="' + base + name + '" poster="' + base + name.replace(/\.mp4$/, '-poster.jpg') +
            '" muted loop playsinline controls preload="metadata"></video>';
        } else {
          slide.innerHTML = '<img src="' + base + name + '" alt="" draggable="false"' + (k > 1 ? ' loading="lazy"' : '') + '>';
        }
        track.appendChild(slide);
        dots.appendChild(document.createElement('span'));
      });
      slideCount = names.length;

      var cap = tile.querySelector('.ig-feed-caption');
      caption.hidden = !cap;
      if (cap) {
        var feed = tile.closest('.ig-feed');
        var profile = feed && feed.querySelector('.ig-feed-profile');
        var handle = profile ? profile.getAttribute('href').replace(/\/$/, '').split('/').pop() : '';
        var logo = profile && profile.querySelector('img');
        viewer.querySelector('.ig-viewer-account b').textContent = handle;
        viewer.querySelector('.ig-viewer-avatar').innerHTML = logo ? '<img src="' + logo.getAttribute('src') + '" alt="">' : '';
        captionText.innerHTML = linkify(cap.textContent);
        captionText.scrollTop = 0;
      }
      lastFocus = document.activeElement;
      viewer.hidden = false;
      sizeMedia();
      track.scrollLeft = 0;
      setActive(0);
      requestAnimationFrame(function () { viewer.classList.add('is-open'); });
      nextBtn.focus();
    }

    function close() {
      if (viewer.hidden) return;
      viewer.classList.remove('is-open');
      track.querySelectorAll('video').forEach(function (v) { v.pause(); });
      setTimeout(function () { viewer.hidden = true; track.innerHTML = ''; }, 250);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    tiles.forEach(function (tile) {
      tile.addEventListener('click', function () { open(tile); });
    });

    var scrollTimer = null;
    track.addEventListener('scroll', function () {
      if (navigating) return;             // an arrow/key glide already set the slide
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        setActive(Math.round(track.scrollLeft / Math.max(1, media.clientWidth)));
      }, 60);
    });

    prevBtn.addEventListener('click', function () { goTo(current - 1); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); });
    viewer.querySelector('.ig-viewer-close').addEventListener('click', close);
    viewer.addEventListener('click', function (e) { if (e.target === viewer) close(); });

    // capture phase, so Esc closes only the viewer instead of also taking
    // the page back to the home index (the page-level Esc handler)
    document.addEventListener('keydown', function (e) {
      if (viewer.hidden) return;
      if (e.key === 'Escape') { e.stopImmediatePropagation(); close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
    }, true);

    window.addEventListener('hashchange', close);
    window.addEventListener('resize', function () {
      if (viewer.hidden) return;
      sizeMedia();
      track.scrollLeft = slideLeft(current);
    });
  })();

  // ---------------- a PEACE of cake : card draw ----------------
  // The card back is the deck; clicking it deals one random front card onto
  // the pile on the right (flipping as it travels). Cards come off a shuffled
  // bag so none repeats until every card is out; the next click after that
  // clears the pile and reshuffles.
  document.querySelectorAll('[data-card-draw]').forEach(function (root) {
    var deck = root.querySelector('.card-deck');
    var slot = root.querySelector('.card-slot');
    if (!deck || !slot) return;

    var base = './images/design/peace/cards/';
    var backSrc = deck.querySelector('img').getAttribute('src');
    var CARDS = [
      ['01', 'Take a Walk'], ['02', 'Tea Time'], ['03', 'Read a Book'],
      ['04', 'Pet Time'], ['05', 'Look at Flowers'], ['06', 'Sweets'],
      ['07', 'Drive'], ['08', 'Fidget'], ['09', 'Have a Drink'],
      ['10', 'Fill the Scents'], ['11', 'Photosynthesize'], ['12', 'Make a Long Call'],
      ['13', 'Ride a Bike'], ['14', 'Work Out'], ['15', 'Bath Time'],
      ['16', 'Fave Song'], ['17', 'Fave Food'], ['18', 'Take a Pause'],
      ['19', 'KIT']
    ];
    var loads = {};
    var MAX_PILE = 5;
    var bag = [];
    var lastDrawn = -1;
    var busy = false;

    function src(i) { return base + CARDS[i][0] + '.webp?v=4'; }

    function load(i) {
      if (!loads[i]) {
        loads[i] = new Promise(function (resolve) {
          var img = new Image();
          img.onload = img.onerror = function () { resolve(); };
          img.src = src(i);
        });
      }
      return loads[i];
    }

    function preloadAll() { CARDS.forEach(function (_, i) { load(i); }); }

    if ('IntersectionObserver' in window) {
      var near = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) {
          preloadAll();
          near.disconnect();
        }
      }, { rootMargin: '600px 0px' });
      near.observe(root);
    }
    deck.addEventListener('pointerenter', preloadAll);
    deck.addEventListener('focus', preloadAll);

    function build(i) {
      var flip = document.createElement('div');
      flip.className = 'card-flip';
      var back = document.createElement('img');
      back.className = 'card-face card-flip-back';
      back.src = backSrc;
      back.alt = '';
      var front = document.createElement('img');
      front.className = 'card-face card-flip-front';
      front.src = src(i);
      front.alt = CARDS[i][1];
      front.draggable = back.draggable = false;
      flip.appendChild(back);
      flip.appendChild(front);
      return flip;
    }

    function refill() {
      bag = CARDS.map(function (_, i) { return i; });
      for (var k = bag.length - 1; k > 0; k--) {
        var r = Math.floor(Math.random() * (k + 1));
        var t = bag[k]; bag[k] = bag[r]; bag[r] = t;
      }
      // the next card off the bag must not repeat the one just drawn
      if (bag.length > 1 && bag[bag.length - 1] === lastDrawn) {
        var s = bag.length - 1;
        var u = bag[s]; bag[s] = bag[0]; bag[0] = u;
      }
    }
    refill();

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function draw() {
      if (busy) return;
      busy = true;

      var restart = !bag.length;
      if (restart) refill();
      var i = bag.pop();
      lastDrawn = i;

      load(i).then(function () {
        function place() {
          if (restart) {
            Array.prototype.forEach.call(slot.querySelectorAll('.card-flip'), function (el) { el.remove(); });
          }
          var flip = build(i);
          var d = deck.getBoundingClientRect();
          var s = slot.getBoundingClientRect();
          flip.style.setProperty('--dx', (d.left - s.left) + 'px');
          flip.style.setProperty('--dy', (d.top - s.top) + 'px');
          flip.style.setProperty('--ox', rand(-7, 7).toFixed(1) + 'px');
          flip.style.setProperty('--oy', rand(-6, 6).toFixed(1) + 'px');
          flip.style.setProperty('--tilt', rand(-6, 6).toFixed(1) + 'deg');
          slot.appendChild(flip);
          slot.classList.add('has-card');

          // only the latest few stay stacked; the oldest slides away
          var pile = slot.querySelectorAll('.card-flip:not(.is-leaving)');
          for (var n = 0; n < pile.length - MAX_PILE; n++) {
            (function (old) {
              old.classList.add('is-leaving');
              setTimeout(function () { old.remove(); }, 220);
            })(pile[n]);
          }
          setTimeout(function () { busy = false; }, 850);
        }

        if (restart) {
          Array.prototype.forEach.call(slot.querySelectorAll('.card-flip'), function (el) {
            el.classList.add('is-leaving');
          });
          setTimeout(place, 220);
        } else {
          place();
        }
      });
    }

    deck.addEventListener('click', draw);
  });

  // ---------------- About : entrance fade-up ----------------
  // Everything below the intro paragraph (Career, Project History, Core
  // Responsibilities, Softwares, Certificate) fades up in sequence each
  // time About opens — the intro paragraph itself is left alone.
  var profileRevealTimers = [];
  var profileRevealTargets = document.querySelectorAll(
    '.page1 .career h4, ' +
    '.page1 .career > ul:not(.skills) > li, ' +
    '.page1 .pm-list ul li, ' +
    '.page1 .career ul.skills li, ' +
    '.page1 .skills-software, ' +
    '.page1 .skills-certificate'
  );
  Array.prototype.forEach.call(profileRevealTargets, function (el) {
    el.classList.add('reveal-up');
  });

  function playProfileReveal() {
    profileRevealTimers.forEach(clearTimeout);
    profileRevealTimers = [];
    Array.prototype.forEach.call(profileRevealTargets, function (el, i) {
      el.classList.remove('in-view');
      profileRevealTimers.push(setTimeout(function () {
        el.classList.add('in-view');
      }, 120 + i * 35));
    });
  }

  // ---------------- Core Responsibilities : equal-width category buttons ----------------
  // All three buttons share the width of the widest label. A CSS max-content
  // grid track can't do this here — the keyword line hidden under each
  // button is far wider than any label and would win the intrinsic-size
  // contest — so it's measured directly instead. Re-measured on resize and
  // once webfonts finish loading, since Instrument Serif swapping in changes
  // each label's natural width.
  (function () {
    var list = document.querySelector('.career ul.skills');
    var buttons = list ? list.querySelectorAll('.skill-category') : [];
    var side = document.querySelector('.skills-side');
    var row = document.querySelector('.skills-row');
    var main = document.querySelector('.skills-main');
    if (!list || !buttons.length) return;

    var resizeTimer = null;

    function sync() {
      list.style.setProperty('--skill-cat-w', 'auto');
      var max = 0;
      Array.prototype.forEach.call(buttons, function (btn) {
        max = Math.max(max, btn.getBoundingClientRect().width);
      });
      list.style.setProperty('--skill-cat-w', Math.ceil(max) + 'px');
    }

    // The keyword row's width is pinned to the English copy specifically
    // (measured from EN, above — not whatever language is on screen right
    // now), so the column is exactly as wide as it needs to be for English
    // and Korean just inherits that same box instead of the two languages
    // computing two different widths and shifting the column between them.
    function syncRevealWidth() {
      var max = 0;
      ['skill-cat-1', 'skill-cat-2', 'skill-cat-3'].forEach(function (key) {
        if (EN[key] === undefined) return;
        var probe = document.createElement('div');
        probe.className = 'skill-tags';
        probe.style.cssText = 'position:absolute; visibility:hidden; width:max-content; white-space:nowrap; opacity:1; overflow:visible;';
        probe.innerHTML = EN[key];
        // Appended inside the real list, not document.body: body's default
        // font stack (Gill Sans/General Sans first) is different from what
        // .skill-tags actually inherits here (Pretendard, via .page1
        // .contents), so measuring from body silently undershot the true
        // rendered width and left the keyword line clipped/scrollable even
        // on desktop, where it's supposed to fit exactly.
        list.appendChild(probe);
        max = Math.max(max, probe.getBoundingClientRect().width);
        list.removeChild(probe);
      });
      if (max > 0) {
        list.style.setProperty('--skill-reveal-w', Math.ceil(max) + 'px');
      }
    }

    // Spaces the three buttons so the last one's bottom edge lines up with
    // the Certificate block's last line (GTQi) on desktop, where Software/
    // Certificate sit beside Core Responsibilities. Measured, not guessed,
    // so it keeps tracking if the certificate text or button count ever
    // changes. Only applies when the two columns are actually rendering
    // side by side right now -- checked by comparing their tops rather
    // than a width breakpoint, since .skills-row's own flex-wrap can drop
    // .skills-main to its own line well above the explicit mobile stack
    // width, and applying this alignment there would misfire. Stacked
    // layouts (either kind) keep the plain 24px fallback instead.
    function syncCatGap() {
      var items = list.querySelectorAll('li');
      var certLines = document.querySelectorAll('.skills-certificate p');
      if (!items.length || !certLines.length || !side) return;
      var sameRow = Math.abs(side.getBoundingClientRect().top - list.closest('.skills-main').getBoundingClientRect().top) < 2;
      if (!sameRow) {
        list.style.removeProperty('--skill-gap');
        return;
      }
      var n = items.length;
      var gaps = n - 1;
      if (gaps <= 0) return;
      var targetBottom = certLines[certLines.length - 1].getBoundingClientRect().bottom;
      var ulTop = list.getBoundingClientRect().top;
      var itemH = items[0].getBoundingClientRect().height;
      var gap = Math.max(0, Math.round((targetBottom - ulTop - itemH * n) / gaps));
      list.style.setProperty('--skill-gap', gap + 'px');
    }

    // Whether Software/Certificate and Core Responsibilities stack into one
    // column happens the moment they no longer fit side by side — but that
    // point depends on live content (the reveal width above, the button
    // width) rather than any fixed viewport number, so it's measured
    // instead of driven off a CSS breakpoint. Without this, .skills-row's
    // own flex-wrap still drops .skills-main to its own line once it runs
    // out of room, but keeps the side-by-side spacing/margin rules that
    // only make sense there, which read as a broken layout in that gap
    // between "fits" and the explicit mobile width. Toggling a class here
    // instead applies the full stacked treatment (see CSS) right when it's
    // actually needed, at any window width.
    function syncStack() {
      if (!row || !main) return;
      row.classList.remove('skills-stacked');
      var need = side.getBoundingClientRect().width + main.getBoundingClientRect().width + 32;
      var have = row.getBoundingClientRect().width;
      if (need > have + 1) {
        row.classList.add('skills-stacked');
      }
    }

    sync();
    syncRevealWidth();
    syncStack();
    syncCatGap();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        sync();
        syncRevealWidth();
        syncStack();
        syncCatGap();
      });
    }
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        sync();
        syncStack();
        syncCatGap();
      }, 120);
    });
  })();

  // ---------------- Ranchu mascot : wandering swimmer (Ranchu project) ----------------
  // A small pet-like fish that drifts around the Ranchu project's detail
  // view on its own (it used to live on the About page),
  // occasionally swims toward the cursor, and otherwise wanders to random
  // points. It is position:fixed over the whole viewport, so it roams the
  // full page — above the project images, header and index — and scrolling
  // the images underneath never moves it. See the CSS for how it's hidden
  // everywhere else, and for the
  // tail/fin animations (now continuous CSS rotation on the separate rig
  // parts, not a sprite-frame loop). This only drives the whole-fish
  // position and heading.
  //
  // Movement is velocity-based ("seek" steering with arrival slowdown),
  // not a straight position-ease-toward-a-static-target — the previous
  // version eased position directly, which meant it sat almost still once
  // close to a target and then, the instant pickTarget() swapped to a new
  // far-away point, set off in a dead-straight line at whatever speed the
  // ease implied — visually a series of darts and stops ("점프하듯" /
  // flea-like), not swimming. Blending a velocity vector toward a desired
  // velocity instead means direction changes are gradual (a banked turn,
  // not a snap) and speed stays within a slow, constant cap the whole
  // time, which is what actually reads as unhurried, continuous swimming.
  (function () {
    var swimmer = document.querySelector('.ranchu-swimmer');
    if (!swimmer) return;

    // Rig is 550x1027 natively (see index.html/style.css), rendered at a
    // fixed 64px display width (matches .ranchu-swimmer in style.css) —
    // keeps the aspect ratio in sync here without needing to measure the
    // loaded image.
    var spriteW = 64;
    var spriteH = spriteW * (1027 / 550);
    var margin = 24;
    var bounds = { minX: margin, maxX: 100, minY: margin, maxY: 100 };

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    // The whole viewport, minus a small margin on every side.
    function computeBounds() {
      bounds.minX = margin;
      bounds.maxX = Math.max(margin, window.innerWidth - spriteW - margin);
      bounds.minY = margin;
      bounds.maxY = Math.max(margin, window.innerHeight - spriteH - margin);
    }
    computeBounds();

    var pos = { x: 0, y: 0 };
    var target = { x: 0, y: 0 };
    var vel = { x: 0, y: 0 };
    var angle = 0; // CSS rotate() value directly, not a world-space angle — 0deg matches the art's own default up-facing pose, so no offset is needed here (only in the atan2 conversion below).

    // A resize can shrink the bounds out from under wherever the fish
    // currently is (or was heading) — e.g. rotating a phone, or the
    // browser window narrowing — and without this it could sit stranded
    // outside the new viewport until the next pickTarget() call happened
    // to land it back in range, up to several seconds later.
    window.addEventListener('resize', function () {
      computeBounds();
      pos.x = clamp(pos.x, bounds.minX, bounds.maxX);
      pos.y = clamp(pos.y, bounds.minY, bounds.maxY);
      target.x = clamp(target.x, bounds.minX, bounds.maxX);
      target.y = clamp(target.y, bounds.minY, bounds.maxY);
    });

    (function initPos() {
      pos.x = bounds.minX + (bounds.maxX - bounds.minX) * 0.5;
      pos.y = bounds.minY + (bounds.maxY - bounds.minY) * 0.3;
      target.x = pos.x;
      target.y = pos.y;
    })();

    var mouse = { x: null, y: null, t: 0 };
    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.t = Date.now();
    });

    // Only swims while the Ranchu project is the open work (route() keeps
    // body[data-work] in sync with the hash).
    function fishActive() {
      return document.body.classList.contains('page2active') &&
             document.body.getAttribute('data-work') === 'ranchu';
    }

    // Clicking anywhere while it's out "pings" that spot — the fish
    // beelines for it, overriding whatever it was doing, holds there for
    // PING_HOLD_MS once it arrives, then goes back to wandering on its
    // own. Doesn't call preventDefault/stopPropagation: this only adds a
    // side effect on top of the click, it never swallows the click itself
    // (the "Contact her" trigger, language toggle, etc. all still work
    // normally when clicked).
    var pinging = false;
    var pingHoldTimer = null;
    var PING_ARRIVE_R = 18;   // px — how close counts as "arrived"
    var PING_HOLD_MS = 2000;

    document.addEventListener('click', function (e) {
      if (!fishActive()) return;
      if (e.target.closest && e.target.closest('.fish-food-jar')) return; // feeding, not a ping
      if (pingHoldTimer) { clearTimeout(pingHoldTimer); pingHoldTimer = null; }
      pinging = true;
      target.x = clamp(e.clientX - spriteW / 2, bounds.minX, bounds.maxX);
      target.y = clamp(e.clientY - spriteH / 2, bounds.minY, bounds.maxY);
    });

    // ---- feeding : the jar in the bottom-left corner tosses pellets for the fish ----
    // Each click on the jar tosses one pellet out to a random spot in the
    // viewport, up to MAX_PELLETS uneaten at a time. While any pellet is
    // out, the fish heads for the nearest one (quicker, like a ping) and
    // eats it the moment its mouth — the head end of the art, which leads
    // the way it's swimming — touches it. Pellets are fixed in the viewport
    // like the fish, so scrolling doesn't move them.
    var MAX_PELLETS = 4;
    var PELLET_W = 9;
    var PELLET_H = 13;
    var EAT_R = 15;           // px between mouth and pellet center that counts as a bite
    var pellets = [];         // { el, x, y } — x/y is the pellet's center once it lands
    var jar = document.querySelector('.fish-food-jar');

    function replayClass(el, cls) {
      el.classList.remove('is-shaking', 'is-empty');
      void el.offsetWidth;    // restart the animation even on rapid clicks
      el.classList.add(cls);
    }

    function removePellet(p) {
      var i = pellets.indexOf(p);
      if (i !== -1) pellets.splice(i, 1);
      p.el.classList.add('is-eaten');
      setTimeout(function () { if (p.el.parentNode) p.el.parentNode.removeChild(p.el); }, 220);
    }

    function clearPellets() {
      pellets.slice().forEach(removePellet);
    }

    if (jar) {
      jar.addEventListener('click', function () {
        if (!fishActive()) return;
        if (pellets.length >= MAX_PELLETS) { replayClass(jar, 'is-empty'); return; }
        replayClass(jar, 'is-shaking');

        var jr = jar.getBoundingClientRect();
        var fromX = jr.left + jr.width * 0.5;
        var fromY = jr.top + jr.height * 0.15;
        // land somewhere the fish can actually reach with its mouth
        var x = bounds.minX + spriteW / 2 + Math.random() * Math.max(1, bounds.maxX - bounds.minX);
        var y = bounds.minY + spriteH / 2 + Math.random() * Math.max(1, bounds.maxY - bounds.minY);

        var el = document.createElement('img');
        el.className = 'fish-pellet';
        el.src = './images/design/ranchu/feed/pellet.png?v=2';
        el.alt = '';
        el.setAttribute('aria-hidden', 'true');
        el.style.transition = 'none';
        el.style.transform = 'translate(' + (fromX - PELLET_W / 2) + 'px,' + (fromY - PELLET_H / 2) + 'px) scale(0.4)';
        document.body.appendChild(el);
        void el.offsetWidth;  // commit the start position, then let the CSS transition toss it
        el.style.transition = '';
        el.style.transform = 'translate(' + (x - PELLET_W / 2).toFixed(1) + 'px,' + (y - PELLET_H / 2).toFixed(1) + 'px) rotate(' + Math.round(Math.random() * 360) + 'deg)';

        pellets.push({ el: el, x: x, y: y });
        if (pingHoldTimer) { clearTimeout(pingHoldTimer); pingHoldTimer = null; }
        pinging = false;      // food beats a ping
      });
    }

    function pickTarget() {
      if (pinging || pellets.length) return; // a ping or feeding in progress overrides the usual wander/follow/idle picks
      var mouseFresh = mouse.x !== null && (Date.now() - mouse.t) < 8000;
      var r = Math.random();
      if (mouseFresh && r < 0.3) {
        // Swims toward the cursor but aims at a small random offset from
        // it rather than the exact point, so it settles near the visitor
        // rather than landing on top of the pointer.
        target.x = clamp(mouse.x - spriteW / 2 + (Math.random() - 0.5) * 90, bounds.minX, bounds.maxX);
        target.y = clamp(mouse.y - spriteH / 2 + (Math.random() - 0.5) * 90, bounds.minY, bounds.maxY);
      } else if (r < 0.85) {
        target.x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
        target.y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
      } else {
        // Idle: barely drifts from wherever it already is.
        target.x = clamp(pos.x + (Math.random() - 0.5) * 40, bounds.minX, bounds.maxX);
        target.y = clamp(pos.y + (Math.random() - 0.5) * 40, bounds.minY, bounds.maxY);
      }
    }
    pickTarget();
    setInterval(pickTarget, 4000 + Math.random() * 3500);

    var MAX_SPEED = 0.026;     // px/ms (~26px/s) — a slow, unhurried pace
    var PING_SPEED = 0.05;     // px/ms (~50px/s) — a bit quicker when called over by a click
    var PING_TURN_DEG_PER_S = 110; // and it turns toward the click a bit more readily
    var ARRIVAL_R = 110;       // px: starts coasting to a stop within this range of the target
    var STEER_RATE = 0.0022;   // per-ms blend factor for velocity turning — lower = wider, slower turns
    var MAX_TURN_DEG_PER_S = 65; // hard cap on how fast the visible heading can rotate
    var lastFrameTime = null;

    // Drives the .is-swimming class the tail/body/fin animations in CSS
    // are gated on (see style.css) — they only actually run while this is
    // true, instead of swishing forever even while the fish is sitting
    // still between wander points. Starting is instant (any real velocity
    // counts), but stopping waits out a short grace period first so a
    // momentary dip right at the threshold — e.g. mid-arrival slowdown —
    // doesn't flicker the animation on and off.
    var SWIM_SPEED_THRESHOLD = 0.006; // px/ms
    var STOP_GRACE_MS = 300;
    var swimming = false;
    var idleSince = null;

    function tick(now) {
      requestAnimationFrame(tick);
      if (!fishActive()) {
        lastFrameTime = now;
        if (pellets.length) clearPellets(); // leaving the project clears leftover food
        return;
      }
      if (lastFrameTime === null) lastFrameTime = now;
      var dt = Math.min(64, now - lastFrameTime);
      lastFrameTime = now;

      // Feeding: aim the fish's center at the nearest pellet, and eat any
      // pellet its mouth has reached. The mouth sits at the head end of the
      // art (top of the sprite at 0deg), rotated with the current heading.
      var feeding = pellets.length > 0;
      if (feeding) {
        var cx = pos.x + spriteW / 2;
        var cy = pos.y + spriteH / 2;
        var rad = angle * Math.PI / 180;
        var mouthX = cx + Math.sin(rad) * spriteH * 0.44;
        var mouthY = cy - Math.cos(rad) * spriteH * 0.44;
        var nearest = null;
        var nearestD = Infinity;
        pellets.slice().forEach(function (p) {
          var md = Math.sqrt((p.x - mouthX) * (p.x - mouthX) + (p.y - mouthY) * (p.y - mouthY));
          var cd = Math.sqrt((p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy));
          if (md < EAT_R || cd < EAT_R) { removePellet(p); return; }
          if (md < nearestD) { nearestD = md; nearest = p; }
        });
        if (nearest) {
          target.x = clamp(nearest.x - spriteW / 2, bounds.minX, bounds.maxX);
          target.y = clamp(nearest.y - spriteH / 2, bounds.minY, bounds.maxY);
        } else {
          feeding = false;
          pickTarget();       // last pellet eaten: back to wandering
        }
      }
      var rushing = pinging || feeding;

      var dx = target.x - pos.x;
      var dy = target.y - pos.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (pinging && !pingHoldTimer && dist < PING_ARRIVE_R) {
        pingHoldTimer = setTimeout(function () {
          pinging = false;
          pingHoldTimer = null;
          pickTarget();
        }, PING_HOLD_MS);
      }

      var desiredX = 0, desiredY = 0;
      if (dist > 0.5) {
        // when feeding it doesn't coast to a stop short of the pellet
        var speed = (rushing ? PING_SPEED : MAX_SPEED) * (feeding ? Math.max(0.45, Math.min(1, dist / ARRIVAL_R)) : Math.min(1, dist / ARRIVAL_R));
        desiredX = (dx / dist) * speed;
        desiredY = (dy / dist) * speed;
      }
      var steerBlend = 1 - Math.pow(1 - STEER_RATE, dt);
      vel.x += (desiredX - vel.x) * steerBlend;
      vel.y += (desiredY - vel.y) * steerBlend;

      pos.x += vel.x * dt;
      pos.y += vel.y * dt;

      var speedNow = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
      var isTurningNow = false;
      if (speedNow > 0.002) {
        var targetAngle = Math.atan2(vel.y, vel.x) * 180 / Math.PI + 90;
        // Shortest-path difference so it never spins the long way around
        // crossing the -180/180 wrap.
        var diff = ((targetAngle - angle + 540) % 360) - 180;
        // A real fish can't snap to face a new direction — sharper turns
        // simply take proportionally longer, not "converge faster" the
        // way a percentage blend does (which let even a near-180° reversal
        // resolve almost as quickly as a small correction). Capping the
        // step at a fixed max degrees/second instead means a big turn
        // genuinely takes longer to complete, which is what actually
        // reads as swimming through a turn rather than snapping into it.
        var maxStep = (rushing ? PING_TURN_DEG_PER_S : MAX_TURN_DEG_PER_S) * (dt / 1000);
        angle += Math.max(-maxStep, Math.min(maxStep, diff));
        isTurningNow = Math.abs(diff) > 2;
      }

      // Also counts as "active" while genuinely mid-turn, even if linear
      // speed is momentarily below the swim threshold (e.g. right as it
      // sets off toward a new target and is still turning to face it
      // before it's picked up much speed) — without this the fish could
      // visibly rotate in place with a completely still tail, which reads
      // as being spun rather than steering itself.
      if (speedNow > SWIM_SPEED_THRESHOLD || isTurningNow) {
        idleSince = null;
        if (!swimming) {
          swimming = true;
          swimmer.classList.add('is-swimming');
        }
      } else {
        if (idleSince === null) idleSince = now;
        if (swimming && now - idleSince > STOP_GRACE_MS) {
          swimming = false;
          swimmer.classList.remove('is-swimming');
        }
      }

      // A small bob layered on top of the eased position so it's never
      // perfectly still, even once it's arrived at (or is idling near)
      // its target — reads as floating rather than parking.
      var bob = Math.sin(now / 1100) * 3;

      swimmer.style.transform =
        'translate(' + pos.x.toFixed(1) + 'px,' + (pos.y + bob).toFixed(1) + 'px) rotate(' + angle.toFixed(1) + 'deg)';
    }
    requestAnimationFrame(tick);
  })();

  // ---------------- views : home index / About / work detail ----------------
  // The URL hash picks the view, so the browser's back button works:
  //   (none)        home — category objects + index
  //   #about        About (the old Profile page)
  //   #work/<id>    work detail, showing only that one .work
  var VIEWS = ['page0', 'page1', 'page2'];
  var home = document.querySelector('.home');
  var detailHost = document.querySelector('.page2 .contents');
  var works = Array.prototype.slice.call(document.querySelectorAll('.page2 .work[data-work]'));

  function showView(page) {
    VIEWS.forEach(function (p) {
      document.body.classList.toggle(p + 'active', p === page);
    });
    // Anything measured while its view was display:none (carousel runways,
    // the Core Responsibilities widths, the fish's swim bounds) measured 0;
    // every one of those already re-measures on resize.
    requestAnimationFrame(function () {
      window.dispatchEvent(new Event('resize'));
      campaignTrackRefreshers.forEach(function (fn) { fn(); });
    });
  }

  function route() {
    var hash = location.hash.replace(/^#/, '');
    var workMatch = hash.match(/^work\/(.+)$/);
    var currentId = workMatch ? workMatch[1] : null;
    document.body.setAttribute('data-work', currentId || '');
    document.querySelectorAll('.idx-item').forEach(function (item) {
      item.classList.toggle('is-current', item.dataset.work === currentId);
    });
    if (workMatch && works.some(function (w) { return w.dataset.work === workMatch[1]; })) {
      works.forEach(function (w) { w.hidden = w.dataset.work !== workMatch[1]; });
      showView('page2');
      if (detailHost) detailHost.scrollTop = 0;
      var cat = home && home.querySelector('.obj[data-work="' + workMatch[1] + '"]');
      if (cat) setCategory(cat.dataset.cat);
    } else if (hash === 'about') {
      showView('page1');
      playProfileReveal();
    } else {
      showView('page0');
    }
  }

  function go(hash) {
    if (location.hash.replace(/^#/, '') === hash) { route(); return; }
    if (hash) {
      location.hash = hash;
    } else {
      history.pushState(null, '', location.pathname + location.search);
      route();
    }
  }

  // ---- home : category toggle (the index headers) + object/index focus ----
  var CAT_KEY = 'home-cat';

  function setCategory(cat) {
    if (!home) return;
    // e.g. a category remembered from before it was merged away
    if (!home.querySelector('.idx-group[data-cat="' + cat + '"]')) cat = 'design';
    home.dataset.cat = cat;
    home.querySelectorAll('.idx-group').forEach(function (g) {
      g.classList.toggle('is-open', g.dataset.cat === cat);
    });
    try { sessionStorage.setItem(CAT_KEY, cat); } catch (e) {}
  }

  if (home) {
    var idxGroups = home.querySelector('.idx-groups');

    home.querySelectorAll('.idx-cat').forEach(function (btn) {
      btn.addEventListener('click', function () { setCategory(btn.dataset.cat); });
    });

    function focusWork(id) {
      home.querySelectorAll('.obj, .idx-item').forEach(function (el) {
        el.classList.toggle('is-focus', el.dataset.work === id);
      });
      if (idxGroups) idxGroups.classList.toggle('has-focus', !!id);
    }

    home.querySelectorAll('.obj, .idx-item').forEach(function (el) {
      el.addEventListener('mouseenter', function () { focusWork(el.dataset.work); });
      el.addEventListener('mouseleave', function () { focusWork(null); });
      el.addEventListener('focus', function () { focusWork(el.dataset.work); });
      el.addEventListener('blur', function () { focusWork(null); });
      el.addEventListener('click', function () {
        focusWork(null);
        go('work/' + el.dataset.work);
      });
    });

    // ---- paper motion: the visible objects tilt together as one sheet ----
    // Modeled on the reference site: the field sits under a 1000px
    // perspective and tilts in 3D toward the cursor, as if the cursor were
    // pressing on that part of the sheet. The visible objects are treated
    // as ONE group — the tilt follows the cursor's position across the
    // group's overall bounds (not whichever object is nearest), so moving
    // from one object to the next glides instead of jolting. Strength fades
    // out over FALLOFF px once the cursor leaves the group's bounds.
    // Bounds come from the untransformed layout (offsets), so the tilt
    // never feeds back into the measurement.
    var field = home.querySelector('.home-field');
    var objs = Array.prototype.slice.call(home.querySelectorAll('.obj'));
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (field && !reduceMotion) {
      var MAX_TILT = 9;     // deg at the group's edges
      var FALLOFF = 220;    // px outside the group where the tilt fades out
      var EASE = 0.045;     // lower = slower, heavier sheet
      var target = { rx: 0, ry: 0 };
      var cur = { rx: 0, ry: 0 };
      var sheetRaf = null;

      function stepSheet() {
        cur.rx += (target.rx - cur.rx) * EASE;
        cur.ry += (target.ry - cur.ry) * EASE;
        field.style.transform = 'perspective(1000px) rotateX(' + cur.rx.toFixed(3) + 'deg) rotateY(' + cur.ry.toFixed(3) + 'deg)';
        var settled = Math.abs(target.rx - cur.rx) < 0.005 && Math.abs(target.ry - cur.ry) < 0.005;
        sheetRaf = settled ? null : requestAnimationFrame(stepSheet);
      }

      function aimSheet(rx, ry) {
        target.rx = rx;
        target.ry = ry;
        if (!sheetRaf) sheetRaf = requestAnimationFrame(stepSheet);
      }

      // bounding box of the currently visible category's objects
      function groupBounds() {
        var homeRect = home.getBoundingClientRect();
        var fx = homeRect.left + field.offsetLeft;
        var fy = homeRect.top + field.offsetTop;
        var b = null;
        objs.forEach(function (o) {
          if (o.dataset.cat !== home.dataset.cat) return;
          var l = fx + o.offsetLeft;
          var t = fy + o.offsetTop;
          var r = l + o.offsetWidth;
          var btm = t + o.offsetHeight;
          if (!b) { b = { l: l, t: t, r: r, b: btm }; return; }
          b.l = Math.min(b.l, l); b.t = Math.min(b.t, t);
          b.r = Math.max(b.r, r); b.b = Math.max(b.b, btm);
        });
        return b;
      }

      home.addEventListener('mousemove', function (e) {
        // only while the object field is actually showing (not behind a work detail)
        if (window.innerWidth <= 812 || !field.offsetParent) return;
        var g = groupBounds();
        if (!g) return;
        var cx = (g.l + g.r) / 2;
        var cy = (g.t + g.b) / 2;
        var nx = Math.max(-1, Math.min(1, (e.clientX - cx) / ((g.r - g.l) / 2)));
        var ny = Math.max(-1, Math.min(1, (e.clientY - cy) / ((g.b - g.t) / 2)));

        var dx = Math.max(g.l - e.clientX, 0, e.clientX - g.r);
        var dy = Math.max(g.t - e.clientY, 0, e.clientY - g.b);
        var d = Math.sqrt(dx * dx + dy * dy);
        var k = Math.max(0, 1 - d / FALLOFF);
        var strength = k * k * (3 - 2 * k); // smoothstep

        // the side under the cursor dips away from the viewer
        aimSheet(ny * MAX_TILT * strength, -nx * MAX_TILT * strength);
      });

      home.addEventListener('mouseleave', function () { aimSheet(0, 0); });
    }

    // ---- index box: sized for the open Design list, pinned to the bottom ----
    // The category list sits at the bottom of the index column, just above
    // Contact, in a box as tall as the longest state (Design open, 5 rows).
    // Its content is bottom-aligned, so the last header never moves and a
    // category opens upward from there; switching categories doesn't make
    // the column jump.
    function sizeIndexBox() {
      if (!idxGroups) return;
      if (window.innerWidth <= 812) { idxGroups.style.height = ''; return; }
      var h = 0;
      home.querySelectorAll('.idx-group').forEach(function (g, i) {
        h += g.querySelector('h2').offsetHeight + (i ? 1 : 0); // + divider above
        if (g.dataset.cat === 'design') {
          var ul = g.querySelector('.idx-list > ul');
          if (ul) h += ul.scrollHeight;
        }
      });
      idxGroups.style.height = h + 'px';
    }
    sizeIndexBox();
    window.addEventListener('resize', sizeIndexBox);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeIndexBox);

    var savedCat = 'design';
    try { savedCat = sessionStorage.getItem(CAT_KEY) || 'design'; } catch (e) {}
    setCategory(savedCat);
  }

  // About: the overlay shows while the cursor is on the link; a click pins it
  // open (touch screens, or to read at leisure) until clicked again / Esc.
  var aboutPop = document.querySelector('.about-pop');
  var aboutPinned = false;
  function setAbout(open) {
    if (!aboutPop) return;
    document.body.classList.toggle('about-open', open);
    aboutPop.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  document.querySelectorAll('[data-view="page1"]').forEach(function (btn) {
    btn.addEventListener('mouseenter', function () { setAbout(true); });
    btn.addEventListener('mouseleave', function () { if (!aboutPinned) setAbout(false); });
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      aboutPinned = !aboutPinned;
      // on touch screens :hover sticks after a tap, so only a real pointer keeps it open
      setAbout(aboutPinned || (btn.matches(':hover') && matchMedia('(hover: hover)').matches));
    });
  });
  document.addEventListener('click', function (e) {
    if (aboutPinned && !e.target.closest('.card-trigger, .lang-toggle')) { aboutPinned = false; setAbout(false); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('about-open')) { aboutPinned = false; setAbout(false); }
  });
  window.addEventListener('hashchange', function () { aboutPinned = false; setAbout(false); });

  // the name in the header always leads back to the home view
  document.querySelectorAll('.home-name').forEach(function (el) {
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.addEventListener('click', function () { go(''); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(''); }
    });
  });

  var viewClose = document.querySelector('.view-close');
  if (viewClose) viewClose.addEventListener('click', function () { go(''); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && card.hidden && !document.body.classList.contains('page0active')) {
      go('');
    }
  });

  // ---- work detail : slower, eased wheel scrolling ----
  // Native wheel scrolling moved through the detail images too fast. Mouse-
  // wheel / trackpad input on the detail view is scaled down (SPEED) and
  // eased toward its target (EASE) instead. Only vertical wheel gestures
  // are taken over — horizontal swipes still reach the campaign carousels,
  // ctrl/⌘+wheel still zooms, and touch, keyboard and the progress-thumb
  // drag keep their native behavior (the target re-syncs from scrollTop
  // whenever something else moves the page).
  if (detailHost && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var SPEED = 0.45;
    var EASE = 0.12;
    var scrollTarget = detailHost.scrollTop;
    var scrollRaf = null;
    var easing = false;

    var lastSet = null;       // where the glide last put scrollTop

    function stopGlide() {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      scrollRaf = null;
      easing = false;
      lastSet = null;
    }

    function stepScroll() {
      // something else moved the page mid-glide (the scrollbar or the
      // progress dot being dragged): let go, so it stays where it was put
      if (lastSet !== null && Math.abs(detailHost.scrollTop - lastSet) > 2) { stopGlide(); return; }
      var diff = scrollTarget - detailHost.scrollTop;
      if (Math.abs(diff) < 0.5) {
        detailHost.scrollTop = scrollTarget;
        stopGlide();
        return;
      }
      detailHost.scrollTop += diff * EASE;
      lastSet = detailHost.scrollTop;
      scrollRaf = requestAnimationFrame(stepScroll);
    }

    // grabbing the scrollbar or the progress dot ends any glide right away
    detailHost.addEventListener('pointerdown', stopGlide);
    document.addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('.work-progress')) stopGlide();
    });

    detailHost.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.metaKey) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      var delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 40;                       // lines -> px
      else if (e.deltaMode === 2) delta *= detailHost.clientHeight; // pages -> px
      if (!easing) scrollTarget = detailHost.scrollTop;
      var max = detailHost.scrollHeight - detailHost.clientHeight;
      scrollTarget = Math.max(0, Math.min(max, scrollTarget + delta * SPEED));
      easing = true;
      if (!scrollRaf) scrollRaf = requestAnimationFrame(stepScroll);
    }, { passive: false });

    // opening another work resets scrollTop to 0; drop any glide in flight
    window.addEventListener('hashchange', function () {
      stopGlide();
      scrollTarget = 0;
    });
  }

  // ---- italic swap : Instrument Serif italic stretched to Pretendard width ----
  // These links and numbers swap to Instrument Serif italic on hover (see
  // "Italic swap" in style.css). The italic is far narrower than Pretendard
  // Medium, so each element's text is measured in both faces; the element
  // keeps the Pretendard width as a fixed box, and --stretch scales the
  // italic horizontally to fill exactly that width.
  var SWAP_SELECTOR = '.home-name, .nav-link, .lang-toggle, .home-contact .card-trigger, .obj-num, .idx-num';
  var SWAP_SIZE = 1.15; // italic font-size relative to the resting text (matches the CSS)
  var measureCtx = document.createElement('canvas').getContext('2d');

  function textWidth(text, font, letterSpacing) {
    measureCtx.font = font;
    if ('letterSpacing' in measureCtx) measureCtx.letterSpacing = letterSpacing;
    return measureCtx.measureText(text).width;
  }

  function fitItalicSwaps() {
    document.querySelectorAll(SWAP_SELECTOR).forEach(function (el) {
      var text = el.textContent.trim();
      if (!text) return;
      // resting size: the toggle sets its own 14px; everything else inherits
      var size = el.classList.contains('lang-toggle') ? 14 : parseFloat(getComputedStyle(el.parentElement).fontSize);
      var spacing = getComputedStyle(el.parentElement).letterSpacing;
      if (spacing === 'normal') spacing = '0px';
      var rest = textWidth(text, '500 ' + size + 'px Pretendard', spacing);
      var italic = textWidth(text, 'italic 400 ' + (size * SWAP_SIZE) + 'px "Instrument Serif"', spacing);
      if (!rest || !italic) return;
      el.style.width = Math.ceil(rest) + 'px';
      el.style.setProperty('--stretch', (rest / italic).toFixed(4));
    });
  }

  if (document.fonts && document.fonts.load) {
    Promise.all([
      document.fonts.load('500 16px Pretendard'),
      document.fonts.load('italic 400 16px "Instrument Serif"')
    ]).then(fitItalicSwaps, fitItalicSwaps);
  } else {
    fitItalicSwaps();
  }
  // KR <-> EN changes the toggle's own label
  if (toggle) toggle.addEventListener('click', function () { setTimeout(fitItalicSwaps, 0); });

  window.addEventListener('hashchange', route);
  window.addEventListener('popstate', route);
  route();
});

// ---- adidas cover: the phones switch on each time the cover scrolls into view ----
(function () {
  var cover = document.querySelector('.ad-cover');
  if (!cover || !('IntersectionObserver' in window)) { if (cover) cover.classList.add('is-on'); return; }
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.intersectionRatio >= 0.45) cover.classList.add('is-on');
      else if (e.intersectionRatio === 0) cover.classList.remove('is-on');
    });
  }, { threshold: [0, 0.45] }).observe(cover);
})();

// ---- work detail: a left info column taller than the screen ----
// The column is sticky at the top, so anything below the fold (the Ranchu
// food jar, long Role copy) could never be scrolled to. When it is too tall,
// its sticky offset goes negative by the overflow: it scrolls with the page
// until its last line is in view, then holds there.
(function () {
  var BOTTOM_ROOM = 24;
  function fitSideColumns() {
    document.querySelectorAll('.page2 .work-side--left').forEach(function (col) {
      col.style.top = '';
      var scroller = col.closest('.contents');
      if (!scroller || !col.offsetHeight) return;
      var avail = scroller.clientHeight - parseFloat(getComputedStyle(scroller).paddingTop);
      // measure what is actually drawn: the Ranchu jar is pushed down with a
      // margin in Korean and can reach past the column's own box
      var colTop = col.getBoundingClientRect().top, bottom = col.offsetHeight;
      Array.prototype.forEach.call(col.children, function (child) {
        bottom = Math.max(bottom, child.getBoundingClientRect().bottom - colTop);
      });
      var over = bottom + BOTTOM_ROOM - avail;
      if (over > 0) col.style.top = -over + 'px';
    });
  }
  // while such a column is scrolled up, fade it out under the header band
  // instead of letting its lines run over the header text
  var FADE = 28;
  function maskSideColumn(scroller) {
    document.querySelectorAll('.page2 .work-side--left').forEach(function (c) {
      if (!c.style.top) { c.style.webkitMaskImage = c.style.maskImage = ''; return; }
      var line = scroller.getBoundingClientRect().top + parseFloat(getComputedStyle(scroller).paddingTop) - 12;
      var hidden = Math.round(line - c.getBoundingClientRect().top);
      var m = hidden > 0
        ? 'linear-gradient(to bottom, transparent ' + hidden + 'px, #000 ' + (hidden + FADE) + 'px)'
        : '';
      c.style.webkitMaskImage = c.style.maskImage = m;
    });
  }
  document.querySelectorAll('.page2 .contents').forEach(function (sc) {
    sc.addEventListener('scroll', function () { maskSideColumn(sc); }, { passive: true });
  });

  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function () { fitSideColumns(); });
    document.querySelectorAll('.page2 .work-side--left').forEach(function (c) {
      ro.observe(c);
      Array.prototype.forEach.call(c.children, function (child) { ro.observe(child); });
    });
  }
  window.addEventListener('resize', fitSideColumns);
  window.addEventListener('hashchange', function () { setTimeout(fitSideColumns, 60); });
  var toggle = document.getElementById('langToggle');
  if (toggle) toggle.addEventListener('click', function () { setTimeout(fitSideColumns, 60); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitSideColumns);
  window.addEventListener('load', fitSideColumns);
  setTimeout(fitSideColumns, 300);
})();
