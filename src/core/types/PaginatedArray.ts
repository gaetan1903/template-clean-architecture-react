export class PaginatedArray<T> {
    constructor(
        public data: T[],
        public totalPages: number,
        public currentPage: number,
        public totalItems: number
    ) {}
}
