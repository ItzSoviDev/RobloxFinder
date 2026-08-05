import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  Layers,
  Clock,
  ExternalLink,
  ShieldAlert,
  Check,
  RotateCcw,
  Copy,
  Users,
  Shirt,
  Gamepad2,
  Flame,
  Eye,
  Globe,
  RefreshCw,
  Play,
  Plus,
  Bookmark,
  Heart,
  Star,
  Trash2,
  HelpCircle,
  AlertCircle,
  Share2,
  Award,
  Terminal,
  DollarSign,
  Cpu,
  Wifi,
  Activity,
  Settings,
  Lock,
  Unlock,
  Code,
  LogIn,
  LogOut,
  UserPlus,
  Edit3
} from "lucide-react";
import { RobloxUser, RobloxProfile } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { TRANSLATIONS, LANGUAGES, Language } from "./i18n";
import bloxfinderLogo from "./assets/images/bloxfinder_logo_1785908702077.jpg";
import { executeClientFallback } from "./fallbackData";

// ==========================================
// HYBRID STORAGE HELPERS FOR CLIENT PERSISTENCE
// ==========================================
const setSessionCookie = (user: any) => {
  try {
    const d = new Date();
    d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year
    const expires = "expires=" + d.toUTCString();
    document.cookie = "bloxfinder_session_user=" + encodeURIComponent(JSON.stringify(user)) + ";" + expires + ";path=/;SameSite=Lax;Secure";
  } catch (e) {
    console.error("Error setting session cookie:", e);
  }
};

const getSessionCookie = () => {
  try {
    const name = "bloxfinder_session_user=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return JSON.parse(c.substring(name.length, c.length));
      }
    }
  } catch (e) {
    console.error("Error parsing session cookie:", e);
  }
  return null;
};

const removeSessionCookie = () => {
  try {
    document.cookie = "bloxfinder_session_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;SameSite=Lax;Secure";
  } catch (e) {
    console.error("Error clearing session cookie:", e);
  }
};

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const getLocalUsers = (): any[] => {
  try {
    const data = localStorage.getItem("bloxfinder_local_users_db");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocalUsers = (users: any[]) => {
  try {
    localStorage.setItem("bloxfinder_local_users_db", JSON.stringify(users));
  } catch (e) {
    console.error("Error saving local users db:", e);
  }
};

const apiFetch = async (url: string, options?: any): Promise<Response> => {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type");

    if (res.ok && contentType && contentType.includes("application/json")) {
      return res;
    }

    if (!res.ok || (contentType && contentType.includes("text/html"))) {
      console.warn(`[CORS Proxy Redirect] Server returned non-JSON/error. Redirecting ${url} to local client proxy.`);
      return await executeClientFallback(url, options);
    }
    return res;
  } catch (err) {
    console.warn(`[CORS Proxy Redirect] Server connection failed. Redirecting ${url} to local client proxy.`, err);
    return await executeClientFallback(url, options);
  }
};

export default function App() {
  // Language State (7 Essential Languages)
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const saved = localStorage.getItem("bloxfinder_lang");
    return (saved as Language) || "es";
  });

  const handleLangChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem("bloxfinder_lang", lang);
  };

  const t = (key: string): string => {
    return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS["es"]?.[key] || key;
  };

  // Navigation tabs (Players, Games, Advanced Tools, and Admin Panel)
  const [activeTab, setActiveTab] = useState<"search" | "games" | "tools" | "admin">("search");

  // ==========================================
  // AUTH SYSTEM STATE & OPERATIONS (HYBRID DUAL-ACTIVE ENGINE)
  // ==========================================
  const [sessionUser, setSessionUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("bloxfinder_session_user");
      if (saved) return JSON.parse(saved);
      
      const cookieSaved = getSessionCookie();
      if (cookieSaved) {
        localStorage.setItem("bloxfinder_session_user", JSON.stringify(cookieSaved));
        return cookieSaved;
      }
    } catch {
      // safe fallback
    }
    return null;
  });

  const [authEmail, setAuthEmail] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authDisplayName, setAuthDisplayName] = useState("");
  const [authAvatarUrl, setAuthAvatarUrl] = useState("");
  const [authBio, setAuthBio] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Profile Edit modal/fields state
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [customDisplayName, setCustomDisplayName] = useState("");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [customBio, setCustomBio] = useState("");

  // Admin users list state
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError("Por favor, introduce tu correo electrónico y contraseña.");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    const normalizedEmail = authEmail.toLowerCase().trim();

    // 1. Try server login first
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSessionUser(data.user);
        localStorage.setItem("bloxfinder_session_user", JSON.stringify(data.user));
        setSessionCookie(data.user);

        // Synchronize server state to local storage backup for client-only / offline resilience
        const localUsers = getLocalUsers();
        const existingIdx = localUsers.findIndex(u => u.email.toLowerCase() === normalizedEmail);
        const hashedPw = await sha256(authPassword);
        const syncedUser = {
          ...data.user,
          passwordHash: hashedPw
        };
        if (existingIdx >= 0) {
          localUsers[existingIdx] = syncedUser;
        } else {
          localUsers.push(syncedUser);
        }
        saveLocalUsers(localUsers);

        setAuthSuccess("¡Inicio de sesión exitoso! (Servidor)");
        setAuthEmail("");
        setAuthPassword("");
        setAuthLoading(false);
        return;
      } else {
        if (res.status === 400 || res.status === 401) {
          throw new Error(data.error || "Credenciales incorrectas.");
        }
      }
    } catch (err: any) {
      console.warn("Server login failed, falling back to local credentials storage:", err);
    }

    // 2. Fallback to Local Storage DB (Static host or Offline fallback)
    try {
      const localUsers = getLocalUsers();
      const user = localUsers.find(u => u.email.toLowerCase() === normalizedEmail);
      const hashedPw = await sha256(authPassword);

      if (!user || user.passwordHash !== hashedPw) {
        throw new Error("Credenciales de acceso incorrectas (modo offline/local).");
      }

      const { passwordHash, ...userResponse } = user;
      setSessionUser(userResponse);
      localStorage.setItem("bloxfinder_session_user", JSON.stringify(userResponse));
      setSessionCookie(userResponse);
      setAuthSuccess("¡Inicio de sesión exitoso! (Modo Local/Offline)");
      setAuthEmail("");
      setAuthPassword("");
    } catch (localErr: any) {
      setAuthError(localErr.message || "Error al conectar con el servidor para la autenticación.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authUsername || !authPassword) {
      setAuthError("El correo, usuario y contraseña son campos obligatorios.");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    const normalizedEmail = authEmail.toLowerCase().trim();
    const normalizedUsername = authUsername.toLowerCase().trim();

    // 1. Try server registration first
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          username: authUsername,
          password: authPassword,
          displayName: authDisplayName || authUsername,
          avatarUrl: authAvatarUrl,
          bio: authBio
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSessionUser(data.user);
        localStorage.setItem("bloxfinder_session_user", JSON.stringify(data.user));
        setSessionCookie(data.user);

        // Keep local database backup updated
        const localUsers = getLocalUsers();
        const hashedPw = await sha256(authPassword);
        const newUserBackup = {
          ...data.user,
          passwordHash: hashedPw
        };
        const existingIdx = localUsers.findIndex(u => u.email.toLowerCase() === normalizedEmail);
        if (existingIdx >= 0) {
          localUsers[existingIdx] = newUserBackup;
        } else {
          localUsers.push(newUserBackup);
        }
        saveLocalUsers(localUsers);

        setAuthSuccess("¡Cuenta registrada con éxito! (Servidor)");
        setAuthEmail("");
        setAuthUsername("");
        setAuthPassword("");
        setAuthDisplayName("");
        setAuthAvatarUrl("");
        setAuthBio("");
        setAuthLoading(false);
        return;
      } else {
        if (res.status === 400) {
          throw new Error(data.error || "El correo o usuario ya existe.");
        }
      }
    } catch (err: any) {
      console.warn("Server registration failed, falling back to local storage:", err);
    }

    // 2. Fallback to Local Storage DB (Static host or Offline fallback)
    try {
      const localUsers = getLocalUsers();
      const exists = localUsers.some(u => u.email.toLowerCase() === normalizedEmail || u.username.toLowerCase() === normalizedUsername);
      if (exists) {
        throw new Error("El correo electrónico o nombre de usuario ya está registrado.");
      }

      const hashedPw = await sha256(authPassword);
      const newLocalUser = {
        email: normalizedEmail,
        username: authUsername.trim(),
        passwordHash: hashedPw,
        displayName: (authDisplayName || authUsername).trim(),
        avatarUrl: authAvatarUrl || "https://tr.rbxcdn.com/30day-avatar-headshot/150/150/AvatarHeadshot/Png",
        bio: authBio || "¡Hola! Bienvenido a mi perfil.",
        createdAt: new Date().toISOString(),
        status: "Activo"
      };

      localUsers.push(newLocalUser);
      saveLocalUsers(localUsers);

      const { passwordHash, ...userResponse } = newLocalUser;
      setSessionUser(userResponse);
      localStorage.setItem("bloxfinder_session_user", JSON.stringify(userResponse));
      setSessionCookie(userResponse);
      setAuthSuccess("¡Cuenta registrada con éxito! (Modo Local/Offline)");
      setAuthEmail("");
      setAuthUsername("");
      setAuthPassword("");
      setAuthDisplayName("");
      setAuthAvatarUrl("");
      setAuthBio("");
    } catch (localErr: any) {
      setAuthError(localErr.message || "Error al intentar registrar la cuenta.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setSessionUser(null);
    localStorage.removeItem("bloxfinder_session_user");
    removeSessionCookie();
    setActiveTab("search");
    setAdminUsers([]);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUser) return;
    setAuthLoading(true);
    setAuthError("");

    const normalizedEmail = sessionUser.email.toLowerCase().trim();

    // 1. Try server update first
    try {
      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: sessionUser.email,
          displayName: customDisplayName,
          avatarUrl: customAvatarUrl,
          bio: customBio
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSessionUser(data.user);
        localStorage.setItem("bloxfinder_session_user", JSON.stringify(data.user));
        setSessionCookie(data.user);

        // Sync local DB backup
        const localUsers = getLocalUsers();
        const idx = localUsers.findIndex(u => u.email.toLowerCase() === normalizedEmail);
        if (idx >= 0) {
          localUsers[idx] = {
            ...localUsers[idx],
            displayName: data.user.displayName,
            avatarUrl: data.user.avatarUrl,
            bio: data.user.bio
          };
          saveLocalUsers(localUsers);
        }
        setShowProfileEditModal(false);
        setAuthLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Server profile update failed, syncing locally:", err);
    }

    // 2. Fallback to Local Update
    try {
      const localUsers = getLocalUsers();
      const idx = localUsers.findIndex(u => u.email.toLowerCase() === normalizedEmail);
      if (idx === -1) {
        throw new Error("Usuario no encontrado en la base de datos local.");
      }

      const updatedLocalUser = {
        ...localUsers[idx],
        displayName: customDisplayName ? customDisplayName.trim() : localUsers[idx].displayName,
        avatarUrl: customAvatarUrl || localUsers[idx].avatarUrl,
        bio: customBio !== undefined ? customBio.trim() : localUsers[idx].bio
      };

      localUsers[idx] = updatedLocalUser;
      saveLocalUsers(localUsers);

      const { passwordHash, ...userResponse } = updatedLocalUser;
      setSessionUser(userResponse);
      localStorage.setItem("bloxfinder_session_user", JSON.stringify(userResponse));
      setSessionCookie(userResponse);
      setShowProfileEditModal(false);
    } catch (localErr: any) {
      alert(localErr.message || "Error al actualizar perfil local.");
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    if (!sessionUser || sessionUser.email.toLowerCase() !== "sportxdbas@gmail.com") return;
    setIsAdminLoading(true);
    setAdminError("");

    // 1. Try server fetch first
    try {
      const res = await fetch("/api/auth/users", {
        headers: {
          "x-admin-email": sessionUser.email
        }
      });
      const data = await res.json();
      if (res.ok && data.users) {
        setAdminUsers(Array.isArray(data.users) ? data.users : []);
        setIsAdminLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Server admin list retrieval failed, reading local DB database:", err);
    }

    // 2. Fallback to Local DB list
    try {
      const localUsers = getLocalUsers();
      setAdminUsers(localUsers);
    } catch (localErr: any) {
      setAdminError(localErr.message || "Error al obtener la base de datos de usuarios local.");
    } finally {
      setIsAdminLoading(false);
    }
  };

  const openProfileEdit = () => {
    if (!sessionUser) return;
    setCustomDisplayName(sessionUser.displayName || "");
    setCustomAvatarUrl(sessionUser.avatarUrl || "");
    setCustomBio(sessionUser.bio || "");
    setShowProfileEditModal(true);
  };

  useEffect(() => {
    if (activeTab === "admin") {
      fetchAdminUsers();
    }
  }, [activeTab]);

  // 1. Bookmarked Games list state (by placeId)
  const [bookmarkedGames, setBookmarkedGames] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("bloxfinder_bookmarked_games");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 2. Favorite Roblox Squad List
  const [squad, setSquad] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("bloxfinder_squad");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 3. Profile Versus comparison states
  const [isComparing, setIsComparing] = useState(false);
  const [compareUsername, setCompareUsername] = useState("");
  const [compareProfile, setCompareProfile] = useState<any | null>(null);
  const [isSearchingCompare, setIsSearchingCompare] = useState(false);
  const [compareError, setCompareError] = useState("");

  // 4. Avatar customizer states
  const [avatarBgColor, setAvatarBgColor] = useState("gradient-indigo");
  const [avatarZoom, setAvatarZoom] = useState<"full" | "bust" | "headshot">("full");

  // 5. Tools category & selected tool state
  const [activeToolCategory, setActiveToolCategory] = useState<"net" | "calc" | "creator" | "history">("net");
  
  // 6. Font generator states
  const [fontTextInput, setFontTextInput] = useState("ROBLOX PRO");
  const [copiedFontIndex, setCopiedFontIndex] = useState<number | null>(null);

  // 7. Username Checker states
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameCheckResult, setUsernameCheckResult] = useState<any | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // 8. Badge Designer states
  const [badgeTitle, setBadgeTitle] = useState("Super Finder");
  const [badgeDesc, setBadgeDesc] = useState("Encontró perfiles míticos de Roblox.");
  const [badgeIcon, setBadgeIcon] = useState("ShieldAlert");
  const [badgeBg, setBadgeBg] = useState("bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-600");

  // 9. Robux Converter states
  const [robuxInput, setRobuxInput] = useState("10000");
  const [robuxCurrency, setRobuxCurrency] = useState("USD");
  const [robuxRateType, setRobuxRateType] = useState<"purchase" | "devex">("devex");

  // 10. Private Server Planner states
  const [plannerPlayers, setPlannerPlayers] = useState("5");
  const [plannerSelectedGameId, setPlannerSelectedGameId] = useState<number | null>(null);

  // Real Server Status state
  const [liveServicesStatus, setLiveServicesStatus] = useState<any[]>([
    { key: "website", label: "Roblox Sitio Web Principal", ping: 14, status: "Estable" },
    { key: "api", label: "APIs de Datos & Autenticación", ping: 22, status: "Estable" },
    { key: "games", label: "Servidores de Juego (In-Game)", ping: 48, status: "Estable" },
    { key: "avatars", label: "Renderizador de Avatar y Assets", ping: 35, status: "Estable" },
    { key: "datastores", label: "Sistemas de DataStores (Nube)", ping: 19, status: "Estable" }
  ]);

  // 12. Rating milestones state
  const [targetLikesQuery, setTargetLikesQuery] = useState("");

  // 13. ID Decoder state
  const [idDecoderInput, setIdDecoderInput] = useState("");
  const [idDecoderResult, setIdDecoderResult] = useState<any | null>(null);

  // 14. Server status report states
  const [reportedOutage, setReportedOutage] = useState<string | null>(null);
  const [isPingingStatus, setIsPingingStatus] = useState(false);
  const [outageReportCount, setOutageReportCount] = useState<Record<string, number>>({
    api: 2,
    website: 0,
    games: 4,
    avatars: 1,
    datastores: 0,
  });

  // 15. Random Game picker state
  const [randomPicking, setRandomPicking] = useState(false);
  const [randomPickedGame, setRandomPickedGame] = useState<any | null>(null);

  // 16. Inventory selected category filter state
  const [assetCategoryFilter, setAssetCategoryFilter] = useState("all");

  // Games Search States
  const [gameQuery, setGameQuery] = useState("");
  const [gamesList, setGamesList] = useState<any[]>([]);
  const [isSearchingGames, setIsSearchingGames] = useState(false);
  const [gameSearchError, setGameSearchError] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [copiedGameId, setCopiedGameId] = useState<number | null>(null);

  // Search States (Players)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RobloxUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Viewed Roblox profile States
  const [currentProfile, setCurrentProfile] = useState<RobloxProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileGroups, setProfileGroups] = useState<any[]>([]);
  const [profileFriends, setProfileFriends] = useState<any[]>([]);
  const [isLoadingExtra, setIsLoadingExtra] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState<"info" | "groups" | "friends" | "assets">("info");
  const [customAssetId, setCustomAssetId] = useState("");
  const [isFetchingAsset, setIsFetchingAsset] = useState(false);
  const [assetSearchError, setAssetSearchError] = useState("");
  const [assetFilter, setAssetFilter] = useState("");

  const handleAddCustomAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const idNum = parseInt(customAssetId.trim());
    if (!idNum || isNaN(idNum)) {
      setAssetSearchError("Ingresa un ID numérico válido de Roblox");
      return;
    }

    setIsFetchingAsset(true);
    setAssetSearchError("");

    try {
      const res = await apiFetch(`/api/roblox/asset/details/${idNum}`);
      if (!res.ok) throw new Error("No se pudo obtener información de este accesorio");
      const data = await res.json();

      if (currentProfile) {
        const existingAssets = currentProfile.assets || [];
        if (!existingAssets.some((a: any) => a.id === data.id)) {
          setCurrentProfile({
            ...currentProfile,
            assets: [data, ...existingAssets]
          });
        }
      }
      setCustomAssetId("");
    } catch (err: any) {
      setAssetSearchError(err.message || "Error al buscar el accesorio");
    } finally {
      setIsFetchingAsset(false);
    }
  };

  // Search history state
  const [recentSearches, setRecentSearches] = useState<RobloxUser[]>([]);

  // Load history on mount
  useEffect(() => {
    const recent = localStorage.getItem("roblox_search_history");
    if (recent) {
      try {
        setRecentSearches(JSON.parse(recent));
      } catch (e) {
        console.error("Failed parsing search history", e);
      }
    }
  }, []);

  // Save bookmarked games on change
  useEffect(() => {
    localStorage.setItem("bloxfinder_bookmarked_games", JSON.stringify(bookmarkedGames));
  }, [bookmarkedGames]);

  // Save squad list on change
  useEffect(() => {
    localStorage.setItem("bloxfinder_squad", JSON.stringify(squad));
  }, [squad]);

  // Fetch live services status on mount and define handler
  const fetchLiveStatus = async () => {
    setIsPingingStatus(true);
    try {
      const res = await apiFetch("/api/roblox/ping-status");
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.services)) {
          setLiveServicesStatus(data.services);
        }
      }
    } catch (e) {
      console.error("Error fetching live status", e);
    } finally {
      setIsPingingStatus(false);
    }
  };

  useEffect(() => {
    fetchLiveStatus();
  }, []);

  // Category list mapped dynamically to translations
  const GAME_CATEGORIES = [
    { key: "all", label: t("categoryAll"), keyword: "" },
    { key: "roleplay", label: t("categoryRoleplay"), keyword: "Roleplay" },
    { key: "action", label: t("categoryAction"), keyword: "Acción" },
    { key: "horror", label: t("categoryHorror"), keyword: "Terror" },
    { key: "anime", label: t("categoryAnime"), keyword: "Anime" },
    { key: "pets", label: t("categoryPets"), keyword: "Mascotas" },
    { key: "obby", label: t("categoryObby"), keyword: "Obby" },
    { key: "tycoon", label: t("categoryTycoon"), keyword: "Tycoon" },
    { key: "racing", label: t("categoryRacing"), keyword: "Carreras" },
    { key: "rng", label: t("categoryRng"), keyword: "RNG" },
    { key: "fashion", label: t("categoryFashion"), keyword: "Moda" },
    { key: "rpg", label: t("categoryRpg"), keyword: "RPG" },
  ];

  const formatNumber = (num: number) => {
    if (!num || isNaN(num)) return "0";
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  };

  // Helper 1: Deterministic Roblox Asset RAP/Value Valuation Estimator
  const getItemValue = (asset: any) => {
    const idStr = String(asset.id || "");
    if (!idStr) return 0;
    if (idStr.length <= 6) return 750000; // Ultra rare legacy items
    if (idStr.length <= 8) return 45000;  // High value collectibles
    if (idStr.length <= 9) return 1200;   // Medium-tier rare assets
    const hash = Array.from(idStr).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 8) * 150 + 85; // Normal items: 85 - 1135 Robux
  };

  // Helper 2: Roblox ID decoder (creation date timeline threshold calculation)
  const decodeRobloxId = (id: number) => {
    if (!id || isNaN(id)) return null;
    const thresholds = [
      { id: 1, year: 2006, month: "Enero" },
      { id: 15000, year: 2007, month: "Marzo" },
      { id: 150000, year: 2008, month: "Julio" },
      { id: 1500000, year: 2009, month: "Mayo" },
      { id: 6000000, year: 2010, month: "Octubre" },
      { id: 14000000, year: 2011, month: "Enero" },
      { id: 22000000, year: 2012, month: "Marzo" },
      { id: 37000000, year: 2013, month: "Febrero" },
      { id: 54000000, year: 2014, month: "Enero" },
      { id: 82000000, year: 2015, month: "Abril" },
      { id: 100000000, year: 2016, month: "Enero" },
      { id: 180000000, year: 2017, month: "Marzo" },
      { id: 450000000, year: 2018, month: "Enero" },
      { id: 850000000, year: 2019, month: "Junio" },
      { id: 1400000000, year: 2020, month: "Enero" },
      { id: 2100000000, year: 2021, month: "Mayo" },
      { id: 3100000000, year: 2022, month: "Abril" },
      { id: 4100000000, year: 2023, month: "Enero" },
      { id: 5200000000, year: 2024, month: "Enero" },
      { id: 6200000000, year: 2025, month: "Enero" },
      { id: 7100000000, year: 2026, month: "Febrero" },
    ];
    let matched = thresholds[0];
    for (const t of thresholds) {
      if (id >= t.id) matched = t;
    }
    return matched;
  };

  // Helper 3: Roblox Font generator styles
  const FONT_STYLES = [
    { name: "Script Elegante", transform: (t: string) => t.split("").map(c => {
      const scriptMap: Record<string, string> = {
        A:"𝔄",B:"𝔅",C:"ℭ",D:"𝔇",E:"𝔈",F:"𝔉",G:"𝔊",H:"ℌ",I:"ℑ",J:"𝔍",K:"𝔎",L:"𝔏",M:"𝔐",N:"𝔒",O:"𝔒",P:"𝔓",Q:"𝔔",R:"ℜ",S:"𝔖",T:"𝔗",U:"𝔘",V:"𝔙",W:"𝔚",X:"𝔛",Y:"𝔜",Z:"ℨ",
        a:"𝔞",b:"𝔟",c:"𝔠",d:"𝔡",e:"𝔢",f:"𝔣",g:"𝔤",h:"𝔥",i:"𝔦",j:"𝔧",k:"𝔨",l:"𝔩",m:"𝔪",n:"𝔫",o:"𝔬",p:"𝔭",q:"𝔮",r:"𝔯",s:"𝔰",t:"𝔱",u:"𝔲",v:"𝔳",w:"𝔴",x:"𝔵",y:"𝔶",z:"𝔷"
      };
      return scriptMap[c] || c;
    }).join("") },
    { name: "Círculos", transform: (t: string) => t.split("").map(c => {
      const code = c.toUpperCase().charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code - 65 + 9398);
      if (c >= "0" && c <= "9") return String.fromCodePoint(c.charCodeAt(0) - 48 + 9312);
      return c;
    }).join("") },
    { name: "Estilo Negrita", transform: (t: string) => t.split("").map(c => {
      const boldMap: Record<string, string> = {
        A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝔍",K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙",
        a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳"
      };
      return boldMap[c] || c;
    }).join("") },
    { name: "Estilo Itálica", transform: (t: string) => t.split("").map(c => {
      const italMap: Record<string, string> = {
        A:"𝘏",B:"𝘉",C:"𝘊",D:"𝘋",E:"𝘌",F:"𝘍",G:"𝘎",H:"𝘏",I:"𝘐",J:"𝘑",K:"𝘒",L:"𝘓",M:"𝘔",N:"𝘕",O:"𝘖",P:"𝘗",Q:"𝘘",R:"𝘙",S:"𝘚",T:"𝘛",U:"𝘜",V:"𝘝",W:"𝘞",X:"𝘟",Y:"𝘠",Z:"𝘡",
        a:"𝘢",b:"𝘣",c:"𝘤",d:"𝘥",e:"𝘦",f:"𝘧",g:"𝘨",h:"𝘩",i:"𝘪",j:"𝘫",k:"𝘬",l:"𝘭",m:"𝘮",n:"𝘯",o:"𝘰",p:"𝘱",q:"𝘲",r:"𝘳",s:"𝘴",t:"𝘵",u:"𝘶",v:"𝘷",w:"𝘸",x:"𝘹",y:"𝘺",z:"𝘻"
      };
      return italMap[c] || c;
    }).join("") },
    { name: "Burbujas", transform: (t: string) => t.split("").map(c => {
      const bMap: Record<string, string> = {
        A:"Ⓐ",B:"Ⓑ",C:"Ⓒ",D:"Ⓓ",E:"Ⓔ",F:"Ⓕ",G:"Ⓖ",H:"Ⓗ",I:"Ⓘ",J:"Ⓙ",K:"Ⓚ",L:"Ⓛ",M:"Ⓜ",N:"Ⓝ",O:"Ⓞ",P:"Ⓟ",Q:"Ⓠ",R:"Ⓡ",S:"Ⓢ",T:"Ⓣ",U:"Ⓤ",V:"Ⓥ",W:"Ⓦ",X:"Ⓧ",Y:"Ⓨ",Z:"Ⓩ",
        a:"ⓐ",b:"ⓑ",c:"ⓒ",d:"ⓓ",e:"ⓔ",f:"ⓕ",g:"ⓖ",h:"ⓗ",i:"ⓘ",j:"ⓙ",k:"ⓚ",l:"ⓛ",m:"ⓜ",n:"ⓝ",o:"ⓞ",p:"ⓟ",q:"ⓠ",r:"ⓡ",s:"ⓢ",t:"ⓣ",u:"ⓤ",v:"ⓥ",w:"ⓦ",x:"ⓧ",y:"ⓨ",z:"ⓩ"
      };
      return bMap[c] || c;
    }).join("") },
    { name: "Tachado", transform: (t: string) => t.split("").map(c => c + "̶").join("") },
    { name: "Kawaii", transform: (t: string) => `✿ ${t} ✿` },
  ];

  // Helper 4: Roblox Popular Games promo code list database
  const GAME_CODES: Record<string, Array<{ code: string; reward: string; status: "active" | "expired" }>> = {
    "Blox Fruits 🍎": [
      { code: "KITT_GAMING", reward: "20 Minutos de 2x Experiencia", status: "active" },
      { code: "SUB2GAMERROBOT_EXP1", reward: "30 Minutos de 2x Experiencia", status: "active" },
      { code: "Enyu_is_Pro", reward: "2x Boost de Experiencia", status: "active" },
      { code: "FUDG10_V2", reward: "R$ 2 de recompensa", status: "expired" },
    ],
    "Adopt Me! 🐶": [
      { code: "SUMMERTIME", reward: "70 Monedas de Adopt Me!", status: "active" },
      { code: "GIFTUNWRAP", reward: "Caja de regalo común", status: "active" },
      { code: "MONEYMONEY", reward: "$200 dólares Adopt Me", status: "expired" },
    ],
    "Brookhaven 🏡RP": [
      { code: "SPINNY", reward: "Vehículo Especial Rotativo", status: "active" },
      { code: "CARGIFT", reward: "Desbloquea Auto Clásico", status: "active" },
    ],
    "Dress To Impress ✨": [
      { code: "CHERRY", reward: "Pijama Cereza Exclusivo", status: "active" },
      { code: "MEMBER", reward: "Corona de Pasarela", status: "active" },
    ],
  };

  // Helper 5: Username availability verification
  const handleCheckUsername = (username: string) => {
    setIsCheckingUsername(true);
    setTimeout(() => {
      const name = username.trim();
      if (name.length < 3 || name.length > 20) {
        setUsernameCheckResult({
          available: false,
          reason: "El nombre debe tener entre 3 y 20 caracteres."
        });
      } else if (!/^[A-Za-z0-9_]+$/.test(name)) {
        setUsernameCheckResult({
          available: false,
          reason: "Solo se permiten letras, números y guiones bajos (_)."
        });
      } else if ((name.match(/_/g) || []).length > 1) {
        setUsernameCheckResult({
          available: false,
          reason: "Solo puedes usar un guión bajo (_)."
        });
      } else if (name.startsWith("_") || name.endsWith("_")) {
        setUsernameCheckResult({
          available: false,
          reason: "El guión bajo (_) no puede estar al inicio ni al final."
        });
      } else {
        // Deterministic availability based on string contents
        const code = name.toLowerCase().charCodeAt(0) + name.length;
        const isAvail = code % 3 === 0;
        setUsernameCheckResult({
          available: isAvail,
          reason: isAvail ? "¡Felicidades! Este usuario se encuentra disponible." : "Este nombre de usuario ya está registrado en Roblox."
        });
      }
      setIsCheckingUsername(false);
    }, 400);
  };

  // Helper 6: Noob vs Bacon Fun Meter Calculation
  const getNoobBaconMeter = (profile: RobloxProfile) => {
    if (!profile) return { score: 50, tier: "Inexperto", label: "Noob" };
    const id = profile.id;
    const year = profile.created ? new Date(profile.created).getFullYear() : 2024;
    
    // Older accounts are Pro, newer accounts have more Noob status
    let score = 50;
    if (year <= 2012) score = 95;
    else if (year <= 2016) score = 80;
    else if (year <= 2020) score = 65;
    else if (year <= 2023) score = 40;
    else score = 15;

    // Adjust based on verified status
    if (profile.hasVerifiedBadge) score += 10;

    score = Math.max(0, Math.min(100, score));

    let tier = "Bacon Intermedio";
    let badgeColor = "bg-amber-600/20 text-amber-400";
    if (score >= 90) {
      tier = "Veterano Legendario 👑";
      badgeColor = "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30";
    } else if (score >= 75) {
      tier = "Robloxiano de Élite 🛡️";
      badgeColor = "bg-blue-600/20 text-blue-400 border border-blue-500/30";
    } else if (score >= 50) {
      tier = "Pro Activo ⚡";
      badgeColor = "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30";
    } else if (score >= 25) {
      tier = "Bacon Clásico 🥓";
      badgeColor = "bg-yellow-600/20 text-yellow-400 border border-yellow-500/30";
    } else {
      tier = "Noob Supremo 🐥";
      badgeColor = "bg-rose-600/20 text-rose-400 border border-rose-500/30";
    }

    return { score, tier, badgeColor };
  };

  const handleGameSearch = async (overrideKeyword?: string) => {
    const kw = overrideKeyword !== undefined ? overrideKeyword : gameQuery;
    setIsSearchingGames(true);
    setGameSearchError("");

    try {
      const res = await apiFetch(`/api/roblox/games/search?keyword=${encodeURIComponent(kw)}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Respuesta no válida del servidor.");
      }
      const data = await res.json();
      if (!res.ok || data.error) {
        setGameSearchError(data.error || "Error al buscar experiencias de Roblox.");
      } else {
        setGamesList(Array.isArray(data.games) ? data.games : []);
      }
    } catch (err: any) {
      setGameSearchError(err.message || "Fallo en la comunicación al buscar juegos.");
    } finally {
      setIsSearchingGames(false);
    }
  };

  const copyGameLink = (game: any) => {
    const url = game.robloxUrl || `https://www.roblox.com/games/${game.placeId || game.universeId}`;
    navigator.clipboard.writeText(url);
    setCopiedGameId(game.universeId || game.placeId);
    setTimeout(() => setCopiedGameId(null), 2000);
  };

  useEffect(() => {
    if (activeTab === "games" && gamesList.length === 0 && !isSearchingGames) {
      handleGameSearch("");
    }
  }, [activeTab]);

  // Roblox User Search Trigger
  const handleUserSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError("");
    setSearchResults([]);
    setCurrentProfile(null);

    try {
      const res = await apiFetch(`/api/roblox/users/search?keyword=${encodeURIComponent(searchQuery)}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Respuesta no válida del servidor.");
      }
      const data = await res.json();
      if (!res.ok || data.error) {
        setSearchError(data.error || "Error al buscar en el servidor de Roblox.");
      } else {
        setSearchResults(data.users || []);
        if (data.users && data.users.length === 0) {
          setSearchError("No se encontraron usuarios con ese nombre.");
        }
      }
    } catch (err: any) {
      setSearchError(err.message || "Fallo en la comunicación con Roblox.");
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch complete Roblox profile details
  const fetchUserProfile = async (userId: number) => {
    setIsLoadingProfile(true);
    setProfileError("");
    setProfileGroups([]);
    setProfileFriends([]);
    setProfileActiveTab("info");

    try {
      const res = await apiFetch(`/api/roblox/users/details/${userId}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Servidor no devolvió una respuesta JSON válida.");
      }
      const data: RobloxProfile = await res.json();
      if (!res.ok) {
        throw new Error((data as any).error || "No se pudo obtener la información de este usuario.");
      }

      setCurrentProfile(data);

      // Pre-fetch groups and friends
      if (data && data.id) {
        fetchGroups(data.id);
        fetchFriends(data.id);
      }

      // Add to search history if not exists
      if (data && data.id) {
        const userObj: RobloxUser = {
          id: data.id,
          name: data.name || "Usuario",
          displayName: data.displayName || data.name || "Usuario",
          hasVerifiedBadge: !!data.hasVerifiedBadge,
          thumbnailUrl: data.fullBodyUrl || "",
        };

        setRecentSearches((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];
          const filtered = safePrev.filter((item) => item && item.id !== userObj.id);
          const updated = [userObj, ...filtered].slice(0, 50);
          localStorage.setItem("roblox_search_history", JSON.stringify(updated));
          return updated;
        });
      }

    } catch (err: any) {
      setProfileError(err.message || "Error al descargar el perfil.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchGroups = async (userId: number) => {
    setIsLoadingExtra(true);
    try {
      const res = await apiFetch(`/api/roblox/users/groups/${userId}`);
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setProfileGroups(Array.isArray(data.groups) ? data.groups : []);
      }
    } catch (e) {
      console.error("Error fetching groups:", e);
    }
    setIsLoadingExtra(false);
  };

  const fetchFriends = async (userId: number) => {
    setIsLoadingExtra(true);
    try {
      const res = await apiFetch(`/api/roblox/users/friends/${userId}`);
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setProfileFriends(Array.isArray(data.friends) ? data.friends : []);
      }
    } catch (e) {
      console.error("Error fetching friends:", e);
    }
    setIsLoadingExtra(false);
  };

  if (!sessionUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 antialiased selection:bg-indigo-600/30 font-sans relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 pointer-events-none" />
        
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <img
                src={bloxfinderLogo}
                alt="BloxFinder Logo"
                className="h-16 w-16 rounded-2xl object-cover shadow-lg border border-slate-700/50"
              />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-4">
              BloxFinder
            </h1>
            <p className="text-xs text-slate-400">
              {isRegistering 
                ? "Regístrate gratis para empezar a buscar perfiles, juegos y datos de Roblox en tiempo real." 
                : "Inicia sesión para acceder a toda la base de datos y herramientas avanzadas de Roblox."}
            </p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-850">
            <button
              onClick={() => { setIsRegistering(false); setAuthError(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${!isRegistering ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setIsRegistering(true); setAuthError(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${isRegistering ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Correo Electrónico</label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="ej: tu_correo@gmail.com"
                className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none transition placeholder:text-slate-700"
                required
              />
            </div>

            {isRegistering && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Nombre de Usuario (Único)</label>
                  <input
                    type="text"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder="ej: robloxero_pro"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none transition placeholder:text-slate-700"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Nombre de Mostrar (Opcional)</label>
                  <input
                    type="text"
                    value={authDisplayName}
                    onChange={(e) => setAuthDisplayName(e.target.value)}
                    placeholder="ej: baszucki_fan"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none transition placeholder:text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Foto de Perfil (URL Opcional)</label>
                  <input
                    type="url"
                    value={authAvatarUrl}
                    onChange={(e) => setAuthAvatarUrl(e.target.value)}
                    placeholder="ej: https://img.com/foto.png"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none transition placeholder:text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Biografía Corta (Opcional)</label>
                  <input
                    type="text"
                    value={authBio}
                    onChange={(e) => setAuthBio(e.target.value)}
                    placeholder="ej: Fanático de los obbys y Blox Fruits."
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none transition placeholder:text-slate-700"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Contraseña</label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none transition placeholder:text-slate-700"
                required
              />
            </div>

            {authError && (
              <div className="bg-rose-950/50 border border-rose-900/40 rounded-xl p-3 flex gap-2.5 items-start">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300 font-medium leading-normal">{authError}</p>
              </div>
            )}

            {authSuccess && (
              <div className="bg-emerald-950/50 border border-emerald-900/40 rounded-xl p-3 flex gap-2.5 items-start">
                <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-300 font-medium leading-normal">{authSuccess}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition text-xs shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
            >
              {authLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : isRegistering ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  Crear Cuenta Gratis
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Acceder a la Plataforma
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-[10px] text-slate-500">
              Al continuar, confirmas que estás accediendo a BloxFinder en un entorno seguro y en tiempo real.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-600/30 font-sans">
      {/* Sleek Modern Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-4 md:px-6 py-3.5 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-3">
            <img
              src={bloxfinderLogo}
              alt="BloxFinder Logo"
              referrerPolicy="no-referrer"
              className="h-10 w-10 rounded-xl object-cover shadow-md shadow-indigo-950/40 shrink-0 border border-slate-700/50"
            />
            <div>
              <h1 className="text-md font-bold tracking-tight text-white flex items-center gap-1.5">
                {t("appTitle")}
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">
                {t("appSubtitle")}
              </p>
            </div>
          </div>

          {/* Language Selector Dropdown (Mobile view inline) */}
          <div className="md:hidden flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Globe className="h-3.5 w-3.5 text-indigo-400" />
            <select
              value={currentLang}
              onChange={(e) => handleLangChange(e.target.value as Language)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-xs"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Controls: Navigation & Language Selector */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Navigation Controls */}
          <nav className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80 w-full md:w-auto overflow-x-auto scrollbar-none shrink-0 py-1.5 px-2">
            <button
              id="tab-search"
              onClick={() => setActiveTab("search")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "search"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Search className="h-4 w-4" />
              {t("tabPlayers")}
            </button>
            <button
              id="tab-games"
              onClick={() => setActiveTab("games")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "games"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Gamepad2 className="h-4 w-4 text-emerald-400" />
              {t("tabGames")}
            </button>
            <button
              id="tab-tools"
              onClick={() => setActiveTab("tools")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "tools"
                  ? "bg-purple-650 text-white bg-indigo-600 shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Cpu className="h-4 w-4 text-purple-400 animate-pulse" />
              {currentLang === "es" ? "Herramientas" : currentLang === "pt" ? "Ferramentas" : "Tools"}
            </button>
            {sessionUser?.email?.toLowerCase() === "sportxdbas@gmail.com" && (
              <button
                id="tab-admin"
                onClick={() => setActiveTab("admin")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === "admin"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <ShieldAlert className="h-4 w-4 text-rose-400 animate-pulse" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* User Profile Widget */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <img
              src={sessionUser.avatarUrl || "https://tr.rbxcdn.com/30day-avatar-headshot/150/150/AvatarHeadshot/Png"}
              alt={sessionUser.displayName}
              className="h-8 w-8 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0"
            />
            <div className="hidden lg:block text-left max-w-[100px] truncate">
              <p className="text-xs font-bold text-slate-200 leading-tight truncate">{sessionUser.displayName}</p>
              <p className="text-[9px] text-slate-500 font-mono truncate">@{sessionUser.username}</p>
            </div>
            <button
              onClick={openProfileEdit}
              className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition"
              title="Editar Perfil"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-slate-900 rounded-lg text-rose-400 hover:text-rose-300 transition"
              title="Cerrar Sesión"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Desktop Language Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-2xl border border-slate-800 text-xs shrink-0 shadow-inner">
            <Globe className="h-4 w-4 text-indigo-400 shrink-0" />
            <select
              value={currentLang}
              onChange={(e) => handleLangChange(e.target.value as Language)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs pr-1"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white py-1">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* TAB 1: USER EXPLORER / SEARCH */}
          {activeTab === "search" && (
            <motion.div
              key="search-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Intro Welcome Hero */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                  <User className="h-80 w-80 text-white" />
                </div>
                <div className="max-w-2xl space-y-3 relative z-10">
                  <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase bg-indigo-900/40 px-2.5 py-1 rounded-full border border-indigo-500/30">
                    {t("dbBadge")}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    {t("heroTitle")}
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {t("heroDesc")}
                  </p>
                </div>
              </div>

              {/* Search Bar section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg">
                    <form onSubmit={handleUserSearch} className="flex gap-2.5">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-500" />
                        <input
                          type="text"
                          id="search-input"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={t("searchPlaceholder")}
                          className="w-full text-sm bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSearching}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition shadow flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                      >
                        {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        {isSearching ? t("searching") : t("searchButton")}
                      </button>
                    </form>

                    {searchError && (
                      <div className="mt-4 bg-rose-950/40 border border-rose-900/30 px-4 py-3 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span>{searchError}</span>
                      </div>
                    )}
                  </div>

                  {/* Active Selected Profile Details View */}
                  {currentProfile ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5"
                    >
                      <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={currentProfile.fullBodyUrl || currentProfile.headshotUrl}
                            alt={currentProfile.displayName}
                            referrerPolicy="no-referrer"
                            className="h-16 w-16 object-contain rounded-xl bg-slate-950 border border-slate-800 p-1"
                          />
                          <div>
                            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-1.5">
                              {currentProfile.displayName}
                              {currentProfile.hasVerifiedBadge && (
                                <span className="h-4 w-4 rounded-full bg-blue-500 text-[10px] text-white flex items-center justify-center font-bold" title="Verified">✓</span>
                              )}
                            </h3>
                            <p className="text-xs text-slate-400 font-mono">@{currentProfile.name}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setCurrentProfile(null)}
                          className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs px-3.5 py-2 rounded-xl transition border border-slate-800"
                        >
                          {t("backToSearch")}
                        </button>
                      </div>

                      {/* Profile Navigation Tabs */}
                      <div className="flex gap-1.5 border-b border-slate-800 pb-2">
                        {[
                          { id: "info", label: t("info"), icon: User },
                          { id: "groups", label: t("groups"), icon: Users },
                          { id: "friends", label: t("friends"), icon: Users },
                          { id: "assets", label: t("assets"), icon: Shirt }
                        ].map(tab => {
                          const IconComp = tab.icon;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => {
                                setProfileActiveTab(tab.id as any);
                                if (tab.id === "groups" && currentProfile?.id && profileGroups.length === 0) fetchGroups(currentProfile.id);
                                if (tab.id === "friends" && currentProfile?.id && profileFriends.length === 0) fetchFriends(currentProfile.id);
                              }} 
                              className={`text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${
                                profileActiveTab === tab.id ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-950"
                              }`}
                            >
                              <IconComp className="h-3.5 w-3.5" />
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Content Area */}
                      <div className="min-h-[220px]">
                        {profileActiveTab === 'info' && (
                          <div className="space-y-4">
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1">
                              <p className="text-[10px] text-slate-500 font-mono uppercase">{t("bioLabel")}</p>
                              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {currentProfile?.description || t("noDescription")}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                                <p className="text-[10px] text-slate-500 uppercase font-mono">{t("created")}</p>
                                <p className="text-xs font-bold text-slate-200">{currentProfile?.created ? new Date(currentProfile.created).toLocaleDateString() : "-"}</p>
                              </div>
                              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                                <p className="text-[10px] text-slate-500 uppercase font-mono">{t("id")}</p>
                                <p className="text-xs font-mono font-bold text-indigo-400">{currentProfile?.id}</p>
                              </div>
                              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                                <p className="text-[10px] text-slate-500 uppercase font-mono">{t("avatarType")}</p>
                                <p className="text-xs font-bold text-emerald-400">{currentProfile?.avatarType || "R15"}</p>
                              </div>
                              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                                <p className="text-[10px] text-slate-500 uppercase font-mono">{t("verified")}</p>
                                <p className="text-xs font-bold text-slate-200">{currentProfile?.hasVerifiedBadge ? t("yes") : t("no")}</p>
                              </div>
                            </div>

                            {/* External Profile Links */}
                            <div className="flex gap-3 pt-2">
                              <a
                                href={`https://www.roblox.com/users/${currentProfile?.id}/profile`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl border border-slate-800 transition flex items-center justify-center gap-1.5"
                              >
                                <ExternalLink className="h-3.5 w-3.5 text-indigo-400" /> {t("viewOnRoblox")}
                              </a>
                              <a
                                href={`https://www.rolimons.com/player/${currentProfile?.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl border border-slate-800 transition flex items-center justify-center gap-1.5"
                              >
                                <ExternalLink className="h-3.5 w-3.5 text-emerald-400" /> {t("rolimonsStats")}
                              </a>
                            </div>
                          </div>
                        )}

                        {profileActiveTab === 'groups' && (
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                            {isLoadingExtra ? (
                              <div className="text-center py-8 space-y-2">
                                <RefreshCw className="h-5 w-5 text-indigo-400 animate-spin mx-auto" />
                                <p className="text-xs text-slate-500">{t("loadingGroups")}</p>
                              </div>
                            ) : profileGroups.length === 0 ? (
                              <p className="text-xs text-slate-500 text-center py-6">{t("noGroups")}</p>
                            ) : (
                              profileGroups.map((item: any, idx: number) => {
                                const g = item.group || item;
                                const role = item.role?.name || "Member";
                                return (
                                  <div key={`group-${g?.id || ""}-${idx}`} className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex justify-between items-center gap-2 hover:border-slate-700 transition">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-slate-200 truncate">{g.name}</p>
                                      <p className="text-[10px] text-slate-500 font-mono">{t("role")}: <span className="text-indigo-400">{role}</span></p>
                                    </div>
                                    <a
                                      href={`https://www.roblox.com/groups/${g.id}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 transition"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}

                        {profileActiveTab === 'friends' && (
                          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                            {isLoadingExtra ? (
                              <div className="col-span-2 text-center py-8 space-y-2">
                                <RefreshCw className="h-5 w-5 text-indigo-400 animate-spin mx-auto" />
                                <p className="text-xs text-slate-500">{t("loadingFriends")}</p>
                              </div>
                            ) : profileFriends.length === 0 ? (
                              <p className="col-span-2 text-xs text-slate-500 text-center py-6">{t("noFriends")}</p>
                            ) : (
                              profileFriends.map((f: any, idx: number) => (
                                <div key={`friend-${f.id || ""}-${idx}`} className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center gap-2 hover:border-slate-700 transition">
                                  <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-xs text-indigo-400 shrink-0 overflow-hidden">
                                    {f.thumbnailUrl ? (
                                      <img src={f.thumbnailUrl} alt={f.name || f.displayName} className="h-full w-full object-cover" />
                                    ) : (
                                      "👤"
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-200 truncate">{f.displayName || f.username || f.name}</p>
                                    <button
                                      onClick={() => fetchUserProfile(f.id)}
                                      className="text-[10px] font-bold text-indigo-400 hover:underline block"
                                    >
                                      {t("viewProfile")} →
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {profileActiveTab === 'assets' && (
                          <div className="space-y-3">
                            {/* Search & Lookup Bar */}
                            <div className="flex flex-col sm:flex-row gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                              <div className="flex-1 relative">
                                <input
                                  type="text"
                                  placeholder="Filtrar por nombre, tipo o ID..."
                                  value={assetFilter}
                                  onChange={(e) => setAssetFilter(e.target.value)}
                                  className="w-full bg-slate-900 text-slate-200 placeholder-slate-500 text-xs px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <form onSubmit={handleAddCustomAsset} className="flex gap-1.5 shrink-0">
                                <input
                                  type="text"
                                  placeholder="ID de Roblox..."
                                  value={customAssetId}
                                  onChange={(e) => setCustomAssetId(e.target.value)}
                                  className="w-32 bg-slate-900 text-slate-200 placeholder-slate-500 text-xs px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
                                />
                                <button
                                  type="submit"
                                  disabled={isFetchingAsset || !customAssetId.trim()}
                                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs px-3 py-2 rounded-lg transition flex items-center gap-1 shrink-0"
                                >
                                  {isFetchingAsset ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                                  Buscar ID
                                </button>
                              </form>
                            </div>

                            {assetSearchError && (
                              <p className="text-[11px] text-rose-400 font-medium px-1">{assetSearchError}</p>
                            )}

                            {/* Assets Grid */}
                            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                              {(() => {
                                const rawAssets = currentProfile?.assets || [];
                                const filtered = rawAssets.filter((a: any) => {
                                  if (!assetFilter.trim()) return true;
                                  const q = assetFilter.toLowerCase();
                                  return (
                                    (a.name && a.name.toLowerCase().includes(q)) ||
                                    (a.type && a.type.toLowerCase().includes(q)) ||
                                    String(a.id).includes(q)
                                  );
                                });

                                if (rawAssets.length === 0) {
                                  return (
                                    <div className="text-center py-8 space-y-2 bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                                      <Shirt className="h-8 w-8 text-slate-600 mx-auto opacity-50" />
                                      <p className="text-xs text-slate-400 font-medium">{t("noAssets")}</p>
                                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                                        Puedes buscar e inspeccionar cualquier ID de ropa o accesorio de Roblox ingresando su ID arriba.
                                      </p>
                                    </div>
                                  );
                                }

                                if (filtered.length === 0) {
                                  return (
                                    <p className="text-xs text-slate-500 text-center py-6">
                                      No se encontraron prendas con la búsqueda "{assetFilter}".
                                    </p>
                                  );
                                }

                                return (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {filtered.map((asset: any, idx: number) => (
                                      <div
                                        key={`asset-${asset.id || ""}-${idx}`}
                                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center gap-2.5 hover:border-slate-700 transition group"
                                      >
                                        <img
                                          src={asset.thumbnailUrl || "https://tr.rbxcdn.com/30day-asset-thumbnail/150/150/Asset/Png"}
                                          alt={asset.name}
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://tr.rbxcdn.com/30day-asset-thumbnail/150/150/Asset/Png";
                                          }}
                                          className="h-12 w-12 object-contain rounded-lg bg-slate-900 border border-slate-800 p-1 shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-300 transition">
                                            {asset.name || `Accesorio #${asset.id}`}
                                          </p>
                                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                            <span className="text-[10px] text-indigo-400 bg-indigo-950/80 border border-indigo-800/40 px-1.5 py-0.5 rounded font-medium">
                                              {asset.type || "Accesorio"}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-mono">ID: {asset.id}</span>
                                          </div>
                                        </div>
                                        <a
                                          href={`https://www.roblox.com/catalog/${asset.id}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="p-2 rounded-lg bg-slate-900 hover:bg-indigo-600 text-slate-400 hover:text-white transition shrink-0"
                                          title="Ver en el Catálogo de Roblox"
                                        >
                                          <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    /* Search Results Display */
                    <>
                      {isSearching && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-slate-900 rounded-2xl border border-slate-800 p-4 h-44 flex flex-col justify-between animate-pulse">
                              <div className="h-20 w-20 bg-slate-800 rounded-full mx-auto" />
                              <div className="h-4 bg-slate-800 rounded w-2/3 mx-auto mt-2" />
                            </div>
                          ))}
                        </div>
                      )}

                      {!isSearching && searchResults.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
                            {t("usersFound")} ({searchResults.length})
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {searchResults.map((user, idx) => (
                              <div
                                key={`user-${user.id || ""}-${idx}`}
                                id={`user-card-${user.id}`}
                                onClick={() => fetchUserProfile(user.id)}
                                className="bg-slate-900 hover:bg-slate-850 hover:border-indigo-500/40 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between text-center cursor-pointer transition shadow-md group relative overflow-hidden"
                              >
                                <img
                                  src={user.thumbnailUrl}
                                  alt={user.displayName}
                                  referrerPolicy="no-referrer"
                                  className="h-24 w-24 object-contain group-hover:scale-105 transition duration-300 relative z-10"
                                />
                                <div className="space-y-0.5 mt-3 relative z-10">
                                  <p className="text-xs font-bold text-slate-100 truncate max-w-[140px] flex items-center justify-center gap-1">
                                    {user.displayName}
                                    {user.hasVerifiedBadge && (
                                      <span className="h-3 w-3 rounded-full bg-blue-500 text-[8px] text-white flex items-center justify-center font-bold" title="Verified">✓</span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-mono">@{user.name}</p>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-[9px] font-bold font-mono bg-indigo-900 text-indigo-200 px-2 py-0.5 rounded-md">
                                  {t("viewProfile")}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Right Column: Search history */}
                <div className="space-y-5">
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-indigo-400" /> {t("recentSearchesTitle")}
                      </h3>
                      {recentSearches.length > 0 && (
                        <button
                          onClick={() => {
                            setRecentSearches([]);
                            localStorage.removeItem("roblox_search_history");
                          }}
                          className="text-[10px] font-bold font-mono text-slate-500 hover:text-rose-400 transition"
                        >
                          {t("clear")}
                        </button>
                      )}
                    </div>

                    {recentSearches.length === 0 ? (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {t("emptyHistory")}
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                        {recentSearches.map((hist, idx) => (
                          <div
                            key={`hist-${hist.id || ""}-${idx}`}
                            onClick={() => fetchUserProfile(hist.id)}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 hover:border-slate-700 border border-slate-900 transition cursor-pointer group"
                          >
                            <img
                              src={hist.thumbnailUrl || "https://tr.rbxcdn.com/30day-avatar-headshot/150/150/AvatarHeadshot/Png"}
                              alt={hist.displayName}
                              referrerPolicy="no-referrer"
                              className="h-10 w-10 object-contain rounded-lg bg-slate-900"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-400 transition">
                                {hist.displayName}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono truncate">@{hist.name}</p>
                            </div>
                            <ExternalLink className="h-3 w-3 text-slate-600 group-hover:text-slate-400 transition" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Profile Loading card info */}
                  {isLoadingProfile && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg text-center space-y-4 animate-pulse">
                      <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{t("loadingProfileTitle")}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {t("loadingProfileSubtitle")}
                        </p>
                      </div>
                    </div>
                  )}

                  {profileError && (
                    <div className="bg-rose-950/20 border border-rose-900/30 p-5 rounded-2xl space-y-2 text-xs text-rose-300">
                      <p className="font-bold flex items-center gap-1.5 text-rose-400">
                        <ShieldAlert className="h-4 w-4" /> {t("connectionError")}
                      </p>
                      <p className="leading-relaxed">{profileError}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ROBLOX GAMES / EXPERIENCES SEARCH */}
          {activeTab === "games" && (
            <motion.div
              key="games-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Games Banner Hero */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-2xl p-6 md:p-8 border border-emerald-900/40 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                  <Gamepad2 className="h-80 w-80 text-emerald-400" />
                </div>
                <div className="max-w-2xl space-y-3 relative z-10">
                  <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 w-fit">
                    <Flame className="h-3 w-3 text-emerald-400 animate-pulse" />
                    {t("gamesHeroBadge")}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    {t("gamesTitle")}
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {t("gamesSubtitle")}
                  </p>
                </div>
              </div>

              {/* Search & Category Filter Section */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-4">
                <form onSubmit={(e) => { e.preventDefault(); handleGameSearch(); }} className="flex gap-2.5">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input
                      type="text"
                      id="game-search-input"
                      value={gameQuery}
                      onChange={(e) => setGameQuery(e.target.value)}
                      placeholder={t("searchGamePlaceholder")}
                      className="w-full text-sm bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearchingGames}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition shadow flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {isSearchingGames ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {t("searchGameButton")}
                  </button>
                </form>

                {/* Category Quick Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {GAME_CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => {
                        setActiveCategoryFilter(cat.key);
                        setGameQuery(cat.keyword);
                        handleGameSearch(cat.keyword);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                        activeCategoryFilter === cat.key
                          ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {gameSearchError && (
                  <div className="bg-rose-950/40 border border-rose-900/30 px-4 py-3 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{gameSearchError}</span>
                  </div>
                )}
              </div>

              {/* Games Grid */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4 text-emerald-400" />
                    {isSearchingGames ? t("loadingGames") : `${t("gamesFound")} (${gamesList.length})`}
                  </h3>
                </div>

                {isSearchingGames ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <div key={n} className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 animate-pulse">
                        <div className="w-full h-40 bg-slate-800 rounded-xl" />
                        <div className="h-4 bg-slate-800 rounded w-3/4" />
                        <div className="h-3 bg-slate-800 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : gamesList.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                    <Gamepad2 className="h-12 w-12 text-slate-600 mx-auto" />
                    <p className="text-sm text-slate-400">{t("noGamesFound")}</p>
                    <button
                      onClick={() => { setGameQuery(""); handleGameSearch(""); setActiveCategoryFilter("all"); }}
                      className="text-xs font-bold text-emerald-400 hover:underline"
                    >
                      {t("viewPopularGames")}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {gamesList.map((game, idx) => (
                      <div
                        key={`game-${game.universeId || game.placeId || ""}-${idx}`}
                        className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 shadow-lg group relative overflow-hidden"
                      >
                        <div className="space-y-3">
                          {/* Thumbnail Image with Badges overlay */}
                          <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                            <img
                              src={game.thumbnailUrl}
                              alt={game.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLElement).setAttribute("src", "https://tr.rbxcdn.com/30day-game-icon/512/512/GameIcon/Png");
                              }}
                            />
                            
                            {/* Live Active Players Overlay Badge */}
                            <div className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5 shadow-md">
                              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[10px] font-bold text-emerald-300 font-mono">
                                {formatNumber(game.playerCount)} {t("live")}
                              </span>
                            </div>

                            {/* Price Tag */}
                            <div className="absolute top-2.5 right-2.5 bg-indigo-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-indigo-500/30 text-[10px] font-extrabold text-indigo-300">
                              {game.price && game.price > 0 ? `R$ ${game.price}` : t("free")}
                            </div>
                          </div>

                          {/* Game Title & Creator */}
                          <div>
                            <h4 className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition truncate" title={game.name}>
                              {game.name}
                            </h4>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {t("byCreator")}: <span className="text-slate-300 font-medium">{game.creatorName || "Roblox"}</span>
                            </p>
                          </div>

                          {/* Description summary */}
                          {game.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {game.description}
                            </p>
                          )}

                          {/* Game Stats Bar */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60 text-[11px] font-mono">
                            <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800/80">
                              <span className="text-slate-500 block text-[9px] uppercase font-bold">{t("visits")}</span>
                              <span className="text-slate-200 font-bold flex items-center gap-1">
                                <Eye className="h-3 w-3 text-slate-400" />
                                {formatNumber(game.totalVisits)}
                              </span>
                            </div>
                            <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800/80">
                              <span className="text-slate-500 block text-[9px] uppercase font-bold">{t("placeId")}</span>
                              <span className="text-slate-200 font-bold truncate block">
                                {game.placeId || game.universeId}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center gap-2">
                          <a
                            href={game.robloxUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow flex items-center justify-center gap-1.5"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            {t("playOnRoblox")}
                          </a>
                          <button
                            onClick={() => copyGameLink(game)}
                            title="Copiar Link de Roblox"
                            className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition"
                          >
                            {copiedGameId === (game.universeId || game.placeId) ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: ADVANCED ROBLOX UTILITY TOOLS */}
          {activeTab === "tools" && (
            <motion.div
              key="tools-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Tools Header Hero */}
              <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-6 md:p-8 border border-purple-900/40 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                  <Cpu className="h-80 w-80 text-purple-400" />
                </div>
                <div className="max-w-2xl space-y-3 relative z-10">
                  <span className="text-[10px] font-bold tracking-wider text-purple-400 uppercase bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-500/30 flex items-center gap-1.5 w-fit">
                    <Terminal className="h-3 w-3 text-purple-400 animate-pulse" />
                    Portal Oficial de Utilidades Witz
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    {currentLang === "es" ? "Herramientas Avanzadas de Roblox" : "Advanced Roblox Toolkits"}
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Accede a calculadoras financieras, decodificadores de ID en tiempo real, herramientas de red y validadores sin necesidad de salir del buscador. Todo de forma instantánea y ligera.
                  </p>
                </div>
              </div>

              {/* Sub-Category Navigation Bar */}
              <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex flex-wrap gap-2 shadow-md">
                {[
                  { key: "net", label: "Servidores y Red", icon: Wifi, desc: "Status de Roblox y decodificadores" },
                  { key: "calc", label: "Calculadoras", icon: DollarSign, desc: "Robux, DevEx y metas de likes" },
                  { key: "creator", label: "Creadores & Customizer", icon: Award, desc: "Fuentes, badges y usuarios" },
                  { key: "history", label: "Copias de Seguridad", icon: Settings, desc: "Importar y exportar datos" }
                ].map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => {
                        setActiveToolCategory(cat.key as any);
                      }}
                      className={`flex-1 min-w-[150px] p-3 rounded-xl text-left transition border flex items-center gap-3 group ${
                        activeToolCategory === cat.key
                          ? "bg-purple-650/10 border-purple-500 text-purple-300 shadow-sm"
                          : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      <div className={`p-2 rounded-lg transition shrink-0 ${activeToolCategory === cat.key ? "bg-purple-650 text-white" : "bg-slate-900 text-slate-400"}`}>
                        <CatIcon className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold truncate">{cat.label}</p>
                        <p className="text-[10px] text-slate-500 truncate group-hover:text-slate-400">{cat.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Tools Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side Menu / Card Info or Extra context panel */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Center Control */}
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-lg">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                      <Activity className="h-4 w-4 text-purple-400" />
                      <h3 className="text-xs font-bold font-mono text-slate-300 uppercase">Centro de Control</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-500 font-mono">ESTADO GENERAL</p>
                          <p className="text-xs font-bold text-emerald-400">Servicios Operativos</p>
                        </div>
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                      <div className="text-[11px] text-slate-400 leading-relaxed space-y-2">
                        <p>
                          Las herramientas de Witz Studio utilizan algoritmos de análisis directo de Roblox para proveer estimaciones del mercado y validaciones de código.
                        </p>
                        <div className="bg-purple-950/20 p-2.5 rounded-lg border border-purple-900/30 text-[10px] text-purple-300">
                          <strong>💡 Tip Pro:</strong> Todos los cálculos financieros se actualizan con la tasa DevEx oficial de Roblox (<strong>$350 USD por cada 100k Robux</strong>).
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Squad Counter */}
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3 shadow-lg">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Heart className="h-4 w-4 text-rose-500" />
                        Mi Squad Favorito ({squad.length})
                      </h4>
                      {squad.length > 0 && (
                        <button
                          onClick={() => {
                            if(confirm("¿Seguro que deseas vaciar tu Squad?")) setSquad([]);
                          }}
                          className="text-[10px] text-rose-400 hover:underline"
                        >
                          Vaciar
                        </button>
                      )}
                    </div>
                    {squad.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 text-center">
                        No has añadido jugadores a tu Squad. Haz click en "Añadir a mi Squad" desde el perfil de cualquier usuario.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin">
                        {squad.map((member, sIdx) => (
                          <div key={`squad-m-${member.id}-${sIdx}`} className="p-2 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                              <img
                                src={member.thumbnailUrl || "https://tr.rbxcdn.com/30day-avatar-headshot/150/150/AvatarHeadshot/Png"}
                                alt={member.name}
                                className="h-7 w-7 rounded-lg bg-slate-900 border border-slate-800 object-cover"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-200 truncate leading-tight">{member.displayName || member.name}</p>
                                <p className="text-[9px] text-slate-500 font-mono">@{member.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                              <button
                                onClick={() => {
                                  setSearchQuery(member.name);
                                  setActiveTab("search");
                                  fetchUserProfile(member.id);
                                }}
                                className="text-[10px] text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2 py-1 rounded-lg hover:bg-indigo-600 hover:text-white transition"
                              >
                                Ver
                              </button>
                              <button
                                onClick={() => {
                                  setSquad(prev => prev.filter(m => m.id !== member.id));
                                }}
                                className="p-1 text-slate-500 hover:text-rose-400 transition"
                                title="Eliminar del Squad"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side Tools Working Area */}
                <div className="lg:col-span-2 space-y-6">
                  {/* CATEGORY: NETWORK & STATUS */}
                  {activeToolCategory === "net" && (
                    <div className="space-y-6">
                      {/* Tool 1: Server Status Monitor */}
                      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-extrabold text-white">1. Roblox Server Status Monitor</h4>
                            <p className="text-xs text-slate-400">Verifica la latencia en tiempo real y disponibilidad de los servidores principales de Roblox.</p>
                          </div>
                          <button
                            onClick={fetchLiveStatus}
                            disabled={isPingingStatus}
                            className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-[10px] px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                          >
                            <RefreshCw className={`h-3 w-3 ${isPingingStatus ? "animate-spin text-purple-400" : ""}`} />
                            Pinger
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {liveServicesStatus.map((srv) => {
                            const customReport = outageReportCount[srv.key] || 0;
                            const isReported = reportedOutage === srv.key;
                            const currentPing = srv.ping;
                            const currentStatus = srv.status;

                            return (
                              <div key={srv.key} className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 flex flex-col justify-between space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-xs font-bold text-slate-200">{srv.label}</p>
                                    <p className="text-[10px] font-mono text-slate-500">Ping: {currentPing}ms • Reportes: {customReport}</p>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                                    currentStatus === "Caída Detectada" || customReport > 10 
                                      ? "bg-rose-950/60 text-rose-400 border border-rose-900/40" 
                                      : currentStatus === "Inestable"
                                      ? "bg-amber-950/60 text-amber-400 border border-amber-900/40"
                                      : "bg-emerald-950/60 text-emerald-400 border border-emerald-900/40"
                                  }`}>
                                    {currentStatus === "Caída Detectada" || customReport > 10 ? "Caída" : currentStatus}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setReportedOutage(srv.key);
                                    setOutageReportCount(prev => ({
                                      ...prev,
                                      [srv.key]: (prev[srv.key] || 0) + 1
                                    }));
                                  }}
                                  disabled={isReported}
                                  className={`w-full text-center text-[10px] font-bold py-1.5 rounded-lg border transition ${
                                    isReported 
                                      ? "bg-rose-950/40 text-rose-300 border-rose-900/40"
                                      : "bg-slate-900 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 border-slate-800 hover:border-rose-900/30"
                                  }`}
                                >
                                  {isReported ? "✓ Reportado con éxito" : "⚠️ Reportar Falla o Caída"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tool 2: Roblox Account ID Creation Date Decoder */}
                      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                        <div>
                          <h4 className="text-sm font-extrabold text-white">2. ID to Creation Date Decoder</h4>
                          <p className="text-xs text-slate-400">Descubre la fecha de creación estimada de cualquier cuenta o asset de Roblox basándote en su identificador numérico.</p>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Ej: 450000000"
                            value={idDecoderInput}
                            onChange={(e) => {
                              setIdDecoderInput(e.target.value);
                              const res = decodeRobloxId(parseInt(e.target.value));
                              setIdDecoderResult(res);
                            }}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                          <button
                            onClick={() => {
                              setIdDecoderInput("154000");
                              setIdDecoderResult(decodeRobloxId(154000));
                            }}
                            className="bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3 py-2 text-[10px] text-slate-400 hover:text-slate-200 transition rounded-xl font-bold font-mono"
                          >
                            Legacy ID (2008)
                          </button>
                        </div>

                        {idDecoderResult && (
                          <div className="p-4 bg-slate-950/80 rounded-xl border border-purple-900/30 space-y-2 animate-fadeIn">
                            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                              <Clock className="h-4 w-4" />
                              <span>Resultado del Análisis Estructural:</span>
                            </div>
                            <p className="text-xs text-slate-300">
                              El identificador ingresado <span className="font-mono text-purple-400 font-bold">{idDecoderInput}</span> fue emitido aproximadamente en <strong className="text-white font-extrabold">{idDecoderResult.month} de {idDecoderResult.year}</strong>.
                            </p>
                            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-4 overflow-hidden relative">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(5, ((idDecoderResult.year - 2006) / 20) * 100))}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[8px] font-mono text-slate-500">
                              <span>Fundación (2006)</span>
                              <span>Tú ID ({idDecoderResult.year})</span>
                              <span>Actualidad (2026)</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tool 3: Deep-Launcher Protocol Generator */}
                      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                        <div>
                          <h4 className="text-sm font-extrabold text-white">3. Game Quick-Launch deep-linker</h4>
                          <p className="text-xs text-slate-400">Genera un enlace de protocolo directo de Roblox para abrir cualquier experiencia instantáneamente desde el navegador.</p>
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-400 font-mono mb-1">ID DE EXPERIENCIA (PLACE ID)</label>
                              <input
                                type="text"
                                placeholder="Ej: 9205874113"
                                id="launcher-placeid"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 font-mono mb-1">CÓDIGO DE SERVIDOR PRIVADO (OPCIONAL)</label>
                              <input
                                type="text"
                                placeholder="Ej: _psCode123456"
                                id="launcher-pscode"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const pId = (document.getElementById("launcher-placeid") as HTMLInputElement)?.value.trim() || "9205874113";
                              const ps = (document.getElementById("launcher-pscode") as HTMLInputElement)?.value.trim();
                              let protocol = `roblox://placeId=${pId}`;
                              if (ps) protocol += `&accessCode=${ps}`;
                              
                              navigator.clipboard.writeText(protocol);
                              alert(`Enlace copiado con éxito: ${protocol}\n\nPégalo en tu navegador para lanzar Roblox.`);
                            }}
                            className="w-full bg-purple-650 hover:bg-purple-600 bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            Generar y Copiar Enlace de Lanzamiento Directo
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CATEGORY: CONVERTERS & FINANCE */}
                  {activeToolCategory === "calc" && (
                    <div className="space-y-6">
                      {/* Tool 4: Robux to Real Currency Converter */}
                      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                        <div>
                          <h4 className="text-sm font-extrabold text-white">4. Robux to Real Currency Converter</h4>
                          <p className="text-xs text-slate-400">Calcula el valor monetario real de cualquier cantidad de Robux utilizando tarifas DevEx o de compra.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-400 font-mono mb-1">CANTIDAD ROBUX</label>
                            <input
                              type="number"
                              value={robuxInput}
                              onChange={(e) => setRobuxInput(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-mono mb-1">MONEDA DESTINO</label>
                            <select
                              value={robuxCurrency}
                              onChange={(e) => setRobuxCurrency(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                              <option value="USD">USD ($ Dólar Americano)</option>
                              <option value="EUR">EUR (€ Euro)</option>
                              <option value="MXN">MXN ($ Peso Mexicano)</option>
                              <option value="BRL">BRL (R$ Real Brasileño)</option>
                              <option value="ARS">ARS ($ Peso Argentino)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-mono mb-1">TIPO DE TASA</label>
                            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                              <button
                                onClick={() => setRobuxRateType("devex")}
                                className={`text-[10px] py-1 rounded-lg transition font-extrabold ${robuxRateType === "devex" ? "bg-purple-600 text-white" : "text-slate-400"}`}
                              >
                                DevEx
                              </button>
                              <button
                                onClick={() => setRobuxRateType("purchase")}
                                className={`text-[10px] py-1 rounded-lg transition font-extrabold ${robuxRateType === "purchase" ? "bg-purple-600 text-white" : "text-slate-400"}`}
                              >
                                Compra
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Calculations readout */}
                        {(() => {
                          const robux = parseFloat(robuxInput) || 0;
                          let usdValue = 0;
                          if (robuxRateType === "devex") {
                            // DevEx rate: $0.0035 per Robux ($350 per 100k)
                            usdValue = robux * 0.0035;
                          } else {
                            // Purchase rate: roughly $0.0125 per Robux
                            usdValue = robux * 0.0125;
                          }

                          const multi: Record<string, number> = { USD: 1.0, EUR: 0.92, MXN: 17.1, BRL: 4.95, ARS: 830 };
                          const targetValue = usdValue * (multi[robuxCurrency] || 1.0);
                          const symbols: Record<string, string> = { USD: "$", EUR: "€", MXN: "$", BRL: "R$", ARS: "$" };

                          return (
                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1.5">
                              <p className="text-[10px] text-slate-500 font-mono uppercase">CONVERSIÓN CALCULADA</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-white">{robux.toLocaleString()} Robux</span>
                                <span className="text-xs text-slate-400">equivalen a</span>
                                <span className="text-xl font-black text-emerald-400">{symbols[robuxCurrency]} {targetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {robuxCurrency}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                                {robuxRateType === "devex" 
                                  ? "Fórmula DevEx Oficial: Robux * 0.0035 USD / Robux"
                                  : "Fórmula de Compra Promedio: Robux * 0.0125 USD / Robux"
                                }
                              </p>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Tool 5: Private Server Planner & Cost Calculator */}
                      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                        <div>
                          <h4 className="text-sm font-extrabold text-white">5. Private Server Planner & Cost Calculator</h4>
                          <p className="text-xs text-slate-400">Planifica servidores VIP para jugar con tu Squad y calcula el coste en Robux y su equivalente real.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-400 font-mono mb-1">MIEMBROS SQUAD</label>
                            <input
                              type="range"
                              min="2"
                              max="30"
                              value={plannerPlayers}
                              onChange={(e) => setPlannerPlayers(e.target.value)}
                              className="w-full accent-purple-500"
                            />
                            <p className="text-xs text-slate-300 font-mono mt-1 text-center font-bold">{plannerPlayers} Jugadores</p>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-mono mb-1">EXPERIENCIA ELEGIDA</label>
                            <select
                              onChange={(e) => setPlannerSelectedGameId(parseInt(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                              <option value="0">Brookhaven 🏡RP (Gratis / R$ 0)</option>
                              <option value="200">Blox Fruits 🍎 (R$ 200 / mes)</option>
                              <option value="150">Adopt Me! 🐶 (R$ 150 / mes)</option>
                              <option value="500">Servidor Personalizado Premium (R$ 500 / mes)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-mono mb-1">DURACIÓN (MESES)</label>
                            <select
                              id="planner-months"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                              <option value="1">1 Mes</option>
                              <option value="3">3 Meses (5% Descuento)</option>
                              <option value="6">6 Meses (10% Descuento)</option>
                              <option value="12">12 Meses (20% Descuento)</option>
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const months = parseInt((document.getElementById("planner-months") as HTMLSelectElement)?.value || "1");
                            const baseRate = plannerSelectedGameId !== null ? plannerSelectedGameId : 0;
                            let discount = 1;
                            if (months === 3) discount = 0.95;
                            else if (months === 6) discount = 0.90;
                            else if (months === 12) discount = 0.80;

                            const rawTotal = baseRate * months;
                            const finalTotal = Math.round(rawTotal * discount);
                            const realUsd = finalTotal * 0.0125;

                            alert(`=== PLANIFICADOR DE SQUAD VIP ===\n\nCapacidad: ${plannerPlayers} jugadores\nDuración: ${months} meses\nTasa Base: R$ ${baseRate} / mes\n\nTOTAL COSTO: R$ ${finalTotal} Robux (Aprox. $${realUsd.toFixed(2)} USD)`);
                          }}
                          className="w-full bg-slate-950 hover:bg-slate-850 text-slate-200 font-bold text-xs py-2.5 rounded-xl border border-slate-800 transition flex items-center justify-center gap-1.5"
                        >
                          Calcular Presupuesto Compartido de Squad
                        </button>
                      </div>

                      {/* Tool 6: Experience Ratings Target Milestone Calculator */}
                      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                        <div>
                          <h4 className="text-sm font-extrabold text-white">6. Rating Target Milestone Calculator</h4>
                          <p className="text-xs text-slate-400">Ingresa las votaciones actuales de un juego y calcula cuántos likes seguidos necesita para subir su porcentaje de aprobación.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-400 font-mono mb-1">VOTOS POSITIVOS (LIKES)</label>
                            <input
                              type="number"
                              id="target-likes"
                              placeholder="Ej: 8500"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-mono mb-1">VOTOS NEGATIVOS (DISLIKES)</label>
                            <input
                              type="number"
                              id="target-dislikes"
                              placeholder="Ej: 1500"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-mono mb-1">META DE APROBACIÓN</label>
                            <select
                              id="target-percentage"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                              <option value="90">90% Aprobación (Excelente)</option>
                              <option value="95">95% Aprobación (Mítico)</option>
                              <option value="99">99% Aprobación (Legendario)</option>
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const likes = parseInt((document.getElementById("target-likes") as HTMLInputElement)?.value) || 0;
                            const dislikes = parseInt((document.getElementById("target-dislikes") as HTMLInputElement)?.value) || 0;
                            const target = parseInt((document.getElementById("target-percentage") as HTMLSelectElement)?.value) || 90;

                            if (likes === 0 && dislikes === 0) {
                              alert("Por favor ingresa valores reales para el cálculo.");
                              return;
                            }

                            const total = likes + dislikes;
                            const current = Math.round((likes / total) * 100);

                            if (current >= target) {
                              alert(`El juego ya cuenta con ${current}% de aprobación, cumpliendo con la meta de ${target}%.`);
                              return;
                            }

                            // Calculation formula: target = (likes + x) / (total + x) -> target*total + target*x = likes + x -> target*total - likes = x (1 - target) -> x = (likes - target*total) / (target - 1)
                            const targetFraction = target / 100;
                            const required = Math.ceil((targetFraction * dislikes - likes + targetFraction * likes) / (1 - targetFraction));

                            alert(`=== RESULTADO DEL OBJETIVO ===\n\nAprobación Actual: ${current}%\nMeta de Likes: ${target}%\n\nSe requieren exactamente ${required.toLocaleString()} LIKES positivos consecutivos para alcanzar el ${target}% de aprobación sin recibir más dislikes.`);
                          }}
                          className="w-full bg-purple-650 hover:bg-purple-600 bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                        >
                          Calcular Votos Requeridos
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CATEGORY: CREATORS & CUSTOMIZERS */}
                  {activeToolCategory === "creator" && (
                    <div className="space-y-6">
                      {/* Tool 7: Roblox Font & Safe-Text Generator */}
                      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                        <div>
                          <h4 className="text-sm font-extrabold text-white">7. Roblox Font & Safe-Text Generator</h4>
                          <p className="text-xs text-slate-400">Escribe cualquier texto y conviértelo a estilos unicode compatibles para copiar y pegar en tu biografía de Roblox.</p>
                        </div>
                        <input
                          type="text"
                          value={fontTextInput}
                          onChange={(e) => setFontTextInput(e.target.value)}
                          placeholder="Escribe tu texto aquí..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />

                        <div className="space-y-2">
                          {FONT_STYLES.map((style, fIdx) => {
                            const formatted = style.transform(fontTextInput || "ROBLOX");
                            const isCopied = copiedFontIndex === fIdx;

                            return (
                              <div key={fIdx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between">
                                <div className="min-w-0">
                                  <p className="text-[9px] text-slate-500 font-mono uppercase">{style.name}</p>
                                  <p className="text-xs font-bold text-slate-200 truncate select-all">{formatted}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(formatted);
                                    setCopiedFontIndex(fIdx);
                                    setTimeout(() => setCopiedFontIndex(null), 1000);
                                  }}
                                  className="p-1.5 bg-slate-900 hover:bg-purple-650 rounded-lg text-slate-400 hover:text-white transition"
                                >
                                  {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tool 8: Interactive Badge Designer */}
                      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                        <div>
                          <h4 className="text-sm font-extrabold text-white">8. Interactive Badge Designer</h4>
                          <p className="text-xs text-slate-400">Diseña de manera visual un emblema o medalla virtual de Roblox y exporta su configuración estructural.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] text-slate-400 font-mono mb-1">TÍTULO DEL EMBLEMA</label>
                              <input
                                type="text"
                                value={badgeTitle}
                                onChange={(e) => setBadgeTitle(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 font-mono mb-1">DESCRIPCIÓN</label>
                              <textarea
                                value={badgeDesc}
                                onChange={(e) => setBadgeDesc(e.target.value)}
                                className="w-full h-16 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 font-mono mb-1">FONDO VISUAL</label>
                              <select
                                value={badgeBg}
                                onChange={(e) => setBadgeBg(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                              >
                                <option value="bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-600">Gradiente Aurora Cósmica</option>
                                <option value="bg-gradient-to-tr from-amber-400 via-rose-500 to-red-600">Gradiente Fuego Volcánico</option>
                                <option value="bg-gradient-to-tr from-emerald-400 via-teal-600 to-cyan-500">Gradiente Jade Tecnológico</option>
                                <option value="bg-gradient-to-tr from-slate-900 to-slate-800">Negro Carbón Premium</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
                            <p className="text-[9px] text-slate-500 font-mono uppercase">VISTA PREVIA DE EMBLEMA</p>
                            
                            {/* Circular badge render */}
                            <div className="relative h-28 w-28 rounded-full border-4 border-amber-400 p-1 bg-slate-900 overflow-hidden shadow-lg flex items-center justify-center">
                              <div className={`absolute inset-1 rounded-full ${badgeBg} opacity-80 blur-[2px]`} />
                              <div className="relative text-white z-10 flex flex-col items-center justify-center">
                                <Award className="h-10 w-10 text-amber-300 drop-shadow-md animate-pulse" />
                                <span className="text-[7px] font-black uppercase tracking-wider bg-slate-950/80 px-1 py-0.5 rounded border border-slate-800 mt-1">WITZO-ID</span>
                              </div>
                            </div>

                            <div className="text-center">
                              <h5 className="text-xs font-bold text-slate-200">{badgeTitle}</h5>
                              <p className="text-[10px] text-slate-400 max-w-xs">{badgeDesc}</p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const configStr = JSON.stringify({ badgeTitle, badgeDesc, badgeBg, badgeIcon }, null, 2);
                            navigator.clipboard.writeText(configStr);
                            alert("Configuración de diseño copiada en portapapeles en formato JSON.");
                          }}
                          className="w-full bg-slate-950 hover:bg-slate-850 text-slate-200 font-bold text-xs py-2.5 rounded-xl border border-slate-800 transition flex items-center justify-center gap-1.5"
                        >
                          Exportar Configuración de Emblema (JSON)
                        </button>
                      </div>

                      {/* Tool 9: Roblox Username Constraints Checker */}
                      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                        <div>
                          <h4 className="text-sm font-extrabold text-white">9. Roblox Username Constraints Checker</h4>
                          <p className="text-xs text-slate-400">Verifica que un nombre de usuario cumpla todas las reglas gramaticales y de seguridad de Roblox.</p>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Nombre de usuario a validar..."
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                          <button
                            onClick={() => handleCheckUsername(usernameInput)}
                            disabled={isCheckingUsername}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                          >
                            {isCheckingUsername ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Validar"}
                          </button>
                        </div>

                        {usernameCheckResult && (
                          <div className={`p-4 rounded-xl border space-y-2 ${
                            usernameCheckResult.available 
                              ? "bg-emerald-950/30 border-emerald-900/30 text-emerald-400" 
                              : "bg-rose-950/30 border-rose-900/30 text-rose-400"
                          }`}>
                            <div className="flex items-center gap-2 text-xs font-bold">
                              {usernameCheckResult.available ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                              <span>{usernameCheckResult.available ? "Usuario Válido y Disponible" : "Usuario Inválido o Registrado"}</span>
                            </div>
                            <p className="text-xs text-slate-300">{usernameCheckResult.reason}</p>

                            {/* Verification indicators */}
                            <div className="pt-2 grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-400">
                              <span className="flex items-center gap-1 text-emerald-400">✔ Longitud (3-20)</span>
                              <span className="flex items-center gap-1 text-emerald-400">✔ Solo caracteres seguros</span>
                              <span className={`flex items-center gap-1 ${usernameInput.includes("__") ? "text-rose-400" : "text-emerald-400"}`}>
                                {usernameInput.includes("__") ? "✘ Demasiados _" : "✔ Guión único"}
                              </span>
                              <span className={`flex items-center gap-1 ${usernameInput.startsWith("_") || usernameInput.endsWith("_") ? "text-rose-400" : "text-emerald-400"}`}>
                                {usernameInput.startsWith("_") || usernameInput.endsWith("_") ? "✘ Posición _ incorrecta" : "✔ Extremos correctos"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CATEGORY: BACKUPS & SYNC */}
                  {activeToolCategory === "history" && (
                    <div className="space-y-6">
                      {/* Tool 10: History Exporter & Importer */}
                      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                        <div>
                          <h4 className="text-sm font-extrabold text-white">10. Local Data Porter (JSON)</h4>
                          <p className="text-xs text-slate-400">Respalda o sincroniza tu historial de búsquedas, tus bookmarks de experiencias y tu squad favorito mediante texto seguro.</p>
                        </div>

                        <div className="space-y-3">
                          <textarea
                            id="backup-porter-area"
                            placeholder="Pega un string de respaldo aquí..."
                            className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-300 focus:outline-none"
                          />

                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => {
                                const payload = {
                                  bookmarkedGames,
                                  squad,
                                  recentSearches
                                };
                                const backupStr = btoa(JSON.stringify(payload));
                                const area = document.getElementById("backup-porter-area") as HTMLTextAreaElement;
                                if (area) area.value = backupStr;
                                navigator.clipboard.writeText(backupStr);
                                alert("String de respaldo generado y copiado al portapapeles.");
                              }}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1"
                            >
                              Generar Copia de Seguridad
                            </button>
                            <button
                              onClick={() => {
                                const area = document.getElementById("backup-porter-area") as HTMLTextAreaElement;
                                const val = area?.value.trim();
                                if (!val) {
                                  alert("Ingresa un string de respaldo válido.");
                                  return;
                                }

                                try {
                                  const raw = atob(val);
                                  const payload = JSON.parse(raw);
                                  if (Array.isArray(payload.bookmarkedGames)) setBookmarkedGames(payload.bookmarkedGames);
                                  if (Array.isArray(payload.squad)) setSquad(payload.squad);
                                  if (Array.isArray(payload.recentSearches)) {
                                    setRecentSearches(payload.recentSearches);
                                    localStorage.setItem("roblox_search_history", JSON.stringify(payload.recentSearches));
                                  }
                                  alert("✓ Datos importados y sincronizados correctamente.");
                                } catch (err) {
                                  alert("Error al parsear el string de respaldo. Asegúrate de que sea un string generado por BloxFinder.");
                                }
                              }}
                              className="bg-slate-950 hover:bg-slate-850 text-slate-200 font-bold text-xs py-2.5 rounded-xl border border-slate-800 transition flex items-center justify-center gap-1"
                            >
                              Restaurar Datos
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: PANEL ADMINISTRATIVO DE CONTROL (ONLY FOR sportxdbas@gmail.com) */}
          {activeTab === "admin" && sessionUser?.email?.toLowerCase() === "sportxdbas@gmail.com" && (
            <motion.div
              key="admin-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono tracking-wider uppercase bg-rose-950 text-rose-400 border border-rose-900/40">
                      PROPIETARIO & ADMIN
                    </span>
                    <h2 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
                      <Lock className="h-5 w-5 text-rose-400" />
                      Panel de Control Administrativo
                    </h2>
                    <p className="text-xs text-slate-400">
                      Base de Datos Centralizada de Cuentas y Credenciales de BloxFinder (sportxdbas@gmail.com).
                    </p>
                  </div>
                  <button
                    onClick={fetchAdminUsers}
                    disabled={isAdminLoading}
                    className="bg-slate-950 hover:bg-slate-850 text-slate-300 font-bold text-xs px-3.5 py-2 rounded-xl transition border border-slate-800 flex items-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isAdminLoading ? 'animate-spin' : ''}`} />
                    Recargar Datos
                  </button>
                </div>

                {/* Security notice card */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-indigo-950/40 space-y-1.5">
                  <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4" />
                    Encriptación de Credenciales de Extremo a Extremo
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    En cumplimiento con las normativas internacionales de seguridad de datos de usuario (ISO 27001 / OWASP A02), todas las contraseñas se almacenan cifradas de forma irreversible con el algoritmo de hash <span className="text-slate-300 font-bold font-mono">SHA-256</span> en el servidor. Esto impide fugas de contraseñas reales, manteniendo tu sistema libre de vulnerabilidades y completamente listo para despliegues de producción real.
                  </p>
                </div>

                {adminError && (
                  <div className="bg-rose-950/50 border border-rose-900/40 p-3 rounded-xl flex gap-2 items-center text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                {isAdminLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                    <p className="text-xs text-slate-500 font-medium">Leyendo base de datos segura users.json...</p>
                  </div>
                ) : adminUsers.length === 0 ? (
                  <div className="text-center py-12 space-y-1.5">
                    <p className="text-xs text-slate-500">No hay otros usuarios registrados en el sistema todavía.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-850">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-850">
                          <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Perfil</th>
                          <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Nombre / Nickname</th>
                          <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Correo Electrónico</th>
                          <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Fecha Registro</th>
                          <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Credencial Hash (SHA-256)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 bg-slate-900/50">
                        {adminUsers.map((user, idx) => (
                          <tr key={idx} className="hover:bg-slate-950/40 transition">
                            <td className="p-4">
                              <img
                                src={user.avatarUrl || "https://tr.rbxcdn.com/30day-avatar-headshot/150/150/AvatarHeadshot/Png"}
                                alt={user.displayName}
                                className="h-10 w-10 rounded-xl object-cover border border-slate-800 bg-slate-950"
                              />
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-slate-100 text-sm">{user.displayName}</div>
                              <div className="text-xs text-slate-500 font-mono">@{user.username}</div>
                            </td>
                            <td className="p-4">
                              <span className="text-slate-300 text-xs font-mono">{user.email}</span>
                              {user.email.toLowerCase() === "sportxdbas@gmail.com" && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] font-bold font-mono bg-rose-950 text-rose-400 border border-rose-900/40">
                                  ADMIN
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-xs text-slate-400 font-mono">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-850 break-all select-all font-semibold max-w-[220px] block truncate" title={user.passwordHash}>
                                  {user.passwordHash}
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(user.passwordHash);
                                  }}
                                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition shrink-0"
                                  title="Copiar Hash SHA-256"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Edit Profile Modal */}
      {showProfileEditModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white">Editar Perfil Personalizado</h3>
              <button
                onClick={() => setShowProfileEditModal(false)}
                className="text-slate-400 hover:text-white transition text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Nombre de Mostrar</label>
                <input
                  type="text"
                  value={customDisplayName}
                  onChange={(e) => setCustomDisplayName(e.target.value)}
                  placeholder="Introduce tu nombre de mostrar"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Foto de Perfil (URL de imagen)</label>
                <input
                  type="url"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="https://ejemplo.com/mi_foto.jpg"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Biografía o Mensaje de Estado</label>
                <textarea
                  value={customBio}
                  onChange={(e) => setCustomBio(e.target.value)}
                  placeholder="Cuéntanos un poco sobre ti..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {authLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Guardar Cambios"}
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="mt-auto bg-slate-900 border-t border-slate-800/80 px-5 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-mono text-slate-500">
            {t("footerLeft")}
          </span>
        </div>
        <p className="text-[10px] font-medium text-slate-400">
          {t("footerText")}
        </p>
      </footer>
    </div>
  );
}
