/**
 * IndexedDB 本地数据库管理
 * 用于存储用户作品、设置等数据
 */

// 数据库名称和版本
const DB_NAME = 'FairyTalesDB';
const DB_VERSION = 1;

// 对象存储名称
const STORES = {
  users: 'users',
  creations: 'creations',
  settings: 'settings',
  cache: 'cache'
};

class LocalDatabase {
  constructor() {
    this.db = null;
    this.isReady = false;
  }

  // 初始化数据库
  async init() {
    if (this.isReady) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Database error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isReady = true;
        console.log('Database initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 创建用户存储
        if (!db.objectStoreNames.contains(STORES.users)) {
          const userStore = db.createObjectStore(STORES.users, { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
          userStore.createIndex('nickname', 'nickname', { unique: false });
        }

        // 创建作品存储
        if (!db.objectStoreNames.contains(STORES.creations)) {
          const creationStore = db.createObjectStore(STORES.creations, { keyPath: 'id' });
          creationStore.createIndex('userId', 'userId', { unique: false });
          creationStore.createIndex('createdAt', 'createdAt', { unique: false });
          creationStore.createIndex('title', 'title', { unique: false });
        }

        // 创建设置存储
        if (!db.objectStoreNames.contains(STORES.settings)) {
          db.createObjectStore(STORES.settings, { keyPath: 'key' });
        }

        // 创建缓存存储
        if (!db.objectStoreNames.contains(STORES.cache)) {
          const cacheStore = db.createObjectStore(STORES.cache, { keyPath: 'key' });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        console.log('Database schema created');
      };
    });
  }

  // 确保数据库已初始化
  async ensureReady() {
    if (!this.isReady) {
      await this.init();
    }
  }

  // 通用操作：添加或更新
  async put(storeName, data) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 通用操作：获取单个记录
  async get(storeName, key) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 通用操作：获取所有记录
  async getAll(storeName, query = null, count = null) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll(query, count);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 通用操作：删除记录
  async delete(storeName, key) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 通用操作：清空存储
  async clear(storeName) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 通用操作：通过索引查询
  async indexGet(storeName, indexName, key) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 通用操作：通过索引获取所有匹配记录
  async indexGetAll(storeName, indexName, key = null, count = null) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(key, count);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ========== 用户相关操作 ==========
  
  // 保存用户信息
  async saveUser(userData) {
    return this.put(STORES.users, {
      ...userData,
      updatedAt: new Date().toISOString()
    });
  }

  // 获取用户信息
  async getUser(userId) {
    return this.get(STORES.users, userId);
  }

  // 通过邮箱获取用户
  async getUserByEmail(email) {
    return this.indexGet(STORES.users, 'email', email);
  }

  // 删除用户
  async deleteUser(userId) {
    return this.delete(STORES.users, userId);
  }

  // ========== 作品相关操作 ==========

  // 保存作品
  async saveCreation(creationData) {
    const creation = {
      ...creationData,
      updatedAt: new Date().toISOString()
    };
    
    if (!creation.createdAt) {
      creation.createdAt = new Date().toISOString();
    }

    return this.put(STORES.creations, creation);
  }

  // 获取作品
  async getCreation(creationId) {
    return this.get(STORES.creations, creationId);
  }

  // 获取用户的所有作品
  async getUserCreations(userId, limit = null) {
    return this.indexGetAll(STORES.creations, 'userId', userId, limit);
  }

  // 获取所有作品（带分页）
  async getAllCreations(offset = 0, limit = 50) {
    const allCreations = await this.getAll(STORES.creations);
    
    // 按创建时间排序
    allCreations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 分页
    return allCreations.slice(offset, offset + limit);
  }

  // 删除作品
  async deleteCreation(creationId) {
    return this.delete(STORES.creations, creationId);
  }

  // ========== 设置相关操作 ==========

  // 保存设置
  async saveSetting(key, value) {
    return this.put(STORES.settings, {
      key,
      value,
      updatedAt: new Date().toISOString()
    });
  }

  // 获取设置
  async getSetting(key, defaultValue = null) {
    const result = await this.get(STORES.settings, key);
    return result ? result.value : defaultValue;
  }

  // ========== 缓存相关操作 ==========

  // 保存缓存（带过期时间）
  async saveCache(key, data, ttl = 3600000) { // 默认1小时
    const expiresAt = Date.now() + ttl;
    return this.put(STORES.cache, {
      key,
      data,
      expiresAt
    });
  }

  // 获取缓存
  async getCache(key) {
    const result = await this.get(STORES.cache, key);
    
    if (!result) return null;
    
    // 检查是否过期
    if (Date.now() > result.expiresAt) {
      await this.delete(STORES.cache, key);
      return null;
    }
    
    return result.data;
  }

  // 清理过期缓存
  async cleanExpiredCache() {
    const allCache = await this.getAll(STORES.cache);
    const now = Date.now();
    
    for (const item of allCache) {
      if (now > item.expiresAt) {
        await this.delete(STORES.cache, item.key);
      }
    }
  }

  // ========== 统计相关操作 ==========

  // 获取数据库统计信息
  async getStats() {
    const userCount = (await this.getAll(STORES.users)).length;
    const creationCount = (await this.getAll(STORES.creations)).length;
    const cacheCount = (await this.getAll(STORES.cache)).length;
    
    return {
      userCount,
      creationCount,
      cacheCount,
      storageSize: await this.getStorageSize()
    };
  }

  // 获取存储大小（估算）
  async getStorageSize() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage,
        available: estimate.quota,
        percentage: (estimate.usage / estimate.quota * 100).toFixed(2)
      };
    }
    return null;
  }

  // ========== 导入导出 ==========

  // 导出所有数据
  async exportData() {
    const users = await this.getAll(STORES.users);
    const creations = await this.getAll(STORES.creations);
    const settings = await this.getAll(STORES.settings);
    
    return {
      version: DB_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        users,
        creations,
        settings
      }
    };
  }

  // 导入数据
  async importData(exportedData) {
    if (!exportedData.data) {
      throw new Error('Invalid export data format');
    }

    const { users, creations, settings } = exportedData.data;

    // 清空现有数据
    await this.clear(STORES.users);
    await this.clear(STORES.creations);
    await this.clear(STORES.settings);

    // 导入新数据
    for (const user of users) {
      await this.saveUser(user);
    }
    for (const creation of creations) {
      await this.saveCreation(creation);
    }
    for (const setting of settings) {
      await this.saveSetting(setting.key, setting.value);
    }

    console.log('Data imported successfully');
  }
}

// 创建单例实例
const localDB = new LocalDatabase();

// 导出实例和常量
export default localDB;
export { STORES, DB_NAME, DB_VERSION };
