import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
    // 1. Definição da raiz do Renderer Process

    root: path.resolve(__dirname, 'src/renderer'),
    // 2. Configurações de build específicas para o Renderer Process
    build: {

        outDir: path.resolve(__dirname, 'renderer'),

        rollupOptions: {
            input: {
               index: path.resolve(__dirname, 'src/renderer/index.html')
            }
        }
    }
});     
