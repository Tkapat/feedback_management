export interface ISetting {
    key: string;
    feedbackOpen: boolean;
    startDate?: Date;
    endDate?: Date;
    currentCycle: string;
    tags: string[];
}
declare const _default: import("mongoose").Model<ISetting, {}, {}, {}, import("mongoose").Document<unknown, {}, ISetting, {}, {}> & ISetting & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Setting.d.ts.map