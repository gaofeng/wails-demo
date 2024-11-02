package main

import (
	"context"

	"go.bug.st/serial/enumerator"
)

type SerialManager struct {
	ctx context.Context
}

func NewSerialManager() *SerialManager {
	return &SerialManager{}
}

// 获取串口列表并返回详细信息
func (s *SerialManager) GetPortList() ([]*enumerator.PortDetails, error) {
	portList, err := enumerator.GetDetailedPortsList()
	if err != nil {
		return nil, err
	}
	return portList, nil
}
