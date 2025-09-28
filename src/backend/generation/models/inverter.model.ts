export class InverterModel {
    constructor(
        public id: string,
        public name: string,
        public provider: string,
        public providerId: string,
        public providerApiKey?: string,
        public providerApiSecret?: string,
        public providerUrl?: string
    ) { }
}