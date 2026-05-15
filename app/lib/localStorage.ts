export interface StoredUser {
  email: string;
  displayName?: string;
  selectedAccountIndex: number;
  selectedAccountData: any;
  wixData: any;
}

// Simple in-memory storage for React Native compatibility
let userStorage: StoredUser | null = null;

export const localStorage = {
  async setUser(user: StoredUser): Promise<void> {
    try {
      userStorage = user;
      // Only use web localStorage if we're actually in a web environment
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error storing user:', error);
    }
  },

  async getUser(): Promise<StoredUser | null> {
    try {
      if (userStorage) return userStorage;
      
      // Only try web localStorage if we're in a web environment
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        const userData = window.localStorage.getItem('user');
        userStorage = userData ? JSON.parse(userData) : null;
      }
      
      return userStorage;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async removeUser(): Promise<void> {
    try {
      userStorage = null;
      
      // Only use web localStorage if available
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error removing user:', error);
    }
  },

  async updateSelectedAccount(index: number, accountData: any): Promise<void> {
    try {
      if (userStorage) {
        userStorage.selectedAccountIndex = index;
        userStorage.selectedAccountData = accountData;
        await this.setUser(userStorage);
      }
    } catch (error) {
      console.error('Error updating selected account:', error);
    }
  }
};