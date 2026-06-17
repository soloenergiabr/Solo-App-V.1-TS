'use client';

import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { useAuthContext } from '@/frontend/auth/contexts/auth-context';
import { useInverters } from '@/frontend/generation/hooks/useInverters';
import { useState } from 'react';
import { PageHeader, PageLayout, PageEmpty } from '@/components/ui/page-layout';
import { Inbox } from 'lucide-react';

function DashboardPage() {
    const { user, logout } = useAuthContext();
    const { inverters, isLoading, error, createInverter } = useInverters();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newInverter, setNewInverter] = useState({
        provider: 'solis',
        providerId: '',
        providerApiKey: '',
    });

    const handleCreateInverter = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await createInverter(newInverter);

        if (result.success) {
            setShowCreateForm(false);
            setNewInverter({ provider: 'solis', providerId: '', providerApiKey: '' });
        }
    };

    return (
        <PageLayout
            header={
                <PageHeader
                    title="Solo Energy Dashboard"
                    subtitle={`Bem-vindo, ${user?.name}!`}
                    actions={
                        <button
                            onClick={logout}
                            className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                        >
                            Logout
                        </button>
                    }
                />
            }
        >
            <div className="space-y-6">
                {/* User Info Card */}
                <div className="bg-card overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-foreground">
                            Informações do Usuário
                        </h3>
                        <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Email:</span>
                                <p className="text-sm text-foreground">{user?.email}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Roles:</span>
                                <p className="text-sm text-foreground">{user?.roles.join(', ')}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Client ID:</span>
                                <p className="text-sm text-foreground">{user?.clientId || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Permissões:</span>
                                <p className="text-sm text-foreground">{user?.permissions.join(', ')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inverters Section */}
                <div className="bg-card overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg leading-6 font-medium text-foreground">
                                Seus Inversores
                            </h3>
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                            >
                                {showCreateForm ? 'Cancelar' : 'Adicionar Inversor'}
                            </button>
                        </div>

                        {/* Create Form */}
                        {showCreateForm && (
                            <form onSubmit={handleCreateInverter} className="mb-6 p-4 bg-muted rounded-md">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground">
                                            Provider
                                        </label>
                                        <select
                                            value={newInverter.provider}
                                            onChange={(e) => setNewInverter(prev => ({ ...prev, provider: e.target.value }))}
                                            className="mt-1 block w-full border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        >
                                            <option value="solis">Solis</option>
                                            <option value="growatt">Growatt</option>
                                            <option value="solplanet">SolPlanet</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground">
                                            Provider ID
                                        </label>
                                        <input
                                            type="text"
                                            value={newInverter.providerId}
                                            onChange={(e) => setNewInverter(prev => ({ ...prev, providerId: e.target.value }))}
                                            className="mt-1 block w-full border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground">
                                            API Key
                                        </label>
                                        <input
                                            type="text"
                                            value={newInverter.providerApiKey}
                                            onChange={(e) => setNewInverter(prev => ({ ...prev, providerApiKey: e.target.value }))}
                                            className="mt-1 block w-full border-border rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-success text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {isLoading ? 'Criando...' : 'Criar Inversor'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="mb-4 bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}

                        {/* Inverters List */}
                        {!isLoading && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {inverters.length === 0 ? (
                                    <div className="col-span-full">
                                        <PageEmpty
                                            icon={<Inbox className="h-8 w-8 text-muted-foreground" />}
                                            title="Nada por aqui ainda"
                                            description="Nenhum inversor encontrado. Adicione seu primeiro inversor!"
                                        />
                                    </div>
                                ) : (
                                    inverters.map((inverter) => (
                                        <div key={inverter.id} className="border border-border rounded-lg p-4">
                                            <h4 className="font-medium text-foreground mb-2">
                                                {inverter.provider.toUpperCase()}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                <span className="font-medium">ID:</span> {inverter.providerId}
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                <span className="font-medium">Criado:</span>{' '}
                                                {new Date(inverter.createdAt).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}

export default withAuth(DashboardPage);
