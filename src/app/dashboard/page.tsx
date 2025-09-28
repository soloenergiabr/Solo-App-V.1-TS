'use client';

import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { useAuthContext } from '@/frontend/auth/contexts/auth-context';
import { useInverters } from '@/frontend/generation/hooks/useInverters';
import { useState } from 'react';

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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Solo Energy Dashboard
                            </h1>
                            <p className="text-gray-600">
                                Bem-vindo, {user?.name}!
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* User Info Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Informações do Usuário
                            </h3>
                            <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Email:</span>
                                    <p className="text-sm text-gray-900">{user?.email}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Roles:</span>
                                    <p className="text-sm text-gray-900">{user?.roles.join(', ')}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Client ID:</span>
                                    <p className="text-sm text-gray-900">{user?.clientId || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Permissões:</span>
                                    <p className="text-sm text-gray-900">{user?.permissions.join(', ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inverters Section */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Seus Inversores
                                </h3>
                                <button
                                    onClick={() => setShowCreateForm(!showCreateForm)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    {showCreateForm ? 'Cancelar' : 'Adicionar Inversor'}
                                </button>
                            </div>

                            {/* Create Form */}
                            {showCreateForm && (
                                <form onSubmit={handleCreateInverter} className="mb-6 p-4 bg-gray-50 rounded-md">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Provider
                                            </label>
                                            <select
                                                value={newInverter.provider}
                                                onChange={(e) => setNewInverter(prev => ({ ...prev, provider: e.target.value }))}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="solis">Solis</option>
                                                <option value="growatt">Growatt</option>
                                                <option value="solplanet">SolPlanet</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Provider ID
                                            </label>
                                            <input
                                                type="text"
                                                value={newInverter.providerId}
                                                onChange={(e) => setNewInverter(prev => ({ ...prev, providerId: e.target.value }))}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                API Key
                                            </label>
                                            <input
                                                type="text"
                                                value={newInverter.providerApiKey}
                                                onChange={(e) => setNewInverter(prev => ({ ...prev, providerApiKey: e.target.value }))}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? 'Criando...' : 'Criar Inversor'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Error Display */}
                            {error && (
                                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            {/* Loading State */}
                            {isLoading && (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            )}

                            {/* Inverters List */}
                            {!isLoading && (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {inverters.length === 0 ? (
                                        <div className="col-span-full text-center py-8 text-gray-500">
                                            Nenhum inversor encontrado. Adicione seu primeiro inversor!
                                        </div>
                                    ) : (
                                        inverters.map((inverter) => (
                                            <div key={inverter.id} className="border border-gray-200 rounded-lg p-4">
                                                <h4 className="font-medium text-gray-900 mb-2">
                                                    {inverter.provider.toUpperCase()}
                                                </h4>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    <span className="font-medium">ID:</span> {inverter.providerId}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-1">
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
            </main>
        </div>
    );
}

export default withAuth(DashboardPage);
