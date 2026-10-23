export interface IDepartment {
    name: string;
    code: string;
    isActive: boolean;
}
declare const _default: import("mongoose").Model<IDepartment, {}, {}, {}, import("mongoose").Document<unknown, {}, IDepartment, {}, {}> & IDepartment & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Department.d.ts.map