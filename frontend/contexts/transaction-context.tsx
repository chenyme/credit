"use client"

import * as React from "react"
import { createContext, useContext, useCallback, useState } from "react"
import type { Order, TransactionQueryParams } from "@/lib/services"
import services from "@/lib/services"

/**
 * 交易上下文状态
 */
interface TransactionContextState {
  /** 交易列表 */
  transactions: Order[]
  /** 总记录数 */
  total: number
  /** 当前页码 */
  currentPage: number
  /** 每页数量 */
  pageSize: number
  /** 总页数 */
  totalPages: number
  /** 加载状态 */
  loading: boolean
  /** 错误信息 */
  error: Error | null
  /** 获取交易列表 */
  fetchTransactions: (params: Partial<TransactionQueryParams>) => Promise<void>
  /** 加载更多 */
  loadMore: () => Promise<void>
  /** 刷新当前页 */
  refresh: () => Promise<void>
  /** 重置状态 */
  reset: () => void
}

const TransactionContext = createContext<TransactionContextState | null>(null)

/**
 * 交易 Provider 属性
 */
interface TransactionProviderProps {
  children: React.ReactNode
  /** 默认查询参数 */
  defaultParams?: Partial<TransactionQueryParams>
}

/**
 * 交易 Provider
 * 提供交易数据的全局状态管理
 * 
 * @example
 * ```tsx
 * <TransactionProvider defaultParams={{ type: 'receive', page_size: 20 }}>
 *   <TransactionList />
 * </TransactionProvider>
 * ```
 */
export function TransactionProvider({ children, defaultParams = {} }: TransactionProviderProps) {
  const [transactions, setTransactions] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultParams.page_size || 20)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastParams, setLastParams] = useState<Partial<TransactionQueryParams>>(defaultParams)

  /**
   * 获取交易列表
   */
  const fetchTransactions = useCallback(async (params: Partial<TransactionQueryParams>) => {
    setLoading(true)
    setError(null)
    
    try {
      const queryParams: TransactionQueryParams = {
        page: params.page || 1,
        page_size: params.page_size || pageSize,
        ...params,
      }
      
      const result = await services.transaction.getTransactions(queryParams)
      
      // 如果是第一页，替换数据；否则追加数据
      if (queryParams.page === 1) {
        setTransactions(result.orders)
      } else {
        setTransactions(prev => [...prev, ...result.orders])
      }
      
      setTotal(result.total)
      setCurrentPage(result.page)
      setPageSize(result.page_size)
      setLastParams(params)
    } catch (err) {
      // 忽略请求取消错误
      if (err instanceof Error && err.message === '请求已被取消') {
        return
      }
      setError(err instanceof Error ? err : new Error('获取交易记录失败'))
      console.error('获取交易记录失败:', err)
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  /**
   * 加载更多
   */
  const loadMore = useCallback(async () => {
    if (loading) return
    
    const nextPage = currentPage + 1
    await fetchTransactions({
      ...lastParams,
      page: nextPage,
    })
  }, [currentPage, fetchTransactions, lastParams, loading])

  /**
   * 刷新当前页
   */
  const refresh = useCallback(async () => {
    await fetchTransactions({
      ...lastParams,
      page: 1,
    })
  }, [fetchTransactions, lastParams])

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setTransactions([])
    setTotal(0)
    setCurrentPage(1)
    setPageSize(defaultParams.page_size || 20)
    setError(null)
    setLastParams(defaultParams)
  }, [defaultParams])

  // 计算总页数
  const totalPages = Math.ceil(total / pageSize)

  const value: TransactionContextState = {
    transactions,
    total,
    currentPage,
    pageSize,
    totalPages,
    loading,
    error,
    fetchTransactions,
    loadMore,
    refresh,
    reset,
  }

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  )
}

/**
 * 使用交易上下文
 * 
 * @example
 * ```tsx
 * function TransactionList() {
 *   const { transactions, loading, fetchTransactions } = useTransaction()
 *   
 *   useEffect(() => {
 *     fetchTransactions({ type: 'receive' })
 *   }, [])
 *   
 *   return (
 *     <div>
 *       {transactions.map(t => <div key={t.order_no}>{t.order_name}</div>)}
 *     </div>
 *   )
 * }
 * ```
 */
export function useTransaction() {
  const context = useContext(TransactionContext)
  
  if (!context) {
    throw new Error('useTransaction 必须在 TransactionProvider 内部使用')
  }
  
  return context
}

