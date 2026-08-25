import { AppUser, HospitalSettings, UserRole } from '../types/hospital';
import { initialHospitalSettings } from '../data/initialData';

const USERS_STORAGE_KEY = 'hospital_accounts_users_db_v1';
const CURRENT_SESSION_KEY = 'hospital_current_active_user_v1';

// Initial pre-configured seed users with hospital master settings
export const defaultSeedUsers: AppUser[] = [
  {
    id: 'USR-GOVT-001',
    fullName: 'Dr. R. K. Sharma',
    email: 'ms.hospital@gov.in',
    username: 'drsharma',
    password: 'password123',
    role: 'Medical Superintendent',
    phone: '+91 98765 43210',
    hospitalSettings: {
      ...initialHospitalSettings,
      hospitalName: 'DISTRICT HEADQUARTERS GOVERNMENT HOSPITAL',
      departmentName: 'DEPARTMENT OF HEALTH & FAMILY WELFARE',
      district: 'CENTRAL DISTRICT',
      state: 'STATE GOVERNMENT',
      registrationNo: 'HOSP/GOVT/2024/0891',
      financialYear: '2025-2026',
      medicalSuperintendent: 'Dr. R. K. Sharma, MD',
      seniorAccountant: 'Shri S. V. Nair, B.Com',
      internalAuditor: 'Smt. A. P. Deshmukh, FCA',
    },
    createdAt: '2025-04-01T09:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'USR-GOVT-002',
    fullName: 'Shri S. V. Nair',
    email: 'ddo.accounts@gov.in',
    username: 'accountant',
    password: 'password123',
    role: 'Senior Accountant / DDO',
    phone: '+91 98765 88990',
    hospitalSettings: {
      ...initialHospitalSettings,
      hospitalName: 'DISTRICT HEADQUARTERS GOVERNMENT HOSPITAL',
      departmentName: 'DEPARTMENT OF HEALTH & FAMILY WELFARE',
      district: 'CENTRAL DISTRICT',
      state: 'STATE GOVERNMENT',
      registrationNo: 'HOSP/GOVT/2024/0891',
      financialYear: '2025-2026',
    },
    createdAt: '2025-04-02T10:30:00.000Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'USR-GOVT-003',
    fullName: 'Smt. A. P. Deshmukh',
    email: 'auditor.internal@gov.in',
    username: 'auditor',
    password: 'password123',
    role: 'Internal Auditor',
    phone: '+91 98112 33445',
    hospitalSettings: {
      ...initialHospitalSettings,
      hospitalName: 'DISTRICT HEADQUARTERS GOVERNMENT HOSPITAL',
    },
    createdAt: '2025-04-05T14:15:00.000Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'USR-GOVT-004',
    fullName: 'Civil Hospital Administration',
    email: 'admin.civilhosp@gov.in',
    username: 'admin',
    password: 'admin123',
    role: 'Hospital Administrator',
    phone: '+91 98450 11223',
    hospitalSettings: {
      hospitalName: 'COMMUNITY HEALTH CENTER & CIVIL HOSPITAL',
      departmentName: 'STATE HEALTH MISSION & FAMILY WELFARE',
      district: 'METRO WEST DISTRICT',
      state: 'STATE HEALTH AUTHORITY',
      registrationNo: 'CHC/WEST/2025/1102',
      financialYear: '2026-2027',
      openingCashBalance: 150000,
      openingPettyCashBalance: 20000,
      bankOpeningBalance: 3200000,
      currencySymbol: '₹',
      medicalSuperintendent: 'Dr. Anita Joshi, MS',
      seniorAccountant: 'Shri Vikram Patil, M.Com',
      internalAuditor: 'CA Rameshwar Gupta',
    },
    createdAt: '2026-04-01T08:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
  },
];

export class AuthService {
  // Get all registered users
  static getAllUsers(): AppUser[] {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultSeedUsers));
        return defaultSeedUsers;
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultSeedUsers;
    } catch {
      return defaultSeedUsers;
    }
  }

  // Save all users
  static saveUsers(users: AppUser[]): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to localStorage', e);
    }
  }

  // Get active logged-in user
  static getCurrentUser(): AppUser | null {
    try {
      const session = localStorage.getItem(CURRENT_SESSION_KEY);
      if (session) {
        const user: AppUser = JSON.parse(session);
        // Verify user still exists in database
        const users = this.getAllUsers();
        const found = users.find((u) => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase());
        if (found) return found;
      }
      // If none set, fallback to default seed primary user
      const users = this.getAllUsers();
      if (users.length > 0) {
        localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(users[0]));
        return users[0];
      }
      return null;
    } catch {
      return defaultSeedUsers[0];
    }
  }

  // Set active user session
  static setCurrentUser(user: AppUser | null): void {
    try {
      if (user) {
        localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_SESSION_KEY);
      }
    } catch (e) {
      console.error('Error setting current user session', e);
    }
  }

  // User Login
  static login(
    usernameOrEmail: string,
    passwordAttempt: string
  ): { success: boolean; user?: AppUser; error?: string } {
    const cleanIdentifier = usernameOrEmail.trim().toLowerCase();
    const cleanPassword = passwordAttempt.trim();

    if (!cleanIdentifier || !cleanPassword) {
      return { success: false, error: 'Please provide both username/email and password.' };
    }

    const users = this.getAllUsers();
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === cleanIdentifier ||
        u.email.toLowerCase() === cleanIdentifier
    );

    if (!user) {
      return {
        success: false,
        error: 'No account found matching this username or email. Please check spelling or Sign Up.',
      };
    }

    // Password validation
    if (user.password && user.password !== cleanPassword) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Update last login timestamp
    const updatedUser: AppUser = {
      ...user,
      lastLoginAt: new Date().toISOString(),
    };

    const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
    this.saveUsers(updatedUsers);
    this.setCurrentUser(updatedUser);

    return { success: true, user: updatedUser };
  }

  // User Signup with MANDATORY Hospital Master Settings
  static signup(params: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    role: UserRole;
    phone?: string;
    hospitalSettings: HospitalSettings;
  }): { success: boolean; user?: AppUser; error?: string } {
    const { fullName, email, username, password, role, phone, hospitalSettings } = params;

    // Validate user credentials
    if (!fullName.trim()) return { success: false, error: 'Full Name / Officer Name is required.' };
    if (!email.trim() || !email.includes('@')) return { success: false, error: 'Valid Official Email Address is required.' };
    if (!username.trim()) return { success: false, error: 'Username is required.' };
    if (!password || password.length < 4) return { success: false, error: 'Password must be at least 4 characters long.' };

    // Validate Hospital Master Settings
    if (!hospitalSettings.hospitalName.trim()) {
      return { success: false, error: 'Hospital Master Setting: Hospital Name is strictly mandatory.' };
    }
    if (!hospitalSettings.departmentName.trim()) {
      return { success: false, error: 'Hospital Master Setting: Department Name is strictly mandatory.' };
    }
    if (!hospitalSettings.district.trim()) {
      return { success: false, error: 'Hospital Master Setting: District is strictly mandatory.' };
    }
    if (!hospitalSettings.state.trim()) {
      return { success: false, error: 'Hospital Master Setting: State is strictly mandatory.' };
    }
    if (!hospitalSettings.registrationNo.trim()) {
      return { success: false, error: 'Hospital Master Setting: Registration/Code No. is strictly mandatory.' };
    }
    if (!hospitalSettings.financialYear.trim()) {
      return { success: false, error: 'Hospital Master Setting: Financial Year is strictly mandatory.' };
    }

    const users = this.getAllUsers();
    const existing = users.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() ||
        u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (existing) {
      return {
        success: false,
        error: 'An account with this username or email already exists. Please choose a different username or log in.',
      };
    }

    // Generate unique ID
    const newId = `USR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newUser: AppUser = {
      id: newId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim(),
      password: password,
      role: role || 'Hospital Administrator',
      phone: phone?.trim() || '',
      hospitalSettings: {
        ...hospitalSettings,
        hospitalName: hospitalSettings.hospitalName.trim(),
        departmentName: hospitalSettings.departmentName.trim(),
        district: hospitalSettings.district.trim(),
        state: hospitalSettings.state.trim(),
        registrationNo: hospitalSettings.registrationNo.trim(),
        financialYear: hospitalSettings.financialYear.trim(),
        openingCashBalance: Number(hospitalSettings.openingCashBalance) || 0,
        openingPettyCashBalance: Number(hospitalSettings.openingPettyCashBalance) || 0,
        bankOpeningBalance: Number(hospitalSettings.bankOpeningBalance) || 0,
        currencySymbol: hospitalSettings.currencySymbol || '₹',
        medicalSuperintendent: hospitalSettings.medicalSuperintendent?.trim() || fullName.trim(),
        seniorAccountant: hospitalSettings.seniorAccountant?.trim() || 'Senior Accounts Officer',
        internalAuditor: hospitalSettings.internalAuditor?.trim() || 'Internal Auditor',
      },
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const newUsersList = [...users, newUser];
    this.saveUsers(newUsersList);
    this.setCurrentUser(newUser);

    return { success: true, user: newUser };
  }

  // Update Hospital Settings for a specific user
  static updateUserHospitalSettings(userId: string, settings: HospitalSettings): AppUser | null {
    const users = this.getAllUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return null;

    const updatedUser: AppUser = {
      ...users[userIndex],
      hospitalSettings: settings,
    };

    users[userIndex] = updatedUser;
    this.saveUsers(users);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      this.setCurrentUser(updatedUser);
    }

    return updatedUser;
  }

  // Google OAuth Login or Register
  static handleGoogleAuthUser(profile: {
    email: string;
    name: string;
    picture?: string;
    sub?: string;
    hospitalSettings?: HospitalSettings;
    role?: UserRole;
  }): { success: boolean; user?: AppUser; isNewUser: boolean; error?: string } {
    const cleanEmail = profile.email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, isNewUser: false, error: 'Valid Google email not received.' };
    }

    const users = this.getAllUsers();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      // Existing user found -> Update session & avatar
      const updatedUser: AppUser = {
        ...existing,
        fullName: existing.fullName || profile.name,
        avatarUrl: profile.picture || existing.avatarUrl,
        authProvider: 'google',
        lastLoginAt: new Date().toISOString(),
      };
      const updatedUsers = users.map((u) => (u.id === existing.id ? updatedUser : u));
      this.saveUsers(updatedUsers);
      this.setCurrentUser(updatedUser);
      return { success: true, user: updatedUser, isNewUser: false };
    }

    // New Google User - Check if hospital settings are provided, otherwise create with defaults
    const newId = `USR-GGL-${Date.now().toString(36).toUpperCase()}`;
    const generatedUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user_${Date.now().toString(36)}`;

    const hSettings = profile.hospitalSettings || {
      ...initialHospitalSettings,
      hospitalName: 'DISTRICT HEADQUARTERS GOVERNMENT HOSPITAL',
      departmentName: 'DEPARTMENT OF HEALTH & FAMILY WELFARE',
      district: 'CENTRAL DISTRICT',
      state: 'STATE GOVERNMENT',
      registrationNo: 'HOSP/GOVT/2026/0891',
      financialYear: '2026-2027',
      medicalSuperintendent: profile.name || 'Medical Superintendent',
    };

    const newUser: AppUser = {
      id: newId,
      fullName: profile.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      username: generatedUsername,
      role: profile.role || 'Medical Superintendent',
      avatarUrl: profile.picture,
      authProvider: 'google',
      hospitalSettings: hSettings,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const newUsersList = [...users, newUser];
    this.saveUsers(newUsersList);
    this.setCurrentUser(newUser);

    return { success: true, user: newUser, isNewUser: true };
  }

  // Logout
  static logout(): void {
    this.setCurrentUser(null);
  }
}
