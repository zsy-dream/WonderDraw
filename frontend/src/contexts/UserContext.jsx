import React, { createContext, useContext, useState, useEffect } from 'react';
import localDB from '../utils/localDatabase';
import { authAPI } from '../services/api';

// 用户上下文
const UserContext = createContext();

// 本地存储键（用于会话管理）
const SESSION_KEY = 'fairytales_current_session';

// 生成唯一ID
const generateId = () => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// 用户Provider组件
export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时检查登录状态
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // 初始化数据库
      await localDB.init();
      
      // 检查会话
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const user = await localDB.getUser(session.userId);
        
        if (user && session.sessionToken === user.sessionToken) {
          setCurrentUser(user);
          // 更新最后登录时间
          await localDB.saveUser({
            ...user,
            lastLoginAt: new Date().toISOString()
          });
        } else {
          // 会话无效，清除
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  // 注册
  const register = async (email, password, nickname, avatar = null) => {
    try {
      // 检查邮箱是否已存在
      const existingUser = await localDB.getUserByEmail(email);
      if (existingUser) {
        throw new Error('该邮箱已被注册');
      }

      // 同步到后端：确保后端也有这个用户
      let backendUserId = null;
      try {
        const backendResult = await authAPI.register({ nickname, email });
        if (backendResult.success && backendResult.data) {
          backendUserId = backendResult.data.id;
        }
      } catch (apiErr) {
        console.warn('后端注册同步失败, 使用本地ID:', apiErr);
      }

      // 创建新用户（优先使用后端返回的 ID）
      const userData = {
        id: backendUserId || generateId(),
        email,
        password, // 实际项目中应该加密
        nickname,
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        sessionToken: generateId(),
        profile: {
          age: null,
          grade: null,
          interests: [],
          bio: ''
        },
        stats: {
          creationsCount: 0,
          totalViews: 0,
          favoriteCount: 0
        }
      };

      // 保存到本地数据库
      await localDB.saveUser(userData);
      
      // 设置会话
      const sessionData = {
        userId: userData.id,
        sessionToken: userData.sessionToken,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

      setCurrentUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  // 登录
  const login = async (email, password) => {
    try {
      const user = await localDB.getUserByEmail(email);
      if (!user) {
        throw new Error('用户不存在');
      }

      if (user.password !== password) {
        throw new Error('密码错误');
      }

      // 同步到后端：确保后端也有这个用户
      try {
        const backendResult = await authAPI.login({ nickname: user.nickname });
        if (backendResult.success && backendResult.data) {
          // 如果后端用户 ID 与本地不同，更新本地 ID
          if (backendResult.data.id !== user.id) {
            user.id = backendResult.data.id;
          }
        }
      } catch (apiErr) {
        console.warn('后端登录同步失败:', apiErr);
      }

      // 更新会话令牌和登录时间
      const updatedUser = {
        ...user,
        sessionToken: generateId(),
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await localDB.saveUser(updatedUser);

      // 设置会话
      const sessionData = {
        userId: updatedUser.id,
        sessionToken: updatedUser.sessionToken,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

      setCurrentUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // 登出
  const logout = async () => {
    try {
      // 清除会话
      localStorage.removeItem(SESSION_KEY);
      
      // 可选：清除用户的会话令牌
      if (currentUser) {
        await localDB.saveUser({
          ...currentUser,
          sessionToken: null,
          updatedAt: new Date().toISOString()
        });
      }
      
      setCurrentUser(null);
      window.location.assign('/');
    } catch (error) {
      console.error('Logout error:', error);
      // 即使出错也要清除本地状态
      localStorage.removeItem(SESSION_KEY);
      setCurrentUser(null);
      window.location.assign('/');
    }
  };

  // 更新用户资料
  const updateProfile = async (updates) => {
    if (!currentUser) return { success: false, error: '未登录' };

    try {
      const updatedUser = {
        ...currentUser,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await localDB.saveUser(updatedUser);
      setCurrentUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  // 更新用户统计
  const updateUserStats = async (statsUpdates) => {
    if (!currentUser) return { success: false, error: '未登录' };

    try {
      const updatedUser = {
        ...currentUser,
        stats: {
          ...currentUser.stats,
          ...statsUpdates
        },
        updatedAt: new Date().toISOString()
      };

      await localDB.saveUser(updatedUser);
      setCurrentUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Stats update error:', error);
      return { success: false, error: error.message };
    }
  };

  // 删除账户
  const deleteAccount = async () => {
    if (!currentUser) return { success: false, error: '未登录' };

    try {
      // 删除用户的所有作品
      const userCreations = await localDB.getUserCreations(currentUser.id);
      for (const creation of userCreations) {
        await localDB.deleteCreation(creation.id);
      }

      // 删除用户
      await localDB.deleteUser(currentUser.id);

      // 清除会话
      localStorage.removeItem(SESSION_KEY);
      setCurrentUser(null);
      window.location.assign('/');

      return { success: true };
    } catch (error) {
      console.error('Account deletion error:', error);
      return { success: false, error: error.message };
    }
  };

  // 检查登录状态
  const isLoggedIn = () => {
    return currentUser !== null;
  };

  // 获取当前用户ID
  const getCurrentUserId = () => {
    return currentUser?.id || null;
  };

  // 刷新用户数据
  const refreshUserData = async () => {
    if (!currentUser) return;

    try {
      const freshUser = await localDB.getUser(currentUser.id);
      if (freshUser) {
        setCurrentUser(freshUser);
      }
    } catch (error) {
      console.error('User data refresh error:', error);
    }
  };

  const value = {
    currentUser,
    isLoading,
    register,
    login,
    logout,
    updateProfile,
    updateUserStats,
    deleteAccount,
    isLoggedIn,
    getCurrentUserId,
    refreshUserData,
    localDB
  };

  return (
    <UserContext.Provider value={value}>
      {!isLoading && children}
    </UserContext.Provider>
  );
}

// Hook for using user context
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// 默认导出
export default UserContext;
