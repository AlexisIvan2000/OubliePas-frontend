import { setRefreshHandler } from "../../../core/network/httpClient";
import { setTokens } from "../../../core/network/tokenStorage";
import { refreshSession } from "./authApi";

export function installSessionRefresh() {
  setRefreshHandler(async () => {
    const tokens = await refreshSession();
    setTokens(tokens);
    return tokens.access_token;
  });
}
