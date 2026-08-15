import { AcceptInviteScreen } from '@/frontend/gd/accept-invite-screen'

export default async function AcceptInvitePage({
    params,
}: {
    params: Promise<{ token: string }>
}) {
    const { token } = await params

    return <AcceptInviteScreen token={token} />
}
