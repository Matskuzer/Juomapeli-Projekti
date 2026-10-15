import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {loadEnv} from 'vite';
export default defineConfig(({mode})=>{
  const env=loadEnv(mode,'.','');
  return {
    plugins:[react()],
    base:'./',
    server:{host:'0.0.0.0',proxy:{'/api':env.API_URL||'http://127.0.0.1:3001'}},
  };
});
