"use server"

import { IProjectTemplate } from "@/models";
import { PROJECT_TEMPLATES } from "@/constants";

export async function getTemplates(userId: string): Promise<IProjectTemplate[]> {
    console.log("getTemplates: userId is requesting templates", userId);
    return PROJECT_TEMPLATES;
}
