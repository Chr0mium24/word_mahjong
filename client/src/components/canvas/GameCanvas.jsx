import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import throttle from 'lodash.throttle';
import { useSocket } from '../../context/SocketContext';
import useSocketListener from '../../hooks/useSocketListener';
import Tile from './Tile';

// --- 新增：定义公共区域的尺寸和位置 ---
const PUBLIC_ZONE = {
    x: 50,
    y: 50,
    width: window.innerWidth - 100, // 动态计算宽度
    height: 200,
};

const GameCanvas = ({ tiles, playerId }) => {
    const socket = useSocket();
    const [konvaTiles, setKonvaTiles] = useState(tiles);
    const stageRef = useRef(null);

    // --- TODO 1: 动态获取父容器尺寸 ---
    // 1. 创建一个 ref 来引用父容器 div
    const containerRef = useRef(null);
    // 2. 创建一个 state 来存储容器的尺寸
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // 3. 使用 useEffect 来在组件挂载和窗口大小改变时更新尺寸
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };

        // 首次挂载时执行一次
        updateSize();
        // 监听窗口 resize 事件
        window.addEventListener('resize', updateSize);

        // 组件卸载时移除监听器，防止内存泄漏
        return () => window.removeEventListener('resize', updateSize);
    }, []); // 空依赖数组确保此 effect 只在挂载和卸载时运行

    // 当外部 tiles 属性更新时，同步到内部 state
    useEffect(() => {
        setKonvaTiles(tiles);
    }, [tiles]);

    const throttledMove = useRef(
        throttle(({ tileId, position }) => {
            socket.emit('moveTile', { tileId, position });
        }, 1000 / 20) // 优化为每秒最多20次
    ).current;

    useSocketListener('tileMoved', ({ tileId, position }) => {
        setKonvaTiles(currentTiles =>
            currentTiles.map(tile =>
                tile.id === tileId ? { ...tile, pos: position } : tile
            )
        );
    });

    const handleDragMove = useCallback((tileId, newPosition) => {
        throttledMove({ tileId, position: newPosition });
    }, [throttledMove]);

    const handleDragEnd = useCallback((tileId, finalPosition) => {
        throttledMove.cancel(); // 确保最后一个节流调用被取消

        // --- TODO 2: 实现“出牌”逻辑 ---
        // 检查方块的中心点是否在公共区域内
        const tileCenter = {
            x: finalPosition.x + 30, // Tile width is 60, center is 30
            y: finalPosition.y + 40, // Tile height is 80, center is 40
        };

        if (
            tileCenter.x >= PUBLIC_ZONE.x &&
            tileCenter.x <= PUBLIC_ZONE.x + PUBLIC_ZONE.width &&
            tileCenter.y >= PUBLIC_ZONE.y &&
            tileCenter.y <= PUBLIC_ZONE.y + PUBLIC_ZONE.height
        ) {
            // 如果在区域内，则触发“出牌”事件
            console.log(`Tile ${tileId} played in public zone.`);
            socket.emit('playTile', { tileId, position: finalPosition });
        } else {
            // 否则，只发送最终的移动位置
            socket.emit('moveTile', { tileId, position: finalPosition });
        }
    }, [socket, throttledMove]);

    return (
        // 将 ref 附加到父容器 div
        <div ref={containerRef} className="absolute top-0 left-0 w-full h-full bg-gray-700">
            {/* 使用 state 中的尺寸来设置 Stage 大小 */}
            <Stage width={dimensions.width} height={dimensions.height} ref={stageRef}>
                <Layer>
                    {/* 绘制背景、玩家区域边界等 */}
                    <Rect
                        x={PUBLIC_ZONE.x}
                        y={PUBLIC_ZONE.y}
                        width={PUBLIC_ZONE.width}
                        height={PUBLIC_ZONE.height}
                        fill="#2d3748" // 一个深灰色背景
                        stroke="#4a5568"
                        strokeWidth={2}
                        dash={[10, 5]}
                        cornerRadius={10}
                    />
                </Layer>
                <Layer>
                    {konvaTiles.map(tile => (
                        <Tile
                            key={tile.id}
                            tileData={tile}
                            isOwner={tile.owner === playerId}
                            onDragMove={handleDragMove}
                            onDragEnd={handleDragEnd}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
};

export default GameCanvas;