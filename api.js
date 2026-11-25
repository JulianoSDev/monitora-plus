/* Small HTTP boundary: JWT stays in HttpOnly cookies; CSRF stays in memory. */
(function (root) {
  "use strict";

  class ApiError extends Error {
    constructor(message, status = 0, fields = {}) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.fields = fields;
    }
  }

  function createClient({ baseUrl, fetchImpl = globalThis.fetch, onUnauthorized = () => {}, timeoutMs = 15000 }) {
    let csrfToken = null;
    let sessionVersion = 0;

    async function request(path, { method = "GET", body } = {}) {
      method = method.toUpperCase();
      const version = sessionVersion;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(baseUrl.replace(/\/$/, "") + path, {
          method,
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
          headers: {
            ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
            ...(!["GET", "HEAD", "OPTIONS"].includes(method) && csrfToken
              ? { "X-CSRF-TOKEN": csrfToken } : {}),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
        const raw = response.status === 204 ? "" : await response.text();
        let data = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          throw new ApiError("O servidor retornou uma resposta inesperada. Atualize os dados e tente novamente.", response.status);
        }
        if (!response.ok) {
          if (
            response.status === 401 &&
            !["/auth/login", "/auth/register", "/auth/google", "/auth/google/complete", "/auth/gennera"].includes(path) &&
            version === sessionVersion
          ) {
            clearSession();
            onUnauthorized();
          }
          throw new ApiError(data.error || "Não foi possível concluir a solicitação.", response.status, data.fields || {});
        }
        if (version === sessionVersion && data.csrf_token) csrfToken = data.csrf_token;
        if (version === sessionVersion && (path === "/auth/logout" || (path === "/auth/me" && method === "DELETE"))) clearSession();
        return data;
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(["GET", "HEAD", "OPTIONS"].includes(method)
          ? "Não foi possível conectar ao servidor. Verifique sua conexão e tente atualizar os dados."
          : "Não foi possível confirmar a alteração. Atualize os dados antes de tentar novamente.");
      } finally {
        clearTimeout(timer);
      }
    }

    function clearSession() {
      csrfToken = null;
      sessionVersion += 1;
    }

    return { request, clearSession };
  }

  const exported = { createClient, ApiError };
  if (typeof module !== "undefined" && module.exports) module.exports = exported;
  else root.MonitoraAPI = exported;
})(globalThis);
