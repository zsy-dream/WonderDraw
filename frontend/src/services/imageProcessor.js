/**
 * 智能图片处理和视频生成服务
 * 使用Canvas API和WebGL实现客户端图片处理
 * 模拟AI增强效果
 */

class ImageProcessor {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.processingQueue = [];
    this.isProcessing = false;
  }

  // 图片加载
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // 获取图片数据
  async getImageData(image) {
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    this.ctx.drawImage(image, 0, 0);
    return this.ctx.getImageData(0, 0, image.width, image.height);
  }

  // 设置图片数据
  async putImageData(imageData) {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;
    this.ctx.putImageData(imageData, 0, 0);
    return this.canvas.toDataURL('image/jpeg', 0.9);
  }

  // AI图片增强 - 模拟智能优化
  async enhanceImage(imageSrc, options = {}) {
    const {
      brightness = 1.2,
      contrast = 1.1,
      saturation = 1.3,
      sharpen = true,
      denoise = true
    } = options;

    try {
      const image = await this.loadImage(imageSrc);
      let imageData = await this.getImageData(image);
      const data = imageData.data;

      // 亮度调整
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * brightness);     // R
        data[i + 1] = Math.min(255, data[i + 1] * brightness); // G
        data[i + 2] = Math.min(255, data[i + 2] * brightness); // B
      }

      // 对比度调整
      const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));
      for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
      }

      // 饱和度调整
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
        data[i] = Math.min(255, gray + saturation * (data[i] - gray));
        data[i + 1] = Math.min(255, gray + saturation * (data[i + 1] - gray));
        data[i + 2] = Math.min(255, gray + saturation * (data[i + 2] - gray));
      }

      // 锐化处理
      if (sharpen) {
        imageData = this.applySharpen(imageData);
      }

      // 降噪处理
      if (denoise) {
        imageData = this.applyDenoise(imageData);
      }

      const enhancedSrc = await this.putImageData(imageData);
      
      return {
        success: true,
        enhancedImage: enhancedSrc,
        processingTime: Date.now(),
        appliedEffects: { brightness, contrast, saturation, sharpen, denoise }
      };
    } catch (error) {
      console.error('Image enhancement failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 锐化滤镜
  applySharpen(imageData) {
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    return this.applyConvolution(imageData, kernel);
  }

  // 降噪滤镜
  applyDenoise(imageData) {
    const kernel = [
      1/9, 1/9, 1/9,
      1/9, 1/9, 1/9,
      1/9, 1/9, 1/9
    ];
    return this.applyConvolution(imageData, kernel);
  }

  // 卷积运算
  applyConvolution(imageData, kernel) {
    const src = imageData.data;
    const sw = imageData.width;
    const sh = imageData.height;
    const w = sw;
    const h = sh;

    const output = new Uint8ClampedArray(src.length);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dstOff = (y * w + x) * 4;
        let r = 0, g = 0, b = 0;

        for (let cy = 0; cy < 3; cy++) {
          for (let cx = 0; cx < 3; cx++) {
            const scy = y + cy - 1;
            const scx = x + cx - 1;

            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              const srcOff = (scy * sw + scx) * 4;
              const wt = kernel[cy * 3 + cx];
              r += src[srcOff] * wt;
              g += src[srcOff + 1] * wt;
              b += src[srcOff + 2] * wt;
            }
          }
        }

        output[dstOff] = r;
        output[dstOff + 1] = g;
        output[dstOff + 2] = b;
        output[dstOff + 3] = 255;
      }
    }

    return new ImageData(output, w, h);
  }

  // 风格化处理
  async applyStyle(imageSrc, style = 'cartoon') {
    try {
      const image = await this.loadImage(imageSrc);
      let imageData = await this.getImageData(image);

      switch (style) {
        case 'cartoon':
          imageData = this.cartoonEffect(imageData);
          break;
        case 'oil_painting':
          imageData = this.oilPaintingEffect(imageData);
          break;
        case 'watercolor':
          imageData = this.watercolorEffect(imageData);
          break;
        case 'sketch':
          imageData = this.sketchEffect(imageData);
          break;
        default:
          throw new Error('Unknown style: ' + style);
      }

      const styledSrc = await this.putImageData(imageData);
      
      return {
        success: true,
        styledImage: styledSrc,
        style: style,
        processingTime: Date.now()
      };
    } catch (error) {
      console.error('Style application failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 卡通效果
  cartoonEffect(imageData) {
    const data = imageData.data;
    
    // 量化颜色
    const levels = 8;
    const step = 255 / levels;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.round(data[i] / step) * step;
      data[i + 1] = Math.round(data[i + 1] / step) * step;
      data[i + 2] = Math.round(data[i + 2] / step) * step;
    }

    // 边缘检测
    const edges = this.detectEdges(imageData);
    
    // 合并边缘
    for (let i = 0; i < data.length; i += 4) {
      if (edges.data[i] < 128) {
        data[i] = data[i + 1] = data[i + 2] = 0;
      }
    }

    return imageData;
  }

  // 油画效果
  oilPaintingEffect(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const radius = 4;
    const intensity = 20;

    const output = new Uint8ClampedArray(data.length);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const intensityCount = new Array(intensity + 1).fill(0);
        const rSum = new Array(intensity + 1).fill(0);
        const gSum = new Array(intensity + 1).fill(0);
        const bSum = new Array(intensity + 1).fill(0);

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = (ny * width + nx) * 4;
              const curIntensity = Math.floor((data[idx] + data[idx + 1] + data[idx + 2]) / 3 * intensity / 255);
              
              intensityCount[curIntensity]++;
              rSum[curIntensity] += data[idx];
              gSum[curIntensity] += data[idx + 1];
              bSum[curIntensity] += data[idx + 2];
            }
          }
        }

        const maxIndex = intensityCount.indexOf(Math.max(...intensityCount));
        const dstIdx = (y * width + x) * 4;
        
        output[dstIdx] = rSum[maxIndex] / intensityCount[maxIndex];
        output[dstIdx + 1] = gSum[maxIndex] / intensityCount[maxIndex];
        output[dstIdx + 2] = bSum[maxIndex] / intensityCount[maxIndex];
        output[dstIdx + 3] = 255;
      }
    }

    return new ImageData(output, width, height);
  }

  // 水彩效果
  watercolorEffect(imageData) {
    let result = this.applyConvolution(imageData, [
      1/16, 2/16, 1/16,
      2/16, 4/16, 2/16,
      1/16, 2/16, 1/16
    ]);

    // 增加透明度变化
    const data = result.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i + 3] = 200 + Math.random() * 55; // 200-255的透明度
    }

    return result;
  }

  // 素描效果
  sketchEffect(imageData) {
    // 先转为灰度
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = gray;
    }

    // 反转颜色
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i + 1] = data[i + 2] = 255 - data[i];
    }

    // 高斯模糊
    const blurred = this.applyConvolution(imageData, [
      1/16, 2/16, 1/16,
      2/16, 4/16, 2/16,
      1/16, 2/16, 1/16
    ]);

    // 颜色减淡混合
    for (let i = 0; i < data.length; i += 4) {
      const blended = 255 - Math.min(255, (255 - data[i]) * (255 - blurred.data[i]) / 255);
      data[i] = data[i + 1] = data[i + 2] = blended;
    }

    return imageData;
  }

  // 边缘检测
  detectEdges(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(data.length);

    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let pixelX = 0;
        let pixelY = 0;

        for (let j = -1; j <= 1; j++) {
          for (let i = -1; i <= 1; i++) {
            const idx = ((y + j) * width + (x + i)) * 4;
            const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
            const kernelIdx = (j + 1) * 3 + (i + 1);
            pixelX += gray * sobelX[kernelIdx];
            pixelY += gray * sobelY[kernelIdx];
          }
        }

        const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
        const dstIdx = (y * width + x) * 4;
        
        output[dstIdx] = magnitude;
        output[dstIdx + 1] = magnitude;
        output[dstIdx + 2] = magnitude;
        output[dstIdx + 3] = 255;
      }
    }

    return new ImageData(output, width, height);
  }
}

/**
 * 视频生成器 - 使用Canvas创建动画视频
 */
class VideoGenerator {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.fps = 30;
    this.duration = 3000; // 3秒
  }

  // 从图片生成简单动画
  async generateVideoFromImage(imageSrc, animationType = 'fade') {
    try {
      const image = await this.loadImage(imageSrc);
      this.canvas.width = image.width;
      this.canvas.height = image.height;

      const frames = [];
      const totalFrames = (this.duration / 1000) * this.fps;

      for (let i = 0; i < totalFrames; i++) {
        const progress = i / totalFrames;
        const frame = await this.generateFrame(image, progress, animationType);
        frames.push(frame);
      }

      return {
        success: true,
        frames: frames,
        frameCount: frames.length,
        duration: this.duration,
        fps: this.fps,
        animationType: animationType
      };
    } catch (error) {
      console.error('Video generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 生成单帧
  async generateFrame(image, progress, animationType) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    switch (animationType) {
      case 'fade':
        this.ctx.globalAlpha = progress;
        this.ctx.drawImage(image, 0, 0);
        break;
        
      case 'zoom':
        const scale = 1 + progress * 0.5;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const width = image.width * scale;
        const height = image.height * scale;
        const x = centerX - width / 2;
        const y = centerY - height / 2;
        this.ctx.drawImage(image, x, y, width, height);
        break;
        
      case 'rotate':
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.rotate(progress * Math.PI * 2);
        this.ctx.drawImage(image, -image.width / 2, -image.height / 2);
        break;
        
      case 'slide':
        const slideX = -image.width + (image.width + this.canvas.width) * progress;
        this.ctx.drawImage(image, slideX, 0);
        break;
        
      default:
        this.ctx.drawImage(image, 0, 0);
    }

    return this.canvas.toDataURL('image/jpeg', 0.8);
  }

  // 加载图片
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // 创建GIF预览（模拟）
  async createGifPreview(frames, delay = 100) {
    // 这里应该使用真实的GIF编码库，现在返回模拟数据
    return {
      success: true,
      gifUrl: frames[0], // 返回第一帧作为预览
      frameCount: frames.length,
      delay: delay
    };
  }
}

// 创建单例实例
const imageProcessor = new ImageProcessor();
const videoGenerator = new VideoGenerator();

// 导出服务
export { imageProcessor, videoGenerator };
export default { imageProcessor, videoGenerator };
