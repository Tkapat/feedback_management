import { Types } from "mongoose";
export interface IUser {
    name: string;
    email: string;
    password: string;
    role: "student" | "admin";
    rollNo?: string;
    department?: Types.ObjectId;
    isActive: boolean;
    comparePassword(plain: string): Promise<boolean>;
}
declare const _default: import("mongoose").Model<IUser, {}, {}, {}, import("mongoose").Document<unknown, {}, IUser, {}, {}> & IUser & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map