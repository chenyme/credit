import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { typeConfig, statusConfig } from "@/components/common/general/table-filter"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import { ErrorInline } from "@/components/layout/error"
import { EmptyStateWithBorder } from "@/components/layout/empty"
import { LoadingStateWithBorder } from "@/components/layout/loading"
import { ListRestart, Layers, LucideIcon, CircleQuestionMark, Banknote, X } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import type { Order } from "@/lib/services"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TransactionService } from "@/lib/services"
import { toast } from "sonner"
import { useState } from "react"


/**
 * 交易数据表格组件
 * 显示交易记录的表格，可复用于不同页面
 */
export function TransactionDataTable({ transactions }: { transactions: Order[] }) {
  return (
    <div className="border border-dashed shadow-none rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-dashed">
              <TableHead className="whitespace-nowrap w-[120px]">名称</TableHead>
              <TableHead className="whitespace-nowrap text-center min-w-[60px]">金额</TableHead>
              <TableHead className="whitespace-nowrap text-center min-w-[50px]">类型</TableHead>
              <TableHead className="whitespace-nowrap text-center min-w-[50px]">状态</TableHead>
              <TableHead className="whitespace-nowrap text-center min-w-[80px]">资金流</TableHead>
              <TableHead className="whitespace-nowrap text-center min-w-[80px]">商户名</TableHead>
              <TableHead className="whitespace-nowrap text-left min-w-[120px]">订单号</TableHead>
              <TableHead className="whitespace-nowrap text-left min-w-[120px]">商户订单号</TableHead>
              <TableHead className="whitespace-nowrap text-left w-[120px]">创建时间</TableHead>
              <TableHead className="whitespace-nowrap text-left w-[120px]">交易时间</TableHead>
              <TableHead className="whitespace-nowrap text-left w-[120px]">订单过期时间</TableHead>
              <TableHead className="sticky right-0 whitespace-nowrap text-center bg-background shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] w-[150px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="animate-in fade-in duration-200">
            {transactions.map((order) => (
              <TransactionTableRow
                key={order.order_no}
                order={order}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/**
 * 交易表格行组件
 * 展示交易记录的表格行
 */
/**
 * 订单详情弹窗组件
 */
/**
 * 订单详情弹窗组件 - 发票样式
 */
function OrderDetailDialog({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-1 text-xs rounded-full"
            onClick={() => setOpen(true)}
          >
            <Banknote className="size-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>查看详情</p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="max-w-sm p-0 overflow-hidden bg-transparent border-0 shadow-none sm:max-w-[380px]">
          <DialogHeader className="sr-only">
            <DialogTitle>交易详情</DialogTitle>
          </DialogHeader>

          <div className="relative bg-card rounded-lg shadow-xl overflow-hidden">
            <div className="p-6 space-y-6 bg-card border border-border/50 rounded-lg">
              <div className="flex flex-col items-center space-y-2 pb-4 border-b-2 border-dashed border-border/50">
                <h3 className="font-bold text-2xl tracking-wider uppercase">{order.app_name || 'RECEIPT'}</h3>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                  {formatDateTime(order.created_at)}
                </p>
              </div>

              <div className="text-center py-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Amount</p>
                <div className="text-4xl font-black tracking-tighter flex items-start justify-center gap-1">
                  {parseFloat(order.amount).toFixed(2)}
                </div>
              </div>

              <div className="space-y-0 text-sm border-y-2 border-dashed border-border/50 py-4">
                <div className="flex justify-between items-center py-2 border-b border-dashed border-border/30 last:border-0">
                  <span className="text-muted-foreground text-xs uppercase font-medium">订单号</span>
                  <span className="font-mono text-xs font-medium">{order.order_no}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-dashed border-border/30 last:border-0">
                  <span className="text-muted-foreground text-xs uppercase font-medium">类型</span>
                  <span className="text-xs font-medium">{typeConfig[order.type]?.label || order.type}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-dashed border-border/30 last:border-0">
                  <span className="text-muted-foreground text-xs uppercase font-medium">付款方</span>
                  <span className="text-xs font-medium">{order.payer_username}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-dashed border-border/30 last:border-0">
                  <span className="text-muted-foreground text-xs uppercase font-medium">收款方</span>
                  <span className="text-xs font-medium">{order.payee_username}</span>
                </div>
                {(order.status === 'success' || order.status === 'refund') && (
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-border/30 last:border-0">
                    <span className="text-muted-foreground text-xs uppercase font-medium">交易时间</span>
                    <span className="font-mono text-xs">{formatDateTime(order.trade_time)}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col items-center space-y-3">
                <div className="h-8 w-full max-w-[200px] flex items-end justify-between opacity-40">
                  {[...Array(30)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-foreground w-[2px]"
                      style={{ height: `${Math.max(40, Math.random() * 100)}%` }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground font-mono tracking-wider text-center">
                  LINUX DO PAY
                </p>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-2 bg-[radial-gradient(circle,transparent_50%,hsl(var(--card))_50%)] bg-[length:16px_16px] -mb-2" />
          </div>

          <div className="mt-4 flex justify-center">
            <DialogClose asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 text-xs rounded-full border border-border">
                <span className="sr-only">关闭</span>
                <X className="size-3.5 stroke-2" />
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * 争议弹窗组件
 */
function DisputeDialog({ order, onSuccess }: { order: Order; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")

  const resetForm = () => {
    setReason("")
    setDescription("")
  }

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('表单验证失败', {
        description: '请填写争议原因'
      })
      return
    }

    if (reason.length > 100) {
      toast.error('表单验证失败', {
        description: '争议原因不能超过 100 个字符'
      })
      return
    }

    if (description && description.length > 500) {
      toast.error('表单验证失败', {
        description: '详细描述不能超过 500 个字符'
      })
      return
    }

    try {
      setLoading(true)

      await TransactionService.createDispute({
        order_no: order.order_no,
        reason: reason.trim(),
        description: description.trim(),
      })

      toast.success('争议发起成功', {
        description: '我们将尽快处理您的争议申请'
      })

      setOpen(false)
      resetForm()
      onSuccess?.()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '发起争议失败'
      toast.error('发起争议失败', {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-1 text-xs rounded-full text-destructive"
            onClick={() => setOpen(true)}
          >
            <CircleQuestionMark className="size-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>发起争议</p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={open} onOpenChange={(newOpen) => {
        if (!newOpen && !loading) {
          resetForm()
        }
        setOpen(newOpen)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>发起争议</DialogTitle>
            <DialogDescription>
              请填写发起争议的原因和详细描述，我们将尽快处理您的争议申请。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">争议原因 <span className="text-red-500">*</span></Label>
              <Input
                id="reason"
                placeholder="请描述您的争议原因"
                maxLength={100}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">最多 100 个字符，用于说明争议的具体原因</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">详细描述</Label>
              <Textarea
                id="description"
                placeholder="请提供更多争议细节和相关信息（可选）"
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                className="h-24"
              />
              <p className="text-xs text-muted-foreground">最多 500 个字符，提供更多有助于我们理解争议的详细信息，可选</p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={loading} className="h-8 text-xs">取消</Button>
            </DialogClose>
            <Button
              onClick={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
              disabled={loading}
              className="bg-indigo-500 hover:bg-indigo-600 h-8 text-xs"
            >
              {loading ? <><Spinner /> 提交中</> : '提交争议'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * 交易表格行组件
 * 展示交易记录的表格行
 */
function TransactionTableRow({ order }: { order: Order }) {
  /* 格式化金额 */
  const getAmountDisplay = (amount: string) => (
    <span className="text-xs font-semibold">
      {parseFloat(amount).toFixed(2)}
    </span>
  )

  return (
    <TableRow className="h-6 border-b border-dashed">
      <TableCell className="text-[11px] font-medium whitespace-nowrap py-1">
        {order.order_name}
      </TableCell>
      <TableCell className="text-[11px] font-medium whitespace-nowrap text-center py-1">
        {getAmountDisplay(order.amount)}
      </TableCell>
      <TableCell className="text-[11px] font-medium whitespace-nowrap text-center py-1">
        <Badge
          variant="secondary"
          className={`text-[10px] px-1 ${typeConfig[order.type].color}`}
        >
          {typeConfig[order.type].label}
        </Badge>
      </TableCell>
      <TableCell className="text-[11px] font-medium whitespace-nowrap text-center py-1">
        <Badge
          variant="secondary"
          className={`text-[10px] px-1 ${statusConfig[order.status].color}`}
        >
          {statusConfig[order.status].label}
        </Badge>
      </TableCell>
      <TableCell className="text-[11px] font-medium whitespace-nowrap text-center py-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-pointer gap-1 justify-center">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="text-[9px] bg-primary text-primary-foreground">
                    {order.payer_username.substring(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs font-bold">⭢</div>
                <Avatar className="h-4 w-4">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="text-[9px] bg-primary text-primary-foreground">
                    {order.payee_username.substring(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="p-3">
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold">付款方</p>
                  <p className="text-xs">ID: {order.payer_user_id}</p>
                  <p className="text-xs">账户: {order.payer_username}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold">收款方</p>
                  <p className="text-xs">ID: {order.payee_user_id}</p>
                  <p className="text-xs">账户: {order.payee_username}</p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="text-[11px] font-medium text-center py-1">
        {order.app_name || '-'}
      </TableCell>
      <TableCell className="font-mono text-[11px] font-medium text-left py-1">
        {order.order_no}
      </TableCell>
      <TableCell className="font-mono text-[11px] font-medium text-left py-1">
        {order.merchant_order_no || '-'}
      </TableCell>
      <TableCell className="text-[11px] font-medium text-left py-1">
        {formatDateTime(order.created_at)}
      </TableCell>
      <TableCell className="text-[11px] font-medium text-left py-1">
        {(order.status === 'success' || order.status === 'refund') ? formatDateTime(order.trade_time) : '-'}
      </TableCell>
      <TableCell className="text-[11px] font-medium text-left py-1">
        {formatDateTime(order.expires_at)}
      </TableCell>
      <TableCell className="sticky right-0 whitespace-nowrap text-center bg-background shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] py-1">
        <OrderDetailDialog order={order} />
        {order.status === 'success' && (
          <DisputeDialog order={order} />
        )}
      </TableCell>
    </TableRow>
  )
}

interface TransactionTableListProps {
  loading: boolean
  error: Error | null
  transactions: Order[]
  total: number
  currentPage: number
  totalPages: number
  onRetry: () => void
  onLoadMore: () => void
  emptyIcon?: LucideIcon
  emptyDescription?: string
}

/**
 * 交易列表容器组件
 * 统一处理加载、错误、空状态和分页加载
 */
export function TransactionTableList({
  loading,
  error,
  transactions,
  total,
  currentPage,
  totalPages,
  onRetry,
  onLoadMore,
  emptyIcon = Layers,
  emptyDescription = "未发现活动"
}: TransactionTableListProps) {
  if (loading && transactions.length === 0) {
    return (
      <LoadingStateWithBorder
        icon={ListRestart}
      />
    )
  }

  if (error) {
    return (
      <div className="p-8 border-2 border-dashed border-border rounded-lg">
        <ErrorInline
          error={error}
          onRetry={onRetry}
          className="justify-center"
        />
      </div>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <EmptyStateWithBorder
        icon={emptyIcon}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <TransactionDataTable transactions={transactions} />

      {currentPage < totalPages && (
        <Button
          variant="outline"
          onClick={onLoadMore}
          disabled={loading}
          className="w-full text-xs border-dashed shadow-none"
        >
          {loading ? (<><Spinner className="size-4" />正在加载</>) : (`加载更多 (${transactions.length}/${total})`)}
        </Button>
      )}

    </div>
  )
}
