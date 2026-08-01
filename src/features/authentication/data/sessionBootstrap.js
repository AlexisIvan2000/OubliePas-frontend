import { ApiError } from "../../../core/network/ApiError";
import { setRefreshHandler } from "../../../core/network/httpClient";
import { getRefreshToken, setTokens } from "../../../core/network/tokenStorage";
import { refreshSession } from "./authApi";

export function installSessionRefresh() {
  setRefreshHandler(async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      throw new ApiError({
        status: 401,
        code: "INVALID_REFRESH_TOKEN",
        message: "Aucune session active",
      });
    }

    const tokens = await refreshSession({ refreshToken });
    setTokens(tokens);
    return tokens.access_token;
  });
}
