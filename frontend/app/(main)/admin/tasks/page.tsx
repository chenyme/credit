"use client"

import { TaskManager } from "@/components/common/admin/tasks"
import { ErrorPage } from "@/components/layout/error"
import { LoadingPage } from "@/components/layout/loading"
import { useUser } from "@/contexts/user-context"

/* 任务管理页面 */
export default function TasksPage() {
  const { user, loading } = useUser()

  /* 等待用户信息加载完成 */
  if (loading) {
    return <LoadingPage text="任务管理" badgeText="任务" />
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

  return <TaskManager />
}
