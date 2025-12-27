"use client"

import { UsersManager } from "@/components/common/admin/users"
import { ErrorPage } from "@/components/layout/error"
import { LoadingPage } from "@/components/layout/loading"
import { useUser } from "@/contexts/user-context"

/* 用户管理页面 */
export default function UsersPage() {
  const { user, loading } = useUser()

  /* 等待用户信息加载完成 */
  if (loading) {
    return <LoadingPage text="用户管理" badgeText="用户" />
  }

  /* 权限检查：只有管理员才能访问 */
  if (!user?.is_admin) {
    return (
      <ErrorPage
        title="访问被拒绝"
        message="您没有权限访问此页面"
      />
    )
  }

  return <UsersManager />
}
