import { initListeners } from "./backend/init-listeners";
import { startGenerationSyncScheduler } from "./backend/generation/sync-scheduler";

export function register() {
    console.log('Registering instrumentation');
    initListeners();

    // Scheduler roda só no runtime Node.js do servidor (nunca no edge, build ou testes).
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        startGenerationSyncScheduler();
    }
}