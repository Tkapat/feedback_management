import { Types } from "mongoose";
export interface ISubject {
    name: string;
    code: string;
    semester: number;
    department: Types.ObjectId;
    faculty: Types.ObjectId;
    isActive: boolean;
}
declare const _default: import("mongoose").Model<ISubject, {}, {}, {}, import("mongoose").Document<unknown, {}, ISubject, {}, {}> & ISubject & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Subject.d.ts.map