export const configV4 = ({
  id,
  status,
}: {
  id: number;
  status: number;
}) => `import { codecovVitePlugin } from "@codecov/vite-plugin";
import path from "path";
import { defineConfig } from "viteV4";

const vitePath = path.resolve(__dirname, "../../../test-apps/vite");

export default defineConfig({
  clearScreen: false,
  root: vitePath,
  build: {
    outDir: "distV4",
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
