import { z } from "zod";

export const tagColors = ["#01161E", "#124559", "#598392", "#AEC3B0", "#EFF6E0"] as const;
export const tagColorsEnum = z.enum(["#01161E", "#124559", "#598392", "#AEC3B0", "#EFF6E0"]);
