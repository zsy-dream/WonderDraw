import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CREATION_STEPS, CREATION_STATUS } from '../utils/constants';

/**
 * 创作流程状态管理
 */
const useCreationStore = create(
  persist(
    (set, get) => ({
      // 当前用户
      currentUser: null,
      
      // 创作状态
      currentStep: CREATION_STEPS.UPLOAD,
      currentStatus: CREATION_STATUS.IDLE,
      originalImage: null,
      enhancedImage: null,
      animation: null,
      story: null,
      artworkId: null,
      creationId: null,
      isProcessing: false,
      error: null,
      progress: 0,
      
      // 作品列表
      creations: [],
      totalCreations: 0,
      
      // UI 状态
      showLoginModal: false,

      // 用户操作
      setCurrentUser: (user) => set({ currentUser: user }),
      
      clearCurrentUser: () => set({ currentUser: null }),
      
      setShowLoginModal: (show) => set({ showLoginModal: show }),

      // 创作流程操作
      setStep: (step) => set({ currentStep: step }),
      
      setStatus: (status) => set({ currentStatus: status }),

      setOriginalImage: (image) => set({ originalImage: image }),

      setEnhancedImage: (image) => set({ enhancedImage: image }),

      setAnimation: (video) => set({ animation: video }),

      setStory: (text) => set({ story: text }),

      setArtworkId: (id) => set({ artworkId: id }),

      setCreationId: (id) => set({ creationId: id }),

      setProcessing: (isProcessing) => set({ isProcessing }),

      setError: (error) => set({ error }),

      setProgress: (progress) => set({ progress }),
      
      // 作品列表操作
      setCreations: (creations, total = null) => set({ 
        creations, 
        totalCreations: total !== null ? total : creations.length 
      }),
      
      addCreation: (creation) => set((state) => ({
        creations: [creation, ...state.creations],
        totalCreations: state.totalCreations + 1
      })),
      
      updateCreation: (creationId, updates) => set((state) => ({
        creations: state.creations.map(creation => 
          creation.id === creationId ? { ...creation, ...updates } : creation
        )
      })),

      // 重置创作状态
      resetCreation: () => {
        set({
          currentStep: CREATION_STEPS.UPLOAD,
          currentStatus: CREATION_STATUS.IDLE,
          originalImage: null,
          enhancedImage: null,
          animation: null,
          story: null,
          artworkId: null,
          creationId: null,
          isProcessing: false,
          error: null,
          progress: 0,
        });
      },

      // 获取当前创作数据
      getCreationData: () => {
        const state = get();
        return {
          originalImage: state.originalImage,
          enhancedImage: state.enhancedImage,
          animation: state.animation,
          story: state.story,
          artworkId: state.artworkId,
          creationId: state.creationId,
          currentStep: state.currentStep,
          currentStatus: state.currentStatus,
        };
      },
      
      // 检查是否已登录
      isLoggedIn: () => {
        const state = get();
        return !!state.currentUser;
      },
      
      // 获取当前用户 ID
      getCurrentUserId: () => {
        const state = get();
        return state.currentUser?.id;
      },
    }),
    {
      name: 'creation-store',
      // 只持久化用户信息，创作状态不持久化
      partialize: (state) => ({
        currentUser: state.currentUser,
      }),
    }
  )
);

export default useCreationStore;
