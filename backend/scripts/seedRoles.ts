import Role from "../models/Roles";

export const seedRoles = async () => {
  await Role.deleteMany({});

  await Role.insertMany([
    {
      name: "SUPER_ADMIN",
      permissions: [
        "MANAGE_USERS",
        "CONFIGURE_SYSTEM",
        "VIEW_LOGS",
        "QUERY_AI"
      ]
    },
    {
      name: "ORG_ADMIN",
      permissions: [
        "MANAGE_USERS",
        "VIEW_LOGS",
        "QUERY_AI"
      ]
    },
    {
      name: "DEPT_MANAGER",
      permissions: [
        "VIEW_LOGS",
        "QUERY_AI"
      ]
    },
    {
      name: "IT_ADMIN",
      permissions: [
        "CONFIGURE_SYSTEM",
        "VIEW_LOGS"
      ]
    },
    {
      name: "AUDITOR",
      permissions: [
        "VIEW_LOGS"
      ]
    },
    {
      name: "USER",
      permissions: [
        "QUERY_AI"
      ]
    }
  ]);
};
