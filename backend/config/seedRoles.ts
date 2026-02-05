import dotenv from "dotenv";
import Role from "../models/Roles";
import { connectDB } from "./db";

dotenv.config();

const seedRoles = async () => {
  try {
    await connectDB();

    const roles = [
      { name: "ADMIN", description: "System administrator" },
      { name: "USER", description: "Standard user" },
      { name: "AUDITOR", description: "Read-only audit access" }
    ];

    for (const role of roles) {
      const exists = await Role.findOne({ name: role.name });
      if (!exists) {
        await Role.create(role);
        console.log(`✅ Role created: ${role.name}`);
      } else {
        console.log(`ℹ️ Role already exists: ${role.name}`);
      }
    }

    console.log("🎯 Role seeding completed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Role seeding failed", err);
    process.exit(1);
  }
};

seedRoles();
