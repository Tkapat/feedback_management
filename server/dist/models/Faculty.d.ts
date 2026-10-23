import { Types } from "mongoose";
export interface IFaculty {
    name: string;
    email?: string;
    designation: string;
    department: Types.ObjectId;
    isActive: boolean;
}
declare const _default: import("mongoose").Model<IFaculty, {}, {}, {}, import("mongoose").Document<unknown, {}, IFaculty, {}, {}> & IFaculty & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Faculty.d.ts.map