// API Keys for Localizer API
export const API_KEYS = {
  // Authentication
  AUTH: {
    LOGIN: "AUTH_LOGIN",
    LOGOUT: "AUTH_LOGOUT",
  },

  // Cards
  CARDS: {
    GET_ALL: "CARDS_GET_ALL",
    GET_BY_ID: "CARDS_GET_BY_ID",
    CREATE: "CARDS_CREATE",
    UPDATE: "CARDS_UPDATE",
    DELETE: "CARDS_DELETE",
  },

  // Reviews/Ratings (Legislations)
  REVIEWS: {
    GET_ALL: "REVIEWS_GET_ALL",
    GET_BY_ID: "REVIEWS_GET_BY_ID",
    CREATE: "REVIEWS_CREATE",
    UPDATE: "REVIEWS_UPDATE",
    DELETE: "REVIEWS_DELETE",
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "login",
    LOGOUT: "logout",
  },

  // Cards
  CARDS: {
    BASE: "cards",
    BY_ID: (id: string | number) => `cards/${id}`,
  },

  // Reviews/Ratings (Legislations)
  REVIEWS: {
    BASE: "legislations",
    BY_ID: (id: string | number) => `legislations/${id}`,
  },
};
