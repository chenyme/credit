/*
 * MIT License
 *
 * Copyright (c) 2025 linux.do
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

package order

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/linux-do/pay/internal/apps/oauth"
	"github.com/linux-do/pay/internal/db"
	"github.com/linux-do/pay/internal/model"
	"github.com/linux-do/pay/internal/utils"
)

type TransactionListRequest struct {
	Page      int    `json:"page" form:"page" binding:"omitempty,min=1"`
	PageSize  int    `json:"page_size" form:"page_size" binding:"omitempty,min=1,max=100"`
	Type      string `json:"type" form:"type" binding:"omitempty,oneof=receive payment transfer community"`
	Status    string `json:"status" form:"status" binding:"omitempty,oneof=success pending failed disputing refunded"`
	StartTime string `json:"startTime" form:"startTime" binding:"omitempty"`
	EndTime   string `json:"endTime" form:"endTime" binding:"omitempty"`
}

type TransactionListResponse struct {
	Total int64         `json:"total"`
	Page  int           `json:"page"`
	Size  int           `json:"size"`
	Data  []model.Order `json:"data"`
}

// Transactions godoc
// @Tags order
// @Accept json
// @Produce json
// @Param request body TransactionListRequest false "request body"
// @Success 200 {object} utils.ResponseAny
// @Router /api/v1/transactions [post]
func Transactions(c *gin.Context) {
	var req TransactionListRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Err(err.Error()))
		return
	}

	// 默认值
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 {
		req.PageSize = 20
	}
	if req.PageSize > 100 {
		req.PageSize = 100
	}

	// 获取当前用户
	user, ok := oauth.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, utils.Err("未登录"))
		return
	}

	ctx := c.Request.Context()
	query := db.DB(ctx).Model(&model.Order{})

	// 筛选：当前用户作为付款方或收款方
	query = query.Where("payer_username = ? OR payee_username = ?", user.Username, user.Username)

	// 筛选：交易类型
	if req.Type != "" {
		query = query.Where("type = ?", model.OrderType(req.Type))
	}

	// 筛选：交易状态
	if req.Status != "" {
		// 处理 refunded 状态（对应数据库中的 refund）
		status := req.Status
		if status == "refunded" {
			status = "refund"
		}
		query = query.Where("status = ?", model.OrderStatus(status))
	}

	// 筛选：时间范围
	if req.StartTime != "" {
		startTime, err := time.Parse("2006-01-02 15:04:05", req.StartTime)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.Err("开始时间格式错误，格式应为：YYYY-MM-DD HH:mm:ss"))
			return
		}
		query = query.Where("trade_time >= ?", startTime)
	}

	if req.EndTime != "" {
		endTime, err := time.Parse("2006-01-02 15:04:05", req.EndTime)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.Err("结束时间格式错误，格式应为：YYYY-MM-DD HH:mm:ss"))
			return
		}
		query = query.Where("trade_time <= ?", endTime)
	}

	// 统计总数
	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Err(err.Error()))
		return
	}

	// 分页查询
	var orders []model.Order
	offset := (req.Page - 1) * req.PageSize
	if err := query.Order("trade_time DESC").Offset(offset).Limit(req.PageSize).Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Err(err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.OK(TransactionListResponse{
		Total: total,
		Page:  req.Page,
		Size:  req.PageSize,
		Data:  orders,
	}))
}
