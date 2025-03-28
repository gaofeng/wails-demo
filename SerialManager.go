package main

import (
	"context"
	"sync"

	"fmt"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"go.bug.st/serial"
	"go.bug.st/serial/enumerator"
)

type SerialManager struct {
	ctx      context.Context
	ports    map[string]serial.Port
	appNames map[string]string
	mu       sync.Mutex
}

func NewSerialManager() *SerialManager {
	return &SerialManager{
		ports:    make(map[string]serial.Port),
		appNames: make(map[string]string),
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
func (s *SerialManager) OpenPort(portName string, baudRate int, app string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	mode := &serial.Mode{BaudRate: baudRate}
	port, err := serial.Open(portName, mode)
	if err != nil {
		portErr, ok := err.(*serial.PortError)
		if ok {
			runtime.LogDebug(s.ctx, "Open port error:"+fmt.Sprint(portErr.Code())+" "+portErr.Error())
			return fmt.Errorf("%d,%s", portErr.Code(), portErr.Error())

		} else {
			return err
		}
	}
	runtime.LogDebug(s.ctx, "Open port:"+portName+" baudRate:"+fmt.Sprint(baudRate)+" app:"+app)

	s.ports[portName] = port
	s.appNames[portName] = app

	go func(portName string, port serial.Port) {
		buffer := make([]byte, 512)
		for {
			n, err := port.Read(buffer)
			if err != nil {
				_, exists := s.ports[portName]
				if exists {
					portErr, ok := err.(*serial.PortError)
					if ok {
						runtime.LogDebug(s.ctx, "Read port error:"+fmt.Sprint(portErr.Code())+" "+portErr.Error())
						runtime.EventsEmit(s.ctx, "serial-error-"+portName, portErr.Code(), err.Error())
					} else {
						runtime.EventsEmit(s.ctx, "serial-error-"+portName, -1, err.Error())
					}
				}
				break
			}
			if n > 0 {
				eventName := "serial-data-" + portName
				runtime.EventsEmit(s.ctx, eventName, buffer[:n])
			}
		}
		s.ClosePort(portName, app)
	}(portName, port)

	return nil
}

func (s *SerialManager) ClosePort(portName string, app string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if port, exists := s.ports[portName]; exists {
		delete(s.ports, portName)
		delete(s.appNames, app)
		err := port.Close()
		if err == nil {
			runtime.LogDebug(s.ctx, "Close port:"+portName)
		}
		return err
	}
	return nil
}

func (s *SerialManager) PortIsOpen(portName string, app string) bool {
	_, exists := s.ports[portName]
	if exists && app != "" && len(app) > 0 {
		existApp, exists2 := s.appNames[portName]
		return exists2 && existApp == app
	}
	return exists
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
