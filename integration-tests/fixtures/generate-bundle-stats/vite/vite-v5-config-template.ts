export const configV5 = ({
  id,
  status,
}: {
  id: number;
  status: number;
}) => `import { codecovVitePlugin } from "@codecov/vite-plugin";
import path from "path";
import { defineConfig } from "viteV5";

const vitePath = path.resolve(__dirname, "../../../test-apps/vite");

export default defineConfig({
  clearScreen: false,
  root: vitePath,
  build: {
    outDir: "distV5",
    rollupOptions: {
      input: \`\${vitePath}/index.html\`,
      output: {
        format: "esm",
      },
    },
  },
  plugins: [
    codecovVitePlugin({
      enableBundleAnalysis: true,
      bundleName: "vite-test",
      uploadToken: "test-token",
      apiUrl: "http://localhost:8000/test-url/${id}/${status}/false",
    }),
  ],
});`;
