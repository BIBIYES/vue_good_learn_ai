// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///C:/Users/Mouse/Documents/code/project/%E6%97%A7%E7%89%88%E6%9C%AC%E5%A5%BD%E5%8A%A9%E5%AD%A6/vue_good_learn_ai/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/Mouse/Documents/code/project/%E6%97%A7%E7%89%88%E6%9C%AC%E5%A5%BD%E5%8A%A9%E5%AD%A6/vue_good_learn_ai/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import AutoImport from "file:///C:/Users/Mouse/Documents/code/project/%E6%97%A7%E7%89%88%E6%9C%AC%E5%A5%BD%E5%8A%A9%E5%AD%A6/vue_good_learn_ai/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///C:/Users/Mouse/Documents/code/project/%E6%97%A7%E7%89%88%E6%9C%AC%E5%A5%BD%E5%8A%A9%E5%AD%A6/vue_good_learn_ai/node_modules/unplugin-vue-components/dist/vite.js";
import vueDevTools from "file:///C:/Users/Mouse/Documents/code/project/%E6%97%A7%E7%89%88%E6%9C%AC%E5%A5%BD%E5%8A%A9%E5%AD%A6/vue_good_learn_ai/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
import { ElementPlusResolver } from "file:///C:/Users/Mouse/Documents/code/project/%E6%97%A7%E7%89%88%E6%9C%AC%E5%A5%BD%E5%8A%A9%E5%AD%A6/vue_good_learn_ai/node_modules/unplugin-vue-components/dist/resolvers.js";
import tailwindcss from "file:///C:/Users/Mouse/Documents/code/project/%E6%97%A7%E7%89%88%E6%9C%AC%E5%A5%BD%E5%8A%A9%E5%AD%A6/vue_good_learn_ai/node_modules/@tailwindcss/vite/dist/index.mjs";
var __vite_injected_original_import_meta_url = "file:///C:/Users/Mouse/Documents/code/project/%E6%97%A7%E7%89%88%E6%9C%AC%E5%A5%BD%E5%8A%A9%E5%AD%A6/vue_good_learn_ai/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    // 自动导入的插件
    tailwindcss(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ["vue", "vue-router"],
      dts: "src/types/auto-imports.d.ts"
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: "src/types/components.d.ts"
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        // target: 'http://localhost:8080',
        target: "http://localhost:8080",
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNb3VzZVxcXFxEb2N1bWVudHNcXFxcY29kZVxcXFxwcm9qZWN0XFxcXFx1NjVFN1x1NzI0OFx1NjcyQ1x1NTk3RFx1NTJBOVx1NUI2NlxcXFx2dWVfZ29vZF9sZWFybl9haVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcTW91c2VcXFxcRG9jdW1lbnRzXFxcXGNvZGVcXFxccHJvamVjdFxcXFxcdTY1RTdcdTcyNDhcdTY3MkNcdTU5N0RcdTUyQTlcdTVCNjZcXFxcdnVlX2dvb2RfbGVhcm5fYWlcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL01vdXNlL0RvY3VtZW50cy9jb2RlL3Byb2plY3QvJUU2JTk3JUE3JUU3JTg5JTg4JUU2JTlDJUFDJUU1JUE1JUJEJUU1JThBJUE5JUU1JUFEJUE2L3Z1ZV9nb29kX2xlYXJuX2FpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXHJcblxyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcclxuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcclxuaW1wb3J0IHZ1ZURldlRvb2xzIGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZS1kZXZ0b29scydcclxuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycydcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJ1xyXG4vLyBodHRwczovL3ZpdGUuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICB2dWUoKSxcclxuICAgIC8vIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NzY4NFx1NjNEMlx1NEVGNlxyXG4gICAgdGFpbHdpbmRjc3MoKSxcclxuICAgIHZ1ZURldlRvb2xzKCksXHJcbiAgICBBdXRvSW1wb3J0KHtcclxuICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcigpXSxcclxuICAgICAgaW1wb3J0czogWyd2dWUnLCAndnVlLXJvdXRlciddLFxyXG4gICAgICBkdHM6ICdzcmMvdHlwZXMvYXV0by1pbXBvcnRzLmQudHMnLFxyXG4gICAgfSksXHJcbiAgICBDb21wb25lbnRzKHtcclxuICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcigpXSxcclxuICAgICAgZHRzOiAnc3JjL3R5cGVzL2NvbXBvbmVudHMuZC50cycsXHJcbiAgICB9KVxyXG4gICAgXHJcbiAgXSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcclxuICAgIHBvcnQ6IDUxNzMsXHJcbiAgICBwcm94eToge1xyXG4gICAgICAnL2FwaSc6IHtcclxuICAgICAgICAvLyB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjgwODAnLFxyXG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MCcsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXHJcbiAgICB9XHJcbiAgfVxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRhLFNBQVMsZUFBZSxXQUFXO0FBRS9jLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUNoQixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGlCQUFpQjtBQUN4QixTQUFTLDJCQUEyQjtBQUNwQyxPQUFPLGlCQUFpQjtBQVIyTixJQUFNLDJDQUEyQztBQVVwUyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUE7QUFBQSxJQUVKLFlBQVk7QUFBQSxJQUNaLFlBQVk7QUFBQSxJQUNaLFdBQVc7QUFBQSxNQUNULFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQztBQUFBLE1BQ2pDLFNBQVMsQ0FBQyxPQUFPLFlBQVk7QUFBQSxNQUM3QixLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQUEsSUFDRCxXQUFXO0FBQUEsTUFDVCxXQUFXLENBQUMsb0JBQW9CLENBQUM7QUFBQSxNQUNqQyxLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQUEsRUFFSDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBO0FBQUEsUUFFTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
