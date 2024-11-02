package main

import (
	"context"
	"sync"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"go.bug.st/serial"
	"go.bug.st/serial/enumerator"
)

type SerialManager struct {
	ctx   context.Context
	ports map[string]serial.Port
	mu    sync.Mutex
}

func NewSerialManager() *SerialManager {
	return &SerialManager{
		ports: make(map[string]serial.Port),
	}
}

// startup is called at application startup, The context is saved
// so we can call the runtime methods
func (s *SerialManager) startup(ctx context.Context) {
	// Perform your setup here
	s.ctx = ctx
}

// 获取串口列表并返回详细信息
func (s *SerialManager) GetPortList() ([]*enumerator.PortDetails, error) {
	portList, err := enumerator.GetDetailedPortsList()
	if err != nil {
		return nil, err
	}
	return portList, nil
}
func (s *SerialManager) OpenPort(portName string, baudRate int) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	mode := &serial.Mode{BaudRate: baudRate}
	port, err := serial.Open(portName, mode)
	if err != nil {
		return err
	}
	runtime.LogDebug(s.ctx, "open port"+portName)
	s.ports[portName] = port

	go func(portName string, port serial.Port) {
		buffer := make([]byte, 100)
		for {
			n, err := port.Read(buffer)
			if err != nil {
				runtime.EventsEmit(s.ctx, "serial-error-"+portName, err.Error())
				break
			}
			if n > 0 {
				runtime.EventsEmit(s.ctx, "serial-data-"+portName, buffer[:n])
			}
		}
	}(portName, port)

	return nil
}

func (s *SerialManager) ClosePort(portName string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if port, exists := s.ports[portName]; exists {
		err := port.Close()
		delete(s.ports, portName)
		return err
	}
	return nil
}

func (s *SerialManager) SendData(portName string, data []byte) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if port, exists := s.ports[portName]; exists {
		_, err := port.Write(data)
		return err
	}
	return nil
}
