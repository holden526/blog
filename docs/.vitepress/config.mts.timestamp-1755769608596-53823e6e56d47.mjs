// docs/.vitepress/config.mts
import { defineConfig } from "file:///F:/code/blog/node_modules/.pnpm/vitepress@1.4.1_@algolia+client-search@4.24.0_@types+node@22.8.7_async-validator@4.2.5_postcs_wm6wywkaezj472w5mmbvscw73i/node_modules/vitepress/dist/node/index.js";
import { pagefindPlugin } from "file:///F:/code/blog/node_modules/.pnpm/vitepress-plugin-pagefind@0.4.10_pagefind@1.1.1/node_modules/vitepress-plugin-pagefind/dist/index.mjs";
import { generateSidebar } from "file:///F:/code/blog/node_modules/.pnpm/vitepress-sidebar@1.29.0/node_modules/vitepress-sidebar/dist/index.js";
import { groupIconMdPlugin, groupIconVitePlugin } from "file:///F:/code/blog/node_modules/.pnpm/vitepress-plugin-group-icons@1.3.0/node_modules/vitepress-plugin-group-icons/dist/index.mjs";

// docs/.vitepress/utils/getReadingTime.ts
function getWords(content) {
  return content.match(/(\b[a-zA-Z0-9]+(?:['’-]?[a-zA-Z0-9]+)*\b)|([a-zA-Z0-9]+)/gu);
}
function getChinese(content) {
  return content.match(/[\u4E00-\u9FD5]/gu);
}
function getEnWordCount(content) {
  return getWords(content)?.length || 0;
}
function getCnWordCount(content) {
  return getChinese(content)?.length || 0;
}
function getReadingTime(content, cnWordPerMinute = 300, enWordPerMinute = 200) {
  const trimmedContent = content.trim();
  const enWord = getEnWordCount(trimmedContent);
  const cnWord = getCnWordCount(trimmedContent);
  const words = enWord + cnWord;
  const formattedWords = words >= 1e3 ? `${(words / 1e3).toFixed(1)}k` : words.toString();
  const readingTime = cnWord / cnWordPerMinute + enWord / enWordPerMinute;
  const readTime = Math.ceil(readingTime) || 1;
  return {
    readTime,
    words: formattedWords
  };
}

// docs/.vitepress/plugins/headerPlugin.ts
import { exec } from "child_process";
import util from "util";
var execAsync = util.promisify(exec);
function HeaderPlugin() {
  return {
    name: "header-plugin",
    enforce: "pre",
    async transform(code, id) {
      if (!id.match(/\.md\b/)) return null;
      const cleanContent = cleanMarkdownContent(code);
      const lastUpdated = await getLastUpdatedTime(id);
      const { readTime, words } = getReadingTime(cleanContent);
      code = insertReadingTimeAndWords(
        `<ArticleHeader readTime="${readTime}" words="${words}" lastUpdated="${lastUpdated}" />`,
        code
      );
      return code;
    }
  };
}
async function getLastUpdatedTime(filePath) {
  try {
    const { stdout } = await execAsync(`git log -1 --format=%cd "${filePath}"`);
    return new Date(stdout.trim()).toLocaleString();
  } catch (err) {
    console.error(`Error getting last updated time for file ${filePath}:`, err);
    return "Unknown";
  }
}
function insertReadingTimeAndWords(target, source) {
  const headerRegex = /(^#\s.+$)/m;
  return source.replace(headerRegex, `$1

${target}`);
}
function cleanMarkdownContent(content) {
  return content.replace(/^---[\s\S]+?---(\n+)?/g, "").trim().replace(/\n{3,}/g, "\n\n");
}

// docs/.vitepress/config.mts
import viteImagemin from "file:///F:/code/blog/node_modules/.pnpm/vite-plugin-imagemin@0.6.1_vite@5.4.10_@types+node@22.8.7_sass@1.80.6_/node_modules/vite-plugin-imagemin/dist/index.mjs";
import viteCompression from "file:///F:/code/blog/node_modules/.pnpm/vite-plugin-compression@0.5.1_vite@5.4.10_@types+node@22.8.7_sass@1.80.6_/node_modules/vite-plugin-compression/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "F:\\code\\blog\\docs\\.vitepress";
var fileAndStyles = {};
var autoSidebar = () => {
  let result = generateSidebar({
    documentRootPath: "/docs",
    collapseDepth: 2,
    useTitleFromFrontmatter: true,
    sortMenusByFrontmatterDate: true,
    sortMenusOrderByDescending: true
  });
  return result.map((year) => ({
    ...year,
    items: year.items.reverse()
  }));
};
var SITE_URL = "https://dddhl.cn";
var SITE_NAME = "\u5C71\u4E0D\u8BA9\u5C18\uFF0C\u5DDD\u4E0D\u8F9E\u76C8";
var DEFAULT_DESCRIPTION = "\u5FEB\u4E0D\u5FEB\u4E50\u6709\u5929\u603B\u8FC7\u53BB";
var config_default = defineConfig({
  title: "\u5C71\u4E0D\u8BA9\u5C18\uFF0C\u5DDD\u4E0D\u8F9E\u76C8",
  description: "\u5FEB\u4E0D\u5FEB\u4E50\u6709\u5929\u603B\u8FC7\u53BB",
  lang: "zh-CN",
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    [
      "script",
      {
        src: "https://events.vercount.one/js",
        defer: "defer"
      }
    ]
  ],
  // 基础 SEO 配置
  cleanUrls: true,
  lastUpdated: true,
  titleTemplate: `:title | ${SITE_NAME}`,
  sitemap: { hostname: SITE_URL },
  vite: {
    server: {
      host: "0.0.0.0"
    },
    optimizeDeps: {
      include: ["pdfjs-dist"]
    },
    plugins: [
      pagefindPlugin({
        btnPlaceholder: "\u641C\u7D22",
        placeholder: "\u641C\u7D22\u6587\u6863",
        emptyText: "\u7A7A\u7A7A\u5982\u4E5F",
        heading: "\u5171: {{searchResult}} \u6761\u7ED3\u679C",
        customSearchQuery(input) {
          return input.replace(/[\u4E00-\u9FA5]/g, " $& ").replace(/\s+/g, " ").trim();
        }
      }),
      groupIconVitePlugin(),
      HeaderPlugin(),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: "gzip",
        ext: ".gz"
      }),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: "brotliCompress",
        ext: ".br"
      }),
      viteImagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false
        },
        optipng: {
          optimizationLevel: 7
        },
        mozjpeg: {
          quality: 70
        },
        pngquant: {
          quality: [0.65, 0.8],
          speed: 4
        },
        svgo: {
          plugins: [{ name: "removeViewBox" }, { name: "removeEmptyAttrs", active: false }]
        },
        webp: {
          quality: 75
        }
      })
    ],
    ssr: {
      noExternal: ["naive-ui", "date-fns", "vueuc"]
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "../../")
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern",
          additionalData: `@use "@/docs/.vitepress/theme/styles/mixin" as *;`
        }
      }
    }
  },
  postRender(context) {
    const styleRegex = /<css-render-style>((.|\s)+)<\/css-render-style>/;
    const vitepressPathRegex = /<vitepress-path>(.+)<\/vitepress-path>/;
    const style = styleRegex.exec(context.content)?.[1];
    const vitepressPath = vitepressPathRegex.exec(context.content)?.[1];
    if (vitepressPath && style) {
      fileAndStyles[vitepressPath] = style;
    }
    context.content = context.content.replace(styleRegex, "");
    context.content = context.content.replace(vitepressPathRegex, "");
  },
  transformHtml(code, id) {
    const html = id.split("/").pop();
    if (!html) return;
    const style = fileAndStyles[`/${html}`];
    if (style) {
      return code.replace(/<\/head>/, `${style}</head>`);
    }
  },
  // 每页注入 canonical、description、OG/Twitter、JSON-LD 结构化数据
  transformHead({ pageData }) {
    const fm = pageData.frontmatter || {};
    const title = fm.title || pageData.title || SITE_NAME;
    const description = fm.description || DEFAULT_DESCRIPTION;
    const image = fm.image && (fm.image.startsWith("http") ? fm.image : SITE_URL + fm.image) || `${SITE_URL}/favicon.ico`;
    const author = fm.author || "Author";
    const tags = Array.isArray(fm.tags) ? fm.tags : fm.tags ? [fm.tags] : [];
    const draft = !!fm.draft;
    const routePath = "/" + (pageData.relativePath || "").replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, "/").replace(/\/+/, "/");
    const canonical = (SITE_URL.replace(/\/+$/, "") + routePath).replace(/\/+$/, "/");
    const ldJson = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title,
      name: title,
      description,
      image,
      author: { "@type": "Person", name: author },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/favicon.ico`
        }
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      datePublished: fm.date || void 0,
      dateModified: pageData.lastUpdated ? new Date(pageData.lastUpdated).toISOString() : void 0,
      keywords: tags.join(", ")
    };
    const head = [
      ["link", { rel: "canonical", href: canonical }],
      ["meta", { name: "description", content: description }],
      ["meta", { property: "og:type", content: "article" }],
      ["meta", { property: "og:site_name", content: SITE_NAME }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: description }],
      ["meta", { property: "og:url", content: canonical }],
      ["meta", { property: "og:image", content: image }],
      ["meta", { name: "twitter:card", content: "summary_large_image" }],
      ["meta", { name: "twitter:title", content: title }],
      ["meta", { name: "twitter:description", content: description }],
      ["meta", { name: "twitter:image", content: image }],
      ["meta", { name: "robots", content: draft ? "noindex, nofollow" : "index, follow" }],
      ["script", { type: "application/ld+json" }, JSON.stringify(ldJson)]
    ];
    if (tags.length) head.push(["meta", { name: "keywords", content: tags.join(", ") }]);
    return head;
  },
  themeConfig: {
    outline: [2, 6],
    outlineTitle: "\u6587\u7AE0\u76EE\u5F55",
    docFooter: {
      prev: "\u4E0A\u4E00\u7BC7",
      next: "\u4E0B\u4E00\u7BC7"
    },
    nav: [
      { text: "\u4E3B\u9875", link: "/" },
      { text: "\u95F2\u804A", link: "/pages/comment" },
      { text: "\u5173\u4E8E", link: "/pages/about" },
      {
        text: "\u63A8\u8350",
        items: [
          {
            items: [
              { text: "\u5B9E\u7528\u7F51\u7AD9", link: "/pages/recommendation/webPage" },
              { text: "\u5DE5\u5177\u7F51\u7AD9", link: "/pages/recommendation/webTools" }
            ]
          }
        ]
      },
      {
        text: "\u5DE5\u5177",
        items: [
          {
            items: [
              { text: "Excel\u5DE5\u5177", link: "/pages/tools/excelTools" },
              { text: "\u56FE\u7247\u5DE5\u5177", link: "/pages/tools/picTools" },
              { text: "PDF\u5DE5\u5177", link: "/pages/tools/pdfTools" }
            ]
          }
        ]
      }
    ],
    sidebar: autoSidebar(),
    socialLinks: [
      { icon: "github", link: "https://github.com/holden526" },
      {
        icon: {
          svg: `
            <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" viewBox="0 0 32 32">
              <g clip-path="circle(50%)">
                <image width="32" height="32" x="0" y="0" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAEyUExURfxVMfx0V/2lkv3Et/7Rx/7Ow/25qvySe/xePPyDaf7b0/////729f2unPxbOPxaN/2+sP7+/v7i3PxlRfxdO/7Xzv7n4v2wn/3Asv7t6v28rvxWM/3OxP7r5/yIb/xXNP2ZhP718/7Pxf2kkP7h2/xkQ/xvUf7r5vyOdvxmRf749/708fxpSvxfPfxwUv2yov2diP7y7/7v7PxZNvx/ZP21pfyHbf2/sfxnR/7OxP79/f7Syf77+/3Lv/22pvx5XP2rmvxhQP77+vxjQvxsTfyJcfxWMv7WzvxhP/yAZf708vxmRv7z8P2bhvxiQPxYNf3Dtv729PyEav76+v7o4/7Z0f7Uy/7g2v759/7v6/x+Y/2woP7z8f7u6v2qmf2qmP3Ctv7Mwf27rf2hjfx6XvxXM5v88O4AAAABYktHRAsf18TAAAAAB3RJTUUH6AsPBS4hWNXJkQAAAQBJREFUOMtjYBh0gJGJmYWVjZ0DhzQnFzcE8PDyYZHmFxDkhgMhYQx5EVGQhJiAuIQkiCGFLi8tAxSVlQMx5RUUubmV0BUoA+VVVKEcNXVBDTR5TS1ubm0dOFdXD90AfaABBnj8L2/IzW1kjEeBCdAAU3whyARUYIZPgTlQgQU+BZbc3FbS+BRYc3Pb4JNnsAVaIYJPgR1QgT0+BexABQ74FDg6cXMbOiMJuLi6oaoQABrh7gHnenpxi6Mq8PYBxbavH4jtbxJgxc0diGZJUDAomQiGhIaFR4DTVAi6MzwjuZGBURSGQz2iY+DSsXG62PzCHxSfoGSdmJScksowmAAAr2Ab+wezZ1oAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjQtMTEtMTVUMDU6NDY6MzMrMDA6MDAAyPURAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDI0LTExLTE1VDA1OjQ2OjMzKzAwOjAwcZVNrQAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyNC0xMS0xNVQwNTo0NjozMyswMDowMCaAbHIAAAAASUVORK5C"/>
              </g>
            </svg>`
        },
        link: "https://blog.csdn.net/DDDHL_"
      },
      {
        icon: {
          svg: `
          <svg height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fill-rule="evenodd"><circle cx="16" cy="16" fill="#c71d23" r="16"/>
              <path d="m24.0987698 14.2225144h-9.0863697c-.4362899.000207-.7900048.3538292-.790326.7901191l-.0005173 1.9752185c-.0003277.4363707.353328.7902117.7896987.790326.0000712 0 .0001424 0 .0002135-.0002135l5.5317648-.0000461c.4363708-.0000102.7901221.3537352.7901257.790106 0 .0000022 0 .0000044-.0000066.0000066v.1975077.1975318c0 1.3091122-1.0612451 2.3703573-2.3703573 2.3703573h-7.5067195c-.4363081-.0000218-.790009-.353713-.7900429-.7900211l-.0002069-7.5059917c-.0001014-1.3091122 1.0611145-2.3703865 2.3702267-2.3704226.0000217 0 .0000435 0 .0000653.0000653h11.0602463c.4361793-.0004902.7898484-.35394.7906091-.79011894l.0012251-1.97521881c.0007606-.43637034-.3527683-.79033806-.7891389-.79060871-.0001634-.0000001-.0003268-.00000015-.0004901.00048976h-11.0617654c-3.27278051 0-5.92589329 2.65311278-5.92589329 5.9258933v11.0612755c0 .4363707.35374837.7901191.7901191.7901191h11.65447149c2.9454379 0 5.3331872-2.3877493 5.3331872-5.3331872v-4.5430682c0-.4363707-.3537484-.7901191-.7901191-.7901191z" fill="#fff"/>
            </g>
          </svg>`
        },
        link: "https://gitee.com/holden526"
      }
    ]
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin);
    },
    headers: {
      level: [1, 2, 3]
    },
    toc: {
      level: [1, 2, 3]
    }
  }
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiZG9jcy8udml0ZXByZXNzL2NvbmZpZy5tdHMiLCAiZG9jcy8udml0ZXByZXNzL3V0aWxzL2dldFJlYWRpbmdUaW1lLnRzIiwgImRvY3MvLnZpdGVwcmVzcy9wbHVnaW5zL2hlYWRlclBsdWdpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkY6XFxcXGNvZGVcXFxcYmxvZ1xcXFxkb2NzXFxcXC52aXRlcHJlc3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkY6XFxcXGNvZGVcXFxcYmxvZ1xcXFxkb2NzXFxcXC52aXRlcHJlc3NcXFxcY29uZmlnLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRjovY29kZS9ibG9nL2RvY3MvLnZpdGVwcmVzcy9jb25maWcubXRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXByZXNzJ1xyXG5pbXBvcnQgeyBwYWdlZmluZFBsdWdpbiB9IGZyb20gJ3ZpdGVwcmVzcy1wbHVnaW4tcGFnZWZpbmQnXHJcbmltcG9ydCB7IGdlbmVyYXRlU2lkZWJhciB9IGZyb20gJ3ZpdGVwcmVzcy1zaWRlYmFyJ1xyXG5pbXBvcnQgeyBncm91cEljb25NZFBsdWdpbiwgZ3JvdXBJY29uVml0ZVBsdWdpbiB9IGZyb20gJ3ZpdGVwcmVzcy1wbHVnaW4tZ3JvdXAtaWNvbnMnXHJcbmltcG9ydCB7IEhlYWRlclBsdWdpbiB9IGZyb20gJy4vcGx1Z2lucy9oZWFkZXJQbHVnaW4nXHJcbmltcG9ydCB2aXRlSW1hZ2VtaW4gZnJvbSAndml0ZS1wbHVnaW4taW1hZ2VtaW4nXHJcbmltcG9ydCB2aXRlQ29tcHJlc3Npb24gZnJvbSAndml0ZS1wbHVnaW4tY29tcHJlc3Npb24nXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmNvbnN0IGZpbGVBbmRTdHlsZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fVxyXG5cclxuY29uc3QgYXV0b1NpZGViYXIgPSAoKSA9PiB7XHJcbiAgbGV0IHJlc3VsdDogYW55ID0gZ2VuZXJhdGVTaWRlYmFyKHtcclxuICAgIGRvY3VtZW50Um9vdFBhdGg6ICcvZG9jcycsXHJcbiAgICBjb2xsYXBzZURlcHRoOiAyLFxyXG4gICAgdXNlVGl0bGVGcm9tRnJvbnRtYXR0ZXI6IHRydWUsXHJcbiAgICBzb3J0TWVudXNCeUZyb250bWF0dGVyRGF0ZTogdHJ1ZSxcclxuICAgIHNvcnRNZW51c09yZGVyQnlEZXNjZW5kaW5nOiB0cnVlLFxyXG4gIH0pXHJcbiAgcmV0dXJuIHJlc3VsdC5tYXAoKHllYXIpID0+ICh7XHJcbiAgICAuLi55ZWFyLFxyXG4gICAgaXRlbXM6IHllYXIuaXRlbXMucmV2ZXJzZSgpLFxyXG4gIH0pKVxyXG59XHJcblxyXG5jb25zdCBTSVRFX1VSTCA9ICdodHRwczovL2RkZGhsLmNuJ1xyXG5jb25zdCBTSVRFX05BTUUgPSAnXHU1QzcxXHU0RTBEXHU4QkE5XHU1QzE4XHVGRjBDXHU1REREXHU0RTBEXHU4RjlFXHU3NkM4J1xyXG5jb25zdCBERUZBVUxUX0RFU0NSSVBUSU9OID0gJ1x1NUZFQlx1NEUwRFx1NUZFQlx1NEU1MFx1NjcwOVx1NTkyOVx1NjAzQlx1OEZDN1x1NTNCQidcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgdGl0bGU6ICdcdTVDNzFcdTRFMERcdThCQTlcdTVDMThcdUZGMENcdTVERERcdTRFMERcdThGOUVcdTc2QzgnLFxyXG4gIGRlc2NyaXB0aW9uOiAnXHU1RkVCXHU0RTBEXHU1RkVCXHU0RTUwXHU2NzA5XHU1OTI5XHU2MDNCXHU4RkM3XHU1M0JCJyxcclxuICBsYW5nOiAnemgtQ04nLFxyXG4gIGhlYWQ6IFtcclxuICAgIFsnbGluaycsIHsgcmVsOiAnaWNvbicsIGhyZWY6ICcvZmF2aWNvbi5pY28nIH1dLFxyXG4gICAgW1xyXG4gICAgICAnc2NyaXB0JyxcclxuICAgICAge1xyXG4gICAgICAgIHNyYzogJ2h0dHBzOi8vZXZlbnRzLnZlcmNvdW50Lm9uZS9qcycsXHJcbiAgICAgICAgZGVmZXI6ICdkZWZlcicsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIF0sXHJcbiAgLy8gXHU1N0ZBXHU3ODQwIFNFTyBcdTkxNERcdTdGNkVcclxuICBjbGVhblVybHM6IHRydWUsXHJcbiAgbGFzdFVwZGF0ZWQ6IHRydWUsXHJcbiAgdGl0bGVUZW1wbGF0ZTogYDp0aXRsZSB8ICR7U0lURV9OQU1FfWAsXHJcbiAgc2l0ZW1hcDogeyBob3N0bmFtZTogU0lURV9VUkwgfSxcclxuICB2aXRlOiB7XHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgaG9zdDogJzAuMC4wLjAnLFxyXG4gICAgfSxcclxuICAgIG9wdGltaXplRGVwczoge1xyXG4gICAgICBpbmNsdWRlOiBbJ3BkZmpzLWRpc3QnXSxcclxuICAgIH0sXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIHBhZ2VmaW5kUGx1Z2luKHtcclxuICAgICAgICBidG5QbGFjZWhvbGRlcjogJ1x1NjQxQ1x1N0QyMicsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdcdTY0MUNcdTdEMjJcdTY1ODdcdTY4NjMnLFxyXG4gICAgICAgIGVtcHR5VGV4dDogJ1x1N0E3QVx1N0E3QVx1NTk4Mlx1NEU1RicsXHJcbiAgICAgICAgaGVhZGluZzogJ1x1NTE3MToge3tzZWFyY2hSZXN1bHR9fSBcdTY3NjFcdTdFRDNcdTY3OUMnLFxyXG4gICAgICAgIGN1c3RvbVNlYXJjaFF1ZXJ5KGlucHV0KSB7XHJcbiAgICAgICAgICByZXR1cm4gaW5wdXRcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1tcXHU0RTAwLVxcdTlGQTVdL2csICcgJCYgJylcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xccysvZywgJyAnKVxyXG4gICAgICAgICAgICAudHJpbSgpXHJcbiAgICAgICAgfSxcclxuICAgICAgfSksXHJcbiAgICAgIGdyb3VwSWNvblZpdGVQbHVnaW4oKSxcclxuICAgICAgSGVhZGVyUGx1Z2luKCksXHJcbiAgICAgIHZpdGVDb21wcmVzc2lvbih7XHJcbiAgICAgICAgdmVyYm9zZTogdHJ1ZSxcclxuICAgICAgICBkaXNhYmxlOiBmYWxzZSxcclxuICAgICAgICB0aHJlc2hvbGQ6IDEwMjQwLFxyXG4gICAgICAgIGFsZ29yaXRobTogJ2d6aXAnLFxyXG4gICAgICAgIGV4dDogJy5neicsXHJcbiAgICAgIH0pLFxyXG4gICAgICB2aXRlQ29tcHJlc3Npb24oe1xyXG4gICAgICAgIHZlcmJvc2U6IHRydWUsXHJcbiAgICAgICAgZGlzYWJsZTogZmFsc2UsXHJcbiAgICAgICAgdGhyZXNob2xkOiAxMDI0MCxcclxuICAgICAgICBhbGdvcml0aG06ICdicm90bGlDb21wcmVzcycsXHJcbiAgICAgICAgZXh0OiAnLmJyJyxcclxuICAgICAgfSksXHJcbiAgICAgIHZpdGVJbWFnZW1pbih7XHJcbiAgICAgICAgZ2lmc2ljbGU6IHtcclxuICAgICAgICAgIG9wdGltaXphdGlvbkxldmVsOiA3LFxyXG4gICAgICAgICAgaW50ZXJsYWNlZDogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBvcHRpcG5nOiB7XHJcbiAgICAgICAgICBvcHRpbWl6YXRpb25MZXZlbDogNyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1vempwZWc6IHtcclxuICAgICAgICAgIHF1YWxpdHk6IDcwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcG5ncXVhbnQ6IHtcclxuICAgICAgICAgIHF1YWxpdHk6IFswLjY1LCAwLjhdLFxyXG4gICAgICAgICAgc3BlZWQ6IDQsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdmdvOiB7XHJcbiAgICAgICAgICBwbHVnaW5zOiBbeyBuYW1lOiAncmVtb3ZlVmlld0JveCcgfSwgeyBuYW1lOiAncmVtb3ZlRW1wdHlBdHRycycsIGFjdGl2ZTogZmFsc2UgfV0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICB3ZWJwOiB7XHJcbiAgICAgICAgICBxdWFsaXR5OiA3NSxcclxuICAgICAgICB9LFxyXG4gICAgICB9KSxcclxuICAgIF0sXHJcbiAgICBzc3I6IHtcclxuICAgICAgbm9FeHRlcm5hbDogWyduYWl2ZS11aScsICdkYXRlLWZucycsICd2dWV1YyddLFxyXG4gICAgfSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8nKSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBjc3M6IHtcclxuICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICAgIHNjc3M6IHtcclxuICAgICAgICAgIGFwaTogJ21vZGVybicsXHJcbiAgICAgICAgICBhZGRpdGlvbmFsRGF0YTogYEB1c2UgXCJAL2RvY3MvLnZpdGVwcmVzcy90aGVtZS9zdHlsZXMvbWl4aW5cIiBhcyAqO2AsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBwb3N0UmVuZGVyKGNvbnRleHQpIHtcclxuICAgIGNvbnN0IHN0eWxlUmVnZXggPSAvPGNzcy1yZW5kZXItc3R5bGU+KCgufFxccykrKTxcXC9jc3MtcmVuZGVyLXN0eWxlPi9cclxuICAgIGNvbnN0IHZpdGVwcmVzc1BhdGhSZWdleCA9IC88dml0ZXByZXNzLXBhdGg+KC4rKTxcXC92aXRlcHJlc3MtcGF0aD4vXHJcbiAgICBjb25zdCBzdHlsZSA9IHN0eWxlUmVnZXguZXhlYyhjb250ZXh0LmNvbnRlbnQpPy5bMV1cclxuICAgIGNvbnN0IHZpdGVwcmVzc1BhdGggPSB2aXRlcHJlc3NQYXRoUmVnZXguZXhlYyhjb250ZXh0LmNvbnRlbnQpPy5bMV1cclxuICAgIGlmICh2aXRlcHJlc3NQYXRoICYmIHN0eWxlKSB7XHJcbiAgICAgIGZpbGVBbmRTdHlsZXNbdml0ZXByZXNzUGF0aF0gPSBzdHlsZVxyXG4gICAgfVxyXG4gICAgY29udGV4dC5jb250ZW50ID0gY29udGV4dC5jb250ZW50LnJlcGxhY2Uoc3R5bGVSZWdleCwgJycpXHJcbiAgICBjb250ZXh0LmNvbnRlbnQgPSBjb250ZXh0LmNvbnRlbnQucmVwbGFjZSh2aXRlcHJlc3NQYXRoUmVnZXgsICcnKVxyXG4gIH0sXHJcbiAgdHJhbnNmb3JtSHRtbChjb2RlLCBpZCkge1xyXG4gICAgY29uc3QgaHRtbCA9IGlkLnNwbGl0KCcvJykucG9wKClcclxuICAgIGlmICghaHRtbCkgcmV0dXJuXHJcbiAgICBjb25zdCBzdHlsZSA9IGZpbGVBbmRTdHlsZXNbYC8ke2h0bWx9YF1cclxuICAgIGlmIChzdHlsZSkge1xyXG4gICAgICByZXR1cm4gY29kZS5yZXBsYWNlKC88XFwvaGVhZD4vLCBgJHtzdHlsZX08L2hlYWQ+YClcclxuICAgIH1cclxuICB9LFxyXG4gIC8vIFx1NkJDRlx1OTg3NVx1NkNFOFx1NTE2NSBjYW5vbmljYWxcdTMwMDFkZXNjcmlwdGlvblx1MzAwMU9HL1R3aXR0ZXJcdTMwMDFKU09OLUxEIFx1N0VEM1x1Njc4NFx1NTMxNlx1NjU3MFx1NjM2RVxyXG4gIHRyYW5zZm9ybUhlYWQoeyBwYWdlRGF0YSB9KSB7XHJcbiAgICBjb25zdCBmbTogYW55ID0gcGFnZURhdGEuZnJvbnRtYXR0ZXIgfHwge31cclxuICAgIGNvbnN0IHRpdGxlID0gZm0udGl0bGUgfHwgcGFnZURhdGEudGl0bGUgfHwgU0lURV9OQU1FXHJcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGZtLmRlc2NyaXB0aW9uIHx8IERFRkFVTFRfREVTQ1JJUFRJT05cclxuICAgIGNvbnN0IGltYWdlID1cclxuICAgICAgKGZtLmltYWdlICYmIChmbS5pbWFnZS5zdGFydHNXaXRoKCdodHRwJykgPyBmbS5pbWFnZSA6IFNJVEVfVVJMICsgZm0uaW1hZ2UpKSB8fFxyXG4gICAgICBgJHtTSVRFX1VSTH0vZmF2aWNvbi5pY29gXHJcbiAgICBjb25zdCBhdXRob3IgPSBmbS5hdXRob3IgfHwgJ0F1dGhvcidcclxuICAgIGNvbnN0IHRhZ3MgPSBBcnJheS5pc0FycmF5KGZtLnRhZ3MpID8gZm0udGFncyA6IGZtLnRhZ3MgPyBbZm0udGFnc10gOiBbXVxyXG4gICAgY29uc3QgZHJhZnQgPSAhIWZtLmRyYWZ0XHJcblxyXG4gICAgLy8gXHU4QkExXHU3Qjk3IGNhbm9uaWNhbFxyXG4gICAgY29uc3Qgcm91dGVQYXRoID1cclxuICAgICAgJy8nICtcclxuICAgICAgKHBhZ2VEYXRhLnJlbGF0aXZlUGF0aCB8fCAnJylcclxuICAgICAgICAucmVwbGFjZSgvKF58XFwvKWluZGV4XFwubWQkLywgJyQxJylcclxuICAgICAgICAucmVwbGFjZSgvXFwubWQkLywgJy8nKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXC8rLywgJy8nKVxyXG4gICAgY29uc3QgY2Fub25pY2FsID0gKFNJVEVfVVJMLnJlcGxhY2UoL1xcLyskLywgJycpICsgcm91dGVQYXRoKS5yZXBsYWNlKC9cXC8rJC8sICcvJylcclxuXHJcbiAgICBjb25zdCBsZEpzb246IGFueSA9IHtcclxuICAgICAgJ0Bjb250ZXh0JzogJ2h0dHBzOi8vc2NoZW1hLm9yZycsXHJcbiAgICAgICdAdHlwZSc6ICdCbG9nUG9zdGluZycsXHJcbiAgICAgIGhlYWRsaW5lOiB0aXRsZSxcclxuICAgICAgbmFtZTogdGl0bGUsXHJcbiAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICBpbWFnZSxcclxuICAgICAgYXV0aG9yOiB7ICdAdHlwZSc6ICdQZXJzb24nLCBuYW1lOiBhdXRob3IgfSxcclxuICAgICAgcHVibGlzaGVyOiB7XHJcbiAgICAgICAgJ0B0eXBlJzogJ09yZ2FuaXphdGlvbicsXHJcbiAgICAgICAgbmFtZTogU0lURV9OQU1FLFxyXG4gICAgICAgIGxvZ286IHtcclxuICAgICAgICAgICdAdHlwZSc6ICdJbWFnZU9iamVjdCcsXHJcbiAgICAgICAgICB1cmw6IGAke1NJVEVfVVJMfS9mYXZpY29uLmljb2AsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgbWFpbkVudGl0eU9mUGFnZTogeyAnQHR5cGUnOiAnV2ViUGFnZScsICdAaWQnOiBjYW5vbmljYWwgfSxcclxuICAgICAgZGF0ZVB1Ymxpc2hlZDogZm0uZGF0ZSB8fCB1bmRlZmluZWQsXHJcbiAgICAgIGRhdGVNb2RpZmllZDogcGFnZURhdGEubGFzdFVwZGF0ZWQgPyBuZXcgRGF0ZShwYWdlRGF0YS5sYXN0VXBkYXRlZCkudG9JU09TdHJpbmcoKSA6IHVuZGVmaW5lZCxcclxuICAgICAga2V5d29yZHM6IHRhZ3Muam9pbignLCAnKSxcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBoZWFkOiBhbnkgPSBbXHJcbiAgICAgIFsnbGluaycsIHsgcmVsOiAnY2Fub25pY2FsJywgaHJlZjogY2Fub25pY2FsIH1dLFxyXG4gICAgICBbJ21ldGEnLCB7IG5hbWU6ICdkZXNjcmlwdGlvbicsIGNvbnRlbnQ6IGRlc2NyaXB0aW9uIH1dLFxyXG4gICAgICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6dHlwZScsIGNvbnRlbnQ6ICdhcnRpY2xlJyB9XSxcclxuICAgICAgWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOnNpdGVfbmFtZScsIGNvbnRlbnQ6IFNJVEVfTkFNRSB9XSxcclxuICAgICAgWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOnRpdGxlJywgY29udGVudDogdGl0bGUgfV0sXHJcbiAgICAgIFsnbWV0YScsIHsgcHJvcGVydHk6ICdvZzpkZXNjcmlwdGlvbicsIGNvbnRlbnQ6IGRlc2NyaXB0aW9uIH1dLFxyXG4gICAgICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6dXJsJywgY29udGVudDogY2Fub25pY2FsIH1dLFxyXG4gICAgICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6aW1hZ2UnLCBjb250ZW50OiBpbWFnZSB9XSxcclxuICAgICAgWydtZXRhJywgeyBuYW1lOiAndHdpdHRlcjpjYXJkJywgY29udGVudDogJ3N1bW1hcnlfbGFyZ2VfaW1hZ2UnIH1dLFxyXG4gICAgICBbJ21ldGEnLCB7IG5hbWU6ICd0d2l0dGVyOnRpdGxlJywgY29udGVudDogdGl0bGUgfV0sXHJcbiAgICAgIFsnbWV0YScsIHsgbmFtZTogJ3R3aXR0ZXI6ZGVzY3JpcHRpb24nLCBjb250ZW50OiBkZXNjcmlwdGlvbiB9XSxcclxuICAgICAgWydtZXRhJywgeyBuYW1lOiAndHdpdHRlcjppbWFnZScsIGNvbnRlbnQ6IGltYWdlIH1dLFxyXG4gICAgICBbJ21ldGEnLCB7IG5hbWU6ICdyb2JvdHMnLCBjb250ZW50OiBkcmFmdCA/ICdub2luZGV4LCBub2ZvbGxvdycgOiAnaW5kZXgsIGZvbGxvdycgfV0sXHJcbiAgICAgIFsnc2NyaXB0JywgeyB0eXBlOiAnYXBwbGljYXRpb24vbGQranNvbicgfSwgSlNPTi5zdHJpbmdpZnkobGRKc29uKV0sXHJcbiAgICBdXHJcblxyXG4gICAgaWYgKHRhZ3MubGVuZ3RoKSBoZWFkLnB1c2goWydtZXRhJywgeyBuYW1lOiAna2V5d29yZHMnLCBjb250ZW50OiB0YWdzLmpvaW4oJywgJykgfV0pXHJcbiAgICByZXR1cm4gaGVhZFxyXG4gIH0sXHJcbiAgdGhlbWVDb25maWc6IHtcclxuICAgIG91dGxpbmU6IFsyLCA2XSxcclxuICAgIG91dGxpbmVUaXRsZTogJ1x1NjU4N1x1N0FFMFx1NzZFRVx1NUY1NScsXHJcbiAgICBkb2NGb290ZXI6IHtcclxuICAgICAgcHJldjogJ1x1NEUwQVx1NEUwMFx1N0JDNycsXHJcbiAgICAgIG5leHQ6ICdcdTRFMEJcdTRFMDBcdTdCQzcnLFxyXG4gICAgfSxcclxuICAgIG5hdjogW1xyXG4gICAgICB7IHRleHQ6ICdcdTRFM0JcdTk4NzUnLCBsaW5rOiAnLycgfSxcclxuICAgICAgeyB0ZXh0OiAnXHU5NUYyXHU4MDRBJywgbGluazogJy9wYWdlcy9jb21tZW50JyB9LFxyXG4gICAgICB7IHRleHQ6ICdcdTUxNzNcdTRFOEUnLCBsaW5rOiAnL3BhZ2VzL2Fib3V0JyB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogJ1x1NjNBOFx1ODM1MCcsXHJcbiAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICB7IHRleHQ6ICdcdTVCOUVcdTc1MjhcdTdGNTFcdTdBRDknLCBsaW5rOiAnL3BhZ2VzL3JlY29tbWVuZGF0aW9uL3dlYlBhZ2UnIH0sXHJcbiAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU1REU1XHU1MTc3XHU3RjUxXHU3QUQ5JywgbGluazogJy9wYWdlcy9yZWNvbW1lbmRhdGlvbi93ZWJUb29scycgfSxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6ICdcdTVERTVcdTUxNzcnLFxyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgeyB0ZXh0OiAnRXhjZWxcdTVERTVcdTUxNzcnLCBsaW5rOiAnL3BhZ2VzL3Rvb2xzL2V4Y2VsVG9vbHMnIH0sXHJcbiAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU1NkZFXHU3MjQ3XHU1REU1XHU1MTc3JywgbGluazogJy9wYWdlcy90b29scy9waWNUb29scycgfSxcclxuICAgICAgICAgICAgICB7IHRleHQ6ICdQREZcdTVERTVcdTUxNzcnLCBsaW5rOiAnL3BhZ2VzL3Rvb2xzL3BkZlRvb2xzJyB9LFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICAgIHNpZGViYXI6IGF1dG9TaWRlYmFyKCksXHJcbiAgICBzb2NpYWxMaW5rczogW1xyXG4gICAgICB7IGljb246ICdnaXRodWInLCBsaW5rOiAnaHR0cHM6Ly9naXRodWIuY29tL2hvbGRlbjUyNicgfSxcclxuICAgICAge1xyXG4gICAgICAgIGljb246IHtcclxuICAgICAgICAgIHN2ZzogYFxyXG4gICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjMycHhcIiBoZWlnaHQ9XCIzMnB4XCIgdmlld0JveD1cIjAgMCAzMiAzMlwiPlxyXG4gICAgICAgICAgICAgIDxnIGNsaXAtcGF0aD1cImNpcmNsZSg1MCUpXCI+XHJcbiAgICAgICAgICAgICAgICA8aW1hZ2Ugd2lkdGg9XCIzMlwiIGhlaWdodD1cIjMyXCIgeD1cIjBcIiB5PVwiMFwiIHhsaW5rOmhyZWY9XCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUNBQUFBQWdDQU1BQUFCRXBJckdBQUFBSUdOSVVrMEFBSG9tQUFDQWhBQUErZ0FBQUlEb0FBQjFNQUFBNm1BQUFEcVlBQUFYY0p5NlVUd0FBQUV5VUV4VVJmeFZNZngwVi8ybGt2M0V0LzdSeC83T3cvMjVxdnlTZS94ZVBQeURhZjdiMC8vLy8vNzI5ZjJ1blB4Yk9QeGFOLzIrc1A3Ky92N2kzUHhsUmZ4ZE8vN1h6djduNHYyd24vM0Fzdjd0NnYyOHJ2eFdNLzNPeFA3cjUveUliL3hYTlAyWmhQNzE4LzdQeGYya2tQN2gyL3hrUS94dlVmN3I1dnlPZHZ4bVJmNzQ5LzcwOGZ4cFN2eGZQZnh3VXYyeW92MmRpUDd5Ny83djdQeFpOdngvWlAyMXBmeUhiZjIvc2Z4blIvN094UDc5L2Y3U3lmNzcrLzNMdi8yMnB2eDVYUDJybXZ4aFFQNzcrdnhqUXZ4c1RmeUpjZnhXTXY3V3p2eGhQL3lBWmY3MDh2eG1Sdjd6OFAyYmh2eGlRUHhZTmYzRHR2NzI5UHlFYXY3Nit2N280LzdaMGY3VXkvN2cydjc1OS83djYveCtZLzJ3b1A3ejhmN3U2djJxbWYycW1QM0N0djdNd2YyN3JmMmhqZng2WHZ4WE01djg4TzRBQUFBQllrdEhSQXNmMThUQUFBQUFCM1JKVFVVSDZBc1BCUzRoV05YSmtRQUFBUUJKUkVGVU9NdGpZQmgwZ0pHSm1ZV1ZqWjBEaHpRbkZ6Y0U4UER5WVpIbUZ4RGtoZ01oWVF4NUVWR1FoSmlBdUlRa2lDR0ZMaTh0QXhTVmxRTXg1UlVVdWJtVjBCVW9BK1ZWVktFY05YVkJEVFI1VFMxdWJtMGRPRmRYRDkwQWZhQUJCbmo4TDIvSXpXMWtqRWVCQ2RBQVUzd2h5QVJVWUlaUGdUbFFnUVUrQlpiYzNGYlMrQlJZYzNQYjRKTm5zQVZhSVlKUGdSMVFnVDArQmV4QUJRNzRGRGc2Y1hNYk9pTUp1TGk2b2FvUUFCcmg3Z0huZW5weGk2TXE4UFlCeGJhdkg0anRieEpneGMwZGlHWkpVREFvbVFpR2hJYUZSNERUVkFpNk16d2p1WkdCVVJTR1F6MmlZK0RTc1hHNjJQekNIeFNmb0dTZG1KU2Nrc293bUFBQXIyQWIrd2V6WjFvQUFBQWxkRVZZZEdSaGRHVTZZM0psWVhSbEFESXdNalF0TVRFdE1UVlVNRFU2TkRZNk16TXJNREE2TURBQXlQVVJBQUFBSlhSRldIUmtZWFJsT20xdlpHbG1lUUF5TURJMExURXhMVEUxVkRBMU9qUTJPak16S3pBd09qQXdjWlZOclFBQUFDaDBSVmgwWkdGMFpUcDBhVzFsYzNSaGJYQUFNakF5TkMweE1TMHhOVlF3TlRvME5qb3pNeXN3TURvd01DYUFiSElBQUFBQVNVVk9SSzVDXCIvPlxyXG4gICAgICAgICAgICAgIDwvZz5cclxuICAgICAgICAgICAgPC9zdmc+YCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxpbms6ICdodHRwczovL2Jsb2cuY3Nkbi5uZXQvRERESExfJyxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGljb246IHtcclxuICAgICAgICAgIHN2ZzogYFxyXG4gICAgICAgICAgPHN2ZyBoZWlnaHQ9XCIzMlwiIHZpZXdCb3g9XCIwIDAgMzIgMzJcIiB3aWR0aD1cIjMyXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxyXG4gICAgICAgICAgICA8ZyBmaWxsPVwibm9uZVwiIGZpbGwtcnVsZT1cImV2ZW5vZGRcIj48Y2lyY2xlIGN4PVwiMTZcIiBjeT1cIjE2XCIgZmlsbD1cIiNjNzFkMjNcIiByPVwiMTZcIi8+XHJcbiAgICAgICAgICAgICAgPHBhdGggZD1cIm0yNC4wOTg3Njk4IDE0LjIyMjUxNDRoLTkuMDg2MzY5N2MtLjQzNjI4OTkuMDAwMjA3LS43OTAwMDQ4LjM1MzgyOTItLjc5MDMyNi43OTAxMTkxbC0uMDAwNTE3MyAxLjk3NTIxODVjLS4wMDAzMjc3LjQzNjM3MDcuMzUzMzI4Ljc5MDIxMTcuNzg5Njk4Ny43OTAzMjYuMDAwMDcxMiAwIC4wMDAxNDI0IDAgLjAwMDIxMzUtLjAwMDIxMzVsNS41MzE3NjQ4LS4wMDAwNDYxYy40MzYzNzA4LS4wMDAwMTAyLjc5MDEyMjEuMzUzNzM1Mi43OTAxMjU3Ljc5MDEwNiAwIC4wMDAwMDIyIDAgLjAwMDAwNDQtLjAwMDAwNjYuMDAwMDA2NnYuMTk3NTA3Ny4xOTc1MzE4YzAgMS4zMDkxMTIyLTEuMDYxMjQ1MSAyLjM3MDM1NzMtMi4zNzAzNTczIDIuMzcwMzU3M2gtNy41MDY3MTk1Yy0uNDM2MzA4MS0uMDAwMDIxOC0uNzkwMDA5LS4zNTM3MTMtLjc5MDA0MjktLjc5MDAyMTFsLS4wMDAyMDY5LTcuNTA1OTkxN2MtLjAwMDEwMTQtMS4zMDkxMTIyIDEuMDYxMTE0NS0yLjM3MDM4NjUgMi4zNzAyMjY3LTIuMzcwNDIyNi4wMDAwMjE3IDAgLjAwMDA0MzUgMCAuMDAwMDY1My4wMDAwNjUzaDExLjA2MDI0NjNjLjQzNjE3OTMtLjAwMDQ5MDIuNzg5ODQ4NC0uMzUzOTQuNzkwNjA5MS0uNzkwMTE4OTRsLjAwMTIyNTEtMS45NzUyMTg4MWMuMDAwNzYwNi0uNDM2MzcwMzQtLjM1Mjc2ODMtLjc5MDMzODA2LS43ODkxMzg5LS43OTA2MDg3MS0uMDAwMTYzNC0uMDAwMDAwMS0uMDAwMzI2OC0uMDAwMDAwMTUtLjAwMDQ5MDEuMDAwNDg5NzZoLTExLjA2MTc2NTRjLTMuMjcyNzgwNTEgMC01LjkyNTg5MzI5IDIuNjUzMTEyNzgtNS45MjU4OTMyOSA1LjkyNTg5MzN2MTEuMDYxMjc1NWMwIC40MzYzNzA3LjM1Mzc0ODM3Ljc5MDExOTEuNzkwMTE5MS43OTAxMTkxaDExLjY1NDQ3MTQ5YzIuOTQ1NDM3OSAwIDUuMzMzMTg3Mi0yLjM4Nzc0OTMgNS4zMzMxODcyLTUuMzMzMTg3MnYtNC41NDMwNjgyYzAtLjQzNjM3MDctLjM1Mzc0ODQtLjc5MDExOTEtLjc5MDExOTEtLjc5MDExOTF6XCIgZmlsbD1cIiNmZmZcIi8+XHJcbiAgICAgICAgICAgIDwvZz5cclxuICAgICAgICAgIDwvc3ZnPmAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBsaW5rOiAnaHR0cHM6Ly9naXRlZS5jb20vaG9sZGVuNTI2JyxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgfSxcclxuICBtYXJrZG93bjoge1xyXG4gICAgY29uZmlnKG1kKSB7XHJcbiAgICAgIG1kLnVzZShncm91cEljb25NZFBsdWdpbilcclxuICAgIH0sXHJcbiAgICBoZWFkZXJzOiB7XHJcbiAgICAgIGxldmVsOiBbMSwgMiwgM10sXHJcbiAgICB9LFxyXG4gICAgdG9jOiB7XHJcbiAgICAgIGxldmVsOiBbMSwgMiwgM10sXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pXHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRjpcXFxcY29kZVxcXFxibG9nXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFx1dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRjpcXFxcY29kZVxcXFxibG9nXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFx1dGlsc1xcXFxnZXRSZWFkaW5nVGltZS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRjovY29kZS9ibG9nL2RvY3MvLnZpdGVwcmVzcy91dGlscy9nZXRSZWFkaW5nVGltZS50c1wiO2V4cG9ydCBmdW5jdGlvbiBnZXRXb3Jkcyhjb250ZW50OiBzdHJpbmcpOiBSZWdFeHBNYXRjaEFycmF5IHwgbnVsbCB7XHJcbiAgLy8gXHU1MzA1XHU1NDJCXHU4RkRFXHU1QjU3XHU3QjI2XHU1MzU1XHU4QkNEXHU1NDhDXHU2NTcwXHU1QjU3K1x1NUI1N1x1NkJDRFx1N0VDNFx1NTQwOFxyXG4gIHJldHVybiBjb250ZW50Lm1hdGNoKC8oXFxiW2EtekEtWjAtOV0rKD86WydcdTIwMTktXT9bYS16QS1aMC05XSspKlxcYil8KFthLXpBLVowLTldKykvZ3UpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDaGluZXNlKGNvbnRlbnQ6IHN0cmluZyk6IFJlZ0V4cE1hdGNoQXJyYXkgfCBudWxsIHtcclxuICAvLyBcdTUzMzlcdTkxNERcdTRFMkRcdTY1ODdcdTVCNTdcdTdCMjZcclxuICByZXR1cm4gY29udGVudC5tYXRjaCgvW1xcdTRFMDAtXFx1OUZENV0vZ3UpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRFbldvcmRDb3VudChjb250ZW50OiBzdHJpbmcpOiBudW1iZXIge1xyXG4gIC8vIFx1ODJGMVx1NjU4N1x1NTM1NVx1OEJDRFx1NjU3MFx1OTFDRlxyXG4gIHJldHVybiBnZXRXb3Jkcyhjb250ZW50KT8ubGVuZ3RoIHx8IDBcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENuV29yZENvdW50KGNvbnRlbnQ6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgLy8gXHU0RTJEXHU2NTg3XHU1QjU3XHU3QjI2XHU2NTcwXHU5MUNGXHJcbiAgcmV0dXJuIGdldENoaW5lc2UoY29udGVudCk/Lmxlbmd0aCB8fCAwXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRXb3JkTnVtYmVyKGNvbnRlbnQ6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgLy8gXHU2MDNCXHU1QjU3XHU2NTcwXHU3RURGXHU4QkExXHJcbiAgY29uc3QgZW5Xb3JkQ291bnQgPSBnZXRFbldvcmRDb3VudChjb250ZW50KVxyXG4gIGNvbnN0IGNuV29yZENvdW50ID0gZ2V0Q25Xb3JkQ291bnQoY29udGVudClcclxuICByZXR1cm4gZW5Xb3JkQ291bnQgKyBjbldvcmRDb3VudFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVhZGluZ1RpbWUoXHJcbiAgY29udGVudDogc3RyaW5nLFxyXG4gIGNuV29yZFBlck1pbnV0ZSA9IDMwMCwgLy8gXHU0RTJEXHU2NTg3XHU5NjA1XHU4QkZCXHU5MDFGXHU1RUE2XHU0RTNBMzAwXHU1QjU3L1x1NTIwNlx1OTQ5RlxyXG4gIGVuV29yZFBlck1pbnV0ZSA9IDIwMCAvLyBcdTgyRjFcdTY1ODdcdTk2MDVcdThCRkJcdTkwMUZcdTVFQTZcdTRFM0EyMDBcdThCQ0QvXHU1MjA2XHU5NDlGXHJcbikge1xyXG4gIGNvbnN0IHRyaW1tZWRDb250ZW50ID0gY29udGVudC50cmltKClcclxuICBjb25zdCBlbldvcmQgPSBnZXRFbldvcmRDb3VudCh0cmltbWVkQ29udGVudClcclxuICBjb25zdCBjbldvcmQgPSBnZXRDbldvcmRDb3VudCh0cmltbWVkQ29udGVudClcclxuXHJcbiAgLy8gXHU0RjE4XHU1MzE2XHU1QjU3XHU2NTcwXHU2NjNFXHU3OTNBXHU5MDNCXHU4RjkxXHJcbiAgY29uc3Qgd29yZHMgPSBlbldvcmQgKyBjbldvcmRcclxuICBjb25zdCBmb3JtYXR0ZWRXb3JkcyA9IHdvcmRzID49IDEwMDAgPyBgJHsod29yZHMgLyAxMDAwKS50b0ZpeGVkKDEpfWtgIDogd29yZHMudG9TdHJpbmcoKVxyXG5cclxuICAvLyBcdTdDQkVcdTc4NkVcdThCQTFcdTdCOTdcdTk2MDVcdThCRkJcdTY1RjZcdTk1RjRcclxuICBjb25zdCByZWFkaW5nVGltZSA9IGNuV29yZCAvIGNuV29yZFBlck1pbnV0ZSArIGVuV29yZCAvIGVuV29yZFBlck1pbnV0ZVxyXG4gIGNvbnN0IHJlYWRUaW1lID0gTWF0aC5jZWlsKHJlYWRpbmdUaW1lKSB8fCAxIC8vIFx1NEZERFx1OEJDMVx1NjcwMFx1NUMwRlx1NTAzQ1x1NEUzQTFcdTUyMDZcdTk0OUZcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHJlYWRUaW1lLFxyXG4gICAgd29yZHM6IGZvcm1hdHRlZFdvcmRzLFxyXG4gIH1cclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkY6XFxcXGNvZGVcXFxcYmxvZ1xcXFxkb2NzXFxcXC52aXRlcHJlc3NcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRjpcXFxcY29kZVxcXFxibG9nXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxwbHVnaW5zXFxcXGhlYWRlclBsdWdpbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRjovY29kZS9ibG9nL2RvY3MvLnZpdGVwcmVzcy9wbHVnaW5zL2hlYWRlclBsdWdpbi50c1wiO2ltcG9ydCB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB7IGdldFJlYWRpbmdUaW1lIH0gZnJvbSAnLi4vdXRpbHMvZ2V0UmVhZGluZ1RpbWUnXHJcbmltcG9ydCB7IGV4ZWMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJ1xyXG5pbXBvcnQgdXRpbCBmcm9tICd1dGlsJ1xyXG5jb25zdCBleGVjQXN5bmMgPSB1dGlsLnByb21pc2lmeShleGVjKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIEhlYWRlclBsdWdpbigpOiBQbHVnaW4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAnaGVhZGVyLXBsdWdpbicsXHJcbiAgICBlbmZvcmNlOiAncHJlJyxcclxuICAgIGFzeW5jIHRyYW5zZm9ybShjb2RlLCBpZCkge1xyXG4gICAgICBpZiAoIWlkLm1hdGNoKC9cXC5tZFxcYi8pKSByZXR1cm4gbnVsbFxyXG5cclxuICAgICAgY29uc3QgY2xlYW5Db250ZW50ID0gY2xlYW5NYXJrZG93bkNvbnRlbnQoY29kZSlcclxuXHJcbiAgICAgIC8vIFx1NUYwMlx1NkI2NVx1ODNCN1x1NTNENlx1NjU4N1x1NEVGNlx1NzY4NFx1NjcwMFx1OEZEMVx1NjZGNFx1NjVCMFx1NjVGNlx1OTVGNFxyXG4gICAgICBjb25zdCBsYXN0VXBkYXRlZCA9IGF3YWl0IGdldExhc3RVcGRhdGVkVGltZShpZClcclxuXHJcbiAgICAgIC8vIFx1ODNCN1x1NTNENlx1OTYwNVx1OEJGQlx1NjVGNlx1OTVGNFx1NTQ4Q1x1NUI1N1x1NjU3MFxyXG4gICAgICBjb25zdCB7IHJlYWRUaW1lLCB3b3JkcyB9ID0gZ2V0UmVhZGluZ1RpbWUoY2xlYW5Db250ZW50KVxyXG5cclxuICAgICAgLy8gXHU2M0QyXHU1MTY1XHU3RUM0XHU0RUY2XHU1MjMwXHU2NTg3XHU3QUUwXHU0RTJEXHJcbiAgICAgIGNvZGUgPSBpbnNlcnRSZWFkaW5nVGltZUFuZFdvcmRzKFxyXG4gICAgICAgIGA8QXJ0aWNsZUhlYWRlciByZWFkVGltZT1cIiR7cmVhZFRpbWV9XCIgd29yZHM9XCIke3dvcmRzfVwiIGxhc3RVcGRhdGVkPVwiJHtsYXN0VXBkYXRlZH1cIiAvPmAsXHJcbiAgICAgICAgY29kZVxyXG4gICAgICApXHJcbiAgICAgIHJldHVybiBjb2RlXHJcbiAgICB9LFxyXG4gIH1cclxufVxyXG5cclxuLy8gXHU4M0I3XHU1M0Q2XHU2NTg3XHU0RUY2XHU3Njg0XHU2NzAwXHU4RkQxXHU2NkY0XHU2NUIwXHU2NUY2XHU5NUY0XHJcbmFzeW5jIGZ1bmN0aW9uIGdldExhc3RVcGRhdGVkVGltZShmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICB0cnkge1xyXG4gICAgLy8gXHU2MjY3XHU4ODRDIGdpdCBsb2cgXHU1NDdEXHU0RUU0XHU4M0I3XHU1M0Q2XHU2NTg3XHU0RUY2XHU3Njg0XHU2NzAwXHU1NDBFXHU2M0QwXHU0RUE0XHU2NUU1XHU2NzFGXHJcbiAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgZXhlY0FzeW5jKGBnaXQgbG9nIC0xIC0tZm9ybWF0PSVjZCBcIiR7ZmlsZVBhdGh9XCJgKVxyXG4gICAgcmV0dXJuIG5ldyBEYXRlKHN0ZG91dC50cmltKCkpLnRvTG9jYWxlU3RyaW5nKClcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGdldHRpbmcgbGFzdCB1cGRhdGVkIHRpbWUgZm9yIGZpbGUgJHtmaWxlUGF0aH06YCwgZXJyKVxyXG4gICAgcmV0dXJuICdVbmtub3duJ1xyXG4gIH1cclxufVxyXG5cclxuLy8gXHU2M0QyXHU1MTY1XHU3NkVFXHU2ODA3XHU1QjU3XHU3QjI2XHU0RTMyXHU1MjMwXHU3QjJDXHU0RTAwXHU0RTJBXHU0RTAwXHU3RUE3XHU2ODA3XHU5ODk4XHU1NDBFXHJcbmZ1bmN0aW9uIGluc2VydFJlYWRpbmdUaW1lQW5kV29yZHModGFyZ2V0OiBzdHJpbmcsIHNvdXJjZTogc3RyaW5nKSB7XHJcbiAgY29uc3QgaGVhZGVyUmVnZXggPSAvKF4jXFxzLiskKS9tXHJcbiAgcmV0dXJuIHNvdXJjZS5yZXBsYWNlKGhlYWRlclJlZ2V4LCBgJDFcXG5cXG4ke3RhcmdldH1gKVxyXG59XHJcblxyXG4vLyBcdTUzQkJcdTYzODkgRnJvbnRtYXR0ZXJcclxuZnVuY3Rpb24gY2xlYW5NYXJrZG93bkNvbnRlbnQoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gY29udGVudFxyXG4gICAgLnJlcGxhY2UoL14tLS1bXFxzXFxTXSs/LS0tKFxcbispPy9nLCAnJylcclxuICAgIC50cmltKClcclxuICAgIC5yZXBsYWNlKC9cXG57Myx9L2csICdcXG5cXG4nKVxyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1EsU0FBUyxvQkFBb0I7QUFDclMsU0FBUyxzQkFBc0I7QUFDL0IsU0FBUyx1QkFBdUI7QUFDaEMsU0FBUyxtQkFBbUIsMkJBQTJCOzs7QUNIMFAsU0FBUyxTQUFTLFNBQTBDO0FBRTNXLFNBQU8sUUFBUSxNQUFNLDREQUE0RDtBQUNuRjtBQUVPLFNBQVMsV0FBVyxTQUEwQztBQUVuRSxTQUFPLFFBQVEsTUFBTSxtQkFBbUI7QUFDMUM7QUFFTyxTQUFTLGVBQWUsU0FBeUI7QUFFdEQsU0FBTyxTQUFT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
