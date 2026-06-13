import {
  Api,
  type AuthResponse,
  type CreateFoodRequest,
  type DailyLogResponse,
  type DailySummaryResponse,
  type FoodResponse,
  type ProfileUpdateRequest,
  type UserLibraryResponse,
  type UserResponse,
} from "@caltrek/api-client";
import { ErrorUtils } from "./error-utils";
import type { AuthSession, MealType } from "./models";
import { MealUtils } from "./meal-utils";

type ApiResult<T> = {
  data?: T;
  error?: unknown;
  response?: Response;
};

export class CaltrekApiClient {
  private readonly api = new Api();

  constructor(
    private readonly getSession: () => AuthSession | null,
    private readonly saveSession: (session: AuthSession | null) => void,
  ) {}

  async restore(session: AuthSession) {
    const response = await this.authRequest(
      this.api.authentication.refreshSession({ body: { refreshToken: session.refreshToken } }),
    );
    this.saveAuth(response);
  }

  async login(email: string, password: string) {
    const response = await this.authRequest(
      this.api.authentication.loginUser({ body: { email, password } }),
    );
    this.saveAuth(response);
  }

  async register(email: string, password: string, displayName: string) {
    const response = await this.authRequest(
      this.api.authentication.registerUser({
        body: {
          email,
          password,
          displayName: displayName || undefined,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }),
    );
    this.saveAuth(response);
  }

  async logout() {
    const session = this.getSession();
    this.saveSession(null);
    if (session?.accessToken) {
      await this.api.authentication.logoutUser({ auth: session.accessToken });
    }
  }

  getProfile() {
    return this.request<UserResponse>((token) => this.api.users.getCurrentUser({ auth: token }));
  }

  updateProfile(profile: ProfileUpdateRequest) {
    return this.request<UserResponse>((token) =>
      this.api.users.updateCurrentUser({ auth: token, body: profile }),
    );
  }

  getLogs(date: string) {
    return this.request<DailyLogResponse[]>((token) =>
      this.api.dailyLogs.listDailyLogs({ auth: token, query: { date } }),
    );
  }

  getDailySummary(date: string) {
    return this.request<DailySummaryResponse>((token) =>
      this.api.dailyLogs.getDailySummary({ auth: token, query: { date } }),
    );
  }

  createLog(foodId: string, date: string, meal: MealType, quantity: number, unit: string) {
    return this.request<DailyLogResponse>((token) =>
      this.api.dailyLogs.createDailyLog({
        auth: token,
        body: { foodId, logDate: date, mealType: MealUtils.toApi(meal), quantity, unit },
      }),
    );
  }

  updateLog(id: string, date: string, meal: MealType, quantity: number, unit: string) {
    return this.request<DailyLogResponse>((token) =>
      this.api.dailyLogs.updateDailyLog({
        auth: token,
        path: { id },
        body: { logDate: date, mealType: MealUtils.toApi(meal), quantity, unit },
      }),
    );
  }

  deleteLog(id: string) {
    return this.request<Record<string, never>>((token) =>
      this.api.dailyLogs.deleteDailyLog({ auth: token, path: { id } }),
    );
  }

  getLibrary() {
    return this.request<UserLibraryResponse[]>((token) =>
      this.api.userLibrary.listUserLibraryEntries({ auth: token }),
    );
  }

  saveLibraryFood(
    foodId: string,
    label: string,
    favorite: boolean,
    quantity: number,
    unit: string,
  ) {
    return this.request<UserLibraryResponse>((token) =>
      this.api.userLibrary.saveUserLibraryEntry({
        auth: token,
        body: {
          foodId,
          label,
          favorite,
          defaultQuantity: quantity,
          defaultUnit: unit,
        },
      }),
    );
  }

  searchFoods(query: string) {
    return this.request<FoodResponse[]>((token) =>
      this.api.foods.searchFoods({ auth: token, query: { query, limit: 25 } }),
    );
  }

  findFoodByBarcode(barcode: string) {
    return this.request<FoodResponse>((token) =>
      this.api.foods.findFoodByBarcode({ auth: token, path: { barcode } }),
    );
  }

  createFood(food: CreateFoodRequest) {
    return this.request<FoodResponse>((token) =>
      this.api.foods.createFood({ auth: token, body: food }),
    );
  }

  updateFood(id: string, food: CreateFoodRequest) {
    return this.request<FoodResponse>((token) =>
      this.api.foods.updateFood({ auth: token, path: { id }, body: food }),
    );
  }

  private async request<T>(request: (token: string) => Promise<unknown>): Promise<T> {
    const session = this.getSession();
    if (!session) {
      throw new Error("Please sign in first.");
    }

    let result = (await request(session.accessToken)) as ApiResult<T>;
    if (result.response?.status === 401) {
      const auth = await this.authRequest(
        this.api.authentication.refreshSession({ body: { refreshToken: session.refreshToken } }),
      ).catch((error) => {
        this.saveSession(null);
        throw error;
      });
      this.saveAuth(auth);
      result = (await request(auth.accessToken)) as ApiResult<T>;
    }
    return this.unwrap(result);
  }

  private async authRequest(request: Promise<unknown>) {
    const auth = this.unwrap((await request) as ApiResult<AuthResponse>);
    if (!auth) {
      throw new Error("Authentication returned no session.");
    }
    return auth;
  }

  private unwrap<T>(result: ApiResult<T>) {
    if (result.error || (result.response && !result.response.ok)) {
      throw new Error(ErrorUtils.message(result.error));
    }
    return result.data as T;
  }

  private saveAuth(auth: AuthResponse) {
    this.saveSession({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      user: auth.user,
    });
  }
}
