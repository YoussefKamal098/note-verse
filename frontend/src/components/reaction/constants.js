import {ThumbsUp, Heart} from "lucide-react";
import {Reactions} from "@/constants/reactionTypes";

const REACTIONS = Object.freeze({
    [Reactions.LIKE]: Object.freeze({Icon: ThumbsUp, colorVar: "var(--color-primary)"}),
    [Reactions.LOVE]: Object.freeze({Icon: Heart, colorVar: "var(--color-danger)"}),
});

export default REACTIONS;
