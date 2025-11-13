"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { useMerchantData } from "@/hooks/use-merchant"
import { type MerchantAPIKey } from "@/lib/services"
import { ErrorDisplay } from "../status/error"
import { EmptyState } from "../status/empty"
import { MerchantSelector } from "./merchant-selector"
import { MerchantInfo } from "./merchant-info"
import { MerchantData } from "./merchant-data"
import { MerchantDialog } from "./merchant-dialog"

/**
 * 商户页面骨架屏组件
 * 显示加载状态的占位符
 */
function MerchantSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <Skeleton className="h-5 w-20 mb-3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>

          <div>
            <Skeleton className="h-5 w-16 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-80 w-full rounded-lg" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4 sticky top-6">
          <div>
            <Skeleton className="h-5 w-16 mb-3" />
            <div className="bg-muted/50 rounded-lg divide-y">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>

          <div>
            <Skeleton className="h-5 w-16 mb-3" />
            <div className="bg-muted/50 rounded-lg px-3 py-2 space-y-4">
              <div>
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-8 w-full rounded-sm" />
              </div>
              <div>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-8 w-full rounded-sm" />
              </div>
            </div>
          </div>

          <div>
            <Skeleton className="h-5 w-16 mb-3" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded" />
              <Skeleton className="h-7 w-20 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 商户主页面组件
 * 负责组装商户中心的各个子组件
 */
export function MerchantMain() {
  const { apiKeys, loading, error, loadAPIKeys, createAPIKey, updateAPIKey, deleteAPIKey } = useMerchantData()
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null)

  const selectedKey = apiKeys.find(key => key.id === selectedKeyId) || null

  useEffect(() => {
    loadAPIKeys()
  }, [loadAPIKeys])

  useEffect(() => {
    if (apiKeys.length > 0 && !selectedKeyId) {
      setSelectedKeyId(apiKeys[0].id)
    }
  }, [apiKeys, selectedKeyId])

  const handleCreateSuccess = (newKey: MerchantAPIKey) => {
    setSelectedKeyId(newKey.id)
  }

  const handleUpdate = async (updatedKey: MerchantAPIKey) => {
    try {
      await updateAPIKey(updatedKey.id, {
        app_name: updatedKey.app_name,
        app_homepage_url: updatedKey.app_homepage_url,
        app_description: updatedKey.app_description,
        redirect_uri: updatedKey.redirect_uri,
      })

      toast.success('更新成功', {
        description: '应用信息已更新'
      })

    } catch (error) {
      toast.error('更新失败', {
        description: (error as Error).message || '无法更新应用'
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAPIKey(id)
      toast.success('删除成功')

      if (selectedKeyId === id) {
        const remainingKeys = apiKeys.filter(key => key && key.id !== id)
        setSelectedKeyId(remainingKeys.length > 0 ? remainingKeys[0].id : null)
      }
    } catch (error) {
      toast.error('删除失败', {
        description: (error as Error).message || '无法删除应用'
      })
    }
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between border-b border-border pb-2 mb-6">
        <h1 className="text-2xl font-semibold">商户中心</h1>
        <div className="flex items-center gap-3">
          {apiKeys.length > 0 && (
            <MerchantSelector
              apiKeys={apiKeys}
              selectedKeyId={selectedKeyId}
              onSelect={setSelectedKeyId}
            />
          )}
          <MerchantDialog
            mode="create"
            onSuccess={handleCreateSuccess}
            createAPIKey={createAPIKey}
          />
        </div>
      </div>

      {loading ? (
        <MerchantSkeleton />
      ) : error ? (
        <ErrorDisplay
          title="加载失败"
          message={error}
          onRetry={loadAPIKeys}
          retryText="重试"
        />
      ) : apiKeys.length === 0 ? (
          <EmptyState
            title="商户应用列表为空"
            description="请创建您的第一个商户应用，以便开始接入支付功能"
          />
      ) : (
        <div className="space-y-6">
          {selectedKey && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MerchantData apiKey={selectedKey} />
              </div>

              <div className="lg:col-span-1">
                <MerchantInfo apiKey={selectedKey} onUpdate={handleUpdate} onDelete={handleDelete}/>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
