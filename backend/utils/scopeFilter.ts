import { AuthRequest } from "../middleware/auth";

interface ScopeOptions {
  ownerField?: string;
  organizationField?: string;
  departmentField?: string;
}

/**
 * Generates a MongoDB filter object based on user scope.
 */
export const applyScopeFilter = (
  req: AuthRequest,
  baseFilter: any = {},
  options: ScopeOptions = {}
) => {
  const {
    ownerField = "ownerId",
    organizationField = "organizationId",
    departmentField = "departmentId"
  } = options;

  const { roleName, userId, organizationId, departmentId } = req.user!;

  let filter = { ...baseFilter };

  switch (roleName) {
    case "SUPER_ADMIN":
      return filter;

    case "ORG_ADMIN":
      filter[organizationField] = organizationId;
      return filter;

    case "DEPT_MANAGER":
      filter[departmentField] = departmentId;
      return filter;

    case "USER":
      filter[ownerField] = userId;
      return filter;

    case "AUDITOR":
      return filter; // read-only but no restriction unless desired

    case "IT_ADMIN":
      return filter; // typically system-wide

    default:
      return { _id: null }; // deny everything
  }
};
