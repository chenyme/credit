"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import services, { type SystemConfig, type CreateSystemConfigRequest, type UpdateSystemConfigRequest, isCancelError } from "@/lib/services"
import { ErrorDisplay } from "../status/error"
import { EmptyState } from "../status/empty"
import { Pencil, Trash2, Plus } from "lucide-react"


interface ConfigDialogProps {
  mode: 'create' | 'update'
  config?: SystemConfig
  onSuccess: () => void
  trigger?: React.ReactNode
}

/**
 * 系统配置对话框组件
 */
function ConfigDialog({ mode, config, onSuccess, trigger }: ConfigDialogProps) {
  const [open, setOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState<CreateSystemConfigRequest | UpdateSystemConfigRequest>({
    key: '',
    value: '',
    description: '',
  })

  useEffect(() => {
    if (mode === 'update' && config) {
      setFormData({
        value: config.value,
        description: config.description,
      })
    } else if (mode === 'create') {
      setFormData({
        key: '',
        value: '',
        description: '',
      })
    }
  }, [mode, config, open])

  const validateForm = (): { valid: boolean; error?: string } => {
    if (mode === 'create' && !(formData as CreateSystemConfigRequest).key) {
      return { valid: false, error: '请填写配置键' }
    }
    if (!formData.value) {
      return { valid: false, error: '请填写配置值' }
    }
    if (mode === 'create' && (formData as CreateSystemConfigRequest).key.length > 64) {
      return { valid: false, error: '配置键不能超过 64 个字符' }
    }
    if (formData.value.length > 255) {
      return { valid: false, error: '配置值不能超过 255 个字符' }
    }
    if (formData.description && formData.description.length > 255) {
      return { valid: false, error: '配置描述不能超过 255 个字符' }
    }
    return { valid: true }
  }

  const handleSubmit = async () => {
    const validation = validateForm()
    if (!validation.valid) {
      toast.error('表单验证失败', { description: validation.error })
      return
    }

    try {
      setProcessing(true)

      if (mode === 'create') {
        await services.admin.createSystemConfig(formData as CreateSystemConfigRequest)
        toast.success('创建成功', { description: '系统配置已创建' })
      } else if (mode === 'update' && config) {
        await services.admin.updateSystemConfig(config.key, formData as UpdateSystemConfigRequest)
        toast.success('更新成功', { description: '系统配置已更新' })
      }

      setOpen(false)
      onSuccess()
    } catch (error) {
      toast.error(`${mode === 'create' ? '创建' : '更新'}失败`, {
        description: (error as Error).message
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-[#6366f1] hover:bg-[#5558e3] text-white h-8 text-xs">
            {mode === 'create' ? <><Plus className="h-3 w-3 mr-1" /> 创建配置</> : '更新'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '创建系统配置' : '更新系统配置'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? '创建一个新的系统配置项'
              : '修改系统配置的值和描述'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {mode === 'create' && (
            <div className="grid gap-2">
              <Label htmlFor="key">
                配置键 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="key"
                placeholder="app.version"
                maxLength={64}
                value={(formData as CreateSystemConfigRequest).key || ''}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                disabled={processing}
              />
              <p className="text-xs text-muted-foreground">
                最多 64 个字符，用于唯一标识配置项
              </p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="value">
              配置值 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="value"
              placeholder="1.0.0"
              maxLength={255}
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              disabled={processing}
            />
            <p className="text-xs text-muted-foreground">
              最多 255 个字符
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">配置描述</Label>
            <Input
              id="description"
              placeholder="应用版本号"
              maxLength={255}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={processing}
            />
            <p className="text-xs text-muted-foreground">
              最多 255 个字符，可选
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={processing} className="h-7 text-xs">取消</Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={processing}
            className="bg-[#6366f1] hover:bg-[#5558e3] h-7 text-xs"
          >
            {processing ? <><Spinner /> {mode === 'create' ? '创建中' : '更新中'}</> : (mode === 'create' ? '创建' : '更新')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * 系统配置管理组件
 */
export function SystemConfigs() {
  const [configs, setConfigs] = useState<SystemConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadConfigs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await services.admin.listSystemConfigs()
      setConfigs(data)
    } catch (error) {
      if (!isCancelError(error)) {
        setError((error as Error).message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfigs()
  }, [])

  if (loading) {
    return (
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">系统配置</h1>
          <div className="h-8 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">系统配置</h1>
          <ConfigDialog mode="create" onSuccess={loadConfigs} />
        </div>
        <ErrorDisplay
          title="加载失败"
          message={error}
          onRetry={loadConfigs}
          retryText="重试"
        />
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">系统配置</h1>
        <ConfigDialog mode="create" onSuccess={loadConfigs} />
      </div>

      {configs.length === 0 ? (
        <EmptyState
          title="暂无系统配置"
          description="创建第一个系统配置项"
        />
      ) : (
        <div className="space-y-4">
          {configs.map((config) => (
            <div key={config.key} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-base font-mono">{config.key}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {config.description || '暂无描述'}
                  </p>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">配置值</div>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
                      {config.value}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <ConfigDialog
                    mode="update"
                    config={config}
                    onSuccess={loadConfigs}
                    trigger={
                      <Button variant="outline" size="sm" className="h-8">
                        <Pencil className="h-3 w-3 mr-1" />
                        编辑
                      </Button>
                    }
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3 mr-1" />
                        删除
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                          确定要删除配置项 <span className="font-semibold font-mono">{config.key}</span> 吗？此操作无法撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            try {
                              await services.admin.deleteSystemConfig(config.key)
                              toast.success('删除成功')
                              loadConfigs()
                            } catch (error) {
                              toast.error('删除失败', {
                                description: (error as Error).message
                              })
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

