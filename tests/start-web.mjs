import { spawn } from 'node:child_process';
const env = {...process.env, NEXT_PUBLIC_FIREBASE_API_KEY:'demo-key', NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:'demo-nutricare.firebaseapp.com',NEXT_PUBLIC_FIREBASE_PROJECT_ID:'demo-nutricare',NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:'demo-nutricare.appspot.com',NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:'123',NEXT_PUBLIC_FIREBASE_APP_ID:'1:123:web:test',NEXT_PUBLIC_USE_FIREBASE_EMULATORS:'true',NUTRICARE_BUILD_DIR:'.next-test',NEXT_TELEMETRY_DISABLED:'1'};
const child = spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--port','3001'],{env,stdio:'inherit'});
child.on('exit',code=>process.exit(code??1));
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>child.kill(signal));
