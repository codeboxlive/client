"use server"

import { IProjectTemplate } from "@/models";
import { getUserId } from ".";
import { PROJECT_TEMPLATES } from "@/constants";

export async function getTemplates(): Promise<IProjectTemplate[]> {
    const userId = await getUserId();
    console.log("getTemplates: userId is requesting templates", userId);
    return PROJECT_TEMPLATES;
}
