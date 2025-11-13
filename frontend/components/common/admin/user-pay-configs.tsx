"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { toast } from "sonner"
import services, { type UserPayConfig } from "@/lib/services"
import { Trash2 } from "lucide-react"

/**
 * 支付配置详情面板组件
 */
function PayConfigDetailPanel({ config }: { config: UserPayConfig | null }) {
  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!config) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-lg mb-2">请选择配置查看详情</div>
          <div className="text-sm">鼠标悬浮或点击表格行查看详细信息</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sticky top-6">
      <div>
        <h2 className="font-semibold mb-4">配置信息</h2>
        <div className="border border-dashed rounded-lg">
          <div className="px-3 py-2 flex items-center justify-between border-b border-dashed last:border-b-0">
            <label className="text-xs font-medium text-muted-foreground">配置等级</label>
            <p className="text-xs text-muted-foreground truncate text-right max-w-[70%]">Level {config.level}</p>
          </div>

          <div className="px-3 py-2 flex items-center justify-between border-b border-dashed last:border-b-0">
            <label className="text-xs font-medium text-muted-foreground">配置ID</label>
            <p className="text-xs text-muted-foreground truncate text-right max-w-[70%]">{config.id}</p>
          </div>

          <div className="px-3 py-2 flex items-center justify-between border-b border-dashed last:border-b-0">
            <label className="text-xs font-medium text-muted-foreground">最低分数</label>
            <p className="text-xs text-muted-foreground truncate text-right max-w-[70%]">{config.min_score.toLocaleString()}</p>
          </div>

          <div className="px-3 py-2 flex items-center justify-between border-b border-dashed last:border-b-0">
            <label className="text-xs font-medium text-muted-foreground">最高分数</label>
            <p className="text-xs text-muted-foreground truncate text-right max-w-[70%]">
              {config.max_score ? config.max_score.toLocaleString() : '不限制'}
            </p>
          </div>

          <div className="px-3 py-2 flex items-center justify-between border-b border-dashed last:border-b-0">
            <label className="text-xs font-medium text-muted-foreground">手续费率</label>
            <p className="text-xs text-green-600 truncate text-right max-w-[70%]">
              {(parseFloat(config.fee_rate.toString()) * 100).toFixed(2)}%
            </p>
          </div>

          <div className="px-3 py-2 flex items-center justify-between border-b border-dashed last:border-b-0">
            <label className="text-xs font-medium text-muted-foreground">每日提现上限</label>
            <p className="text-xs text-blue-600 truncate text-right max-w-[70%]">
              {config.daily_limit ? `¥${config.daily_limit.toLocaleString()}` : '不限制'}
            </p>
          </div>

          <div className="px-3 py-2 flex items-center justify-between border-b border-dashed last:border-b-0">
            <label className="text-xs font-medium text-muted-foreground">创建时间</label>
            <p className="text-xs text-muted-foreground text-right max-w-[70%]">{formatDate(config.created_at)}</p>
          </div>

          <div className="px-3 py-2 flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">更新时间</label>
            <p className="text-xs text-muted-foreground text-right max-w-[70%]">{formatDate(config.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 支付配置表格组件
 * 显示支付配置记录的表格，可复用于不同页面
 */
export function UserPayConfigsTable({
  configs,
  onDelete,
  onHover,
  onSelect,
  hoveredConfig,
  selectedConfig
}: {
  configs: UserPayConfig[]
  onDelete: (id: number) => void
  onHover: (config: UserPayConfig | null) => void
  onSelect: (config: UserPayConfig) => void
  hoveredConfig: UserPayConfig | null
  selectedConfig: UserPayConfig | null
}) {
  return (
    <div className="border border-dashed shadow-none rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-dashed">
              <TableHead className="whitespace-nowrap w-[80px]">等级</TableHead>
              <TableHead className="whitespace-nowrap text-center min-w-[100px]">下限</TableHead>
              <TableHead className="whitespace-nowrap text-center min-w-[100px]">上限</TableHead>
              <TableHead className="whitespace-nowrap text-center min-w-[100px]">手续费率</TableHead>
              <TableHead className="whitespace-nowrap text-center min-w-[100px]">每日提现上限</TableHead>
              <TableHead className="whitespace-nowrap text-center w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="animate-in fade-in duration-200">
            {configs.map((config) => (
              <PayConfigTableRow
                key={config.id}
                config={config}
                onDelete={onDelete}
                onHover={onHover}
                onSelect={onSelect}
                isHovered={hoveredConfig?.id === config.id}
                isSelected={selectedConfig?.id === config.id}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/**
 * 支付配置表格行组件
 */
function PayConfigTableRow({
  config,
  onDelete,
  onHover,
  onSelect,
  isHovered,
  isSelected
}: {
  config: UserPayConfig
  onDelete: (id: number) => void
  onHover: (config: UserPayConfig | null) => void
  onSelect: (config: UserPayConfig) => void
  isHovered: boolean
  isSelected: boolean
}) {
  return (
    <TableRow
      className={`border-b border-dashed cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 hover:bg-blue-100'
          : isHovered
            ? 'bg-gray-50 hover:bg-gray-100'
            : 'hover:bg-gray-50'
      }`}
      onMouseEnter={() => onHover(config)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(config)}
    >
      <TableCell className="text-xs font-medium whitespace-nowrap py-1">
        Level {config.level}
      </TableCell>
      <TableCell className="text-xs text-center py-1">
        {config.min_score.toLocaleString()}
      </TableCell>
      <TableCell className="text-xs text-center py-1">
        {config.max_score ? config.max_score.toLocaleString() : '不限制'}
      </TableCell>
      <TableCell className="text-xs text-center py-1">
        {(parseFloat(config.fee_rate.toString()) * 100).toFixed(2)}%
      </TableCell>
      <TableCell className="text-xs text-center py-1">
        {config.daily_limit ? `¥${config.daily_limit.toLocaleString()}` : '不限制'}
      </TableCell>
      <TableCell className="text-center py-1">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              删除
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除 Level {config.level} 配置吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(config.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  )
}

/**
 * 用户支付配置管理组件
 */
export function UserPayConfigs() {
  const [configs, setConfigs] = useState<UserPayConfig[]>([])
  const [hoveredConfig, setHoveredConfig] = useState<UserPayConfig | null>(null)
  const [selectedConfig, setSelectedConfig] = useState<UserPayConfig | null>(null)

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
    const data = await services.admin.listUserPayConfigs()
    setConfigs(data)
    } catch (error) {
      if (error && typeof error === 'object' && '__CANCEL__' in error) {
        return
      }
      console.error('加载支付配置失败:', error)
    }
  }

  const handleCreate = async () => {
    try {
      await services.admin.createUserPayConfig({
        level: configs.length,
        min_score: 0,
        max_score: null,
        daily_limit: null,
        fee_rate: '0.00',
      })
      toast.success('创建成功')
      loadConfigs()
    } catch (error) {
      if (error && typeof error === 'object' && '__CANCEL__' in error) {
        return
      }
      toast.error('创建失败', {
        description: error instanceof Error ? error.message : '未知错误'
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await services.admin.deleteUserPayConfig(id)
      toast.success('删除成功')
      loadConfigs()
    } catch (error) {
      if (error && typeof error === 'object' && '__CANCEL__' in error) {
        return
      }
      toast.error('删除失败', {
        description: error instanceof Error ? error.message : '未知错误'
      })
    }
  }

  const handleHover = (config: UserPayConfig | null) => {
    setHoveredConfig(config)
  }

  const handleSelect = (config: UserPayConfig) => {
    setSelectedConfig(config)
    setHoveredConfig(null)
  }

  const displayConfig = selectedConfig || hoveredConfig

  return (
    <div className="py-6">
      <div className="flex items-center justify-between border-b border-border pb-2 mb-6">
        <div className="text-2xl font-semibold">支付配置</div>
        <Button onClick={handleCreate} className="h-8 text-xs">
          创建配置
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="mb-4">
            <div className="font-semibold">配置列表</div>
          </div>
          <UserPayConfigsTable
            configs={configs}
            onDelete={handleDelete}
            onHover={handleHover}
            onSelect={handleSelect}
            hoveredConfig={hoveredConfig}
            selectedConfig={selectedConfig}
          />
        </div>

        <div className="col-span-1">
          <div className="overflow-y-auto">
            <PayConfigDetailPanel config={displayConfig} />
          </div>
        </div>
      </div>
    </div>
  )
}