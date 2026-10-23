import { ISetting } from "../models/Setting";
export declare const getSettings: () => Promise<import("mongoose").Document<unknown, {}, ISetting, {}, {}> & ISetting & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const isWindowOpen: (s: ISetting) => boolean;
//# sourceMappingURL=settings.d.ts.map