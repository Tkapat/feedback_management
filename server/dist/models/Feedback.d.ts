import { Types } from "mongoose";
export interface IReply {
    admin: Types.ObjectId;
    message: string;
    createdAt: Date;
}
export interface IFeedback {
    student: Types.ObjectId;
    department: Types.ObjectId;
    subject?: Types.ObjectId;
    faculty?: Types.ObjectId;
    category: "teaching" | "classroom" | "laboratory" | "other";
    type: "appreciation" | "complaint" | "suggestion";
    rating?: number;
    tags: string[];
    comment: string;
    isAnonymous: boolean;
    status: "pending" | "in_review" | "resolved" | "rejected";
    priority: boolean;
    replies: IReply[];
    cycle: string;
}
declare const _default: import("mongoose").Model<IFeedback, {}, {}, {}, import("mongoose").Document<unknown, {}, IFeedback, {}, {}> & IFeedback & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Feedback.d.ts.map