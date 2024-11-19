---
title: Vue3 + vite 实用依赖与配置
date: 2024-05-24
info: Vue3 + vite 实用依赖与配置
tags:
  - Vue
  - Vite
---

# Vue3 + vite 实用依赖与配置

mark一下日常 vue3 + vite 项目配置

## 1. amfe-flexible

`amfe-flexible` 是一个用于移动端适配的库，通过动态设置 HTML 根元素的字体大小来实现响应式布局。这使得使用 rem 单位的设计能够根据屏幕尺寸自动调整，从而适应不同的设备。通常搭配 `postcss-pxtorem` 使用。

### （1）安装

```bash
yarn add amfe-flexible
```

### （2）使用

```ts
// main.ts
import 'amfe-flexible'
```

## 2. postcss-pxtorem

### （1）介绍

`postcss-pxtorem` 是一个 PostCSS 插件，用于将 CSS 中的像素（px）单位自动转换为 rem 单位。在现代前端开发中，尤其是在进行响应式设计时，使用 rem 单位能够更好地适应不同的屏幕尺寸和分辨率。

### （2）安装

```bash
yarn add postcss-pxtorem

# ts类型
yarn add @types/postcss-pxtorem
```

### （3）使用

```ts
// vite.config.ts
import postCssPxToRem from 'postcss-pxtorem'
export default defineConfig({
    ...,
    css:{
        ...,
        postcss: {
          plugins: [
            postCssPxToRem({
              rootValue: 192, // 设计稿宽度/10
              propList: ['*'], // 全部css属性都转换rem
              selectorBlackList: [],
              exclude: '/node_modules', // 忽略包文件转换rem
            }),
          ],
        },
    }
})
```

## 3. autoprefixer

### （1）介绍

`autoprefixer` 是一个 PostCSS 插件，用于自动为 CSS 属性添加不同浏览器的前缀。它基于 Can I Use 数据库，确保生成的 CSS 代码能够在目标浏览器中兼容和正常工作，从而提高代码的兼容性和稳定性。

### （2）安装

```bash
yarn add autoprefixer
```

### （3）使用

```ts
// vite.config.ts
import autoprefixer from 'autoprefixer'
export default defineConfig({
    ...,
    css:{
        ...,
        postcss: {
          plugins: [
            autoprefixer({
              overrideBrowserslist: [
                '> 1%',
                'last 2 versions',
                'Firefox ESR',
                'not dead',
              ],
              flexbox: 'no-2009',
            }),
          ],
        },
    }
})
```

## 4. rollup-plugin-visualizer

### （1）介绍

`rollup-plugin-visualizer` 是一个 Rollup 插件，用于生成打包后文件的可视化分析图。它帮助开发者了解每个模块在最终构建中的大小，识别和优化较大的依赖，从而减少打包体积，提升性能。

### （2）安装

```bash
yarn add rollup-plugin-visualizer -D
```

### （3）使用

```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'
export default defineConfig({
    ...,
    plugins: [
        ...,
        visualizer(), // 可传入配置
    ]
})
```

## 5. prettier

### （1）介绍

`prettier` 是一个代码格式化工具，支持多种编程语言。它通过统一的规则自动格式化代码，确保代码风格的一致性，提高代码的可读性和可维护性。Prettier 可以与多种编辑器和版本控制系统集成。

### （2）安装

```bash
yarn add prettier -D
```

### （3）使用

vscode安装 `Prettier - Code formatter` 拓展 + 配置Prettier默认格式化

根目录新建文件 `.prettierignore`

```bash
# 忽略目录或文件
build
dist
coverage
node_modules
public
release
.vscode

# 忽略所有 html 文件
*.html
```

根目录新建 `.prettierrc`

```json
{
  "arrowParens": "always",
  "bracketSameLine": false,
  "bracketSpacing": true,
  "embeddedLanguageFormatting": "auto",
  "htmlWhitespaceSensitivity": "css",
  "insertPragma": false,
  "jsxSingleQuote": false,
  "printWidth": 80,
  "proseWrap": "preserve",
  "quoteProps": "as-needed",
  "requirePragma": false,
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "useTabs": false,
  "vueIndentScriptAndStyle": false
}
```

## 6. terser

### （1）介绍

`terser` 是一个 JavaScript 压缩工具，用于优化和缩小 JavaScript 文件体积。它能够删除多余的代码、注释和空白，进行代码混淆，从而提高加载速度和性能。Terser 是 UglifyJS 的分支，具有更好的 ES6+ 支持。

### （2）安装

```bash
yarn add terser -D
```

### （3）使用

```ts
 // vite.config.ts
export default defineConfig({
    ...,
    build:{
        ...,
        minify: 'terser',
    	terserOptions: {
          compress: {
            drop_console: true, // 去除log
            drop_debugger: true, // 去除debugger
          },
          format: {
            comments: false, // 去除注释
          },
        },
    }
})
```

## 7. unplugin-auto-import

### （1）介绍

`unplugin-auto-import` 是一个 Vite 插件，用于自动导入项目中的常用依赖和函数。它简化了代码中的手动导入操作，减少了重复代码，提高了开发效率。插件会根据配置文件自动生成类型定义文件，确保类型安全。

### （2）安装

```bash
yarn add unplugin-auto-import -D
```

### （3）使用

```ts
 // vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'
export default defineConfig({
    ...,
    plugins:[
    	...,
    	AutoImport({
      		imports: ['vue', 'vue-router', 'pinia'],  // 配置自动导入的api
      		dts: 'src/auto-imports.d.ts',
    	}),
    ]
})
```

## 8. unplugin-vue-components

### （1）介绍

`unplugin-vue-components` 是一个 Vite 插件，用于自动导入和注册 Vue 组件。它通过扫描项目中的组件文件，自动生成组件的导入语句，避免了手动注册组件的繁琐操作，从而提升开发效率和代码可读性。

### （2）安装

```bash
yarn add unplugin-vue-components -D
```

### （3）使用

需要配置需要导入的ui库组件，具体查看各ui库文档

```ts
 // vite.config.ts
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
export default defineConfig({
    ...,
    plugins:[
    	...,
    	Components({
      		resolvers: [NaiveUiResolver()],  // 自动导入NaiveUi的组件
      		dts: 'src/components.d.ts',
    	}),
    ]
})
```

## 9. vite-plugin-compression

### （1）介绍

`vite-plugin-compression` 是一个 Vite 插件，用于在构建过程中压缩生成的文件。它支持多种压缩算法，如 gzip 和 brotli，能够减少文件体积，提高传输效率，从而加快页面加载速度。

### （2）安装

```bash
yarn add vite-plugin-compression -D
```

### （3）使用

```ts
 // vite.config.ts
import ViteCompression from 'vite-plugin-compression'
export default defineConfig({
    ...,
    plugins:[
    	...,
    	ViteCompression({
            verbose: true, // 是否输出压缩过程log
            disable: false, // 启用或禁用压缩功能
            threshold: 10240, // 触发压缩的文件大小阈值
            algorithm: 'gzip', // Gzip 压缩算法
            ext: '.gz', // 压缩后文件的扩展名
        }),
    ]
})
```

## 10. vite-plugin-imagemin

### （1）介绍

`vite-plugin-imagemin` 是一个 Vite 插件，用于优化和压缩图片资源。它支持多种图片格式的优化，如 JPEG、PNG、GIF 和 SVG，能够显著减少图片体积，提高页面加载速度和性能。插件提供了多种配置选项，允许开发者根据需求调整优化参数。

### （2）安装

```bash
yarn add vite-plugin-imagemin -D
```

### （3）使用

```ts
 // vite.config.ts
import ViteImagemin from 'vite-plugin-imagemin'
export default defineConfig({
    ...,
    plugins:[
    	...,
    	ViteImagemin({
        	gifsicle: {
        		optimizationLevel: 7,
        		interlaced: false,
        	},
        	optipng: {
        		optimizationLevel: 7,
        	},
        	mozjpeg: {
        		quality: 80,
        	},
        	pngquant: {
        		quality: [0.8, 0.9],
                speed: 4,
        	},
        	svgo: {
        		plugins: [
        			{
                		name: 'removeViewBox',
              		},
              		{
                		name: 'removeEmptyAttrs',
                		active: false,
              		},
            	],
          	},
        }),
    ]
})
```

## 11. rollupOptions分包配置

### （1）介绍

`rollupOptions` 是vite用于配置 Rollup 构建工具的选项

### （2）使用

```ts
 // vite.config.ts
export default defineConfig({
    ...,
    build:{
    	...,
    	rollupOptions: {
        	output: {
                chunkFileNames: 'static/js/[name]-[hash].js',
                entryFileNames: 'static/js/[name]-[hash].js',
                assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
                manualChunks(id) {
                  if (id.includes('node_modules')) {
                    return id
                      .toString()
                      .split('node_modules/')[1]
                      .split('/')[0]
                      .toString()
                  }
                },
          	},
        },
    }
})
```

## End. 完整配置文件

`vite.config.ts`

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import ViteCompression from 'vite-plugin-compression'
import ViteImagemin from 'vite-plugin-imagemin'
import { visualizer } from 'rollup-plugin-visualizer'
import postCssPxToRem from 'postcss-pxtorem'
import autoprefixer from 'autoprefixer'
import path from 'path'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    visualizer(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [NaiveUiResolver()],
      dts: 'src/components.d.ts',
    }),
    ViteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    ViteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
          },
          {
            name: 'removeEmptyAttrs',
          },
        ],
      },
    }),
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString()
          }
        },
      },
    },
  },
  server: {
    port: 5260,
    host: '0.0.0.0',
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/style/public.scss";`,
        includePaths: [path.resolve(__dirname, './src/styles')],
      },
    },
    postcss: {
      plugins: [
        postCssPxToRem({
          rootValue: 247.8,
          propList: ['*'],
          selectorBlackList: [],
          exclude: '/node_modules',
        }),
        autoprefixer({
          overrideBrowserslist: ['> 1%', 'last 2 versions', 'Firefox ESR', 'not dead'],
          flexbox: 'no-2009',
        }),
      ],
    },
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, './src'),
      },
    ],
  },
})
```
