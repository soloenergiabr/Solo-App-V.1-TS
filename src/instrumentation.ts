import { initListeners } from "./backend/init-listeners";

export function register() {
    console.log('Registering instrumentation');
    initListeners();
}