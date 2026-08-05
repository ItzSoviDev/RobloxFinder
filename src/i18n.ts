export type Language = 'es' | 'en' | 'pt' | 'fr' | 'de' | 'ja' | 'ko';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  es: {
    appTitle: "BloxFinder",
    appSubtitle: "Buscador de Jugadores, Datos & Juegos de Roblox",
    tabPlayers: "Jugadores",
    tabGames: "Juegos",
    
    // Search & Hero
    dbBadge: "Base de Datos de Roblox",
    heroTitle: "Explora y Consulta Cualquier Jugador de Roblox",
    heroDesc: "Escribe el nombre de usuario de cualquier jugador para cargar su perfil, ver su renderizado oficial 2D, inspeccionar accesorios, grupos, amigos e indumentarias.",
    
    searchPlaceholder: "Escribe un usuario de Roblox (ej: David.Baszucki, Buildintoys)...",
    searchButton: "Buscar",
    searching: "Buscando...",
    
    usersFound: "Usuarios Encontrados",
    viewProfile: "VER PERFIL",
    recentSearchesTitle: "Historial de Búsquedas",
    clear: "Limpiar",
    emptyHistory: "Aún no tienes historial. Los usuarios que busques aparecerán aquí.",
    backToSearch: "← Volver a Búsqueda",
    
    // Player Details
    loadingProfileTitle: "Cargando Perfil...",
    loadingProfileSubtitle: "Obteniendo datos e inventario de Roblox...",
    connectionError: "Error de Conexión",
    
    info: "Información",
    groups: "Grupos",
    friends: "Amigos",
    assets: "Accesorios & Ropa",
    
    bioLabel: "Biografía / Descripción",
    noDescription: "Sin descripción proporcionada en Roblox.",
    created: "Fecha de Creación",
    id: "Roblox ID",
    avatarType: "Tipo Avatar",
    verified: "Verificado",
    yes: "Sí ✓",
    no: "No",
    viewOnRoblox: "Perfil Roblox",
    rolimonsStats: "Rolimon's Stats",
    
    loadingGroups: "Cargando grupos de Roblox...",
    noGroups: "Este usuario no pertenece a ningún grupo público.",
    role: "Rol",
    
    loadingFriends: "Cargando lista de amigos...",
    noFriends: "No se encontraron amigos públicos.",
    
    noAssets: "Este usuario no tiene accesorios registrados equipados.",
    itemId: "ID Item",
    
    // Games tab
    gamesHeroBadge: "Explorador de Experiencias",
    gamesTitle: "Buscador de Juegos de Roblox",
    gamesSubtitle: "Encuentra los juegos y experiencias más populares o busca tu título favorito. Consulta estadísticas en tiempo real como jugadores activos en vivo y visitas totales.",
    searchGamePlaceholder: "Buscar juegos (ej: Blox Fruits, Brookhaven, Adopt Me, Horror)...",
    searchGameButton: "Buscar Juego",
    
    categoryAll: "🔥 Todos (80+)",
    categoryRoleplay: "🎭 Roleplay",
    categoryAction: "⚔️ Acción & PvP",
    categoryHorror: "👻 Terror & Misterio",
    categoryAnime: "⚔️ Anime",
    categoryPets: "🐾 Mascotas",
    categoryObby: "🧱 Obby & Parkour",
    categoryTycoon: "🏢 Tycoon & Sim",
    categoryRacing: "🏎️ Carreras",
    categoryRng: "🎲 RNG",
    categoryFashion: "✨ Moda",
    categoryRpg: "🛡️ RPG",
    
    loadingGames: "Cargando Experiencias...",
    gamesFound: "Juegos Encontrados",
    noGamesFound: "No se encontraron juegos para esta búsqueda.",
    viewPopularGames: "Ver juegos populares predeterminados",
    live: "en vivo",
    free: "GRATIS",
    byCreator: "Por",
    visits: "Visitas",
    placeId: "ID Lugar",
    playOnRoblox: "Jugar",
    copied: "¡Copiado!",
    
    // Footer
    footerLeft: "BloxFinder Platform 2026",
    footerText: "Hecho por Witz Studio | © Copyright 2026"
  },
  en: {
    appTitle: "BloxFinder",
    appSubtitle: "Roblox Player Finder, Data & Games Explorer",
    tabPlayers: "Players",
    tabGames: "Games",
    
    dbBadge: "Roblox Database",
    heroTitle: "Explore & Inspect Any Roblox Player",
    heroDesc: "Type any Roblox username to load their profile, official render, inspect accessories, groups, friends, and avatar outfits.",
    
    searchPlaceholder: "Type a Roblox username (e.g. David.Baszucki, Buildintoys)...",
    searchButton: "Search",
    searching: "Searching...",
    
    usersFound: "Users Found",
    viewProfile: "VIEW PROFILE",
    recentSearchesTitle: "Search History",
    clear: "Clear",
    emptyHistory: "No search history yet. Profiles you search will appear here.",
    backToSearch: "← Back to Search",
    
    loadingProfileTitle: "Loading Profile...",
    loadingProfileSubtitle: "Fetching Roblox data and inventory...",
    connectionError: "Connection Error",
    
    info: "Info",
    groups: "Groups",
    friends: "Friends",
    assets: "Accessories & Clothing",
    
    bioLabel: "Biography / Description",
    noDescription: "No biography provided on Roblox.",
    created: "Join Date",
    id: "Roblox ID",
    avatarType: "Avatar Type",
    verified: "Verified",
    yes: "Yes ✓",
    no: "No",
    viewOnRoblox: "Roblox Profile",
    rolimonsStats: "Rolimon's Stats",
    
    loadingGroups: "Loading Roblox groups...",
    noGroups: "This user does not belong to any public group.",
    role: "Role",
    
    loadingFriends: "Loading friends list...",
    noFriends: "No public friends found.",
    
    noAssets: "This user has no equipped accessories registered.",
    itemId: "Item ID",
    
    gamesHeroBadge: "Experience Explorer",
    gamesTitle: "Roblox Games Search",
    gamesSubtitle: "Find top popular experiences or search for your favorite titles. Check live player counts and total visits in real time.",
    searchGamePlaceholder: "Search games (e.g. Blox Fruits, Brookhaven, Adopt Me, Horror)...",
    searchGameButton: "Search Game",
    
    categoryAll: "🔥 All (80+)",
    categoryRoleplay: "🎭 Roleplay",
    categoryAction: "⚔️ Action & PvP",
    categoryHorror: "👻 Horror & Mystery",
    categoryAnime: "⚔️ Anime",
    categoryPets: "🐾 Pets",
    categoryObby: "🧱 Obby & Parkour",
    categoryTycoon: "🏢 Tycoon & Sim",
    categoryRacing: "🏎️ Racing",
    categoryRng: "🎲 RNG",
    categoryFashion: "✨ Fashion",
    categoryRpg: "🛡️ RPG",
    
    loadingGames: "Loading Experiences...",
    gamesFound: "Games Found",
    noGamesFound: "No games found for this search.",
    viewPopularGames: "View default popular games",
    live: "live",
    free: "FREE",
    byCreator: "By",
    visits: "Visits",
    placeId: "Place ID",
    playOnRoblox: "Play",
    copied: "Copied!",
    
    footerLeft: "BloxFinder Platform 2026",
    footerText: "Made by Witz Studio | © Copyright 2026"
  },
  pt: {
    appTitle: "BloxFinder",
    appSubtitle: "Buscador de Jogadores, Dados & Jogos do Roblox",
    tabPlayers: "Jogadores",
    tabGames: "Jogos",
    
    dbBadge: "Banco de Dados Roblox",
    heroTitle: "Explore e Inspecione Qualquer Jogador do Roblox",
    heroDesc: "Digite qualquer nome de usuário do Roblox para carregar o perfil, renderização oficial, acessórios, grupos, amigos e roupas do avatar.",
    
    searchPlaceholder: "Digite um usuário do Roblox (ex: David.Baszucki, Buildintoys)...",
    searchButton: "Buscar",
    searching: "Buscando...",
    
    usersFound: "Usuários Encontrados",
    viewProfile: "VER PERFIL",
    recentSearchesTitle: "Histórico de Buscas",
    clear: "Limpar",
    emptyHistory: "Sem histórico ainda. Os perfis pesquisados aparecerão aqui.",
    backToSearch: "← Voltar à Busca",
    
    loadingProfileTitle: "Carregando Perfil...",
    loadingProfileSubtitle: "Obtendo dados e inventário do Roblox...",
    connectionError: "Erro de Conexão",
    
    info: "Informações",
    groups: "Grupos",
    friends: "Amigos",
    assets: "Roupas",
    
    bioLabel: "Biografia / Descrição",
    noDescription: "Sem biografia fornecida no Roblox.",
    created: "Data de Criação",
    id: "ID Roblox",
    avatarType: "Tipo de Avatar",
    verified: "Verificado",
    yes: "Sim ✓",
    no: "Não",
    viewOnRoblox: "Perfil Roblox",
    rolimonsStats: "Rolimon's Stats",
    
    loadingGroups: "Carregando grupos do Roblox...",
    noGroups: "Este usuário não pertence a nenhum grupo público.",
    role: "Cargo",
    
    loadingFriends: "Carregando lista de amigos...",
    noFriends: "Nenhum amigo público encontrado.",
    
    noAssets: "Este usuário não possui acessórios equipados registrados.",
    itemId: "ID do Item",
    
    gamesHeroBadge: "Explorador de Experiências",
    gamesTitle: "Buscador de Jogos do Roblox",
    gamesSubtitle: "Encontre os jogos mais populares ou busque seus títulos favoritos. Verifique jogadores ao vivo e visitas totais em tempo real.",
    searchGamePlaceholder: "Buscar jogos (ex: Blox Fruits, Brookhaven, Adopt Me, Horror)...",
    searchGameButton: "Buscar Jogo",
    
    categoryAll: "🔥 Todos (80+)",
    categoryRoleplay: "🎭 Roleplay",
    categoryAction: "⚔️ Ação & PvP",
    categoryHorror: "👻 Terror & Mistério",
    categoryAnime: "⚔️ Anime",
    categoryPets: "🐾 Animais",
    categoryObby: "🧱 Obby & Parkour",
    categoryTycoon: "🏢 Tycoon & Sim",
    categoryRacing: "🏎️ Corridas",
    categoryRng: "🎲 RNG",
    categoryFashion: "✨ Moda",
    categoryRpg: "🛡️ RPG",
    
    loadingGames: "Carregando Experiências...",
    gamesFound: "Jogos Encontrados",
    noGamesFound: "Nenhum jogo encontrado para esta busca.",
    viewPopularGames: "Ver jogos populares padrão",
    live: "ao vivo",
    free: "GRÁTIS",
    byCreator: "Por",
    visits: "Visitas",
    placeId: "ID do Local",
    playOnRoblox: "Jogar",
    copied: "Copiado!",
    
    footerLeft: "BloxFinder Platform 2026",
    footerText: "Feito por Witz Studio | © Copyright 2026"
  },
  fr: {
    appTitle: "BloxFinder",
    appSubtitle: "Recherche de Joueurs, Données & Jeux Roblox",
    tabPlayers: "Joueurs",
    tabGames: "Jeux",
    
    dbBadge: "Base de Données Roblox",
    heroTitle: "Explorez & Inspectez N'importe quel Joueur Roblox",
    heroDesc: "Entrez un nom d'utilisateur Roblox pour charger son profil, son rendu officiel, inspecter ses accessoires, groupes, amis et vêtements.",
    
    searchPlaceholder: "Entrez un nom d'utilisateur Roblox (ex: David.Baszucki)...",
    searchButton: "Chercher",
    searching: "Recherche...",
    
    usersFound: "Utilisateurs Trouvés",
    viewProfile: "VOIR PROFIL",
    recentSearchesTitle: "Historique de Recherche",
    clear: "Effacer",
    emptyHistory: "Aucun historique. Les profils recherchés apparaîtront ici.",
    backToSearch: "← Retour à la Recherche",
    
    loadingProfileTitle: "Chargement du Profil...",
    loadingProfileSubtitle: "Récupération des données et de l'inventaire Roblox...",
    connectionError: "Erreur de Connexion",
    
    info: "Infos",
    groups: "Groupes",
    friends: "Amis",
    assets: "Vêtements",
    
    bioLabel: "Biographie / Description",
    noDescription: "Aucune biographie fournie sur Roblox.",
    created: "Date de Création",
    id: "ID Roblox",
    avatarType: "Type d'Avatar",
    verified: "Vérifié",
    yes: "Oui ✓",
    no: "Non",
    viewOnRoblox: "Profil Roblox",
    rolimonsStats: "Rolimon's Stats",
    
    loadingGroups: "Chargement des groupes Roblox...",
    noGroups: "Cet utilisateur n'appartient à aucun groupe public.",
    role: "Rôle",
    
    loadingFriends: "Chargement de la liste d'amis...",
    noFriends: "Aucun ami public trouvé.",
    
    noAssets: "Cet utilisateur n'a aucun accessoire équipé enregistré.",
    itemId: "ID Article",
    
    gamesHeroBadge: "Explorateur d'Expériences",
    gamesTitle: "Recherche de Jeux Roblox",
    gamesSubtitle: "Trouvez les jeux les plus populaires ou cherchez vos titres préférés. Consultez les joueurs en direct et le total des visites.",
    searchGamePlaceholder: "Rechercher des jeux (ex: Blox Fruits, Brookhaven, Adopt Me)...",
    searchGameButton: "Chercher Jeu",
    
    categoryAll: "🔥 Tous (80+)",
    categoryRoleplay: "🎭 Jeu de Rôle",
    categoryAction: "⚔️ Action & PvP",
    categoryHorror: "👻 Horreur & Mystère",
    categoryAnime: "⚔️ Anime",
    categoryPets: "🐾 Animaux",
    categoryObby: "🧱 Parkour / Obby",
    categoryTycoon: "🏢 Tycoon & Sim",
    categoryRacing: "🏎️ Course",
    categoryRng: "🎲 RNG",
    categoryFashion: "✨ Mode",
    categoryRpg: "🛡️ RPG",
    
    loadingGames: "Chargement des Expériences...",
    gamesFound: "Jeux Trouvés",
    noGamesFound: "Aucun jeu trouvé pour cette recherche.",
    viewPopularGames: "Voir les jeux populaires par défaut",
    live: "en direct",
    free: "GRATUIT",
    byCreator: "Par",
    visits: "Visites",
    placeId: "ID Emplacement",
    playOnRoblox: "Jouer",
    copied: "Copié !",
    
    footerLeft: "Conteneur AI Studio Cloud Run Workspace",
    footerText: "Développé avec React, Tailwind et Gemini en plusieurs langues."
  },
  de: {
    appTitle: "BloxFinder",
    appSubtitle: "Roblox-Spielerfinder, Daten & Spiele-Explorer",
    tabPlayers: "Spieler",
    tabGames: "Spiele",
    
    dbBadge: "Roblox-Datenbank",
    heroTitle: "Erforsche & Inspeziere Jeden Roblox-Spieler",
    heroDesc: "Gib einen Roblox-Benutzernamen ein, um das Profil, das offizielle Rendern, Zubehör, Gruppen, Freunde und Outfits zu laden.",
    
    searchPlaceholder: "Roblox-Benutzernamen eingeben (z.B. David.Baszucki)...",
    searchButton: "Suchen",
    searching: "Suchen...",
    
    usersFound: "Gefundene Benutzer",
    viewProfile: "PROFIL ANSEHEN",
    recentSearchesTitle: "Suchverlauf",
    clear: "Löschen",
    emptyHistory: "Noch kein Suchverlauf. Gesuchte Profile erscheinen hier.",
    backToSearch: "← Zurück zur Suche",
    
    loadingProfileTitle: "Profil wird geladen...",
    loadingProfileSubtitle: "Roblox-Daten und Inventar werden abgerufen...",
    connectionError: "Verbindungsfehler",
    
    info: "Info",
    groups: "Gruppen",
    friends: "Freunde",
    assets: "Kleidung",
    
    bioLabel: "Biografie / Beschreibung",
    noDescription: "Keine Biografie auf Roblox angegeben.",
    created: "Erstellungsdatum",
    id: "Roblox-ID",
    avatarType: "Avatar-Typ",
    verified: "Verifiziert",
    yes: "Ja ✓",
    no: "Nein",
    viewOnRoblox: "Roblox-Profil",
    rolimonsStats: "Rolimon's Stats",
    
    loadingGroups: "Roblox-Gruppen werden geladen...",
    noGroups: "Dieser Benutzer gehört keiner öffentlichen Gruppe an.",
    role: "Rolle",
    
    loadingFriends: "Freundesliste wird geladen...",
    noFriends: "Keine öffentlichen Freunde gefunden.",
    
    noAssets: "Dieser Benutzer hat kein ausgerüstetes Zubehör registriert.",
    itemId: "Item-ID",
    
    gamesHeroBadge: "Erlebnis-Explorer",
    gamesTitle: "Roblox-Spielesuche",
    gamesSubtitle: "Finde die beliebtesten Erlebnisse oder suche nach deinen Lieblingsspielen. Überprüfe Live-Spielerzahlen und Gesamtbesuche.",
    searchGamePlaceholder: "Spiele suchen (z.B. Blox Fruits, Brookhaven, Adopt Me)...",
    searchGameButton: "Spiel Suchen",
    
    categoryAll: "🔥 Alle (80+)",
    categoryRoleplay: "🎭 Rollenspiel",
    categoryAction: "⚔️ Action & PvP",
    categoryHorror: "👻 Horror & Mysterium",
    categoryAnime: "⚔️ Anime",
    categoryPets: "🐾 Haustiere",
    categoryObby: "🧱 Obby & Parkour",
    categoryTycoon: "🏢 Tycoon & Sim",
    categoryRacing: "🏎️ Rennen",
    categoryRng: "🎲 RNG",
    categoryFashion: "✨ Mode",
    categoryRpg: "🛡️ RPG",
    
    loadingGames: "Erlebnisse werden geladen...",
    gamesFound: "Gefundene Spiele",
    noGamesFound: "Keine Spiele für diese Suche gefunden.",
    viewPopularGames: "Beliebte Standardspiele anzeigen",
    live: "live",
    free: "KOSTENLOS",
    byCreator: "Von",
    visits: "Besuche",
    placeId: "Ort-ID",
    playOnRoblox: "Spielen",
    copied: "Kopiert!",
    
    footerLeft: "AI Studio Cloud Run Container",
    footerText: "Entwickelt mit React, Tailwind und Gemini in mehreren Sprachen."
  },
  ja: {
    appTitle: "BloxFinder",
    appSubtitle: "Roblox プレイヤー検索・データ＆ゲームエクスプローラー",
    tabPlayers: "プレイヤー",
    tabGames: "ゲーム",
    
    dbBadge: "Roblox データベース",
    heroTitle: "Robloxプレイヤーを検索・インスペクト",
    heroDesc: "ユーザー名を入力してプロフィール、2D公式レンダー、アクセサリー、グループ、フレンド、衣装データを読み込みます。",
    
    searchPlaceholder: "Robloxのユーザー名を入力 (例: David.Baszucki)...",
    searchButton: "検索",
    searching: "検索中...",
    
    usersFound: "見つかったユーザー",
    viewProfile: "プロフィールを見る",
    recentSearchesTitle: "検索履歴",
    clear: "消去",
    emptyHistory: "検索履歴はまだありません。",
    backToSearch: "← 検索に戻る",
    
    loadingProfileTitle: "プロフィール読み込み中...",
    loadingProfileSubtitle: "Robloxデータとインベントリを取得中...",
    connectionError: "接続エラー",
    
    info: "情報",
    groups: "グループ",
    friends: "フレンド",
    assets: "衣装・アイテム",
    
    bioLabel: "自己紹介 / バイオ",
    noDescription: "Robloxに自己紹介文が設定されていません。",
    created: "アカウント作成日",
    id: "Roblox ID",
    avatarType: "アバタータイプ",
    verified: "認証済み",
    yes: "はい ✓",
    no: "いいえ",
    viewOnRoblox: "Robloxプロフィール",
    rolimonsStats: "Rolimon's Stats",
    
    loadingGroups: "Robloxグループ読み込み中...",
    noGroups: "公開グループに参加していません。",
    role: "役職",
    
    loadingFriends: "フレンドリスト読み込み中...",
    noFriends: "公開フレンドは見つかりませんでした。",
    
    noAssets: "装備中の登録アイテムはありません。",
    itemId: "アイテム ID",
    
    gamesHeroBadge: "エクスペリエンス エクスプローラー",
    gamesTitle: "Roblox ゲーム検索",
    gamesSubtitle: "人気作品や好みのタイトルを検索。リアルタイム接続プレイヤー数や総訪問数をチェックできます。",
    searchGamePlaceholder: "ゲームを検索 (例: Blox Fruits, Brookhaven, Adopt Me)...",
    searchGameButton: "ゲーム検索",
    
    categoryAll: "🔥 すべて (80+)",
    categoryRoleplay: "🎭 ロールプレイ",
    categoryAction: "⚔️ アクション＆PvP",
    categoryHorror: "👻 ホラー＆ミステリー",
    categoryAnime: "⚔️ アニメ",
    categoryPets: "🐾 ペット",
    categoryObby: "🧱 アスレチック / オビー",
    categoryTycoon: "🏢 タイクーン",
    categoryRacing: "🏎️ レース",
    categoryRng: "🎲 RNG",
    categoryFashion: "✨ ファッション",
    categoryRpg: "🛡️ RPG",
    
    loadingGames: "エクスペリエンス読み込み中...",
    gamesFound: "見つかったゲーム",
    noGamesFound: "該当するゲームが見つかりませんでした。",
    viewPopularGames: "人気のデフォルトゲームを表示",
    live: "ライブ中",
    free: "無料",
    byCreator: "製作者:",
    visits: "訪問数",
    placeId: "プレイス ID",
    playOnRoblox: "プレイ",
    copied: "コピー完了！",
    
    footerLeft: "AI Studio Cloud Run コンテナ",
    footerText: "React、Tailwind、Geminiを使用して複数言語で構築されています。"
  },
  ko: {
    appTitle: "BloxFinder",
    appSubtitle: "Roblox 플레이어 검색, 데이터 및 게임 탐색기",
    tabPlayers: "플레이어",
    tabGames: "게임",
    
    dbBadge: "Roblox 데이터베이스",
    heroTitle: "Roblox 플레이어 탐색 및 점검",
    heroDesc: "Roblox 사용자 이름을 입력하여 프로필, 공식 2D 렌더, 액세서리, 그룹, 친구 및 아바타 의상 정보를 불러옵니다.",
    
    searchPlaceholder: "Roblox 사용자 이름 입력 (예: David.Baszucki)...",
    searchButton: "검색",
    searching: "검색 중...",
    
    usersFound: "검색된 사용자",
    viewProfile: "프로필 보기",
    recentSearchesTitle: "검색 기록",
    clear: "지우기",
    emptyHistory: "검색 기록이 없습니다.",
    backToSearch: "← 검색으로 돌아가기",
    
    loadingProfileTitle: "프로필 불러오는 중...",
    loadingProfileSubtitle: "Roblox 데이터 및 인벤토리 수집 중...",
    connectionError: "연결 오류",
    
    info: "정보",
    groups: "그룹",
    friends: "친구",
    assets: "의상",
    
    bioLabel: "자기소개 / 설명",
    noDescription: "Roblox에 작성된 자기소개가 없습니다.",
    created: "가입일",
    id: "Roblox ID",
    avatarType: "아바타 유형",
    verified: "인증 여부",
    yes: "예 ✓",
    no: "아니요",
    viewOnRoblox: "Roblox 프로필",
    rolimonsStats: "Rolimon's Stats",
    
    loadingGroups: "Roblox 그룹 불러오는 중...",
    noGroups: "공개 그룹에 가입되어 있지 않습니다.",
    role: "역할",
    
    loadingFriends: "친구 목록 불러오는 중...",
    noFriends: "공개 친구가 없습니다.",
    
    noAssets: "착용 중인 등록 아이템이 없습니다.",
    itemId: "아이템 ID",
    
    gamesHeroBadge: "체험 탐색기",
    gamesTitle: "Roblox 게임 검색",
    gamesSubtitle: "인기 게임을 찾거나 좋아하는 타이틀을 검색하세요. 실시간 접속자 수와 총 방문 수를 확인할 수 있습니다.",
    searchGamePlaceholder: "게임 검색 (예: Blox Fruits, Brookhaven, Adopt Me)...",
    searchGameButton: "게임 검색",
    
    categoryAll: "🔥 전체 (80+)",
    categoryRoleplay: "🎭 역할놀이",
    categoryAction: "⚔️ 액션 & PvP",
    categoryHorror: "👻 공포 & 미스터리",
    categoryAnime: "⚔️ 애니메이션",
    categoryPets: "🐾 펫",
    categoryObby: "🧱 파쿠르 / 오비",
    categoryTycoon: "🏢 타이쿤 & 시뮬레이션",
    categoryRacing: "🏎️ 레이싱",
    categoryRng: "🎲 RNG",
    categoryFashion: "✨ 패션",
    categoryRpg: "🛡️ RPG",
    
    loadingGames: "체험 불러오는 중...",
    gamesFound: "검색된 게임",
    noGamesFound: "검색 결과가 없습니다.",
    viewPopularGames: "기본 인기 게임 보기",
    live: "라이브",
    free: "무료",
    byCreator: "제작자:",
    visits: "방문 수",
    placeId: "플레이스 ID",
    playOnRoblox: "플레이",
    copied: "복사되었습니다!",
    
    footerLeft: "AI Studio Cloud Run 컨테이너",
    footerText: "React, Tailwind, Gemini 기반 다국어 지원 애플리케이션."
  }
};
