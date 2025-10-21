import { useAuth } from "@/hooks/useAuth";
import RoleIndicator from "@/components/RoleIndicator";

interface MemberLayoutProps {
  children: React.ReactNode;
}

export default function MemberLayout({ children }: MemberLayoutProps) {
  const { user } = useAuth();

  return (
    <>
      {user && <RoleIndicator role={user.role || 'user'} roleActivatedAt={user.roleActivatedAt} />}
      {children}
    </>
  );
}
