import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  getProfile,
  updateProfile,
  updatePhoto,
  deleteAccount,
} from "../../services/accountService";
import "./AccountPage.css";

const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

interface AccountPageProps {
  userId: string;
  onGoToHome: () => void;
  onGoToPlaylists: () => void;
  onGoToHistory: () => void;
  onLogout: () => void;
}

export function AccountPage({
  userId,
  onGoToHome,
  onLogout,
}: AccountPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("............");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Original values to check if there are changes
  const [originalName, setOriginalName] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Controlled editing states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Unsaved changes blocker modal
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Photo upload preview states
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
  
  // User deletion states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const hasChanges =
    name !== originalName ||
    email !== originalEmail ||
    (password !== "............" && password !== "") ||
    selectedPhotoFile !== null ||
    isPhotoRemoved;

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const profile = await getProfile(userId);
      setName(profile.name);
      setEmail(profile.email);
      setPhotoUrl(profile.photo);
      setOriginalName(profile.name);
      setOriginalEmail(profile.email);
      setPassword("............");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setErrorMessage(error.message || "Erro ao carregar dados do perfil.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const load = async () => {
      await loadProfile();
    };
    load();
  }, [loadProfile]);

  // Handle auto-clear timers for notifications (10 seconds)
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const mapErrorMessage = (errorMsg: string): string => {
    const msg = errorMsg.toLowerCase();
    if (msg.includes("e-mail já") || msg.includes("email já") || msg.includes("já está em uso") || msg.includes("conflict")) {
      return "E-mail já está em uso";
    }
    if (msg.includes("senha fora") || msg.includes("padrão exigido") || msg.includes("padrao exigido")) {
      return "Senha fora do padrão exigido";
    }
    if (msg.includes("arquivo inválido") || msg.includes("arquivo invalido")) {
      return "Arquivo inválido";
    }
    if (msg.includes("excede o tamanho") || msg.includes("tamanho superior") || msg.includes("tamanho permitido")) {
      return "Arquivo excede o tamanho permitido";
    }
    if (msg.includes("conexão") || msg.includes("conexao") || msg.includes("failed to fetch") || msg.includes("network")) {
      return "Erro de conexão";
    }
    if (msg.includes("sessão expirada") || msg.includes("sessao expirada") || msg.includes("unauthorized") || msg.includes("não autorizado") || msg.includes("401")) {
      return "Sessão expirada";
    }
    if (msg.includes("erro interno") || msg.includes("internal server") || msg.includes("500")) {
      return "Erro interno";
    }
    return errorMsg;
  };

  // Handle unload warnings when browsing away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  const handleCancel = () => {
    setName(originalName);
    setEmail(originalEmail);
    setPassword("............");
    setIsEditingName(false);
    setIsEditingEmail(false);
    setIsEditingPassword(false);
    setSelectedPhotoFile(null);
    setIsPhotoRemoved(false);
    if (previewPhotoUrl) {
      URL.revokeObjectURL(previewPhotoUrl);
      setPreviewPhotoUrl(null);
    }
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload: Record<string, string> = {};
    let hasFormChanges = false;

    if (name !== originalName) {
      payload.name = name;
      hasFormChanges = true;
    }
    if (email !== originalEmail) {
      payload.email = email;
      hasFormChanges = true;
    }
    if (password && password !== "............") {
      payload.password = password;
      hasFormChanges = true;
    }

    try {
      // 1. Process text changes
      if (hasFormChanges) {
        try {
          await updateProfile(userId, payload);
          if (payload.name) setOriginalName(payload.name);
          if (payload.email) setOriginalEmail(payload.email);
        } catch (formError) {
          const error = formError instanceof Error ? formError : new Error(String(formError));
          const errMsg = mapErrorMessage(error.message || "Erro ao salvar alterações.");
          setErrorMessage(errMsg);
          const thrownError = new Error(errMsg);
          Object.assign(thrownError, { cause: error });
          throw thrownError;
        }
      }

      // 2. Process photo changes or removal
      if (isPhotoRemoved) {
        try {
          await updatePhoto(userId, "", 0);
          localStorage.removeItem(`profile_avatar_${userId}`);
          setPhotoUrl(null);
          setIsPhotoRemoved(false);
        } catch (photoError) {
          setIsPhotoRemoved(false);
          const error = photoError instanceof Error ? photoError : new Error(String(photoError));
          const errMsg = mapErrorMessage(error.message || "Erro ao salvar alterações.");
          setErrorMessage(errMsg);
          const thrownError = new Error(errMsg);
          Object.assign(thrownError, { cause: error });
          throw thrownError;
        }
      } else if (selectedPhotoFile) {
        try {
          const sizeMB = selectedPhotoFile.size / (1024 * 1024);
          await updatePhoto(userId, selectedPhotoFile.name, sizeMB);
          
          try {
            const base64 = await getBase64(selectedPhotoFile);
            localStorage.setItem(`profile_avatar_${userId}`, base64);
          } catch (storageErr) {
            console.error("Erro ao salvar no localStorage", storageErr);
          }
          
          setPhotoUrl(selectedPhotoFile.name);
          setSelectedPhotoFile(null);
          if (previewPhotoUrl) {
            URL.revokeObjectURL(previewPhotoUrl);
            setPreviewPhotoUrl(null);
          }
        } catch (photoError) {
          setSelectedPhotoFile(null);
          if (previewPhotoUrl) {
            URL.revokeObjectURL(previewPhotoUrl);
            setPreviewPhotoUrl(null);
          }
          
          const error = photoError instanceof Error ? photoError : new Error(String(photoError));
          const errMsg = mapErrorMessage(error.message || "Erro ao salvar alterações.");
          setErrorMessage(errMsg);
          const thrownError = new Error(errMsg);
          Object.assign(thrownError, { cause: error });
          throw thrownError;
        }
      }

      // 3. Success feedback message logic
      let successMsg = "Alterações salvas com sucesso";
      if (isPhotoRemoved && !hasFormChanges) {
        successMsg = "Foto removida com sucesso";
      } else if (selectedPhotoFile && !hasFormChanges) {
        successMsg = "Foto atualizada com sucesso";
      } else if (hasFormChanges && !selectedPhotoFile && !isPhotoRemoved) {
        if (payload.email && !payload.name && !payload.password) {
          successMsg = "E-mail atualizado com sucesso";
        } else if (payload.password && !payload.name && !payload.email) {
          successMsg = "Senha atualizada com sucesso";
        }
      }
      
      setSuccessMessage(successMsg);
      setPassword("............");
      setIsEditingName(false);
      setIsEditingEmail(false);
      setIsEditingPassword(false);
    } catch {
      // Handled in sub-blocks
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 15) {
      setErrorMessage("Arquivo excede o tamanho permitido");
      setSelectedPhotoFile(null);
      if (previewPhotoUrl) {
        URL.revokeObjectURL(previewPhotoUrl);
        setPreviewPhotoUrl(null);
      }
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(file.type) && !["jpg", "jpeg", "png"].includes(fileExt || "")) {
      setErrorMessage("Arquivo inválido");
      setSelectedPhotoFile(null);
      if (previewPhotoUrl) {
        URL.revokeObjectURL(previewPhotoUrl);
        setPreviewPhotoUrl(null);
      }
      return;
    }

    setSelectedPhotoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPreviewPhotoUrl(previewUrl);
    setIsPhotoRemoved(false); // Reset photo removal if they select a new file
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleRemovePhotoClick = () => {
    setIsPhotoRemoved(true);
    setSelectedPhotoFile(null);
    if (previewPhotoUrl) {
      URL.revokeObjectURL(previewPhotoUrl);
      setPreviewPhotoUrl(null);
    }
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleRemoveAccountClick = () => {
    if (hasChanges) {
      setShowUnsavedModal(true);
    } else {
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteAccount(userId);

      setSuccessMessage("Conta removida com sucesso.");
      localStorage.removeItem(`profile_avatar_${userId}`);
      setShowDeleteModal(false);

      setTimeout(() => {
        onLogout();
      }, 1200);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      let msg =
        error.message || "Erro interno do servidor. Tente novamente mais tarde.";

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        msg = "Não foi possível conectar ao servidor.";
      }

      setErrorMessage(msg);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditNameClick = () => {
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const handleEditEmailClick = () => {
    setIsEditingEmail(true);
    setTimeout(() => emailInputRef.current?.focus(), 50);
  };

  const handleEditPasswordClick = () => {
    setIsEditingPassword(true);
    setTimeout(() => passwordInputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  // Intercept navigation
  const handleMenuNavigation = () => {
    if (hasChanges) {
      setShowUnsavedModal(true);
    } else {
      onGoToHome();
    }
  };

  const handleLogoutNavigation = () => {
    if (hasChanges) {
      setShowUnsavedModal(true);
    } else {
      onLogout();
    }
  };

  const handleHelpNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasChanges) {
      setShowUnsavedModal(true);
    } else {
      setShowHelpModal(true);
    }
  };

  // Helper avatar source (local preview URL first, then base64 if it's a custom file name, then Google avatar ID, fallback to default)
  const localBase64 = localStorage.getItem(`profile_avatar_${userId}`);
  const hasPhoto = photoUrl && photoUrl !== "" && photoUrl !== "null" && photoUrl !== "undefined";
  const isGoogleId = hasPhoto && (photoUrl.length > 50 || photoUrl.startsWith("http"));
  
  const avatarSource = isPhotoRemoved
    ? null
    : (previewPhotoUrl
        ? previewPhotoUrl
        : (isGoogleId
            ? (photoUrl.startsWith("http") ? photoUrl : `https://lh3.googleusercontent.com/aida-public/${photoUrl}`)
            : (localBase64 && hasPhoto
                ? localBase64
                : null)));

  return (
    <div className="font-sans antialiased min-h-screen flex bg-black text-white w-full">
      {/* Hidden File Input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoChange}
        className="hidden"
        accept=".jpg,.jpeg,.png"
      />

      {/* BEGIN: MainSidebar */}
      <aside
        className="w-72 bg-brand-dark flex flex-col h-screen fixed left-0 top-0 border-r border-brand-gold/20 p-8"
        data-purpose="main-navigation"
      >
        <div className="mb-12">
          <h1 className="text-brand-gold text-2xl font-extrabold tracking-tight">CInema</h1>
        </div>

        {/* User Mini Profile */}
        <div className="flex items-center gap-3 mb-10 p-2" data-purpose="user-sidebar-profile">
          {avatarSource ? (
            <img
              alt={name || "User"}
              className="w-10 h-10 rounded-full border border-brand-gold/50 object-cover"
              src={avatarSource}
            />
          ) : (
            <div className="w-10 h-10 rounded-full border border-brand-gold/50 bg-white" />
          )}
          <div>
            <p className="text-sm font-bold text-white leading-tight">{name || "Carregando..."}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          <button
            onClick={handleMenuNavigation}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-brand-gold transition-colors duration-200 text-left"
            type="button"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
            <span className="text-sm font-medium">Menu</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl active-nav-item text-brand-gold text-left"
            type="button"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
            <span className="text-sm font-bold">Configurações da conta</span>
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto pt-6 border-t border-brand-gold/10 space-y-2">
          <a
            onClick={handleHelpNavigation}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors duration-200"
            href="#"
          >
            <svg
              className="w-5 h-5 text-brand-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
            <span className="text-sm">Central de ajuda</span>
          </a>
          
          <button
            onClick={handleRemoveAccountClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 text-left"
            type="button"
          >
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span className="text-sm">Remover conta</span>
          </button>
          
          <button
            onClick={handleLogoutNavigation}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors duration-200 text-left"
            type="button"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
            <span className="text-sm">Sair da conta</span>
          </button>
        </div>
      </aside>
      {/* END: MainSidebar */}

      {/* BEGIN: MainContent */}
      <main className="flex-1 ml-72 p-12 bg-black min-h-screen" data-purpose="account-settings-content">
        {/* Page Header */}
        <header className="mb-12">
          <h2 className="text-4xl font-extrabold text-brand-gold mb-2">Configurações da conta</h2>
          <p className="text-gray-400 text-lg">Gerencie suas informações pessoais</p>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
            <p className="text-gray-400 mt-4 font-semibold">Carregando dados da conta...</p>
          </div>
        ) : (
          <div
            className="bg-brand-dark/50 border border-brand-gold/10 rounded-3xl p-10 max-w-5xl mx-auto"
            data-purpose="settings-form-container"
          >
            {/* Feedback Alerts */}
            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-semibold flex items-center justify-between gap-2 transition-all">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{successMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="text-emerald-400 hover:text-emerald-300 focus:outline-none text-lg font-bold px-2"
                  title="Fechar"
                >
                  &times;
                </button>
              </div>
            )}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-semibold flex items-center justify-between gap-2 transition-all">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-red-400 hover:text-red-300 focus:outline-none text-lg font-bold px-2"
                  title="Fechar"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Profile Header Info */}
            <div className="flex items-center gap-8 mb-12">
              <div className="relative">
                {avatarSource ? (
                  <img
                    alt={name || "User"}
                    className="w-32 h-32 rounded-full border-4 border-brand-gold/20 object-cover shadow-2xl"
                    src={avatarSource}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-brand-gold/20 bg-white shadow-2xl" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">{name}</h3>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handlePhotoUploadClick}
                    disabled={isSaving}
                    className="bg-brand-gold text-brand-dark px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50"
                  >
                    Upload foto nova
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhotoClick}
                    disabled={isSaving || isPhotoRemoved || (!previewPhotoUrl && !photoUrl)}
                    className="border border-red-500 text-red-500 px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    Remover foto
                  </button>
                </div>
              </div>
            </div>

            {/* Settings Form (Form submission disabled, only explicit Save button submit) */}
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username Field */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                    Nome de Usuário
                  </label>
                  <div className="relative">
                    <input
                      ref={nameInputRef}
                      className={`w-full bg-black/40 border rounded-xl px-4 py-4 pr-12 text-white focus:outline-none transition-all ${
                        isEditingName ? "input-editable input-glow" : "input-locked"
                      }`}
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      readOnly={!isEditingName}
                      required
                    />
                    <button
                      type="button"
                      onClick={handleEditNameClick}
                      className="absolute right-4 top-1/2 -translate-y-1/2 input-action-btn"
                      title="Editar nome"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <input
                      ref={emailInputRef}
                      className={`w-full bg-black/40 border rounded-xl px-4 py-4 pr-12 text-white focus:outline-none transition-all ${
                        isEditingEmail ? "input-editable input-glow" : "input-locked"
                      }`}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={handleKeyDown}
                      readOnly={!isEditingEmail}
                      required
                    />
                    <button
                      type="button"
                      onClick={handleEditEmailClick}
                      className="absolute right-4 top-1/2 -translate-y-1/2 input-action-btn"
                      title="Editar e-mail"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    ref={passwordInputRef}
                    className={`w-full bg-black/40 border rounded-xl px-4 py-4 pr-20 text-white focus:outline-none transition-all ${
                      isEditingPassword ? "input-editable input-glow" : "input-locked"
                    }`}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    readOnly={!isEditingPassword}
                    onFocus={() => {
                      if (password === "............") {
                        setPassword("");
                      }
                    }}
                    onBlur={() => {
                      if (password === "") {
                        setPassword("............");
                      }
                    }}
                  />
                  {/* Eye Toggle & Edit Pencil buttons side by side */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="input-action-btn"
                      title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleEditPasswordClick}
                      className="input-action-btn"
                      title="Editar senha"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-gray-500">
                  A senha deve conter pelo menos 8 caracteres, incluindo pelo menos uma letra minúscula, uma maiúscula, um número e um dos símbolos @, $, !, %, *, ? ou &.
                </p>
              </div>

              <hr className="border-brand-gold/10 my-8" />

              {/* Form Actions */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancel}
                  className="px-8 py-3 border border-brand-gold rounded-xl text-brand-gold font-bold text-sm hover:bg-brand-gold/5 transition-colors"
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="px-8 py-3 bg-brand-gold border border-brand-gold rounded-xl text-brand-dark font-bold text-sm hover:bg-yellow-500 transition-colors shadow-lg shadow-brand-gold/20 disabled:opacity-50"
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSaving}
                >
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Info Cards Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-5xl mx-auto" data-purpose="status-cards">
          {/* Security Card */}
          <div className="bg-brand-gold p-6 rounded-[24px] flex items-center gap-5">
            <div className="bg-black p-3 rounded-xl">
              <svg
                className="h-6 w-6 text-brand-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
            <div>
              <h4 className="text-brand-dark font-extrabold text-lg leading-tight">Segurança da Conta</h4>
              <p className="text-brand-dark/70 text-sm font-medium">A autenticação de dois fatores está ativa para sua proteção.</p>
            </div>
          </div>

          {/* Dados Protegidos Card */}
          <div className="bg-brand-gold p-6 rounded-[24px] flex items-center gap-5">
            <div className="bg-black p-3 rounded-xl">
              <svg
                className="h-6 w-6 text-brand-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
            <div>
              <h4 className="text-brand-dark font-extrabold text-lg leading-tight">Dados Protegidos</h4>
              <p className="text-brand-dark/70 text-sm font-medium">Seus dados são armazenados de forma segura e utilizados apenas para funcionalidades da plataforma.</p>
            </div>
          </div>
        </div>
      </main>
      {/* END: MainContent */}

      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="catalog-modal-backdrop z-[999]">
          <div className="catalog-modal bg-brand-dark border border-brand-gold/20 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <h3 className="text-xl font-bold text-brand-gold mb-4">Alterações não salvas</h3>
            <p className="text-gray-300 mb-8">Alterações não salvas. Salve ou cancele as alterações antes de continuar.</p>
            <button
              type="button"
              onClick={() => setShowUnsavedModal(false)}
              className="w-full bg-brand-gold text-brand-dark py-3 rounded-xl font-bold text-sm hover:bg-yellow-500 transition-colors shadow-lg shadow-brand-gold/20"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="catalog-modal-backdrop z-[999]">
          <div className="catalog-modal bg-brand-dark border border-red-500/20 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <h3 className="text-xl font-bold text-red-500 mb-4">Remover conta</h3>
            <p className="text-gray-300 mb-2 font-semibold">Esta ação é permanente e não poderá ser desfeita.</p>
            <p className="text-gray-400 mb-8 text-sm">Tem certeza de que deseja remover sua conta?</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="w-1/2 border border-gray-500 text-gray-300 py-3 rounded-xl font-bold text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAccount}
                disabled={isDeleting}
                className="w-1/2 bg-red-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Removendo...</span>
                  </>
                ) : (
                  <span>Remover conta</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="catalog-modal-backdrop z-[999] flex items-center justify-center bg-black/80">
          <div className="catalog-modal bg-brand-dark border border-brand-gold/20 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl relative text-left">
            {/* Close button X in corner */}
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-brand-gold transition-colors text-xl font-semibold"
              title="Fechar"
            >
              &times;
            </button>

            <h2 className="text-2xl font-extrabold text-brand-gold mb-6 border-b border-brand-gold/10 pb-4">
              Central de Ajuda
            </h2>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 text-gray-300 text-sm">
              <section>
                <h3 className="text-lg font-bold text-white mb-2">Bem-vindo ao Vintage Cinema</h3>
                <p className="leading-relaxed">
                  Esta é a Central de Ajuda do Vintage Cinema. Aqui você encontra as principais informações para navegar pela nossa plataforma de streaming de clássicos do cinema, gerenciar seus dados de perfil e solucionar eventuais dúvidas e problemas.
                </p>
              </section>

              <section>
                <h4 className="text-md font-bold text-brand-gold mb-2">Minha Conta</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Como atualizar nome:</strong> Clique no ícone de lápis ao lado do campo "Nome de Usuário", digite o novo nome e clique em "Salvar Alterações".</li>
                  <li><strong>Como alterar e-mail:</strong> Clique no ícone de lápis ao lado do campo "E-mail", digite o novo endereço de e-mail e clique em "Salvar Alterações".</li>
                  <li><strong>Como trocar senha:</strong> Clique no ícone de lápis ao lado do campo "Nova Senha", digite a nova senha desejada e clique em "Salvar Alterações".</li>
                  <li><strong>Como atualizar foto de perfil:</strong> Clique no botão "Upload foto nova", selecione um arquivo válido (PNG, JPG, JPEG até 15MB) para ver o preview e clique em "Salvar Alterações".</li>
                </ul>
              </section>

              <section>
                <h4 className="text-md font-bold text-brand-gold mb-2">Segurança</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Requisitos mínimos de senha:</strong> Pelo menos 8 caracteres, contendo pelo menos uma letra maiúscula, uma minúscula, um número e um símbolo (@, $, !, %, *, ? ou &).</li>
                  <li><strong>Proteção de conta:</strong> Para sua segurança, a autenticação de dois fatores está ativa por padrão.</li>
                  <li><strong>Sessão expirada:</strong> Por motivos de segurança, se você ficar inativo por muito tempo ou o token expirar, a sessão será encerrada e você precisará fazer login novamente.</li>
                </ul>
              </section>

              <section>
                <h4 className="text-md font-bold text-brand-gold mb-2">Navegação</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Como acessar filmes:</strong> Na página principal, clique em qualquer título do catálogo para ver detalhes e assistir.</li>
                  <li><strong>Como acessar séries:</strong> Use as categorias e coleções organizadas na página principal.</li>
                  <li><strong>Como utilizar o menu principal:</strong> Utilize a barra de navegação no topo ou o link "Menu" na barra lateral para voltar rapidamente à página inicial.</li>
                </ul>
              </section>

              <section>
                <h4 className="text-md font-bold text-brand-gold mb-2">Problemas comuns</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>E-mail já cadastrado:</strong> Se o sistema informar que o e-mail está em uso, certifique-se de que não possui outra conta cadastrada ou utilize um e-mail diferente.</li>
                  <li><strong>Arquivo de foto inválido:</strong> Verifique se a foto está no formato correto (JPG/PNG) e se o tamanho do arquivo é menor que 15MB.</li>
                  <li><strong>Falha de conexão:</strong> Verifique seu acesso à internet. Se o problema persistir, aguarde alguns minutos e tente novamente.</li>
                  <li><strong>Como recuperar alterações:</strong> Se você fizer edições incorretas e ainda não tiver clicado em "Salvar Alterações", basta clicar no botão "Cancelar" para restaurar os dados originais.</li>
                </ul>
              </section>

              <section className="border-t border-brand-gold/10 pt-4">
                <h4 className="text-md font-bold text-brand-gold mb-2">Suporte</h4>
                <p className="leading-relaxed">
                  Caso seu problema não esteja listado ou necessite de suporte técnico direto, entre em contato com a nossa equipe de suporte pelo e-mail: <span className="text-brand-gold">suportecinema@email.com</span>. Nosso tempo médio de resposta é de até 24 horas úteis.
                </p>
              </section>
            </div>

            {/* Footer with Close Button */}
            <div className="mt-6 border-t border-brand-gold/10 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-6 py-2.5 bg-brand-gold text-brand-dark rounded-xl font-bold text-sm hover:bg-yellow-500 transition-colors shadow-lg shadow-brand-gold/20"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}