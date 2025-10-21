import { format } from "date-fns";

interface RoleIndicatorProps {
  role: string;
  roleActivatedAt?: string | Date | null;
}

export default function RoleIndicator({ role, roleActivatedAt }: RoleIndicatorProps) {
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'coach':
        return 'bg-green-500';
      case 'user':
      case 'member':
        return 'bg-purple-500';
      case 'admin':
      case 'super_admin':
        return 'bg-blue-500';
      case 'moderator':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case 'coach':
        return 'Coach';
      case 'user':
        return 'Member';
      case 'admin':
        return 'Admin';
      case 'super_admin':
        return 'Super Admin';
      case 'moderator':
        return 'Moderator';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return null;
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'MMM yyyy');
    } catch {
      return null;
    }
  };

  const formattedDate = formatDate(roleActivatedAt);
  const roleColor = getRoleColor(role);
  const roleLabel = getRoleLabel(role);

  return (
    <>
      {/* Top colored border */}
      <div className={`fixed top-0 left-0 right-0 h-1 ${roleColor} z-50`} />
      
      {/* Role label in top-right */}
      <div className="fixed top-2 right-4 z-40">
        <div className="bg-white dark:bg-gray-800 rounded-full px-4 py-1.5 shadow-md border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {roleLabel}
            {formattedDate && (
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                since {formattedDate}
              </span>
            )}
          </p>
        </div>
      </div>
    </>
  );
}
