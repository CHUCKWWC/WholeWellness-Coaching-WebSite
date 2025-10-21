// Referenced from javascript_object_storage integration
import { File } from "@google-cloud/storage";

const ACL_POLICY_METADATA_KEY = "custom:aclPolicy";

// SECURITY NOTE: Group-based access is not implemented in this version
// Only owner and visibility-based access control is supported
export enum ObjectPermission {
  READ = "read",
  WRITE = "write",
}

// The ACL policy of the object
export interface ObjectAclPolicy {
  owner: string;
  visibility: "public" | "private";
}

// Sets the ACL policy to the object metadata
export async function setObjectAclPolicy(
  objectFile: File,
  aclPolicy: ObjectAclPolicy,
): Promise<void> {
  const [exists] = await objectFile.exists();
  if (!exists) {
    throw new Error(`Object not found: ${objectFile.name}`);
  }

  await objectFile.setMetadata({
    metadata: {
      [ACL_POLICY_METADATA_KEY]: JSON.stringify(aclPolicy),
    },
  });
}

// Gets the ACL policy from the object metadata
export async function getObjectAclPolicy(
  objectFile: File,
): Promise<ObjectAclPolicy | null> {
  const [metadata] = await objectFile.getMetadata();
  const aclPolicy = metadata?.metadata?.[ACL_POLICY_METADATA_KEY];
  if (!aclPolicy) {
    return null;
  }
  return JSON.parse(aclPolicy as string);
}

// Checks if the user can access the object
export async function canAccessObject({
  userId,
  objectFile,
  requestedPermission,
}: {
  userId?: string;
  objectFile: File;
  requestedPermission: ObjectPermission;
}): Promise<boolean> {
  const aclPolicy = await getObjectAclPolicy(objectFile);
  if (!aclPolicy) {
    return false;
  }

  // Public objects are always accessible for read
  if (
    aclPolicy.visibility === "public" &&
    requestedPermission === ObjectPermission.READ
  ) {
    return true;
  }

  // Access control requires the user id
  if (!userId) {
    return false;
  }

  // The owner of the object can always access it
  if (aclPolicy.owner === userId) {
    return true;
  }

  // Group-based access is not implemented - only owner and visibility
  return false;
}
