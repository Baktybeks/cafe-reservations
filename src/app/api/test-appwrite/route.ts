import { NextResponse } from "next/server";
import {
  appwriteConfig,
  validateAppwriteConfig,
} from "@/constants/appwriteConfig";
import { Client, Databases, Query } from "appwrite";

export async function GET() {
  try {
    validateAppwriteConfig();

    const client = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);

    const databases = new Databases(client);

    // Пытаемся получить 1 документ из коллекции пользователей
    await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.users,
      [Query.limit(1)]
    );

    return NextResponse.json({
      success: true,
      message: "Appwrite connection successful",
      config: {
        endpoint: appwriteConfig.endpoint,
        projectId: appwriteConfig.projectId,
        databaseId: appwriteConfig.databaseId,
        usersCollection: appwriteConfig.collections.users,
      },
    });
  } catch (error: any) {
    console.error("Appwrite connection test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Connection failed",
        details: error,
      },
      { status: 500 }
    );
  }
}
