"use client"

import { withAuth } from "@/frontend/auth/contexts/auth-context";

export function Clients() {
    return (
        <div>
            <h1>Clients</h1>
        </div>
    );
}


export default withAuth(Clients, ['master']);