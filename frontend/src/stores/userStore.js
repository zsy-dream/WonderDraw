import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * 用户状态管理
 * 使用 localStorage 持久化
 */
const useUserStore = create(
  persist(
    (set, get) => ({
      // 状态
      userId: null,
      nickname: null,
      isLoggedIn: false,

      // 操作
      login: (userId, nickname) => {
        set({
          userId,
          nickname,
          isLoggedIn: true,
        });
      },

      logout: () => {
        set({
          userId: null,
          nickname: null,
          isLoggedIn: false,
        });
      },

      updateNickname: (nickname) => {
        set({ nickname });
      },

      // 获取用户信息
      getUserInfo: () => {
        const state = get();
        return {
          userId: state.userId,
          nickname: state.nickname,
          isLoggedIn: state.isLoggedIn,
        };
      },
    }),
    {
      name: 'tonghua-user-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useUserStore;
