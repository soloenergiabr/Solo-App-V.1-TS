export async function register() {
    console.log('Registering instrumentation');

    // Node-only startup code must stay behind dynamic imports so Edge
    // instrumentation does not bundle Prisma, object storage, or crypto code.
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const [{ initListeners }, { startGenerationSyncScheduler }] = await Promise.all([
            import("./backend/init-listeners"),
            import("./backend/generation/sync-scheduler"),
        ]);

        initListeners();
        startGenerationSyncScheduler();
    }
}
