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

package model

import (
	"github.com/shopspring/decimal"
	"time"
)

type UserPayConfig struct {
	ID         uint64          `json:"id" gorm:"primaryKey"`
	Level      PayLevel        `json:"level" gorm:"uniqueIndex;not null"`
	MinScore   int64           `json:"min_score" gorm:"not null;index"`
	MaxScore   *int64          `json:"max_score" gorm:"index"`
	DailyLimit *int64          `json:"daily_limit"`
	FeeRate    decimal.Decimal `json:"fee_rate" gorm:"type:numeric(10,2);default:0"`
	CreatedAt  time.Time       `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time       `json:"updated_at" gorm:"autoUpdateTime"`
}
