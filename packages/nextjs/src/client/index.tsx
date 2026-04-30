"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface ToriiContextType {
  user: any | null;
  accessToken: string | null;
  isLoading: boolean;
  refreshingPromise: Promise<string | null> | null;
  setRefreshingPromise: (promise: Promise<string | null> | null) => void;
  setAccessToken: (token: string | null) => void;
}

const ToriiContext = createContext<ToriiContextType>({
  user: null,
  accessToken: null,
  isLoading: true,
  refreshingPromise: null,
  setRefreshingPromise: () => {},
  setAccessToken: () => {},
});

export function ToriiProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: any | null;
}) {
  const [refreshingPromise, setRefreshingPromise] = useState<Promise<
    string | null
  > | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    session?.accessToken || null,
  );

  return (
    <ToriiContext.Provider
      value={{
        user: session?.user || null,
        accessToken,
        setAccessToken,
        isLoading: false,
        refreshingPromise,
        setRefreshingPromise,
      }}
    >
      {children}
    </ToriiContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(ToriiContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a ToriiProvider");
  }

  const {
    accessToken,
    setAccessToken,
    refreshingPromise,
    setRefreshingPromise,
  } = context;

  const getToken = useCallback(async () => {
    // If a refresh is already in progress, wait for it
    if (refreshingPromise) {
      return refreshingPromise;
    }

    // Call the new refresh endpoint
    const promise = fetch("/api/auth/refresh", { method: "POST" })
      .then(async (res) => {
        if (!res.ok) {
          setAccessToken(null);
          return null;
        }
        const data = await res.json();
        setAccessToken(data.accessToken);
        return data.accessToken as string;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        setRefreshingPromise(null);
      });

    setRefreshingPromise(promise);
    return promise;
  }, [refreshingPromise, setRefreshingPromise, setAccessToken]);

  return {
    isLoaded: !context.isLoading,
    isSignedIn: !!context.user,
    getToken,
  };
}

export function useUser() {
  const context = useContext(ToriiContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a ToriiProvider");
  }
  return {
    user: context.user,
  };
}

export function SignInButton({ children }: { children?: ReactNode }) {
  const handleSignIn = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <button onClick={handleSignIn} className="torii-signin-button">
      {children || "Sign In"}
    </button>
  );
}

export function SignUpButton({ children }: { children?: ReactNode }) {
  const handleSignUp = () => {
    window.location.href = "/api/auth/register";
  };

  return (
    <button onClick={handleSignUp} className="torii-signup-button">
      {children || "Sign Up"}
    </button>
  );
}

export function SignOutButton({ children }: { children?: ReactNode }) {
  const handleSignOut = () => {
    window.location.href = "/api/auth/logout";
  };

  return (
    <button onClick={handleSignOut} className="torii-signout-button">
      {children || "Sign Out"}
    </button>
  );
}

export function UserButton() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const initials = user.given_name
    ? user.given_name.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: "#18181b",
          color: "white",
          border: "1px solid #3f3f46",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "600",
          fontSize: "14px",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.email}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          initials
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: "0",
            width: "240px",
            backgroundColor: "white",
            border: "1px solid #e4e4e7",
            borderRadius: "12px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
            padding: "16px",
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{ fontWeight: "600", color: "#09090b", fontSize: "14px" }}
            >
              {user.given_name} {user.family_name}
            </span>
            <span
              style={{
                color: "#71717a",
                fontSize: "13px",
                wordBreak: "break-all",
              }}
            >
              {user.email}
            </span>
          </div>

          <hr style={{ borderTop: "1px solid #f4f4f5", margin: "4px 0" }} />

          <button
            onClick={() => {
              window.location.href = "/api/auth/logout";
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
