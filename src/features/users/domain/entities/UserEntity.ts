export class UserEntity {
    constructor(
        public id: string,
        public firstName: string,
        public lastName: string,
        public email: string,
        public phone: string | null,
        public role: string,
        public createdAt: Date,
        public updatedAt: Date
    ) {}

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}
